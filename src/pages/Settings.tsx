import { useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";

import AppHeader from "@/components/AppHeader";
import { useDeleteGlobalSetting, useGlobalSettings, useUpsertGlobalSetting } from "@/api/settings/hooks";
import { GlobalSettingItem } from "@/api/settings";
import { useNavigate } from "react-router-dom";

type SettingDraft = {
    key: string;
    value: string;
    description: string;
    valueType: "string" | "text" | "number" | "boolean" | "json" | "null";
};

const emptyDraft: SettingDraft = {
    key: "",
    value: "",
    description: "",
    valueType: "string",
};

function formatValue(value: unknown) {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}

function inferValueType(value: unknown): SettingDraft["valueType"] {
    if (value === null || value === undefined) return "null";
    if (typeof value === "string") return "string";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    return "json";
}

function parseValue(raw: string, valueType: SettingDraft["valueType"]) {
    const trimmed = raw.trim();
    switch (valueType) {
        case "null":
            return null;
        case "string":
        case "text":
            return raw;
        case "number": {
            if (!trimmed) throw new Error("Number is required.");
            const parsed = Number(trimmed);
            if (Number.isNaN(parsed)) throw new Error("Value must be a valid number.");
            return parsed;
        }
        case "boolean": {
            const normalized = trimmed.toLowerCase();
            if (normalized !== "true" && normalized !== "false") {
                throw new Error("Value must be true or false.");
            }
            return normalized === "true";
        }
        case "json": {
            if (!trimmed) return null;
            return JSON.parse(trimmed);
        }
        default:
            return null;
    }
}

function normalizeValueForType(value: string, valueType: SettingDraft["valueType"]) {
    const trimmed = value.trim().toLowerCase();
    if (valueType === "null") return "";
    if (valueType === "boolean") {
        if (trimmed === "true" || trimmed === "false") return trimmed;
        return "true";
    }
    return value;
}

export default function Settings() {
    const navigate = useNavigate();
    const { data, isLoading, error } = useGlobalSettings();
    const upsertSetting = useUpsertGlobalSetting();
    const deleteSetting = useDeleteGlobalSetting();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [draft, setDraft] = useState<SettingDraft>(emptyDraft);
    const [valueError, setValueError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<GlobalSettingItem | null>(null);

    const settings = useMemo(() => data?.items ?? [], [data?.items]);
    const sorted = useMemo(
        () => [...settings].sort((a, b) => a.key.localeCompare(b.key)),
        [settings]
    );

    const handleOpenCreate = () => {
        setIsEditing(false);
        setDraft(emptyDraft);
        setValueError(null);
        setDialogOpen(true);
    };

    const handleOpenEdit = (setting: GlobalSettingItem) => {
        setIsEditing(true);
        const valueType = setting.key.startsWith("PROMPT_") ? "text" : inferValueType(setting.value);
        setDraft({
            key: setting.key,
            value: formatValue(setting.value),
            description: setting.description ?? "",
            valueType,
        });
        setValueError(null);
        setDialogOpen(true);
    };

    const handleClose = () => {
        if (upsertSetting.isPending) return;
        setDialogOpen(false);
    };

    const handleSave = async () => {
        if (!draft.key.trim()) return;
        let parsedValue: unknown | null;
        try {
            parsedValue = parseValue(draft.value, draft.valueType);
            setValueError(null);
        } catch (err) {
            setValueError((err as Error).message || "Value is invalid.");
            return;
        }

        await upsertSetting.mutateAsync({
            key: draft.key.trim(),
            payload: {
                value: parsedValue,
                description: draft.description.trim() || null,
            },
        });
        setDialogOpen(false);
    };

    const handleOpenDelete = (setting: GlobalSettingItem) => {
        setDeleteTarget(setting);
        setDeleteOpen(true);
    };

    const handleCloseDelete = () => {
        if (deleteSetting.isPending) return;
        setDeleteOpen(false);
        setDeleteTarget(null);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        await deleteSetting.mutateAsync({ key: deleteTarget.key });
        setDeleteOpen(false);
        setDeleteTarget(null);
    };

    return (
        <Box sx={{ minHeight: "100dvh", width: "100%", display: "flex", flexDirection: "column" }}>
            <AppHeader />
            <Box sx={{ width: "min(1100px, 100%)", mx: "auto", px: 4, py: 4 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                            Global settings
                        </Typography>
                        <Typography color="text.secondary">
                            Manage runtime configuration values for the server.
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1.5}>
                        <Button variant="outlined" onClick={() => navigate("/admin/viral-kb")}>
                            Viral knowledge
                        </Button>
                        <Button variant="contained" onClick={handleOpenCreate}>
                            Add setting
                        </Button>
                    </Stack>
                </Stack>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {(error as Error).message}
                    </Alert>
                )}

                <Paper variant="outlined">
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ width: 220 }}>Key</TableCell>
                                    <TableCell sx={{ width: 140 }}>Status</TableCell>
                                    <TableCell sx={{ width: 220 }}>Description</TableCell>
                                    <TableCell sx={{ width: 180 }}>Updated</TableCell>
                                    <TableCell sx={{ width: 160 }} />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isLoading && (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <Typography color="text.secondary">Loading settings…</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!isLoading && sorted.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <Typography color="text.secondary">No settings yet.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {sorted.map((setting) => (
                                    <TableRow key={setting.key} hover>
                                        <TableCell>
                                            <Typography sx={{ fontWeight: 600 }}>{setting.key}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {setting.value === null || setting.value === undefined || setting.value === ""
                                                    ? "Empty"
                                                    : "Set"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {setting.description || "—"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(setting.updated_at).toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1}>
                                                <Button size="small" onClick={() => handleOpenEdit(setting)}>
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleOpenDelete(setting)}>
                                                    Remove
                                                </Button>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{isEditing ? "Edit setting" : "Add setting"}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Key"
                            value={draft.key}
                            onChange={(event) =>
                                setDraft((prev) => {
                                    const nextKey = event.target.value;
                                    if (!isEditing && nextKey.startsWith("PROMPT_")) {
                                        return { ...prev, key: nextKey, valueType: "text" };
                                    }
                                    return { ...prev, key: nextKey };
                                })
                            }
                            disabled={isEditing}
                            placeholder="DEFAULT_LLM_MODEL"
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel id="setting-value-type-label">Value type</InputLabel>
                            <Select
                                labelId="setting-value-type-label"
                                label="Value type"
                                value={draft.valueType}
                                onChange={(event) =>
                                    setDraft((prev) => {
                                        const nextType = event.target.value as SettingDraft["valueType"];
                                        return {
                                            ...prev,
                                            valueType: nextType,
                                            value: normalizeValueForType(prev.value, nextType),
                                        };
                                    })
                                }>
                                <MenuItem value="string">String</MenuItem>
                                <MenuItem value="text">Text</MenuItem>
                                <MenuItem value="number">Number</MenuItem>
                                <MenuItem value="boolean">Boolean</MenuItem>
                                <MenuItem value="json">JSON</MenuItem>
                                <MenuItem value="null">Null</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Value"
                            value={draft.value}
                            onChange={(event) => setDraft((prev) => ({ ...prev, value: event.target.value }))}
                            placeholder={
                                draft.valueType === "json"
                                    ? '{ "key": "value" }'
                                    : draft.valueType === "text"
                                    ? "Paste prompt text here…"
                                    : draft.valueType === "number"
                                    ? "30"
                                    : draft.valueType === "boolean"
                                    ? "true"
                                    : "gpt-5-mini"
                            }
                            multiline={draft.valueType === "json" || draft.valueType === "text"}
                            minRows={draft.valueType === "json" || draft.valueType === "text" ? 6 : 1}
                            error={Boolean(valueError)}
                            helperText={
                                valueError ||
                                (draft.valueType === "json"
                                    ? "Enter valid JSON."
                                    : draft.valueType === "text"
                                    ? "Plain text; no JSON needed."
                                    : draft.valueType === "boolean"
                                    ? "Use true or false."
                                    : draft.valueType === "number"
                                    ? "Enter a numeric value."
                                    : draft.valueType === "null"
                                    ? "Value will be stored as null."
                                    : "Enter a string value.")
                            }
                            disabled={draft.valueType === "null"}
                            fullWidth
                        />
                        <TextField
                            label="Description"
                            value={draft.description}
                            onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
                            placeholder="Optional context for this setting."
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={upsertSetting.isPending || !draft.key.trim()}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteOpen} onClose={handleCloseDelete} maxWidth="xs" fullWidth>
                <DialogTitle>Remove setting</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mt: 1 }}>
                        Remove <strong>{deleteTarget?.key}</strong>? This cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDelete}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirmDelete}
                        disabled={deleteSetting.isPending}>
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
