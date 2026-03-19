import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import type { Storyboard } from "@/api/storyboard";

type StoryboardModeProps = {
    storyboard: Storyboard | null;
    selectedSceneIndex: number | null;
    onSelectScene: (sceneIndex: number) => void;
};

type SceneRect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type StoryboardImageLike = {
    image_url?: string | null;
    storyboard_image_url?: string | null;
    generated_image_url?: string | null;
    storyboard_url?: string | null;
};

const getUniformGridRects = (imageWidth: number, imageHeight: number, sceneCount: number): SceneRect[] => {
    let columns = 1;
    let rows = 1;

    if (sceneCount === 6) {
        columns = 3;
        rows = 2;
    } else if (sceneCount === 4) {
        columns = 2;
        rows = 2;
    } else if (sceneCount === 3) {
        columns = 3;
        rows = 1;
    } else if (sceneCount === 2) {
        columns = 2;
        rows = 1;
    } else if (sceneCount > 0) {
        columns = Math.ceil(Math.sqrt(sceneCount));
        rows = Math.ceil(sceneCount / columns);
    }

    const cellWidth = imageWidth / columns;
    const cellHeight = imageHeight / rows;
    const rects: SceneRect[] = [];

    for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
            if (rects.length >= sceneCount) {
                return rects;
            }

            rects.push({
                x: column * cellWidth,
                y: row * cellHeight,
                width: cellWidth,
                height: cellHeight,
            });
        }
    }

    return rects;
};

const getStoryboardImageUrl = (storyboard: Storyboard | null): string | null => {
    if (!storyboard) {
        return null;
    }
    const candidate = storyboard as Storyboard & StoryboardImageLike;
    return (
        candidate.image_url ??
        candidate.storyboard_image_url ??
        candidate.generated_image_url ??
        candidate.storyboard_url ??
        null
    );
};

const findContentSpans = (
    projection: number[],
    threshold: number,
    minGapSize: number,
    minContentSize: number,
): Array<[number, number]> => {
    const isGap = projection.map((value) => value >= threshold);
    const gaps: Array<[number, number]> = [];
    let start: number | null = null;

    for (let index = 0; index < isGap.length; index += 1) {
        if (isGap[index] && start === null) {
            start = index;
        } else if (!isGap[index] && start !== null) {
            if (index - start >= minGapSize) {
                gaps.push([start, index]);
            }
            start = null;
        }
    }

    if (start !== null && isGap.length - start >= minGapSize) {
        gaps.push([start, isGap.length]);
    }

    const spans: Array<[number, number]> = [];
    let previousGapEnd = 0;

    gaps.forEach(([gapStart, gapEnd]) => {
        if (gapStart - previousGapEnd >= minContentSize) {
            spans.push([previousGapEnd, gapStart]);
        }
        previousGapEnd = gapEnd;
    });

    if (isGap.length - previousGapEnd >= minContentSize) {
        spans.push([previousGapEnd, isGap.length]);
    }

    return spans;
};

const trimOuterWhitespace = (
    data: Uint8ClampedArray,
    width: number,
    height: number,
    whiteThreshold = 245,
) => {
    const isMostlyWhitePixel = (index: number) => {
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        return r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold;
    };

    const rowWhiteRatio = (y: number) => {
        let whitePixels = 0;
        for (let x = 0; x < width; x += 1) {
            const index = (y * width + x) * 4;
            if (isMostlyWhitePixel(index)) {
                whitePixels += 1;
            }
        }
        return whitePixels / width;
    };

    const columnWhiteRatio = (x: number) => {
        let whitePixels = 0;
        for (let y = 0; y < height; y += 1) {
            const index = (y * width + x) * 4;
            if (isMostlyWhitePixel(index)) {
                whitePixels += 1;
            }
        }
        return whitePixels / height;
    };

    let top = 0;
    let bottom = height - 1;
    let left = 0;
    let right = width - 1;

    while (top < height && rowWhiteRatio(top) > 0.98) {
        top += 1;
    }
    while (bottom > top && rowWhiteRatio(bottom) > 0.98) {
        bottom -= 1;
    }
    while (left < width && columnWhiteRatio(left) > 0.98) {
        left += 1;
    }
    while (right > left && columnWhiteRatio(right) > 0.98) {
        right -= 1;
    }

    return {
        x: left,
        y: top,
        width: Math.max(1, right - left + 1),
        height: Math.max(1, bottom - top + 1),
    };
};

