import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Card, CardActionArea, CardMedia, IconButton, InputAdornment, Menu, MenuItem, Skeleton, Stack, TextField, Typography } from "@mui/material";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { ProjectStatus, ProjectType, type ProjectSummary } from "@/api/projects";
import { useDeleteProject, useProjects } from "@/api/projects/hooks";
import { LiquidPlaceholder } from "./LiquidPlaceholder";

const STATUS_META: Record<ProjectStatus, { label: string; color: string }> = {
    [ProjectStatus.Draft]: { label: "Draft", color: "warning.main" },
    [ProjectStatus.Active]: { label: "Active", color: "success.main" },
    [ProjectStatus.Archived]: { label: "Archived", color: "text.disabled" },
};

const projectDateFormatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
});

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".m4v", ".ogv", ".ogg"];

function isVideoAssetUrl(value?: string | null) {
    if (!value) return false;

    try {
        const pathname = new URL(value, window.location.origin).pathname.toLowerCase();
        return VIDEO_EXTENSIONS.some((extension) => pathname.endsWith(extension));
    } catch {
        const sanitized = value.split("?")[0]?.split("#")[0]?.toLowerCase() || "";
        return VIDEO_EXTENSIONS.some((extension) => sanitized.endsWith(extension));
    }
}

function getProjectCardMedia(project: ProjectSummary) {
    const imageUrl = project.coverUrl || project.imageUrl || project.lastImageUrl || project.thumbnailUrl || "";
    const previewUrl = project.previewUrl || imageUrl;

    return {
        imageUrl,
        mediaUrl: previewUrl,
        isVideo: isVideoAssetUrl(previewUrl),
        fitMode: project.project_type === ProjectType.SatisfactionVideo ? "contain" : "cover",
    } as const;
}

function getProjectCardAspectRatio(projectType: ProjectType) {
    return projectType === ProjectType.SatisfactionVideo ? "9 / 14" : "16 / 9";
}

function getProjectCardShellLayout(project: ProjectSummary, index: number) {
    const regularVariants = [
        { width: "100%", ml: 0, mt: 0 },
        { width: "82%", ml: "auto", mt: 28 },
        { width: "92%", ml: 0, mt: 10 },
        { width: "76%", ml: "9%", mt: 40 },
    ] as const;
    const satisfactionVariants = [
        { width: "84%", ml: 0, mt: 20 },
        { width: "92%", ml: 0, mt: 0 },
        { width: "88%", ml: "4%", mt: 34 },
    ] as const;

    const variants = project.project_type === ProjectType.SatisfactionVideo ? satisfactionVariants : regularVariants;
    const variant = variants[index % variants.length];

    return {
        width: { xs: "100%", md: variant.width },
        ml: { xs: 0, md: variant.ml },
        mt: { xs: 0, md: `${variant.mt}px` },
    } as const;
}

function ProjectCardMediaPreview({
    mediaUrl,
    imageUrl,
    isVideo,
    fitMode,
    backgroundColor,
}: {
    mediaUrl: string;
    imageUrl: string;
    isVideo: boolean;
    fitMode: "contain" | "cover";
    backgroundColor: string;
}) {
    const [isPortraitVideo, setIsPortraitVideo] = useState<boolean | null>(null);
    const resolvedFitMode = !isVideo
        ? fitMode
        : isPortraitVideo === null
          ? "contain"
          : isPortraitVideo
            ? "contain"
            : fitMode;

    if (isVideo) {
        return (
            <Box
                component="video"
                src={mediaUrl}
                poster={imageUrl || undefined}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                onLoadedMetadata={(event) => {
                    const { videoWidth, videoHeight } = event.currentTarget;
                    if (!videoWidth || !videoHeight) {
                        setIsPortraitVideo(null);
                        return;
                    }
                    setIsPortraitVideo(videoHeight > videoWidth);
                }}
                sx={{
                    height: "100%",
                    width: "100%",
                    objectFit: resolvedFitMode,
                    objectPosition: "center center",
                    display: "block",
                    bgcolor: backgroundColor,
                }}
            />
        );
    }

    return (
        <CardMedia
            component="img"
            image={mediaUrl}
            sx={{
                height: "100%",
                width: "100%",
                objectFit: resolvedFitMode,
                objectPosition: "center center",
                display: "block",
                bgcolor: "background.default",
            }}
            loading="lazy"
        />
    );
}

