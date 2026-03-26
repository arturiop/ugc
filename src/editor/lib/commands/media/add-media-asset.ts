import { Command } from "@/editor/lib/commands/base-command";
import { EditorCore } from "@/editor/core";
import type { MediaAsset } from "@/editor/types/assets";
import { generateUUID } from "@/editor/utils/id";
import { storageService } from "@/editor/services/storage/service";

export class AddMediaAssetCommand extends Command {
	private assetId: string;
	private savedAssets: MediaAsset[] | null = null;
	private createdAsset: MediaAsset | null = null;

	constructor(
		private projectId: string,
		private asset: Omit<MediaAsset, "id">,
	) {
		super();
		this.assetId = generateUUID();
	}

	execute(): void {
		const editor = EditorCore.getInstance();
		this.savedAssets = [...editor.media.getAssets()];

		this.createdAsset = {
			...this.asset,
			id: this.assetId,
		};

		editor.media.setAssets({
			assets: [...this.savedAssets, this.createdAsset],
		});

		storageService
			.saveMediaAsset({
				projectId: this.projectId,
				mediaAsset: this.createdAsset,
			})
			.catch((error) => {
				console.error("Failed to save media item:", error);
			});
	}

	undo(): void {
		if (this.savedAssets) {
			const editor = EditorCore.getInstance();
			editor.media.setAssets({ assets: this.savedAssets });

			if (this.createdAsset) {
				storageService
					.deleteMediaAsset({ projectId: this.projectId, id: this.assetId })
					.catch((error) => {
						console.error("Failed to delete media item on undo:", error);
					});
			}
		}
	}

	getAssetId(): string {
		return this.assetId;
	}
}
