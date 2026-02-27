import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Radio,
    RadioGroup,
    Stack,
    Typography,
} from "@mui/material";
import BrushOutlinedIcon from "@mui/icons-material/BrushOutlined";
import { useThemeMode } from "@/theme";

type SettingsDialogProps = {
    open: boolean;
    onClose: () => void;
};

const SettingsDialog = ({ open, onClose }: SettingsDialogProps) => {
    const { mode, setMode } = useThemeMode();

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
