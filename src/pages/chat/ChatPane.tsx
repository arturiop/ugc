import { useEffect, useRef, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    List,
    ListItem,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";

import { PROVIDERS, type ChatMessage, type Provider } from "@/pages/chat/types";
import { useNgrokImageSrc } from "@/hooks/useNgrokImageSrc";

const API_BASE_URL = import.meta.env.VITE_APP_NGROK || "http://localhost:5050";

// Only make relative URLs absolute. No ngrok params, no rewriting.
const resolveAssetUrl = (url: string) => {
    if (!url) return url;
    if (url.startsWith("data:")) return url;
    return url.startsWith("http") ? url : new URL(url, API_BASE_URL).toString();
};

const MessageImage = ({ url, isUser }: { url: string; isUser: boolean }) => {
    const resolvedImageUrl = url ? resolveAssetUrl(url) : undefined;
    const { src, loading } = useNgrokImageSrc(resolvedImageUrl);

    if (!resolvedImageUrl) return null;

    return (
        <Stack spacing={0.5}>
            {loading && (
                <Typography variant="caption" color={isUser ? "inherit" : "text.secondary"}>
                    Loading image…
                </Typography>
            )}
            <Box
                component="img"
                src={src}
                alt="Uploaded"
                sx={{
                    width: "100%",
                    maxWidth: 280,
                    borderRadius: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                }}
            />
        </Stack>
    );
};

const PreviewImage = ({ url, index, onRemove }: { url: string; index: number; onRemove: (index: number) => void }) => {
    const resolvedPreview = resolveAssetUrl(url);
    const { src } = useNgrokImageSrc(resolvedPreview);

    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <Box component="img" src={src} alt={`Preview ${index + 1}`} sx={{ width: 72, height: 72, borderRadius: 1, objectFit: "cover" }} />
            <Button size="small" variant="outlined" onClick={() => onRemove(index)}>
                Remove image
            </Button>
        </Stack>
    );
};

const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const isUser = message.role === "user";
    const imageUrls = message.imageUrls ?? [];

    return (
        <ListItem
            disableGutters
            sx={{
                justifyContent: isUser ? "flex-end" : "flex-start",
                px: 1,
            }}>
            <Paper
                elevation={0}
                sx={{
                    px: 2.25,
                    py: 1.75,
                    maxWidth: "78%",
                    bgcolor: isUser ? "primary.main" : "background.paper",
                    color: isUser ? "primary.contrastText" : "text.primary",
                    border: isUser ? "none" : "1px solid",
                    borderColor: "divider",
                    borderRadius: 2.5,
                    boxShadow: isUser ? "0px 18px 35px rgba(25, 118, 210, 0.24)" : "0px 12px 30px rgba(15, 23, 42, 0.06)",
                }}>
                <Stack spacing={1}>
                    {imageUrls.length > 0 && (
                        <Stack spacing={1}>
                            {imageUrls.map((url, index) => (
                                <MessageImage key={`${url}-${index}`} url={url} isUser={isUser} />
                            ))}
                        </Stack>
                    )}

                    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {message.content}
                    </Typography>
                </Stack>
            </Paper>
        </ListItem>
    );
};

type SnapshotMessage = {
    role: "system" | "user" | "assistant";
    content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;
};

type ChatSnapshot = {
    id: string;
    provider?: string;
    createdAt: string;
    updatedAt: string;
    messages: SnapshotMessage[];
};

const snapshotToMessages = (snapshot: ChatSnapshot): any[] => {
    const mapped = snapshot.messages
        .filter((msg) => msg.role !== "system")
        .map((msg, index) => {
            if (typeof msg.content === "string") {
                return {
                    id: `${snapshot.id}-${index}`,
                    role: msg.role,
                    content: msg.content,
                };
            }

            const parts = Array.isArray(msg.content) ? msg.content : [msg.content];
            const text = parts
                .filter((part) => part.type === "text")
                .map((part) => (part.type === "text" ? part.text : ""))
                .join("\n");
            const imageUrls = parts
                .filter((part) => part.type === "image_url")
                .map((part) => ("image_url" in part ? part.image_url.url : ""))
                .filter(Boolean);

            return {
                id: `${snapshot.id}-${index}`,
                role: msg.role,
                content: text,
                imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
            };
        });

    return mapped;
};

