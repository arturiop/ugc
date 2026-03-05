import { Box, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSessionId } from "@/utils/session";
import { useNgrokImageSrc } from "@/hooks/useNgrokImageSrc";

const API_BASE_URL = import.meta.env.VITE_APP_NGROK || "http://localhost:5050";

type UploadItem = {
    id: string;
    url: string;
    filename: string;
    createdAt: string;
};

const UploadsPane = () => {
    const { projectId } = useParams();
    const [items, setItems] = useState<UploadItem[]>([]);

    useEffect(() => {
        let cancelled = false;
        if (!projectId) return;
        const load = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/project/uploads/${projectId}`, {
                    headers: { "X-Session-Id": getSessionId(), 
                        "ngrok-skip-browser-warning": "1",

                     },
                });
                if (!response.ok) return;
                const data = (await response.json()) as { items?: UploadItem[] };
                if (!cancelled) {
                    setItems(Array.isArray(data.items) ? data.items : []);
                }
            } catch {
                if (!cancelled) setItems([]);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [projectId]);


    if (items.length === 0) {
        return (
            <Paper
                elevation={0}
                variant="outlined"
                sx={{
                    p: 3,
                    borderRadius: 2.5,
                    bgcolor: "background.paper",
                    borderStyle: "dashed",
                    textAlign: "center",
                }}>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    No uploads yet
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Upload an image in a clip to preview it here.
                </Typography>
            </Paper>
        );
    }

    return (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
            {items.map((item) => (
                <UploadImageItem key={item.id} filename={item.filename} url={API_BASE_URL + item.url} />
            ))}
        </Box>
    );
};

function UploadImageItem({ filename, url }: { filename: string; url: string }) {
    const { src } = useNgrokImageSrc(url);

    return (
        <Box
            component="img"
            src={src || url}
            alt={filename}
            sx={{
                width: "100%",
                height: 220,
                objectFit: "cover",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                display: "block",
            }}
        />
    );
}

export default UploadsPane;
