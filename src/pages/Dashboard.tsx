import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import { Box, Typography, Card, CardContent, CardMedia, CardActionArea, IconButton, Skeleton, Stack, TextField } from "@mui/material";

import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

import { useProjects } from "@/api/projects/hooks";
import { useAuthStore } from "@/stores/useAuthStore";
import AppHeader from "@/components/AppHeader";
import { WatchableLogoText } from "@/components/logoText";

export default function Dashboard() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

    const { data, isLoading } = useProjects();

    useEffect(() => {
        setPortalTarget(document.getElementById("app-header-portal"));
    }, []);

    const displayName = useMemo(() => {
        const name = user?.full_name?.trim();
        if (name) return name;
        const email = user?.email?.trim();
        if (email) return email.split("@")[0];
        return "there";
    }, [user?.full_name, user?.email]);

    const projects = data?.items ?? [];
    const sorted = useMemo(() => {
        return [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }, [projects]);

    return (
        <Box sx={{ height: "100dvh", width: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <AppHeader />
            {portalTarget &&
                createPortal(
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <WatchableLogoText />
                    </Box>,
                    portalTarget
                )}
            <Box sx={{ width: "100%", mx: "auto", px: 4 }}>
                {/* HEADER */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 4,
                        pt: 3,
                    }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            Hello, {displayName}
                        </Typography>
                        <Typography color="text.secondary">Continue working or start a new idea</Typography>
                    </Box>
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
                            const thumb = project.thumbnailUrl || "";

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
                                        <Box sx={{ position: "relative", height: 160, overflow: "hidden" }}>
                                            {thumb ? (
                                                <CardMedia
                                                    component="img"
                                                    image={thumb}
                                                    sx={{
                                                        height: "100%",
                                                        width: "100%",
                                                        objectFit: "contain",
                                                        display: "block",
                                                        bgcolor: "background.default",
                                                    }}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <Box
                                                    sx={{
                                                        height: "100%",
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
            </Box>
        </Box>
    );
}
