import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import ViewQuiltOutlinedIcon from "@mui/icons-material/ViewQuiltOutlined";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";

const steps = [
  {
    icon: <ImageOutlinedIcon fontSize="small" />,
    title: "Upload image",
    text: "Add one clear product photo.",
  },
  {
    icon: <BoltRoundedIcon fontSize="small" />,
    title: "Add brief",
    text: "Goal, audience, tone, platform.",
  },
  {
    icon: <ViewQuiltOutlinedIcon fontSize="small" />,
    title: "Get storyboard",
    text: "6 fast UGC shots generated.",
  },
  {
    icon: <PlayCircleOutlineRoundedIcon fontSize="small" />,
    title: "Generate video",
    text: "Turn storyboard into UGC video.",
  },
];

const productImage = "https://1e6c-73-15-197-136.ngrok-free.app/uploads/1772223487446-Screenshot_2026-02-23_at_12.55.29___PM.png";
const storyboardImage = "https://1e6c-73-15-197-136.ngrok-free.app/gen_imgs/cd4a0c39-bcf6-4d6f-9f26-2fa70c7b88e3.png";


function StepCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        flex: 1,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 4,
        height: "100%",
        bgcolor: "background.paper",
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1.25}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 3,
              bgcolor: "grey.100",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>

          <Typography variant="subtitle2" fontWeight={700}>
            {title}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {text}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ExampleResultCard() {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Example result
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload a product image and get a storyboard like this.
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            alignItems="stretch"
          >
            <Box sx={{ flex: { lg: "0 0 280px" } }}>
              <Typography
                variant="caption"
                sx={{ display: "block", mb: 1, color: "text.secondary", fontWeight: 700 }}
              >
                Product image
              </Typography>

              <Box
                component="img"
                src={productImage}
                alt="Product example"
                sx={{
                  width: "100%",
                  height: { xs: 260, sm: 340, lg: 420 },
                  objectFit: "contain",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "#fafafa",
                  display: "block",
                }}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography
                variant="caption"
                sx={{ display: "block", mb: 1, color: "text.secondary", fontWeight: 700 }}
              >
                Storyboard output
              </Typography>

              <Box
                component="img"
                src={storyboardImage}
                alt="Storyboard example"
                sx={{
                  width: "100%",
                  height: { xs: 260, sm: 420, lg: 420 },
                  objectFit: "contain",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "#fafafa",
                  display: "block",
                }}
              />
            </Box>
          </Stack>
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
      }}
    >
      <Stack spacing={2.5}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
            bgcolor: "background.paper",
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack spacing={2}>
              <Typography variant="h4" fontWeight={800} letterSpacing={-0.7}>
                Haven’t tried it yet?
              </Typography>

              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
              >
                {steps.map((step) => (
                  <StepCard key={step.title} {...step} />
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <ExampleResultCard />
      </Stack>
    </Box>
  );
}