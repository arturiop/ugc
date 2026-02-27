import { Box, Button, Stack } from "@mui/material";
import { NavLink, Outlet, useParams } from "react-router-dom";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";


const WorkspacePane = () => {
    const { chatId } = useParams();
    const basePath = `/chat/${chatId}`;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
            <Stack direction="row" spacing={1} sx={{ px: 2, py: 1.5 }}>
                <Button
                    component={NavLink}
                    to={`${basePath}/studio`}
                    startIcon={<HomeRoundedIcon fontSize="small" />}
                    sx={navButtonStyles}>
                    Studio
                </Button>
                <Button
                    component={NavLink}
                    to={`${basePath}/uploads`}
                    startIcon={<FolderOutlinedIcon fontSize="small" />}
                    sx={navButtonStyles}>
                    Uploads
                </Button>
                <Button
                    component={NavLink}
                    to={`${basePath}/generated_content`}
                    startIcon={<AutoAwesomeRoundedIcon fontSize="small" />}
                    sx={navButtonStyles}>
                    Generated content
                </Button>
                <Button
                    component={NavLink}
                    to={`${basePath}/history`}
                    startIcon={<HistoryRoundedIcon fontSize="small" />}
                    sx={navButtonStyles}>
                    Chat history
                </Button>
            </Stack>

            <Box sx={{ p: 2.5, flex: 1, overflowY: "auto", bgcolor: "background.default" }}>
                <Outlet />
            </Box>
        </Box>
    );
};

const navButtonStyles = {
    textTransform: "none",
    fontWeight: 600,
    borderRadius: 999,
    border: "1px solid",
    borderColor: "divider",
    color: "text.secondary",
    "&.active": {
        bgcolor: "primary.main",
        color: "primary.contrastText",
        borderColor: "primary.main",
        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
    },
};

export default WorkspacePane;
