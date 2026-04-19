import React, { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Alert, Box, Button, Chip, Container, Paper, Stack, TextField, Typography, alpha, useTheme } from "@mui/material";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import type { ExtractedListingState, ManualImage, ManualProductDraft } from "./types";
import { isAmazonUrl } from "./utils";

const MotionBox = motion.create(Box);

const ROTATING_PLACEHOLDERS = ["your protein powder", "your serum", "your headphones", "your candle brand", "your supplement", "your matcha"];

const TRUSTED_BY = ["Liquid I.V.", "Magic Spoon", "Hydroflask", "Athletic Greens", "Fenty", "Olipop", "Aesop", "Glossier", "Native", "Loop"];

const VIBES = ["Energetic", "Minimal", "Lifestyle", "Premium", "Playful", "Editorial"];

const HERO_OVERLAYS = [
    "linear-gradient(90deg, rgba(11, 13, 18, 0.78) 0%, rgba(11, 13, 18, 0.54) 26%, rgba(11, 13, 18, 0.2) 56%, rgba(11, 13, 18, 0.1) 100%), linear-gradient(180deg, rgba(11, 13, 18, 0.18) 0%, rgba(11, 13, 18, 0.28) 42%, rgba(11, 13, 18, 0.78) 100%)",
    "linear-gradient(90deg, rgba(11, 13, 18, 0.72) 0%, rgba(11, 13, 18, 0.48) 28%, rgba(11, 13, 18, 0.18) 54%, rgba(11, 13, 18, 0.1) 100%), linear-gradient(180deg, rgba(91, 97, 255, 0.12) 0%, rgba(11, 13, 18, 0.24) 42%, rgba(11, 13, 18, 0.76) 100%)",
    "linear-gradient(90deg, rgba(11, 13, 18, 0.8) 0%, rgba(11, 13, 18, 0.5) 24%, rgba(11, 13, 18, 0.18) 54%, rgba(11, 13, 18, 0.1) 100%), linear-gradient(180deg, rgba(255, 106, 26, 0.08) 0%, rgba(11, 13, 18, 0.22) 38%, rgba(11, 13, 18, 0.8) 100%)",
];

const HERO_IMAGES = ["/assets/m_bg_img_1.png", "/assets/m_bg_img_2.png", "/assets/m_bg_img_3.png"];

type MarketplaceStartViewProps = {
    urlInput: string;
    onUrlInputChange: (value: string) => void;
    onExtractSubmit: (event: FormEvent<HTMLFormElement>) => void;
    error: string;
    isSubmitting: boolean;
    isCreatingProject: boolean;
    progressLabel: string;
    manualDraft: ManualProductDraft;
    extractedListing: ExtractedListingState;
    imageUrlFromState: string | null;
    displayImages: ManualImage[];
    canCreateProjectFromCurrentData: boolean;
    onManualFieldChange: (field: keyof Omit<ManualProductDraft, "images">) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onVibeSelect: (value: string) => void;
    onManualImagesChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onCreateProjectFromBrief: () => void;
    onReset: () => void;
};

