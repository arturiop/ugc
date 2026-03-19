import { Box, Button, CircularProgress, IconButton, Stack, Tooltip } from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

export type WorkspaceMode = "brief" | "storyboard" | "scenegen" | "final";

const MODE_LABELS: Array<{ value: WorkspaceMode; label: string }> = [
    { value: "brief", label: "Brief" },
    { value: "storyboard", label: "Storyboard" },
    { value: "scenegen", label: "Scene Gen" },
    { value: "final", label: "Final Video" },
];

const navButtonStyles = (isActive: boolean) => ({
    textTransform: "none",
    fontWeight: 600,
    borderRadius: 2,
    border: "1px solid",
    borderColor: isActive ? "primary.main" : "transparent",
    color: "text.secondary",
    ...(isActive
        ? {
              bgcolor: "primary.main",
              color: "primary.contrastText",
              boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
          }
        : {}),
});

type WorkspaceHeaderProps = {
    mode: WorkspaceMode;
    activeView?: "studio" | "assets" | "generated_content";
    onModeChange: (mode: WorkspaceMode) => void;
    onViewChange?: (view: "studio" | "assets" | "generated_content") => void;
    onRefresh?: () => void;
    isRefreshing?: boolean;
};

const WorkspaceHeader = ({ mode, activeView = "studio", onModeChange, onViewChange, onRefresh, isRefreshing }: WorkspaceHeaderProps) => {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                px: { xs: 2, md: 3 },
                py: 1.5,
                bgcolor: "transparent",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1,
                    py: 0.5,
                    borderRadius: 999,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.08)",
                }}
            >
                <Stack direction="row" spacing={1}>
                    {MODE_LABELS.map((item) => {
                        const isActive = activeView === "studio" && mode === item.value;
                        return (
                            <Button
                                key={item.value}
                                size="small"
                                onClick={() => {
                                    onViewChange?.("studio");
                                    onModeChange(item.value);
                                }}
                                sx={navButtonStyles(isActive)}
                            >
                                {item.label}
                            </Button>
                        );
                    })}
                    <Button
                        size="small"
                        onClick={() => onViewChange?.("assets")}
                        sx={navButtonStyles(activeView === "assets")}
                    >
                        Assets
                    </Button>
                </Stack>
                {onRefresh && (
                    <Tooltip title="Refresh storyboard">
                        <span>
                            <IconButton size="small" onClick={onRefresh} disabled={isRefreshing}>
                                {isRefreshing ? (
                                    <CircularProgress size={18} />
                                ) : (
                                    <RefreshRoundedIcon fontSize="small" />
                                )}
                            </IconButton>
                        </span>
                    </Tooltip>
                )}
            </Box>
        </Box>
    );
};

export default WorkspaceHeader;
