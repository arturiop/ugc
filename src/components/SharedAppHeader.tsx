import { useEffect, useState } from "react";
import { AppBar, Avatar, Box, Stack, Toolbar } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { WatchableLogoText } from "./LogoText";

export default function SharedAppHeader() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 12);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <AppBar
            position="fixed"
            color="default"
            elevation={0}
            sx={{
                top: 0,
                left: 0,
                right: 0,
                zIndex: (theme) => theme.zIndex.appBar,
                borderBottom: "1px solid",
                borderColor: (theme) =>
                    alpha(theme.palette.divider, isScrolled ? 0.8 : 0),
                bgcolor: (theme) =>
                    alpha(theme.palette.background.default, isScrolled ? 0.78 : 0),
                backgroundImage: "none",
                backdropFilter: isScrolled ? "saturate(180%) blur(14px)" : "none",
                WebkitBackdropFilter: isScrolled ? "saturate(180%) blur(14px)" : "none",
                boxShadow: (theme) =>
                    isScrolled ? `0 10px 30px ${alpha(theme.palette.common.black, 0.08)}` : "none",
                transition: "background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
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
