"use client";

import {
	ContextMenuCheckboxItem,
	ContextMenuContent,
	ContextMenuItem,
} from "@/editor/ui/context-menu";
import { useEditor } from "@/editor/hooks/use-editor";
import { usePreviewStore } from "@/editor/stores/preview-store";

export function PreviewContextMenu({
	onToggleFullscreen,
	containerRef,
}: {
	onToggleFullscreen: () => void;
	containerRef: React.RefObject<HTMLElement | null>;
}) {
	const editor = useEditor();
	const { overlays, setOverlayVisibility } = usePreviewStore();

	return (
		<ContextMenuContent className="w-56" container={containerRef.current}>
			<ContextMenuItem onClick={onToggleFullscreen} inset>
				Full screen
			</ContextMenuItem>
			<ContextMenuItem onClick={() => editor.renderer.saveSnapshot()} inset>
				Save snapshot
			</ContextMenuItem>
			<ContextMenuCheckboxItem
				checked={overlays.bookmarks}
				onCheckedChange={(checked) =>
					setOverlayVisibility({ overlay: "bookmarks", isVisible: !!checked })
				}
			>
				Show bookmarks
			</ContextMenuCheckboxItem>
			<ContextMenuItem inset>Show grid</ContextMenuItem>
		</ContextMenuContent>
	);
}
