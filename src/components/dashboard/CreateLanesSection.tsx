import { useState } from "react";
import { Box, Card, CardActionArea, Typography } from "@mui/material";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import { useNavigate } from "react-router-dom";
import { ProjectType } from "@/api/projects";
import { useCreateProject } from "@/api/projects/hooks";
import { LiquidPlaceholder } from "./LiquidPlaceholder";

const CREATE_LANES = [
    {
        kind: "project",
        projectType: ProjectType.Storyboard,
        label: "Ad Builder",
        title: "Build the ad before you burn credits",
        ctaLabel: "Create ad concept",
        accent: "#ff6a1a",
        previewMode: "single",
        videoSources: ["/assets/demo.mp4"],
    },
    {
        kind: "project",
        projectType: ProjectType.SatisfactionVideo,
        label: "",
        title: "Make satisfaction short ad",
        ctaLabel: "Create short ad",
        accent: "#5B61FF",
        previewMode: "triptych",
        videoSources: ["/assets/demo_s.mp4", "/assets/demo_s.mp4", "/assets/demo_s.mp4"],
    },
] as const;

function LanePreview({
    previewMode,
    videoSources,
    accent,
}: {
    previewMode: "single" | "triptych";
    videoSources: readonly string[];
    accent: string;
}) {
    if (previewMode === "triptych") {
        return (
            <>
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "radial-gradient(circle at top left, rgba(91, 97, 255, 0.32), transparent 42%), linear-gradient(180deg, rgba(12, 16, 24, 0.78) 0%, rgba(12, 16, 24, 0.3) 34%, rgba(12, 16, 24, 0.88) 100%)",
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        gap: { xs: 0.8, md: 1.1 },
                        px: { xs: 1.4, md: 1.8 },
                        pt: 1.4,
                        pb: { xs: 2.4, md: 2.8 },
                    }}
                >
                    {videoSources.map((videoSrc, index) => (
                        <Box
                            key={`${videoSrc}-${index}`}
                            sx={{
                                position: "relative",
                                width: { xs: "30%", md: "29%" },
                                maxWidth: 92,
                                aspectRatio: "9 / 16",
                                overflow: "hidden",
                                borderRadius: 2.5,
                                border: "1px solid rgba(255,255,255,0.16)",
                                boxShadow: "0 14px 28px rgba(0,0,0,0.28)",
                                background: "#0b0f16",
                                transform:
                                    index === 0
                                        ? "translateY(8px) rotate(-4deg)"
                                        : index === 2
                                          ? "translateY(10px) rotate(4deg)"
                                          : "translateY(-6px)",
                            }}
                        >
                            <Box
                                component="video"
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                src={videoSrc}
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                    backgroundColor: "#0b0f16",
                                }}
                            />
                            <Box
                                sx={{
                                    position: "absolute",
                                    inset: 0,
                                    border: `1px solid ${accent}22`,
                                    borderRadius: 2.5,
                                    pointerEvents: "none",
                                }}
                            />
                        </Box>
                    ))}
                </Box>
            </>
        );
    }

    return (
        <Box
            component="video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            src={videoSources[0]}
            sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
            }}
        />
    );
}

