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
    FormControl,
    IconButton,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { FileText, Users, Clock, Sparkles, Upload, Image as ImageIcon, Monitor, X, Tag, Link as LinkIcon } from "lucide-react";

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
                        <CardContent sx={{ py: 2 }}>
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
