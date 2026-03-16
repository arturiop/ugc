import { Box } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import UGCMainWorkspaceEmptyState from "@/components/Studio";
import { useGeneratedContent } from "@/contexts/GeneratedContentContext";
import { useProjectStoryboard } from "@/api/storyboard/hooks";
import { useProject } from "@/contexts/Project/ProjectContext";
import ConceptCard from "./ConceptCard";
import ScenesPanel from "./ScenesPanel";

const StudioPane = () => {
    const { images } = useGeneratedContent();
    const { projectId } = useProject();
    const { data: storyboardData } = useProjectStoryboard(projectId);
    const storyboard = storyboardData?.storyboard ?? null;
    const [showVideo, setShowVideo] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const switchTimerRef = useRef<number | null>(null);
    console.log('storyboardData', storyboardData)
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

    if (storyboard) {
        return (
            <Box
                sx={{
                    width: "100%",
                    minHeight: "100%",
                    p: { xs: 2, md: 4 },
                    overflowY: "auto",
                    bgcolor: "#f2efe8",
                    background:
                        "radial-gradient(circle at top, rgba(255,255,255,0.8), rgba(242,239,232,0.85) 35%, rgba(232,226,210,0.92) 100%)",
                }}
            >
                <Box sx={{ maxWidth: 980, mx: "auto" }}>
                    <ConceptCard storyboard={storyboard} />
                    {storyboard.scenes?.length ? (
                        <Box sx={{ mt: 3 }}>
                            <ScenesPanel storyboard={storyboard} />
                        </Box>
                    ) : null}
                </Box>
            </Box>
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
                    src={latest.url}
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
