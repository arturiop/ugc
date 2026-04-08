import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Chip,
    Container,
    Divider,
    LinearProgress,
    Paper,
    Stack,
    TextField,
    Typography,
    alpha,
} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CollectionsRoundedIcon from "@mui/icons-material/CollectionsRounded";
import VideoLibraryRoundedIcon from "@mui/icons-material/VideoLibraryRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AppHeader from "@/components/AppHeader";
import { useCreateProject, useProject, useStartMarketplaceProject } from "@/api/projects/hooks";
import { ProjectType } from "@/api/projects";
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

const PIPELINE_STEPS = [
    {
        title: "Extract listing",
        body: "Read the Amazon page, title, bullets, and first product image.",
    },
    {
        title: "Build scenes",
        body: "Create six marketplace-ready storyboard frames from the listing context.",
    },
    {
        title: "Render video",
        body: "Pick three scenes for motion and combine them into the final ad video.",
    },
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
    const statusLabel = imageUrl ? (isSelected ? "Selected for video" : "Ready") : "Queued";

    return (
        <Paper
            elevation={0}
            sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 4,
                border: "1px solid",
                borderColor: alpha("#F7F1E8", 0.12),
                background:
                    "linear-gradient(180deg, rgba(13,17,24,0.94) 0%, rgba(13,17,24,0.88) 100%), radial-gradient(circle at top left, rgba(255,132,64,0.22), transparent 46%), radial-gradient(circle at bottom right, rgba(72,126,255,0.22), transparent 48%)",
                minHeight: 280,
            }}
        >
            <Box
                sx={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 280,
                    p: 2,
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Chip
                        label={title}
                        size="small"
                        sx={{
                            bgcolor: "rgba(255,255,255,0.10)",
                            color: "rgba(255,255,255,0.96)",
                            borderRadius: 999,
                            fontWeight: 700,
                            border: "1px solid rgba(255,255,255,0.12)",
                        }}
                    />
                    <Chip
                        label={statusLabel}
                        size="small"
                        sx={{
                            bgcolor: imageUrl
                                ? isSelected
                                    ? "rgba(72,126,255,0.18)"
                                    : "rgba(82, 201, 118, 0.18)"
                                : "rgba(255,132,64,0.14)",
                            color: imageUrl ? "#E5F8E9" : "#FFD4BD",
                            borderRadius: 999,
                            fontWeight: 700,
                        }}
                    />
                </Stack>

                <Box
                    sx={{
                        alignSelf: "center",
                        width: "100%",
                        maxWidth: 230,
                        aspectRatio: "4 / 5",
                        borderRadius: 3,
                        overflow: "hidden",
                        border: "1px solid rgba(255,255,255,0.12)",
                        background:
                            imageUrl
                                ? "rgba(255,255,255,0.06)"
                                : "linear-gradient(180deg, rgba(250,246,240,0.10) 0%, rgba(250,246,240,0.03) 100%), radial-gradient(circle at 20% 18%, rgba(255,167,117,0.42), transparent 28%), radial-gradient(circle at 78% 82%, rgba(103,142,255,0.38), transparent 36%)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
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
                    ) : null}
                </Box>

                <Box>
                    <Typography sx={{ color: "#F5EDE2", fontWeight: 700, fontSize: "0.98rem" }}>
                        {scene?.title || caption}
                    </Typography>
                    <Typography sx={{ color: "rgba(245,237,226,0.62)", fontSize: "0.84rem", mt: 0.75 }}>
                        {scene?.description || "This slot updates as soon as the scene image is generated."}
                    </Typography>
                </Box>
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
                : "Waiting for scene videos";

    return (
        <Paper
            elevation={0}
            sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 4,
                border: "1px solid",
                borderColor: alpha("#F7F1E8", 0.12),
                background:
                    "linear-gradient(180deg, rgba(12,15,22,0.96) 0%, rgba(12,15,22,0.9) 100%), radial-gradient(circle at top left, rgba(255,132,64,0.18), transparent 42%), radial-gradient(circle at bottom right, rgba(72,126,255,0.2), transparent 46%)",
            }}
        >
            <Box sx={{ position: "relative", zIndex: 1, p: 2.25 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2.25} alignItems={{ xs: "stretch", md: "center" }}>
                    <Box
                        sx={{
                            flex: "0 0 auto",
                            width: { xs: "100%", md: 360 },
                            maxWidth: "100%",
                            aspectRatio: "16 / 9",
                            borderRadius: 3,
                            overflow: "hidden",
                            border: "1px solid rgba(255,255,255,0.12)",
                            background:
                                "linear-gradient(135deg, rgba(255,132,64,0.22) 0%, rgba(255,255,255,0.03) 42%, rgba(72,126,255,0.2) 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
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
                                    backgroundColor: "#0b0f16",
                                }}
                            />
                        ) : (
                            <VideoLibraryRoundedIcon sx={{ fontSize: 38, color: "rgba(255,255,255,0.8)" }} />
                        )}
                    </Box>
                    <Stack spacing={1.15} sx={{ minWidth: 0 }}>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Chip
                                label="Final Video"
                                size="small"
                                sx={{
                                    bgcolor: "rgba(255,255,255,0.10)",
                                    color: "rgba(255,255,255,0.96)",
                                    borderRadius: 999,
                                    fontWeight: 700,
                                    border: "1px solid rgba(255,255,255,0.12)",
                                }}
                            />
                            <Chip
                                label={statusLabel}
                                size="small"
                                sx={{
                                    bgcolor:
                                        status === "ready"
                                            ? "rgba(82, 201, 118, 0.18)"
                                            : status === "failed"
                                              ? "rgba(224, 79, 95, 0.18)"
                                              : "rgba(72,126,255,0.16)",
                                    color: status === "failed" ? "#FFD1D7" : "#D8E4FF",
                                    borderRadius: 999,
                                    fontWeight: 700,
                                }}
                            />
                        </Stack>
                        <Typography sx={{ color: "#F5EDE2", fontWeight: 700, fontSize: "1.02rem" }}>
                            3 selected scenes combined into one 20-30 second ad
                        </Typography>
                        <Typography sx={{ color: "rgba(245,237,226,0.62)", maxWidth: 640 }}>
                            The final video card stays in place while the selected motion scenes render and combine.
                        </Typography>
                    </Stack>
                </Stack>
            </Box>
        </Paper>
    );
}