export default function MarketplaceStartView({
    urlInput,
    onUrlInputChange,
    onExtractSubmit,
    error,
    isSubmitting,
    isCreatingProject,
    progressLabel,
    manualDraft,
    extractedListing,
    imageUrlFromState,
    displayImages,
    canCreateProjectFromCurrentData,
    onManualFieldChange,
    onVibeSelect,
    onManualImagesChange,
    onCreateProjectFromBrief,
    onReset,
}: MarketplaceStartViewProps) {
    const theme = useTheme();
    const heroText = theme.palette.common.white;
    const heroMutedText = alpha(heroText, 0.76);
    const heroSoftText = alpha(heroText, 0.64);
    const panelBg = alpha(theme.palette.background.paper, 0.92);
    const panelBorder = alpha(theme.palette.divider, 0.48);
    const panelText = theme.palette.text.primary;
    const panelMutedText = alpha(theme.palette.text.primary, 0.62);
    const panelSubtleBg = alpha(theme.palette.text.primary, 0.04);
    const uploadInputRef = useRef<HTMLInputElement | null>(null);
    const [placeholderIdx, setPlaceholderIdx] = useState(0);
    const [backgroundIdx, setBackgroundIdx] = useState(0);
    const [isImageDragActive, setIsImageDragActive] = useState(false);
    const hasDraftContent = useMemo(
        () =>
            Boolean(
                extractedListing ||
                    manualDraft.title.trim() ||
                    manualDraft.description.trim() ||
                    manualDraft.vibe.trim() ||
                    manualDraft.images.length ||
                    imageUrlFromState
            ),
        [extractedListing, imageUrlFromState, manualDraft.description, manualDraft.images.length, manualDraft.title, manualDraft.vibe]
    );

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setPlaceholderIdx((current) => (current + 1) % ROTATING_PLACEHOLDERS.length);
        }, 2400);
        return () => window.clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setBackgroundIdx((current) => (current + 1) % HERO_IMAGES.length);
        }, 4000);
        return () => window.clearInterval(intervalId);
    }, []);

    const hasUrlValue = Boolean(urlInput.trim());
    const canExtract = Boolean(urlInput.trim() && isAmazonUrl(urlInput.trim()));
    const showEditor = hasDraftContent || isSubmitting || (hasUrlValue && !canExtract);
    const title = manualDraft.title.trim();
    const handleImageFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(files[0]);
        onManualImagesChange({ target: { files: dataTransfer.files } } as ChangeEvent<HTMLInputElement>);
    };

    const handleImageDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (!isCreatingProject && !isSubmitting) {
            setIsImageDragActive(true);
        }
    };

    const handleImageDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsImageDragActive(false);
    };

    const handleImageDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsImageDragActive(false);
        if (isCreatingProject || isSubmitting) return;
        handleImageFiles(event.dataTransfer.files);
    };
    return (
        <Box
            sx={{
                width: "100%",
                minHeight: "100%",
                overflow: "auto",
                bgcolor: "background.default",
                color: heroText,
                position: "relative",
            }}>
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    overflow: "hidden",
                }}>
                {HERO_IMAGES.map((image, index) => (
                    <MotionBox
                        key={image}
                        aria-hidden
                        initial={{ opacity: index === 0 ? 1 : 0, scale: 1, x: 0, y: 0 }}
                        animate={{
                            opacity: backgroundIdx === index ? 1 : 0,
                            scale: [1, 1.08, 1],
                            x: [0, -20, 0],
                            y: [0, -12, 0],
                        }}
                        transition={{
                            opacity: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
                            scale: { duration: 16, ease: "easeInOut", repeat: Infinity, repeatType: "loop", delay: index * 0.6 },
                            x: { duration: 16, ease: "easeInOut", repeat: Infinity, repeatType: "loop", delay: index * 0.6 },
                            y: { duration: 16, ease: "easeInOut", repeat: Infinity, repeatType: "loop", delay: index * 0.6 },
                        }}
                        sx={{
                            position: "absolute",
                            inset: -40,
                            backgroundImage: `url("${image}")`,
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            backgroundSize: "cover",
                            willChange: "transform, opacity",
                            transformOrigin: "center",
                        }}
                    />
                ))}
            </Box>

            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(circle at 16% 20%, ${alpha(
                        theme.palette.secondary.main,
                        0.24
                    )} 0%, transparent 30%), radial-gradient(circle at 82% 18%, ${alpha(
                        theme.palette.primary.main,
                        0.2
                    )} 0%, transparent 24%), linear-gradient(180deg, rgba(11, 13, 18, 0.18) 0%, rgba(11, 13, 18, 0.24) 100%)`,
                }}
            />

            <AnimatePresence mode="wait">
                <MotionBox
                    key={backgroundIdx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2.8, ease: [0.22, 1, 0.36, 1] }}
                    sx={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: HERO_OVERLAYS[backgroundIdx],
                    }}
                />
            </AnimatePresence>

            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.08,
                    mixBlendMode: "overlay",
                    pointerEvents: "none",
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.9'/%3E%3C/svg%3E\")",
                    backgroundSize: "180px 180px",
                }}
            />

            <Container
                maxWidth={false}
                sx={{
                    position: "relative",
                    zIndex: 1,
                    minHeight: "100vh",
                    px: { xs: 3, sm: 4, md: 6 },
                    pt: { xs: 3, md: 4 },
                    pb: { xs: 10, md: 12 },
                    display: "flex",
                    flexDirection: "column",
                }}>
                <Box sx={{ flex: 1, display: "flex", alignItems: "flex-end" }}>
                    <Stack spacing={{ xs: 5, md: 6 }} sx={{ width: "100%", maxWidth: 920, pb: { xs: 4, md: 5 } }}>
                        {!showEditor ? (
                            <Stack spacing={3} sx={{ maxWidth: 720 }}>
                                <Typography
                                    component="h1"
                                    sx={{
                                        fontSize: { xs: "clamp(4rem, 16vw, 5.4rem)", md: "clamp(5.5rem, 9vw, 7.4rem)" },
                                        lineHeight: 0.9,
                                        letterSpacing: "-0.06em",
                                        fontWeight: 400,
                                        textWrap: "balance",
                                        maxWidth: 680,
                                    }}>
                                    One{" "}
                                    <Box component="span" sx={{ fontStyle: "italic" }}>
                                        link
                                    </Box>
                                    .
                                    <br />
                                    A thousand
                                    <br />
                                    <Box component="span" sx={{ color: "primary.main", fontStyle: "italic" }}>
                                        creatives
                                    </Box>
                                    .
                                </Typography>

                                <Typography
                                    sx={{
                                        maxWidth: 560,
                                        color: alpha(heroText, 0.84),
                                        fontSize: { xs: "1.02rem", md: "1.1rem" },
                                        lineHeight: 1.72,
                                    }}>
                                    Drop an Amazon link. We turn your product into a full set of cinematic image scenes and a scroll-stopping video — in under a minute.
                                </Typography>
                            </Stack>
                        ) : null}

                        <Stack spacing={2.25} sx={{ width: "100%", maxWidth: 820 }}>
                            <Paper
                                component="form"
                                onSubmit={onExtractSubmit}
                                elevation={0}
                                sx={{
                                    borderRadius: { xs: 3.5, md: 4 },
                                    bgcolor: panelBg,
                                    border: "1px solid",
                                    borderColor: panelBorder,
                                    boxShadow: "0 24px 80px rgba(0,0,0,0.34)",
                                    overflow: "hidden",
                                    backdropFilter: "blur(18px)",
                                }}>
                                <Stack spacing={0}>
                                    <Stack spacing={1} sx={{ px: { xs: 2, md: 3 }, py: 1.5 }}>
                                        {showEditor ? (
                                            <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: panelText }}>
                                                Product title
                                            </Typography>
                                        ) : null}
                                        <Stack direction="row" spacing={1.25} alignItems="center">
                                            <Box sx={{ position: "relative", flex: 1, minHeight: 56, display: "flex", alignItems: "center" }}>
                                                <TextField
                                                    fullWidth
                                                    value={urlInput}
                                                    disabled={isSubmitting || isCreatingProject}
                                                    onChange={(event) => onUrlInputChange(event.target.value)}
                                                    placeholder=""
                                                    variant="standard"
                                                    InputProps={{ disableUnderline: true }}
                                                    sx={{
                                                        "& .MuiInputBase-root": {
                                                            fontSize: { xs: "1rem", md: "1.1rem" },
                                                            color: panelText,
                                                            fontWeight: 500,
                                                        },
                                                        "& .MuiInputBase-input": {
                                                            py: 0,
                                                        },
                                                        "& .MuiInputBase-input::placeholder": {
                                                            color: "transparent",
                                                        },
                                                    }}
                                                />

                                                {!urlInput ? (
                                                    <Box
                                                        sx={{
                                                            position: "absolute",
                                                            inset: 0,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            pointerEvents: "none",
                                                            color: panelMutedText,
                                                            whiteSpace: "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            fontSize: { xs: "1rem", md: "1.1rem" },
                                                        }}>
                                                        <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                                                            Paste an Amazon link for&nbsp;
                                                        </Box>
                                                        <AnimatePresence mode="wait">
                                                            <motion.span
                                                                key={placeholderIdx}
                                                                initial={{ opacity: 0, y: 8 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -8 }}
                                                                transition={{ duration: 0.35 }}
                                                                style={{ display: "inline-block", fontStyle: "italic", fontWeight: 500 }}>
                                                                {ROTATING_PLACEHOLDERS[placeholderIdx]}
                                                            </motion.span>
                                                        </AnimatePresence>
                                                    </Box>
                                                ) : null}
                                            </Box>

                                            {canExtract ? (
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    disabled={isSubmitting || isCreatingProject}
                                                    sx={{
                                                        minHeight: 48,
                                                        borderRadius: 999,
                                                        px: 2.5,
                                                        textTransform: "none",
                                                        fontWeight: 800,
                                                        color: theme.palette.primary.contrastText,
                                                        bgcolor: "primary.main",
                                                        boxShadow: "none",
                                                        "&:hover": { bgcolor: "primary.dark", boxShadow: "none" },
                                                    }}>
                                                    {isSubmitting ? "Reading product..." : "Extract"}
                                                </Button>
                                            ) : null}
                                        </Stack>
                                    </Stack>

                                    <AnimatePresence initial={false} mode="popLayout">
                                        {showEditor ? (
                                            <MotionBox
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -6 }}
                                                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                                                sx={{
                                                    overflow: "hidden",
                                                    borderTop: "1px solid",
                                                    borderColor: alpha(theme.palette.divider, 0.9),
                                                    minHeight: { md: 540 },
                                                    willChange: "transform, opacity",
                                                }}>
                                                <Stack spacing={3} sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 2.5 } }}>
                                                    {error ? (
                                                        <Alert
                                                            severity="error"
                                                            sx={{
                                                                borderRadius: 3,
                                                                bgcolor: alpha("#D64545", 0.06),
                                                                color: "error.main",
                                                            }}>
                                                            {error}
                                                        </Alert>
                                                    ) : null}

                                                    <TextField
                                                        fullWidth
                                                        multiline
                                                        minRows={5}
                                                        maxRows={8}
                                                        value={manualDraft.description}
                                                        onChange={onManualFieldChange("description")}
                                                        placeholder="What the product is, who it is for, and what should stand out."
                                                        sx={{
                                                            "& .MuiInputBase-root": {
                                                                alignItems: "flex-start",
                                                            },
                                                            "& textarea": {
                                                                overflowY: "auto !important",
                                                            },
                                                        }}
                                                    />

                                                    <Box
                                                        sx={{
                                                            display: "grid",
                                                            gridTemplateColumns: { xs: "1fr", lg: "0.88fr 0.92fr" },
                                                            gap: 2.25,
                                                            alignItems: "start",
                                                        }}>
                                                        <Stack spacing={1.25}>
                                                            <Box>
                                                                <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: panelText }}>
                                                                    Image setup
                                                                </Typography>
                                                                <Typography sx={{ color: panelMutedText, fontSize: "0.9rem", mt: 0.5 }}>
                                                                    Drop one image or click to upload.
                                                                </Typography>
                                                            </Box>

                                                            <Box
                                                                role="button"
                                                                tabIndex={0}
                                                                onClick={() => {
                                                                    if (!isCreatingProject && !isSubmitting) {
                                                                        uploadInputRef.current?.click();
                                                                    }
                                                                }}
                                                                onKeyDown={(event) => {
                                                                    if ((event.key === "Enter" || event.key === " ") && !isCreatingProject && !isSubmitting) {
                                                                        event.preventDefault();
                                                                        uploadInputRef.current?.click();
                                                                    }
                                                                }}
                                                                onDragOver={handleImageDragOver}
                                                                onDragLeave={handleImageDragLeave}
                                                                onDrop={handleImageDrop}
                                                                sx={{
                                                                    position: "relative",
                                                                    borderRadius: 3,
                                                                    border: "1px dashed",
                                                                    borderColor: isImageDragActive ? "primary.main" : alpha(theme.palette.divider, 0.9),
                                                                    bgcolor: isImageDragActive ? alpha(theme.palette.primary.main, 0.06) : panelSubtleBg,
                                                                    minHeight: 180,
                                                                    overflow: "hidden",
                                                                    cursor: isCreatingProject || isSubmitting ? "default" : "pointer",
                                                                    transition: "border-color 160ms ease, background-color 160ms ease, transform 160ms ease",
                                                                    transform: isImageDragActive ? "scale(0.995)" : "none",
                                                                    outline: "none",
                                                                }}>
                                                                <Box
                                                                    component="input"
                                                                    ref={uploadInputRef}
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(event: ChangeEvent<HTMLInputElement>) => handleImageFiles(event.target.files)}
                                                                    sx={{ display: "none" }}
                                                                />

                                                                {displayImages.length > 0 ? (
                                                                    <Box sx={{ p: 1.25 }}>
                                                                        <ImageTile src={displayImages[0].previewUrl} alt={displayImages[0].file.name} fit="cover" />
                                                                    </Box>
                                                                ) : imageUrlFromState ? (
                                                                    <Box sx={{ p: 1.25 }}>
                                                                        <ImageTile src={imageUrlFromState} alt={title || "Product image"} fit="contain" />
                                                                    </Box>
                                                                ) : (
                                                                    <Stack
                                                                        spacing={1}
                                                                        alignItems="center"
                                                                        justifyContent="center"
                                                                        sx={{ minHeight: 180, px: 3, textAlign: "center" }}>
                                                                        <UploadRoundedIcon sx={{ color: alpha(panelText, 0.48) }} />
                                                                        <Typography sx={{ color: panelMutedText }}>
                                                                            Drop one image or upload
                                                                        </Typography>
                                                                    </Stack>
                                                                )}
                                                            </Box>
                                                        </Stack>

                                                        <Stack spacing={2}>
                                                            <Box>
                                                                <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: panelText }}>
                                                                    Styles setup
                                                                </Typography>
                                                                <Typography sx={{ color: panelMutedText, fontSize: "0.9rem", mt: 0.5 }}>
                                                                    Describe the visual direction or pick a quick preset.
                                                                </Typography>
                                                            </Box>

                                                            <TextField
                                                                fullWidth
                                                                size="small"
                                                                value={manualDraft.vibe}
                                                                onChange={onManualFieldChange("vibe")}
                                                                placeholder="Clean, energetic, premium creator-style"
                                                            />

                                                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                                {VIBES.map((vibe) => {
                                                                    const active = manualDraft.vibe === vibe;
                                                                    return (
                                                                        <Chip
                                                                            key={vibe}
                                                                            label={vibe}
                                                                            onClick={() => onVibeSelect(active ? "" : vibe)}
                                                                            clickable
                                                                            sx={{
                                                                                borderRadius: 999,
                                                                                fontWeight: 700,
                                                                                bgcolor: active ? "secondary.main" : panelSubtleBg,
                                                                                color: active ? "secondary.contrastText" : "text.secondary",
                                                                            }}
                                                                        />
                                                                    );
                                                                })}
                                                            </Stack>
                                                        </Stack>
                                                    </Box>

                                                    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="flex-end">
                                                        <Button
                                                            type="button"
                                                            variant="contained"
                                                            disabled={!canCreateProjectFromCurrentData || isCreatingProject}
                                                            onClick={onCreateProjectFromBrief}
                                                            sx={{
                                                                minWidth: { xs: "100%", md: 240 },
                                                                minHeight: 48,
                                                                borderRadius: 999,
                                                                textTransform: "none",
                                                                fontWeight: 800,
                                                                color: theme.palette.secondary.contrastText,
                                                                bgcolor: "secondary.main",
                                                                px: 2.75,
                                                                boxShadow: "none",
                                                                "&:hover": { bgcolor: "secondary.dark", boxShadow: "none" },
                                                            }}>
                                                            {isCreatingProject ? "Creating..." : "Make creatives"}
                                                        </Button>
                                                    </Stack>
                                                </Stack>
                                            </MotionBox>
                                        ) : null}
                                    </AnimatePresence>
                                </Stack>
                            </Paper>

                            {!showEditor ? (
                                <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={{ xs: 1.5, sm: 2.25 }}
                                    alignItems={{ xs: "flex-start", sm: "center" }}
                                    flexWrap="wrap"
                                    useFlexGap
                                    sx={{ color: heroMutedText, px: 0.5 }}>
                                    <Typography sx={{ fontSize: "0.92rem", color: heroSoftText }}>No credit card. Free to try.</Typography>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: 999,
                                                bgcolor: "primary.main",
                                                boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.18)}`,
                                            }}
                                        />
                                        <Typography sx={{ fontSize: "0.92rem", color: heroMutedText }}>12,847 creatives generated this week</Typography>
                                    </Stack>
                                </Stack>
                            ) : null}
                        </Stack>
                    </Stack>
                </Box>

                <Box
                    sx={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        overflow: "hidden",
                        borderTop: "1px solid",
                        borderColor: alpha(theme.palette.common.white, 0.12),
                        bgcolor: alpha(theme.palette.background.default, 0.46),
                        backdropFilter: "blur(10px)",
                        py: 1.75,
                    }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ px: { xs: 3, md: 5 } }}>
                        <Typography
                            sx={{
                                color: alpha(heroText, 0.52),
                                fontSize: "0.68rem",
                                letterSpacing: "0.22em",
                                textTransform: "uppercase",
                                display: { xs: "none", md: "block" },
                                whiteSpace: "nowrap",
                            }}>
                            Trusted by
                        </Typography>
                        <Box sx={{ overflow: "hidden", flex: 1 }}>
                            <MotionBox
                                animate={{ x: ["0%", "-50%"] }}
                                transition={{ duration: 24, ease: "linear", repeat: Infinity }}
                                sx={{ display: "flex", width: "max-content", gap: 6 }}>
                                {[...TRUSTED_BY, ...TRUSTED_BY].map((brand, index) => (
                                    <Typography
                                        key={`${brand}-${index}`}
                                        sx={{
                                            color: heroSoftText,
                                            fontSize: { xs: "0.95rem", md: "1rem" },
                                            fontWeight: 500,
                                            letterSpacing: "-0.03em",
                                            whiteSpace: "nowrap",
                                        }}>
                                        {brand}
                                    </Typography>
                                ))}
                            </MotionBox>
                        </Box>
                    </Stack>
                </Box>
            </Container>
        </Box>
    );
}

function ImageTile({ src, alt, fit }: { src: string; alt: string; fit: "contain" | "cover" }) {
    return (
        <Box
            sx={{
                width: "100%",
                aspectRatio: "1 / 0.72",
                maxHeight: 180,
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.default",
            }}>
            <Box
                component="img"
                src={src}
                alt={alt}
                sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: fit,
                    display: "block",
                    p: fit === "contain" ? 1.5 : 0,
                    bgcolor: "background.paper",
                }}
            />
        </Box>
    );
}
