import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/api/queryKeys";
import {
    GlobalSettingUpsertRequest,
    deleteGlobalSetting,
    listGlobalSettings,
    upsertGlobalSetting,
} from "./index";

export function useGlobalSettings() {
    return useQuery({
        queryKey: queryKeys.settings.list(),
        queryFn: ({ signal }) => listGlobalSettings(signal),
    });
}

export function useUpsertGlobalSetting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ key, payload }: { key: string; payload: GlobalSettingUpsertRequest }) =>
            upsertGlobalSetting(key, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.settings.list() });
        },
    });
}

export function useDeleteGlobalSetting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ key }: { key: string }) => deleteGlobalSetting(key),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.settings.list() });
        },
    });
}
