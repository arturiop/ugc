import { Box, FormControl, IconButton, MenuItem, Paper, Select, Stack, Tooltip, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { useDeleteProjectAsset, useProjectAssets, useUpdateProjectAssetLabel } from "@/api/assets/hooks";
import type { AssetLabel } from "@/api/assets";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const ASSET_LABELS: Array<{ value: AssetLabel; label: string }> = [
    { value: "product", label: "Product" },
    { value: "logo", label: "Logo" },
    { value: "brandbook", label: "Brandbook" },
    { value: "reference", label: "Reference" },
];

const AssetsPane = () => {
    const { projectId } = useParams();
    const { data } = useProjectAssets(projectId);
    const updateLabel = useUpdateProjectAssetLabel(projectId);
    const deleteAsset = useDeleteProjectAsset(projectId);
    const items = Array.isArray(data?.items) ? data.items : [];

    if (items.length === 0) {
        return (
            <Paper
                elevation={0}
                variant="outlined"
                sx={{
                    p: 3,
                    borderRadius: 2.5,
                    bgcolor: "background.neutral",
                    borderStyle: "dashed",
                    textAlign: "center",
                }}>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    No assets yet
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Upload an image in chat to keep it with this project.
                </Typography>
            </Paper>
        );
    }

    return (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
            {items.map((item) => (
                <AssetItem
                    key={item.id}
                    filename={item.filename}
                    label={item.label}
                    url={item.url || ""}
                    isUpdating={updateLabel.isPending && updateLabel.variables?.assetId === item.id}
                    isDeleting={deleteAsset.isPending && deleteAsset.variables?.assetId === item.id}
                    onLabelChange={(label) => updateLabel.mutate({ assetId: item.id, label })}
                    onDelete={() => {
                        const confirmed = window.confirm(`Delete "${item.filename}" from this project?`);
                        if (!confirmed) return;
                        deleteAsset.mutate({ assetId: item.id });
                    }}
                />
            ))}
        </Box>
    );
};

function AssetItem({
    filename,
    url,
    label,
    isUpdating,
    isDeleting,
    onLabelChange,
    onDelete,
}: {
    filename: string;
    url: string;
    label: AssetLabel;
    isUpdating: boolean;
    isDeleting: boolean;
    onLabelChange: (label: AssetLabel) => void;
    onDelete: () => void;
}) {
    return (
        <Paper
            elevation={0}
            variant="outlined"
            sx={{
                borderRadius: 3,
                borderStyle: "solid",
                overflow: "hidden",
                bgcolor: "background.paper",
            }}>
            <Box
                component="img"
                src={url}
                alt={filename}
                sx={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    objectFit: "contain",
                    bgcolor: "background.neutral",
                    display: "block",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                }}
            />
            <Stack spacing={1} sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                        {filename}
                    </Typography>
                    <Tooltip title="Delete asset">
                        <span>
                            <IconButton
                                size="small"
                                onClick={onDelete}
                                disabled={isDeleting}
                                aria-label="Delete asset"
                            >
                                <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Stack>
                <FormControl size="small" fullWidth>
                    <Select
                        value={label}
                        onChange={(event) => onLabelChange(event.target.value as AssetLabel)}
                        disabled={isUpdating || isDeleting}
                    >
                        {ASSET_LABELS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>
        </Paper>
    );
}

export default AssetsPane;