const ChatMessages = ({ messages }: { messages: ChatMessage[] }) => {
    const scrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    if (messages.length === 0) {
        return (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography variant="body2" color="text.secondary">
                    Upload an image or start typing to begin.
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            ref={scrollRef}
            sx={{
                flex: 1,
                overflowY: "auto",
                px: 1,
                bgcolor: "background.default",
            }}>
            <List sx={{ py: 2 }}>
                {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                ))}
            </List>
        </Box>
    );
};

const ProviderSelector = ({ provider, onChange }: { provider: Provider; onChange: (value: Provider) => void }) => (
    <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="provider-select-label">Provider</InputLabel>
        <Select labelId="provider-select-label" value={provider} label="Provider" onChange={(event) => onChange(event.target.value as Provider)}>
            {PROVIDERS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ))}
        </Select>
    </FormControl>
);

const Composer = ({
    input,
    setInput,
    onSend,
    imagePreviews,
    onPickImages,
    onRemoveImage,
    isSending,
}: {
    input: string;
    setInput: (value: string) => void;
    onSend: () => void;
    imagePreviews: string[];
    onPickImages: (files: FileList | null) => void;
    onRemoveImage: (index: number) => void;
    isSending: boolean;
}) => {
    const fileInputId = "chat-upload-input";

    return (
        <Box sx={{ p: 2 }}>
            <Stack spacing={2}>
                {imagePreviews.length > 0 && (
                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                        <Stack spacing={1}>
                            {imagePreviews.map((preview, index) => (
                                <PreviewImage key={`${preview}-${index}`} url={preview} index={index} onRemove={onRemoveImage} />
                            ))}
                        </Stack>
                    </Paper>
                )}

                <Stack direction="row" spacing={1} alignItems="flex-end">
                    <Tooltip title="Upload image">
                        <IconButton component="label" color="primary">
                            <AttachFileIcon />
                            <input
                                id={fileInputId}
                                hidden
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(event) => {
                                    onPickImages(event.target.files);
                                    event.target.value = "";
                                }}
                            />
                        </IconButton>
                    </Tooltip>

                    <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        maxRows={6}
                        placeholder="Describe the product or upload an image..."
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                onSend();
                            }
                        }}
                    />

                    <Tooltip title="Send message">
                        <span>
                            <IconButton color="primary" onClick={onSend} disabled={isSending}>
                                {isSending ? <CircularProgress size={20} /> : <SendIcon />}
                            </IconButton>
                        </span>
                    </Tooltip>
                </Stack>
            </Stack>
        </Box>
    );
};

type ChatPaneProps = {
    chatId: string;
    onImageUploaded?: (url: string) => void;
};

