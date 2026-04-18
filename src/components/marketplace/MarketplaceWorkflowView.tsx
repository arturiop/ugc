import { useMemo } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Stack,
    Typography,
    alpha,
} from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import VideoLibraryRoundedIcon from "@mui/icons-material/VideoLibraryRounded";
import type { MarketplaceStoryboardState, Storyboard, StoryboardScene } from "@/api/storyboard";
import type { ManualImage, ManualProductDraft, ResultSlot } from "./types";
import { formatEstimatedDuration } from "./utils";

type MarketplaceWorkflowViewProps = {
    projectId: string;
    marketplace: MarketplaceStoryboardState | null;
    storyboard: Storyboard | null;
    manualDraft: ManualProductDraft;
    displayImages: ManualImage[];
    imageUrlFromState: string | null;
    progressLabel: string;
    hasPipelineActivity: boolean;
    pipelineError: string;
    storyboardSceneCount: number;
    readySceneCount: number;
    finalVideoStatus: "not_started" | "processing" | "ready" | "failed";
    finalVideoUrl: string | null;
    allSceneImagesReady: boolean;
    awaitingSceneApproval: boolean;
    canLaunchVideoSelection: boolean;
    approveMarketplaceScenesPending: boolean;
    selectedSceneIndices: number[];
    pendingSceneSelection: number[];
    estimatedVideoLengthSeconds: number;
    scenePickerOpen: boolean;
    onOpenScenePicker: () => void;
    onCloseScenePicker: () => void;
    onTogglePendingScene: (sceneIndex: number) => void;
    onApproveScenes: () => void;
    sceneSlots: ResultSlot[];
};

