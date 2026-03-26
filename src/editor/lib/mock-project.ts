import type { MediaAsset } from "@/editor/types/assets";
import type { TProject } from "@/editor/types/project";
import type { TextElement, TextTrack, TimelineTrack, TScene } from "@/editor/types/timeline";
import { buildDefaultScene, getProjectDurationFromScenes } from "@/editor/lib/scenes";
import { buildTextElement, buildVideoElement } from "@/editor/lib/timeline/element-utils";
import { buildEmptyTrack } from "@/editor/lib/timeline/track-utils";
import { DEFAULT_CANVAS_SIZE, DEFAULT_FPS } from "@/editor/constants/project-constants";
import { DEFAULT_TIMELINE_VIEW_STATE } from "@/editor/constants/timeline-constants";
import { generateUUID } from "@/editor/utils/id";
import { generateThumbnail } from "@/editor/lib/media/processing";
import { getVideoInfo } from "@/editor/lib/media/mediabunny";

const UI_PROJECT_VERSION = 1;

function buildMockTextElement({
	content,
	startTime,
	duration,
	fontSize,
	positionY,
	backgroundEnabled = false,
	backgroundColor = "#000000",
}: {
	content: string;
	startTime: number;
	duration: number;
	fontSize: number;
	positionY: number;
	backgroundEnabled?: boolean;
	backgroundColor?: string;
}): TextElement {
	return {
		...(buildTextElement({
			startTime,
			raw: {
				content,
				duration,
				fontSize,
				fontWeight: "bold",
				color: "#ffffff",
				background: {
					enabled: backgroundEnabled,
					color: backgroundColor,
					paddingX: 28,
					paddingY: 18,
					cornerRadius: 14,
				},
				transform: {
					scale: 1,
					position: { x: 0, y: positionY },
					rotate: 0,
				},
			},
		}) as TextElement),
		id: generateUUID(),
	};
}

function buildMockScene({
	demoVideo,
}: {
	demoVideo?: {
		mediaId: string;
		duration: number;
		name: string;
	};
}): TScene {
	const scene = buildDefaultScene({ name: "Main scene", isMain: true });
	const baseTracks = [...(scene.tracks as TimelineTrack[])];
	const mainTrack = baseTracks[0];

	if (demoVideo && mainTrack?.type === "video") {
		mainTrack.elements = [
			{
				...(buildVideoElement({
					mediaId: demoVideo.mediaId,
					name: demoVideo.name,
					duration: demoVideo.duration,
					startTime: 0,
				}) as Extract<TimelineTrack["elements"][number], { type: "video" }>),
				id: generateUUID(),
			},
		];
	}

	const textTrack = buildEmptyTrack({
		id: generateUUID(),
		type: "text",
		name: "UGC mock copy",
	}) as TextTrack;

	textTrack.elements = [
		buildMockTextElement({
			content: "Stop scrolling",
			startTime: 0,
			duration: 1.8,
			fontSize: 24,
			positionY: -360,
			backgroundEnabled: true,
			backgroundColor: "#0f172a",
		}),
		buildMockTextElement({
			content: "Show the product. Keep the hook short. Make the CTA obvious.",
			startTime: 1.8,
			duration: 2.8,
			fontSize: 18,
			positionY: 0,
		}),
		buildMockTextElement({
			content: "Try your first edit in the timeline below",
			startTime: 4.8,
			duration: 2.2,
			fontSize: 20,
			positionY: 360,
			backgroundEnabled: true,
			backgroundColor: "#0369a1",
		}),
	];

	scene.tracks = [...baseTracks, textTrack];
	scene.bookmarks = [
		{ time: 0.2, note: "Hook" },
		{ time: 2.0, note: "Message" },
		{ time: 4.8, note: "CTA" },
	];

	return scene;
}

export function createMockProject({
	id,
	name,
	demoVideo,
}: {
	id: string;
	name: string;
	demoVideo?: {
		mediaId: string;
		duration: number;
		name: string;
	};
}): TProject {
	const mainScene = buildMockScene({ demoVideo });
	const createdAt = new Date();

	return {
		metadata: {
			id,
			name,
			duration: getProjectDurationFromScenes({ scenes: [mainScene] }),
			createdAt,
			updatedAt: createdAt,
		},
		scenes: [mainScene],
		currentSceneId: mainScene.id,
		settings: {
			fps: DEFAULT_FPS,
			canvasSize: DEFAULT_CANVAS_SIZE,
			originalCanvasSize: null,
			background: {
				type: "color",
				color: "#111827",
			},
		},
		version: UI_PROJECT_VERSION,
		timelineViewState: DEFAULT_TIMELINE_VIEW_STATE,
	};
}

export async function createMockDemoVideoAsset(): Promise<MediaAsset | null> {
	try {
		const response = await fetch("/assets/demo.mp4");
		if (!response.ok) {
			throw new Error(`Failed to load demo video: ${response.status}`);
		}

		const blob = await response.blob();
		const file = new File([blob], "demo.mp4", { type: blob.type || "video/mp4" });
		const objectUrl = URL.createObjectURL(file);

		let duration = 6;
		let width: number | undefined;
		let height: number | undefined;
		let fps: number | undefined;
		let thumbnailUrl: string | undefined;

		try {
			const videoInfo = await getVideoInfo({ videoFile: file });
			duration = videoInfo.duration;
			width = videoInfo.width;
			height = videoInfo.height;
			fps = Number.isFinite(videoInfo.fps) ? Math.round(videoInfo.fps) : undefined;
		} catch {}

		try {
			thumbnailUrl = await generateThumbnail({
				videoFile: file,
				timeInSeconds: Math.min(1, Math.max(duration / 2, 0)),
			});
		} catch {}

		return {
			id: generateUUID(),
			name: "demo.mp4",
			type: "video",
			file,
			url: objectUrl,
			thumbnailUrl,
			duration,
			width,
			height,
			fps,
		};
	} catch (error) {
		console.warn("Failed to create mock demo asset", error);
		return null;
	}
}
