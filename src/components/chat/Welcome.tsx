import { Box, Stack, Typography } from "@mui/material";

export function ProjectChatWelcome() {
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
          What should we build today?
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
          Ask Watchable to create a ads for…
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          sx={{ color: "text.secondary", fontSize: 13 }}
        >
          <ChipLike text="Product: ..." />
          <ChipLike text="Audience: ..." />
          <ChipLike text="Goal: installs / sales" />
          <ChipLike text="Style: UGC / direct response" />
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
