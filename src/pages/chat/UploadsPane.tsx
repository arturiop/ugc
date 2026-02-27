import { Paper, Typography } from "@mui/material";

const UploadsPane = () => {

        return (
            <Paper
                elevation={0}
                variant="outlined"
                sx={{
                    p: 3,
                    borderRadius: 2.5,
                    bgcolor: "background.paper",
                    borderStyle: "dashed",
                    textAlign: "center",
                }}>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    No uploads yet
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Upload an image in chat to preview it here.
                </Typography>
            </Paper>
        );
};

export default UploadsPane;
