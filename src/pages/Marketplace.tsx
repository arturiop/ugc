import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Chip,
    Paper,
    Stack,
    TextField,
    Typography,
    alpha,
} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import VideoLibraryRoundedIcon from "@mui/icons-material/VideoLibraryRounded";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import AppHeader from "@/components/AppHeader";
import { uploadProjectAsset } from "@/api/assets";
import { ProjectType, type MarketplaceExtractResponse } from "@/api/projects";
import { useCreateProject, useExtractMarketplaceListing, useSubmitMarketplaceProject } from "@/api/projects/hooks";
import { useProjectStoryboard } from "@/api/storyboard/hooks";
import type { StoryboardScene } from "@/api/storyboard";

type ResultSlot = {
    id: string;
    title: string;
    caption: string;
};

type ManualImage = {
    id: string;
    file: File;
    previewUrl: string;
};

type ManualProductDraft = {
    title: string;
    description: string;
    vibe: string;
    images: ManualImage[];
};

type ExtractedListingState = MarketplaceExtractResponse | null;

const SCENE_SLOTS: ResultSlot[] = [
    { id: "scene-1", title: "Scene 1", caption: "Marketplace hero frame" },
    { id: "scene-2", title: "Scene 2", caption: "Benefit-led close-up" },
    { id: "scene-3", title: "Scene 3", caption: "Context of use" },
    { id: "scene-4", title: "Scene 4", caption: "Feature detail" },
    { id: "scene-5", title: "Scene 5", caption: "Lifestyle proof" },
    { id: "scene-6", title: "Scene 6", caption: "Offer and finish frame" },
];

function normalizeAmazonUrl(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    return `https://${trimmed}`;
}

function isAmazonUrl(value: string) {
    try {
        const parsed = new URL(value);
        return /(^|\.)amazon\./i.test(parsed.hostname);
    } catch {
        return false;
    }
}

function createEmptyManualDraft(): ManualProductDraft {
    return {
        title: "",
        description: "",
        vibe: "",
        images: [],
    };
}

function releaseManualImages(images: ManualImage[]) {
    images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
}

function SceneCard({
    title,
    caption,
    scene,
}: {
    title: string;
    caption: string;
    scene: StoryboardScene | null;
}) {
    const imageUrl = scene?.generated_image_url || null;
    const isSelected = Boolean(scene?.selected_for_video);
    const statusLabel = imageUrl ? (isSelected ? "Selected" : "Ready") : "Waiting";

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                minHeight: 336,
            }}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <Typography sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.95rem" }}>
                    {title}
                </Typography>
                <Chip
                    label={statusLabel}
                    size="small"
                    sx={{
                        borderRadius: 999,
                        fontWeight: 700,
                        bgcolor: imageUrl
                            ? isSelected
                                ? alpha("#5B61FF", 0.1)
                                : alpha("#FF6A1A", 0.1)
                            : "action.hover",
                        color: imageUrl
                            ? isSelected
                                ? "#5B61FF"
                                : "#C85616"
                            : "text.secondary",
                    }}
                />
            </Stack>

            <Box
                sx={{
                    width: "100%",
                    aspectRatio: "4 / 5",
                    borderRadius: 2.5,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: imageUrl ? "grey.100" : "background.default",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {imageUrl ? (
                    <Box
                        component="img"
                        src={imageUrl}
                        alt={scene?.title || title}
                        sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                        }}
                    />
                ) : (
                    <Typography sx={{ color: "text.disabled", fontSize: "0.86rem" }}>Waiting for image</Typography>
                )}
            </Box>

            <Box sx={{ minHeight: 0 }}>
                <Typography sx={{ color: "text.primary", fontWeight: 700, fontSize: "0.95rem" }}>
                    {scene?.title || caption}
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: "0.84rem", mt: 0.75 }}>
                    {scene?.description || "This asset appears here after generation."}
                </Typography>
            </Box>
        </Paper>
    );
}