function resolveProgressLabel(
    pipelineStatus: "idle" | "running" | "completed" | "failed" | undefined,
    currentStage: string | null | undefined,
    progressIndex: number
) {
    if (pipelineStatus === "failed") return "Marketplace generation failed";
    if (pipelineStatus === "completed") return "Creative pack ready";
    if (currentStage === "brand_context") return "Pulling the Amazon listing details";
    if (currentStage === "storyboard") return "Building the 6-scene marketplace storyboard";
    if (currentStage === "scene_generation") return "Rendering selected scene videos";
    if (currentStage === "combine_scenes") return "Combining the final marketplace video";
    if (pipelineStatus === "running") return ["Preparing project", "Generating creative pack", "Publishing assets"][progressIndex % 3];
    return "Waiting for Amazon URL";
}

function prettyJson(value: Record<string, unknown> | null | undefined) {
    if (!value || Object.keys(value).length === 0) return "";
    return JSON.stringify(value, null, 2);
}

export default function MarketplacePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const projectId = searchParams.get("projectId");
    const [urlInput, setUrlInput] = useState("");
    const [error, setError] = useState("");
    const [progressIndex, setProgressIndex] = useState(0);

    const createProject = useCreateProject();
    const startMarketplaceProject = useStartMarketplaceProject();

    const storyboardQuery = useProjectStoryboard(projectId, {
        refetchInterval: (query) => {
            const pipelineStatus = query.state.data?.marketplace?.pipeline_status;
            return pipelineStatus === "running" ? 15000 : false;
        },
    });
    const projectQuery = useProject(projectId, {
        refetchInterval: () => {
            const pipelineStatus = storyboardQuery.data?.marketplace?.pipeline_status;
            return pipelineStatus === "running" ? 15000 : false;
        },
    });

    const storyboard = storyboardQuery.data?.storyboard ?? null;
    const marketplace = storyboardQuery.data?.marketplace ?? null;
    const pipelineStatus = marketplace?.pipeline_status;
    const finalVideoStatus = marketplace?.final_video_status ?? "not_started";
    const finalVideoUrl = marketplace?.final_video_url ?? null;
    const hasStarted = Boolean(projectId);
    const isSubmitting = createProject.isPending || startMarketplaceProject.isPending;
    const shouldAnimateProgress = false && (pipelineStatus === "running" || (hasStarted && !marketplace && !storyboard));

    useEffect(() => {
        if (!shouldAnimateProgress) return;
        const interval = window.setInterval(() => {
            setProgressIndex((current) => current + 1);
        }, 2600);
        return () => window.clearInterval(interval);
    }, [shouldAnimateProgress]);

    useEffect(() => {
        if (!marketplace?.product_url) return;
        setUrlInput((current) => current || marketplace.product_url || "");
    }, [marketplace?.product_url]);

    const progressLabel = resolveProgressLabel(pipelineStatus, projectQuery.data?.current_stage, progressIndex);
    const pipelineError = marketplace?.pipeline_error || error;
    const listingMetadataText = useMemo(() => prettyJson(marketplace?.listing_metadata ?? null), [marketplace?.listing_metadata]);
    const resultSummary = useMemo(
        () => ({
            sceneCount: SCENE_SLOTS.length,
            videoCount: 1,
        }),
        []
    );

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
        setProgressIndex(0);

        try {
            const project = await createProject.mutateAsync(ProjectType.MarketplaceCreatives);
            const nextProjectId = project?.short_id || project?.uuid;
            if (!nextProjectId) {
                throw new Error("Project created but no project id was returned.");
            }

            await startMarketplaceProject.mutateAsync({
                projectId: nextProjectId,
                productUrl: normalized,
            });

            const nextParams = new URLSearchParams(searchParams);
            nextParams.set("projectId", nextProjectId);
            setSearchParams(nextParams, { replace: true });
            setUrlInput(normalized);
        } catch (submissionError) {
            setError(submissionError instanceof Error ? submissionError.message : "Failed to start marketplace generation.");
        }
    };

    const handleReset = () => {
        setError("");
        setProgressIndex(0);
        setUrlInput("");
        if (!projectId) return;
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("projectId");
        setSearchParams(nextParams, { replace: true });
    };

    return (
        <Box
            sx={{
                minHeight: "100dvh",
                bgcolor: "#f6efe6",
                backgroundImage:
                    "radial-gradient(circle at top left, rgba(255, 132, 64, 0.18), transparent 26%), radial-gradient(circle at bottom right, rgba(72, 126, 255, 0.16), transparent 24%), linear-gradient(180deg, #f8f2ea 0%, #f2eadf 100%)",
            }}
        >
            <AppHeader />

            <Box sx={{ py: { xs: 3, md: 5 } }}>
                <Container maxWidth="xl">
                    <Stack spacing={{ xs: 3, md: 4 }}>
                        <Stack direction={{ xs: "column", lg: "row" }} spacing={{ xs: 2.5, md: 3 }} alignItems={{ xs: "stretch", lg: "stretch" }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    flex: 1.2,
                                    p: { xs: 2.5, md: 3.5 },
                                    borderRadius: 5,
                                    color: "#fff6ef",
                                    border: "1px solid rgba(17, 22, 29, 0.08)",
                                    background:
                                        "linear-gradient(135deg, rgba(12,15,21,0.96) 0%, rgba(20,24,33,0.94) 52%, rgba(13,17,24,0.98) 100%)",
                                    boxShadow: "0 28px 60px rgba(32, 24, 18, 0.08)",
                                }}
                            >
                                <Stack spacing={2.2}>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                        <Chip
                                            icon={<BoltRoundedIcon />}
                                            label="Marketplace Creative Studio"
                                            sx={{
                                                width: "fit-content",
                                                bgcolor: "rgba(255,132,64,0.14)",
                                                color: "#FFE2D1",
                                                borderRadius: 999,
                                                fontWeight: 700,
                                            }}
                                        />
                                        <Chip
                                            label="Amazon-first"
                                            sx={{
                                                width: "fit-content",
                                                bgcolor: "rgba(255,255,255,0.08)",
                                                color: "rgba(255,255,255,0.86)",
                                                borderRadius: 999,
                                            }}
                                        />
                                        {projectId ? (
                                            <Chip
                                                icon={<CheckCircleRoundedIcon />}
                                                label={projectId}
                                                sx={{
                                                    width: "fit-content",
                                                    bgcolor: "rgba(255,255,255,0.08)",
                                                    color: "rgba(255,255,255,0.86)",
                                                    borderRadius: 999,
                                                }}
                                            />
                                        ) : null}
                                    </Stack>

                                    <Box>
                                        <Typography
                                            sx={{
                                                fontSize: { xs: "2rem", md: "3.25rem" },
                                                lineHeight: 0.98,
                                                fontWeight: 900,
                                                letterSpacing: "-0.04em",
                                                maxWidth: 760,
                                            }}
                                        >
                                            Paste the product link. Let the marketplace creative pack assemble itself.
                                        </Typography>
                                        <Typography
                                            sx={{
                                                mt: 1.5,
                                                maxWidth: 680,
                                                color: "rgba(255,246,239,0.72)",
                                                fontSize: { xs: "1rem", md: "1.08rem" },
                                            }}
                                        >
                                            One Amazon URL in. Six scene images and one final ad video out. Assets appear here progressively as the backend
                                            finishes each stage.
                                        </Typography>
                                    </Box>

                                    {marketplace?.product_title ? (
                                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "flex-start", sm: "center" }}>
                                            {marketplace.product_image_url ? (
                                                <Box
                                                    component="img"
                                                    src={marketplace.product_image_url}
                                                    alt={marketplace.product_title}
                                                    sx={{
                                                        width: 72,
                                                        height: 72,
                                                        borderRadius: 3,
                                                        objectFit: "cover",
                                                        border: "1px solid rgba(255,255,255,0.12)",
                                                    }}
                                                />
                                            ) : null}
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography sx={{ fontWeight: 800, color: "#fff6ef" }}>{marketplace.product_title}</Typography>
                                                {/* <Typography sx={{ color: "rgba(255,246,239,0.72)", mt: 0.6 }} noWrap>
                                                    {marketplace.product_url}
                                                </Typography> */}
                                                {marketplace.product_description ? (
                                                    <Typography
                                                        sx={{
                                                            color: "rgba(255,246,239,0.72)",
                                                            mt: 0.9,
                                                            display: "-webkit-box",
                                                            WebkitLineClamp: 3,
                                                            WebkitBoxOrient: "vertical",
                                                            overflow: "hidden",
                                                            maxWidth: 640,
                                                        }}
                                                    >
                                                        {marketplace.product_description}
                                                    </Typography>
                                                ) : null}
                                            </Box>
                                        </Stack>
                                    ) : null}

                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                                        <Chip
                                            icon={<CollectionsRoundedIcon />}
                                            label={`${resultSummary.sceneCount} marketplace scene images`}
                                            sx={{
                                                bgcolor: "rgba(255,255,255,0.08)",
                                                color: "rgba(255,255,255,0.9)",
                                                borderRadius: 999,
                                            }}
                                        />
                                        <Chip
                                            icon={<VideoLibraryRoundedIcon />}
                                            label={`${resultSummary.videoCount} final video from 3 selected scenes`}
                                            sx={{
                                                bgcolor: "rgba(255,255,255,0.08)",
                                                color: "rgba(255,255,255,0.9)",
                                                borderRadius: 999,
                                            }}
                                        />
                                    </Stack>
                                </Stack>
                            </Paper>

                            <Paper
                                elevation={0}
                                component="form"
                                onSubmit={handleSubmit}
                                sx={{
                                    flex: 0.9,
                                    p: { xs: 2.5, md: 3 },
                                    borderRadius: 5,
                                    border: "1px solid rgba(17, 22, 29, 0.08)",
                                    background: "rgba(255,255,255,0.82)",
                                    backdropFilter: "blur(18px)",
                                    boxShadow: "0 28px 60px rgba(32, 24, 18, 0.06)",
                                }}
                            >
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: "#11161d" }}>
                                            Start with the listing URL
                                        </Typography>
                                        <Typography sx={{ mt: 0.75, color: "rgba(17,22,29,0.68)" }}>
                                            Paste one Amazon product link and keep the workflow moving without filling a long brief.
                                        </Typography>
                                    </Box>

                                    <TextField
                                        fullWidth
                                        value={urlInput}
                                        disabled={hasStarted || isSubmitting}
                                        onChange={(event) => setUrlInput(event.target.value)}
                                        placeholder="https://www.amazon.com/..."
                                        error={Boolean(error)}
                                        helperText={error || "Use a direct Amazon product link."}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LinkRoundedIcon sx={{ color: "rgba(17,22,29,0.42)" }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: 3,
                                                bgcolor: "#fffdf9",
                                            },
                                        }}
                                    />

                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            disabled={hasStarted || isSubmitting}
                                            sx={{
                                                flex: 1,
                                                minHeight: 52,
                                                borderRadius: 999,
                                                textTransform: "none",
                                                fontWeight: 800,
                                                fontSize: "0.98rem",
                                                bgcolor: "#11161d",
                                                boxShadow: "0 18px 34px rgba(17,22,29,0.18)",
                                                "&:hover": { bgcolor: "#11161d" },
                                            }}
                                        >
                                            {isSubmitting ? "Starting..." : "Generate creative pack"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outlined"
                                            size="large"
                                            disabled={!hasStarted && !urlInput}
                                            onClick={handleReset}
                                            startIcon={<RefreshRoundedIcon />}
                                            sx={{
                                                minHeight: 52,
                                                borderRadius: 999,
                                                textTransform: "none",
                                                fontWeight: 700,
                                            }}
                                        >
                                            Use another link
                                        </Button>
                                    </Stack>

                                    {hasStarted ? (
                                        <Alert
                                            severity={pipelineStatus === "failed" ? "error" : "info"}
                                            icon={<AutoAwesomeRoundedIcon fontSize="inherit" />}
                                            sx={{ borderRadius: 3, bgcolor: alpha("#5B61FF", 0.08) }}
                                        >
                                            {pipelineStatus === "failed"
                                                ? pipelineError || "Marketplace generation failed."
                                                : "Your creative pack layout is locked in. Scene images can start landing here progressively, followed by the final combined video."}
                                        </Alert>
                                    ) : null}
                                </Stack>
                            </Paper>
                        </Stack>

                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                border: "1px solid rgba(17,22,29,0.08)",
                                background: "rgba(255,255,255,0.72)",
                                overflow: "hidden",
                            }}
                        >
                            <Box sx={{ p: { xs: 2, md: 2.5 } }}>
                                <Stack direction={{ xs: "column", md: "row" }} spacing={2.5} justifyContent="space-between">
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography sx={{ fontWeight: 800, color: "#11161d", fontSize: "1rem" }}>Generation pipeline</Typography>
                                        <Typography sx={{ mt: 0.7, color: "rgba(17,22,29,0.68)" }}>
                                            The page is bound to the current project stage and polls while the marketplace pipeline is still running.
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={progressLabel}
                                        sx={{
                                            alignSelf: { xs: "flex-start", md: "center" },
                                            bgcolor: hasStarted ? "rgba(255,132,64,0.12)" : "rgba(17,22,29,0.06)",
                                            color: "#11161d",
                                            borderRadius: 999,
                                            fontWeight: 700,
                                        }}
                                    />
                                </Stack>

                                <LinearProgress
                                    variant="indeterminate"
                                    sx={{
                                        mt: 2,
                                        height: 8,
                                        borderRadius: 999,
                                        bgcolor: "rgba(17,22,29,0.06)",
                                        visibility: shouldAnimateProgress ? "visible" : "hidden",
                                        "& .MuiLinearProgress-bar": {
                                            borderRadius: 999,
                                            background: "linear-gradient(90deg, #FF8440 0%, #5B61FF 100%)",
                                        },
                                    }}
                                />

                                <Stack
                                    direction={{ xs: "column", md: "row" }}
                                    divider={<Divider flexItem orientation="vertical" sx={{ display: { xs: "none", md: "block" } }} />}
                                    spacing={{ xs: 2, md: 0 }}
                                    sx={{ mt: 2.5 }}
                                >
                                    {PIPELINE_STEPS.map((step) => (
                                        <Box key={step.title} sx={{ flex: 1, pr: { md: 2.25 } }}>
                                            <Typography sx={{ fontWeight: 800, color: "#11161d" }}>{step.title}</Typography>
                                            <Typography sx={{ mt: 0.7, color: "rgba(17,22,29,0.66)", maxWidth: 320 }}>{step.body}</Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        </Paper>

                        {marketplace ? (
                            <Paper
                                elevation={0}
                                sx={{
                                    borderRadius: 4,
                                    border: "1px solid rgba(17,22,29,0.08)",
                                    background: "rgba(255,255,255,0.72)",
                                    overflow: "hidden",
                                }}
                            >
                                <Box sx={{ p: { xs: 2, md: 2.5 } }}>
                                    <Stack spacing={2}>
                                        <Box>
                                            <Typography sx={{ fontWeight: 800, color: "#11161d", fontSize: "1rem" }}>
                                                Extracted listing data
                                            </Typography>
                                            <Typography sx={{ mt: 0.7, color: "rgba(17,22,29,0.68)" }}>
                                                This is the Amazon data currently stored for the project before scene and video generation.
                                            </Typography>
                                        </Box>

                                        <Box
                                            sx={{
                                                display: "grid",
                                                gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                                                gap: 2,
                                            }}
                                        >
                                            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: "#fffaf5", border: "1px solid rgba(17,22,29,0.08)" }}>
                                                <Typography sx={{ fontWeight: 800, color: "#11161d" }}>Title</Typography>
                                                <Typography sx={{ mt: 0.9, color: "rgba(17,22,29,0.78)" }}>
                                                    {marketplace.product_title || "Waiting for extraction"}
                                                </Typography>
                                            </Paper>

                                            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: "#fffaf5", border: "1px solid rgba(17,22,29,0.08)" }}>
                                                <Typography sx={{ fontWeight: 800, color: "#11161d" }}>Source URL</Typography>
                                                <Typography sx={{ mt: 0.9, color: "rgba(17,22,29,0.78)", wordBreak: "break-word" }}>
                                                    {marketplace.product_url || "Waiting for extraction"}
                                                </Typography>
                                            </Paper>

                                            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: "#fffaf5", border: "1px solid rgba(17,22,29,0.08)" }}>
                                                <Typography sx={{ fontWeight: 800, color: "#11161d" }}>Description</Typography>
                                                <Typography sx={{ mt: 0.9, color: "rgba(17,22,29,0.78)", whiteSpace: "pre-wrap" }}>
                                                    {marketplace.product_description || "Waiting for extraction"}
                                                </Typography>
                                            </Paper>

                                            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: "#fffaf5", border: "1px solid rgba(17,22,29,0.08)" }}>
                                                <Typography sx={{ fontWeight: 800, color: "#11161d" }}>Product image</Typography>
                                                {marketplace.product_image_url ? (
                                                    <Stack spacing={1.2} sx={{ mt: 0.9 }}>
                                                        <Box
                                                            component="img"
                                                            src={marketplace.product_image_url}
                                                            alt={marketplace.product_title || "Product image"}
                                                            sx={{
                                                                width: 96,
                                                                height: 96,
                                                                objectFit: "cover",
                                                                borderRadius: 2,
                                                                border: "1px solid rgba(17,22,29,0.08)",
                                                            }}
                                                        />
                                                        <Typography sx={{ color: "rgba(17,22,29,0.68)", wordBreak: "break-word" }}>
                                                            {marketplace.product_image_url}
                                                        </Typography>
                                                    </Stack>
                                                ) : (
                                                    <Typography sx={{ mt: 0.9, color: "rgba(17,22,29,0.78)" }}>
                                                        Waiting for extraction
                                                    </Typography>
                                                )}
                                            </Paper>
                                        </Box>

                                        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: "#fffaf5", border: "1px solid rgba(17,22,29,0.08)" }}>
                                            <Typography sx={{ fontWeight: 800, color: "#11161d" }}>Listing metadata</Typography>
                                            <Typography sx={{ mt: 0.7, color: "rgba(17,22,29,0.62)" }}>
                                                Raw normalized metadata saved from the listing extraction step.
                                            </Typography>
                                            <Box
                                                component="pre"
                                                sx={{
                                                    mt: 1.25,
                                                    mb: 0,
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    overflowX: "auto",
                                                    bgcolor: "#11161d",
                                                    color: "#F5EDE2",
                                                    fontSize: "0.78rem",
                                                    lineHeight: 1.45,
                                                    whiteSpace: "pre-wrap",
                                                    wordBreak: "break-word",
                                                }}
                                            >
                                                {listingMetadataText || "Waiting for extraction"}
                                            </Box>
                                        </Paper>
                                    </Stack>
                                </Box>
                            </Paper>
                        ) : null}

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" },
                                gap: 2,
                            }}
                        >
                            {SCENE_SLOTS.map((slot, index) => {
                                const scene = storyboard?.scenes?.find((item) => item.scene_index === index + 1) ?? null;
                                return <SceneCard key={slot.id} title={slot.title} caption={slot.caption} scene={scene} />;
                            })}
                        </Box>

                        <VideoCard videoUrl={finalVideoUrl} status={finalVideoStatus} />
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
}
