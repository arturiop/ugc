import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, List, ListItemButton, ListItemText, Paper, Stack, Typography } from "@mui/material";
import { getSessionId } from "@/utils/session";

const API_BASE_URL = import.meta.env.VITE_APP_NGROK || "http://localhost:5050";

type ChatSummary = {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
};

const HistoryPane = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<ChatSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/chat/history`, {
                    headers: { "X-Session-Id": getSessionId() },
                });
                if (!response.ok) throw new Error("Unable to load chat history.");
                const data = (await response.json()) as { items?: ChatSummary[] };
                if (!cancelled) {
                    setItems(Array.isArray(data.items) ? data.items : []);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Unable to load chat history.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200 }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (error) {
        return (
            <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {error}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Please refresh to try again.
                </Typography>
            </Paper>
        );
    }

    if (items.length === 0) {
        return (
            <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    No previous chats yet
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Start a new chat to see it here.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper variant="outlined" sx={{ p: 1.5 }}>
            <List disablePadding>
                {items.map((item) => (
                    <ListItemButton key={item.id} onClick={() => navigate(`/chat/${item.id}/studio`)} sx={{ borderRadius: 1 }}>
                        <ListItemText
                            primary={
                                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                        {item.title || "New chat"}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(item.updatedAt).toLocaleDateString()}
                                    </Typography>
                                </Stack>
                            }
                        />
                    </ListItemButton>
                ))}
            </List>
        </Paper>
    );
};

export default HistoryPane;
