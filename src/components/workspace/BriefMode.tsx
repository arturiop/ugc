import { useEffect, useMemo, useRef, useState } from "react";
import type { Storyboard } from "@/api/storyboard";
import { useProject } from "@/contexts/Project/ProjectContext";
import { useUpdateProjectStoryboard } from "@/api/storyboard/hooks";
import { useDeleteProjectAsset, useProjectAssets, useUpdateProjectAssetLabel } from "@/api/assets/hooks";
import type { AssetItem, AssetLabel } from "@/api/assets";
import { buildUrl, getDefaultHeaders } from "@/api/httpClient";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import {
    ChevronDown,
    FileText,
    Users,
    Clock,
    Sparkles,
    Upload,
    Image as ImageIcon,
    Film,
    Monitor,
    X,
    Tag,
} from "lucide-react";

type BriefModeProps = {
    storyboard: Storyboard | null;
};

const toneOptions = ["Energetic", "Calm", "Bold", "Playful", "Cinematic", "Editorial", "Minimal", "Raw"];
const audienceOptions = ["Gen Z (18-24)", "Millennials (25-34)", "Young Pro (25-40)", "Broad (18-55)", "Premium (30-50)"];
const durationOptions = ["16s", "24s", "32s"];

const formatOptions: Array<{ value: Storyboard["aspect_ratio"]; label: string; desc: string }> = [
    { value: "16:9", label: "16:9", desc: "Landscape" },
    { value: "9:16", label: "9:16", desc: "Vertical" },
    { value: "1:1", label: "1:1", desc: "Square" },
    { value: "4:5", label: "4:5", desc: "Portrait" },
];

const modelOptions = [{ value: "veo-3.1", label: "Veo 3.1", desc: "Google - cinematic motion" }];

const platformOptions = [
    { value: "tiktok", label: "TikTok" },
    { value: "instagram", label: "Instagram" },
    { value: "generic", label: "Generic" },
];

const assetLabels: Array<{ value: AssetLabel; label: string }> = [
    { value: "product", label: "Product" },
    { value: "logo", label: "Logo" },
    { value: "brandbook", label: "Brandbook" },
    { value: "reference", label: "Reference" },
];

