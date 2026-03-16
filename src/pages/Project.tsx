import { Box } from "@mui/material";
import WorkspacePane from "../components/workspace/WorkspacePane";
import { ProjectChat } from "@/components/chat/Chat";
import { ProjectProvider } from "@/contexts/Project/ProjectProvider";
import ResizableSplit from "@/components/ResizableSplit";
import { useProject } from "@/contexts/Project/ProjectContext";
import { GeneratedContentProvider } from "@/contexts/GeneratedContentContext";
import AppHeader from "@/components/AppHeader";


function ProjectLayout() {
    const { projectId } = useProject();

    return (
        <Box sx={{ height: "100dvh", width: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <AppHeader />
            <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
                <GeneratedContentProvider>
                    <ResizableSplit left={projectId && <ProjectChat />} right={<WorkspacePane />} />
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
