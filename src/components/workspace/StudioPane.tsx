import { Box, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import UGCMainWorkspaceEmptyState from "@/components/Studio";
import { useNgrokImageSrc } from "@/hooks/useNgrokImageSrc";
import { useGeneratedContent } from "@/contexts/GeneratedContentContext";
const API_BASE_URL = import.meta.env.VITE_APP_NGROK || "http://localhost:5050";

const StudioPane = () => {
    const { images } = useGeneratedContent();
    const [showVideo, setShowVideo] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const switchTimerRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (switchTimerRef.current) {
                window.clearTimeout(switchTimerRef.current);
                switchTimerRef.current = null;
            }
        };
    }, []);

    if (images.length > 0) {
        return (
            <GeneratedOutput
                images={images}
                showVideo={showVideo}
                setShowVideo={setShowVideo}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
                switchTimerRef={switchTimerRef}
            />
        );
    }

    return <UGCMainWorkspaceEmptyState />;
};

const GeneratedOutput = ({
    images,
    showVideo,
    setShowVideo,
    isGenerating,
    setIsGenerating,
    switchTimerRef,
}: {
    images: { url: string; title: string }[];
    showVideo: boolean;
    setShowVideo: React.Dispatch<React.SetStateAction<boolean>>;
    isGenerating: boolean;
    setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
    switchTimerRef: React.MutableRefObject<number | null>;
}) => {
    const latest = images[images.length - 1];
    const { src } = useNgrokImageSrc(API_BASE_URL + latest.url);

    const requestSwap = () => {
        if (switchTimerRef.current) {
            window.clearTimeout(switchTimerRef.current);
            switchTimerRef.current = null;
        }

        if (showVideo) {
            setShowVideo(false);
            setIsGenerating(false);
            return;
        }

        setIsGenerating(true);
        switchTimerRef.current = window.setTimeout(() => {
            setShowVideo(true);
            setIsGenerating(false);
            switchTimerRef.current = null;
        }, 2000);
    };

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
                bgcolor: "background.default",
                cursor: "default",
                position: "relative",
            }}
            onClick={requestSwap}
        >
            {showVideo ? (
                <Box
                    sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "background.default",
                    }}
                >
                    <Box
                        component="video"
                        src="/assets/12345.mp4"
                        controls
                        autoPlay
                        loop
                        muted
                        playsInline
                        sx={{
                            width: "min(100%, 420px)",
                            aspectRatio: "9 / 16",
                            height: "auto",
                            objectFit: "contain",
                            display: "block",
                            borderRadius: 3,
                            bgcolor: "black",
                        }}
                    />
                </Box>
            ) : (
                <Box
                    component="img"
                    src={src || latest.url}
                    alt={latest.title}
                    sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        display: "block",
                    }}
                />
            )}

            {isGenerating && (
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        bgcolor: "rgba(10, 10, 10, 0.45)",
                        display: "grid",
                        placeItems: "center",
                        overflow: "hidden",
                    }}
                >
                    <Box
                        sx={{
                            width: "100%",
                            height: "100%",
                            position: "absolute",
                            inset: 0,
                            background:
                                "linear-gradient(110deg, rgba(255,255,255,0.08) 10%, rgba(255,255,255,0.28) 45%, rgba(255,255,255,0.08) 70%)",
                            backgroundSize: "200% 100%",
                            animation: "studioShimmer 1.2s linear infinite",
                        }}
                    />
                </Box>
            )}
            <Box
                sx={{
                    "@keyframes studioShimmer": {
                        "0%": { backgroundPosition: "200% 0" },
                        "100%": { backgroundPosition: "-200% 0" },
                    },
                }}
            />
        </Box>
    );
};

export default StudioPane;
