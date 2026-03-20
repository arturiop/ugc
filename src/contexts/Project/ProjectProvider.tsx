import { PropsWithChildren } from "react";
import { useParams } from "react-router-dom";
import { ProjectContext } from "./ProjectContext";
import { useProject } from "@/api/projects/hooks";

export function ProjectProvider({ children }: PropsWithChildren) {
  const { projectId } = useParams();
  const { data } = useProject(projectId ?? null);
  const projectName = data?.title || null;
  const currentStage = data?.current_stage ?? null;

  return (
    <ProjectContext.Provider
      value={{
        projectId,
        projectName,
        currentStage,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
