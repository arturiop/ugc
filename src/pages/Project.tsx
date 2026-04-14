import { Box, Button, CircularProgress, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useParams } from "react-router-dom";
import WorkspacePane from "../components/workspace/WorkspacePane";
import { ProjectChat } from "@/components/chat/Chat";
import { ProjectProvider } from "@/contexts/Project/ProjectProvider";
import ResizableSplit from "@/components/ResizableSplit";
import { useProject } from "@/contexts/Project/ProjectContext";
import { useProject as useProjectQuery } from "@/api/projects/hooks";
import { GeneratedContentProvider } from "@/contexts/GeneratedContentContext";
import { GenerationPlaceholderProvider } from "@/contexts/GenerationPlaceholderContext";
import { ProjectType } from "@/api/projects";
import { HttpError } from "@/api/httpClient";
import { useAuthStore } from "@/stores/useAuthStore";

function ProjectLayout() {
    const { projectId, projectType } = useProject();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const shouldHideWorkspace = projectType === ProjectType.SatisfactionVideo;

    return (
        <Box
            sx={{
                height: "100%",
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
            <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
                <GeneratedContentProvider>
                    <GenerationPlaceholderProvider>
                        {isMobile || shouldHideWorkspace ? (
                            <Box
                                sx={{
                                    height: "100%",
                                    width: "100%",
                                    minHeight: 0,
                                }}
                            >
                                {projectId && <ProjectChat />}
                            </Box>
                        ) : (
                            <ResizableSplit left={projectId && <ProjectChat />} right={<WorkspacePane />} />
                        )}
                    </GenerationPlaceholderProvider>
                </GeneratedContentProvider>
            </Box>
        </Box>
    );
}

function SharedProjectAccessState({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    const logout = useAuthStore((s) => s.logout);

    return (
        <Box
            sx={{
                height: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                bgcolor: "background.default",
            }}
        >
            <Box sx={{ flex: 1, display: "grid", placeItems: "center", p: 3 }}>
                <Stack spacing={2} sx={{ maxWidth: 420, textAlign: "center" }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {title}
                    </Typography>
                    <Typography color="text.secondary">{description}</Typography>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            logout();
                            window.location.assign("/");
                        }}
                    >
                        Return home
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}

function SharedProjectPageBody() {
    const { projectId } = useParams();
    const { data, isLoading, error } = useProjectQuery(projectId ?? null, { retry: false });

    if (isLoading) {
        return (
            <Box sx={{ height: "100%", width: "100%", display: "grid", placeItems: "center" }}>
                <CircularProgress size={28} />
            </Box>
        );
    }

    if (error instanceof HttpError) {
        if (error.status === 401) {
            return (
                <SharedProjectAccessState
                    title="Share link expired"
                    description="This project link is no longer valid. Ask the project owner to generate a new one."
                />
            );
        }

        if (error.status === 403) {
            return (
                <SharedProjectAccessState
                    title="Project access denied"
                    description="This share link can only open its original project."
                />
            );
        }

        if (error.status === 404) {
            return (
                <SharedProjectAccessState
                    title="Project not found"
                    description="The shared project is no longer available."
                />
            );
        }
    }

    if (!data) {
        return (
            <SharedProjectAccessState
                title="Unable to open project"
                description="The share link could not be resolved."
            />
        );
    }

    return (
        <ProjectProvider>
            <ProjectLayout />
        </ProjectProvider>
    );
}

type ProjectPageProps = {
    sharedMode?: boolean;
};

function ProjectPage({ sharedMode = false }: ProjectPageProps) {
    if (sharedMode) {
        return <SharedProjectPageBody />;
    }

    return (
        <ProjectProvider>
            <ProjectLayout />
        </ProjectProvider>
    );
}

export default ProjectPage;