const getFallbackGridRects = (imageWidth: number, imageHeight: number, sceneCount: number): SceneRect[] => {
    let columns = 1;
    let rows = 1;

    if (sceneCount === 4) {
        columns = 2;
        rows = 2;
    } else if (sceneCount === 6) {
        columns = 3;
        rows = 2;
    } else if (sceneCount === 3) {
        columns = 3;
        rows = 1;
    } else if (sceneCount === 2) {
        columns = 2;
        rows = 1;
    } else if (sceneCount > 0) {
        columns = Math.ceil(Math.sqrt(sceneCount));
        rows = Math.ceil(sceneCount / columns);
    }

    const gap = Math.max(8, Math.round(Math.min(imageWidth, imageHeight) * 0.01));
    const cellWidth = (imageWidth - gap * (columns + 1)) / columns;
    const cellHeight = (imageHeight - gap * (rows + 1)) / rows;

    const rects: SceneRect[] = [];

    for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
            if (rects.length >= sceneCount) {
                return rects;
            }

            rects.push({
                x: gap + column * (cellWidth + gap),
                y: gap + row * (cellHeight + gap),
                width: cellWidth,
                height: cellHeight,
            });
        }
    }

    return rects;
};

const detectStoryboardGrid = async (imageUrl: string): Promise<{ scenes: SceneRect[]; imageWidth: number; imageHeight: number }> => {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const element = new Image();
        element.onload = () => resolve(element);
        element.onerror = () => reject(new Error("Failed to load storyboard image"));
        element.src = imageUrl;
    });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
        throw new Error("Canvas is not supported in this browser");
    }

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    context.drawImage(image, 0, 0);

    const fullImage = context.getImageData(0, 0, canvas.width, canvas.height);
    const trimmed = trimOuterWhitespace(fullImage.data, canvas.width, canvas.height);
    const croppedImage = context.getImageData(trimmed.x, trimmed.y, trimmed.width, trimmed.height);
    const { data, width, height } = croppedImage;

    const rowProjection = new Array<number>(height).fill(0);
    const columnProjection = new Array<number>(width).fill(0);
    const columnStart = Math.floor(width * 0.1);
    const columnEnd = Math.max(columnStart + 1, Math.ceil(width * 0.9));
    const rowStart = Math.floor(height * 0.1);
    const rowEnd = Math.max(rowStart + 1, Math.ceil(height * 0.9));

    for (let y = 0; y < height; y += 1) {
        let rowBrightness = 0;
        let rowPixelCount = 0;

        for (let x = columnStart; x < columnEnd; x += 1) {
            const index = (y * width + x) * 4;
            const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
            rowBrightness += brightness;
            rowPixelCount += 1;
        }

        rowProjection[y] = rowPixelCount > 0 ? rowBrightness / rowPixelCount : 0;
    }

    for (let x = 0; x < width; x += 1) {
        let columnBrightness = 0;
        let columnPixelCount = 0;

        for (let y = rowStart; y < rowEnd; y += 1) {
            const index = (y * width + x) * 4;
            const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
            columnBrightness += brightness;
            columnPixelCount += 1;
        }

        columnProjection[x] = columnPixelCount > 0 ? columnBrightness / columnPixelCount : 0;
    }

    const columns = findContentSpans(
        columnProjection,
        235,
        Math.max(6, Math.floor(width * 0.008)),
        Math.max(80, Math.floor(width * 0.12)),
    );
    const rows = findContentSpans(
        rowProjection,
        235,
        Math.max(6, Math.floor(height * 0.008)),
        Math.max(80, Math.floor(height * 0.18)),
    );

    const scenes: SceneRect[] = [];

    rows.forEach(([y0, y1]) => {
        columns.forEach(([x0, x1]) => {
            scenes.push({
                x: trimmed.x + x0,
                y: trimmed.y + y0,
                width: x1 - x0,
                height: y1 - y0,
            });
        });
    });

    return {
        scenes,
        imageWidth: image.naturalWidth,
        imageHeight: image.naturalHeight,
    };
};

