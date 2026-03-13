import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Box, Typography, Button, Card, CardContent, CardMedia, CardActionArea, IconButton, Skeleton, Stack, TextField } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

import { resolveAssetUrl } from "@/api/urls";
import { useCreateProject, useProjects } from "@/api/projects/hooks";
import { useAuthStore } from "@/stores/useAuthStore";
import AppHeader from "@/components/AppHeader";

export default function Dashboard() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const [prompt, setPrompt] = useState("");
    const [showInput, setShowInput] = useState(true);

    const lastScroll = useRef(0);
    const { data, isLoading } = useProjects();
    const createProject = useCreateProject();

    const displayName = useMemo(() => {
        const name = user?.full_name?.trim();
        if (name) return name;
        const email = user?.email?.trim();
        if (email) return email.split("@")[0];
        return "there";
    }, [user?.full_name, user?.email]);

    useEffect(() => {
        const onScroll = () => {
            const current = window.scrollY;

            if (current > lastScroll.current + 10) setShowInput(false);
            else if (current < lastScroll.current - 10) setShowInput(true);

            lastScroll.current = current;
        };

        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    async function handleCreateProject() {
        try {
            const data = await createProject.mutateAsync();
            const id = data?.short_id || data?.uuid;

            if (id) {
                navigate(`/projects/${id}`);
            } else {
                console.error("Project created but id missing", data);
            }
        } catch (err) {
            console.error("Failed to create project", err);
        }
    }

    const projects = data?.items ?? [];
    const sorted = useMemo(() => {
        return [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }, [projects]);

    return (
        <Box sx={{ height: "100dvh", width: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <AppHeader />
            <Box sx={{ width: "100%", mx: "auto", px: 4, }}>
            {/* HEADER */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 4,
                }}>
                <Box>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Hello. {displayName}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        My Projects
                    </Typography>

                    <Typography color="text.secondary">Continue working or start a new idea</Typography>
                </Box>

                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    sx={{
                        borderRadius: 999,
                        px: 3,
                        bgcolor: "#111",
                        "&:hover": { bgcolor: "#000" },
                    }}
                    onClick={handleCreateProject}
                    disabled={createProject.isPending}>
                    New Ad
                </Button>
            </Box>

            {/* PROJECT GRID */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
                    gap: 3,
                }}>
                {isLoading &&
                    Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} sx={{ borderRadius: 3 }}>
                            <Skeleton variant="rectangular" height={160} />
                            <CardContent>
                                <Skeleton width="70%" />
                                <Skeleton width="40%" />
                            </CardContent>
                        </Card>
                    ))}

                {!isLoading &&
                    sorted.map((project) => {
                        const thumb = resolveAssetUrl(project.thumbnailUrl);

                        return (
                            <Card
                                key={project.id}
                                sx={{
                                    borderRadius: 3,
                                    overflow: "hidden",
                                    position: "relative",
                                    transition: "all .15s ease",
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: "0 18px 40px rgba(0,0,0,0.08)",
                                    },
                                    "&:hover .hover-actions": {
                                        opacity: 1,
                                    },
                                }}>
                                <CardActionArea component="div" onClick={() => navigate(`/projects/${project.id}`)}>
                                    <Box sx={{ position: "relative" }}>
                                        {thumb ? (
                                            <CardMedia component="img" height="160" image={thumb} />
                                        ) : (
                                            <Box
                                                sx={{
                                                    height: 160,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    bgcolor: "action.hover",
                                                }}>
                                                <ImageOutlinedIcon />
                                            </Box>
                                        )}
                                    </Box>

                                    <CardContent>
                                        <Typography fontWeight={700} noWrap>
                                            {project.title || "Untitled ad"}
                                        </Typography>

                                        <Typography variant="caption" color="text.secondary">
                                            Updated {new Date(project.updatedAt).toLocaleDateString()}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        );
                    })}
            </Box>

            {/* FLOATING AI INPUT */}
            <Box
                sx={{
                    position: "fixed",
                    bottom: 28,
                    left: "50%",
                    transform: `translate(-50%, ${showInput ? "0" : "120%"})`,
                    transition: "all .25s ease",
                    width: "min(720px, calc(100% - 40px))",
                    border: "1px solid #e6e6e6",
                    borderRadius: "28px",
                    bgcolor: "#fff",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.06)",
                    px: 2.5,
                    py: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                }}>
                <Box sx={{ color: "#ff6a00" }}>✨</Box>

                <Box sx={{ position: "relative", flex: 1 }}>
                    <TextField fullWidth variant="standard" value={prompt} onChange={(e) => setPrompt(e.target.value)} InputProps={{ disableUnderline: true }} />

                    {!prompt && (
                        <Typography
                            sx={{
                                position: "absolute",
                                top: "50%",
                                left: 0,
                                transform: "translateY(-50%)",
                                color: "#8a8a8a",
                                pointerEvents: "none",
                            }}>
                            Create a{" "}
                            <Box component="span" sx={{ color: "#ff6a00", fontWeight: 700 }}>
                                Watchable
                            </Box>{" "}
                            TikTok ad for…
                        </Typography>
                    )}
                </Box>

                <IconButton
                    sx={{
                        width: 38,
                        height: 38,
                        bgcolor: "#f2f2f2",
                    }}>
                    <ArrowUpwardIcon />
                </IconButton>
            </Box>
            </Box>
        </Box>
    );
}
