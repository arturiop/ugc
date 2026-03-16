import { Box, Button, Card, CardContent, Divider, FormControl, Menu, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { useMemo, useState } from "react";

const VIDEO_LENGTHS = ["6s", "10s", "15s", "20s"] as const;
const VIDEO_FORMATS = ["9:16 (Vertical)", "1:1 (Square)", "16:9 (Landscape)"] as const;
const VIDEO_PLATFORMS = ["TikTok", "Instagram Reels", "YouTube Shorts"] as const;
const VIDEO_AUDIENCES = ["Gen Z trend seekers", "Young professionals", "Beauty shoppers", "Parents"] as const;
const TREND_EXAMPLES = [
  {
    title: "3-second hook + demo",
    tag: "TikTok",
    description: "Fast problem setup, product in-frame by second 2, bold text hook.",
    duration: "8-12s",
    format: "9:16",
  },
  {
    title: "POV reaction",
    tag: "Reels",
    description: "Creator POV with quick cuts, reaction first, product payoff after.",
    duration: "10-15s",
    format: "9:16",
  },
  {
    title: "Before / after split",
    tag: "TikTok",
    description: "Hard contrast, simple overlay text, benefit in the first frame.",
    duration: "12-18s",
    format: "9:16",
  },
  {
    title: "Listicle features",
    tag: "Reels",
    description: "3 quick claims, product close-ups, punchy end CTA.",
    duration: "12-20s",
    format: "9:16",
  },
];


function SetupCard() {
  const [videoLength, setVideoLength] = useState<(typeof VIDEO_LENGTHS)[number]>("10s");
  const [videoFormat, setVideoFormat] = useState<(typeof VIDEO_FORMATS)[number]>("9:16 (Vertical)");
  const [platform, setPlatform] = useState<(typeof VIDEO_PLATFORMS)[number]>("TikTok");
  const [audience, setAudience] = useState<(typeof VIDEO_AUDIENCES)[number]>("Gen Z trend seekers");
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const uploadOptions = useMemo(
    () => [
      { label: "Product image", accept: "image/*" },
      { label: "Logo", accept: "image/*" },
      { label: "Brandbook", accept: "image/*,.pdf" },
      { label: "Reference", accept: "image/*,.pdf" },
    ],
    [],
  );

  const isMenuOpen = Boolean(menuAnchorEl);

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "rgba(255,255,255,0.92)",
        height: "100%",
        boxShadow: "0 24px 48px rgba(20, 16, 9, 0.08)",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 700, color: "text.secondary" }}>
              Studio setup
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Shape the brief in 30 seconds
            </Typography>
          </Box>

          <Stack spacing={2}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1.5 }}>
              <FormControl size="small" fullWidth>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", mb: 0.5 }}>
                  Video length
                </Typography>
                <Select
                  value={videoLength}
                  onChange={(event) => setVideoLength(event.target.value as (typeof VIDEO_LENGTHS)[number])}
                >
                  {VIDEO_LENGTHS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", mb: 0.5 }}>
                  Format
                </Typography>
                <Select
                  value={videoFormat}
                  onChange={(event) => setVideoFormat(event.target.value as (typeof VIDEO_FORMATS)[number])}
                >
                  {VIDEO_FORMATS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", mb: 0.5 }}>
                  Platform
                </Typography>
                <Select
                  value={platform}
                  onChange={(event) => setPlatform(event.target.value as (typeof VIDEO_PLATFORMS)[number])}
                >
                  {VIDEO_PLATFORMS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", mb: 0.5 }}>
                  Audience
                </Typography>
                <Select
                  value={audience}
                  onChange={(event) => setAudience(event.target.value as (typeof VIDEO_AUDIENCES)[number])}
                >
                  {VIDEO_AUDIENCES.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TextField
              size="small"
              label="Brief (optional)"
              placeholder="What should the ad say in one sentence?"
              fullWidth
            />
          </Stack>

          <Divider />

          <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Upload assets
            </Typography>
            <Button
              variant="outlined"
              startIcon={<UploadFileRoundedIcon />}
              endIcon={<KeyboardArrowDownRoundedIcon />}
              onClick={(event) => setMenuAnchorEl(event.currentTarget)}
              sx={{ justifyContent: "space-between", borderRadius: 999, textTransform: "none", fontWeight: 700 }}
            >
              Add files
            </Button>
            <Typography variant="caption" color="text.secondary">
              Add a product shot, logo, or reference to guide the storyboard.
            </Typography>
          </Stack>
        </Stack>
      </CardContent>

      <Menu
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        {uploadOptions.map((option) => (
          <MenuItem
            key={option.label}
            component="label"
            onClick={handleMenuClose}
          >
            {option.label}
            <input hidden type="file" accept={option.accept} />
          </MenuItem>
        ))}
      </Menu>
    </Card>
  );
}


function EmptyStoryboardPreview() {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "rgba(255,255,255,0.9)",
        height: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3 }, height: "100%" }}>
        <Stack spacing={2.5} sx={{ height: "100%" }}>
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 700, color: "text.secondary" }}>
              Storyboard canvas
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Waiting for your first draft
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add a product shot and a simple brief. We will produce a multi-scene storyboard you can edit fast.
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              borderRadius: 3,
              border: "1px dashed",
              borderColor: "divider",
              bgcolor: "rgba(248,245,238,0.9)",
              position: "relative",
              overflow: "hidden",
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              px: 3,
            }}
          >
            <Stack spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  bgcolor: "rgba(16,16,16,0.08)",
                  display: "grid",
                  placeItems: "center",
                  color: "text.primary",
                  fontWeight: 700,
                }}
              >
                0%
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                No storyboard yet
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Upload assets to unlock the first version.
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function UGCEmptyMainWorkspace() {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        p: { xs: 2, md: 3 },
        bgcolor: "background.default",
      }}
    >
      <Stack spacing={3}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
            bgcolor: "rgba(255,255,255,0.9)",
            boxShadow: "0 32px 60px rgba(22, 18, 10, 0.12)",
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 700, color: "text.secondary" }}>
                  Studio
                </Typography>
                <Typography variant="h4" fontWeight={800} letterSpacing={-0.7}>
                  Storyboard first. Video later.
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Build a clear ad direction before spending credits. Start with a product shot and a tight brief.
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", lg: "1.05fr 0.95fr" },
                  gap: 2,
                }}
              >
                <SetupCard />
                <EmptyStoryboardPreview />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
            bgcolor: "rgba(255,255,255,0.92)",
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 700, color: "text.secondary" }}>
                  What works now
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  TikTok + Reels patterns performing today
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Use these as a starting point. The storyboard adapts the flow to your product.
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                  gap: 2,
                }}
              >
                {TREND_EXAMPLES.map((template) => (
                  <Card
                    key={template.title}
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "rgba(255,255,255,0.9)",
                      p: 2,
                      display: "grid",
                      gap: 1.5,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        {template.title}
                      </Typography>
                      <Box
                        sx={{
                          px: 1.25,
                          py: 0.25,
                          borderRadius: 999,
                          bgcolor: "rgba(16,16,16,0.08)",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "text.primary",
                        }}
                      >
                        {template.tag}
                      </Box>
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      {template.description}
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                        {template.duration} • {template.format}
                      </Typography>
                      <Button size="small" variant="outlined" sx={{ borderRadius: 999, textTransform: "none" }}>
                        Use pattern
                      </Button>
                    </Stack>
                  </Card>
                ))}
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
