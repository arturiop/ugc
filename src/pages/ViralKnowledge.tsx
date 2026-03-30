import { ChangeEvent, SyntheticEvent, useMemo, useState } from "react";
import { Alert, Box, Button, LinearProgress, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import LibraryAddCheckRoundedIcon from "@mui/icons-material/LibraryAddCheckRounded";

import AppHeader from "@/components/AppHeader";
import {
    useCreateViralKnowledgeEntry,
    useExtractViralKnowledgeFromFile,
    useExtractViralKnowledgeFromUrl,
} from "@/api/viralKnowledge/hooks";
import { ViralKnowledgePreview } from "@/api/viralKnowledge";

type InputMode = "file" | "url";

export default function ViralKnowledgePage() {
    const [mode, setMode] = useState<InputMode>("file");
    const [sourceUrl, setSourceUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [draft, setDraft] = useState<ViralKnowledgePreview | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const extractFromUrl = useExtractViralKnowledgeFromUrl();
    const extractFromFile = useExtractViralKnowledgeFromFile();
    const createEntry = useCreateViralKnowledgeEntry();

    const extractError = (extractFromUrl.error as Error | null)?.message || (extractFromFile.error as Error | null)?.message;
    const createError = (createEntry.error as Error | null)?.message;
    const isExtracting = extractFromUrl.isPending || extractFromFile.isPending;

    const canExtract = useMemo(() => {
        if (mode === "url") return Boolean(sourceUrl.trim());
        return Boolean(selectedFile);
    }, [mode, selectedFile, sourceUrl]);

    const handleModeChange = (_event: SyntheticEvent, nextMode: InputMode) => {
        if (!nextMode) return;
        setMode(nextMode);
        setStatusMessage(null);
    };

    const applyPreview = (nextPreview: ViralKnowledgePreview) => {
        setDraft(nextPreview);
        setStatusMessage("Extraction finished. Review the knowledge material, OCR text, and transcript before saving.");
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const nextFile = event.target.files?.[0] ?? null;
        setSelectedFile(nextFile);
        setStatusMessage(nextFile ? `Selected ${nextFile.name}` : null);
    };

    const handleExtract = async () => {
        setStatusMessage(null);
        if (mode === "url") {
            const data = await extractFromUrl.mutateAsync({ sourceUrl: sourceUrl.trim() });
            applyPreview(data.preview);
            return;
        }

        if (!selectedFile) return;
        const data = await extractFromFile.mutateAsync({ file: selectedFile });
        applyPreview(data.preview);
    };

    const handleAddToKnowledgeBase = async () => {
        if (!draft) return;
        await createEntry.mutateAsync({ preview: draft });
        setStatusMessage("Saved to the knowledge base. This entry is ready for retrieval in Watchable.");
    };

    return (
        <Box sx={{ minHeight: "100dvh", width: "100%", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
            <AppHeader />
            <Box sx={{ width: "min(1240px, 100%)", mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.05 }}>
                            Knowledge Intake
                        </Typography>
                        <Typography color="text.secondary" sx={{ maxWidth: 760, mt: 1 }}>
                            Send a reference video, extract reusable knowledge from it, review the result, then save it to
                            the knowledge base.
                        </Typography>
                    </Box>

                    <Stack direction={{ xs: "column", lg: "row" }} spacing={3} alignItems="stretch">
                        <Paper
                            variant="outlined"
                            sx={{
                                flex: "0 0 380px",
                                borderRadius: 4,
                                p: 3,
                                background:
                                    "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(246,244,240,0.9) 100%)",
                            }}
                        >
                            <Stack spacing={2.5}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        Import source
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Upload a video file now, or switch to URL mode when backend URL import is ready.
                                    </Typography>
                                </Box>

                                <Tabs value={mode} onChange={handleModeChange} sx={{ minHeight: 44 }}>
                                    <Tab
                                        value="file"
                                        icon={<UploadFileRoundedIcon fontSize="small" />}
                                        iconPosition="start"
                                        label="Video file"
                                        sx={{ textTransform: "none" }}
                                    />
                                    <Tab
                                        value="url"
                                        icon={<LinkRoundedIcon fontSize="small" />}
                                        iconPosition="start"
                                        label="Video URL"
                                        sx={{ textTransform: "none" }}
                                    />
                                </Tabs>

                                {mode === "file" ? (
                                    <Stack spacing={1.5}>
                                        <Button variant="outlined" component="label" sx={{ borderRadius: 3, py: 1.5 }}>
                                            {selectedFile ? "Replace video" : "Choose video"}
                                            <input hidden type="file" accept="video/*" onChange={handleFileChange} />
                                        </Button>
                                        <Typography variant="body2" color="text.secondary">
                                            {selectedFile
                                                ? `${selectedFile.name} • ${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
                                                : "Accepted: MP4, MOV, WebM and other browser-supported video files."}
                                        </Typography>
                                    </Stack>
                                ) : (
                                    <TextField
                                        label="Video URL"
                                        value={sourceUrl}
                                        onChange={(event) => setSourceUrl(event.target.value)}
                                        placeholder="https://www.tiktok.com/..."
                                        fullWidth
                                    />
                                )}

                                <Button
                                    variant="contained"
                                    startIcon={<AutoAwesomeRoundedIcon />}
                                    onClick={handleExtract}
                                    disabled={!canExtract || isExtracting}
                                    sx={{
                                        borderRadius: 999,
                                        py: 1.2,
                                        textTransform: "none",
                                        fontWeight: 700,
                                        boxShadow: "0 14px 24px rgba(255, 106, 26, 0.22)",
                                    }}
                                >
                                    {isExtracting ? "Extracting..." : "Extract data"}
                                </Button>

                                {isExtracting && <LinearProgress />}

                                <Box
                                    sx={{
                                        borderRadius: 3,
                                        p: 2,
                                        bgcolor: "rgba(91, 97, 255, 0.06)",
                                        border: "1px solid rgba(91, 97, 255, 0.12)",
                                    }}
                                >
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                        Expected extraction
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        Transcript, OCR text, scene structure, and polished knowledge material.
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>

                        <Paper
                            variant="outlined"
                            sx={{
                                flex: 1,
                                borderRadius: 4,
                                p: 3,
                                minHeight: 560,
                                bgcolor: "background.paper",
                                backgroundImage:
                                    "radial-gradient(circle at top right, rgba(255, 106, 26, 0.08), transparent 28%), radial-gradient(circle at left bottom, rgba(91, 97, 255, 0.08), transparent 24%)",
                            }}
                        >
                            <Stack spacing={2}>
                                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                            Extracted draft
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            This is the reusable knowledge extracted from the video.
                                        </Typography>
                                    </Box>
                                    {/* <Button
                                        variant="contained"
                                        color="secondary"
                                        startIcon={<LibraryAddCheckRoundedIcon />}
                                        onClick={handleAddToKnowledgeBase}
                                        disabled={!draft || createEntry.isPending}
                                        sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
                                    >
                                        {createEntry.isPending ? "Saving..." : "Add to knowledge base"}
                                    </Button> */}
                                </Stack>

                                {statusMessage && <Alert severity="success">{statusMessage}</Alert>}
                                {extractError && <Alert severity="error">{extractError}</Alert>}
                                {createError && <Alert severity="error">{createError}</Alert>}

                                {!draft ? (
                                    <Box
                                        sx={{
                                            flex: 1,
                                            minHeight: 360,
                                            borderRadius: 4,
                                            border: "1px dashed",
                                            borderColor: "divider",
                                            display: "grid",
                                            placeItems: "center",
                                            px: 4,
                                        }}
                                    >
                                        <Stack spacing={1} alignItems="center" textAlign="center">
                                            <AutoAwesomeRoundedIcon color="disabled" />
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                No extraction yet
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
                                                Import a reference video first. The transcript, OCR text, and polished
                                                knowledge material will appear here.
                                            </Typography>
                                        </Stack>
                                    </Box>
                                ) : (
                                    <Stack spacing={2.5}>
                                        <InfoBlock
                                            label="Polished Knowledge Material"
                                            value={draft.knowledgeMaterial || "Knowledge material is not ready yet."}
                                        />

                                        <InfoBlock
                                            label="OCR Text"
                                            value={draft.ocrText || "No readable on-screen text was detected yet."}
                                        />

                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                                                Transcript
                                            </Typography>
                                            <TextField
                                                value={draft.transcript || "Transcript is not ready yet."}
                                                fullWidth
                                                multiline
                                                minRows={12}
                                                InputProps={{ readOnly: true }}
                                            />
                                        </Box>
                                    </Stack>
                                )}
                            </Stack>
                        </Paper>
                    </Stack>
                </Stack>
            </Box>
        </Box>
    );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, flex: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.8 }}>
                {label}
            </Typography>
            <Typography variant="body1" sx={{ mt: 0.75, whiteSpace: "pre-wrap" }}>
                {value}
            </Typography>
        </Paper>
    );
}
