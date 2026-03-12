import { PropsWithChildren, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ProjectContext } from "./ProjectContext";

export function ProjectProvider({ children }: PropsWithChildren) {
  const { projectId } = useParams();

  const [projectName, setProjectName] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_APP_NGROK || "http://localhost:5050";

  useEffect(() => {
    if (!projectId || String(projectId) === "null" || String(projectId) === "undefined" ) return;

    fetch(`${API_BASE_URL}/api/v1/projects/${projectId}`)
      .then((r) => r.json())
      .then((data) => setProjectName(data.title || null))
      .catch(() => setProjectName(null));
  }, [projectId]);

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