import { AppBar, Avatar, Box, Stack, Toolbar } from "@mui/material";
import { WatchableLogoText } from "./LogoText";

export default function SharedAppHeader() {
    return (
        <AppBar
            position="sticky"
            color="default"
            elevation={0}
            sx={{
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
            }}
        >
            <Toolbar
                sx={{
                    minHeight: { xs: 56 },
                    px: { xs: 1, md: 2 },
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <Stack direction="row" spacing={{ xs: 0, sm: 1.5 }} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                    <Avatar
                        src="/logo.png"
                        alt="Project icon"
                        sx={{
                            display: { xs: "none", sm: "flex" },
                            width: 36,
                            height: 36,
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "background.neutral",
                        }}
                    />
                    <WatchableLogoText clickable={false} />
                </Stack>
                <Box sx={{ width: 36, height: 36 }} />
            </Toolbar>
        </AppBar>
    );
}