const useStoryboardRects = (imageUrl: string | null, expectedSceneCount: number) => {
    const [rects, setRects] = useState<SceneRect[]>([]);
    const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

    useEffect(() => {
        let cancelled = false;

        if (!imageUrl || expectedSceneCount <= 0) {
            setRects([]);
            setImageSize(null);
            return () => {
                cancelled = true;
            };
        }

        const run = async () => {
            try {
                const result = await detectStoryboardGrid(imageUrl);

                if (cancelled) {
                    return;
                }

                setImageSize({ width: result.imageWidth, height: result.imageHeight });
                setRects(
                    result.scenes.length === expectedSceneCount
                        ? result.scenes
                        : getFallbackGridRects(result.imageWidth, result.imageHeight, expectedSceneCount),
                );
            } catch {
                if (!cancelled) {
                    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
                        const element = new Image();
                        element.onload = () => resolve(element);
                        element.onerror = () => reject(new Error("Failed to load storyboard image"));
                        element.src = imageUrl;
                    });

                    if (cancelled) {
                        return;
                    }

                    setImageSize({ width: image.naturalWidth, height: image.naturalHeight });
                    setRects(getFallbackGridRects(image.naturalWidth, image.naturalHeight, expectedSceneCount));
                }
            }
        };

        void run();

        return () => {
            cancelled = true;
        };
    }, [imageUrl, expectedSceneCount]);

    return { rects, imageSize };
};

const StoryboardSceneCrop = ({
    imageUrl,
    rect,
    imageWidth,
    imageHeight,
    width = "100%",
    height = "100%",
    zoom = 1,
}: {
    imageUrl: string;
    rect: SceneRect;
    imageWidth: number;
    imageHeight: number;
    width?: number | string;
    height?: number | string;
    zoom?: number;
}) => {
    const scaleX = (imageWidth / rect.width) * 100 * zoom;
    const scaleY = (imageHeight / rect.height) * 100 * zoom;
    const left = -(rect.x / rect.width) * 100 * zoom;
    const top = -(rect.y / rect.height) * 100 * zoom;
    return (
        <Box
            sx={{
                width,
                height,
                position: "relative",
                overflow: "hidden",
                backgroundColor: "background.default",
            }}
        >
            <Box
                component="img"
                src={imageUrl}
                alt=""
                sx={{
                    position: "absolute",
                    left: `${left}%`,
                    top: `${top}%`,
                    width: `${scaleX}%`,
                    height: `${scaleY}%`,
                    maxWidth: "none",
                    userSelect: "none",
                    pointerEvents: "none",
                }}
            />
        </Box>
    );
};

const StoryboardMode = ({ storyboard, selectedSceneIndex, onSelectScene }: StoryboardModeProps) => {
    const scenes = storyboard?.scenes ?? [];
    const storyboardImageUrl = getStoryboardImageUrl(storyboard);
    const { rects, imageSize } = useStoryboardRects(storyboardImageUrl, scenes.length);
    const displayRects =
        imageSize && scenes.length > 0 ? getUniformGridRects(imageSize.width, imageSize.height, scenes.length) : rects;
    const readyCount = scenes.filter((scene) => Boolean(scene.generated_image_url)).length;
    if (!storyboard) {
        return <StoryboardEmptyState />;
    }

    return (
        <StoryboardLayout
            scenes={scenes}
            selectedSceneIndex={selectedSceneIndex}
            onSelectScene={onSelectScene}
            storyboardImageUrl={storyboardImageUrl}
            imageSize={imageSize}
            rects={rects}
            displayRects={displayRects}
            readyCount={readyCount}
        />
    );
};

