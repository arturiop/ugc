import { PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppBar, Avatar, Box, Button, IconButton, Stack, Toolbar, Typography } from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import WorkspacePane from "../components/workspace/WorkspacePane";
import SettingsDialog from "@/components/SettingsDialog";
import { getSessionId } from "@/utils/session";
import { ProjectChat } from "@/components/chat/Chat";

type ResizableSplitProps = PropsWithChildren<{
    left: React.ReactNode;
    right: React.ReactNode;
    initialLeftPct?: number;
    minLeftPct?: number;
    maxLeftPct?: number;
}>;

function ResizableSplit({ left, right, initialLeftPct = 30, minLeftPct = 20, maxLeftPct = 60 }: ResizableSplitProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const draggingRef = useRef(false);

    const [leftPct, setLeftPct] = useState(initialLeftPct);

    const clamp = (v: number) => Math.max(minLeftPct, Math.min(maxLeftPct, v));

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (!draggingRef.current) return;
            const el = containerRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const pct = (x / rect.width) * 100;
            setLeftPct(clamp(pct));
        };

        const onUp = () => {
            draggingRef.current = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, []);

    const leftStyle = useMemo(() => ({ flex: `${leftPct} 1 0px` }), [leftPct]);
    const rightStyle = useMemo(() => ({ flex: `${100 - leftPct} 1 0px` }), [leftPct]);

    return (
        <Box
            ref={containerRef}
            sx={{
                display: "flex",
                height: "100%",
                minHeight: 0,
                width: "100%",
                overflow: "hidden",
                bgcolor: "background.default",
            }}>
            {/* Left panel */}
            <Box sx={{ ...leftStyle, minWidth: 320, overflow: "hidden", display: "flex" }}>{left}</Box>

            {/* Resize handle */}
            <Box
                role="separator"
                tabIndex={0}
                onMouseDown={() => {
                    draggingRef.current = true;
                    document.body.style.cursor = "col-resize";
                    document.body.style.userSelect = "none";
                }}
                sx={{
                    width: 10,
                    position: "relative",
                    cursor: "col-resize",
                    flex: "0 0 auto",
                    "&::after": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: "50%",
                        width: 2,
                        transform: "translateX(-50%)",
                        bgcolor: "divider",
                        opacity: 0.6,
                    },
                    "&:hover::after": { opacity: 1 },
                }}
            />

            {/* Right panel */}
            <Box sx={{ ...rightStyle, minWidth: 420, overflow: "hidden", display: "flex" }}>{right}</Box>
        </Box>
    );
}

function ProjectPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [localProjectId, setLocalProjectId] = useState<string | null>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const hasCreatedRef = useRef(false);
    const createKeyRef = useRef<string | null>(null);
    const API_BASE_URL = import.meta.env.VITE_APP_NGROK || "http://localhost:5050";
    const [projectName, setProjectName] = useState<string | null>(null);

    const createProject = async () => {
        if (isCreatingProject) return;
        setIsCreatingProject(true);
        if (!createKeyRef.current) {
            createKeyRef.current = crypto.randomUUID();
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/project`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Session-Id": getSessionId(),
                    "X-Idempotency-Key": createKeyRef.current,
                },
                body: JSON.stringify({}),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to create project.");
            }
            const payload = (await response.json()) as { id?: string };
            if (!payload.id) throw new Error("Project creation response missing id.");
            setLocalProjectId(payload.id);
            navigate(`/project/${payload.id}`);
        } finally {
            setIsCreatingProject(false);
        }
    };

    const createNewProject = () => {
        createProject().catch((error) => {
            console.error("Failed to create project:", error);
        });
    };

    useEffect(() => {
        if (projectId) return;
        if (hasCreatedRef.current) return;
        hasCreatedRef.current = true;
        createProject().catch((error) => {
            console.error("Failed to create project:", error);
        });
    }, [projectId, navigate]);

    useEffect(() => {
        let cancelled = false;
        if (!projectId) {
            setProjectName(null);
            return;
        }

        const loadProject = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/project/${projectId}`, {
                    headers: { "X-Session-Id": getSessionId() },
                });
                if (!response.ok) return;
                const data = (await response.json()) as { name?: string };
                if (!cancelled) {
                    setProjectName(data.name || null);
                }
            } catch {
                if (!cancelled) setProjectName(null);
            }
        };

        loadProject();
        return () => {
            cancelled = true;
        };
    }, [API_BASE_URL, projectId]);

    const resolvedProjectId = projectId ?? localProjectId;

    if (!resolvedProjectId) return null;

    return (
        <Box sx={{ height: "100dvh", width: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
                <Toolbar
                    sx={{
                        minHeight: { xs: 56 },
                        px: 2,
                        display: "flex",
                        justifyContent: "space-between",
                    }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                        <Avatar src="/favicon-32x32.png" alt="Project icon" sx={{ width: 36, height: 36, border: "1px solid", borderColor: "divider" }} />
                        {projectName && (
                            <Typography variant="h5" sx={{ textTransform: "uppercase" }} noWrap>
                                {projectName}
                            </Typography>
                        )}
                    </Stack>
                    <Box sx={{ flex: 1 }} />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<EditOutlinedIcon />}
                            sx={{ borderRadius: 999, textTransform: "none", fontWeight: 600 }}
                            onClick={createNewProject}
                            disabled={isCreatingProject}>
                            New project
                        </Button>
                        <IconButton size="small" aria-label="Open settings" onClick={() => setSettingsOpen(true)}>
                            <SettingsOutlinedIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                        <IconButton size="small" sx={{ p: 0 }}>
                            <Avatar sx={{ width: 32, height: 32 }} alt="avatar" src="" />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
                <ResizableSplit left={<ProjectChat key={resolvedProjectId} projectId={resolvedProjectId} />} right={<WorkspacePane key={resolvedProjectId} />} />
            </Box>

            <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </Box>
    );
}

export default ProjectPage;
