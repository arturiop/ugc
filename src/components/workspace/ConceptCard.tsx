import { Box, Stack, Typography } from "@mui/material";
import type { Storyboard } from "@/api/storyboard";

type Props = {
    storyboard: Storyboard;
};

const ConceptCard = ({ storyboard }: Props) => {
    const details = [
        { label: "Audience", value: storyboard.audience },
        { label: "Platform", value: storyboard.platform },
        { label: "Tone", value: storyboard.tone },
        { label: "Hook", value: storyboard.hook },
        { label: "CTA", value: storyboard.cta },
        { label: "Key message", value: storyboard.key_message },
    ].filter((item) => item.value) as { label: string; value: string }[];

    const assumptions = storyboard.assumptions?.filter(Boolean) ?? [];

    return (
        <Box
            sx={{
                "--studio-ink": "#101010",
                "--studio-ink-soft": "rgba(16,16,16,0.65)",
                "--studio-paper": "#f7f2e8",
                "--studio-sun": "#f4b247",
                "--studio-mint": "#16a67d",
                "--studio-border": "rgba(16,16,16,0.12)",
                "--studio-card": "rgba(255,255,255,0.82)",
                position: "relative",
                overflow: "hidden",
                p: { xs: 2.5, md: 3.5 },
                borderRadius: { xs: 3, md: 4 },
                border: "1px solid var(--studio-border)",
                bgcolor: "var(--studio-paper)",
                boxShadow: "0 20px 60px rgba(16,16,16,0.12)",
                fontFamily: "'Public Sans', sans-serif",
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    inset: "-30% 10% auto -20%",
                    height: "60%",
                    background:
                        "radial-gradient(closest-side, rgba(244,178,71,0.32), rgba(244,178,71,0) 70%)",
                }}
            />
            <Box
                sx={{
                    position: "absolute",
                    inset: "auto -10% -20% 40%",
                    height: "55%",
                    background:
                        "radial-gradient(closest-side, rgba(22,166,125,0.28), rgba(22,166,125,0) 70%)",
                }}
            />

            <Box sx={{ position: "relative", display: "grid", gap: { xs: 2.5, md: 3 }, zIndex: 1 }}>
                <Stack spacing={1}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: "var(--studio-ink-soft)",
                            letterSpacing: 2,
                            fontWeight: 700,
                        }}
                    >
                        Concept
                    </Typography>
                    <Typography
                        variant="h4"
                        sx={{
                            color: "var(--studio-ink)",
                            fontWeight: 700,
                            fontFamily: "'Space Grotesk', 'Public Sans', sans-serif",
                        }}
                    >
                        {storyboard.title || "Video Concept"}
                    </Typography>
                </Stack>

                <Box
                    sx={{
                        p: { xs: 2, md: 2.5 },
                        borderRadius: 3,
                        bgcolor: "var(--studio-card)",
                        border: "1px solid var(--studio-border)",
                        backdropFilter: "blur(6px)",
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        sx={{
                            color: "var(--studio-ink-soft)",
                            letterSpacing: 1.2,
                            fontWeight: 700,
                            mb: 1,
                        }}
                    >
                        CONCEPT
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: "var(--studio-ink)",
                            lineHeight: 1.7,
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        {storyboard.concept || "Concept ready."}
                    </Typography>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            mt: 2,
                            color: "var(--studio-ink-soft)",
                        }}
                    >
                        Do you want to go to more detailed scenes?
                    </Typography>
                </Box>

                {details.length > 0 && (
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                            gap: 1.5,
                        }}
                    >
                        {details.map((item) => (
                            <Box
                                key={item.label}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: "rgba(255,255,255,0.7)",
                                    border: "1px solid var(--studio-border)",
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: "block",
                                        color: "var(--studio-ink-soft)",
                                        letterSpacing: 1,
                                        textTransform: "uppercase",
                                        fontWeight: 700,
                                        mb: 0.5,
                                    }}
                                >
                                    {item.label}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "var(--studio-ink)",
                                        fontWeight: 600,
                                    }}
                                >
                                    {item.value}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                )}

                {assumptions.length > 0 && (
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: "rgba(16,16,16,0.06)",
                            border: "1px dashed rgba(16,16,16,0.18)",
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                display: "block",
                                color: "var(--studio-ink-soft)",
                                letterSpacing: 1,
                                textTransform: "uppercase",
                                fontWeight: 700,
                                mb: 1,
                            }}
                        >
                            Assumptions
                        </Typography>
                        <Stack spacing={0.5}>
                            {assumptions.map((assumption) => (
                                <Typography
                                    key={assumption}
                                    variant="body2"
                                    sx={{ color: "var(--studio-ink)" }}
                                >
                                    • {assumption}
                                </Typography>
                            ))}
                        </Stack>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default ConceptCard;
