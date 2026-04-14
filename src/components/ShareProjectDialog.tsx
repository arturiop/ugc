import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { createShareToken } from "@/api/auth/auth";

type ShareProjectDialogProps = {
    open: boolean;
    onClose: () => void;
    projectId: string | null | undefined;
};

const ShareProjectDialog = ({ open, onClose, projectId }: ShareProjectDialogProps) => {
    const location = useLocation();
    const [shareLink, setShareLink] = useState("");
    const [shareError, setShareError] = useState<string | null>(null);
    const [sharePending, setSharePending] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!open) {
            setShareLink("");
            setShareError(null);
            setSharePending(false);
            setCopied(false);
        }
    }, [open]);

    const handleGenerateShare = async () => {
        if (!projectId) return;
        setSharePending(true);
        setShareError(null);
        setCopied(false);

        try {
            const share = await createShareToken(projectId);
            const isMarketplaceShare = location.pathname.startsWith("/marketplace");
            const link = new URL(
                isMarketplaceShare ? "/shared/marketplace" : `/shared/projects/${projectId}`,
                window.location.origin
            );
            if (isMarketplaceShare) {
                link.searchParams.set("projectId", projectId);
            }
            link.searchParams.set("s", share.share_key);
            setShareLink(link.toString());
        } catch (err) {
            setShareError((err as Error).message || "Failed to generate project share link.");
        } finally {
            setSharePending(false);
        }
    };

    const handleCopyShare = async () => {
        if (!shareLink) return;
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);
        } catch (err) {
            console.warn("Failed to copy link", err);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Share project</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Generate a project-only demo link. The shared token expires after 12 hours.
                    </Typography>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
                        <Button
                            variant="contained"
                            startIcon={<LinkOutlinedIcon />}
                            onClick={handleGenerateShare}
                            disabled={!projectId || sharePending}
                        >
                            Generate link
                        </Button>
                        <Typography variant="caption" color="text.secondary">
                            Recipients can work only inside this project.
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

                    {copied ? <Alert severity="success">Share link copied.</Alert> : null}
                    {shareError ? <Alert severity="error">{shareError}</Alert> : null}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ShareProjectDialog;
