import { useMemo, useState } from "react";
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Paper, Stack, TextField, Typography } from "@mui/material";

import { PromptItem } from "@/api/prompts";
import { useDeletePrompt, usePrompts, useUpsertPrompt } from "@/api/prompts/hooks";

type PromptDraft = {
    key: string;
    prompt: string;
};

const emptyDraft: PromptDraft = {
    key: "",
    prompt: "",
};

function promptPreview(prompt: string) {
    const compact = prompt.replace(/\s+/g, " ").trim();
    if (!compact) return "Empty prompt";
    return compact.length > 180 ? `${compact.slice(0, 180)}…` : compact;
}

export default function PromptsPage() {
    const { data, isLoading, error } = usePrompts();
    const upsertPrompt = useUpsertPrompt();
    const deletePrompt = useDeletePrompt();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState<PromptDraft>(emptyDraft);
    const [draftError, setDraftError] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<PromptItem | null>(null);
    const [search, setSearch] = useState("");

    const prompts = useMemo(() => {
        return [...(data?.items ?? [])].sort((a, b) => a.key.localeCompare(b.key));
    }, [data?.items]);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return prompts;
        return prompts.filter((item) => {
            const prompt = item.prompt.toLowerCase();
            return item.key.toLowerCase().includes(query) || prompt.includes(query);
        });
    }, [prompts, search]);

    const handleOpenCreate = () => {
        setIsEditing(false);
        setDraft(emptyDraft);
        setDraftError(null);
        setDialogOpen(true);
    };

    const handleOpenEdit = (item: PromptItem) => {
        setIsEditing(true);
        setDraft({
            key: item.key,
            prompt: item.prompt,
        });
        setDraftError(null);
        setDialogOpen(true);
    };

    const handleSave = async () => {
        const nextKey = draft.key.trim();
        if (!nextKey) {
            setDraftError("Prompt key is required.");
            return;
        }
        if (!draft.prompt.trim()) {
            setDraftError("Prompt text is required.");
            return;
        }

        await upsertPrompt.mutateAsync({
            key: nextKey,
            payload: {
                prompt: draft.prompt,
            },
        });

        setDialogOpen(false);
    };

    return (
        <Stack spacing={3}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Prompts
                    </Typography>
                    <Typography color="text.secondary">
                        Manage active prompt templates used by the server.
                    </Typography>
                </Box>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <TextField
                        size="small"
                        placeholder="Search prompts"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        sx={{ minWidth: { sm: 260 } }}
                    />
                    <Button variant="contained" onClick={handleOpenCreate}>
                        Add prompt
                    </Button>
                </Stack>
            </Stack>

            {error && <Alert severity="error">{(error as Error).message}</Alert>}

            <Stack spacing={2}>
                {isLoading && (
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                        <Typography color="text.secondary">Loading prompts…</Typography>
                    </Paper>
                )}

                {!isLoading && filtered.length === 0 && (
                    <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
                        <Stack spacing={1.5}>
                            <Typography sx={{ fontWeight: 700 }}>
                                {prompts.length === 0 ? "No prompts yet" : "No prompts match your search"}
                            </Typography>
                            <Typography color="text.secondary">
                                {prompts.length === 0
                                    ? "Create the first prompt template to start managing prompt text from the admin settings area."
                                    : "Try a different search term."}
                            </Typography>
                            {prompts.length === 0 && (
                                <Box>
                                    <Button variant="contained" onClick={handleOpenCreate}>
                                        Add prompt
                                    </Button>
                                </Box>
                            )}
                        </Stack>
                    </Paper>
                )}

                {filtered.map((item) => {
                    const prompt = item.prompt;
                    return (
                        <Paper key={item.key} variant="outlined" sx={{ p: 0, borderRadius: 3, overflow: "hidden" }}>
                            <Stack spacing={0}>
                                <Stack
                                    direction={{ xs: "column", md: "row" }}
                                    spacing={2}
                                    justifyContent="space-between"
                                    sx={{ px: 2.5, py: 2 }}>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75, flexWrap: "wrap" }}>
                                            <Typography sx={{ fontWeight: 800 }}>{item.key}</Typography>
                                            <Chip size="small" label="active" color="success" variant="outlined" />
                                            <Chip size="small" label={`v${item.version}`} variant="outlined" />
                                        </Stack>
                                    </Box>
                                    <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                                        <Button size="small" onClick={() => handleOpenEdit(item)}>
                                            Edit
                                        </Button>
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => {
                                                setDeleteTarget(item);
                                                setDeleteOpen(true);
                                            }}>
                                            Remove
                                        </Button>
                                    </Stack>
                                </Stack>
                                <Divider />
                                <Box sx={{ px: 2.5, py: 2, bgcolor: "background.default" }}>
                                    <Typography variant="caption" sx={{ display: "block", mb: 1, color: "text.secondary" }}>
                                        Updated {new Date(item.updated_at || item.created_at).toLocaleString()}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "text.secondary",
                                            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                                            whiteSpace: "pre-wrap",
                                            lineHeight: 1.6,
                                        }}>
                                        {promptPreview(prompt)}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    );
                })}
            </Stack>

            <Dialog open={dialogOpen} onClose={() => !upsertPrompt.isPending && setDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>{isEditing ? "Edit prompt" : "Add prompt"}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Prompt key"
                            value={draft.key}
                            onChange={(event) => setDraft((prev) => ({ ...prev, key: event.target.value }))}
                            disabled={isEditing}
                            placeholder="GENERATE"
                            fullWidth
                        />
                        <TextField
                            label="Prompt text"
                            value={draft.prompt}
                            onChange={(event) => setDraft((prev) => ({ ...prev, prompt: event.target.value }))}
                            error={Boolean(draftError)}
                            helperText={draftError ?? "Use this for the active prompt template text."}
                            fullWidth
                            multiline
                            minRows={16}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} disabled={upsertPrompt.isPending}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleSave} disabled={upsertPrompt.isPending}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteOpen} onClose={() => !deletePrompt.isPending && setDeleteOpen(false)}>
                <DialogTitle>Remove prompt</DialogTitle>
                <DialogContent>
                    <Typography>
                        Remove active version for <strong>{deleteTarget?.key}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteOpen(false)} disabled={deletePrompt.isPending}>
                        Cancel
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        disabled={deletePrompt.isPending}
                        onClick={async () => {
                            if (!deleteTarget) return;
                            await deletePrompt.mutateAsync({ key: deleteTarget.key });
                            setDeleteOpen(false);
                            setDeleteTarget(null);
                        }}>
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}
