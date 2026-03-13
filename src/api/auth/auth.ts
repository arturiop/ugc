import { requestJson } from "../httpClient";

export interface AuthTokenResponse {
    access_token: string;
    token_type: string;
    expires_at: string;
}

export interface AuthUserResponse {
    id: number;
    email: string;
    full_name?: string | null;
    token: AuthTokenResponse;
}

export interface CurrentUserResponse {
    id: number;
    email: string;
    full_name?: string | null;
}

/** Authenticate via Google ID token. */
export async function googleLogin(credential: string): Promise<AuthUserResponse> {
    return requestJson<AuthUserResponse>({
        path: "/api/v1/auth/google",
        method: "POST",
        body: { credential },
    });
}

/** Register a new account with email & password. */
export async function emailRegister(email: string, password: string, full_name?: string): Promise<AuthUserResponse> {
    return requestJson<AuthUserResponse>({
        path: "/api/v1/auth/register",
        method: "POST",
        body: { email, password, full_name },
    });
}

/** Login with email & password (form-encoded). */
export async function emailLogin(email: string, password: string): Promise<AuthUserResponse> {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);
    formData.append("grant_type", "password");

    const response = await fetch(
        `${import.meta.env.VITE_APP_NGROK || "http://localhost:5050"}/api/v1/auth/login`,
        {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString(),
        }
    );

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || `Login failed (${response.status})`);
    }

    return response.json();
}

/** Fetch the current user profile from the backend. */
export async function getCurrentUser(): Promise<CurrentUserResponse> {
    return requestJson<CurrentUserResponse>({
        path: "/api/v1/auth/me",
        method: "GET",
    });
}
