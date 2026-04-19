import { useMemo } from "react";
import { Alert, Box, Button, Chip, Paper, Stack, Typography, alpha } from "@mui/material";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import { buildUrl, getDefaultHeaders } from "@/api/httpClient";
import type { MarketplaceStoryboardState, Storyboard, StoryboardScene } from "@/api/storyboard";
import type { ManualImage, ManualProductDraft, ResultSlot } from "./types";
import { formatEstimatedDuration } from "./utils";
import ReelToolbar from "./ReelToolbar";

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
    onTogglePendingScene: (sceneIndex: number) => void;
    onApproveScenes: () => void;
    onSelectAllScenes: () => void;
    onClearSceneSelection: () => void;
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
    onTogglePendingScene,
    onApproveScenes,
    onSelectAllScenes,
    onClearSceneSelection,
    sceneSlots,
}: MarketplaceWorkflowViewProps) {
    const productImage = marketplace?.product_image_url || imageUrlFromState || displayImages[0]?.previewUrl || null;
    const listingMetadata = marketplace?.listing_metadata ?? null;
    const sourceUrl = getStringMetadata(listingMetadata, "resolved_url");
    const brandLabel = deriveBrandLabel(manualDraft.title || marketplace?.product_title || storyboard?.title || "", sourceUrl);
    const titleLabel = manualDraft.title || marketplace?.product_title || storyboard?.title || "Untitled creative set";
    const workspaceTitle = "Creative workspace";
    const vibeTags = deriveVibeTags(manualDraft.vibe || marketplace?.style || null);
    const scenes = useMemo(
        () => storyboard?.scenes?.length ? storyboard.scenes : sceneSlots.map((_slot, index) => ({ scene_index: index + 1 } as StoryboardScene)),
        [sceneSlots, storyboard?.scenes]
    );
    const readyScenes = useMemo(() => scenes.filter((scene) => Boolean(scene.generated_image_url)), [scenes]);
    const selectionSet = useMemo(() => new Set(pendingSceneSelection), [pendingSceneSelection]);
    const approvedSelectionSet = useMemo(() => new Set(selectedSceneIndices), [selectedSceneIndices]);
    const totalDurationLabel = `${formatEstimatedDuration(estimatedVideoLengthSeconds)} reel`;
    const canDownloadImages = readyScenes.length > 0;

    const handleDownloadImages = async () => {
        if (typeof window === "undefined" || readyScenes.length === 0) return;

        const folderName = toSafeFileName(titleLabel || "marketplace-creative-set");
        const directoryPickerWindow = window as Window & {
            showDirectoryPicker?: (options?: { mode?: "read" | "readwrite" }) => Promise<FileSystemDirectoryHandle>;
        };

        if (!directoryPickerWindow.showDirectoryPicker) {
            window.alert("This browser does not support saving directly into a folder. Use a Chromium-based browser for folder export.");
            return;
        }

        try {
            const rootHandle = await directoryPickerWindow.showDirectoryPicker({ mode: "readwrite" });
            const exportDirectoryHandle = await rootHandle.getDirectoryHandle(folderName, { create: true });

            await Promise.all(
                readyScenes.map(async (scene, index) => {
                    const imageUrl = scene.generated_image_url;
                    if (!imageUrl) return;

                    const downloadUrl = buildUrl(
                        `/api/projects/${projectId}/assets/download?source_url=${encodeURIComponent(imageUrl)}`
                    );
                    const response = await fetch(downloadUrl, {
                        headers: getDefaultHeaders(),
                    });
                    if (!response.ok) {
                        throw new Error(`Failed to fetch image ${scene.scene_index || index + 1}`);
                    }

                    const blob = await response.blob();
                    const extension = deriveImageExtension(imageUrl, blob.type);
                    const fileHandle = await exportDirectoryHandle.getFileHandle(
                        `${String(index + 1).padStart(2, "0")}-scene-${scene.scene_index || index + 1}.${extension}`,
                        { create: true }
                    );
                    const writable = await fileHandle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                })
            );
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
                return;
            }

            const message = error instanceof Error ? error.message : "Unknown export error";
            window.alert(`Could not export images into the selected folder. ${message}`);
        }
    };

    return (
        <Box sx={{ height: "100%", width: "100%", overflow: "hidden", bgcolor: "#FFFFFF", color: "#171717" }}>
            <Box sx={{ height: "100%", overflow: "auto" }}>
                <Box sx={{ width: "100%", maxWidth: 1480, mx: "auto", px: { xs: 2, md: 3 }, pt: { xs: 2, md: 3 }, pb: { xs: 14, md: 18 } }}>
                    <Stack spacing={{ xs: 2, md: 3 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                position: "relative",
                                overflow: "hidden",
                                borderRadius: 5,
                                border: "1px solid",
                                borderColor: alpha("#221A16", 0.08),
                                bgcolor: "#FBF6F0",
                                backgroundImage:
                                    "radial-gradient(circle at 12% 18%, rgba(210, 214, 255, 0.28) 0%, transparent 26%), radial-gradient(circle at 86% 10%, rgba(255, 193, 148, 0.2) 0%, transparent 24%), linear-gradient(135deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 248, 241, 0.96) 52%, rgba(255, 241, 232, 0.98) 100%)",
                                px: { xs: 2, md: 4 },
                                py: { xs: 2, md: 3.5 },
                                boxShadow: "0 24px 60px rgba(47, 33, 22, 0.08)",
                            }}
                        >
                            <Stack spacing={{ xs: 3, md: 5 }}>
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 1.55fr) minmax(360px, 560px)" },
                                        gap: { xs: 3, md: 4 },
                                        alignItems: "end",
                                    }}
                                >
                                    <Stack spacing={2} sx={{ minWidth: 0, pb: { md: 2 } }}>
                                        <Typography
                                            sx={{
                                                fontSize: "0.82rem",
                                                letterSpacing: "0.22em",
                                                textTransform: "uppercase",
                                                color: alpha("#171717", 0.48),
                                            }}
                                        >
                                            Marketplace workflow
                                        </Typography>
                                        <Typography
                                            sx={{
                                                maxWidth: 1120,
                                                fontSize: { xs: "3.6rem", md: "5.4rem", xl: "7rem" },
                                                lineHeight: 0.92,
                                                fontWeight: 700,
                                                letterSpacing: "-0.065em",
                                                color: "#171311",
                                                textWrap: "balance",
                                            }}
                                        >
                                            {workspaceTitle}
                                        </Typography>

                                        <Typography
                                            sx={{
                                                maxWidth: 680,
                                                fontSize: { xs: "1.05rem", md: "1.28rem" },
                                                color: alpha("#171717", 0.66),
                                                lineHeight: 1.55,
                                            }}
                                        >
                                            Build the product creative here: source listing, review frames, lock the strongest scenes, and send the reel to motion.
                                        </Typography>
                                    </Stack>

                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            justifySelf: { xs: "stretch", xl: "end" },
                                            width: "100%",
                                            maxWidth: 560,
                                            borderRadius: 4,
                                            borderColor: alpha("#221A16", 0.08),
                                            bgcolor: alpha("#FFFFFF", 0.72),
                                            backdropFilter: "blur(12px)",
                                            p: { xs: 1.5, md: 2 },
                                            boxShadow: "0 16px 40px rgba(53, 34, 22, 0.08)",
                                        }}
                                    >
                                        <Stack spacing={1.75}>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Box
                                                    sx={{
                                                        width: { xs: 86, md: 104 },
                                                        height: { xs: 86, md: 104 },
                                                        borderRadius: 3,
                                                        overflow: "hidden",
                                                        border: "1px solid",
                                                        borderColor: alpha("#221A16", 0.08),
                                                        bgcolor: "#FFFFFF",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {productImage ? (
                                                        <Box
                                                            component="img"
                                                            src={productImage}
                                                            alt={titleLabel}
                                                            sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block", p: 1 }}
                                                        />
                                                    ) : (
                                                        <Typography sx={{ color: alpha("#171717", 0.44), fontSize: "0.84rem" }}>No thumb</Typography>
                                                    )}
                                                </Box>

                                                <Stack spacing={0.75} sx={{ minWidth: 0 }}>
                                                    <Typography sx={{ fontSize: "0.74rem", letterSpacing: "0.22em", textTransform: "uppercase", color: alpha("#171717", 0.56) }}>
                                                        Source listing
                                                    </Typography>
                                                    <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.08rem", md: "1.22rem" }, lineHeight: 1.1 }}>
                                                        {brandLabel}
                                                    </Typography>
                                                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                                                        <Box sx={{ color: alpha("#171717", 0.54), display: "flex", alignItems: "center" }}>
                                                            <LinkRoundedIcon sx={{ fontSize: 17 }} />
                                                        </Box>
                                                        {sourceUrl ? (
                                                            <Button
                                                                component="a"
                                                                href={sourceUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                color="inherit"
                                                                sx={{
                                                                    px: 0,
                                                                    py: 0,
                                                                    minWidth: 0,
                                                                    justifyContent: "flex-start",
                                                                    textTransform: "none",
                                                                    fontWeight: 500,
                                                                    color: alpha("#171717", 0.68),
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    whiteSpace: "nowrap",
                                                                }}
                                                            >
                                                                {sourceUrl.replace(/^https?:\/\//, "")}
                                                            </Button>
                                                        ) : (
                                                            <Typography sx={{ color: alpha("#171717", 0.68) }}>Manual upload</Typography>
                                                        )}
                                                    </Stack>
                                                </Stack>
                                            </Stack>

                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Box sx={{ flex: 1, height: 1, bgcolor: alpha("#221A16", 0.12) }} />
                                                <Typography
                                                    sx={{
                                                        px: 0.5,
                                                        fontSize: "0.78rem",
                                                        letterSpacing: "0.22em",
                                                        textTransform: "uppercase",
                                                        color: alpha("#171717", 0.62),
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {(vibeTags.length ? vibeTags : ["Editorial", "Cinematic", "DTC"]).join(" · ")}
                                                </Typography>
                                                <Box sx={{ flex: 1, height: 1, bgcolor: alpha("#221A16", 0.12) }} />
                                            </Stack>
                                            <Typography sx={{ color: alpha("#171717", 0.62), fontSize: "0.95rem", lineHeight: 1.5 }}>
                                                {titleLabel}
                                            </Typography>
                                        </Stack>
                                    </Paper>
                                </Box>

                                {pipelineError || hasPipelineActivity ? (
                                    <Alert
                                        severity={pipelineError ? "error" : "info"}
                                        sx={{
                                            borderRadius: 3,
                                            bgcolor: pipelineError ? alpha("#d32f2f", 0.06) : alpha("#4A5162", 0.06),
                                            color: pipelineError ? "error.main" : "#2E3647",
                                        }}
                                    >
                                        {pipelineError || progressLabel}
                                    </Alert>
                                ) : null}
                            </Stack>
                        </Paper>

                        <Box sx={{ px: { xs: 0, md: 0.5 } }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    position: "relative",
                                    overflow: "hidden",
                                    borderRadius: 5,
                                    border: "1px solid",
                                    borderColor: alpha("#221A16", 0.08),
                                    bgcolor: "#F7F1E9",
                                    backgroundImage:
                                        "radial-gradient(circle at top left, rgba(243, 107, 42, 0.1) 0%, transparent 24%), radial-gradient(circle at top right, rgba(210, 214, 255, 0.12) 0%, transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.58) 0%, rgba(247,241,233,0.98) 100%)",
                                    boxShadow: "0 28px 70px rgba(63, 42, 28, 0.12)",
                                    px: { xs: 1.5, md: 2.5 },
                                    pt: { xs: 2.5, md: 3 },
                                    pb: { xs: 1.5, md: 2.5 },
                                    color: "#181513",
                                }}
                            >
                                <Box
                                    aria-hidden
                                    sx={{
                                        pointerEvents: "none",
                                        position: "absolute",
                                        inset: 0,
                                        background:
                                            "linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 247, 240, 0.1) 12%, rgba(247, 241, 233, 0) 22%)",
                                    }}
                                />
                                <Stack spacing={2.5}>
                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: {
                                                xs: "1fr",
                                                md: "repeat(2, minmax(0, 1fr))",
                                                xl: "repeat(3, minmax(0, 0.9fr))",
                                            },
                                            gap: 1.5,
                                            alignItems: "start",
                                            justifyContent: "center",
                                        }}
                                    >
                                        {scenes.map((scene, index) => {
                                            const slot = sceneSlots[index] ?? {
                                                id: `scene-${scene.scene_index}`,
                                                title: `Scene ${scene.scene_index}`,
                                                caption: "Marketplace scene",
                                            };
                                            return (
                                                <ReelSceneCard
                                                    key={slot.id}
                                                    scene={scene}
                                                    slot={slot}
                                                    selected={selectionSet.has(scene.scene_index)}
                                                    approved={approvedSelectionSet.has(scene.scene_index)}
                                                    onToggle={scene.generated_image_url ? () => onTogglePendingScene(scene.scene_index) : undefined}
                                                />
                                            );
                                        })}
                                    </Box>

                                    <ReelToolbar
                                        selectedCount={pendingSceneSelection.length}
                                        totalSelectableCount={readyScenes.length}
                                        durationLabel={totalDurationLabel}
                                        onSelectAll={onSelectAllScenes}
                                        onDeselectAll={onClearSceneSelection}
                                        onDownloadImages={handleDownloadImages}
                                        onGenerateVideos={onApproveScenes}
                                        disableSelectAll={readyScenes.length === 0 || pendingSceneSelection.length === readyScenes.length}
                                        disableDeselectAll={pendingSceneSelection.length === 0}
                                        disableDownloadImages={!canDownloadImages}
                                        disableGenerateVideos={!canLaunchVideoSelection || pendingSceneSelection.length === 0 || approveMarketplaceScenesPending || !allSceneImagesReady}
                                        generateLabel={approveMarketplaceScenesPending ? "Scheduling..." : "Generate videos"}
                                    />
                                </Stack>
                            </Paper>
                        </Box>
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
}

function HeroSceneCard({
    scene,
    slot,
    selected,
    approved,
    onToggle,
}: {
    scene: StoryboardScene;
    slot?: ResultSlot;
    selected: boolean;
    approved: boolean;
    onToggle?: () => void;
}) {
    const imageUrl = scene.generated_image_url || null;
    const statusLabel = imageUrl ? (selected ? "Selected for reel" : approved ? "Locked in" : "Ready to select") : "Rendering";

    return (
        <Paper
            elevation={0}
            onClick={onToggle}
            sx={{
                borderRadius: 4,
                border: "1px solid",
                borderColor: selected ? alpha("#F36B2A", 0.72) : alpha("#221A16", 0.08),
                bgcolor: alpha("#FFFCF9", 0.7),
                overflow: "hidden",
                cursor: onToggle ? "pointer" : "default",
                backdropFilter: "blur(16px) saturate(118%)",
                boxShadow: selected ? "0 0 0 1px rgba(243, 107, 42, 0.24), 0 20px 44px rgba(63, 42, 28, 0.12)" : "0 16px 34px rgba(63, 42, 28, 0.08)",
            }}
        >
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 1.45fr) minmax(320px, 0.9fr)" },
                    gap: 0,
                }}
            >
                <SceneFrame imageUrl={imageUrl} title={scene.title || slot?.title || "Hero scene"} aspectRatio="16 / 9" />
                <Stack spacing={1.4} sx={{ p: { xs: 1.5, md: 2 } }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                        <Chip
                            label={slot?.title || `Scene ${scene.scene_index}`}
                            size="small"
                            sx={{ borderRadius: 999, fontWeight: 700, bgcolor: alpha("#181513", 0.08), color: "#181513" }}
                        />
                        <Chip
                            label={statusLabel}
                            size="small"
                            sx={{
                                borderRadius: 999,
                                fontWeight: 700,
                                bgcolor: selected ? alpha("#F36B2A", 0.12) : alpha("#181513", 0.08),
                                color: selected ? "#C65A21" : alpha("#181513", 0.68),
                            }}
                        />
                    </Stack>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.08rem", md: "1.34rem" }, lineHeight: 1.1, color: "#181513" }}>
                        {scene.title || slot?.caption || "Hero frame"}
                    </Typography>
                    <Typography sx={{ color: alpha("#181513", 0.72), lineHeight: 1.65 }}>
                        {scene.objective || scene.description || "Waiting for storyboard direction."}
                    </Typography>
                    <Typography sx={{ color: alpha("#181513", 0.58), fontSize: "0.94rem", lineHeight: 1.65 }}>
                        {scene.description || "Generated frame will appear here once the storyboard scene is ready."}
                    </Typography>
                </Stack>
            </Box>
        </Paper>
    );
}

function ReelSceneCard({
    scene,
    slot,
    selected,
    approved,
    onToggle,
}: {
    scene: StoryboardScene;
    slot: ResultSlot;
    selected: boolean;
    approved: boolean;
    onToggle?: () => void;
}) {
    const imageUrl = scene.generated_image_url || null;

    return (
        <Paper
            elevation={0}
            onClick={onToggle}
            sx={{
                position: "relative",
                p: 0,
                borderRadius: 4,
                border: "1px solid",
                borderColor: selected ? alpha("#F36B2A", 0.8) : alpha("#221A16", 0.08),
                bgcolor: alpha("#FFFCF9", 0.76),
                cursor: onToggle ? "pointer" : "default",
                overflow: "hidden",
                backdropFilter: "blur(18px) saturate(120%)",
                boxShadow: selected
                    ? "0 0 0 1px rgba(243, 107, 42, 0.18), 0 20px 42px rgba(63, 42, 28, 0.14)"
                    : "0 18px 36px rgba(63, 42, 28, 0.08)",
                "&:hover .scene-card-edit": {
                    opacity: 1,
                    transform: "translateY(0)",
                },
            }}
        >
            <Box sx={{ position: "relative" }}>
                <SceneFrame imageUrl={imageUrl} title={scene.title || slot.title} aspectRatio="4 / 5" />

                <Box
                    sx={{
                        pointerEvents: "none",
                        position: "absolute",
                        inset: 0,
                        background:
                            "linear-gradient(180deg, rgba(7, 7, 10, 0.02) 0%, rgba(7, 7, 10, 0.04) 42%, rgba(7, 7, 10, 0.58) 80%, rgba(7, 7, 10, 0.82) 100%)",
                    }}
                />

                <Button
                    className="scene-card-edit"
                    type="button"
                    variant="contained"
                    onClick={(event) => {
                        event.stopPropagation();
                    }}
                    sx={{
                        position: "absolute",
                        top: 14,
                        right: 14,
                        minWidth: 0,
                        borderRadius: 999,
                        textTransform: "none",
                        fontWeight: 700,
                        px: 1.25,
                        py: 0.65,
                        color: "#171311",
                        bgcolor: alpha("#FFFDF8", 0.92),
                        boxShadow: "0 10px 24px rgba(17, 12, 10, 0.16)",
                        opacity: 0,
                        transform: "translateY(-4px)",
                        transition: "opacity 180ms ease, transform 180ms ease",
                        "&:hover": {
                            bgcolor: "#FFFDF8",
                        },
                    }}
                >
                    Edit
                </Button>

                <Stack
                    spacing={1}
                    sx={{
                        position: "absolute",
                        left: 18,
                        right: 18,
                        bottom: 18,
                    }}
                >
                    <Chip
                        label={slot.title || `Scene ${scene.scene_index}`}
                        size="small"
                        sx={{ alignSelf: "flex-start", borderRadius: 999, fontWeight: 700, bgcolor: alpha("#FFFDF8", 0.88), color: "#181513" }}
                    />
                    <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "1.02rem", lineHeight: 1.18, textShadow: "0 2px 14px rgba(0,0,0,0.22)" }}>
                        {scene.title || slot.caption}
                    </Typography>
                    <Typography sx={{ color: alpha("#F6F1EA", 0.84), fontSize: "0.86rem", lineHeight: 1.42, textShadow: "0 2px 14px rgba(0,0,0,0.2)" }}>
                        {scene.objective || scene.description || slot.caption}
                    </Typography>
                </Stack>
            </Box>
        </Paper>
    );
}

