import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import {
    Box,
    Typography,
    TextField,
    Button,
    Divider,
    Alert,
    CircularProgress,
    IconButton,
    InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuthStore } from "@/stores/useAuthStore";
import { googleLogin, emailRegister } from "@/api/auth/auth";

export default function Signup() {
    const navigate = useNavigate();
    const login = useAuthStore((s) => s.login);

    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loadingProvider, setLoadingProvider] = useState<"email" | "google" | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

    async function handleEmailSignup(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoadingProvider("email");
        try {
            const normalizedEmail = email.trim().toLowerCase();
            const res = await emailRegister(normalizedEmail, password, fullName.trim() || undefined);
            login(res.token.access_token, { id: res.id, email: res.email, full_name: res.full_name });
            navigate("/dashboard", { replace: true });
        } catch (err: any) {
            setError(err.message || "Registration failed");
        } finally {
            setLoadingProvider(null);
        }
    }

    async function handleGoogleSuccess(response: CredentialResponse) {
        if (!response.credential) {
            setError("Google Sign-In failed — no credential returned");
            return;
        }
        setError("");
        setLoadingProvider("google");
        try {
            const res = await googleLogin(response.credential);
            login(res.token.access_token, { id: res.id, email: res.email, full_name: res.full_name });
            navigate("/dashboard", { replace: true });
        } catch (err: any) {
            setError(err.message || "Google login failed");
        } finally {
            setLoadingProvider(null);
        }
    }

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                width: "100%",
                background: "radial-gradient(circle at top, #fef3c7 0%, #e0f2fe 35%, #f8fafc 100%)",
            }}>
            <Box
                sx={{
                    width: "100%",
                    maxWidth: 420,
                    mx: 2,
                    p: 5,
                    borderRadius: 4,
                    bgcolor: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(15,23,42,0.08)",
                    boxShadow: "0 24px 60px rgba(15,23,42,0.12)",
                }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 800,
                        textAlign: "center",
                        mb: 0.5,
                        color: "#0f172a",
                        letterSpacing: "-0.02em",
                    }}>
                    Create an account
                </Typography>
                <Typography
                    sx={{
                        textAlign: "center",
                        mb: 4,
                        color: "rgba(15,23,42,0.6)",
                        fontSize: 14,
                    }}>
                    Get started with Watchable for free
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Google Sign-In */}
                {googleEnabled ? (
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError("Google Sign-In failed")}
                            theme="outline"
                            size="large"
                            width="340"
                            text="signup_with"
                            shape="pill"
                            disabled={loadingProvider !== null}
                        />
                    </Box>
                ) : (
                    <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                        Google sign-up is disabled. Set `VITE_GOOGLE_CLIENT_ID` to enable it.
                    </Alert>
                )}

                <Divider sx={{ my: 3, color: "rgba(15,23,42,0.2)", "&::before, &::after": { borderColor: "rgba(15,23,42,0.1)" } }}>
                    <Typography sx={{ color: "rgba(15,23,42,0.45)", fontSize: 12, px: 2 }}>
                        or create an account with email
                    </Typography>
                </Divider>

                <Box component="form" onSubmit={handleEmailSignup} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField
                        id="signup-full-name"
                        label="Full name"
                        required
                        fullWidth
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        autoComplete="name"
                        slotProps={{ inputLabel: { sx: { color: "rgba(15,23,42,0.6)" } } }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                color: "#0f172a",
                                borderRadius: 2,
                                "& fieldset": { borderColor: "rgba(15,23,42,0.12)" },
                                "&:hover fieldset": { borderColor: "rgba(15,23,42,0.25)" },
                                "&.Mui-focused fieldset": { borderColor: "#2563eb" },
                            },
                        }}
                    />
                    <TextField
                        id="signup-email"
                        label="Email"
                        type="email"
                        required
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        slotProps={{ inputLabel: { sx: { color: "rgba(15,23,42,0.6)" } } }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                color: "#0f172a",
                                borderRadius: 2,
                                "& fieldset": { borderColor: "rgba(15,23,42,0.12)" },
                                "&:hover fieldset": { borderColor: "rgba(15,23,42,0.25)" },
                                "&.Mui-focused fieldset": { borderColor: "#2563eb" },
                            },
                        }}
                    />
                    <TextField
                        id="signup-password"
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        required
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        helperText="Min 8 chars, uppercase, lowercase, number, special char"
                        autoComplete="new-password"
                        slotProps={{
                            inputLabel: { sx: { color: "rgba(15,23,42,0.6)" } },
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            edge="end"
                                            sx={{ color: "rgba(15,23,42,0.6)" }}>
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                color: "#0f172a",
                                borderRadius: 2,
                                "& fieldset": { borderColor: "rgba(15,23,42,0.12)" },
                                "&:hover fieldset": { borderColor: "rgba(15,23,42,0.25)" },
                                "&.Mui-focused fieldset": { borderColor: "#2563eb" },
                            },
                            "& .MuiFormHelperText-root": { color: "rgba(15,23,42,0.45)" },
                        }}
                    />

                    <Button
                        id="signup-submit"
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loadingProvider !== null}
                        sx={{
                            mt: 1,
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 700,
                            fontSize: 15,
                            textTransform: "none",
                            background: "linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)",
                            boxShadow: "0 6px 18px rgba(37,99,235,0.25)",
                            "&:hover": {
                                background: "linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)",
                                boxShadow: "0 8px 22px rgba(37,99,235,0.35)",
                            },
                        }}>
                        {loadingProvider === "email" ? (
                            <CircularProgress size={22} sx={{ color: "#fff" }} />
                        ) : (
                            "Create account"
                        )}
                    </Button>
                </Box>

                <Typography sx={{ textAlign: "center", mt: 3, fontSize: 13, color: "rgba(15,23,42,0.55)" }}>
                    Already have an account?{" "}
                    <Link to="/login" style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
                        Sign in
                    </Link>
                </Typography>
            </Box>
        </Box>
    );
}
