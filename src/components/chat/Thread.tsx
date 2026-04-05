import { AuiIf, ThreadPrimitive } from "@assistant-ui/react";

import { ProjectChatComposer } from "./Composer";
import { ProjectChatMessages } from "./Messages";
import { ProjectChatWelcome } from "./Welcome";

export function ProjectChatThread() {
  return (
    <ThreadPrimitive.Root className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-background via-background/90 to-transparent"
        style={{ boxShadow: "inset 0 10px 18px rgba(15, 23, 42, 0.06)" }}
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
