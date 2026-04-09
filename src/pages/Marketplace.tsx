import { FormEvent, useEffect, useMemo, useState } from "react";
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
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import VideoLibraryRoundedIcon from "@mui/icons-material/VideoLibraryRounded";
import AppHeader from "@/components/AppHeader";
import { ProjectType } from "@/api/projects";
import { useCreateProject, useProject, useStartMarketplaceProject } from "@/api/projects/hooks";
import { useProjectStoryboard } from "@/api/storyboard/hooks";
import type { StoryboardScene } from "@/api/storyboard";

type ResultSlot = {
    id: string;
    title: string;
    caption: string;
};

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

function prettyJson(value: Record<string, unknown> | null | undefined) {
    if (!value || Object.keys(value).length === 0) return "";
    return JSON.stringify(value, null, 2);
}

function resolveProgressLabel(
    pipelineStatus: "idle" | "running" | "completed" | "failed" | undefined,
    currentStage: string | null | undefined,
    pipelineStep: string | null | undefined,
    hasPipelineActivity: boolean
) {
    if (!hasPipelineActivity && pipelineStatus !== "failed" && pipelineStatus !== "completed") return "Idle";
    if (pipelineStatus === "failed") return "Failed";
    if (pipelineStatus === "completed") return "Ready";
    if (pipelineStep === "extracting_listing") return "Extracting";
    if (pipelineStep === "listing_extracted") return "Extracted";
    if (pipelineStep === "generating_storyboard") return "Building scenes";
    if (pipelineStep === "generating_scene_videos") return "Rendering videos";
    if (pipelineStep === "combining_video") return "Combining";
    if (currentStage === "brand_context") return "Extracting";
    if (currentStage === "storyboard") return "Building scenes";
    if (currentStage === "scene_generation") return "Rendering videos";
    if (currentStage === "combine_scenes") return "Combining";
    if (pipelineStatus === "running") return "Processing";
    return "Idle";
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

    const createProject = useCreateProject();
    const startMarketplaceProject = useStartMarketplaceProject();

    const storyboardQuery = useProjectStoryboard(projectId, {
        refetchInterval: (query) => {
            const pipelineStatus = query.state.data?.marketplace?.pipeline_status;
            return pipelineStatus === "running" ? 25000 : false;
        },
    });
    const projectQuery = useProject(projectId, {
        refetchInterval: () => {
            const pipelineStatus = storyboardQuery.data?.marketplace?.pipeline_status;
            return pipelineStatus === "running" ? 25000 : false;
        },
    });

    const storyboard = storyboardQuery.data?.storyboard ?? null;
    const marketplace = storyboardQuery.data?.marketplace ?? null;
    const pipelineStatus = marketplace?.pipeline_status;
    const pipelineStep = marketplace?.pipeline_step;
    const finalVideoStatus = marketplace?.final_video_status ?? "not_started";
    const finalVideoUrl = marketplace?.final_video_url ?? null;
    const hasBoundProject = Boolean(projectId);
    const isSubmitting = createProject.isPending || startMarketplaceProject.isPending;
    const hasPipelineActivity = Boolean(
        marketplace?.product_url || (pipelineStatus && pipelineStatus !== "idle")
    );
    const isSubmissionLocked = Boolean(
        pipelineStatus === "running" || pipelineStatus === "completed" || marketplace?.product_url || isSubmitting
    );
    const progressLabel = resolveProgressLabel(
        pipelineStatus,
        projectQuery.data?.current_stage,
        pipelineStep,
        hasPipelineActivity
    );
    const pipelineError = marketplace?.pipeline_error || error;
    const listingMetadataText = useMemo(() => prettyJson(marketplace?.listing_metadata ?? null), [marketplace?.listing_metadata]);
    const readySceneCount = storyboard?.scenes?.filter((scene) => Boolean(scene.generated_image_url)).length ?? 0;
    const hasExtractedData = Boolean(
        marketplace?.product_title ||
            marketplace?.product_description ||
            marketplace?.product_image_url ||
            marketplace?.product_url ||
            listingMetadataText
    );
    const hasGeneratedAssets = readySceneCount > 0 || Boolean(finalVideoUrl);
    const extractedDataEmptyLabel =
        hasBoundProject && hasPipelineActivity
            ? "Product data will appear here after extraction."
            : "Submit an Amazon URL to extract product data.";
    const generatedAssetsEmptyLabel =
        hasBoundProject && hasPipelineActivity
            ? "Assets will appear here as scenes finish rendering."
            : "Assets will appear here after extraction.";

    useEffect(() => {
        if (!marketplace?.product_url) return;
        setUrlInput((current) => current || marketplace.product_url || "");
    }, [marketplace?.product_url]);

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
            let nextProjectId = projectId;
            if (!nextProjectId) {
                const project = await createProject.mutateAsync(ProjectType.MarketplaceCreatives);
                nextProjectId = project?.short_id || project?.uuid;
                if (!nextProjectId) {
                    throw new Error("Project created but no project id was returned.");
                }

                const nextParams = new URLSearchParams(searchParams);
                nextParams.set("projectId", nextProjectId);
                setSearchParams(nextParams, { replace: true });
            }

            await startMarketplaceProject.mutateAsync({
                projectId: nextProjectId,
                productUrl: normalized,
            });
            setUrlInput(normalized);
        } catch (submissionError) {
            setError(submissionError instanceof Error ? submissionError.message : "Failed to start marketplace generation.");
        }
    };

    const handleReset = () => {
        setError("");
        setUrlInput("");
        if (!projectId) return;
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("projectId");
        setSearchParams(nextParams, { replace: true });
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

                                <Stack direction={{ xs: "column", xl: "row" }} spacing={1.25}>
                                    <TextField
                                        fullWidth
                                        value={urlInput}
                                        disabled={isSubmissionLocked}
                                        onChange={(event) => setUrlInput(event.target.value)}
                                        placeholder="https://www.amazon.com/..."
                                        error={Boolean(error)}
                                        helperText={error || "Paste the Amazon product link."}
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
                                                borderRadius: 999,
                                                bgcolor: "background.default",
                                            },
                                        }}
                                    />
                                    <Box>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={isSubmissionLocked}
                                        sx={{
                                            minHeight: 52,
                                            borderRadius: 999,
                                            textTransform: "none",
                                            fontWeight: 800,
                                            boxShadow: "0 10px 22px rgba(255, 106, 26, 0.24)",
                                        }}
                                    >
                                        {isSubmitting ? "Starting..." : "Generate"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        disabled={isSubmitting || (!hasBoundProject && !urlInput)}
                                        onClick={handleReset}
                                        startIcon={<RefreshRoundedIcon />}
                                        sx={{
                                            minWidth: { xs: "100%", xl: 180 },
                                            minHeight: 52,
                                            borderRadius: 999,
                                            textTransform: "none",
                                            fontWeight: 700,
                                        }}
                                    >
                                        Reset
                                    </Button>
                                    </Box>
                                    
                                </Stack>

                                {hasBoundProject ? (
                                    <Alert severity={pipelineError ? "error" : "info"} sx={{ borderRadius: 2.5 }}>
                                        {pipelineError
                                            ? pipelineError
                                            : hasPipelineActivity
                                              ? progressLabel
                                              : "Paste an Amazon URL to start this marketplace project."}
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
                                <Typography sx={{ fontWeight: 700, color: "text.primary", fontSize: "1rem" }}>
                                    Extracted product data
                                </Typography>

                                {hasExtractedData ? (
                                    <>
                                        <Box
                                            sx={{
                                                display: "grid",
                                                gridTemplateColumns: { xs: "1fr", lg: "140px minmax(0, 1fr)" },
                                                gap: 2,
                                                alignItems: "start",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: { xs: "100%", lg: 140 },
                                                    maxWidth: 140,
                                                    aspectRatio: "1 / 1",
                                                    borderRadius: 2.5,
                                                    overflow: "hidden",
                                                    border: "1px solid",
                                                    borderColor: "divider",
                                                    bgcolor: "background.default",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                {marketplace?.product_image_url ? (
                                                    <Box
                                                        component="img"
                                                        src={marketplace.product_image_url}
                                                        alt={marketplace.product_title || "Product image"}
                                                        sx={{
                                                            width: "100%",
                                                            height: "100%",
                                                            objectFit: "cover",
                                                            display: "block",
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography sx={{ color: "text.disabled", fontSize: "0.82rem" }}>
                                                        No image
                                                    </Typography>
                                                )}
                                            </Box>

                                            <Stack spacing={1.5}>
                                                <Box>
                                                    <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", mb: 0.5 }}>Title</Typography>
                                                    <Typography sx={{ color: "text.primary", fontWeight: 700 }}>
                                                        {marketplace?.product_title || "Waiting for extraction"}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", mb: 0.5 }}>
                                                        Source URL
                                                    </Typography>
                                                    <Typography sx={{ color: "text.secondary", wordBreak: "break-word" }}>
                                                        {marketplace?.product_url || "Waiting for extraction"}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", mb: 0.5 }}>
                                                        Description
                                                    </Typography>
                                                    <Typography sx={{ color: "text.secondary", whiteSpace: "pre-wrap" }}>
                                                        {marketplace?.product_description || "Waiting for extraction"}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Box>

                                        <Box>
                                            <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", mb: 0.75 }}>Metadata</Typography>
                                            <Box
                                                component="pre"
                                                sx={{
                                                    m: 0,
                                                    p: 1.5,
                                                    borderRadius: 2.5,
                                                    border: "1px solid",
                                                    borderColor: "divider",
                                                    bgcolor: "background.default",
                                                    color: "text.secondary",
                                                    fontSize: "0.78rem",
                                                    lineHeight: 1.45,
                                                    whiteSpace: "pre-wrap",
                                                    wordBreak: "break-word",
                                                    maxHeight: 240,
                                                    overflow: "auto",
                                                }}
                                            >
                                                {listingMetadataText || "Waiting for extraction"}
                                            </Box>
                                        </Box>
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
                                            {extractedDataEmptyLabel}
                                        </Typography>
                                    </Box>
                                )}
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
