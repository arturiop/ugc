import { Box, Button, Chip, Stack, alpha } from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import MovieRoundedIcon from "@mui/icons-material/MovieRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import RemoveDoneRoundedIcon from "@mui/icons-material/RemoveDoneRounded";

type ReelToolbarProps = {
    selectedCount: number;
    totalSelectableCount: number;
    durationLabel: string;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onDownloadImages: () => void;
    onGenerateVideos: () => void;
    disableSelectAll?: boolean;
    disableDeselectAll?: boolean;
    disableDownloadImages?: boolean;
    disableGenerateVideos?: boolean;
    generateLabel?: string;
};

export default function ReelToolbar({
    selectedCount,
    totalSelectableCount,
    durationLabel,
    onSelectAll,
    onDeselectAll,
    onDownloadImages,
    onGenerateVideos,
    disableSelectAll = false,
    disableDeselectAll = false,
    disableDownloadImages = false,
    disableGenerateVideos = false,
    generateLabel = "Generate videos",
}: ReelToolbarProps) {
    return (
        <Box
            sx={{
                position: "fixed",
                left: "50%",
                bottom: { xs: 14, md: 20 },
                transform: "translateX(-50%)",
                width: "min(calc(100vw - 40px), 1240px)",
                zIndex: 40,
                pointerEvents: "none",
            }}
        >
            <Box
                sx={{
                    pointerEvents: "auto",
                    borderRadius: "20px",
                    border: "1px solid",
                    borderColor: alpha("#FFF8F1", 0.14),
                    background:
                        "linear-gradient(180deg, rgba(255, 251, 246, 0.12) 0%, rgba(255, 248, 241, 0.08) 100%)",
                    boxShadow: "0 24px 64px rgba(20, 12, 8, 0.18), inset 0 1px 0 rgba(255,255,255,0.1)",
                    px: { xs: 1.1, md: 1.55 },
                    py: { xs: 1.1, md: 1.25 },
                    backdropFilter: "blur(24px) saturate(130%)",
                }}
            >
                <Stack direction={{ xs: "column", lg: "row" }} spacing={1.25} alignItems={{ xs: "stretch", lg: "center" }} justifyContent="space-between">
                    <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "stretch", md: "center" }}>
                        <Stack direction="row" spacing={1}>
                            <Button
                                type="button"
                                variant="text"
                                color="inherit"
                                startIcon={<DoneAllRoundedIcon />}
                                onClick={onSelectAll}
                                disabled={disableSelectAll}
                                sx={{
                                    borderRadius: 999,
                                    textTransform: "none",
                                    color: alpha("#FAF5EE", 0.94),
                                    px: 1.8,
                                    py: 0.95,
                                    bgcolor: alpha("#1B1715", 0.92),
                                    border: "1px solid",
                                    borderColor: alpha("#FFFFFF", 0.08),
                                    fontWeight: 800,
                                    "&:hover": {
                                        bgcolor: alpha("#1B1715", 0.92),
                                    },
                                }}
                            >
                                Select all
                            </Button>
                            <Button
                                type="button"
                                variant="text"
                                color="inherit"
                                startIcon={<RemoveDoneRoundedIcon />}
                                onClick={onDeselectAll}
                                disabled={disableDeselectAll}
                                sx={{
                                    borderRadius: 999,
                                    textTransform: "none",
                                    color: alpha("#FAF5EE", 0.94),
                                    px: 1.8,
                                    py: 0.95,
                                    bgcolor: alpha("#1B1715", 0.92),
                                    border: "1px solid",
                                    borderColor: alpha("#FFFFFF", 0.08),
                                    fontWeight: 800,
                                    "&:hover": {
                                        bgcolor: alpha("#1B1715", 0.92),
                                    },
                                }}
                            >
                                Deselect all
                            </Button>
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                            <Chip
                                label={`${selectedCount}/${totalSelectableCount} selected`}
                                sx={{
                                    borderRadius: 999,
                                    fontWeight: 700,
                                    bgcolor: "transparent",
                                    color: alpha("#FFF8F0", 0.96),
                                    fontSize: "0.95rem",
                                    "& .MuiChip-label": { px: 0.3 },
                                }}
                            />
                            <Chip
                                label={`${durationLabel} of finished video`}
                                sx={{
                                    borderRadius: 999,
                                    fontWeight: 700,
                                    bgcolor: "transparent",
                                    color: alpha("#FFF8F0", 0.96),
                                    fontSize: "0.95rem",
                                    "& .MuiChip-label": { px: 0.1 },
                                }}
                            />
                        </Stack>
                    </Stack>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        <Button
                            type="button"
                            variant="outlined"
                            startIcon={<DownloadRoundedIcon />}
                            onClick={onDownloadImages}
                            disabled={disableDownloadImages}
                            sx={{
                                borderRadius: 999,
                                textTransform: "none",
                                fontWeight: 800,
                                px: 2.25,
                                py: 0.95,
                                borderColor: alpha("#FFFFFF", 0.08),
                                bgcolor: alpha("#1B1715", 0.92),
                                color: alpha("#FAF5EE", 0.96),
                                "&:hover": {
                                    borderColor: alpha("#FFFFFF", 0.08),
                                    bgcolor: alpha("#1B1715", 0.92),
                                },
                            }}
                        >
                            Download set of images
                        </Button>
                        <Button
                            type="button"
                            variant="contained"
                            startIcon={<MovieRoundedIcon />}
                            onClick={onGenerateVideos}
                            disabled={disableGenerateVideos}
                            sx={{
                                borderRadius: 999,
                                textTransform: "none",
                                fontWeight: 800,
                                px: 2.55,
                                py: 0.95,
                                background: "linear-gradient(135deg, #F36B2A 0%, #FF8D47 100%)",
                                boxShadow: "0 16px 30px rgba(243, 107, 42, 0.35)",
                                color: "#FFF7F0",
                            }}
                        >
                            {generateLabel}
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Box>
    );
}
