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

    const navigate = useNavigate();

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
            <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
                <Toolbar
                    sx={{
                        minHeight: { xs: 56 },
                        px: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        position: "relative",
                    }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                        <Avatar
                            onClick={() => navigate('/dashboard')}
                            src="/logo.png"
                            alt="Project icon"
                            sx={{ width: 36, height: 36, border: "1px solid", borderColor: "divider", cursor: "pointer" }}
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
                            sx={{ borderRadius: 999, textTransform: "none", fontWeight: 600 }}
                            onClick={handleCreateProject}
                            disabled={createProject.isPending}>
                            New project
                        </Button>
                        <IconButton size="small" aria-label="Open settings" onClick={() => setSettingsOpen(true)}>
                            <SettingsOutlinedIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                        <IconButton size="small" sx={{ p: 0 }} aria-label="User menu" onClick={handleAvatarOpen}>
                            <Avatar sx={{ width: 32, height: 32 }} alt="avatar" src="" />
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
