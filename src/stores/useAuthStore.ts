import { create } from "zustand";

const STORAGE_KEY = "ugc_auth";

export interface AuthUser {
    id: number;
    email: string;
    full_name?: string | null;
    profile_image_url?: string | null;
}

export type AuthAccessMode = "user" | "shared";

interface AuthState {
    token: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
    accessMode: AuthAccessMode | null;
    sharedProjectId: string | null;
    login: (token: string, user: AuthUser) => void;
    logout: () => void;
    setToken: (token: string | null, mode?: AuthAccessMode, sharedProjectId?: string | null) => void;
    setSharedAccess: (token: string, projectId: string) => void;
    setUser: (user: AuthUser) => void;
}

function getUrlToken(): string | null {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("token") || params.get("key");
}

function getSharedProjectIdFromPath(): string | null {
    if (typeof window === "undefined") return null;
    const projectMatch = window.location.pathname.match(/^\/shared\/projects\/([^/?#]+)/);
    if (projectMatch) {
        return decodeURIComponent(projectMatch[1]);
    }

    if (window.location.pathname === "/shared/marketplace") {
        const params = new URLSearchParams(window.location.search);
        return params.get("projectId");
    }

    return null;
}

function loadPersistedState(): {
    token: string | null;
    user: AuthUser | null;
    accessMode: AuthAccessMode | null;
    sharedProjectId: string | null;
} {
    const urlToken = getUrlToken();
    const sharedProjectId = getSharedProjectIdFromPath();
    if (urlToken) {
        return {
            token: urlToken,
            user: null,
            accessMode: sharedProjectId ? "shared" : "user",
            sharedProjectId,
        };
    }

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return {
                token: parsed.token ?? null,
                user: parsed.user ?? null,
                accessMode: parsed.accessMode ?? null,
                sharedProjectId: parsed.sharedProjectId ?? null,
            };
        }
    } catch {
        /* ignore corrupt data */
    }
    return { token: null, user: null, accessMode: null, sharedProjectId: null };
}

function persist(
    token: string | null,
    user: AuthUser | null,
    accessMode: AuthAccessMode | null,
    sharedProjectId: string | null
) {
    if (token) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user, accessMode, sharedProjectId }));
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
}

const initial = loadPersistedState();

export const useAuthStore = create<AuthState>((set) => ({
    token: initial.token,
    user: initial.user,
    isAuthenticated: !!initial.token,
    accessMode: initial.accessMode,
    sharedProjectId: initial.sharedProjectId,

    login: (token, user) => {
        persist(token, user, "user", null);
        set({ token, user, isAuthenticated: true, accessMode: "user", sharedProjectId: null });
    },

    logout: () => {
        persist(null, null, null, null);
        set({ token: null, user: null, isAuthenticated: false, accessMode: null, sharedProjectId: null });
    },

    setToken: (token, mode = "user", sharedProjectId = null) => {
        set((state) => {
            const nextUser = token && mode === "user" ? state.user : null;
            const nextMode = token ? mode : null;
            const nextSharedProjectId = token && mode === "shared" ? sharedProjectId : null;
            persist(token, nextUser, nextMode, nextSharedProjectId);
            return {
                token,
                user: nextUser,
                isAuthenticated: !!token,
                accessMode: nextMode,
                sharedProjectId: nextSharedProjectId,
            };
        });
    },

    setSharedAccess: (token, projectId) => {
        persist(token, null, "shared", projectId);
        set({
            token,
            user: null,
            isAuthenticated: true,
            accessMode: "shared",
            sharedProjectId: projectId,
        });
    },

    setUser: (user) => {
        set((state) => {
            if (state.token) {
                persist(state.token, user, state.accessMode, state.sharedProjectId);
            }
            return { user };
        });
    },
}));