const BriefMode = ({ storyboard }: BriefModeProps) => {
    const { projectId } = useProject();
    const updateStoryboard = useUpdateProjectStoryboard(projectId);
    const { data: assetData } = useProjectAssets(projectId);
    const updateLabel = useUpdateProjectAssetLabel(projectId);
    const deleteAsset = useDeleteProjectAsset(projectId);
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formState, setFormState] = useState({
        audience: "",
        tone: "",
        platform: "generic",
        aspect_ratio: "9:16",
    });
    const [duration, setDuration] = useState(durationOptions[1]);
    const [model] = useState(modelOptions[0].value);
    const [assetsOpen, setAssetsOpen] = useState(false);
    const [uploadLabel, setUploadLabel] = useState<AssetLabel>("product");
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    useEffect(() => {
        if (!storyboard) return;
        setFormState({
            audience: storyboard.audience || "",
            tone: storyboard.tone || "",
            platform: storyboard.platform || "generic",
            aspect_ratio: storyboard.aspect_ratio || "9:16",
        });
    }, [storyboard]);

    const selectedTones = useMemo(
        () =>
            formState.tone
                .split(",")
                .map((val) => val.trim())
                .filter(Boolean),
        [formState.tone]
    );

    const assets = Array.isArray(assetData?.items) ? assetData.items : [];

    if (!storyboard) {
        return (
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-[820px] mx-auto px-8 py-10">
                    <div className="rounded-2xl border border-border bg-card px-6 py-5">
                        <h3 className="text-lg font-semibold text-foreground">No storyboard yet</h3>
                        <p className="text-sm text-muted-foreground">
                            Start a conversation to generate the first storyboard brief.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const updateField = (key: "audience" | "tone" | "platform" | "aspect_ratio", value: string) => {
        setFormState((prev) => ({ ...prev, [key]: value }));
        updateStoryboard.mutate({ [key]: value });
    };

    const toggleTone = (val: string) => {
        const next = selectedTones.includes(val)
            ? selectedTones.filter((tone) => tone !== val)
            : [...selectedTones, val];
        updateField("tone", next.join(", "));
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        if (!projectId || files.length === 0) return;

        setUploading(true);
        setUploadError(null);

        try {
            for (const file of files) {
                if (!file.type.startsWith("image/")) {
                    throw new Error("Only image uploads are supported.");
                }

                const form = new FormData();
                form.append("file", file);
                form.append("label", uploadLabel);

                const response = await fetch(buildUrl(`/api/v1/projects/${projectId}/assets/upload`), {
                    method: "POST",
                    headers: getDefaultHeaders(),
                    body: form,
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || "Failed to upload asset.");
                }
            }

            queryClient.invalidateQueries({ queryKey: queryKeys.projects.assets(projectId) });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to upload asset.";
            setUploadError(message);
        } finally {
            setUploading(false);
            event.target.value = "";
        }
    };

    const handleDeleteAsset = (asset: AssetItem) => {
        const confirmed = window.confirm(`Delete "${asset.filename}" from this project?`);
        if (!confirmed) return;
        deleteAsset.mutate({ assetId: asset.id });
    };

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-[860px] mx-auto px-8 py-10 space-y-10">
                <section className="space-y-3">
                    <FieldLabel icon={FileText} label="Creative Brief" />
                    <div className="rounded-2xl border border-border bg-card px-4 py-3">
                        <textarea
                            value={storyboard.concept || ""}
                            readOnly
                            rows={3}
                            className="w-full bg-transparent text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 outline-none resize-none"
                            placeholder="No creative brief captured yet."
                        />
                        <p className="text-[11px] text-muted-foreground/80">
                            Generated from chat. Refine the brief in conversation to update this text.
                        </p>
                    </div>
                </section>

                <section className="grid gap-6 md:grid-cols-2">
                    <div>
                        <FieldLabel icon={Sparkles} label="Tone & Mood" />
                        <div className="mt-3 flex flex-wrap gap-2">
                            {toneOptions.map((opt) => (
                                <Chip key={opt} label={opt} active={selectedTones.includes(opt)} onClick={() => toggleTone(opt)} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <FieldLabel icon={Users} label="Target Audience" />
                        <div className="mt-3 flex flex-wrap gap-2">
                            {audienceOptions.map((opt) => (
                                <Chip
                                    key={opt}
                                    label={opt}
                                    active={formState.audience === opt}
                                    onClick={() => updateField("audience", opt)}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <FieldLabel icon={Clock} label="Duration" />
                        <div className="mt-3 flex gap-2">
                            {durationOptions.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setDuration(option)}
                                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                                        duration === option
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "bg-muted text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <FieldLabel icon={Monitor} label="Video Format" />
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            {formatOptions.map((fmt) => (
                                <button
                                    key={fmt.value}
                                    onClick={() => updateField("aspect_ratio", fmt.value)}
                                    className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-3 text-center transition ${
                                        formState.aspect_ratio === fmt.value
                                            ? "border-primary/60 bg-primary/10 text-primary"
                                            : "border-border bg-card text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <FormatPreview format={fmt.value} active={formState.aspect_ratio === fmt.value} />
                                    <span className="text-[10px] font-semibold">{fmt.label}</span>
                                    <span className="text-[10px] opacity-60">{fmt.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <FieldLabel icon={Tag} label="Platform" />
                        <div className="relative mt-3">
                            <select
                                value={formState.platform}
                                onChange={(event) => updateField("platform", event.target.value)}
                                className="w-full appearance-none rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-foreground outline-none transition"
                            >
                                {platformOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        </div>
                    </div>
                    <div>
                        <FieldLabel icon={Sparkles} label="AI Model" />
                        <div className="mt-3 rounded-xl border border-border bg-card px-3 py-2.5">
                            <div className="text-xs font-semibold text-foreground">
                                {modelOptions.find((option) => option.value === model)?.label ?? "Veo 3.1"}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                                {modelOptions.find((option) => option.value === model)?.desc ?? ""}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <FieldLabel icon={Upload} label="Brand Assets" />
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <div className="rounded-2xl border border-dashed border-border bg-card/60 p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                                    <Upload className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-foreground">Drop files or click to upload</div>
                                    <div className="text-[11px] text-muted-foreground">
                                        Logos, product shots, brandbook pages, reference stills.
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    Label
                                </label>
                                <div className="relative">
                                    <select
                                        value={uploadLabel}
                                        onChange={(event) => setUploadLabel(event.target.value as AssetLabel)}
                                        className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground outline-none"
                                    >
                                        {assetLabels.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm"
                                    disabled={uploading}
                                >
                                    {uploading ? "Uploading..." : "Upload assets"}
                                </button>
                            </div>
                        </div>
                        {uploadError && <p className="mt-3 text-xs text-destructive">{uploadError}</p>}
                    </div>

                    <button
                        onClick={() => setAssetsOpen((open) => !open)}
                        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                        {assetsOpen ? "Hide uploaded assets" : "Show uploaded assets"}
                        <ChevronDown className={`h-3.5 w-3.5 transition ${assetsOpen ? "rotate-180" : ""}`} />
                    </button>
                    {assetsOpen && (
                        <div className="grid gap-2">
                            {assets.length === 0 ? (
                                <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                                    No assets uploaded yet.
                                </div>
                            ) : (
                                assets.map((asset) => (
                                    <AssetRow
                                        key={asset.id}
                                        asset={asset}
                                        isUpdating={updateLabel.isPending && updateLabel.variables?.assetId === asset.id}
                                        isDeleting={deleteAsset.isPending && deleteAsset.variables?.assetId === asset.id}
                                        onUpdateLabel={(label) => updateLabel.mutate({ assetId: asset.id, label })}
                                        onDelete={() => handleDeleteAsset(asset)}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

function FieldLabel({ icon: Icon, label }: { icon: typeof FileText; label: string }) {
    return (
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
        </div>
    );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                active ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
        >
            {label}
        </button>
    );
}

function FormatPreview({ format, active }: { format: Storyboard["aspect_ratio"]; active: boolean }) {
    const dims: Record<string, { w: number; h: number }> = {
        "16:9": { w: 32, h: 18 },
        "9:16": { w: 18, h: 32 },
        "1:1": { w: 26, h: 26 },
        "4:5": { w: 24, h: 30 },
    };
    const d = dims[format] ?? dims["9:16"];
    return (
        <div
            className={`rounded border-2 ${active ? "border-primary/60" : "border-border/60"}`}
            style={{ width: d.w, height: d.h }}
        />
    );
}

function AssetRow({
    asset,
    isUpdating,
    isDeleting,
    onUpdateLabel,
    onDelete,
}: {
    asset: AssetItem;
    isUpdating: boolean;
    isDeleting: boolean;
    onUpdateLabel: (label: AssetLabel) => void;
    onDelete: () => void;
}) {
    const isImage = asset.contentType?.startsWith("image/");
    const isVideo = asset.contentType?.startsWith("video/");
    const size = asset.sizeBytes ? formatFileSize(asset.sizeBytes) : null;

    return (
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card px-3 py-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    {isImage ? (
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    ) : isVideo ? (
                        <Film className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>
                <div>
                    <div className="text-sm font-semibold text-foreground">{asset.filename}</div>
                    {size && <div className="text-[11px] text-muted-foreground">{size}</div>}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="relative">
                    <select
                        value={asset.label}
                        onChange={(event) => onUpdateLabel(event.target.value as AssetLabel)}
                        disabled={isUpdating || isDeleting}
                        className="appearance-none rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground outline-none"
                    >
                        {assetLabels.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
                <button
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="rounded-lg border border-border p-2 text-muted-foreground transition hover:text-foreground"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default BriefMode;
