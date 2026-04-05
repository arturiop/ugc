import { Box } from "@mui/material";
import { motion } from "framer-motion";
import { useMemo } from "react";

type LiquidLayer = {
    animate: {
        x: number[];
        y: number[];
        scale: number[];
        opacity: number[];
    };
    transition: {
        duration: number;
        repeat: number;
        ease: "easeInOut";
        delay: number;
    };
    style: {
        width: string;
        height: string;
        left?: string;
        right?: string;
        top?: string;
        bottom?: string;
        background: string;
    };
};

function buildLiquidLayers(): LiquidLayer[] {
    return Array.from({ length: 5 }, (_, index) => {
        const width = 42 + Math.round(Math.random() * 22);
        const height = 58 + Math.round(Math.random() * 34);
        const left = -10 + Math.round(Math.random() * 58);
        const top = -18 + Math.round(Math.random() * 52);
        const x1 = -36 + Math.round(Math.random() * 24);
        const x2 = -8 + Math.round(Math.random() * 28);
        const x3 = 18 + Math.round(Math.random() * 26);
        const x4 = -16 + Math.round(Math.random() * 44);
        const y1 = -20 + Math.round(Math.random() * 18);
        const y2 = 6 + Math.round(Math.random() * 22);
        const y3 = -12 + Math.round(Math.random() * 36);
        const y4 = 10 + Math.round(Math.random() * 22);
        const scaleBase = 0.92 + Math.random() * 0.08;
        const alpha = 0.46 + Math.random() * 0.18;
        const innerAlpha = 0.7 + Math.random() * 0.12;
        const tint =
            index % 2 === 0
                ? {
                      glow: `rgba(255, 214, 193, ${alpha * 0.45})`,
                      mid: `rgba(154, 159, 169, ${alpha * 0.92})`,
                  }
                : {
                      glow: `rgba(214, 219, 255, ${alpha * 0.45})`,
                      mid: `rgba(154, 159, 169, ${alpha * 0.92})`,
                  };

        return {
            animate: {
                x: [x1, x2, x3, x4, x1],
                y: [y1, y2, y3, y4, y1],
                scale: [scaleBase, scaleBase + 0.14, scaleBase - 0.04, scaleBase + 0.08, scaleBase],
                opacity: [alpha * 0.8, alpha, alpha * 0.72, alpha * 0.94, alpha * 0.8],
            },
            transition: {
                duration: 5.6 + Math.random() * 4.1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.35,
            },
            style: {
                width: `${width}%`,
                height: `${height}%`,
                left: `${left}%`,
                top: `${top}%`,
                background: `radial-gradient(circle at ${36 + Math.round(Math.random() * 28)}% ${34 + Math.round(Math.random() * 24)}%, rgba(232,236,242,${innerAlpha}) 0%, ${tint.glow} 18%, ${tint.mid} 34%, rgba(78,84,94,0.22) 52%, rgba(34,38,47,0.04) 78%, transparent 100%)`,
            },
        };
    });
}

export function LiquidPlaceholder() {
    const liquidLayers = useMemo(() => buildLiquidLayers(), []);

    return (
        <Box
            sx={{
                position: "relative",
                height: "100%",
                overflow: "hidden",
                borderRadius: "inherit",
                background:
                    "linear-gradient(135deg, #3b4047 0%, #262b33 36%, #1d2128 70%, #21262d 100%)",
            }}>
            <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
                <defs>
                    <filter id="storyboard-liquid-filter">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="28" result="blur" />
                        <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values="
                                1 0 0 0 0
                                0 1 0 0 0
                                0 0 1 0 0
                                0 0 0 22 -8"
                            result="goo"
                        />
                        <feBlend in="SourceGraphic" in2="goo" />
                    </filter>
                </defs>
            </svg>

            <motion.div
                animate={{
                    x: [-22, 26, -8, 16, -22],
                    y: [-12, 10, 18, -8, -12],
                    opacity: [0.78, 0.98, 0.74, 0.88, 0.78],
                }}
                transition={{ duration: 7.4, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: "absolute",
                    inset: "-14%",
                    background:
                        "radial-gradient(circle at 24% 18%, rgba(255,255,255,0.17) 0%, rgba(255,255,255,0.05) 18%, transparent 38%), radial-gradient(circle at 72% 18%, rgba(214,219,255,0.08) 0%, rgba(214,219,255,0.03) 14%, transparent 30%), radial-gradient(circle at 24% 76%, rgba(255,214,193,0.08) 0%, rgba(255,214,193,0.03) 14%, transparent 30%), radial-gradient(circle at 50% 52%, rgba(178,184,194,0.22) 0%, rgba(126,132,142,0.1) 18%, transparent 34%)",
                    opacity: 0.88,
                }}
            />

            <motion.div
                animate={{
                    scale: [0.8, 1.14, 0.94, 1.08, 0.8],
                    opacity: [0.24, 0.56, 0.28, 0.42, 0.24],
                    x: [-4, 8, -6, 10, -4],
                    y: [6, -8, 4, -6, 6],
                }}
                transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: "absolute",
                    left: "28%",
                    top: "18%",
                    width: "42%",
                    height: "56%",
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle at 50% 50%, rgba(242,244,248,0.7) 0%, rgba(224,228,236,0.26) 20%, rgba(255,214,193,0.1) 30%, rgba(214,219,255,0.1) 42%, rgba(80,86,96,0.04) 56%, transparent 72%)",
                    filter: "blur(22px)",
                    mixBlendMode: "screen",
                }}
            />

            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    filter: "url(#storyboard-liquid-filter) blur(18px)",
                    opacity: 0.95,
                }}>
                {liquidLayers.map((layer, index) => (
                    <motion.div
                        key={index}
                        animate={layer.animate}
                        transition={layer.transition}
                        style={{
                            position: "absolute",
                            borderRadius: "50%",
                            ...layer.style,
                        }}
                    />
                ))}
            </Box>

            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 14%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.12) 100%)",
                }}
            />
        </Box>
    );
}
