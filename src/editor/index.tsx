import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { ThemeProvider } from "@/editor/shims/next-themes";
import { TooltipProvider } from "@/editor/ui/tooltip";
import { Toaster } from "@/editor/shims/sonner";
import { EditorProvider } from "@/editor/providers/editor-provider";
import { Onboarding } from "@/editor/editor/onboarding";
import { AssetsPanel } from "@/editor/editor/panels/assets";
import { PropertiesPanel } from "@/editor/editor/panels/properties";
import { Timeline } from "@/editor/editor/panels/timeline";
import { PreviewPanel } from "@/editor/editor/panels/preview";
import { usePanelStore } from "@/editor/stores/panel-store";
import { usePasteMedia } from "@/editor/hooks/use-paste-media";
import "@/editor/globals.css";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/editor/ui/resizable";

export default function Editor() {
    const { projectId } = useParams();
    const activeProjectId = useMemo(() => projectId ?? "mock-project", [projectId]);

    return (
        <ThemeProvider>
            <TooltipProvider>
                <Toaster />
                    <EditorProvider projectId={activeProjectId}>
                        <div className="bg-background flex size-full max-h-full max-w-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                            <div className="min-h-0 min-w-0 flex-1">
                                <EditorLayout />
                            </div>
                            <Onboarding />
                        </div>
                    </EditorProvider>
            </TooltipProvider>
        </ThemeProvider>
    );
}

function EditorLayout() {
    usePasteMedia();
    const { panels, setPanel } = usePanelStore();

    return (
        <ResizablePanelGroup
            id="editor-root-group"
            orientation="horizontal"
            defaultLayout={{
                mainContent: panels.mainContent,
                tools: panels.tools,
            }}
            className="size-full gap-[0.18rem]"
            onLayoutChanged={(sizes) => {
                setPanel("mainContent", sizes.mainContent ?? panels.mainContent);
                setPanel("tools", sizes.tools ?? panels.tools);
            }}>
                <ResizablePanel
                    id="mainContent"
                    minSize="50%"
                    className="min-h-0 min-w-0 pt-3">
                <ResizablePanelGroup
                    id="editor-preview-group"
                    orientation="vertical"
                    defaultLayout={{
                        preview: panels.preview,
                        timeline: panels.timeline,
                    }}
                    className="size-full gap-[0.19rem] pl-1"
                    onLayoutChanged={(sizes) => {
                        setPanel("preview", sizes.preview ?? panels.preview);
                        setPanel("timeline", sizes.timeline ?? panels.timeline);
                    }}>
                    <ResizablePanel
                        id="preview"
                        minSize="30%"
                        className="min-h-0 min-w-0">
                        <div className="size-full min-h-0 min-w-0">
                            <PreviewPanel />
                        </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    <ResizablePanel
                        id="timeline"
                        minSize="15%"
                        maxSize="70%"
                        className="min-h-0 min-w-0 border-l border-border pb-3">
                        <div className="size-full min-h-0 min-w-0">
                            <Timeline />
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel
                id="tools"
                minSize="15%"
                maxSize="40%"
                className="min-h-0 min-w-0">
                <div className="flex size-full min-h-0 min-w-0 flex-col pr-3 pb-3">
                    <div className="min-h-0 flex-1">
                        <AssetsPanel />
                    </div>
                    <div className="mx-1 h-px shrink-0 bg-border" aria-hidden="true" />
                    <div className="min-h-0 flex-1">
                        <PropertiesPanel />
                    </div>
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
