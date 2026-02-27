export type Provider = "openai" | "google" | "ollama";

export type ChatMessage = {
    id: string;
    role: "user" | "assistant";
    content: string;
    imageUrls?: string[];
};

export const PROVIDERS: { value: Provider; label: string }[] = [
    // { value: "openai", label: "OpenAI" },
    { value: "google", label: "Google" },
    // { value: "ollama", label: "Ollama" },
];
