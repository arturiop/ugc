import { useEffect, useMemo, useRef, useState } from "react";
import type { Storyboard } from "@/api/storyboard";
import { useProject } from "@/contexts/Project/ProjectContext";
import { useUpdateProjectStoryboard } from "@/api/storyboard/hooks";
import { useDeleteProjectAsset, useProjectAssets, useUpdateProjectAssetLabel } from "@/api/assets/hooks";
import type { AssetItem, AssetLabel } from "@/api/assets";
import { buildUrl, getDefaultHeaders } from "@/api/httpClient";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import {
    Box,
    Button,
    ButtonBase,
    Card,
    CardContent,
    Chip,
    Collapse,
    FormControl,
    IconButton,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { FileText, Users, Clock, Sparkles, Upload, Image as ImageIcon, Monitor, X, Tag, ChevronDown, Plus, UserRound } from "lucide-react";

type BriefModeProps = {
    storyboard: Storyboard | null;
};

const toneOptions = ["Energetic", "Calm", "Bold", "Playful", "Cinematic", "Editorial", "Minimal", "Raw"];
const audienceOptions = ["Gen Z (18-24)", "Millennials (25-34)", "Young Pro (25-40)", "Broad (18-55)", "Premium (30-50)"];
const durationOptions = ["16s", "24s", "32s"];

const formatOptions: Array<{ value: Storyboard["aspect_ratio"]; label: string }> = [
    { value: "16:9", label: "16:9" },
    { value: "9:16", label: "9:16" },
];

const modelOptions = [{ value: "veo-3.1", label: "Veo 3.1", desc: "Google - cinematic motion" }];

const platformOptions = [
    { value: "tiktok", label: "TikTok" },
    { value: "instagram", label: "Instagram" },
    { value: "generic", label: "Generic" },
];

const avatarLibrary = [
    { id: "sofia", name: "Sofia", vibe: "Professional", gradient: "linear-gradient(135deg, #F7C7A5 0%, #E58B7A 100%)" },
    { id: "james", name: "James", vibe: "Casual", gradient: "linear-gradient(135deg, #C6D6FF 0%, #7C8CFF 100%)" },
    { id: "claire", name: "Claire", vibe: "Corporate", gradient: "linear-gradient(135deg, #FFE2B4 0%, #FFB08A 100%)" },
    { id: "kevin", name: "Kevin", vibe: "Friendly", gradient: "linear-gradient(135deg, #C5F2D0 0%, #6ED19A 100%)" },
    { id: "maya", name: "Maya", vibe: "Warm", gradient: "linear-gradient(135deg, #FFD0DC 0%, #FF8DB3 100%)" },
    { id: "noah", name: "Noah", vibe: "Creator", gradient: "linear-gradient(135deg, #D6D3FF 0%, #8A83FF 100%)" },
];

const assetLabels: Array<{ value: AssetLabel; label: string }> = [
    { value: "product", label: "Product" },
    { value: "logo", label: "Logo" },
    { value: "brandbook", label: "Brandbook" },
    { value: "reference", label: "Reference" },
];

const BriefMode = ({ storyboard }: BriefModeProps) => {
    const { projectId } = useProject();
    const updateStoryboard = useUpdateProjectStoryboard(projectId);
    const { data: assetData } = useProjectAssets(projectId);
    const updateLabel = useUpdateProjectAssetLabel(projectId);
    const deleteAsset = useDeleteProjectAsset(projectId);
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formState, setFormState] = useState({
        audience: "",
        tone: "",
        platform: "generic",
        aspect_ratio: "9:16",
    });
    const [duration, setDuration] = useState(durationOptions[1]);
    const [model] = useState(modelOptions[0].value);
    const [uploadLabel, setUploadLabel] = useState<AssetLabel>("product");
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [referenceInput, setReferenceInput] = useState("");
    const [references, setReferences] = useState<string[]>([]);
    const [avatarPanelOpen, setAvatarPanelOpen] = useState(false);
    const [avatarTab, setAvatarTab] = useState<"library" | "my">("library");
    const [activeAvatarId, setActiveAvatarId] = useState<string | null>(avatarLibrary[0]?.id ?? null);

    useEffect(() => {
        if (!storyboard) return;
        setFormState({
            audience: storyboard.audience || "",
            tone: storyboard.tone || "",
            platform: storyboard.platform || "generic",
            aspect_ratio: storyboard.aspect_ratio || "9:16",
        });
    }, [storyboard]);

    const selectedTones = useMemo(
        () =>
            formState.tone
                .split(",")
                .map((val) => val.trim())
                .filter(Boolean),
        [formState.tone]
    );

    const assets = Array.isArray(assetData?.items) ? assetData.items : [];
    const hasStoryboard = Boolean(storyboard);

    const updateField = (key: "audience" | "tone" | "platform" | "aspect_ratio", value: string) => {
        setFormState((prev) => ({ ...prev, [key]: value }));
        if (hasStoryboard) {
            updateStoryboard.mutate({ [key]: value });
        }
    };

    const toggleTone = (val: string) => {
        const next = selectedTones.includes(val) ? selectedTones.filter((tone) => tone !== val) : [...selectedTones, val];
        updateField("tone", next.join(", "));
    };

    const uploadFiles = async (files: File[]) => {
        if (!projectId || files.length === 0) return;

        setUploading(true);
        setUploadError(null);

        try {
            for (const file of files) {
                if (!file.type.startsWith("image/")) {
                    throw new Error("Only image uploads are supported.");
                }

                const form = new FormData();
                form.append("file", file);
                form.append("label", uploadLabel);

                const response = await fetch(buildUrl(`/api/v1/projects/${projectId}/assets/upload`), {
                    method: "POST",
                    headers: getDefaultHeaders(),
                    body: form,
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || "Failed to upload asset.");
                }
            }

            queryClient.invalidateQueries({ queryKey: queryKeys.projects.assets(projectId) });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to upload asset.";
            setUploadError(message);
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        await uploadFiles(files);
        event.target.value = "";
    };

    const handleDeleteAsset = (asset: AssetItem) => {
        const confirmed = window.confirm(`Delete "${asset.filename}" from this project?`);
        if (!confirmed) return;
        deleteAsset.mutate({ assetId: asset.id });
    };

    const handleAddReference = () => {
        const value = referenceInput.trim();
        if (!value) return;
        setReferences((prev) => [value, ...prev]);
        setReferenceInput("");
    };

    return (
        <Box sx={{ flex: 1, minHeight: 0, height: "100%", overflowY: "auto" }}>
            <Box sx={{ maxWidth: 860, mx: "auto", px: 4, py: 5, display: "flex", flexDirection: "column", gap: 5 }}>
                <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <FieldLabel icon={FileText} label="Creative Brief" />
                    <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                        <CardContent>
                            <TextField
                                value={storyboard?.concept || ""}
                                placeholder="Creative brief will be generated from chat and assets."
                                multiline
                                minRows={5}
                                maxRows={12}
                                fullWidth
                                InputProps={{ readOnly: true }}
                                variant="standard"
                                sx={{
                                    "& .MuiInputBase-root": { fontSize: 15, lineHeight: 1.6 },
                                    "& .MuiInput-underline:before": { borderBottom: "none" },
                                    "& .MuiInput-underline:after": { borderBottom: "none" },
                                }}
                            />
                            <Typography variant="caption" color="text.secondary">
                                {hasStoryboard
                                    ? "Generated from chat. Refine the brief in conversation to update this text."
                                    : "Start in chat and add brand assets to unlock the brief."}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 3,
                            border: "1px dashed",
                            borderColor: "divider",
                            bgcolor: "background.neutral",
                        }}
                        onDragOver={(event) => {
                            event.preventDefault();
                        }}
                        onDrop={(event) => {
                            event.preventDefault();
                            void uploadFiles(Array.from(event.dataTransfer.files ?? []));
                        }}
                    >
                        <CardContent sx={{ py: 2 }}>
                            <Stack spacing={2}>
                                <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
                                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1 }}>
                                        <Box
                                            sx={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: 2,
                                                border: "1px solid",
                                                borderColor: "divider",
                                                bgcolor: "background.paper",
                                                overflow: "hidden",
                                                display: "grid",
                                                placeItems: "center",
                                            }}
                                        >
                                            <Upload size={16} />
                                        </Box>
                                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                                            Drop files to upload
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={1} alignItems={{ xs: "stretch", md: "flex-end" }}>
                                        <FormControl size="small" sx={{ minWidth: 180 }}>
                                            <Select
                                                value={uploadLabel}
                                                onChange={(event) => setUploadLabel(event.target.value as AssetLabel)}
                                                renderValue={(value) => {
                                                    const Icon = getAssetLabelIcon(value as AssetLabel);
                                                    const label = assetLabels.find((item) => item.value === value)?.label ?? value;
                                                    return (
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <Box
                                                                sx={{
                                                                    width: 18,
                                                                    height: 18,
                                                                    borderRadius: 1,
                                                                    bgcolor: "action.hover",
                                                                    display: "grid",
                                                                    placeItems: "center",
                                                                }}
                                                            >
                                                                <Icon size={12} />
                                                            </Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                {label}
                                                            </Typography>
                                                        </Stack>
                                                    );
                                                }}
                                            >
                                                {assetLabels.map((option) => {
                                                    const Icon = getAssetLabelIcon(option.value);
                                                    return (
                                                        <MenuItem key={option.value} value={option.value}>
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <Box
                                                                    sx={{
                                                                        width: 18,
                                                                        height: 18,
                                                                        borderRadius: 1,
                                                                        bgcolor: "action.hover",
                                                                        display: "grid",
                                                                        placeItems: "center",
                                                                    }}
                                                                >
                                                                    <Icon size={12} />
                                                                </Box>
                                                                <Typography variant="body2">{option.label}</Typography>
                                                            </Stack>
                                                        </MenuItem>
                                                    );
                                                })}
                                            </Select>
                                        </FormControl>
                                        <Button variant="contained" size="small" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                                            {uploading ? "Uploading..." : "Upload assets"}
                                        </Button>
                                    </Stack>
                                </Stack>
                                {assets.length > 0 && (
                                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                        {assets.slice(0, 4).map((asset) => {
                                            const isImage = asset.contentType?.startsWith("image/");
                                            return (
                                                <Box
                                                    key={asset.id}
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        flexDirection: "column",
                                                        gap: 0.5,
                                                        border: "1px solid",
                                                        borderColor: "divider",
                                                        borderRadius: 1.5,
                                                        px: 0.75,
                                                        py: 0.5,
                                                        bgcolor: "background.paper",
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 100,
                                                            height: 100,
                                                            borderRadius: 1,
                                                            bgcolor: "background.neutral",
                                                            overflow: "hidden",
                                                            display: "grid",
                                                            placeItems: "center",
                                                        }}
                                                    >
                                                        {isImage ? (
                                                            <Box
                                                                component="img"
                                                                src={asset.url}
                                                                alt={asset.filename}
                                                                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                            />
                                                        ) : (
                                                            <ImageIcon size={12} />
                                                        )}
                                                    </Box>
                                                    <Typography variant="caption" fontWeight={600} noWrap sx={{ maxWidth: 120 }}>
                                                        {asset.filename}
                                                    </Typography>
                                                    <IconButton size="small" onClick={() => handleDeleteAsset(asset)}>
                                                        <X size={12} />
                                                    </IconButton>
                                                </Box>
                                            );
                                        })}
                                        {assets.length > 4 && (
                                            <Typography variant="caption" color="text.secondary">
                                                +{assets.length - 4} more
                                            </Typography>
                                        )}
                                    </Stack>
                                )}
                                {uploadError && (
                                    <Typography variant="caption" color="error">
                                        {uploadError}
                                    </Typography>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Box>

                <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                        <CardContent sx={{ p: 2, "&:last-child": { p: 2 } }}>
                            <Stack spacing={1}>
                                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
                                    <TextField
                                        value={referenceInput}
                                        onChange={(event) => setReferenceInput(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                                event.preventDefault();
                                                handleAddReference();
                                            }
                                        }}
                                        placeholder="Paste a URL or type a reference (ex: Nike ad 2024)"
                                        size="small"
                                        fullWidth
                                    />
                                    <Button variant="contained" size="small" onClick={handleAddReference} sx={{ height: 36, minWidth: 140 }}>
                                        Add reference
                                    </Button>
                                </Stack>
                                {references.length > 0 && (
                                    <Stack spacing={1.5}>
                                        {references.map((item, index) => (
                                            <Card key={`${item}-${index}`} elevation={0} sx={{ borderRadius: 2.5, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                                                <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5 }}>
                                                    <Typography variant="body2" sx={{ mr: 2 }} noWrap>
                                                        {item}
                                                    </Typography>
                                                    <IconButton size="small" onClick={() => setReferences((prev) => prev.filter((_, refIndex) => refIndex !== index))}>
                                                        <X size={16} />
                                                    </IconButton>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Stack>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Box>

                <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                    <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                        <CardContent sx={{ p: 2, "&:last-child": { p: 2 } }}>
                            <Stack spacing={1}>
                                <ButtonBase
                                    onClick={() => setAvatarPanelOpen((prev) => !prev)}
                                    sx={{ textAlign: "left", width: "100%", borderRadius: 2 }}
                                >
                                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: "100%" }}>
                                        <Box
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: 2,
                                                display: "grid",
                                                placeItems: "center",
                                                bgcolor: "background.neutral",
                                                color: "secondary.main",
                                            }}
                                        >
                                            <UserRound size={18} />
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="subtitle1" fontWeight={700}>
                                                    AI Actors
                                                </Typography>
                                            </Stack>
                                            <Typography variant="body2" color="text.secondary">
                                                Optional. Add a narrator or actor to showcase the product.
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: 2,
                                                display: "grid",
                                                placeItems: "center",
                                                border: "1px solid",
                                                borderColor: "divider",
                                                color: "text.secondary",
                                                transform: avatarPanelOpen ? "rotate(180deg)" : "rotate(0deg)",
                                                transition: "transform 0.2s ease",
                                            }}
                                        >
                                            <ChevronDown size={16} />
                                        </Box>
                                    </Stack>
                                </ButtonBase>
                                <Collapse in={avatarPanelOpen} timeout={300} unmountOnExit>
                                    <Stack spacing={1.25}>
                                        <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ md: "center" }}>
                                            <Stack direction="row" spacing={0.5} sx={{ bgcolor: "background.neutral", p: 0.5, borderRadius: 2 }}>
                                                <Button
                                                    size="small"
                                                    variant={avatarTab === "library" ? "contained" : "text"}
                                                    onClick={() => setAvatarTab("library")}
                                                    sx={{ borderRadius: 1.5, textTransform: "none", minWidth: 86, height: 30 }}
                                                >
                                                    Library
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant={avatarTab === "my" ? "contained" : "text"}
                                                    onClick={() => setAvatarTab("my")}
                                                    sx={{ borderRadius: 1.5, textTransform: "none", minWidth: 86, height: 30 }}
                                                >
                                                    My Avatars
                                                </Button>
                                            </Stack>
                                            <Typography variant="body2" color="text.secondary">
                                                Choose a built-in actor or create your own from photo or text.
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ overflowX: "auto", pb: 0.5 }}>
                                            <ButtonBase
                                                sx={{
                                                    minWidth: 72,
                                                    width: 72,
                                                    height: 72,
                                                    borderRadius: "50%",
                                                    border: "1px dashed",
                                                    borderColor: "divider",
                                                    bgcolor: "background.neutral",
                                                    display: "grid",
                                                    placeItems: "center",
                                                }}
                                            >
                                                <Plus size={18} />
                                            </ButtonBase>
                                            {(avatarTab === "library" ? avatarLibrary : []).map((avatar) => (
                                                <ButtonBase
                                                    key={avatar.id}
                                                    onClick={() => setActiveAvatarId(avatar.id)}
                                                    sx={{
                                                        minWidth: 72,
                                                        width: 72,
                                                        height: 72,
                                                        borderRadius: "50%",
                                                        border: "2px solid",
                                                        borderColor: activeAvatarId === avatar.id ? "secondary.main" : "divider",
                                                        boxShadow: activeAvatarId === avatar.id ? "0 6px 18px rgba(91,97,255,0.25)" : "none",
                                                        background: avatar.gradient,
                                                        display: "grid",
                                                        placeItems: "center",
                                                        color: "common.white",
                                                    }}
                                                >
                                                    <Typography variant="subtitle1" fontWeight={700}>
                                                        {avatar.name.split(" ").map((part) => part[0]).join("")}
                                                    </Typography>
                                                </ButtonBase>
                                            ))}
                                        </Stack>
                                        <Card
                                            elevation={0}
                                            sx={{
                                                borderRadius: 3,
                                                border: "1px solid",
                                                borderColor: "divider",
                                                bgcolor: "background.neutral",
                                            }}
                                        >
                                            <CardContent sx={{ p: 1.5 }}>
                                                <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
                                                    <Box
                                                        sx={{
                                                            width: { xs: "100%", md: 180 },
                                                            height: { xs: 160, md: 180 },
                                                            borderRadius: 2.5,
                                                            background: (avatarTab === "library"
                                                                ? avatarLibrary.find((item) => item.id === activeAvatarId)?.gradient
                                                                : "linear-gradient(135deg, #E4E7F8 0%, #C6CCF5 100%)") ?? "linear-gradient(135deg, #E4E7F8 0%, #C6CCF5 100%)",
                                                            display: "grid",
                                                            placeItems: "center",
                                                        }}
                                                    >
                                                        <Typography variant="h4" color="common.white" fontWeight={700}>
                                                            {(avatarTab === "library"
                                                                ? avatarLibrary.find((item) => item.id === activeAvatarId)?.name
                                                                : "New Avatar")?.slice(0, 2) ?? "AV"}
                                                        </Typography>
                                                    </Box>
                                                    <Stack spacing={0.5} sx={{ flex: 1 }}>
                                                        <Typography variant="subtitle1" fontWeight={700}>
                                                            {avatarTab === "library"
                                                                ? avatarLibrary.find((item) => item.id === activeAvatarId)?.name ?? "Select an avatar"
                                                                : "Create your avatar"}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {avatarTab === "library"
                                                                ? avatarLibrary.find((item) => item.id === activeAvatarId)?.vibe ?? "Pick a style that matches your brand."
                                                                : "Generate from a photo or a text prompt."}
                                                        </Typography>
                                                        <Stack direction="row" spacing={1}>
                                                            <Button size="small" variant="contained">
                                                                Use actor
                                                            </Button>
                                                            <Button size="small" variant="text">
                                                                Preview
                                                            </Button>
                                                        </Stack>
                                                    </Stack>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                        {avatarTab === "my" && (
                                            <Box
                                                sx={{
                                                    borderRadius: 2.5,
                                                    border: "1px solid",
                                                    borderColor: "divider",
                                                    bgcolor: "background.neutral",
                                                    p: 1.5,
                                                }}
                                            >
                                                <Typography variant="body2" color="text.secondary">
                                                    No custom avatars yet. Create one to reuse in future projects.
                                                </Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                </Collapse>
                            </Stack>
                        </CardContent>
                    </Card>
                </Box>

                <Box component="section" sx={{ display: "grid", gap: 3, gridTemplateColumns: { md: "repeat(2, minmax(0, 1fr))" } }}>
                    <Box>
                        <FieldLabel icon={Sparkles} label="Tone & Mood" />
                        <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {toneOptions.map((opt) => (
                                <Chip
                                    key={opt}
                                    label={opt}
                                    color={selectedTones.includes(opt) ? "secondary" : "default"}
                                    variant={selectedTones.includes(opt) ? "filled" : "outlined"}
                                    onClick={() => toggleTone(opt)}
                                />
                            ))}
                        </Box>
                    </Box>
                    <Box>
                        <FieldLabel icon={Users} label="Target Audience" />
                        <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {audienceOptions.map((opt) => (
                                <Chip
                                    key={opt}
                                    label={opt}
                                    color={formState.audience === opt ? "secondary" : "default"}
                                    variant={formState.audience === opt ? "filled" : "outlined"}
                                    onClick={() => updateField("audience", opt)}
                                />
                            ))}
                        </Box>
                    </Box>
                </Box>

                <Stack direction={{ xs: "column", lg: "row" }} spacing={4} alignItems={{ lg: "flex-start" }}>
                    <Box sx={{ minWidth: 220 }}>
                        <FieldLabel icon={Clock} label="Duration" />
                        <Stack direction="row" spacing={1.5} sx={{ mt: 2, flexWrap: "wrap" }}>
                            {durationOptions.map((option) => (
                                <Button
                                    key={option}
                                    size="small"
                                    variant="outlined"
                                    onClick={() => setDuration(option)}
                                    sx={{
                                        bgcolor: duration === option ? "secondary.lighter" : "transparent",
                                        borderColor: duration === option ? "secondary.main" : "divider",
                                        color: duration === option ? "secondary.main" : "text.secondary",
                                        borderRadius: 2,
                                        minWidth: 64,
                                        height: 40,
                                        "&:hover": {
                                            bgcolor: duration === option ? "secondary.lighter" : "action.hover",
                                            borderColor: duration === option ? "secondary.main" : "divider",
                                        },
                                    }}>
                                    {option}
                                </Button>
                            ))}
                        </Stack>
                    </Box>
                    <Box sx={{ minWidth: 180 }}>
                        <FieldLabel icon={Monitor} label="Video Format" />
                        <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2, minHeight: 44 }}>
                            {formatOptions.map((fmt) => (
                                <ButtonBase
                                    key={fmt.value}
                                    onClick={() => updateField("aspect_ratio", fmt.value)}
                                    sx={{ borderRadius: 2, p: 0.5 }}
                                >
                                    <FormatPreview format={fmt.value} active={formState.aspect_ratio === fmt.value} />
                                </ButtonBase>
                            ))}
                        </Box>
                    </Box>
                    <Box sx={{ minWidth: 140, flex: 1 }}>
                        <FieldLabel icon={Tag} label="Platform" />
                        <FormControl size="small" sx={{ mt: 2, width: "100%" }}>
                            <Select value={formState.platform} onChange={(event) => updateField("platform", event.target.value)}>
                                {platformOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <Box sx={{ minWidth: 140 }}>
                        <FieldLabel icon={Sparkles} label="AI Model" />
                        <FormControl size="small" sx={{ mt: 2, width: "100%" }}>
                            <Select value={model}>
                                {modelOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </Stack>
            </Box>
        </Box>
    );
};

