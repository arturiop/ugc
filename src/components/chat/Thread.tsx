import { AuiIf, ThreadPrimitive } from "@assistant-ui/react";
import { Box, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";

import { ProjectChatComposer } from "./Composer";
import { ProjectChatMessages } from "./Messages";
import { ProjectChatWelcome } from "./Welcome";

export function ProjectChatThread() {
  const theme = useTheme();

  return (
    <ThreadPrimitive.Root className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-background">
      <Box
        aria-hidden="true"
        sx={{
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          left: 12,
          right: 12,
          zIndex: 10,
          height: 28,
          borderBottomLeftRadius: 14,
          borderBottomRightRadius: 14,
          background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.46)} 0%, ${alpha(
            theme.palette.background.paper,
            0.16
          )} 56%, ${alpha(theme.palette.background.paper, 0)} 100%)`,
        }}
      />
      <ThreadPrimitive.Viewport className="relative flex min-h-0 w-full flex-1 flex-col overflow-y-auto px-3 pt-3 pb-3">
        <AuiIf condition={(s) => s.thread.isEmpty}>
          <ProjectChatWelcome />
        </AuiIf>

        <ProjectChatMessages />
      </ThreadPrimitive.Viewport>

      <div className="relative z-20 shrink-0 bg-background px-3 pt-3 pb-3">
        <ProjectChatComposer />
      </div>
    </ThreadPrimitive.Root>
  );
}
