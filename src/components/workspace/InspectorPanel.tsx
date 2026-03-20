import { Box, Card, CardContent, Chip, Divider, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import type { Storyboard, StoryboardScene } from "@/api/storyboard";
import type { WorkspaceMode } from "./WorkspaceHeader";

type InspectorPanelProps = {
    mode: WorkspaceMode;
    storyboard: Storyboard | null;
    scene: StoryboardScene | null;
};

const TABS = ["Visual", "Script", "Motion", "Prompt"] as const;
type InspectorTab = (typeof TABS)[number];

const InspectorPanel = ({ mode, storyboard, scene }: InspectorPanelProps) => {
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
                bgcolor: "background.paper",
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
                        }}
                    >
                        {TABS.map((tab) => (
                            <Tab key={tab} value={tab} label={tab} />
                        ))}
                    </Tabs>
                    <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 2.5 }}>
                        {activeTab === "Visual" && <VisualTab scene={scene} storyboard={storyboard} />}
                        {activeTab === "Script" && <ScriptTab scene={scene} />}
                        {activeTab === "Motion" && <MotionTab />}
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
            <Box sx={{ px: 2, py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                <Typography variant="body2" color="text.secondary">
                    Select a scene to inspect details.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ px: 2, py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
            <Stack spacing={0.5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Typography variant="subtitle2" fontWeight={700}>
                        Scene {scene.scene_index + 1}
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

const VisualTab = ({ scene, storyboard }: { scene: StoryboardScene | null; storyboard: Storyboard | null }) => {
    if (!scene) {
        return (
            <Typography variant="body2" color="text.secondary">
                No scene selected.
            </Typography>
        );
    }

    return (
        <Stack spacing={2}>
            <Card elevation={0} sx={{ borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
                <Box
                    sx={{
                        height: 180,
                        bgcolor: "background.default",
                        display: "grid",
                        placeItems: "center",
                        overflow: "hidden",
                    }}
                >
                    {storyboard?.storyboard_image_url ? (
                        <Box
                            component="img"
                            src={storyboard.storyboard_image_url}
                            alt="Storyboard"
                            sx={{ width: "350px", height: "170px", objectFit: "contain", display: "block" }}
                        />
                    ) : scene.generated_image_url ? (
                        <Box
                            component="img"
                            src={scene.generated_image_url}
                            alt={scene.title}
                            sx={{ width: "350px", height: "170px", objectFit: "contain", display: "block" }}
                        />
                    ) : (
                        <Typography variant="caption" color="text.secondary">
                            No preview available
                        </Typography>
                    )}
                </Box>
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
            <Card elevation={0} sx={{ borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
                <CardContent>
                    <Typography variant="body2">{scene.script}</Typography>
                </CardContent>
            </Card>
        </Stack>
    );
};

const MotionTab = () => {
    return (
        <Stack spacing={1.5}>
            <Typography variant="caption" color="text.secondary">
                Motion settings
            </Typography>
            <Stack spacing={1}>
                {["Pacing", "Transitions", "Camera"].map((label) => (
                    <Card key={label} elevation={0} sx={{ borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
                        <CardContent sx={{ py: 1.5 }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    {label}
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                    Auto
                                </Typography>
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
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
            <Card elevation={0} sx={{ borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
                <CardContent>
                    <Typography variant="body2">{scene.visual_prompt}</Typography>
                </CardContent>
            </Card>
            <Divider />
            <Typography variant="caption" color="text.secondary">
                Frame prompt
            </Typography>
            <Card elevation={0} sx={{ borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
                <CardContent>
                    <Typography variant="body2">{scene.frame_prompt}</Typography>
                </CardContent>
            </Card>
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
                                    sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}
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
