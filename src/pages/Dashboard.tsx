import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Box, Typography, Stack } from "@mui/material";

import { useAuthStore } from "@/stores/useAuthStore";
import AppHeader from "@/components/AppHeader";
import { CreateLanesSection } from "@/components/dashboard/CreateLanesSection";
import { DashboardProjectsSection } from "@/components/dashboard/DashboardProjectsSection";

export default function Dashboard() {
    const user = useAuthStore((state) => state.user);

    const displayName = useMemo(() => {
        const name = user?.full_name?.trim();
        if (name) return name;
        const email = user?.email?.trim();
        if (email) return email.split("@")[0];
        return "there";
    }, [user?.full_name, user?.email]);

    return (
        <Box sx={{ height: "100dvh", width: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <AppHeader />
            <Box sx={{ flex: 1, overflow: "auto" }}>
                <Box sx={{ width: "100%", mx: "auto", px: { xs: 1, md: 2 }, pb: 6 }}>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        alignItems={{ xs: "flex-start", md: "center" }}
                        justifyContent="space-between"
                        spacing={2}
                        sx={{ pt: 2 }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                                Hello, {displayName}
                            </Typography>
                        </Box>
                        <Box />
                    </Stack>

                    <CreateLanesSection />

                    <DashboardProjectsSection />
                </Box>
            </Box>
        </Box>
    );
}
