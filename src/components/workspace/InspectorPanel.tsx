import { Box, Card, CardContent, Chip, CircularProgress, Divider, Popover, Portal, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useMemo, useRef, useState } from "react";
import type { Storyboard, StoryboardScene } from "@/api/storyboard";
import type { WorkspaceMode } from "./WorkspaceHeader";

type InspectorPanelProps = {
    mode: WorkspaceMode;
    storyboard: Storyboard | null;
    scene: StoryboardScene | null;
    isRefreshing?: boolean;
};

const TABS = ["Visual", "Script", "Motion", "Prompt"] as const;
type InspectorTab = (typeof TABS)[number];

const InspectorPanel = ({ mode, storyboard, scene, isRefreshing = false }: InspectorPanelProps) => {
    const [activeTab, setActiveTab] = useState<InspectorTab>("Visual");
    const statusLabel = useMemo(() => {
        if (!scene?.video_status) return "Draft";
        if (scene.video_status === "not_started") return "Draft";
        return scene.video_status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }, [scene]);

    return (
        <Box
            sx={{
                width: 340,
                minWidth: 300,
                borderLeft: "1px solid",
                borderColor: "divider",
                bgcolor: "background.neutral",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {mode === "brief" ? (
                <BriefInspector storyboard={storyboard} />
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
                    <SceneHeader scene={scene} statusLabel={statusLabel} />
                    <Tabs
                        value={activeTab}
                        onChange={(_, value) => setActiveTab(value)}
                        variant="fullWidth"
                        sx={{
                            minHeight: 40,
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            "& .MuiTab-root": { minHeight: 40, textTransform: "none", fontWeight: 600 },
                            "& .MuiTab-root.Mui-selected": { color: "secondary.main" },
                            "& .MuiTabs-indicator": { backgroundColor: "secondary.main" },
                        }}
                    >
                        {TABS.map((tab) => (
                            <Tab key={tab} value={tab} label={tab} />
                        ))}
                    </Tabs>
                    <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 2.5 }}>
                        {activeTab === "Visual" && (
                            <VisualTab scene={scene} storyboard={storyboard} isRefreshing={isRefreshing} />
                        )}
                        {activeTab === "Script" && <ScriptTab scene={scene} />}
                        {activeTab === "Motion" && <MotionTab scene={scene} />}
                        {activeTab === "Prompt" && <PromptTab scene={scene} />}
                    </Box>
                </Box>
            )}
        </Box>
    );
};

