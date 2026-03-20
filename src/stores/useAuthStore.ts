import { create } from "zustand";

const STORAGE_KEY = "ugc_auth";

export interface AuthUser {
    id: number;
    email: string;
    full_name?: string | null;
    profile_image_url?: string | null;
}

interface AuthState {
    token: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (token: string, user: AuthUser) => void;
    logout: () => void;
    setToken: (token: string | null) => void;
    setUser: (user: AuthUser) => void;
}

function getUrlToken(): string | null {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("token") || params.get("key");
}

function loadPersistedState(): { token: string | null; user: AuthUser | null } {
    const urlToken = getUrlToken();
    if (urlToken) {
        return { token: urlToken, user: null };
    }

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return { token: parsed.token ?? null, user: parsed.user ?? null };
        }
    } catch {
        /* ignore corrupt data */
    }
    return { token: null, user: null };
}

function persist(token: string | null, user: AuthUser | null) {
    if (token) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
}

const initial = loadPersistedState();

export const useAuthStore = create<AuthState>((set) => ({
    token: initial.token,
    user: initial.user,
    isAuthenticated: !!initial.token,

    login: (token, user) => {
        persist(token, user);
        set({ token, user, isAuthenticated: true });
    },

    logout: () => {
        persist(null, null);
        set({ token: null, user: null, isAuthenticated: false });
    },

    setToken: (token) => {
        set((state) => {
            const nextUser = token ? state.user : null;
            persist(token, nextUser);
            return { token, user: nextUser, isAuthenticated: !!token };
        });
    },

    setUser: (user) => {
        set((state) => {
            if (state.token) {
                persist(state.token, user);
            }
            return { user };
        });
    },
}));
