import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import {
    Box,
    Typography,
    Card,
    CardContent,
    CardMedia,
    CardActionArea,
    IconButton,
    Skeleton,
    Stack,
    TextField,
    Button,
    InputAdornment,
    Menu,
    MenuItem,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";

import { ProjectStatus } from "@/api/projects";
import { useDeleteProject, useProjects } from "@/api/projects/hooks";
import { useAuthStore } from "@/stores/useAuthStore";
import AppHeader from "@/components/AppHeader";
import { WatchableLogoText } from "@/components/LogoText";

const STATUS_META: Record<ProjectStatus, { label: string; color: string }> = {
    [ProjectStatus.Draft]: { label: "Draft", color: "warning.main" },
    [ProjectStatus.Active]: { label: "Active", color: "success.main" },
    [ProjectStatus.Archived]: { label: "Archived", color: "text.disabled" },
};

export default function Dashboard() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
    const [filter, setFilter] = useState<"all" | ProjectStatus>("all");
    const [query, setQuery] = useState("");
    const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
    const [menuProjectId, setMenuProjectId] = useState<string | null>(null);

    const { data, isLoading } = useProjects();
    const deleteProject = useDeleteProject();
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

    const stats = useMemo(() => {
        const output: Record<ProjectStatus, number> & { total: number } = {
            total: sorted.length,
            [ProjectStatus.Draft]: 0,
            [ProjectStatus.Active]: 0,
            [ProjectStatus.Archived]: 0,
        };
        sorted.forEach((project) => {
            output[project.status] += 1;
        });
        return output;
    }, [sorted]);

    const filtered = useMemo(() => {
        return sorted.filter((project) => {
            const matchesQuery = query.trim().length ? (project.title || project.name || "Untitled ad").toLowerCase().includes(query.trim().toLowerCase()) : true;
            if (!matchesQuery) return false;
            if (filter === "all") return true;
            return project.status === filter;
        });
    }, [sorted, query, filter]);

    const isMenuOpen = Boolean(menuAnchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, projectId: string) => {
        event.stopPropagation();
        setMenuAnchorEl(event.currentTarget);
        setMenuProjectId(projectId);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setMenuProjectId(null);
    };

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
            <Box sx={{ flex: 1, overflow: "auto" }}>
                <Box sx={{ width: "100%", mx: "auto", px: { xs: 2, md: 4 }, pb: 6 }}>
                    {/* HEADER */}
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        alignItems={{ xs: "flex-start", md: "center" }}
                        justifyContent="space-between"
                        spacing={2}
                        sx={{ pt: 3, pb: 2 }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                                Hello, {displayName}
                            </Typography>
                            <Typography color="text.secondary">Pick up where you left off or start a new ad.</Typography>
                        </Box>
                        <Box />
                    </Stack>

                    {/* CAMPAIGNS */}
                    <Box sx={{ mt: 3 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                            <Box>
                                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.1 }}>
                                    Campaigns
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Organize projects by campaign
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Campaigns will soon hold grouped projects, briefs, and revisions.
                                </Typography>
                            </Box>
                            <Button variant="outlined" startIcon={<AddRoundedIcon />} sx={{ borderRadius: 999, textTransform: "none", fontWeight: 600 }}>
                                New campaign
                            </Button>
                        </Stack>
                        <Stack
                            direction="row"
                            spacing={2}
                            sx={{
                                mt: 2,
                                pb: 1,
                                overflowX: "auto",
                                "::-webkit-scrollbar": { height: 6 },
                                "::-webkit-scrollbar-thumb": {
                                    bgcolor: "divider",
                                    borderRadius: 999,
                                },
                            }}>
                            <Box
                                sx={{
                                    minWidth: 260,
                                    borderRadius: 3,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    bgcolor: "background.paper",
                                    px: 2.5,
                                    py: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "warning.main" }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                        Unassigned
                                    </Typography>
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    Projects waiting for a campaign
                                </Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                    {stats.total} projects
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    minWidth: 260,
                                    borderRadius: 3,
                                    border: "1.5px dashed",
                                    borderColor: "divider",
                                    bgcolor: "background.default",
                                    px: 2.5,
                                    py: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                    alignItems: "flex-start",
                                    justifyContent: "center",
                                }}>
                                <Box
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: "50%",
                                        border: "1px solid",
                                        borderColor: "divider",
                                        display: "grid",
                                        placeItems: "center",
                                        bgcolor: "background.paper",
                                    }}>
                                    <AddRoundedIcon fontSize="small" />
                                </Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    Create a campaign
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Group projects by launch, theme, or goal.
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                    {/* PROJECTS */}
                    <Box sx={{ mt: 4 }}>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {([
                                    "all",
                                    ProjectStatus.Draft,
                                    ProjectStatus.Active,
                                    ProjectStatus.Archived,
                                ] as const).map((value) => {
                                    const isActive = filter === value;
                                    return (
                                        <Button
                                            key={value}
                                            size="small"
                                            onClick={() => setFilter(value)}
                                            sx={{
                                                textTransform: "none",
                                                fontWeight: 600,
                                                borderRadius: 999,
                                                border: "1px solid",
                                                borderColor: isActive ? "primary.main" : "divider",
                                                bgcolor: isActive ? "primary.main" : "background.paper",
                                                color: isActive ? "primary.contrastText" : "text.secondary",
                                                boxShadow: isActive ? "0 10px 22px rgba(255, 106, 26, 0.24)" : "none",
                                                "&:hover": {
                                                    bgcolor: isActive ? "primary.dark" : "action.hover",
                                                },
                                            }}>
                                            {value === "all" ? "All" : STATUS_META[value].label}
                                        </Button>
                                    );
                                })}
                            </Stack>
                            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                                <TextField
                                    size="small"
                                    placeholder="Search projects"
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchRoundedIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        minWidth: { xs: "100%", sm: 240 },
                                        bgcolor: "background.paper",
                                        borderRadius: 999,
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 999,
                                        },
                                    }}
                                />
                            </Stack>
                        </Stack>

                        <Box
                            sx={{
                                mt: 3,
                                p: { xs: 4, md: 5 },
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "divider",
                                bgcolor: "background.paper",
                            }}>
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
                                    gap: 3,
                                }}>
                                {isLoading &&
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <Card key={i} sx={{ borderRadius: 3 }}>
                                            <Skeleton variant="rectangular" height={180} />
                                            <CardContent>
                                                <Skeleton width="70%" />
                                                <Skeleton width="40%" />
                                            </CardContent>
                                        </Card>
                                    ))}

                                {!isLoading &&
                                    filtered.map((project) => {
                                        const thumb = project.thumbnailUrl || "";
                                        const statusMeta = STATUS_META[project.status];

                                        return (
                                            <Card
                                                key={project.id}
                                                sx={{
                                                    borderRadius: 3,
                                                    overflow: "hidden",
                                                    position: "relative",
                                                    border: "1px solid",
                                                    borderColor: "divider",
                                                    bgcolor: "background.paper",
                                                    transition: "all .2s ease",
                                                    "&:hover": {
                                                        transform: "translateY(-4px)",
                                                        boxShadow: "0 18px 40px rgba(11, 13, 18, 0.12)",
                                                    },
                                                }}>
                                                <CardActionArea component="div" onClick={() => navigate(`/projects/${project.id}`)}>
                                                    <Box sx={{ position: "relative", height: 180, overflow: "hidden" }}>
                                                        <Box
                                                            onClick={(e) => e.stopPropagation()}
                                                            sx={{
                                                                position: "absolute",
                                                                top: 12,
                                                                right: 12,
                                                                zIndex: 1,
                                                            }}>
                                                            <IconButton
                                                                size="small"
                                                                sx={{ bgcolor: "rgba(255,255,255,0.9)" }}
                                                                onClick={(event) => handleMenuOpen(event, project.id)}>
                                                                <MoreHorizRoundedIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                        {thumb ? (
                                                            <CardMedia
                                                                component="img"
                                                                image={thumb}
                                                                sx={{
                                                                    height: "100%",
                                                                    width: "100%",
                                                                    objectFit: "cover",
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
                                                                <CardMedia
                                                                    component="img"
                                                                    image="/logo.png"
                                                                    sx={{
                                                                        width: 108,
                                                                        height: 108,
                                                                        objectFit: "contain",
                                                                        opacity: 0.55,
                                                                    }}
                                                                />
                                                            </Box>
                                                        )}
                                                    </Box>

                                                    <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                                        <Typography fontWeight={700} noWrap>
                                                            {project.title || "Untitled ad"}
                                                        </Typography>
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <Box
                                                                sx={{
                                                                    width: 6,
                                                                    height: 6,
                                                                    borderRadius: "50%",
                                                                    bgcolor: statusMeta.color,
                                                                }}
                                                            />
                                                            <Typography variant="caption" color="text.secondary">
                                                                {statusMeta.label}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                • Updated {new Date(project.updatedAt).toLocaleDateString()}
                                                            </Typography>
                                                        </Stack>
                                                    </CardContent>
                                                </CardActionArea>
                                            </Card>
                                        );
                                    })}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Menu
                anchorEl={menuAnchorEl}
                open={isMenuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}>
                <MenuItem
                    disabled={deleteProject.isPending}
                    sx={{ backgroundColor: "error.light" }}
                    onClick={(event) => {
                        event.stopPropagation();
                        if (!menuProjectId || deleteProject.isPending) return;
                        deleteProject.mutate({ projectId: menuProjectId });
                        handleMenuClose();
                    }}>
                    Delete
                </MenuItem>
            </Menu>
        </Box>
    );
}
