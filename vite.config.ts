import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ command, mode }) => {
  const isDev = command === "serve" || mode === "development";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    ...(isDev && {
      server: {
        host: true, // 0.0.0.0
        port: 3030,
        cors: true,
      },
    }),
  };
});