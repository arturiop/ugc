import { Box, useMediaQuery, useTheme } from "@mui/material";
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
        top?: string;
        background: string;
    };
};

function buildLiquidLayers(count: number, compact: boolean): LiquidLayer[] {
    return Array.from({ length: count }, (_, index) => {
        const width = (compact ? 30 : 42) + Math.round(Math.random() * (compact ? 12 : 22));
        const height = (compact ? 40 : 58) + Math.round(Math.random() * (compact ? 18 : 34));
        const mobileLeftSlots = [4, 28, 54];
        const mobileTopSlots = [8, 30, 52];
        const left = compact ? mobileLeftSlots[index % mobileLeftSlots.length] : -8 + Math.round(Math.random() * 58);
        const top = compact ? mobileTopSlots[index % mobileTopSlots.length] : -14 + Math.round(Math.random() * 52);
        const x1 = -24 + Math.round(Math.random() * 18);
        const x2 = -6 + Math.round(Math.random() * 20);
        const x3 = 12 + Math.round(Math.random() * 20);
        const x4 = -10 + Math.round(Math.random() * 28);
        const y1 = -14 + Math.round(Math.random() * 14);
        const y2 = 4 + Math.round(Math.random() * 16);
        const y3 = -10 + Math.round(Math.random() * 24);
        const y4 = 8 + Math.round(Math.random() * 16);
        const scaleBase = 0.92 + Math.random() * 0.08;
        const alpha = (compact ? 0.38 : 0.46) + Math.random() * (compact ? 0.12 : 0.18);
        const innerAlpha = 0.68 + Math.random() * 0.12;
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
                scale: [scaleBase, scaleBase + 0.12, scaleBase - 0.04, scaleBase + 0.07, scaleBase],
                opacity: [alpha * 0.8, alpha, alpha * 0.74, alpha * 0.92, alpha * 0.8],
            },
            transition: {
                duration: (compact ? 4.8 : 5.6) + Math.random() * (compact ? 2.8 : 4.1),
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.28,
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const liquidLayers = useMemo(() => buildLiquidLayers(isMobile ? 2 : 5, isMobile), [isMobile]);
    const gooBlur = isMobile ? 20 : 28;
    const gooStrength = isMobile ? "18 -7" : "22 -8";
    const surfaceBlur = isMobile ? 12 : 18;

    return (
        <Box
            sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                borderRadius: "inherit",
                background: "linear-gradient(135deg, #3b4047 0%, #262b33 36%, #1d2128 70%, #21262d 100%)",
            }}
        >
            <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
                <defs>
                    <filter id="storyboard-liquid-filter">
                        <feGaussianBlur in="SourceGraphic" stdDeviation={gooBlur} result="blur" />
                        <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values={`
                                1 0 0 0 0
                                0 1 0 0 0
                                0 0 1 0 0
                                0 0 0 ${gooStrength}
                            `}
                            result="goo"
                        />
                        <feBlend in="SourceGraphic" in2="goo" />
                    </filter>
                </defs>
            </svg>

            <motion.div
                animate={{
                    x: isMobile ? [-14, 18, -6, 10, -14] : [-22, 26, -8, 16, -22],
                    y: isMobile ? [-8, 8, 12, -6, -8] : [-12, 10, 18, -8, -12],
                    opacity: isMobile ? [0.68, 0.84, 0.66, 0.78, 0.68] : [0.78, 0.98, 0.74, 0.88, 0.78],
                }}
                transition={{ duration: isMobile ? 6.2 : 7.4, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: "absolute",
                    inset: isMobile ? "-10%" : "-14%",
                    background:
                        "radial-gradient(circle at 24% 18%, rgba(255,255,255,0.17) 0%, rgba(255,255,255,0.05) 18%, transparent 38%), radial-gradient(circle at 72% 18%, rgba(214,219,255,0.08) 0%, rgba(214,219,255,0.03) 14%, transparent 30%), radial-gradient(circle at 24% 76%, rgba(255,214,193,0.08) 0%, rgba(255,214,193,0.03) 14%, transparent 30%), radial-gradient(circle at 50% 52%, rgba(178,184,194,0.22) 0%, rgba(126,132,142,0.1) 18%, transparent 34%)",
                    opacity: isMobile ? 0.76 : 0.88,
                }}
            />

            <motion.div
                animate={{
                    scale: isMobile ? [0.88, 1.06, 0.94, 1.02, 0.88] : [0.8, 1.14, 0.94, 1.08, 0.8],
                    opacity: isMobile ? [0.2, 0.42, 0.24, 0.34, 0.2] : [0.24, 0.56, 0.28, 0.42, 0.24],
                    x: isMobile ? [-2, 6, -4, 8, -2] : [-4, 8, -6, 10, -4],
                    y: isMobile ? [4, -6, 3, -4, 4] : [6, -8, 4, -6, 6],
                }}
                transition={{ duration: isMobile ? 4.2 : 4.8, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: "absolute",
                    left: isMobile ? "18%" : "28%",
                    top: isMobile ? "28%" : "18%",
                    width: isMobile ? "46%" : "42%",
                    height: isMobile ? "34%" : "56%",
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle at 50% 50%, rgba(242,244,248,0.7) 0%, rgba(224,228,236,0.26) 20%, rgba(255,214,193,0.1) 30%, rgba(214,219,255,0.1) 42%, rgba(80,86,96,0.04) 56%, transparent 72%)",
                    filter: `blur(${isMobile ? 16 : 22}px)`,
                    mixBlendMode: "screen",
                }}
            />

            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    filter: `url(#storyboard-liquid-filter) blur(${surfaceBlur}px)`,
                    opacity: isMobile ? 0.84 : 0.95,
                }}
            >
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
