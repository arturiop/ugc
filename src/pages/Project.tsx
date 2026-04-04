import { Box, useMediaQuery, useTheme } from "@mui/material";
import WorkspacePane from "../components/workspace/WorkspacePane";
import { ProjectChat } from "@/components/chat/Chat";
import { ProjectProvider } from "@/contexts/Project/ProjectProvider";
import ResizableSplit from "@/components/ResizableSplit";
import { useProject } from "@/contexts/Project/ProjectContext";
import { GeneratedContentProvider } from "@/contexts/GeneratedContentContext";
import AppHeader from "@/components/AppHeader";

function ProjectLayout() {
    const { projectId } = useProject();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    return (
        <Box
            sx={{
                height: "100dvh",
                width: "100%",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                bgcolor: "background.default",
                color: "text.primary",
                backgroundImage:
                    "linear-gradient(180deg, rgba(91,97,255,0.05) 0%, rgba(255,106,26,0.03) 100%)",
            }}
        >
            <AppHeader />
            <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
                <GeneratedContentProvider>
                    {isMobile ? (
                        <Box sx={{ height: "100%", width: "100%", minHeight: 0 }}>
                            {projectId && <ProjectChat />}
                        </Box>
                    ) : (
                        <ResizableSplit left={projectId && <ProjectChat />} right={<WorkspacePane />} />
                    )}
                </GeneratedContentProvider>
            </Box>
        </Box>
    );
}

function ProjectPage() {
    return (
        <ProjectProvider>
            <ProjectLayout />
        </ProjectProvider>
    );
}

export default ProjectPage;
