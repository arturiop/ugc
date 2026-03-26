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
        "next/navigation": path.resolve(__dirname, "./src/editor/shims/next-navigation.ts"),
        "next/link": path.resolve(__dirname, "./src/editor/shims/next-link.tsx"),
        "next/image": path.resolve(__dirname, "./src/editor/shims/next-image.tsx"),
        "next-themes": path.resolve(__dirname, "./src/editor/shims/next-themes.tsx"),
        "sonner": path.resolve(__dirname, "./src/editor/shims/sonner.tsx"),
        "@opencut/ui/icons": path.resolve(__dirname, "./src/editor/shims/opencut-icons.tsx"),
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
