import { Box, Button, Stack } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import StudioPane from "./StudioPane";
import UploadsPane from "./UploadsPane";
import ClipHistoryPane from "../../pages/Dashboard";
import GeneratedContentPanel from "@/components/GeneratedContentPanel";

const VIEW_MODES = ["studio", "uploads", "generated_content"] as const;
type ViewMode = (typeof VIEW_MODES)[number];

const resolveViewMode = (value: string | null): ViewMode => {
    if (value && (VIEW_MODES as readonly string[]).includes(value)) return value as ViewMode;
    return "studio";
};

const WorkspacePane = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeView = resolveViewMode(searchParams.get("viewMode"));

    const setViewMode = (next: ViewMode) => {
        const nextParams = new URLSearchParams(searchParams);
        if (next === "studio") {
            nextParams.delete("viewMode");
        } else {
            nextParams.set("viewMode", next);
        }
        setSearchParams(nextParams);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
            <Stack direction="row" spacing={1} sx={{ px: 2, py: 1.5 }}>
                <Button
                    onClick={() => setViewMode("studio")}
                    startIcon={<HomeRoundedIcon fontSize="small" />}
                    sx={navButtonStyles(activeView === "studio")}>
                    Studio
                </Button>
                <Button
                    onClick={() => setViewMode("uploads")}
                    startIcon={<FolderOutlinedIcon fontSize="small" />}
                    sx={navButtonStyles(activeView === "uploads")}>
                    Uploads
                </Button>
                <Button
                    onClick={() => setViewMode("generated_content")}
                    startIcon={<AutoAwesomeRoundedIcon fontSize="small" />}
                    sx={navButtonStyles(activeView === "generated_content")}>
                    Generated content
                </Button>
            </Stack>

            <Box sx={{ p: 2.5, flex: 1, overflowY: "auto", bgcolor: "background.default" }}>
                {activeView === "studio" && <StudioPane />}
                {activeView === "uploads" && <UploadsPane />}
                {activeView === "generated_content" && <GeneratedContentPanel />}
            </Box>
        </Box>
    );
};

const navButtonStyles = (isActive: boolean) => ({
    textTransform: "none",
    fontWeight: 600,
    borderRadius: 999,
    border: "1px solid",
    borderColor: "divider",
    color: "text.secondary",
    ...(isActive
        ? {
        bgcolor: "primary.main",
        color: "primary.contrastText",
        borderColor: "primary.main",
        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
        }
        : {}),
});

export default WorkspacePane;
