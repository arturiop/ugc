import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Alert,
    Box,
    Button,
    Chip,
    Container,
    IconButton,
    Paper,
    Stack,
    TextField,
    Typography,
    alpha,
    useTheme,
} from "@mui/material";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import ModeEditOutlineRoundedIcon from "@mui/icons-material/ModeEditOutlineRounded";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import type { ExtractedListingState, ManualImage, ManualProductDraft } from "./types";
import { isAmazonUrl } from "./utils";

const MotionBox = motion.create(Box);

const ROTATING_PLACEHOLDERS = [
    "your protein powder",
    "your serum",
    "your headphones",
    "your candle brand",
    "your supplement",
    "your matcha",
];

const TRUSTED_BY = [
    "Liquid I.V.",
    "Magic Spoon",
    "Hydroflask",
    "Athletic Greens",
    "Fenty",
    "Olipop",
    "Aesop",
    "Glossier",
    "Native",
    "Loop",
];

const VIBES = ["Energetic", "Minimal", "Lifestyle", "Premium", "Playful", "Editorial"];

const HERO_OVERLAYS = [
    "linear-gradient(90deg, rgba(11, 13, 18, 0.78) 0%, rgba(11, 13, 18, 0.54) 26%, rgba(11, 13, 18, 0.2) 56%, rgba(11, 13, 18, 0.1) 100%), linear-gradient(180deg, rgba(11, 13, 18, 0.18) 0%, rgba(11, 13, 18, 0.28) 42%, rgba(11, 13, 18, 0.78) 100%)",
    "linear-gradient(90deg, rgba(11, 13, 18, 0.72) 0%, rgba(11, 13, 18, 0.48) 28%, rgba(11, 13, 18, 0.18) 54%, rgba(11, 13, 18, 0.1) 100%), linear-gradient(180deg, rgba(91, 97, 255, 0.12) 0%, rgba(11, 13, 18, 0.24) 42%, rgba(11, 13, 18, 0.76) 100%)",
    "linear-gradient(90deg, rgba(11, 13, 18, 0.8) 0%, rgba(11, 13, 18, 0.5) 24%, rgba(11, 13, 18, 0.18) 54%, rgba(11, 13, 18, 0.1) 100%), linear-gradient(180deg, rgba(255, 106, 26, 0.08) 0%, rgba(11, 13, 18, 0.22) 38%, rgba(11, 13, 18, 0.8) 100%)",
];

