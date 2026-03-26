"use client";

import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/editor/utils/ui";

const ResizablePanelGroup = ({
	className,
	...props
}: React.ComponentProps<typeof ResizablePrimitive.Group>) => (
	<ResizablePrimitive.Group
		className={cn(
			"flex size-full min-h-0 min-w-0 max-h-full max-w-full overflow-hidden data-[panel-group-direction=vertical]:flex-col",
			className,
		)}
		{...props}
	/>
);

const ResizablePanel = ({
	className,
	...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) => (
	<ResizablePrimitive.Panel
		className={cn("min-h-0 min-w-0 overflow-hidden", className)}
		{...props}
	/>
);

const ResizableHandle = ({
	withHandle,
	className,
	...props
}: React.ComponentProps<typeof ResizablePrimitive.Separator> & {
	withHandle?: boolean;
}) => (
	<ResizablePrimitive.Separator
		className={cn(
			"focus-visible:ring-ring relative flex shrink-0 items-center justify-center bg-transparent focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden",
			"aria-orientation-vertical:w-px aria-orientation-vertical:h-full",
			"aria-orientation-horizontal:h-px aria-orientation-horizontal:w-full",
			"after:absolute after:bg-border/80 after:content-['']",
			"aria-orientation-vertical:after:inset-y-0 aria-orientation-vertical:after:left-1/2 aria-orientation-vertical:after:w-px aria-orientation-vertical:after:-translate-x-1/2",
			"aria-orientation-horizontal:after:inset-x-0 aria-orientation-horizontal:after:top-1/2 aria-orientation-horizontal:after:h-px aria-orientation-horizontal:after:-translate-y-1/2",
			"data-[separator=hover]:after:bg-primary/60 data-[separator=active]:after:bg-primary data-[separator=drag]:after:bg-primary",
			className,
		)}
		{...props}
	>
		{withHandle ? (
			<div
				className={cn(
					"bg-border relative z-10 rounded-full transition-colors",
					"aria-orientation-vertical:h-8 aria-orientation-vertical:w-1",
					"aria-orientation-horizontal:h-1 aria-orientation-horizontal:w-8",
					"data-[separator=hover]:bg-primary/70 data-[separator=active]:bg-primary data-[separator=drag]:bg-primary",
				)}
			/>
		) : null}
	</ResizablePrimitive.Separator>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