const ChatPane = ({ chatId, onImageUploaded }: ChatPaneProps) => {
    const [provider, setProvider] = useState<Provider>("google");
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadHistory = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/chat/history/${chatId}`);
                if (!response.ok) return;
                const snapshot = (await response.json()) as ChatSnapshot;
                if (!cancelled) {
                    setMessages(snapshotToMessages(snapshot));
                }
            } catch {
                // Keep default welcome message on errors.
            }
        };

        loadHistory();
        return () => {
            cancelled = true;
        };
    }, [chatId]);

    const handlePickImages = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const nextFiles = [...imageFiles, ...Array.from(files)];
        setImageFiles(nextFiles);

        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === "string") {
                    setImagePreviews((prev) => [...prev, reader.result as string]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveImage = (index: number) => {
        setImageFiles((prev) => prev.filter((_, idx) => idx !== index));
        setImagePreviews((prev) => prev.filter((_, idx) => idx !== index));
    };

    const uploadImage = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_BASE_URL}/api/upload`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to upload image.");
        }

        const payload = (await response.json()) as { url: string };
        if (!payload.url) throw new Error("Upload response missing url.");

        return resolveAssetUrl(payload.url);
    };

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed && imageFiles.length === 0) return;

        setIsSending(true);

        const filesToUpload = [...imageFiles]; // capture BEFORE clearing
        const localImagePreviews = [...imagePreviews];
        let uploadedImageUrls: string[] = [];

        const newMessage: ChatMessage = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            role: "user",
            content: trimmed || "Shared an image.",
            imageUrls: localImagePreviews,
        };

        const assistantMessageId = `assistant-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const assistantMessage: ChatMessage = {
            id: assistantMessageId,
            role: "assistant",
            content: "",
        };

        const nextMessages = [...messages, newMessage, assistantMessage];
        setMessages(nextMessages);

        setInput("");
        setImageFiles([]);
        setImagePreviews([]);

        try {
            if (filesToUpload.length > 0) {
                uploadedImageUrls = await Promise.all(filesToUpload.map((file) => uploadImage(file)));
                if (uploadedImageUrls.length > 0) {
                    onImageUploaded?.(uploadedImageUrls[uploadedImageUrls.length - 1]);
                }

                setMessages((prev) =>
                    prev.map((message) => (message.id === newMessage.id ? { ...message, imageUrls: uploadedImageUrls } : message))
                );
            }

            // Build payload from the exact messages we just displayed (no stale state)
            const payloadMessages = nextMessages
                .filter((m) => !(m.id === assistantMessageId && m.role === "assistant"))
                .map((m) => ({ role: m.role, content: m.content }));

            const historyImageUrls = messages
                .filter((m) => m.role === "user" && Array.isArray(m.imageUrls))
                .flatMap((m) => m.imageUrls ?? [])
                .filter((url) => !url.startsWith("data:"));
            const imagesForPrompt = [...historyImageUrls, ...uploadedImageUrls].slice(-5);

            const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chatId,
                    provider,
                    messages: payloadMessages,
                    images: uploadedImageUrls,
                    promptImages: imagesForPrompt,
                }),
            });

            if (!response.ok || !response.body) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to start stream.");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                let boundary = buffer.indexOf("\n\n");

                while (boundary !== -1) {
                    const eventBlock = buffer.slice(0, boundary);
                    buffer = buffer.slice(boundary + 2);
                    boundary = buffer.indexOf("\n\n");

                    const lines = eventBlock.split("\n");
                    let eventName = "message";
                    const dataLines: string[] = [];

                    for (const line of lines) {
                        if (line.startsWith("event:")) eventName = line.replace("event:", "").trim();
                        else if (line.startsWith("data:")) dataLines.push(line.replace("data:", "").trim());
                    }

                    const data = dataLines.join("\n");
                    if (!data) continue;

                    if (eventName === "delta") {
                        const parsed = JSON.parse(data) as { delta?: string };
                        if (parsed.delta) {
                            setMessages((prev) =>
                                prev.map((message) => (message.id === assistantMessageId ? { ...message, content: message.content + parsed.delta } : message))
                            );
                        }
                    } else if (eventName === "image") {
                        const parsed = JSON.parse(data) as { data?: string; mimeType?: string; url?: string };
                        if (parsed.url) {
                            const absoluteUrl = resolveAssetUrl(parsed.url);
                            setMessages((prev) =>
                                prev.map((message) =>
                                    message.id === assistantMessageId ? { ...message, imageUrls: [...(message.imageUrls ?? []), absoluteUrl] } : message
                                )
                            );
                        } else if (parsed.data) {
                            const mimeType = parsed.mimeType ?? "image/png";
                            const imageUrl = `data:${mimeType};base64,${parsed.data}`;
                            setMessages((prev) =>
                                prev.map((message) =>
                                    message.id === assistantMessageId ? { ...message, imageUrls: [...(message.imageUrls ?? []), imageUrl] } : message
                                )
                            );
                        }
                    } else if (eventName === "error") {
                        const parsed = JSON.parse(data) as { error?: string };
                        const errorMessage = parsed.error ?? "Stream error.";
                        setMessages((prev) => prev.map((message) => (message.id === assistantMessageId ? { ...message, content: errorMessage } : message)));
                    }
                }
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to send message.";
            setMessages((prev) => prev.map((item) => (item.id === assistantMessageId ? { ...item, content: message } : item)));
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
            <Box
                sx={{
                    px: 2.5,
                    py: 2,
                    bgcolor: "background.paper",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            Chat session
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Provider: {PROVIDERS.find((item) => item.value === provider)?.label}
                        </Typography>
                    </Box>
                    <Box sx={{ flexGrow: 1 }} />
                    <ProviderSelector provider={provider} onChange={setProvider} />
                </Stack>
            </Box>

            <ChatMessages messages={messages} />
            <Divider />

            <Box sx={{ bgcolor: "background.paper" }}>
                <Composer
                    input={input}
                    setInput={setInput}
                    onSend={handleSend}
                    imagePreviews={imagePreviews}
                    onPickImages={handlePickImages}
                    onRemoveImage={handleRemoveImage}
                    isSending={isSending}
                />
            </Box>
        </Box>
    );
};

export default ChatPane;
