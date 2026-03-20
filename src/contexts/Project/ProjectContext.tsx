import { createContext, useContext } from "react";

export type ProjectContextType = {
  projectId: string | null;
  projectName: string | null;
  currentStage: string | null;
};

export const ProjectContext = createContext<ProjectContextType | null>(null);

export function useProject() {
  const ctx = useContext(ProjectContext);

  if (!ctx) {
    throw new Error("useProject must be used inside ProjectProvider");
  }

  return ctx;
}