function VideoCard({
    videoUrl,
    status,
}: {
    videoUrl: string | null;
    status: "not_started" | "processing" | "ready" | "failed";
}) {
    const statusLabel =
        status === "ready"
            ? "Ready"
            : status === "failed"
              ? "Failed"
              : status === "processing"
                ? "Processing"
                : "Waiting";

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
            }}
        >
            <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
                <Box
                    sx={{
                        width: { xs: "100%", lg: 420 },
                        maxWidth: "100%",
                        aspectRatio: "16 / 9",
                        borderRadius: 2.5,
                        overflow: "hidden",
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.default",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    {videoUrl ? (
                        <Box
                            component="video"
                            src={videoUrl}
                            controls
                            playsInline
                            sx={{
                                width: "100%",
                                height: "100%",
                                display: "block",
                                objectFit: "cover",
                                bgcolor: "#000",
                            }}
                        />
                    ) : (
                        <VideoLibraryRoundedIcon sx={{ fontSize: 34, color: "text.disabled" }} />
                    )}
                </Box>
                <Stack spacing={1.2} justifyContent="space-between" sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                            label="Final video"
                            size="small"
                            sx={{
                                borderRadius: 999,
                                fontWeight: 700,
                                bgcolor: "action.hover",
                                color: "text.primary",
                            }}
                        />
                        <Chip
                            label={statusLabel}
                            size="small"
                            sx={{
                                borderRadius: 999,
                                fontWeight: 700,
                                bgcolor:
                                    status === "ready"
                                        ? alpha("#FF6A1A", 0.1)
                                        : status === "failed"
                                          ? alpha("#d32f2f", 0.1)
                                          : alpha("#5B61FF", 0.1),
                                color:
                                    status === "ready"
                                        ? "#C85616"
                                        : status === "failed"
                                          ? "error.main"
                                          : "#5B61FF",
                            }}
                        />
                    </Stack>
                    <Box>
                        <Typography sx={{ color: "text.primary", fontWeight: 700, fontSize: "1rem" }}>
                            Final combined asset
                        </Typography>
                        <Typography sx={{ color: "text.secondary", mt: 0.75 }}>
                            Generated from the 3 selected scenes after the scene videos finish rendering.
                        </Typography>
                    </Box>
                </Stack>
            </Stack>
        </Paper>
    );
}

