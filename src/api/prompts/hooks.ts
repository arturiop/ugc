import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/api/queryKeys";
import { PromptUpsertRequest, deletePrompt, listPrompts, upsertPrompt } from "./index";

export function usePrompts() {
    return useQuery({
        queryKey: queryKeys.prompts.list(),
        queryFn: ({ signal }) => listPrompts(signal),
    });
}

export function useUpsertPrompt() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ key, payload }: { key: string; payload: PromptUpsertRequest }) => upsertPrompt(key, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.prompts.list() });
        },
    });
}

export function useDeletePrompt() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ key }: { key: string }) => deletePrompt(key),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.prompts.list() });
        },
    });
}
