import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useApproveMarketplaceScenes, useCreateAndSubmitMarketplaceProject, useExtractMarketplaceListing } from "@/api/projects/hooks";
import { useProjectStoryboard } from "@/api/storyboard/hooks";
import MarketplaceStartView from "@/components/marketplace/MarketplaceStartView";
import MarketplaceWorkflowView from "@/components/marketplace/MarketplaceWorkflowView";
import { EMPTY_SCENE_SELECTION, SCENE_SLOTS, type ExtractedListingState, type ManualProductDraft } from "@/components/marketplace/types";
import { createEmptyManualDraft, isAmazonUrl, normalizeAmazonUrl, releaseManualImages } from "@/components/marketplace/utils";

export default function MarketplacePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const projectId = searchParams.get("projectId");
    const [urlInput, setUrlInput] = useState("");
    const [error, setError] = useState("");
    const [manualDraft, setManualDraft] = useState<ManualProductDraft>(() => createEmptyManualDraft());
    const [savedManualDraft, setSavedManualDraft] = useState<ManualProductDraft | null>(null);
    const [extractedListing, setExtractedListing] = useState<ExtractedListingState>(null);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [scenePickerOpen, setScenePickerOpen] = useState(false);
    const [pendingSceneSelection, setPendingSceneSelection] = useState<number[]>([]);

    const createAndSubmitMarketplaceProject = useCreateAndSubmitMarketplaceProject();
    const extractMarketplaceListing = useExtractMarketplaceListing();
    const approveMarketplaceScenes = useApproveMarketplaceScenes(projectId);

    const storyboardQuery = useProjectStoryboard(projectId, {
        refetchInterval: (query) => {
            const marketplaceState = query.state.data?.marketplace;
            if (!marketplaceState) return false;
            if (marketplaceState.pipeline_step === "awaiting_scene_approval") return false;
            return marketplaceState.pipeline_status === "running" ? 5000 : false;
        },
    });
    const storyboard = storyboardQuery.data?.storyboard ?? null;
    const marketplace = storyboardQuery.data?.marketplace ?? null;
    const pipelineStatus = marketplace?.pipeline_status;
    const pipelineStep = marketplace?.pipeline_step;
    const finalVideoStatus = marketplace?.final_video_status ?? "not_started";
    const finalVideoUrl = marketplace?.final_video_url ?? null;
    const hasBoundProject = Boolean(projectId);
    const isLocked = hasBoundProject;
    const isSubmitting = extractMarketplaceListing.isPending;
    const manualTitle = manualDraft.title.trim();
    const manualDescription = manualDraft.description.trim();
    const manualVibe = manualDraft.vibe.trim();
    const imageUrlFromState = marketplace?.product_image_url || extractedListing?.product_image_url || null;
    const canCreateProjectFromCurrentData = Boolean(manualTitle && manualDescription && (manualDraft.images.length > 0 || imageUrlFromState));
    const hasPipelineActivity = Boolean(pipelineStatus && pipelineStatus !== "idle");
    const pipelineError = marketplace?.pipeline_error || error;
    const storyboardSceneCount = storyboard?.scenes?.length ?? 0;
    const readySceneCount = storyboard?.scenes?.filter((scene) => Boolean(scene.generated_image_url)).length ?? 0;
    const displayImages = savedManualDraft?.images || manualDraft.images;
    const selectedSceneIndices = marketplace?.selected_scene_indices ?? EMPTY_SCENE_SELECTION;
    const allSceneImagesReady = storyboardSceneCount > 0 && readySceneCount === storyboardSceneCount;
    const estimatedVideoLengthSeconds = pendingSceneSelection.length * 8;
    const awaitingSceneApproval = pipelineStep === "awaiting_scene_approval";
    const canLaunchVideoSelection = Boolean(allSceneImagesReady && !pipelineError);
    const progressLabel =
        isCreatingProject
            ? "Creating project"
            : isSubmitting
              ? "Extracting"
              : pipelineStep === "generating_scene_images"
                ? "Generating images"
                : pipelineStep === "awaiting_scene_approval"
                  ? "Select scenes for video"
                  : pipelineStep === "generating_scene_videos"
                    ? "Generating videos"
                    : pipelineStep === "combining_video"
                      ? "Combining final video"
                      : pipelineStep === "completed"
                        ? "Completed"
                        : isLocked
                          ? "Project created"
                          : canCreateProjectFromCurrentData
                            ? "Ready"
                            : extractedListing
                              ? "Preview ready"
                              : "Idle";
    useEffect(() => {
        if (!scenePickerOpen) return;
        setPendingSceneSelection(selectedSceneIndices);
    }, [scenePickerOpen, selectedSceneIndices]);

    useEffect(() => {
        if (!isLocked || !marketplace) return;

        setManualDraft((current) => {
            const nextTitle = marketplace.product_title ?? "";
            const nextDescription = marketplace.product_description ?? "";
            const nextVibe = marketplace.style ?? "";

            if (
                current.title === nextTitle &&
                current.description === nextDescription &&
                current.vibe === nextVibe
            ) {
                return current;
            }

            return {
                ...current,
                title: nextTitle,
                description: nextDescription,
                vibe: nextVibe,
            };
        });
    }, [
        isLocked,
        marketplace?.product_title,
        marketplace?.product_description,
        marketplace?.style,
        marketplace,
    ]);

    useEffect(() => {
        return () => {
            const uniqueUrls = new Set([
                ...manualDraft.images.map((image) => image.previewUrl),
                ...(savedManualDraft?.images ?? []).map((image) => image.previewUrl),
            ]);
            uniqueUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [manualDraft.images, savedManualDraft]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const normalized = normalizeAmazonUrl(urlInput);
        if (!normalized) {
            setError("Paste an Amazon product link to start.");
            return;
        }
        if (!isAmazonUrl(normalized)) {
            setError("Use a valid Amazon product link.");
            return;
        }

        setError("");

        try {
            const listing = await extractMarketplaceListing.mutateAsync({
                productUrl: normalized,
            });
            setExtractedListing(listing);
            setUrlInput(listing.product_url);
            setManualDraft((current) => ({
                ...current,
                title: listing.product_title,
                description: listing.product_description,
            }));
        } catch (submissionError) {
            setError(submissionError instanceof Error ? submissionError.message : "Failed to extract marketplace listing.");
        }
    };

    const handleStartViewInputChange = (value: string) => {
        const trimmed = value.trim();
        setUrlInput(value);
        setError("");

        if (!trimmed) {
            if (!extractedListing) {
                setManualDraft((current) => ({
                    ...current,
                    title: "",
                }));
            }
            return;
        }

        if (isAmazonUrl(normalizeAmazonUrl(value))) {
            return;
        }

        setExtractedListing(null);
        setManualDraft((current) => ({
            ...current,
            title: value,
        }));
    };

    const handleResetStartView = () => {
        setUrlInput("");
        setError("");
        setExtractedListing(null);
        setManualDraft(createEmptyManualDraft());
    };

    const handleManualFieldChange =
        (field: keyof Omit<ManualProductDraft, "images">) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setManualDraft((current) => ({ ...current, [field]: event.target.value }));
        };

    const handleVibeSelect = (value: string) => {
        setManualDraft((current) => ({ ...current, vibe: value }));
    };

    const handleManualImagesChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        if (files.length === 0) return;

        const nextImages = files.map((file, index) => ({
            id: `${file.name}-${file.size}-${file.lastModified}-${index}`,
            file,
            previewUrl: URL.createObjectURL(file),
        }));

        setManualDraft((current) => ({
            ...current,
            images: [...current.images, ...nextImages],
        }));
        event.target.value = "";
    };

    const handleCreateProjectFromBrief = async () => {
        if (!canCreateProjectFromCurrentData || isCreatingProject) return;

        setError("");
        setIsCreatingProject(true);

        try {
            let result;

            if (manualDraft.images.length > 0) {
                result = await createAndSubmitMarketplaceProject.mutateAsync({
                    source: extractedListing ? "amazon_extracted" : "manual",
                    product_title: manualTitle,
                    product_description: manualDescription,
                    style: manualVibe || null,
                    files: manualDraft.images.map((image) => image.file),
                    listing_metadata: {},
                });
                setSavedManualDraft({
                    title: manualTitle,
                    description: manualDescription,
                    vibe: manualVibe,
                    images: manualDraft.images,
                });
            } else if (extractedListing) {
                result = await createAndSubmitMarketplaceProject.mutateAsync({
                    source: "amazon_extracted",
                    product_title: manualTitle || extractedListing.product_title,
                    product_description: manualDescription || extractedListing.product_description,
                    style: manualVibe || null,
                    image_urls: [extractedListing.product_image_url],
                    listing_metadata: {
                        image_candidates: [extractedListing.product_image_url],
                    },
                });
            } else {
                throw new Error("No marketplace input was provided.");
            }

            const nextParams = new URLSearchParams(searchParams);
            nextParams.set("projectId", result.project_short_id);
            setSearchParams(nextParams, { replace: true });
        } catch (creationError) {
            setError(creationError instanceof Error ? creationError.message : "Failed to create marketplace project.");
        } finally {
            setIsCreatingProject(false);
        }
    };

    const togglePendingScene = (sceneIndex: number) => {
        setPendingSceneSelection((current) =>
            current.includes(sceneIndex) ? current.filter((value) => value !== sceneIndex) : [...current, sceneIndex].sort((a, b) => a - b)
        );
    };

    const handleApproveScenes = async () => {
        if (!projectId || pendingSceneSelection.length === 0) {
            setError("Select at least one scene to generate the video.");
            return;
        }

        setError("");
        try {
            await approveMarketplaceScenes.mutateAsync({ sceneIndices: pendingSceneSelection });
            setScenePickerOpen(false);
        } catch (approvalError) {
            setError(approvalError instanceof Error ? approvalError.message : "Failed to approve marketplace scenes.");
        }
    };

    if (!hasBoundProject) {
        return (
            <MarketplaceStartView
                urlInput={urlInput}
                onUrlInputChange={handleStartViewInputChange}
                onExtractSubmit={handleSubmit}
                error={error}
                isSubmitting={isSubmitting}
                isCreatingProject={isCreatingProject}
                progressLabel={progressLabel}
                manualDraft={manualDraft}
                extractedListing={extractedListing}
                imageUrlFromState={imageUrlFromState}
                displayImages={displayImages}
                canCreateProjectFromCurrentData={canCreateProjectFromCurrentData}
                onManualFieldChange={handleManualFieldChange}
                onVibeSelect={handleVibeSelect}
                onManualImagesChange={handleManualImagesChange}
                onCreateProjectFromBrief={handleCreateProjectFromBrief}
                onReset={handleResetStartView}
            />
        );
    }

    return (
        <MarketplaceWorkflowView
            projectId={projectId}
            marketplace={marketplace}
            storyboard={storyboard}
            manualDraft={manualDraft}
            displayImages={displayImages}
            imageUrlFromState={imageUrlFromState}
            progressLabel={progressLabel}
            hasPipelineActivity={hasPipelineActivity}
            pipelineError={pipelineError}
            storyboardSceneCount={storyboardSceneCount}
            readySceneCount={readySceneCount}
            finalVideoStatus={finalVideoStatus}
            finalVideoUrl={finalVideoUrl}
            allSceneImagesReady={allSceneImagesReady}
            awaitingSceneApproval={awaitingSceneApproval}
            canLaunchVideoSelection={canLaunchVideoSelection}
            approveMarketplaceScenesPending={approveMarketplaceScenes.isPending}
            selectedSceneIndices={selectedSceneIndices}
            pendingSceneSelection={pendingSceneSelection}
            estimatedVideoLengthSeconds={estimatedVideoLengthSeconds}
            scenePickerOpen={scenePickerOpen}
            onOpenScenePicker={() => {
                setPendingSceneSelection(selectedSceneIndices);
                setScenePickerOpen(true);
            }}
            onCloseScenePicker={() => setScenePickerOpen(false)}
            onTogglePendingScene={togglePendingScene}
            onApproveScenes={handleApproveScenes}
            sceneSlots={SCENE_SLOTS}
        />
    );
}