export function CreateLanesSection() {
    const navigate = useNavigate();
    const createProject = useCreateProject();
    const [creatingProjectType, setCreatingProjectType] = useState<ProjectType | null>(null);

    const handleCreateProject = async (projectType: ProjectType) => {
        setCreatingProjectType(projectType);

        try {
            const data = await createProject.mutateAsync(projectType);
            const id = data?.short_id || data?.uuid;

            if (id) {
                navigate(`/projects/${id}`);
                return;
            }

            console.error("Project created but id missing", data);
        } catch (error) {
            console.error("Failed to create project", error);
        } finally {
            setCreatingProjectType(null);
        }
    };

    return (
        <Box sx={{ width: "100%", mt: { xs: 0, md: 3 } }}>
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    px: { xs: 0, xl: 6 },
                    justifyContent: "space-around",
                    rowGap: { xs: 1.5, md: 2 },
                }}>
                {CREATE_LANES.map((lane) => {
                    const isCreating = createProject.isPending && creatingProjectType === lane.projectType;
                    const ctaText = isCreating ? "Creating project..." : lane.ctaLabel;

                    return (
                        <Card
                            key={lane.projectType}
                            sx={{
                                width: { xs: "100%", md: "calc((100% - 72px) / 3)" },
                                minWidth: 0,
                                borderRadius: 3.5,
                                bgcolor: "#0d1015",
                                boxShadow: "0 14px 32px rgba(8, 10, 14, 0.12)",
                                overflow: "hidden",
                                transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease",
                                "&:hover": {
                                    transform: createProject.isPending ? "none" : "translateY(-2px)",
                                    boxShadow: createProject.isPending ? "0 14px 32px rgba(8, 10, 14, 0.12)" : "0 18px 36px rgba(8, 10, 14, 0.18)",
                                },
                            }}>
                            <CardActionArea
                                component="button"
                                disabled={createProject.isPending}
                                onClick={() => handleCreateProject(lane.projectType)}
                                sx={{
                                    display: "block",
                                    width: "100%",
                                    height: "100%",
                                }}>
                                <Box
                                    sx={{
                                        position: "relative",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "flex-end",
                                        minHeight: { xs: 176, sm: 188, md: 198 },
                                        textAlign: "left",
                                        color: "common.white",
                                        backgroundColor: "#10141b",
                                        "&::before": {
                                            content: '""',
                                            position: "absolute",
                                            inset: 0,
                                            background: "linear-gradient(180deg, rgba(8, 11, 16, 0.08) 0%, rgba(8, 11, 16, 0.24) 34%, rgba(8, 11, 16, 0.84) 100%)",
                                            zIndex: 1,
                                        },
                                    }}>
                                    <LanePreview
                                        previewMode={lane.previewMode}
                                        videoSources={lane.videoSources}
                                        accent={lane.accent}
                                    />
                                    {lane.label ? (
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                top: 10,
                                                left: 10,
                                                zIndex: 5,
                                                py: 0.32,
                                                borderRadius: 999,
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 0.55,
                                                width: "fit-content",
                                                bgcolor: "rgba(255,255,255,0.16)",
                                                border: "1px solid rgba(255,255,255,0.18)",
                                                backdropFilter: "blur(10px)",
                                                boxShadow: "0 8px 18px rgba(0,0,0,0.16)",
                                                px: 1.05,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 5,
                                                    height: 5,
                                                    borderRadius: "50%",
                                                    bgcolor: lane.accent,
                                                    flexShrink: 0,
                                                }}
                                            />
                                            <Typography
                                                sx={{
                                                    fontSize: { xs: "0.64rem", sm: "0.68rem" },
                                                    fontWeight: 700,
                                                    color: "rgba(255,255,255,0.98)",
                                                    letterSpacing: "0.06em",
                                                    textTransform: "uppercase",
                                                    lineHeight: 1,
                                                }}
                                            >
                                                {lane.label}
                                            </Typography>
                                        </Box>
                                    ) : null}
                                    <Box
                                        sx={{
                                            m: 1.2,
                                            zIndex: 5,
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-start",
                                            gap: 1,
                                        }}
                                    >
                                        <Box>
                                            <Typography
                                                sx={{
                                                    fontSize: { xs: "1.06rem", sm: "1.14rem" },
                                                    fontWeight: 800,
                                                    color: "rgba(255,255,255,0.98)",
                                                    letterSpacing: "-0.01em",
                                                    lineHeight: 1.08,
                                                }}
                                            >
                                                {lane.title}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                px: 1.5,
                                                py: 0.9,
                                                borderRadius: 999,
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 0.8,
                                                width: "fit-content",
                                                bgcolor: lane.accent,
                                                color: "#fff",
                                                boxShadow: `0 12px 24px ${lane.accent}44`,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: { xs: "0.82rem", sm: "0.88rem" },
                                                    fontWeight: 800,
                                                    letterSpacing: "-0.01em",
                                                }}
                                            >
                                                {ctaText}
                                            </Typography>
                                            {!isCreating && <ArrowOutwardRoundedIcon sx={{ fontSize: 16, color: "inherit" }} />}
                                        </Box>
                                    </Box>
                                </Box>
                            </CardActionArea>
                        </Card>
                    );
                })}
                <Card
                    sx={{
                        display: { xs: "none", md: "block" },
                        width: { md: "calc((100% - 72px) / 3)" },
                        minWidth: 0,
                        borderRadius: 3.5,
                        bgcolor: "#0d1015",
                        boxShadow: "0 14px 32px rgba(8, 10, 14, 0.12)",
                        overflow: "hidden",
                        transition: "transform .18s ease, box-shadow .18s ease",
                        "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 18px 36px rgba(8, 10, 14, 0.18)",
                        },
                    }}>
                    <Box
                        sx={{
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-end",
                            minHeight: { md: 198 },
                            p: 1.2,
                            color: "common.white",
                            overflow: "hidden",
                        }}>
                        <Box
                            sx={{
                                position: "absolute",
                                inset: 0,
                            }}>
                            <LiquidPlaceholder />
                        </Box>
                        <Box
                            sx={{
                                position: "absolute",
                                inset: 0,
                                background:
                                    "radial-gradient(circle at top left, rgba(61,217,162,0.18), transparent 38%), linear-gradient(180deg, rgba(8, 11, 16, 0.12) 0%, rgba(8, 11, 16, 0.18) 28%, rgba(8, 11, 16, 0.84) 100%)",
                            }}
                        />
                        <Box
                            sx={{
                                position: "relative",
                                zIndex: 1,
                                px: 0.95,
                                py: 0.72,
                                borderRadius: 999,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.7,
                                width: "fit-content",
                                bgcolor: "rgba(255,255,255,0.08)",
                                border: "1px solid rgba(255,255,255,0.12)",
                                backdropFilter: "blur(10px)",
                            }}>
                            <Typography
                                sx={{
                                    fontSize: { xs: "1rem", sm: "1.08rem" },
                                    fontWeight: 800,
                                    color: "rgba(255,255,255,0.98)",
                                    letterSpacing: "-0.01em",
                                    px: 1,
                                }}>
                                New formats and creation flows are on the way
                            </Typography>
                        </Box>
                    </Box>
                </Card>
            </Box>
        </Box>
    );
}