export default function MarketplacePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const projectId = searchParams.get("projectId");
    const [urlInput, setUrlInput] = useState("");
    const [error, setError] = useState("");
    const [manualDraft, setManualDraft] = useState<ManualProductDraft>(() => createEmptyManualDraft());
    const [savedManualDraft, setSavedManualDraft] = useState<ManualProductDraft | null>(null);
    const [extractedListing, setExtractedListing] = useState<ExtractedListingState>(null);
    const [isCreatingProject, setIsCreatingProject] = useState(false);

    const createProject = useCreateProject();
    const extractMarketplaceListing = useExtractMarketplaceListing();
    const submitMarketplaceProject = useSubmitMarketplaceProject();

    const storyboardQuery = useProjectStoryboard(projectId, {
        refetchInterval: (query) => {
            const pipelineStatus = query.state.data?.marketplace?.pipeline_status;
            return pipelineStatus === "running" ? 25000 : false;
        },
    });
    const storyboard = storyboardQuery.data?.storyboard ?? null;
    const marketplace = storyboardQuery.data?.marketplace ?? null;
    const pipelineStatus = marketplace?.pipeline_status;
    const finalVideoStatus = marketplace?.final_video_status ?? "not_started";
    const finalVideoUrl = marketplace?.final_video_url ?? null;
    const hasBoundProject = Boolean(projectId);
    const isLocked = hasBoundProject;
    const isSubmitting = extractMarketplaceListing.isPending;
    const manualTitle = manualDraft.title.trim();
    const manualDescription = manualDraft.description.trim();
    const manualVibe = manualDraft.vibe.trim();
    const imageUrlFromState = marketplace?.product_image_url || extractedListing?.product_image_url || null;
    const canCreateProjectFromCurrentData = Boolean(manualTitle && manualDescription && (manualDraft.images.length > 0 || imageUrlFromState));
    const hasPipelineActivity = Boolean(pipelineStatus && pipelineStatus !== "idle");
    const isSubmissionLocked = Boolean(isSubmitting || isLocked);
    const progressLabel =
        isCreatingProject
            ? "Creating project"
            : isSubmitting
              ? "Extracting"
              : isLocked
                ? "Project created"
                : canCreateProjectFromCurrentData
                  ? "Ready"
                  : extractedListing
                    ? "Preview ready"
                : "Idle";
    const pipelineError = marketplace?.pipeline_error || error;
    const readySceneCount = storyboard?.scenes?.filter((scene) => Boolean(scene.generated_image_url)).length ?? 0;
    const hasGeneratedAssets = readySceneCount > 0 || Boolean(finalVideoUrl);
    const displayImages = savedManualDraft?.images || manualDraft.images;
    const generatedAssetsEmptyLabel =
        hasBoundProject && hasPipelineActivity
            ? "Assets will appear here as scenes finish rendering."
            : "Assets will appear here after extraction.";

    useEffect(() => {
        return () => {
            const uniqueUrls = new Set([
                ...manualDraft.images.map((image) => image.previewUrl),
                ...(savedManualDraft?.images ?? []).map((image) => image.previewUrl),
            ]);
            uniqueUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [manualDraft.images, savedManualDraft]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const normalized = normalizeAmazonUrl(urlInput);
        if (!normalized) {
            setError("Paste an Amazon product link to start.");
            return;
        }
        if (!isAmazonUrl(normalized)) {
            setError("Use a valid Amazon product link.");
            return;
        }

        setError("");

        try {
            const listing = await extractMarketplaceListing.mutateAsync({
                productUrl: normalized,
            });
            setExtractedListing(listing);
            setUrlInput(listing.product_url);
            setManualDraft((current) => ({
                ...current,
                title: listing.product_title,
                description: listing.product_description,
            }));
        } catch (submissionError) {
            setError(submissionError instanceof Error ? submissionError.message : "Failed to extract marketplace listing.");
        }
    };

    const handleManualFieldChange =
        (field: keyof Omit<ManualProductDraft, "images">) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setManualDraft((current) => ({ ...current, [field]: event.target.value }));
        };

    const handleManualImagesChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        if (files.length === 0) return;

        const nextImages = files.map((file, index) => ({
            id: `${file.name}-${file.size}-${file.lastModified}-${index}`,
            file,
            previewUrl: URL.createObjectURL(file),
        }));

        setManualDraft((current) => ({
            ...current,
            images: [...current.images, ...nextImages],
        }));
        event.target.value = "";
    };

    const handleCreateProjectFromBrief = async () => {
        if (!canCreateProjectFromCurrentData || isCreatingProject) return;

        setError("");
        setIsCreatingProject(true);

        try {
            const project = await createProject.mutateAsync(ProjectType.MarketplaceCreatives);
            const nextProjectId = project?.short_id || project?.uuid;
            if (!nextProjectId) {
                throw new Error("Project created but no project id was returned.");
            }

            if (manualDraft.images.length > 0) {
                const uploadedAssets = await Promise.all(
                    manualDraft.images.map((image) => uploadProjectAsset(nextProjectId, image.file, "product"))
                );
                await submitMarketplaceProject.mutateAsync({
                    projectId: nextProjectId,
                    payload: {
                        source: extractedListing ? "amazon_extracted" : "manual",
                        product_title: manualTitle,
                        product_description: manualDescription,
                        style: manualVibe || null,
                        image_asset_ids: uploadedAssets.map((asset) => asset.id),
                        listing_metadata: {},
                    },
                });
                setSavedManualDraft({
                    title: manualTitle,
                    description: manualDescription,
                    vibe: manualVibe,
                    images: manualDraft.images,
                });
            } else if (extractedListing) {
                await submitMarketplaceProject.mutateAsync({
                    projectId: nextProjectId,
                    payload: {
                        source: "amazon_extracted",
                        product_title: manualTitle || extractedListing.product_title,
                        product_description: manualDescription || extractedListing.product_description,
                        style: manualVibe || null,
                        image_urls: [extractedListing.product_image_url],
                        listing_metadata: {
                            image_candidates: [extractedListing.product_image_url],
                        },
                    },
                });
            }

            const nextParams = new URLSearchParams(searchParams);
            nextParams.set("projectId", nextProjectId);
            setSearchParams(nextParams, { replace: true });
        } catch (creationError) {
            setError(creationError instanceof Error ? creationError.message : "Failed to create marketplace project.");
        } finally {
            setIsCreatingProject(false);
        }
    };

    return (
        <Box sx={{ height: "100dvh", width: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <AppHeader />
            <Box sx={{ flex: 1, overflow: "auto" }}>
                <Box sx={{ width: "100%", mx: "auto", px: { xs: 1, md: 2 }, pb: 6 }}>
                    <Stack spacing={3} sx={{ pt: 2 }}>
                        <Paper
                            elevation={0}
                            component="form"
                            onSubmit={handleSubmit}
                            sx={{
                                p: { xs: 2, md: 2.5 },
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "divider",
                                bgcolor: "background.paper",
                            }}
                        >
                            <Stack spacing={2}>
                                <Stack
                                    direction={{ xs: "column", md: "row" }}
                                    spacing={1.5}
                                    justifyContent="space-between"
                                    alignItems={{ xs: "flex-start", md: "center" }}
                                >
                                    <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                                        Marketplace creative
                                    </Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                        {projectId ? (
                                            <Chip
                                                label={projectId}
                                                sx={{
                                                    borderRadius: 999,
                                                    bgcolor: "action.hover",
                                                    color: "text.primary",
                                                    fontWeight: 700,
                                                }}
                                            />
                                        ) : null}
                                        <Chip
                                            label={progressLabel}
                                            sx={{
                                                borderRadius: 999,
                                                bgcolor: hasPipelineActivity ? alpha("#FF6A1A", 0.1) : "action.hover",
                                                color: hasPipelineActivity ? "#C85616" : "text.secondary",
                                                fontWeight: 700,
                                            }}
                                        />
                                    </Stack>
                                </Stack>

                                <Stack spacing={2}>
                                    <Stack
                                        direction={{ xs: "column", lg: "row" }}
                                        spacing={1.25}
                                        alignItems={{ xs: "stretch", lg: "flex-start" }}
                                    >
                                        <TextField
                                            fullWidth
                                            value={urlInput}
                                            disabled={isSubmissionLocked}
                                            onChange={(event) => setUrlInput(event.target.value)}
                                            placeholder="https://www.amazon.com/..."
                                            error={Boolean(error) && !manualTitle && !manualDescription}
                                            helperText="Paste the Amazon product link and extract data into the fields below."
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LinkRoundedIcon sx={{ color: "rgba(17,22,29,0.42)" }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                flex: 1,
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: 3,
                                                    bgcolor: "background.default",
                                                    minHeight: 56,
                                                },
                                            }}
                                        />
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={isSubmissionLocked}
                                            sx={{
                                                minWidth: { xs: "100%", lg: 132 },
                                                minHeight: 44,
                                                borderRadius: 999,
                                                px: 2.25,
                                                textTransform: "none",
                                                fontWeight: 800,
                                                boxShadow: "0 8px 18px rgba(255, 106, 26, 0.18)",
                                            }}
                                        >
                                            {isSubmitting ? "Extracting..." : "Extract data"}
                                        </Button>
                                    </Stack>

                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) minmax(0, 1fr)" },
                                            gap: 2,
                                        }}
                                    >
                                        <TextField
                                            fullWidth
                                            disabled={isLocked}
                                            label="Product title"
                                            value={manualDraft.title}
                                            onChange={handleManualFieldChange("title")}
                                            error={Boolean(error) && !manualTitle}
                                            placeholder="Hydrating magnesium body spray"
                                        />
                                        <TextField
                                            fullWidth
                                            disabled={isLocked}
                                            label="Expected vibe or style"
                                            value={manualDraft.vibe}
                                            onChange={handleManualFieldChange("vibe")}
                                            placeholder="Clean, natural light, creator-style, premium but casual"
                                        />
                                        <TextField
                                            fullWidth
                                            multiline
                                            minRows={5}
                                            disabled={isLocked}
                                            label="Product description"
                                            value={manualDraft.description}
                                            onChange={handleManualFieldChange("description")}
                                            error={Boolean(error) && !manualDescription}
                                            placeholder="What the product is, key benefits, who it is for, and what should stand out."
                                            sx={{ gridColumn: { xs: "auto", lg: "1 / -1" } }}
                                        />
                                    </Box>

                                    <Stack spacing={1.25}>
                                        <Stack
                                            direction={{ xs: "column", sm: "row" }}
                                            spacing={1.25}
                                            justifyContent="space-between"
                                            alignItems={{ xs: "flex-start", sm: "center" }}
                                        >
                                            <Box>
                                                <Typography sx={{ color: "text.primary", fontWeight: 700, fontSize: "0.95rem" }}>
                                                    Product image
                                                </Typography>
                                                <Typography sx={{ color: "text.secondary", fontSize: "0.84rem", mt: 0.5 }}>
                                                    Extract from Amazon or upload one image manually before creating the project.
                                                </Typography>
                                            </Box>
                                            {!isLocked ? (
                                                <Button
                                                    component="label"
                                                    variant="outlined"
                                                    startIcon={<AddPhotoAlternateRoundedIcon />}
                                                    sx={{
                                                        borderRadius: 999,
                                                        textTransform: "none",
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    Add image
                                                    <Box
                                                        component="input"
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={handleManualImagesChange}
                                                        sx={{ display: "none" }}
                                                    />
                                                </Button>
                                            ) : null}
                                        </Stack>

                                        {isLocked && marketplace?.product_image_url ? (
                                            <Box
                                                sx={{
                                                    width: "100%",
                                                    maxWidth: 360,
                                                    aspectRatio: "1 / 1",
                                                    borderRadius: 2.5,
                                                    overflow: "hidden",
                                                    border: "1px solid",
                                                    borderColor: "divider",
                                                    bgcolor: "background.default",
                                                }}
                                            >
                                                <Box
                                                    component="img"
                                                    src={marketplace.product_image_url}
                                                    alt={manualDraft.title || "Product image"}
                                                    sx={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "contain",
                                                        display: "block",
                                                        p: 1,
                                                        bgcolor: "background.paper",
                                                    }}
                                                />
                                            </Box>
                                        ) : imageUrlFromState && manualDraft.images.length === 0 ? (
                                            <Box
                                                sx={{
                                                    width: "100%",
                                                    maxWidth: 360,
                                                    aspectRatio: "1 / 1",
                                                    borderRadius: 2.5,
                                                    overflow: "hidden",
                                                    border: "1px solid",
                                                    borderColor: "divider",
                                                    bgcolor: "background.default",
                                                }}
                                            >
                                                <Box
                                                    component="img"
                                                    src={imageUrlFromState}
                                                    alt={manualDraft.title || "Product image"}
                                                    sx={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "contain",
                                                        display: "block",
                                                        p: 1,
                                                        bgcolor: "background.paper",
                                                    }}
                                                />
                                            </Box>
                                        ) : manualDraft.images.length > 0 ? (
                                            <Box
                                                sx={{
                                                    display: "grid",
                                                    gridTemplateColumns: {
                                                        xs: "repeat(2, minmax(0, 1fr))",
                                                        md: "repeat(4, minmax(0, 1fr))",
                                                    },
                                                    gap: 1.25,
                                                }}
                                            >
                                                {displayImages.map((image) => (
                                                    <Box
                                                        key={image.id}
                                                        sx={{
                                                            aspectRatio: "1 / 1",
                                                            borderRadius: 2.5,
                                                            overflow: "hidden",
                                                            border: "1px solid",
                                                            borderColor: "divider",
                                                            bgcolor: "background.default",
                                                        }}
                                                    >
                                                        <Box
                                                            component="img"
                                                            src={image.previewUrl}
                                                            alt={image.file.name}
                                                            sx={{
                                                                width: "100%",
                                                                height: "100%",
                                                                objectFit: "cover",
                                                                display: "block",
                                                            }}
                                                        />
                                                    </Box>
                                                ))}
                                            </Box>
                                        ) : (
                                            <Box
                                                sx={{
                                                    minHeight: 120,
                                                    borderRadius: 2.5,
                                                    border: "1px dashed",
                                                    borderColor: "divider",
                                                    bgcolor: "background.default",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    px: 3,
                                                    textAlign: "center",
                                                }}
                                            >
                                                <Typography sx={{ color: "text.secondary", fontSize: "0.92rem" }}>
                                                    No image yet.
                                                </Typography>
                                            </Box>
                                        )}
                                    </Stack>

                                    {!isLocked ? (
                                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} justifyContent="flex-end" sx={{ width: "100%" }}>
                                            <Button
                                                type="button"
                                                variant="outlined"
                                                disabled={!canCreateProjectFromCurrentData || isCreatingProject}
                                                onClick={handleCreateProjectFromBrief}
                                                sx={{
                                                    minWidth: { xs: "100%", sm: 136 },
                                                    minHeight: 44,
                                                    borderRadius: 999,
                                                    px: 2,
                                                    textTransform: "none",
                                                    fontWeight: 700,
                                                    borderColor: alpha("#FF6A1A", 0.24),
                                                    color: "#C85616",
                                                    bgcolor: alpha("#FF6A1A", 0.04),
                                                }}
                                            >
                                                {isCreatingProject ? "Creating..." : "Build the creative set"}
                                            </Button>
                                        </Stack>
                                    ) : null}
                                </Stack>

                                {pipelineError || hasPipelineActivity ? (
                                    <Alert
                                        severity={pipelineError ? "error" : "info"}
                                        sx={{
                                            borderRadius: 2.5,
                                            bgcolor: pipelineError ? alpha("#d32f2f", 0.06) : alpha("#5B61FF", 0.08),
                                            color: pipelineError ? "error.main" : "#3E47D6",
                                            "& .MuiAlert-icon": {
                                                color: pipelineError ? "error.main" : "#5B61FF",
                                            },
                                        }}
                                    >
                                        {pipelineError || progressLabel}
                                    </Alert>
                                ) : null}
                            </Stack>
                        </Paper>

                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 2, md: 2.5 },
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "divider",
                                bgcolor: "background.paper",
                            }}
                        >
                            <Stack spacing={2}>
                                <Stack
                                    direction={{ xs: "column", md: "row" }}
                                    spacing={1}
                                    alignItems={{ xs: "flex-start", md: "center" }}
                                    justifyContent="space-between"
                                >
                                    <Typography sx={{ fontWeight: 700, color: "text.primary", fontSize: "1rem" }}>
                                        Generated assets
                                    </Typography>
                                    {hasBoundProject ? (
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            <Chip
                                                label={`${readySceneCount}/${SCENE_SLOTS.length} scenes`}
                                                size="small"
                                                sx={{
                                                    borderRadius: 999,
                                                    bgcolor: "action.hover",
                                                    color: "text.primary",
                                                    fontWeight: 700,
                                                }}
                                            />
                                            <Chip
                                                label={finalVideoStatus === "ready" ? "Video ready" : "Video pending"}
                                                size="small"
                                                sx={{
                                                    borderRadius: 999,
                                                    bgcolor:
                                                        finalVideoStatus === "ready"
                                                            ? alpha("#FF6A1A", 0.1)
                                                            : alpha("#5B61FF", 0.1),
                                                    color: finalVideoStatus === "ready" ? "#C85616" : "#5B61FF",
                                                    fontWeight: 700,
                                                }}
                                            />
                                        </Stack>
                                    ) : null}
                                </Stack>

                                {hasGeneratedAssets ? (
                                    <>
                                        <Box
                                            sx={{
                                                display: "grid",
                                                gridTemplateColumns: {
                                                    xs: "1fr",
                                                    sm: "repeat(2, minmax(0, 1fr))",
                                                    xl: "repeat(3, minmax(0, 1fr))",
                                                },
                                                gap: 2,
                                            }}
                                        >
                                            {SCENE_SLOTS.map((slot, index) => {
                                                const scene = storyboard?.scenes?.find((item) => item.scene_index === index + 1) ?? null;
                                                return <SceneCard key={slot.id} title={slot.title} caption={slot.caption} scene={scene} />;
                                            })}
                                        </Box>

                                        <VideoCard videoUrl={finalVideoUrl} status={finalVideoStatus} />
                                    </>
                                ) : (
                                    <Box
                                        sx={{
                                            minHeight: 240,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            px: 4,
                                            textAlign: "center",
                                        }}
                                    >
                                        <Typography sx={{ color: "text.secondary", fontSize: "1rem" }}>
                                            {generatedAssetsEmptyLabel}
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Paper>
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
}
