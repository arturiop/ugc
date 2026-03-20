import { Box, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import AssetsPane from "./AssetsPane";
import GeneratedContentPanel from "@/components/GeneratedContentPanel";
import WorkspaceHeader, { WorkspaceMode } from "./WorkspaceHeader";
import { useProject } from "@/contexts/Project/ProjectContext";
import { useProjectStoryboard } from "@/api/storyboard/hooks";
import BriefMode from "./BriefMode";
import StoryboardMode from "./StoryboardMode";
import SceneGenMode from "./SceneGenMode";
import FinalVideoMode from "./FinalVideoMode";
import InspectorPanel from "./InspectorPanel";

const VIEW_MODES = ["studio", "assets", "generated_content"] as const;
type ViewMode = (typeof VIEW_MODES)[number];

const resolveViewMode = (value: string | null): ViewMode => {
    if (value === "uploads") return "assets";
    if (value && (VIEW_MODES as readonly string[]).includes(value)) return value as ViewMode;
    return "studio";
};

const WorkspacePane = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeView = resolveViewMode(searchParams.get("viewMode"));
    const { projectId, projectName, currentStage } = useProject();
    const { data: storyboardData, isFetching: isRefreshing, refetch } = useProjectStoryboard(projectId);
    const storyboard = storyboardData?.storyboard ?? null;
    const [mode, setMode] = useState<WorkspaceMode>("brief");
    const [hasInitializedMode, setHasInitializedMode] = useState(false);
    const scenes = useMemo(() => storyboard?.scenes ?? [], [storyboard]);
    const [selectedSceneIndex, setSelectedSceneIndex] = useState<number | null>(null);
    const selectedScene = scenes.find((scene) => scene.scene_index === selectedSceneIndex) ?? scenes[0] ?? null;
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
    const [centerPortalTarget, setCenterPortalTarget] = useState<HTMLElement | null>(null);
    const projectTitle = projectName || storyboard?.title || "Project";

    const resolveInitialMode = (stage: string | null, draft: typeof storyboard): WorkspaceMode => {
        if (stage === "scene_generation") return "scenegen";
        if (stage === "combine_scenes" || stage === "tags_and_upload") return "final";
        if (stage === "storyboard") return "storyboard";
        if (draft?.scenes?.some((scene) => scene.generated_video_url || (scene.video_status && scene.video_status !== "not_started"))) {
            return "scenegen";
        }
        if (draft?.storyboard_image_url || (draft?.scenes && draft.scenes.length > 0)) {
            return "storyboard";
        }
        return "brief";
    };

    useEffect(() => {
        setHasInitializedMode(false);
    }, [projectId]);

    useEffect(() => {
        if (hasInitializedMode) return;
        if (!currentStage && !storyboard) return;
        setMode(resolveInitialMode(currentStage, storyboard));
        setHasInitializedMode(true);
    }, [currentStage, storyboard, hasInitializedMode]);
    useEffect(() => {
        if (!scenes.length) {
            setSelectedSceneIndex(null);
            return;
        }

        if (selectedSceneIndex === null || !scenes.some((scene) => scene.scene_index === selectedSceneIndex)) {
            setSelectedSceneIndex(scenes[0].scene_index);
        }
    }, [scenes, selectedSceneIndex]);

    useEffect(() => {
        setPortalTarget(document.getElementById("app-header-portal"));
        setCenterPortalTarget(document.getElementById("app-header-center-portal"));
    }, []);

    const handleRefresh = () => {
        if (projectId) {
            void refetch();
        }
    };

    const setViewMode = (next: ViewMode) => {
        const nextParams = new URLSearchParams(searchParams);
        if (next === "studio") {
            nextParams.delete("viewMode");
        } else {
            nextParams.set("viewMode", next);
        }
        setSearchParams(nextParams);
    };

    const renderMode = () => {
        switch (mode) {
            case "brief":
                return <BriefMode storyboard={storyboard} />;
            case "storyboard":
                return (
                    <StoryboardMode
                        storyboard={storyboard}
                        selectedSceneIndex={selectedSceneIndex}
                        onSelectScene={setSelectedSceneIndex}
                    />
                );
            case "scenegen":
                return (
                    <SceneGenMode
                        storyboard={storyboard}
                        selectedSceneIndex={selectedSceneIndex}
                        onSelectScene={setSelectedSceneIndex}
                    />
                );
            case "final":
                return <FinalVideoMode storyboard={storyboard} />;
            default:
                return null;
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1, position: "relative" }}>
            {portalTarget &&
                createPortal(
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                        {projectTitle}
                    </Typography>,
                    portalTarget
                )}
            {centerPortalTarget &&
                createPortal(
                    <Box sx={{ pointerEvents: "auto" }}>
                        <WorkspaceHeader
                            mode={mode}
                            activeView={activeView}
                            onModeChange={setMode}
                            onViewChange={setViewMode}
                            onRefresh={handleRefresh}
                            isRefreshing={isRefreshing}
                        />
                    </Box>,
                    centerPortalTarget
                )}

            {activeView === "studio" ? (
                <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden", bgcolor: "background.default", display: "flex" }}>
                    <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, overflow: "hidden" }}>{renderMode()}</Box>
                    {(mode !== "final" && mode !== "brief") && (
                        <InspectorPanel mode={mode} storyboard={storyboard} scene={selectedScene} />
                    )}
                </Box>
            ) : (
                <Box sx={{ p: 2.5, flex: 1, overflowY: "auto", bgcolor: "background.default" }}>
                    {activeView === "assets" && <AssetsPane />}
                    {activeView === "generated_content" && <GeneratedContentPanel />}
                </Box>
            )}
        </Box>
    );
};

export default WorkspacePane;
