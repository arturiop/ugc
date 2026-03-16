import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/api/queryKeys";
import { deleteProjectAsset, listProjectAssets, updateProjectAssetLabel } from "./index";

export function useProjectAssets(projectId: string | null | undefined) {
    return useQuery({
        queryKey: projectId ? queryKeys.projects.assets(projectId) : queryKeys.projects.assets(""),
        queryFn: ({ signal }) => listProjectAssets(projectId as string, signal),
        enabled: Boolean(projectId),
    });
}

export function useUpdateProjectAssetLabel(projectId: string | null | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ assetId, label }: { assetId: number; label: Parameters<typeof updateProjectAssetLabel>[2] }) =>
            updateProjectAssetLabel(projectId as string, assetId, label),
        onSuccess: () => {
            if (!projectId) return;
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.assets(projectId) });
        },
    });
}

export function useDeleteProjectAsset(projectId: string | null | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ assetId }: { assetId: number }) => deleteProjectAsset(projectId as string, assetId),
        onSuccess: () => {
            if (!projectId) return;
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.assets(projectId) });
        },
    });
}
