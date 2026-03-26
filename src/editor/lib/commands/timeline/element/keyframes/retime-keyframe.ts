import { EditorCore } from "@/editor/core";
import { retimeElementKeyframe, supportsAnimationProperty } from "@/editor/lib/animation";
import { Command } from "@/editor/lib/commands/base-command";
import { updateElementInTracks } from "@/editor/lib/timeline";
import type { AnimationPropertyPath } from "@/editor/types/animation";
import type { TimelineTrack } from "@/editor/types/timeline";

export class RetimeKeyframeCommand extends Command {
	private savedState: TimelineTrack[] | null = null;
	private readonly trackId: string;
	private readonly elementId: string;
	private readonly propertyPath: AnimationPropertyPath;
	private readonly keyframeId: string;
	private readonly nextTime: number;

	constructor({
		trackId,
		elementId,
		propertyPath,
		keyframeId,
		nextTime,
	}: {
		trackId: string;
		elementId: string;
		propertyPath: AnimationPropertyPath;
		keyframeId: string;
		nextTime: number;
	}) {
		super();
		this.trackId = trackId;
		this.elementId = elementId;
		this.propertyPath = propertyPath;
		this.keyframeId = keyframeId;
		this.nextTime = nextTime;
	}

	execute(): void {
		const editor = EditorCore.getInstance();
		this.savedState = editor.timeline.getTracks();

		const updatedTracks = updateElementInTracks({
			tracks: this.savedState,
			trackId: this.trackId,
			elementId: this.elementId,
			elementPredicate: (element) =>
				supportsAnimationProperty({
					element,
					propertyPath: this.propertyPath,
				}),
			update: (element) => {
				const boundedTime = Math.max(0, Math.min(this.nextTime, element.duration));
				if (!Number.isFinite(boundedTime)) return element;
				return {
					...element,
					animations: retimeElementKeyframe({
						animations: element.animations,
						propertyPath: this.propertyPath,
						keyframeId: this.keyframeId,
						time: boundedTime,
					}),
				};
			},
		});

		editor.timeline.updateTracks(updatedTracks);
	}

	undo(): void {
		if (!this.savedState) {
			return;
		}

		const editor = EditorCore.getInstance();
		editor.timeline.updateTracks(this.savedState);
	}
}