export default StoryboardMode;

const StoryboardEmptyState = () => (
    <Box sx={{ p: { xs: 2.5, md: 4 }, height: "100%", overflowY: "auto" }}>
        <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
            <CardContent>
                <Typography variant="h6" fontWeight={700}>
                    No storyboard available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Generate a storyboard to see the scenes laid out here.
                </Typography>
            </CardContent>
        </Card>
    </Box>
);

type StoryboardLayoutProps = {
    scenes: Storyboard["scenes"];
    selectedSceneIndex: number | null;
    onSelectScene: (sceneIndex: number) => void;
    storyboardImageUrl: string | null;
    imageSize: { width: number; height: number } | null;
    rects: SceneRect[];
    displayRects: SceneRect[];
    readyCount: number;
};

const StoryboardLayout = ({
    scenes,
    selectedSceneIndex,
    onSelectScene,
    storyboardImageUrl,
    imageSize,
    rects,
    displayRects,
    readyCount,
}: StoryboardLayoutProps) => (
    <Box sx={{ p: { xs: 2.5, md: 4 }, height: "100%", overflowY: "auto" }}>
        <Stack spacing={2.5} sx={{ maxWidth: 960, mx: "auto" }}>
            <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={2}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
                    {readyCount}/{scenes.length} ready
                </Typography>
            </Stack>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" },
                    gap: 2,
                }}
            >
                {scenes.map((scene, index) => (
                    <StoryboardGridItem
                        key={scene.scene_index}
                        scene={scene}
                        isSelected={scene.scene_index === selectedSceneIndex}
                        onSelect={() => onSelectScene(scene.scene_index)}
                        storyboardImageUrl={storyboardImageUrl}
                        imageSize={imageSize}
                        rect={displayRects[index] ?? rects[index]}
                    />
                ))}
            </Box>
        </Stack>
    </Box>
);

type StoryboardGridItemProps = {
    scene: Storyboard["scenes"][number];
    isSelected: boolean;
    onSelect: () => void;
    storyboardImageUrl: string | null;
    imageSize: { width: number; height: number } | null;
    rect?: SceneRect;
};

const StoryboardGridItem = ({ scene, isSelected, onSelect, storyboardImageUrl, imageSize, rect }: StoryboardGridItemProps) => {
    const isReady = Boolean(scene.generated_image_url);
    return (
        <Card
            elevation={0}
            onClick={onSelect}
            sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: isSelected ? "primary.main" : "divider",
                bgcolor: isSelected ? "action.selected" : "background.paper",
                overflow: "hidden",
                cursor: "pointer",
            }}
        >
                <Box
                    sx={{
                        height: 180,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.default",
                        display: "grid",
                        placeItems: "center",
                    }}
                >
                    {storyboardImageUrl && imageSize && rect ? (
                        <StoryboardSceneCrop
                            imageUrl={storyboardImageUrl}
                            rect={rect}
                            imageWidth={imageSize.width}
                            imageHeight={imageSize.height}
                        />
                    ) : scene.generated_image_url ? (
                        <Box
                            component="img"
                            src={scene.generated_image_url}
                            alt={scene.title}
                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : (
                        <Typography variant="h4" color="text.disabled">
                            {String(scene.scene_index + 1).padStart(2, "0")}
                        </Typography>
                    )}
                </Box>
                <CardContent sx={{ py: 1.25 }}>
                    <Stack spacing={0.5}>
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: isReady ? "success.main" : "text.disabled",
                            }}
                        />
                        <Typography variant="body2" fontWeight={600}>
                            {scene.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {scene.objective}
                        </Typography>
                    </Stack>
                </CardContent>
        </Card>
    );
};
