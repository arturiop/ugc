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

const API_BASE_URL = import.meta.env.VITE_APP_NGROK || "http://localhost:5050";

const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const isUser = message.role === "user";

    return (
        <ListItem
            disableGutters
            sx={{
                justifyContent: isUser ? "flex-end" : "flex-start",
                px: 1,
            }}
        >
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
                    boxShadow: isUser
                        ? "0px 18px 35px rgba(25, 118, 210, 0.24)"
                        : "0px 12px 30px rgba(15, 23, 42, 0.06)",
                }}
            >
                <Stack spacing={1}>
                    {message.imageUrl && (
                        <Box
                            component="img"
                            src={message.imageUrl}
                            alt="Uploaded"
                            sx={{
                                width: "100%",
                                maxWidth: 280,
                                borderRadius: 1.5,
                                border: "1px solid",
                                borderColor: "divider",
                            }}
                        />
                    )}
                    <Typography
                        variant="body1"
                        sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                    >
                        {message.content}
                    </Typography>
                </Stack>
            </Paper>
        </ListItem>
    );
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
                    Start a conversation to see messages here.
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
            }}
        >
            <List sx={{ py: 2 }}>
                {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                ))}
            </List>
        </Box>
    );
};

const ProviderSelector = ({
    provider,
    onChange,
}: {
    provider: Provider;
    onChange: (value: Provider) => void;
}) => (
    <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="provider-select-label">Provider</InputLabel>
        <Select
            labelId="provider-select-label"
            value={provider}
            label="Provider"
            onChange={(event) => onChange(event.target.value as Provider)}
        >
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
    imagePreview,
    onPickImage,
    isSending,
}: {
    input: string;
    setInput: (value: string) => void;
    onSend: () => void;
    imagePreview?: string;
    onPickImage: (file: File | null) => void;
    isSending: boolean;
}) => {
    const fileInputId = "chat-upload-input";

    return (
        <Box sx={{ p: 2 }}>
            <Stack spacing={2}>
                {imagePreview && (
                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box
                                component="img"
                                src={imagePreview}
                                alt="Preview"
                                sx={{ width: 72, height: 72, borderRadius: 1, objectFit: "cover" }}
                            />
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => onPickImage(null)}
                            >
                                Remove image
                            </Button>
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
                                onChange={(event) => {
                                    const file = event.target.files?.[0] ?? null;
                                    onPickImage(file);
                                }}
                            />
                        </IconButton>
                    </Tooltip>
                    <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        maxRows={6}
                        placeholder="Type your message..."
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
    onImageUploaded?: (url: string) => void;
};

const ChatPane = ({ onImageUploaded }: ChatPaneProps) => {
    const [provider, setProvider] = useState<Provider>("ollama");
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "Hi! Ask a question or upload an image to start chatting.",
        },
    ]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
    const [isSending, setIsSending] = useState(false);

    const handlePickImage = (file: File | null) => {
        setImageFile(file);
        if (!file) {
            setImagePreview(undefined);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setImagePreview(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const uploadImage = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_BASE_URL}/api/upload`, {
            headers: {
                "ngrok-skip-browser-warning": "1",
            },
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to upload image.");
        }

        const payload = (await response.json()) as { url: string };
        if (!payload.url) {
            throw new Error("Upload response missing url.");
        }

        const url = payload.url.startsWith("http") ? payload.url : `${API_BASE_URL}${payload.url}`;
        console.log('API_BASE_URL', url)
        return url
    };

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed && !imageFile) return;

        setIsSending(true);

        const localImagePreview = imagePreview;
        let uploadedImageUrl: string | undefined;

        const newMessage: ChatMessage = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            role: "user",
            content: trimmed || "Shared an image.",
            imageUrl: localImagePreview,
        };

        const assistantMessageId = `assistant-${Date.now()}-${Math.random()
            .toString(16)
            .slice(2)}`;
        const assistantMessage: ChatMessage = {
            id: assistantMessageId,
            role: "assistant",
            content: "",
        };

        setMessages((prev) => [...prev, newMessage, assistantMessage]);
        setInput("");
        setImageFile(null);
        setImagePreview(undefined);

        try {
            if (imageFile) {
                uploadedImageUrl = await uploadImage(imageFile);
                onImageUploaded?.(uploadedImageUrl);
            }

            const payloadMessages = [...messages, newMessage].map((message) => ({
                role: message.role,
                content: message.content,
            }));
            
            const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "1",
                },
                body: JSON.stringify({
                    provider,
                    messages: payloadMessages,
                    image: uploadedImageUrl,
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
                        if (line.startsWith("event:")) {
                            eventName = line.replace("event:", "").trim();
                        } else if (line.startsWith("data:")) {
                            dataLines.push(line.replace("data:", "").trim());
                        }
                    }

                    const data = dataLines.join("\n");
                    if (!data) continue;

                    if (eventName === "delta") {
                        const parsed = JSON.parse(data) as { delta?: string };
                        if (parsed.delta) {
                            setMessages((prev) =>
                                prev.map((message) =>
                                    message.id === assistantMessageId
                                        ? {
                                              ...message,
                                              content: message.content + parsed.delta,
                                          }
                                        : message
                                )
                            );
                        }
                    } else if (eventName === "error") {
                        const parsed = JSON.parse(data) as { error?: string };
                        const errorMessage = parsed.error ?? "Stream error.";
                        setMessages((prev) =>
                            prev.map((message) =>
                                message.id === assistantMessageId
                                    ? { ...message, content: errorMessage }
                                    : message
                            )
                        );
                    }
                }
            }
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Unable to send message.";
            setMessages((prev) =>
                prev.map((item) =>
                    item.id === assistantMessageId ? { ...item, content: message } : item
                )
            );
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
                }}
            >
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
                    imagePreview={imagePreview}
                    onPickImage={handlePickImage}
                    isSending={isSending}
                />
            </Box>
        </Box>
    );
};

export default ChatPane;
