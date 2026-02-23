import { useState } from "react";
import { Box, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";

type WorkspacePaneProps = {
    imageUrl?: string;
    tabIndex?: number;
    onTabChange?: (value: number) => void;
};

const WorkspacePane = ({ imageUrl, tabIndex, onTabChange }: WorkspacePaneProps) => {
    const [localTab, setLocalTab] = useState(0);
    const activeTab = tabIndex ?? localTab;
    const handleTabChange = onTabChange ?? setLocalTab;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
            <Box
                sx={{
                    px: 2.5,
                    py: 2,
                    bgcolor: "background.paper",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Stack spacing={0.5}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Workspace
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Media and edits live here.
                    </Typography>
                </Stack>
            </Box>
            <Tabs
                value={activeTab}
                onChange={(_event, value) => handleTabChange(value)}
                variant="fullWidth"
                sx={{
                    px: 1,
                    bgcolor: "background.paper",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "& .MuiTab-root": { fontWeight: 600, textTransform: "none" },
                }}
            >
                <Tab label="Uploads" />
                <Tab label="Timeline" />
                <Tab label="Assets" />
            </Tabs>
            <Box sx={{ p: 2.5, flex: 1, overflowY: "auto", bgcolor: "background.default" }}>
                {activeTab === 0 ? (
                    imageUrl ? (
                        <Stack spacing={2}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Stack spacing={1}>
                                    <Typography variant="body2" color="text.secondary">
                                        Latest upload
                                    </Typography>
                                    <Box
                                        component="img"
                                        src={imageUrl}
                                        alt="Latest upload"
                                        sx={{
                                            width: "100%",
                                            borderRadius: 1.5,
                                            border: "1px solid",
                                            borderColor: "divider",
                                            objectFit: "contain",
                                            maxHeight: 320,
                                        }}
                                    />
                                </Stack>
                            </Paper>
                        </Stack>
                    ) : (
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 3,
                                borderStyle: "dashed",
                                textAlign: "center",
                            }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                Upload an image in chat to preview it here.
                            </Typography>
                        </Paper>
                    )
                ) : (
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 3,
                            borderStyle: "dashed",
                            textAlign: "center",
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Workspace tools are coming soon.
                        </Typography>
                    </Paper>
                )}
            </Box>
        </Box>
    );
};

export default WorkspacePane;
