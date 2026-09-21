import {cn} from "@wakecap/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import {Maximize2, Pause, Play} from "lucide-react";
import * as React from "react";

import {Button} from "./button";

const DEFAULT_SRC = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";

const walkthroughTileVariants = cva("wwc:group wwc:relative wwc:overflow-hidden wwc:rounded wwc:bg-foreground", {
	variants: {
		aspect: {
			video: "wwc:aspect-video",
			square: "wwc:aspect-square",
			portrait: "wwc:aspect-[3/4]",
		},
	},
	defaultVariants: {
		aspect: "video",
	},
});

export interface WalkthroughTileProps
	extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof walkthroughTileVariants> {
	/** Source URL of the walkthrough clip. */
	src?: string;
	/** Playback rate for slow inspection. Defaults to `0.5`. */
	playbackRate?: number;
}

/** An autoplaying muted walkthrough clip with hover-revealed play/pause and a fullscreen control. */
const WalkthroughTile = React.forwardRef<HTMLDivElement, WalkthroughTileProps>(
	({className, aspect, src = DEFAULT_SRC, playbackRate = 0.5, ...props}, ref) => {
		const containerRef = React.useRef<HTMLDivElement>(null);
		const videoRef = React.useRef<HTMLVideoElement>(null);
		const [playing, setPlaying] = React.useState(false);

		React.useImperativeHandle(ref, () => containerRef.current!);

		const togglePlay = () => {
			const video = videoRef.current;
			if (!video) return;
			if (video.paused) void video.play();
			else video.pause();
		};

		return (
			<div ref={containerRef} className={cn(walkthroughTileVariants({aspect}), className)} {...props}>
				{/* oxlint-disable-next-line jsx-a11y/media-has-caption -- walkthrough clip has no captions. */}
				<video
					ref={videoRef}
					src={src}
					autoPlay
					loop
					muted
					playsInline
					className="wwc:h-full wwc:w-full wwc:object-cover"
					onPlay={() => setPlaying(true)}
					onPause={() => setPlaying(false)}
					onLoadedMetadata={(event) => {
						const video = event.currentTarget;
						video.defaultPlaybackRate = playbackRate;
						video.playbackRate = playbackRate;
					}}
				/>

				{/* Play / pause — centred, revealed only on hover (or keyboard focus). */}
				<Button
					variant="ghost"
					size="sm"
					icon
					onClick={togglePlay}
					aria-label={playing ? "Pause walkthrough" : "Play walkthrough"}
					className="wwc:pointer-events-none wwc:absolute wwc:left-1/2 wwc:top-1/2 wwc:size-9 wwc:-translate-x-1/2 wwc:-translate-y-1/2 wwc:rounded-full wwc:bg-foreground/55 wwc:text-background wwc:opacity-0 wwc:backdrop-blur wwc:transition-opacity wwc:hover:bg-foreground/70 wwc:hover:text-background wwc:group-hover:pointer-events-auto wwc:group-hover:opacity-100 wwc:focus-visible:pointer-events-auto wwc:focus-visible:opacity-100"
				>
					{playing ? <Pause className="wwc:size-4" /> : <Play className="wwc:size-4" />}
				</Button>

				<Button
					variant="ghost"
					size="sm"
					icon
					onClick={() => void containerRef.current?.requestFullscreen?.()}
					aria-label="View capture fullscreen"
					className="wwc:absolute wwc:bottom-1.5 wwc:right-1.5 wwc:size-6 wwc:rounded wwc:bg-foreground/50 wwc:text-background wwc:backdrop-blur wwc:transition-colors wwc:hover:bg-foreground/70 wwc:hover:text-background"
				>
					<Maximize2 className="wwc:size-3.5" />
				</Button>
			</div>
		);
	},
);
WalkthroughTile.displayName = "WalkthroughTile";

export {WalkthroughTile, walkthroughTileVariants};
