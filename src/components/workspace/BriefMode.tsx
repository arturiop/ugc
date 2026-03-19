import { Box, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import type { Storyboard } from "@/api/storyboard";
import type { ReactNode } from "react";

type BriefModeProps = {
    storyboard: Storyboard | null;
};

const BriefMode = ({ storyboard }: BriefModeProps) => {
    if (!storyboard) {
        return (
            <Box sx={{ p: { xs: 2.5, md: 4 }, height: "100%", overflowY: "auto" }}>
                <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={700}>
                            No storyboard yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Start a conversation to generate the first storyboard brief.
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2.5, md: 4 }, height: "100%", overflowY: "auto" }}>
            <Box sx={{ maxWidth: 720, mx: "auto" }}>
                <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                    <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="overline" sx={{ letterSpacing: 1.5, fontWeight: 700, color: "text.secondary" }}>
                                    Creative Direction
                                </Typography>
                                <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
                                    {storyboard.title || "Storyboard Brief"}
                                </Typography>
                            </Box>

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                <InfoBlock icon={<PaletteRoundedIcon fontSize="small" />} label="Tone" value={storyboard.tone} />
                                <InfoBlock icon={<GroupsRoundedIcon fontSize="small" />} label="Audience" value={storyboard.audience} />
                                <InfoBlock icon={<PublicRoundedIcon fontSize="small" />} label="Platform" value={storyboard.platform} />
                            </Stack>

                            <Divider />

                            <Box>
                                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                    Brief
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {storyboard.concept}
                                </Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default BriefMode;

function InfoBlock({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
    return (
        <Card elevation={0} sx={{ flex: 1, borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
            <CardContent sx={{ py: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    {icon}
                    <Typography variant="overline" sx={{ letterSpacing: 1.4, fontWeight: 700, color: "text.secondary" }}>
                        {label}
                    </Typography>
                </Stack>
                <Typography variant="body2" fontWeight={600}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
}
