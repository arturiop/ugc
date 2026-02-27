import { useMemo, useState } from "react";
import {
  Box,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

type WorkspacePaneProps = {
  imageUrl?: string;
  tabIndex?: number;
  onTabChange?: (value: number) => void;
};

const WorkspacePane = ({ imageUrl, tabIndex, onTabChange }: WorkspacePaneProps) => {
  const [localTab, setLocalTab] = useState(0);
  const activeTab = tabIndex ?? localTab;
  const handleTabChange = onTabChange ?? setLocalTab;

  const hostnameLabel = useMemo(() => {
    if (!imageUrl) return "";
    try {
      return new URL(imageUrl).hostname;
    } catch {
      return "";
    }
  }, [imageUrl]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              Workspace
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Uploads, assets and edits live here.
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {imageUrl ? (
            <Stack direction="row" spacing={1} alignItems="center">
              {hostnameLabel ? (
                <Chip
                  size="small"
                  label={hostnameLabel}
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              ) : null}

              <Tooltip title="Open image in new tab">
                <IconButton
                  size="small"
                  onClick={() => window.open(imageUrl, "_blank", "noopener,noreferrer")}
                >
                  <OpenInNewRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          ) : null}
        </Stack>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_event, value) => handleTabChange(value)}
        variant="fullWidth"
        sx={{
          px: 1,
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          "& .MuiTab-root": { fontWeight: 700, textTransform: "none", minHeight: 44 },
        }}
      >
        <Tab icon={<ImageOutlinedIcon fontSize="small" />} iconPosition="start" label="Uploads" />
        <Tab icon={<TimelineOutlinedIcon fontSize="small" />} iconPosition="start" label="Timeline" />
        <Tab icon={<FolderOutlinedIcon fontSize="small" />} iconPosition="start" label="Assets" />
      </Tabs>

      {/* Content */}
      <Box sx={{ p: 2.5, flex: 1, overflowY: "auto", bgcolor: "background.default" }}>
        {activeTab === 0 ? (
          imageUrl ? (
            <Stack spacing={2}>
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  overflow: "hidden",
                  bgcolor: "background.paper",
                }}
              >
                <Stack spacing={1.25}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        Latest upload
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Preview updates automatically after upload.
                      </Typography>
                    </Box>
                    <Chip size="small" label="Preview" sx={{ fontWeight: 700 }} />
                  </Stack>

                  <Divider />

                  <Box
                    sx={{
                      width: "100%",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.default",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      component="img"
                      src={imageUrl}
                      alt="Latest upload"
                      sx={{
                        width: "100%",
                        height: 360,
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  </Box>
                </Stack>
              </Paper>

              <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: "background.paper" }}>
                <Stack spacing={0.75}>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    Next steps
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Add auto-tagging, multiple uploads, and asset library here.
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          ) : (
            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: 2.5,
                bgcolor: "background.paper",
                borderStyle: "dashed",
              }}
            >
              <Stack spacing={1.25} alignItems="center" textAlign="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "background.default",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <ImageOutlinedIcon />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  No uploads yet
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 360 }}>
                  Upload an image in chat to preview it here. The workspace will keep the latest upload pinned.
                </Typography>
              </Stack>
            </Paper>
          )
        ) : (
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 2.5,
              bgcolor: "background.paper",
              borderStyle: "dashed",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              Coming soon
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Workspace tools are coming soon.
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default WorkspacePane;