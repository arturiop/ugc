import { Box } from "@mui/material";
import { motion } from "framer-motion";
const MotionSpan = motion(Box);

const letters = ["G", "A", "M", "E", "", "I", "S", "", "O", "N"];

export default function Hero() {
    return (
        <Box
            component="section"
            sx={{
                height: "100vh",
                bgcolor: "background.default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                fontFamily: '"Satoshi", system-ui, sans-serif',
                fontWeight: 800,
                letterSpacing: "-0.04em",
            }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: { xs: 1, md: 1.5 },
                }}>
                {letters.map((char, i) => (
                    <MotionSpan
                        key={i}
                        initial={{
                            y: -80,
                            opacity: 0,
                        }}
                        animate={{
                            y: 0,
                            opacity: 1,
                        }}
                        transition={{
                            delay: i * 0.3,
                            duration: 0.8,
                            ease: "easeOut",
                        }}
                        sx={{
                            fontSize: "clamp(64px, 14vw, 180px)",
                            fontWeight: 800,
                            lineHeight: 0.95,
                            color: "text.primary",
                            userSelect: "none",
                            display: "inline-block",
                            whiteSpace: "pre",
                        }}>
                        {char || "\u00A0"}
                    </MotionSpan>
                ))}
            </Box>
        </Box>
    );
}
