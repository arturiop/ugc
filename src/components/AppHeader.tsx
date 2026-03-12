import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Avatar, Box, Button, IconButton, Stack, Toolbar, Typography } from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useProject } from "@/contexts/project/ProjectContext";
import SettingsDialog from "./SettingsDialog";
import { useCreateProject } from "@/api/projects/hooks";

const AppHeader = () => {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const { projectName } = useProject();
    const createProject = useCreateProject();

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

    return (
        <>
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
                            onClick={handleCreateProject}
                            disabled={createProject.isPending}>
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
            <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </>
    );
};
export default AppHeader;
