import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/api/queryKeys";
import {
    createViralKnowledgeEntry,
    extractViralKnowledgeFromFile,
    extractViralKnowledgeFromUrl,
} from "./index";

export function useExtractViralKnowledgeFromUrl() {
    return useMutation({
        mutationFn: ({ sourceUrl }: { sourceUrl: string }) => extractViralKnowledgeFromUrl({ sourceUrl }),
    });
}

export function useExtractViralKnowledgeFromFile() {
    return useMutation({
        mutationFn: ({ file }: { file: File }) => extractViralKnowledgeFromFile(file),
    });
}

export function useCreateViralKnowledgeEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createViralKnowledgeEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.viralKnowledge.entries() });
        },
    });
}
