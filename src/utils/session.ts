const SESSION_STORAGE_KEY = "ugc_session_id";

export const getSessionId = () => {
    if (typeof window === "undefined") return "";
    const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;
    const nextId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem(SESSION_STORAGE_KEY, nextId);
    return nextId;
};