export default function MarketplaceWorkflowView({
    projectId,
    marketplace,
    storyboard,
    manualDraft,
    displayImages,
    imageUrlFromState,
    progressLabel,
    hasPipelineActivity,
    pipelineError,
    storyboardSceneCount,
    readySceneCount,
    finalVideoStatus,
    finalVideoUrl,
    allSceneImagesReady,
    awaitingSceneApproval,
    canLaunchVideoSelection,
    approveMarketplaceScenesPending,
    selectedSceneIndices,
    pendingSceneSelection,
    estimatedVideoLengthSeconds,
    scenePickerOpen,
    onOpenScenePicker,
    onCloseScenePicker,
    onTogglePendingScene,
    onApproveScenes,
    sceneSlots,
}: MarketplaceWorkflowViewProps) {
    const productImage = marketplace?.product_image_url || imageUrlFromState || displayImages[0]?.previewUrl || null;
    const scenes = useMemo(
        () => storyboard?.scenes?.length ? storyboard.scenes : sceneSlots.map((_slot, index) => ({ scene_index: index + 1 } as StoryboardScene)),
        [sceneSlots, storyboard?.scenes]
    );

    return (
        <Box sx={{ height: "100%", width: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Box sx={{ flex: 1, overflow: "auto" }}>
                <Box sx={{ width: "100%", mx: "auto", px: { xs: 1, md: 2 }, py: { xs: 2, md: 3 } }}>
                    <Stack spacing={3}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 2, md: 2.5 },
                                borderRadius: 4,
                                border: "1px solid",
                                borderColor: "divider",
                                bgcolor: "background.paper",
                                backgroundImage:
                                    "linear-gradient(180deg, rgba(255, 106, 26, 0.03) 0%, rgba(91, 97, 255, 0.03) 100%)",
                            }}
                        >
                            <Stack spacing={2.5}>
                                <Stack
                                    direction={{ xs: "column", md: "row" }}
                                    spacing={1.5}
                                    justifyContent="space-between"
                                    alignItems={{ xs: "flex-start", md: "center" }}
                                >
                                    <Stack spacing={0.75}>
                                        <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.05 }}>
                                            Marketplace generation
                                        </Typography>
                                        <Typography sx={{ color: "text.secondary" }}>
                                            The intake is done. This workspace tracks image rendering, scene selection, and final video assembly.
                                        </Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                        <Chip label={projectId} sx={{ borderRadius: 999, bgcolor: "action.hover", fontWeight: 700 }} />
                                        <Chip
                                            label={progressLabel}
                                            sx={{
                                                borderRadius: 999,
                                                fontWeight: 700,
                                                bgcolor: hasPipelineActivity ? alpha("#FF6A1A", 0.1) : "action.hover",
                                                color: hasPipelineActivity ? "#C85616" : "text.secondary",
                                            }}
                                        />
                                    </Stack>
                                </Stack>

                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: { xs: "1fr", lg: "minmax(300px, 360px) minmax(0, 1fr)" },
                                        gap: 2,
                                    }}
                                >
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 3,
                                            bgcolor: "background.default",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: "100%",
                                                aspectRatio: "1 / 1",
                                                borderRadius: 2.5,
                                                overflow: "hidden",
                                                border: "1px solid",
                                                borderColor: "divider",
                                                bgcolor: "background.paper",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            {productImage ? (
                                                <Box
                                                    component="img"
                                                    src={productImage}
                                                    alt={manualDraft.title || "Product image"}
                                                    sx={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "contain",
                                                        display: "block",
                                                        p: 1,
                                                    }}
                                                />
                                            ) : (
                                                <Typography sx={{ color: "text.secondary" }}>Waiting for product image</Typography>
                                            )}
                                        </Box>
                                    </Paper>

                                    <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3 }}>
                                        <Stack spacing={2}>
                                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                <Chip
                                                    icon={<AutoAwesomeRoundedIcon />}
                                                    label={`${readySceneCount}/${storyboardSceneCount || sceneSlots.length} scenes ready`}
                                                    size="small"
                                                    sx={{ borderRadius: 999, fontWeight: 700 }}
                                                />
                                                <Chip
                                                    label={finalVideoStatus === "ready" ? "Video ready" : awaitingSceneApproval ? "Awaiting selection" : "Video pending"}
                                                    size="small"
                                                    sx={{
                                                        borderRadius: 999,
                                                        fontWeight: 700,
                                                        bgcolor:
                                                            finalVideoStatus === "ready"
                                                                ? alpha("#FF6A1A", 0.1)
                                                                : alpha("#5B61FF", 0.1),
                                                        color: finalVideoStatus === "ready" ? "#C85616" : "#5B61FF",
                                                    }}
                                                />
                                            </Stack>
                                            <Box>
                                                <Typography sx={{ fontWeight: 800, fontSize: "1.2rem" }}>
                                                    {manualDraft.title || marketplace?.product_title || "Marketplace product"}
                                                </Typography>
                                                <Typography sx={{ color: "text.secondary", mt: 1, lineHeight: 1.7 }}>
                                                    {manualDraft.description || marketplace?.product_description || "Waiting for product description."}
                                                </Typography>
                                            </Box>
                                            {manualDraft.vibe || marketplace?.style ? (
                                                <Box>
                                                    <Typography sx={{ color: "text.secondary", fontSize: "0.84rem", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                                                        Vibe
                                                    </Typography>
                                                    <Typography sx={{ fontWeight: 700, mt: 0.5 }}>
                                                        {manualDraft.vibe || marketplace?.style}
                                                    </Typography>
                                                </Box>
                                            ) : null}
                                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                                                <Button
                                                    type="button"
                                                    variant="outlined"
                                                    disabled={!canLaunchVideoSelection || approveMarketplaceScenesPending}
                                                    onClick={onOpenScenePicker}
                                                    sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
                                                >
                                                    Generate video
                                                </Button>
                                                {selectedSceneIndices.length > 0 ? (
                                                    <Typography sx={{ color: "text.secondary", alignSelf: "center" }}>
                                                        {selectedSceneIndices.length} scene{selectedSceneIndices.length === 1 ? "" : "s"} selected for animation.
                                                    </Typography>
                                                ) : null}
                                            </Stack>
                                        </Stack>
                                    </Paper>
                                </Box>

                                {pipelineError || hasPipelineActivity ? (
                                    <Alert
                                        severity={pipelineError ? "error" : "info"}
                                        sx={{
                                            borderRadius: 3,
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
                                borderRadius: 4,
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
                                    <Typography sx={{ fontWeight: 800, color: "text.primary", fontSize: "1.02rem" }}>
                                        Generated assets
                                    </Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                        <Chip
                                            label={`${readySceneCount}/${storyboardSceneCount || sceneSlots.length} scenes`}
                                            size="small"
                                            sx={{ borderRadius: 999, bgcolor: "action.hover", color: "text.primary", fontWeight: 700 }}
                                        />
                                        <Chip
                                            label={
                                                finalVideoStatus === "ready"
                                                    ? "Video ready"
                                                    : awaitingSceneApproval
                                                      ? "Awaiting selection"
                                                      : finalVideoStatus === "processing"
                                                        ? "Video processing"
                                                        : "Video pending"
                                            }
                                            size="small"
                                            sx={{
                                                borderRadius: 999,
                                                bgcolor: finalVideoStatus === "ready" ? alpha("#FF6A1A", 0.1) : alpha("#5B61FF", 0.1),
                                                color: finalVideoStatus === "ready" ? "#C85616" : "#5B61FF",
                                                fontWeight: 700,
                                            }}
                                        />
                                    </Stack>
                                </Stack>

                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: {
                                            xs: "1fr",
                                            sm: "repeat(2, minmax(0, 1fr))",
                                            lg: "repeat(3, minmax(0, 1fr))",
                                        },
                                        gap: 2,
                                        alignItems: "start",
                                    }}
                                >
                                    {scenes.map((scene, index) => {
                                        const slot = sceneSlots[index] ?? {
                                            id: `scene-${scene.scene_index}`,
                                            title: `Scene ${scene.scene_index}`,
                                            caption: "Marketplace scene",
                                        };
                                        return <SceneCard key={slot.id} title={slot.title} caption={slot.caption} scene={scene} />;
                                    })}
                                </Box>

                                <VideoCard videoUrl={finalVideoUrl} status={finalVideoStatus} />
                            </Stack>
                        </Paper>
                    </Stack>
                </Box>
            </Box>

            <Dialog open={scenePickerOpen} onClose={() => !approveMarketplaceScenesPending && onCloseScenePicker()} maxWidth="lg" fullWidth>
                <DialogTitle>Select Scenes For Video</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Typography sx={{ color: "text.secondary" }}>
                            Choose the scenes to animate. Each selected scene adds about 8 seconds to the final video.
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Chip label={`${pendingSceneSelection.length} scenes selected`} size="small" sx={{ borderRadius: 999, fontWeight: 700 }} />
                            <Chip
                                label={`Estimated length ${formatEstimatedDuration(estimatedVideoLengthSeconds)}`}
                                size="small"
                                sx={{
                                    borderRadius: 999,
                                    fontWeight: 700,
                                    bgcolor: alpha("#5B61FF", 0.1),
                                    color: "#5B61FF",
                                }}
                            />
                        </Stack>
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    sm: "repeat(2, minmax(0, 1fr))",
                                    lg: "repeat(3, minmax(0, 1fr))",
                                },
                                gap: 2,
                            }}
                        >
                            {(storyboard?.scenes ?? []).map((scene, index) => {
                                const sceneIndex = scene.scene_index;
                                const slot = sceneSlots[index] ?? {
                                    id: `scene-${sceneIndex}`,
                                    title: `Scene ${sceneIndex}`,
                                    caption: "Marketplace scene",
                                };
                                const isActive = pendingSceneSelection.includes(sceneIndex);

                                return (
                                    <Box
                                        key={slot.id}
                                        onClick={() => onTogglePendingScene(sceneIndex)}
                                        sx={{
                                            borderRadius: 3,
                                            cursor: "pointer",
                                            border: "2px solid",
                                            borderColor: isActive ? "#5B61FF" : "transparent",
                                            boxShadow: isActive ? "0 0 0 3px rgba(91, 97, 255, 0.12)" : "none",
                                        }}
                                    >
                                        <SceneCard title={slot.title} caption={slot.caption} scene={scene} />
                                    </Box>
                                );
                            })}
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={onCloseScenePicker} disabled={approveMarketplaceScenesPending}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={onApproveScenes}
                        disabled={pendingSceneSelection.length === 0 || approveMarketplaceScenesPending || !allSceneImagesReady}
                        sx={{ borderRadius: 999, textTransform: "none", fontWeight: 800, px: 2.25 }}
                    >
                        {approveMarketplaceScenesPending ? "Scheduling..." : "Approve and generate"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
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
    const statusLabel = imageUrl ? (isSelected ? "Selected" : "Ready") : scene ? "Planned" : "Waiting";

    return (
        <Paper
            elevation={0}
            sx={{
                p: 1.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                display: "flex",
                flexDirection: "column",
                gap: 1.25,
                width: "100%",
                minWidth: 0,
                boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    aspectRatio: "4 / 5",
                    borderRadius: 2.5,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "#F6F8FC",
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
                            objectFit: "contain",
                            display: "block",
                            p: 1.25,
                            bgcolor: "background.paper",
                        }}
                    />
                ) : (
                    <Stack spacing={0.75} alignItems="center" sx={{ px: 2, textAlign: "center" }}>
                        <Box
                            sx={{
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                bgcolor: "rgba(91, 97, 255, 0.08)",
                                color: "#6B7280",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.82rem",
                                fontWeight: 700,
                            }}
                        >
                            Img
                        </Box>
                        <Typography sx={{ color: "text.secondary", fontSize: "0.84rem", lineHeight: 1.35 }}>
                            Waiting for image
                        </Typography>
                    </Stack>
                )}
            </Box>

            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1} sx={{ minWidth: 0 }}>
                <Typography
                    sx={{
                        fontWeight: 700,
                        color: "text.primary",
                        fontSize: "0.94rem",
                        lineHeight: 1.2,
                        flex: 1,
                        minWidth: 0,
                    }}
                >
                    {scene?.title || title || caption}
                </Typography>
                <Chip
                    label={statusLabel}
                    size="small"
                    sx={{
                        borderRadius: 999,
                        fontWeight: 700,
                        flexShrink: 0,
                        mt: 0.125,
                        bgcolor: imageUrl ? (isSelected ? alpha("#5B61FF", 0.1) : alpha("#FF6A1A", 0.1)) : "action.hover",
                        color: imageUrl ? (isSelected ? "#5B61FF" : "#C85616") : "text.secondary",
                    }}
                />
            </Stack>
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
        status === "ready" ? "Ready" : status === "failed" ? "Failed" : status === "processing" ? "Processing" : "Waiting";

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
                        <Chip label="Final video" size="small" sx={{ borderRadius: 999, fontWeight: 700, bgcolor: "action.hover", color: "text.primary" }} />
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
                                color: status === "ready" ? "#C85616" : status === "failed" ? "error.main" : "#5B61FF",
                            }}
                        />
                    </Stack>
                    <Box>
                        <Typography sx={{ color: "text.primary", fontWeight: 700, fontSize: "1rem" }}>
                            Final combined asset
                        </Typography>
                        <Typography sx={{ color: "text.secondary", mt: 0.75 }}>
                            Generated after the approved scene videos finish rendering.
                        </Typography>
                    </Box>
                </Stack>
            </Stack>
        </Paper>
    );
}
