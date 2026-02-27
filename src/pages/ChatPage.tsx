import { PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import ChatPane from "./chat/ChatPane";
import WorkspacePane from "./chat/WorkspacePane";

type ResizableSplitProps = PropsWithChildren<{
    left: React.ReactNode;
    right: React.ReactNode;
    initialLeftPct?: number;
    minLeftPct?: number;
    maxLeftPct?: number;
}>;

function ResizableSplit({ left, right, initialLeftPct = 30, minLeftPct = 20, maxLeftPct = 60 }: ResizableSplitProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const draggingRef = useRef(false);

    const [leftPct, setLeftPct] = useState(initialLeftPct);

    const clamp = (v: number) => Math.max(minLeftPct, Math.min(maxLeftPct, v));

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (!draggingRef.current) return;
            const el = containerRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const pct = (x / rect.width) * 100;
            setLeftPct(clamp(pct));
        };

        const onUp = () => {
            draggingRef.current = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, []);

    const leftStyle = useMemo(() => ({ flex: `${leftPct} 1 0px` }), [leftPct]);
    const rightStyle = useMemo(() => ({ flex: `${100 - leftPct} 1 0px` }), [leftPct]);

    return (
        <Box
            ref={containerRef}
            sx={{
                display: "flex",
                height: "100dvh",
                minHeight: 0,
                width: "100%",
                overflow: "hidden",
                bgcolor: "background.default",
            }}>
            {/* Left panel */}
            <Box sx={{ ...leftStyle, minWidth: 320, overflow: "hidden", display: "flex" }}>{left}</Box>

            {/* Resize handle */}
            <Box
                role="separator"
                tabIndex={0}
                onMouseDown={() => {
                    draggingRef.current = true;
                    document.body.style.cursor = "col-resize";
                    document.body.style.userSelect = "none";
                }}
                sx={{
                    width: 10,
                    position: "relative",
                    cursor: "col-resize",
                    flex: "0 0 auto",
                    "&::after": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: "50%",
                        width: 2,
                        transform: "translateX(-50%)",
                        bgcolor: "divider",
                        opacity: 0.6,
                    },
                    "&:hover::after": { opacity: 1 },
                }}
            />

            {/* Right panel */}
            <Box sx={{ ...rightStyle, minWidth: 420, overflow: "hidden", display: "flex" }}>{right}</Box>
        </Box>
    );
}

function Page() {
    const [workspaceImageUrl, setWorkspaceImageUrl] = useState<string | undefined>(undefined);
    const { chatId } = useParams();
    const navigate = useNavigate();
    const [localChatId, setLocalChatId] = useState<string | null>(null);

    useEffect(() => {
        if (chatId) return;
        const nextId =
            typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        setLocalChatId(nextId);
        navigate(`/chat/${nextId}`, { replace: true });
    }, [chatId, navigate]);

    const resolvedChatId = chatId ?? localChatId;

    if (!resolvedChatId) return null;

    return (
        <Box sx={{ height: "100dvh", width: "100%", overflow: "hidden" }}>
            <ResizableSplit
                left={<ChatPane chatId={resolvedChatId} onImageUploaded={setWorkspaceImageUrl} />}
                right={<WorkspacePane imageUrl={workspaceImageUrl} />}
            />
        </Box>
    );
}

export default Page;
