import { Box, Stack, Typography } from "@mui/material";
import { ProjectType } from "@/api/projects";
import { useProject } from "@/contexts/Project/ProjectContext";

export function ProjectChatWelcome() {
  const { projectType } = useProject();
  const isSatisfactionVideo = projectType === ProjectType.SatisfactionVideo;
  const content = isSatisfactionVideo
    ? {
        title: "What kind of satisfaction video should we make?",
        description:
          "Tell Watchable what the product helps with, who should relate to it, and the customer outcome you want to highlight.",
        chips: [
          "Product: ...",
          "Customer feeling: relieved / happy",
          "Outcome: clear skin / less pain / more energy",
          "Style: selfie / testimonial / UGC",
        ],
      }
    : {
        title: "What should we build today?",
        description: "Ask Watchable to create an ad for…",
        chips: [
          "Product: ...",
          "Audience: ...",
          "Goal: installs / sales",
          "Style: UGC / direct response",
        ],
      };

  return (
    <Box
      sx={{
        flex: 1,
        display: "grid",
        placeItems: "center",
        px: 2,
        py: { xs: 2.5, md: 4 },
      }}
    >
      <Stack spacing={2} sx={{ width: "100%", minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: { xs: 20, sm: 24 },
            fontWeight: 900,
            letterSpacing: -0.4,
          }}
        >
          {content.title}
        </Typography>

        <Typography
          sx={{
            flex: 1,
            opacity: 0.72,
            fontSize: { xs: 14, sm: 16 },
            lineHeight: 1.4,
            whiteSpace: "normal",
            overflowWrap: "anywhere",
          }}
        >
          {content.description}
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          sx={{ color: "text.secondary", fontSize: 13 }}
        >
          {content.chips.map((chip) => (
            <ChipLike key={chip} text={chip} />
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

function ChipLike({ text }: { text: string }) {
  return (
    <Box
      sx={{
        px: 1.25,
        py: 0.6,
        borderRadius: 999,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      {text}
    </Box>
  );
}
