import type { MediaAsset } from "@/editor/types/assets";
import type { TProject, TProjectMetadata } from "@/editor/types/project";
import type { SavedSoundsData, SavedSound, SoundEffect } from "@/editor/types/sounds";

function cloneProject(project: TProject): TProject {
	return structuredClone(project);
}

function cloneMediaAsset(mediaAsset: MediaAsset): MediaAsset {
	return structuredClone(mediaAsset);
}

function cloneSavedSounds(data: SavedSoundsData): SavedSoundsData {
	return structuredClone(data);
}

function createEmptySavedSounds(): SavedSoundsData {
	return {
		sounds: [],
		lastModified: new Date().toISOString(),
	};
}

class StorageService {
	private projects = new Map<string, TProject>();
	private projectMedia = new Map<string, Map<string, MediaAsset>>();
	private savedSounds = createEmptySavedSounds();

	private getProjectMediaStore({ projectId }: { projectId: string }) {
		let mediaStore = this.projectMedia.get(projectId);
		if (!mediaStore) {
			mediaStore = new Map<string, MediaAsset>();
			this.projectMedia.set(projectId, mediaStore);
		}
		return mediaStore;
	}

	async saveProject({ project }: { project: TProject }): Promise<void> {
		this.projects.set(project.metadata.id, cloneProject(project));
	}

	async loadProject({
		id,
	}: {
		id: string;
	}): Promise<{ project: TProject } | null> {
		const project = this.projects.get(id);
		if (!project) return null;
		return { project: cloneProject(project) };
	}

	async loadAllProjects(): Promise<TProject[]> {
		return Array.from(this.projects.values())
			.map((project) => cloneProject(project))
			.sort(
				(a, b) =>
					b.metadata.updatedAt.getTime() - a.metadata.updatedAt.getTime(),
			);
	}

	async loadAllProjectsMetadata(): Promise<TProjectMetadata[]> {
		return Array.from(this.projects.values())
			.map((project) => ({
				...project.metadata,
				createdAt: new Date(project.metadata.createdAt),
				updatedAt: new Date(project.metadata.updatedAt),
			}))
			.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
	}

	async deleteProject({ id }: { id: string }): Promise<void> {
		this.projects.delete(id);
	}

	async saveMediaAsset({
		projectId,
		mediaAsset,
	}: {
		projectId: string;
		mediaAsset: MediaAsset;
	}): Promise<void> {
		this.getProjectMediaStore({ projectId }).set(
			mediaAsset.id,
			cloneMediaAsset(mediaAsset),
		);
	}

	async loadMediaAsset({
		projectId,
		id,
	}: {
		projectId: string;
		id: string;
	}): Promise<MediaAsset | null> {
		const mediaAsset = this.getProjectMediaStore({ projectId }).get(id);
		return mediaAsset ? cloneMediaAsset(mediaAsset) : null;
	}

	async loadAllMediaAssets({
		projectId,
	}: {
		projectId: string;
	}): Promise<MediaAsset[]> {
		return Array.from(this.getProjectMediaStore({ projectId }).values()).map(
			(mediaAsset) => cloneMediaAsset(mediaAsset),
		);
	}

	async deleteMediaAsset({
		projectId,
		id,
	}: {
		projectId: string;
		id: string;
	}): Promise<void> {
		this.getProjectMediaStore({ projectId }).delete(id);
	}

	async deleteProjectMedia({
		projectId,
	}: {
		projectId: string;
	}): Promise<void> {
		this.projectMedia.delete(projectId);
	}

	async clearAllData(): Promise<void> {
		this.projects.clear();
		this.projectMedia.clear();
		this.savedSounds = createEmptySavedSounds();
	}

	async getStorageInfo(): Promise<{
		projects: number;
		isOPFSSupported: boolean;
		isIndexedDBSupported: boolean;
	}> {
		return {
			projects: this.projects.size,
			isOPFSSupported: false,
			isIndexedDBSupported: false,
		};
	}

	async getProjectStorageInfo({ projectId }: { projectId: string }): Promise<{
		mediaItems: number;
	}> {
		return {
			mediaItems: this.getProjectMediaStore({ projectId }).size,
		};
	}

	async loadSavedSounds(): Promise<SavedSoundsData> {
		return cloneSavedSounds(this.savedSounds);
	}

	async saveSoundEffect({
		soundEffect,
	}: {
		soundEffect: SoundEffect;
	}): Promise<void> {
		if (this.savedSounds.sounds.some((sound) => sound.id === soundEffect.id)) {
			return;
		}

		const savedSound: SavedSound = {
			id: soundEffect.id,
			name: soundEffect.name,
			username: soundEffect.username,
			previewUrl: soundEffect.previewUrl,
			downloadUrl: soundEffect.downloadUrl,
			duration: soundEffect.duration,
			tags: soundEffect.tags,
			license: soundEffect.license,
			savedAt: new Date().toISOString(),
		};

		this.savedSounds = {
			sounds: [...this.savedSounds.sounds, savedSound],
			lastModified: new Date().toISOString(),
		};
	}

	async removeSavedSound({ soundId }: { soundId: number }): Promise<void> {
		this.savedSounds = {
			sounds: this.savedSounds.sounds.filter((sound) => sound.id !== soundId),
			lastModified: new Date().toISOString(),
		};
	}

	async isSoundSaved({ soundId }: { soundId: number }): Promise<boolean> {
		return this.savedSounds.sounds.some((sound) => sound.id === soundId);
	}

	async clearSavedSounds(): Promise<void> {
		this.savedSounds = createEmptySavedSounds();
	}

	isOPFSSupported(): boolean {
		return false;
	}

	isIndexedDBSupported(): boolean {
		return false;
	}

	isFullySupported(): boolean {
		return true;
	}
}

export const storageService = new StorageService();
export { StorageService };
