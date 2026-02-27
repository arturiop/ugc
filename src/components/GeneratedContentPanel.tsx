import { Box } from "@mui/material";

const storyboardImageUrl = "https://1e6c-73-15-197-136.ngrok-free.app/gen_imgs/4c6cfec1-4898-41a8-bfee-7ec381ad79f4.png";

const generatedItems = [
    {
        id: "ugc-001",
        title: "Storyboard 01",
        imageUrl: storyboardImageUrl,
        tags: ["Hook", "Demo", "CTA"],
        url: "https://1e6c-73-15-197-136.ngrok-free.app/gen_imgs/4c6cfec1-4898-41a8-bfee-7ec381ad79f4.png",
    },
    {
        id: "ugc-002",
        title: "Storyboard 02",
        imageUrl: storyboardImageUrl,
        tags: ["Problem", "Benefit", "Proof"],
        url: "https://1e6c-73-15-197-136.ngrok-free.app/gen_imgs/cd4a0c39-bcf6-4d6f-9f26-2fa70c7b88e3.png",
    },
];

const GeneratedContentPanel = () => {
    return (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
            {generatedItems.map((item) => (
                <Box
                    key={item.id}
                    component="img"
                    src={item.url}
                    alt={item.title}
                    sx={{
                        width: "100%",
                        height: 220,
                        objectFit: "contain",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        display: "block",
                    }}
                />
            ))}
        </Box>
    );
};

export default GeneratedContentPanel;
