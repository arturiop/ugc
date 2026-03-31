import { Box, List, ListItemButton, ListItemText, Paper, Stack, Typography } from "@mui/material";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import AppHeader from "@/components/AppHeader";

const sections = [
    {
        key: "global",
        label: "Global settings",
        description: "Runtime configuration and feature flags.",
        path: "/settings/global",
        icon: TuneOutlinedIcon,
    },
    {
        key: "prompts",
        label: "Prompts",
        description: "Prompt templates used by the server.",
        path: "/settings/prompts",
        icon: AutoAwesomeOutlinedIcon,
    },
];

export default function SettingsLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <Box sx={{ minHeight: "100dvh", width: "100%", display: "flex", flexDirection: "column" }}>
            <AppHeader />
            <Box sx={{ width: "min(1280px, 100%)", mx: "auto", px: 4, py: 4, flex: 1 }}>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                            Settings
                        </Typography>
                        <Typography color="text.secondary">
                            Manage server configuration and admin prompt templates.
                        </Typography>
                    </Box>

                    <Stack direction={{ xs: "column", lg: "row" }} spacing={3} alignItems="stretch">
                        <Paper
                            variant="outlined"
                            sx={{
                                width: { xs: "100%", lg: 280 },
                                p: 1,
                                borderRadius: 3,
                                alignSelf: { xs: "stretch", lg: "flex-start" },
                            }}>
                            <List disablePadding>
                                {sections.map((section) => {
                                    const selected = location.pathname === section.path;
                                    const Icon = section.icon;

                                    return (
                                        <ListItemButton
                                            key={section.key}
                                            selected={selected}
                                            onClick={() => navigate(section.path)}
                                            sx={{
                                                borderRadius: 2,
                                                alignItems: "flex-start",
                                                gap: 1.5,
                                                py: 1.5,
                                                mb: 0.5,
                                            }}>
                                            <Icon
                                                fontSize="small"
                                                sx={{
                                                    mt: 0.3,
                                                    color: selected ? "primary.main" : "text.secondary",
                                                }}
                                            />
                                            <ListItemText
                                                primary={section.label}
                                                secondary={section.description}
                                                primaryTypographyProps={{ fontWeight: 700 }}
                                                secondaryTypographyProps={{ sx: { mt: 0.25 } }}
                                            />
                                        </ListItemButton>
                                    );
                                })}
                            </List>
                        </Paper>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Outlet />
                        </Box>
                    </Stack>
                </Stack>
            </Box>
        </Box>
    );
}
