import { AuiIf, ThreadPrimitive } from "@assistant-ui/react";

import { ProjectChatComposer } from "./Composer";
import { ProjectChatMessages } from "./Messages";
import { ProjectChatWelcome } from "./Welcome";

export function ProjectChatThread() {
  return (
    <ThreadPrimitive.Root className="flex h-full min-h-0 w-full flex-col">
      <ThreadPrimitive.Viewport className="relative flex min-h-0 w-full flex-1 flex-col overflow-y-auto px-3 pt-3">
        <AuiIf condition={(s) => s.thread.isEmpty}>
          <ProjectChatWelcome />
        </AuiIf>

        <ProjectChatMessages />

        <ThreadPrimitive.ViewportFooter className="sticky bottom-0 mt-auto w-full pb-3">
          <ProjectChatComposer />
        </ThreadPrimitive.ViewportFooter>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
}