const SceneHeader = ({ scene, statusLabel }: { scene: StoryboardScene | null; statusLabel: string }) => {
    if (!scene) {
        return (
            <Box sx={{ px: 2, py: 2, borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                <Typography variant="body2" color="text.secondary">
                    Select a scene to inspect details.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ px: 2, py: 2, borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
            <Stack spacing={0.5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Typography variant="subtitle2" fontWeight={700}>
                        Scene {scene.scene_index}
                    </Typography>
                    <Chip size="small" label={statusLabel} />
                </Stack>
                <Typography variant="body2" fontWeight={600}>
                    {scene.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {scene.objective}
                </Typography>
            </Stack>
        </Box>
    );
};

const VisualTab = ({
    scene,
    storyboard,
    isRefreshing,
}: {
    scene: StoryboardScene | null;
    storyboard: Storyboard | null;
    isRefreshing: boolean;
}) => {
    if (!scene) {
        return (
            <Typography variant="body2" color="text.secondary">
                No scene selected.
            </Typography>
        );
    }

    return <VisualTabContent scene={scene} storyboard={storyboard} isRefreshing={isRefreshing} />;
};

const VisualTabContent = ({
    scene,
    storyboard,
    isRefreshing,
}: {
    scene: StoryboardScene;
    storyboard: Storyboard | null;
    isRefreshing: boolean;
}) => {
    const hasImage = Boolean(storyboard?.storyboard_image_url || scene.generated_image_url);
    const isPreviewGenerating = !hasImage && Boolean(scene.title || scene.objective || scene.description || storyboard);
    const showShimmer = !hasImage && (isRefreshing || isPreviewGenerating);
    const previewSrc = storyboard?.storyboard_image_url ?? scene.generated_image_url ?? null;
    const [previewAnchorEl, setPreviewAnchorEl] = useState<HTMLElement | null>(null);
    const closeTimeoutRef = useRef<number | null>(null);

    const handlePreviewOpen = (event?: React.MouseEvent<HTMLElement>) => {
        if (closeTimeoutRef.current) {
            window.clearTimeout(closeTimeoutRef.current);
        }
        if (event?.currentTarget) {
            setPreviewAnchorEl(event.currentTarget);
        }
    };

    const schedulePreviewClose = () => {
        closeTimeoutRef.current = window.setTimeout(() => {
            setPreviewAnchorEl(null);
        }, 220);
    };

    const handlePreviewClose = () => {
        if (closeTimeoutRef.current) {
            window.clearTimeout(closeTimeoutRef.current);
        }
        setPreviewAnchorEl(null);
    };
    const isPreviewOpen = Boolean(previewAnchorEl);

    return (
        <Stack spacing={2}>
            <Card elevation={0} sx={{ borderRadius: 2.5, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                <Box
                    sx={{
                        height: 180,
                        bgcolor: "background.paper",
                        display: "grid",
                        placeItems: "center",
                        overflow: "hidden",
                        position: "relative",
                    }}
                    onMouseEnter={previewSrc ? handlePreviewOpen : undefined}
                    onMouseLeave={previewSrc ? schedulePreviewClose : undefined}
                >
                    {showShimmer && (
                        <Box
                            sx={{
                                position: "absolute",
                                inset: 0,
                                backgroundColor: "rgba(0,0,0,0.03)",
                                backgroundImage: "linear-gradient(120deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 65%)",
                                opacity: 0.75,
                                backgroundSize: "180% 100%",
                                animation: "shimmer 1.4s linear infinite",
                                pointerEvents: "none",
                                "@keyframes shimmer": {
                                    "0%": { backgroundPosition: "-150% 0" },
                                    "100%": { backgroundPosition: "150% 0" },
                                },
                            }}
                            
                        />
                    )}
                    {previewSrc ? (
                        <Box
                            component="img"
                            src={previewSrc}
                            alt={scene.title || "Storyboard"}
                            sx={{ width: "350px", height: "170px", objectFit: "contain", display: "block" }}
                        />
                    ) : (
                        <Stack spacing={1} alignItems="center" sx={{ color: "text.secondary" }}>
                            {showShimmer && <CircularProgress size={18} />}
                            <Typography variant="caption" color="text.secondary">
                                {showShimmer ? "Generating preview..." : "No preview available"}
                            </Typography>
                        </Stack>
                    )}
                </Box>
            </Card>
            {isPreviewOpen && (
                <Portal>
                    <Box
                        sx={(theme) => ({
                            position: "fixed",
                            inset: 0,
                            backdropFilter: "blur(6px)",
                            WebkitBackdropFilter: "blur(6px)",
                            backgroundColor: "rgba(15, 15, 15, 0.08)",
                            zIndex: theme.zIndex.modal - 1,
                            pointerEvents: "none",
                        })}
                    />
                </Portal>
            )}
            {previewSrc && (
                <Popover
                    open={isPreviewOpen}
                    anchorEl={previewAnchorEl}
                    onClose={handlePreviewClose}
                    disableAutoFocus
                    disableEnforceFocus
                    disableRestoreFocus
                    anchorOrigin={{ vertical: "center", horizontal: "right" }}
                    transformOrigin={{ vertical: "center", horizontal: "left" }}
                    slotProps={{
                        paper: {
                            onMouseEnter: handlePreviewOpen,
                            onMouseLeave: schedulePreviewClose,
                            sx: {
                                mt: 4,
                                bgcolor: "transparent",
                                boxShadow: "none",
                                border: "none",
                                overflow: "visible",
                                p: 0,
                            },
                        },
                    }}
                >
                    <Box
                        component="img"
                        src={previewSrc}
                        alt={scene.title || "Storyboard preview"}
                        sx={{
                            maxWidth: "75vw",
                            maxHeight: "75vh",
                            width: "auto",
                            height: "auto",
                            display: "block",
                        }}
                    />
                </Popover>
            )}
            <Box>
                <Typography variant="caption" color="text.secondary">
                    Frame prompt
                </Typography>
                <Typography variant="body2">{scene.frame_prompt}</Typography>
            </Box>
        </Stack>
    );
};

const ScriptTab = ({ scene }: { scene: StoryboardScene | null }) => {
    if (!scene) {
        return (
            <Typography variant="body2" color="text.secondary">
                No scene selected.
            </Typography>
        );
    }

    return (
        <Stack spacing={1.5}>
            <Typography variant="caption" color="text.secondary">
                Script
            </Typography>
            <Card elevation={0} sx={{ borderRadius: 2.5, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                <CardContent>
                    <Typography variant="body2">{scene.script}</Typography>
                </CardContent>
            </Card>
        </Stack>
    );
};

const MotionTab = ({ scene }: { scene: StoryboardScene | null }) => {
    if (!scene) {
        return (
            <Typography variant="body2" color="text.secondary">
                No scene selected.
            </Typography>
        );
    }

    return (
        <Stack spacing={1.5}>
            <Typography variant="caption" color="text.secondary">
                Motion prompt
            </Typography>
            <Card elevation={0} sx={{ borderRadius: 2.5, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                <CardContent>
                    <Typography variant="body2">
                        {scene.video_prompt || "No video prompt available yet."}
                    </Typography>
                </CardContent>
            </Card>
            <Box>
                <Typography variant="caption" color="text.secondary">
                    Transition prompt
                </Typography>
                <Typography variant="body2">
                    {scene.transition_prompt || "No transition guidance for this scene yet."}
                </Typography>
            </Box>
        </Stack>
    );
};

const PromptTab = ({ scene }: { scene: StoryboardScene | null }) => {
    if (!scene) {
        return (
            <Typography variant="body2" color="text.secondary">
                No scene selected.
            </Typography>
        );
    }

    return (
        <Stack spacing={1.5}>
            <Typography variant="caption" color="text.secondary">
                Visual prompt
            </Typography>
            <Card elevation={0} sx={{ borderRadius: 2.5, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                <CardContent>
                    <Typography variant="body2">{scene.visual_prompt}</Typography>
                </CardContent>
            </Card>
            <Box>
                <Typography variant="caption" color="text.secondary">
                    Frame prompt
                </Typography>
                <Typography variant="body2">{scene.frame_prompt}</Typography>
            </Box>
        </Stack>
    );
};

const BriefInspector = ({ storyboard }: { storyboard: Storyboard | null }) => {
    if (!storyboard) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    No brief available yet.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2, overflowY: "auto" }}>
            <Stack spacing={2.5}>
                <Box>
                    <Typography variant="overline" sx={{ letterSpacing: 1.4, fontWeight: 700, color: "text.secondary" }}>
                        Messaging
                    </Typography>
                    <Stack spacing={1.25} sx={{ mt: 1.5 }}>
                        <LabeledValue label="Hook" value={storyboard.hook} />
                        <LabeledValue label="Key message" value={storyboard.key_message} />
                        <LabeledValue label="CTA" value={storyboard.cta} />
                    </Stack>
                </Box>

                {storyboard.assumptions && storyboard.assumptions.length > 0 && (
                    <Box>
                        <Typography variant="overline" sx={{ letterSpacing: 1.4, fontWeight: 700, color: "text.secondary" }}>
                            Assumptions
                        </Typography>
                        <Stack spacing={1} sx={{ mt: 1.5 }}>
                            {storyboard.assumptions.map((item, index) => (
                                <Card
                                    key={`${item}-${index}`}
                                    elevation={0}
                                    sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
                                >
                                    <CardContent sx={{ py: 1.25 }}>
                                        <Typography variant="body2">{item}</Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    </Box>
                )}
            </Stack>
        </Box>
    );
};

export default InspectorPanel;

const LabeledValue = ({ label, value }: { label: string; value?: string }) => {
    return (
        <Box>
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="body2">{value || "Not set"}</Typography>
        </Box>
    );
};