const HERO_IMAGE_PLACEHOLDER = "/assets/bg_img.png";

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
    const [manualEntryOpen, setManualEntryOpen] = useState(false);

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
            setBackgroundIdx((current) => (current + 1) % HERO_OVERLAYS.length);
        }, 7000);
        return () => window.clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (hasDraftContent) {
            setManualEntryOpen(true);
        }
    }, [hasDraftContent]);

    const showEditor = manualEntryOpen || hasDraftContent;
    const canExtract = Boolean(urlInput.trim() && isAmazonUrl(urlInput.trim()));
    const title = manualDraft.title.trim();
    const hasUrlValue = Boolean(urlInput.trim());
    const inputMode = canExtract ? "link" : hasUrlValue ? "manual" : "empty";

    return (
        <Box
            sx={{
                width: "100%",
                minHeight: "100%",
                overflow: "auto",
                bgcolor: "background.default",
                color: heroText,
                position: "relative",
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url("${HERO_IMAGE_PLACEHOLDER}")`,
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    transform: "scale(1.02)",
                }}
            />

            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(circle at 16% 20%, ${alpha(theme.palette.secondary.main, 0.24)} 0%, transparent 30%), radial-gradient(circle at 82% 18%, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 24%), linear-gradient(180deg, rgba(11, 13, 18, 0.18) 0%, rgba(11, 13, 18, 0.24) 100%)`,
                }}
            />

            <AnimatePresence mode="wait">
                <MotionBox
                    key={backgroundIdx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
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
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                            sx={{
                                width: 28,
                                height: 28,
                                borderRadius: 999,
                                border: "1px solid",
                                borderColor: alpha(theme.palette.common.white, 0.18),
                                bgcolor: alpha(theme.palette.common.white, 0.08),
                                display: "grid",
                                placeItems: "center",
                                backdropFilter: "blur(10px)",
                                boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                            }}
                        >
                            <Typography sx={{ fontSize: "0.82rem", fontStyle: "italic", fontFamily: theme.typography.fontFamily }}>
                                w
                            </Typography>
                        </Box>
                        <Typography
                            sx={{
                                fontSize: { xs: "1.1rem", md: "1.24rem" },
                                letterSpacing: "-0.04em",
                                fontWeight: 500,
                                color: heroText,
                            }}
                        >
                            Watchable.
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1.25} alignItems="center">
                        <Typography sx={{ color: heroMutedText, fontSize: "0.85rem", display: { xs: "none", md: "block" } }}>
                            Marketplace creative
                        </Typography>
                        <Chip
                            label="UGC-1157"
                            sx={{
                                height: 34,
                                borderRadius: 999,
                                color: heroText,
                                fontWeight: 700,
                                bgcolor: alpha(theme.palette.common.white, 0.1),
                                border: "1px solid",
                                borderColor: alpha(theme.palette.common.white, 0.12),
                                backdropFilter: "blur(12px)",
                            }}
                        />
                    </Stack>
                </Stack>

                <Box sx={{ flex: 1, display: "flex", alignItems: "flex-end" }}>
                    <Stack spacing={{ xs: 5, md: 6 }} sx={{ width: "100%", maxWidth: 920, pb: { xs: 4, md: 5 } }}>
                        <Stack spacing={3} sx={{ maxWidth: 720 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Box sx={{ width: 34, height: 1, bgcolor: alpha(heroText, 0.42) }} />
                                <Typography
                                    sx={{
                                        color: heroMutedText,
                                        fontSize: "0.76rem",
                                        letterSpacing: "0.24em",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    For Amazon sellers
                                </Typography>
                            </Stack>

                            <Typography
                                component="h1"
                                sx={{
                                    fontSize: { xs: "clamp(4rem, 16vw, 5.4rem)", md: "clamp(5.5rem, 9vw, 7.4rem)" },
                                    lineHeight: 0.9,
                                    letterSpacing: "-0.06em",
                                    fontWeight: 400,
                                    textWrap: "balance",
                                    maxWidth: 680,
                                }}
                            >
                                One <Box component="span" sx={{ fontStyle: "italic" }}>link</Box>.
                                <br />
                                A thousand
                                <br />
                                <Box component="span" sx={{ color: "primary.main", fontStyle: "italic" }}>creatives</Box>.
                            </Typography>

                            <Typography
                                sx={{
                                    maxWidth: 560,
                                    color: alpha(heroText, 0.84),
                                    fontSize: { xs: "1.02rem", md: "1.1rem" },
                                    lineHeight: 1.72,
                                }}
                            >
                                Drop an Amazon link. We turn your product into a full set of cinematic image scenes and a scroll-stopping
                                video — in under a minute.
                            </Typography>
                        </Stack>

                        <Stack spacing={2.25} sx={{ width: "100%", maxWidth: 900 }}>
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
                                }}
                            >
                                <Stack spacing={0}>
                                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: { xs: 2, md: 3 }, py: 1.5 }}>
                                        <Box sx={{ color: panelMutedText, display: "grid", placeItems: "center" }}>
                                            {inputMode === "manual" ? <ModeEditOutlineRoundedIcon sx={{ fontSize: 22 }} /> : <LinkRoundedIcon sx={{ fontSize: 22 }} />}
                                        </Box>

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
                                                    }}
                                                >
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
                                                            style={{ display: "inline-block", fontStyle: "italic", fontWeight: 500 }}
                                                        >
                                                            {ROTATING_PLACEHOLDERS[placeholderIdx]}
                                                        </motion.span>
                                                    </AnimatePresence>
                                                </Box>
                                            ) : null}
                                        </Box>

                                        {inputMode === "manual" ? (
                                            <IconButton
                                                type="button"
                                                onClick={() => {
                                                    onReset();
                                                    setManualEntryOpen(false);
                                                }}
                                                sx={{ color: panelMutedText }}
                                            >
                                                <CloseRoundedIcon fontSize="small" />
                                            </IconButton>
                                        ) : null}

                                        {canExtract ? (
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                disabled={isSubmitting || isCreatingProject}
                                                endIcon={<ArrowOutwardRoundedIcon />}
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
                                                }}
                                            >
                                                {isSubmitting ? "Reading product..." : "Extract"}
                                            </Button>
                                        ) : null}
                                    </Stack>

                                    <AnimatePresence initial={false}>
                                        {showEditor ? (
                                            <MotionBox
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                                                sx={{ overflow: "hidden", borderTop: "1px solid", borderColor: alpha(theme.palette.divider, 0.9) }}
                                            >
                                                <Stack spacing={3} sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 2.5 } }}>
                                                    {error ? (
                                                        <Alert
                                                            severity="error"
                                                            sx={{
                                                                borderRadius: 3,
                                                                bgcolor: alpha("#D64545", 0.06),
                                                                color: "error.main",
                                                            }}
                                                        >
                                                            {error}
                                                        </Alert>
                                                    ) : null}

                                                    {extractedListing ? (
                                                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems={{ xs: "flex-start", sm: "center" }}>
                                                            <Chip
                                                                icon={<AutoAwesomeRoundedIcon />}
                                                                label="Extracted from Amazon"
                                                                sx={{
                                                                    borderRadius: 999,
                                                                    bgcolor: alpha(theme.palette.primary.main, 0.14),
                                                                    color: theme.palette.primary.dark,
                                                                    fontWeight: 800,
                                                                }}
                                                            />
                                                            <Typography sx={{ color: panelMutedText, fontSize: "0.92rem" }}>
                                                                Review the brief before launching generation.
                                                            </Typography>
                                                        </Stack>
                                                    ) : null}

                                                    <Box
                                                        sx={{
                                                            display: "grid",
                                                            gridTemplateColumns: { xs: "1fr", lg: "1.15fr 0.85fr" },
                                                            gap: 3,
                                                            alignItems: "start",
                                                        }}
                                                    >
                                                        <Stack spacing={2}>
                                                            <TextField
                                                                fullWidth
                                                                multiline
                                                                minRows={5}
                                                                label="Product description"
                                                                value={manualDraft.description}
                                                                onChange={onManualFieldChange("description")}
                                                                placeholder="What the product is, who it is for, and what should stand out."
                                                            />
                                                            <TextField
                                                                fullWidth
                                                                label="Expected vibe or style"
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

                                                        <Stack spacing={1.5}>
                                                            <Stack
                                                                direction={{ xs: "column", sm: "row" }}
                                                                spacing={1.25}
                                                                justifyContent="space-between"
                                                                alignItems={{ xs: "flex-start", sm: "center" }}
                                                            >
                                                                <Box>
                                                                    <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: panelText }}>Product image</Typography>
                                                                    <Typography sx={{ color: panelMutedText, fontSize: "0.9rem", mt: 0.5 }}>
                                                                        Upload one or keep the extracted image.
                                                                    </Typography>
                                                                </Box>
                                                                <Button
                                                                    type="button"
                                                                    variant="outlined"
                                                                    startIcon={<AddPhotoAlternateRoundedIcon />}
                                                                    onClick={() => uploadInputRef.current?.click()}
                                                                    sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
                                                                >
                                                                    Add image
                                                                </Button>
                                                                <Box
                                                                    component="input"
                                                                    ref={uploadInputRef}
                                                                    type="file"
                                                                    accept="image/*"
                                                                    multiple
                                                                    onChange={onManualImagesChange}
                                                                    sx={{ display: "none" }}
                                                                />
                                                            </Stack>

                                                            {displayImages.length > 0 ? (
                                                                <Box
                                                                    sx={{
                                                                        display: "grid",
                                                                        gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))" },
                                                                        gap: 1.25,
                                                                    }}
                                                                >
                                                                    {displayImages.map((image) => (
                                                                        <ImageTile key={image.id} src={image.previewUrl} alt={image.file.name} fit="cover" />
                                                                    ))}
                                                                </Box>
                                                            ) : imageUrlFromState ? (
                                                                <ImageTile src={imageUrlFromState} alt={title || "Product image"} fit="contain" />
                                                            ) : (
                                                                <Paper
                                                                    variant="outlined"
                                                                    sx={{
                                                                        borderRadius: 3,
                                                                        borderStyle: "dashed",
                                                                        bgcolor: panelSubtleBg,
                                                                        minHeight: 220,
                                                                        display: "grid",
                                                                        placeItems: "center",
                                                                        px: 3,
                                                                        textAlign: "center",
                                                                    }}
                                                                >
                                                                    <Stack spacing={1} alignItems="center">
                                                                        <UploadRoundedIcon sx={{ color: alpha(panelText, 0.48) }} />
                                                                        <Typography sx={{ color: panelMutedText }}>
                                                                            Upload a product image to continue.
                                                                        </Typography>
                                                                    </Stack>
                                                                </Paper>
                                                            )}
                                                        </Stack>
                                                    </Box>

                                                    <Stack
                                                        direction={{ xs: "column", md: "row" }}
                                                        spacing={1.5}
                                                        alignItems={{ xs: "stretch", md: "center" }}
                                                        justifyContent="space-between"
                                                    >
                                                        <Typography sx={{ color: panelMutedText, maxWidth: 560 }}>
                                                            {canCreateProjectFromCurrentData
                                                                ? "Your brief is ready. Creating the project will move you into the generation workspace."
                                                                : "Add title, description, and at least one image before generation."}
                                                        </Typography>
                                                        <Button
                                                            type="button"
                                                            variant="contained"
                                                            disabled={!canCreateProjectFromCurrentData || isCreatingProject}
                                                            onClick={onCreateProjectFromBrief}
                                                            startIcon={<AutoAwesomeRoundedIcon />}
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
                                                            }}
                                                        >
                                                            {isCreatingProject ? "Creating..." : "Generate scenes"}
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
                                    sx={{ color: heroMutedText, px: 0.5 }}
                                >
                                    <Button
                                        type="button"
                                        variant="text"
                                        onClick={() => onUrlInputChange("https://www.amazon.com/dp/B07Q9MJQTR")}
                                        sx={{
                                            px: 0,
                                            minWidth: 0,
                                            textTransform: "none",
                                            fontWeight: 700,
                                            color: heroText,
                                            textDecoration: "underline",
                                            textDecorationColor: alpha(heroText, 0.26),
                                            textUnderlineOffset: "4px",
                                            "&:hover": { bgcolor: "transparent", color: "primary.main", textDecorationColor: theme.palette.primary.main },
                                        }}
                                    >
                                        Try a sample link
                                    </Button>
                                    <Typography sx={{ fontSize: "0.92rem", color: heroSoftText }}>
                                        No credit card. Free to try.
                                    </Typography>
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
                                        <Typography sx={{ fontSize: "0.92rem", color: heroMutedText }}>
                                            12,847 creatives generated this week
                                        </Typography>
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
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ px: { xs: 3, md: 5 } }}>
                        <Typography
                            sx={{
                                color: alpha(heroText, 0.52),
                                fontSize: "0.68rem",
                                letterSpacing: "0.22em",
                                textTransform: "uppercase",
                                display: { xs: "none", md: "block" },
                                whiteSpace: "nowrap",
                            }}
                        >
                            Trusted by
                        </Typography>
                        <Box sx={{ overflow: "hidden", flex: 1 }}>
                            <MotionBox
                                animate={{ x: ["0%", "-50%"] }}
                                transition={{ duration: 24, ease: "linear", repeat: Infinity }}
                                sx={{ display: "flex", width: "max-content", gap: 6 }}
                            >
                                {[...TRUSTED_BY, ...TRUSTED_BY].map((brand, index) => (
                                    <Typography
                                        key={`${brand}-${index}`}
                                        sx={{
                                            color: heroSoftText,
                                            fontSize: { xs: "0.95rem", md: "1rem" },
                                            fontWeight: 500,
                                            letterSpacing: "-0.03em",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
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

function ImageTile({
    src,
    alt,
    fit,
}: {
    src: string;
    alt: string;
    fit: "contain" | "cover";
}) {
    return (
        <Box
            sx={{
                width: "100%",
                aspectRatio: "1 / 1",
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.default",
            }}
        >
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
