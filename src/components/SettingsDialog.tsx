import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Divider,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import BrushOutlinedIcon from "@mui/icons-material/BrushOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { useThemeMode } from "@/theme";
import { createShareToken } from "@/api/auth/auth";

type SettingsDialogProps = {
    open: boolean;
    onClose: () => void;
};

const SettingsDialog = ({ open, onClose }: SettingsDialogProps) => {
    const { mode, setMode } = useThemeMode();
    const navigate = useNavigate();
    const [shareLink, setShareLink] = useState("");
    const [shareError, setShareError] = useState<string | null>(null);
    const [sharePending, setSharePending] = useState(false);

    const handleGenerateShare = async () => {
        setSharePending(true);
        setShareError(null);
        try {
            const token = await createShareToken();
            const link = new URL("/dashboard", window.location.origin);
            link.searchParams.set("token", token.access_token);
            setShareLink(link.toString());
        } catch (err) {
            setShareError((err as Error).message || "Failed to generate access link.");
        } finally {
            setSharePending(false);
        }
    };

    const handleCopyShare = async () => {
        if (!shareLink) return;
        try {
            await navigator.clipboard.writeText(shareLink);
        } catch (err) {
            console.warn("Failed to copy link", err);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>Settings</DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <Paper variant="outlined" sx={{ width: { xs: "100%", md: 240 }, p: 1 }}>
                        <List disablePadding>
                            <ListItemButton selected sx={{ borderRadius: 1 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <BrushOutlinedIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary="Appearance" />
                            </ListItemButton>
                            <ListItemButton
                                sx={{ borderRadius: 1 }}
                                onClick={() => {
                                    onClose();
                                    navigate("/settings");
                                }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <TuneOutlinedIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary="Global settings" />
                            </ListItemButton>
                        </List>
                    </Paper>

                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Appearance
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Change the UI mode.
                        </Typography>

                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={2}>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            flex: 1,
                                            p: 1.5,
                                            borderRadius: 2,
                                            borderColor: mode === "light" ? "primary.main" : "divider",
                                            bgcolor: "background.default",
                                        }}>
                                        <Stack spacing={1}>
                                            <Paper variant="outlined" sx={{ height: 10, borderRadius: 99 }} />
                                            <Paper variant="outlined" sx={{ height: 42, borderRadius: 1.5 }} />
                                            <Paper variant="outlined" sx={{ height: 24, borderRadius: 1.5, width: "70%" }} />
                                        </Stack>
                                    </Paper>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            flex: 1,
                                            p: 1.5,
                                            borderRadius: 2,
                                            borderColor: mode === "dark" ? "primary.main" : "divider",
                                            bgcolor: "background.paper",
                                        }}>
                                        <Stack spacing={1}>
                                            <Paper variant="outlined" sx={{ height: 10, borderRadius: 99 }} />
                                            <Paper variant="outlined" sx={{ height: 42, borderRadius: 1.5 }} />
                                            <Paper variant="outlined" sx={{ height: 24, borderRadius: 1.5, width: "70%" }} />
                                        </Stack>
                                    </Paper>
                                </Stack>

                                <RadioGroup row value={mode} onChange={(event) => setMode(event.target.value as "light" | "dark")}>
                                    <FormControlLabel value="light" control={<Radio />} label="Light" />
                                    <FormControlLabel value="dark" control={<Radio />} label="Dark" />
                                </RadioGroup>
                            </Stack>
                        </Paper>

                        <Divider />

                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Share access
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Generate a link that lets someone access your profile and projects.
                            </Typography>

                            <Stack spacing={1.5}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Button variant="contained" onClick={handleGenerateShare} disabled={sharePending}>
                                        Generate access link
                                    </Button>
                                    <Typography variant="caption" color="text.secondary">
                                        Anyone with this link has full access. Treat it like a password.
                                    </Typography>
                                </Stack>

                                <Stack direction="row" spacing={1} alignItems="center">
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={shareLink}
                                        placeholder="No link generated yet"
                                        InputProps={{ readOnly: true }}
                                    />
                                    <Tooltip title="Copy link">
                                        <span>
                                            <IconButton onClick={handleCopyShare} disabled={!shareLink}>
                                                <ContentCopyOutlinedIcon fontSize="small" />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </Stack>

                                {shareError ? (
                                    <Typography variant="caption" color="error">
                                        {shareError}
                                    </Typography>
                                ) : null}
                            </Stack>
                        </Box>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default SettingsDialog;
