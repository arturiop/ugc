export const queryKeys = {
    projects: {
        all: ["projects"] as const,
        list: () => [...queryKeys.projects.all, "list"] as const,
        detail: (projectId: string) => [...queryKeys.projects.all, "detail", projectId] as const,
        assets: (projectId: string) => [...queryKeys.projects.all, "assets", projectId] as const,
        chatMessages: (projectId: string) => [...queryKeys.projects.all, "chat", projectId] as const,
        storyboard: (projectId: string) => [...queryKeys.projects.all, "storyboard", projectId] as const,
    },
    settings: {
        all: ["settings"] as const,
        list: () => [...queryKeys.settings.all, "list"] as const,
        detail: (key: string) => [...queryKeys.settings.all, "detail", key] as const,
    },
};
