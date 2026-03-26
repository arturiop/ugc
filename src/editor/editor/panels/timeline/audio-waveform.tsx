import { useEffect, useRef, useState } from "react";

interface AudioWaveformProps {
	audioUrl?: string;
	audioBuffer?: AudioBuffer;
	height?: number;
	className?: string;
}

function extractPeaks({
	buffer,
	length = 512,
}: {
	buffer: AudioBuffer;
	length?: number;
}): number[][] {
	const channels = buffer.numberOfChannels;
	const peaks: number[][] = [];

	for (let c = 0; c < channels; c++) {
		const data = buffer.getChannelData(c);
		const step = Math.floor(data.length / length);
		const channelPeaks: number[] = [];

		for (let i = 0; i < length; i++) {
			const start = i * step;
			const end = Math.min(start + step, data.length);
			let max = 0;
			for (let j = start; j < end; j++) {
				const abs = Math.abs(data[j]);
				if (abs > max) max = abs;
			}
			channelPeaks.push(max);
		}
		peaks.push(channelPeaks);
	}

	return peaks;
}

export function AudioWaveform({
	audioUrl,
	audioBuffer,
	height = 32,
	className = "",
}: AudioWaveformProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isLoading, setIsLoading] = useState(Boolean(audioUrl && !audioBuffer));
	const [error, setError] = useState(false);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const context = canvas.getContext("2d");
		if (!context) {
			setError(true);
			setIsLoading(false);
			return;
		}

		const width = canvas.clientWidth || 512;
		canvas.width = width;
		canvas.height = height;

		context.clearRect(0, 0, width, height);

		if (!audioBuffer) {
			setIsLoading(Boolean(audioUrl));
			setError(false);
			return;
		}

		const peaks = extractPeaks({ buffer: audioBuffer, length: Math.max(64, Math.floor(width / 3)) });
		const channelPeaks = peaks[0] ?? [];
		const barWidth = Math.max(1, width / Math.max(channelPeaks.length, 1));
		const midY = height / 2;

		context.fillStyle = "rgba(255, 255, 255, 0.75)";

		channelPeaks.forEach((peak, index) => {
			const barHeight = Math.max(1, peak * height);
			const x = index * barWidth;
			context.fillRect(x, midY - barHeight / 2, Math.max(1, barWidth - 1), barHeight);
		});

		setIsLoading(false);
		setError(false);
	}, [audioUrl, audioBuffer, height]);

	if (error) {
		return (
			<div
				className={`flex items-center justify-center ${className}`}
				style={{ height }}
			>
				<span className="text-foreground/60 text-xs">Audio unavailable</span>
			</div>
		);
	}

	return (
		<div className={`relative ${className}`}>
			{isLoading && (
				<div className="absolute inset-0 flex items-center justify-center">
					<span className="text-foreground/60 text-xs">Loading...</span>
				</div>
			)}
			<canvas
				ref={canvasRef}
				className={`w-full ${isLoading ? "opacity-0" : "opacity-100"}`}
				style={{ height }}
			/>
		</div>
	);
}

export default AudioWaveform;