function FieldLabel({ icon: Icon, label }: { icon: typeof FileText; label: string }) {
    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 18, height: 18, display: "grid", placeItems: "center" }}>
                <Icon size={16} />
            </Box>
            <Typography variant="caption" sx={{ letterSpacing: 1.2, fontWeight: 700, color: "text.secondary" }}>
                {label}
            </Typography>
        </Stack>
    );
}

function getAssetLabelIcon(label: AssetLabel) {
    switch (label) {
        case "logo":
            return Tag;
        case "brandbook":
            return FileText;
        case "reference":
            return ImageIcon;
        case "product":
        default:
            return ImageIcon;
    }
}

function FormatPreview({ format, active }: { format: Storyboard["aspect_ratio"]; active: boolean }) {
    const dims: Record<string, { w: number; h: number }> = {
        "16:9": { w: 44, h: 26 },
        "9:16": { w: 26, h: 44 },
    };
    const d = dims[format] ?? dims["9:16"];
    return (
        <Box
            sx={{
                width: d.w,
                height: d.h,
                display: "grid",
                placeItems: "center",
                border: "2px solid",
                borderColor: active ? "secondary.main" : "divider",
                color: active ? "secondary.main" : "text.secondary",
                bgcolor: active ? "secondary.lighter" : "transparent",
                fontSize: 9,
                fontWeight: 700,
            }}>
            {format === "9:16" ? "9*16" : "16:9"}
        </Box>
    );
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default BriefMode;