function SceneFrame({
    imageUrl,
    title,
    aspectRatio,
}: {
    imageUrl: string | null;
    title: string;
    aspectRatio: string;
}) {
    return (
        <Box
            sx={{
                width: "100%",
                aspectRatio: aspectRatio === "4 / 5" ? "4 / 4.6" : aspectRatio,
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid",
                borderColor: alpha("#221A16", 0.08),
                bgcolor: "#F2ECE5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {imageUrl ? (
                <Box component="img" src={imageUrl} alt={title} sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
                <Stack spacing={1} alignItems="center" sx={{ color: alpha("#181513", 0.42) }}>
                    <PlayCircleOutlineRoundedIcon sx={{ fontSize: 34 }} />
                    <Typography sx={{ fontSize: "0.9rem" }}>Waiting for frame</Typography>
                </Stack>
            )}
        </Box>
    );
}

function getStringMetadata(metadata: Record<string, unknown> | null, key: string) {
    const value = metadata?.[key];
    return typeof value === "string" && value.trim() ? value.trim() : "";
}

function deriveBrandLabel(title: string, sourceUrl: string) {
    const trimmedTitle = title.trim();
    if (trimmedTitle) {
        const brandTokens = trimmedTitle.split(/\s+/).slice(0, 2).join(" ");
        if (brandTokens) return brandTokens;
    }

    if (sourceUrl) {
        try {
            const parsed = new URL(sourceUrl);
            return parsed.hostname.replace(/^www\./, "");
        } catch {
            return "Unknown brand";
        }
    }

    return "Unknown brand";
}

function deriveVibeTags(value: string | null) {
    if (!value) return [];
    return value
        .split(/[,/|]/)
        .map((tag) => tag.trim())
        .filter(Boolean);
}

function toSafeFileName(value: string) {
    const normalized = value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return normalized || "marketplace-creative-set";
}

function deriveImageExtension(imageUrl: string, mimeType: string) {
    if (mimeType === "image/png") return "png";
    if (mimeType === "image/webp") return "webp";
    if (mimeType === "image/gif") return "gif";

    const urlWithoutQuery = imageUrl.split("?")[0] || "";
    const extension = urlWithoutQuery.split(".").pop()?.toLowerCase();

    if (extension && ["jpg", "jpeg", "png", "webp", "gif"].includes(extension)) {
        return extension === "jpeg" ? "jpg" : extension;
    }

    return "jpg";
}