export function DashboardProjectsSection() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState<"all" | ProjectStatus>("all");
    const [query, setQuery] = useState("");
    const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
    const [menuProjectId, setMenuProjectId] = useState<string | null>(null);
    const { data, isLoading } = useProjects();
    const deleteProject = useDeleteProject();
    const projects = useMemo(() => data?.items ?? [], [data?.items]);
    const sortedProjects = useMemo(() => {
        return [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }, [projects]);
    const filteredProjects = useMemo(() => {
        return sortedProjects.filter((project) => {
            const matchesQuery = query.trim().length ? (project.title || project.name || "Untitled ad").toLowerCase().includes(query.trim().toLowerCase()) : true;
            if (!matchesQuery) return false;
            if (filter === "all") return true;
            return project.status === filter;
        });
    }, [sortedProjects, query, filter]);
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

    const openProject = (project: ProjectSummary) => {
        if (project.project_type === ProjectType.MarketplaceCreatives) {
            navigate(`/marketplace/${encodeURIComponent(project.id)}`);
            return;
        }
        navigate(`/projects/${project.id}`);
    };

    return (
        <Box
            sx={{
                mt: 4,
            }}>
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
                            display: { xs: "none", sm: "flex" },
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
                    mt: { xs: 0, md: 3 },
                    p: { xs: 0, md: 3 },
                    borderRadius: 3,
                    border: { xs: "none", md: "1px solid" },
                    borderColor: "divider",
                    bgcolor: { xs: "transparent", md: "background.paper" },
                }}>
                <Box
                    sx={{
                        columnCount: { xs: 1, md: 2, lg: 3, xl: 4 },
                        columnGap: { xs: "0px", md: "16px" },
                    }}>
                    {isLoading &&
                        Array.from({ length: 6 }).map((_, i) => (
                            <Card
                                key={i}
                                sx={{
                                    display: "block",
                                    breakInside: "avoid",
                                    WebkitColumnBreakInside: "avoid",
                                    borderRadius: 3,
                                    width: {
                                        xs: "100%",
                                        md: i % 4 === 0 ? "100%" : i % 4 === 1 ? "82%" : i % 4 === 2 ? "92%" : "76%",
                                    },
                                    ml: {
                                        xs: 0,
                                        md: i % 4 === 1 ? "auto" : i % 4 === 3 ? "9%" : 0,
                                    },
                                    mt: {
                                        xs: 0,
                                        md: i % 4 === 1 ? "28px" : i % 4 === 2 ? "10px" : i % 4 === 3 ? "40px" : 0,
                                    },
                                    mb: { xs: 1.5, md: 2 },
                                }}
                            >
                                <Skeleton
                                    variant="rectangular"
                                    sx={{
                                        aspectRatio: i % 3 === 1 ? "9 / 14" : "16 / 9",
                                    }}
                                />
                            </Card>
                        ))}

                    {!isLoading &&
                        filteredProjects.map((project, index) => {
                            const { imageUrl, mediaUrl, isVideo, fitMode } = getProjectCardMedia(project);
                            const statusMeta = STATUS_META[project.status];
                            const shellLayout = getProjectCardShellLayout(project, index);

                            return (
                                <Card
                                    key={project.id}
                                    sx={{
                                        display: "block",
                                        breakInside: "avoid",
                                        WebkitColumnBreakInside: "avoid",
                                        width: shellLayout.width,
                                        ml: shellLayout.ml,
                                        mt: shellLayout.mt,
                                        mb: { xs: 1.5, md: 2 },
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
                                    <CardActionArea component="div" onClick={() => openProject(project)}>
                                        <Box
                                            sx={{
                                                position: "relative",
                                                aspectRatio: getProjectCardAspectRatio(project.project_type),
                                                overflow: "hidden",
                                                bgcolor: project.project_type === ProjectType.SatisfactionVideo ? "#0d1015" : "#f3f5f8",
                                            }}>
                                            {mediaUrl ? (
                                                <ProjectCardMediaPreview
                                                    mediaUrl={mediaUrl}
                                                    imageUrl={imageUrl}
                                                    isVideo={isVideo}
                                                    fitMode={fitMode}
                                                    backgroundColor={
                                                        project.project_type === ProjectType.SatisfactionVideo
                                                            ? "#0d1015"
                                                            : "background.default"
                                                    }
                                                />
                                            ) : (
                                                <LiquidPlaceholder />
                                            )}
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    inset: 0,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    justifyContent: "flex-end",
                                                    px: 2,
                                                    py: 0.5,
                                                    background:
                                                        "linear-gradient(180deg, rgba(7, 10, 16, 0) 0%, rgba(7, 10, 16, 0.04) 52%, rgba(7, 10, 16, 0.16) 68%, rgba(7, 10, 16, 0.38) 82%, rgba(7, 10, 16, 0.72) 100%)",
                                                }}>
                                                <Typography
                                                    sx={{
                                                        color: "common.white",
                                                        fontWeight: 700,
                                                        fontSize: { xs: "1.1rem", md: "1.2rem" },
                                                        lineHeight: 1.1,
                                                        textShadow: "0 1px 3px rgba(0,0,0,0.22)",
                                                        display: "-webkit-box",
                                                        WebkitBoxOrient: "vertical",
                                                        WebkitLineClamp: 3,
                                                        overflow: "hidden",
                                                    }}>
                                                    {project.title || project.name || "Untitled ad"}
                                                </Typography>
                                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                                                        <Box
                                                            sx={{
                                                                width: 6,
                                                                height: 6,
                                                                borderRadius: "50%",
                                                                bgcolor: statusMeta.color,
                                                                flexShrink: 0,
                                                            }}
                                                        />
                                                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.82)" }}>
                                                            {statusMeta.label} • {projectDateFormatter.format(new Date(project.updatedAt))}
                                                        </Typography>
                                                    </Stack>
                                                    <Box onClick={(e) => e.stopPropagation()}>
                                                        <IconButton
                                                            size="small"
                                                            sx={{
                                                                color: "common.white",
                                                                mr: -0.75,
                                                            }}
                                                            onClick={(event) => handleMenuOpen(event, project.id)}>
                                                            <MoreHorizRoundedIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </Stack>
                                            </Box>
                                        </Box>
                                    </CardActionArea>
                                </Card>
                            );
                        })}
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
