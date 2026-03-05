import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Paper,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Stack,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Skeleton,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

import { getSessionId } from "@/utils/session";
import { useNgrokImageSrc } from "@/hooks/useNgrokImageSrc";

const API_BASE_URL = import.meta.env.VITE_APP_NGROK || "http://localhost:5050";

type ClipSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;

  // optional thumb fields (support multiple backend shapes)
  thumbnailUrl?: string | null;
  imageUrl?: string | null;
  coverUrl?: string | null;
  previewUrl?: string | null;
  lastImageUrl?: string | null;
};

const resolveAssetUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith("data:")) return url;
  return url.startsWith("http") ? url : new URL(url, API_BASE_URL).toString();
};

function getThumb(item: ClipSummary) {
  return (
    item.thumbnailUrl ||
    item.coverUrl ||
    item.previewUrl ||
    item.lastImageUrl ||
    item.imageUrl ||
    null
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function initials(title: string) {
  const t = (title || "New project").trim();
  const parts = t.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

export default function ProjectsDashboard() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ClipSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/project/history`, {
            headers: { "X-Session-Id": getSessionId(), 
                "ngrok-skip-browser-warning": "1",

             },
        });
        if (!response.ok) throw new Error("Unable to load projects.");
        const data = (await response.json()) as { items?: ClipSummary[] };
        if (!cancelled) setItems(Array.isArray(data.items) ? data.items : []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load projects.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((i) => (i.title || "New project").toLowerCase().includes(q));
  }, [sorted, query]);

  // Optional: if you have an endpoint to create a new project, wire it here.
  // For now: navigate to a "new" route or your existing create flow.
  const handleNewProject = () => {
    navigate("/project"); // change to your actual create route
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Pretty header card */}
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
          background:
            "radial-gradient(1200px circle at 10% 10%, rgba(25,118,210,0.18), transparent 45%), radial-gradient(900px circle at 90% 0%, rgba(156,39,176,0.14), transparent 45%)",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Projects
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your clips, neatly organized. Jump back in anytime.
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap" }}>
              <Chip label={`${items.length} total`} variant="outlined" />
              <Chip label={`${filtered.length} shown`} variant="outlined" />
            </Stack>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="stretch">
            <TextField
              size="small"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects…"
              sx={{
                minWidth: { xs: "100%", sm: 260 },
                "& .MuiOutlinedInput-root": { borderRadius: 999 },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              onClick={handleNewProject}
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ borderRadius: 999, px: 2 }}
            >
              New project
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Loading state */}
      {loading && (
        <Grid container spacing={2}>
          {Array.from({ length: 8 }).map((_, idx) => (
            //@ts-ignore
            <Grid item key={idx} xs={12} sm={6} md={4} lg={3}>
              <Card variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
                <Skeleton variant="rectangular" height={150} />
                <CardContent>
                  <Skeleton width="70%" />
                  <Skeleton width="45%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Error */}
      {!loading && error && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            {error}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Please refresh to try again.
          </Typography>
        </Paper>
      )}

      {/* Empty */}
      {!loading && !error && items.length === 0 && (
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              No projects yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your first one and it’ll show up here.
            </Typography>
          </Box>
          <Button onClick={handleNewProject} variant="contained" startIcon={<AddIcon />} sx={{ borderRadius: 999 }}>
            New project
          </Button>
        </Paper>
      )}

      {/* Grid */}
      {!loading && !error && items.length > 0 && (
        <>
          <Divider sx={{ opacity: 0.6 }} />

          <Grid container spacing={2}>
            {filtered.map((item) => (
              <ProjectCard key={item.id} item={item} onOpen={() => navigate(`/clip/${item.id}`)} />
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
}

function ProjectCard({ item, onOpen }: { item: ClipSummary; onOpen: () => void }) {
  const title = item.title || "New project";
  const thumbUrl = resolveAssetUrl(getThumb(item));
  const { src } = useNgrokImageSrc(thumbUrl || undefined);

  return (
    //@ts-ignore
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          transition: "transform 160ms ease, box-shadow 160ms ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0px 18px 45px rgba(15, 23, 42, 0.10)",
          },
        }}
      >
        <CardActionArea onClick={onOpen}>
          {thumbUrl ? (
            <CardMedia
              component="img"
              height="150"
              image={src || thumbUrl}
              alt={title}
              sx={{ objectFit: "cover" }}
            />
          ) : (
            <Box
              sx={{
                height: 150,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "action.hover",
                position: "relative",
              }}
            >
              <Stack spacing={1} alignItems="center">
                <ImageOutlinedIcon />
                <Typography variant="caption" color="text.secondary">
                  No image
                </Typography>
              </Stack>

              <Box
                sx={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 900 }}>
                  {initials(title)}
                </Typography>
              </Box>
            </Box>
          )}

          <CardContent sx={{ pb: 2 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900 }} noWrap>
                {title}
              </Typography>

              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  Updated {formatDate(item.updatedAt)}
                </Typography>

                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Open
                  </Typography>
                  <ArrowForwardIcon fontSize="inherit" />
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  );
}
