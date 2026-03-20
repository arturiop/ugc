import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Avatar, Box, Button, IconButton, Menu, MenuItem, Stack, Toolbar, Typography } from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SettingsDialog from "./SettingsDialog";
import { useCreateProject } from "@/api/projects/hooks";
import { useAuthStore } from "@/stores/useAuthStore";

const AppHeader = () => {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [avatarAnchor, setAvatarAnchor] = useState<null | HTMLElement>(null);
    const createProject = useCreateProject();
    const logout = useAuthStore((s) => s.logout);
    const user = useAuthStore((s) => s.user);

    const navigate = useNavigate();
    const avatarLabel = user?.full_name?.trim() || user?.email?.trim() || "User";
    const avatarInitials = avatarLabel
        .split(" ")
        .filter(Boolean)
        .join("")
        .slice(0, 2)
        .toUpperCase();
    const avatarFallback = avatarInitials.padEnd(2, "U").slice(0, 2);
    const hasProfileImage = Boolean(user?.profile_image_url);

    const handleCreateProject = async () => {
        try {
            const data = await createProject.mutateAsync();
            const id = data?.short_id || data?.uuid;

            if (id) {
                navigate(`/projects/${id}`);
            }
        } catch (err) {
            console.error("Failed to create project", err);
        }
    };

    const handleAvatarOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAvatarAnchor(event.currentTarget);
    };

    const handleAvatarClose = () => {
        setAvatarAnchor(null);
    };

    const handleSignOut = () => {
        logout();
        setAvatarAnchor(null);
        navigate("/");
    };

    return (
        <>
            <AppBar
                position="sticky"
                color="default"
                elevation={0}
                sx={{
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                }}
            >
                <Toolbar
                    sx={{
                        minHeight: { xs: 56 },
                        px: 2.5,
                        display: "flex",
                        justifyContent: "space-between",
                        position: "relative",
                    }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                        <Avatar
                            onClick={() => navigate('/dashboard')}
                            src="/logo.png"
                            alt="Project icon"
                            sx={{
                                width: 36,
                                height: 36,
                                border: "1px solid",
                                borderColor: "divider",
                                bgcolor: "background.neutral",
                                cursor: "pointer",
                            }}
                        />
                        <Box
                            id="app-header-portal"
                            sx={{
                                minWidth: 0,
                                display: "flex",
                                alignItems: "center",
                            }}
                        />
                    </Stack>
                    <Box
                        id="app-header-center-portal"
                        sx={{
                            position: "absolute",
                            left: "50%",
                            transform: "translateX(-50%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            pointerEvents: "none",
                        }}
                    />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<EditOutlinedIcon />}
                            sx={{
                                borderRadius: 999,
                                textTransform: "none",
                                fontWeight: 700,
                                boxShadow: "0 10px 18px rgba(255, 106, 26, 0.24)",
                            }}
                            onClick={handleCreateProject}
                            disabled={createProject.isPending}>
                            New project
                        </Button>
                        <IconButton size="small" aria-label="Open settings" onClick={() => setSettingsOpen(true)}>
                            <SettingsOutlinedIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                        <IconButton size="small" sx={{ p: 0 }} aria-label="User menu" onClick={handleAvatarOpen}>
                            <Avatar
                                sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: "#F7F3ED",
                                    border: "1px solid",
                                    borderColor: "rgba(255, 106, 26, 0.5)",
                                    fontWeight: 700,
                                    fontSize: 12,
                                    letterSpacing: 0.6,
                                    boxShadow:
                                        "0 0 0 2px rgba(255, 106, 26, 0.18), 0 6px 14px rgba(91, 97, 255, 0.18)",
                                    position: "relative",
                                    overflow: "hidden",
                                    "&::before": {
                                        content: '""',
                                        position: "absolute",
                                        inset: 1,
                                        borderRadius: "50%",
                                        background:
                                            "radial-gradient(65% 65% at 10% 15%, rgba(255, 106, 26, 0.28), transparent 70%), radial-gradient(65% 65% at 90% 85%, rgba(91, 97, 255, 0.28), transparent 70%)",
                                    },
                                }}
                                alt={avatarLabel}
                                src={user?.profile_image_url || undefined}>
                                {!hasProfileImage && (
                                    <Box component="span" sx={{ display: "inline-flex", gap: "2px", zIndex: 1 }}>
                                        <Box component="span" sx={{ color: "#FF6A1A" }}>
                                            {avatarFallback[0]}
                                        </Box>
                                        <Box component="span" sx={{ color: "#5B61FF" }}>
                                            {avatarFallback[1]}
                                        </Box>
                                    </Box>
                                )}
                            </Avatar>
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            <Menu
                anchorEl={avatarAnchor}
                open={Boolean(avatarAnchor)}
                onClose={handleAvatarClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}>
                <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
            </Menu>
            <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </>
    );
};

export default AppHeader;
