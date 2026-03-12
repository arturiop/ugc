import { PropsWithChildren } from "react";
import { useParams } from "react-router-dom";
import { ProjectContext } from "./ProjectContext";
import { useProject } from "@/api/projects/hooks";

export function ProjectProvider({ children }: PropsWithChildren) {
  const { projectId } = useParams();
  const { data } = useProject(projectId ?? null);
  const projectName = data?.title || null;

  return (
    <ProjectContext.Provider
      value={{
        projectId,
        projectName,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
