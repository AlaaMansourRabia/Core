import type {Meta, StoryObj} from "storybook/internal/types";

import {Minimap} from "@core/core-ui/minimap";
import {type PointerEvent, useRef, useState} from "react";

const meta = {
	title: "Components/Data Display/Minimap",
	component: Minimap,
	tags: ["autodocs"],
	argTypes: {
		size: {control: "select", options: ["sm", "md", "lg"]},
		heading: {control: {type: "range", min: 0, max: 360, step: 1}},
		lon: {control: {type: "number"}},
		lat: {control: {type: "number"}},
		label: {control: "text"},
	},
	args: {
		lon: 46.6753,
		lat: 24.7136,
		heading: 0,
		label: "Site",
		size: "md",
	},
	parameters: {
		docs: {
			description: {
				component:
					"A compact satellite minimap centred on a site. The imagery counter-rotates to the viewer `heading` while a fixed view-cone and centre pin stay upright. Falls back to an ArcGIS World Imagery tile unless a `src` is supplied.",
			},
		},
	},
} satisfies Meta<typeof Minimap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Rotated: Story = {args: {heading: 60}};

function MinimapOrbitDemo() {
	const [heading, setHeading] = useState(35);
	const drag = useRef<{x: number; h: number} | null>(null);

	const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
		drag.current = {x: event.clientX, h: heading};
		event.currentTarget.setPointerCapture(event.pointerId);
	};
	const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
		if (!drag.current) return;
		const dx = event.clientX - drag.current.x;
		setHeading((((drag.current.h + dx) % 360) + 360) % 360);
	};
	const endDrag = () => {
		drag.current = null;
	};

	return (
		<div className="wwc:flex wwc:w-[640px] wwc:flex-col wwc:gap-3">
			<div
				className="wwc:relative wwc:h-[420px] wwc:w-full wwc:cursor-grab wwc:touch-none wwc:overflow-hidden wwc:rounded-xl wwc:border wwc:border-border wwc:bg-gradient-to-b wwc:from-muted/40 wwc:to-muted wwc:active:cursor-grabbing"
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={endDrag}
				onPointerCancel={endDrag}
				style={{perspective: "900px"}}
			>
				{/* A stacked-plate "building" that orbits with the heading. */}
				<div
					className="wwc:absolute wwc:left-1/2 wwc:top-1/2"
					style={{
						// Rotate the world the same direction the minimap does (it counter-rotates the map by
						// `-heading`), so the model and the minimap imagery spin together as the heading changes.
						transform: `translate(-50%, -50%) rotateX(58deg) rotateZ(${-heading}deg)`,
						transformStyle: "preserve-3d",
					}}
				>
					{[0, 1, 2, 3, 4].map((level) => (
						<div
							key={level}
							className="wwc:absolute wwc:left-1/2 wwc:top-1/2 wwc:size-40 wwc:-translate-x-1/2 wwc:-translate-y-1/2 wwc:rounded-md wwc:border wwc:border-border wwc:bg-card/90 wwc:shadow-sm"
							style={{transform: `translateZ(${level * 26}px)`}}
						/>
					))}
					{/* Front-face marker so the model's facing direction is obvious as it spins. */}
					<div
						className="wwc:absolute wwc:left-1/2 wwc:top-1/2 wwc:h-2.5 wwc:w-20 wwc:-translate-x-1/2 wwc:-translate-y-[240%] wwc:rounded wwc:bg-primary"
						style={{transform: "translateZ(130px)"}}
					/>
				</div>

				{/* The minimap tracks the same heading, in the corner of the viewer. */}
				<div className="wwc:absolute wwc:bottom-4 wwc:right-4">
					<Minimap lon={46.6753} lat={24.7136} heading={heading} label="Site" />
				</div>

				<div className="wwc:pointer-events-none wwc:absolute wwc:left-4 wwc:top-4 wwc:rounded wwc:bg-foreground/70 wwc:px-2 wwc:py-1 wwc:text-xs wwc:font-medium wwc:tabular-nums wwc:text-background">
					Heading {Math.round(heading)}°
				</div>
			</div>

			<label className="wwc:flex wwc:items-center wwc:gap-3 wwc:text-sm">
				<span className="wwc:shrink-0 wwc:text-muted-foreground">Orbit</span>
				<input
					type="range"
					min={0}
					max={360}
					value={heading}
					onChange={(event) => setHeading(Number(event.target.value))}
					aria-label="Orbit heading"
					className="wwc:flex-1"
				/>
				<span className="wwc:w-10 wwc:shrink-0 wwc:text-right wwc:tabular-nums wwc:text-muted-foreground">
					{Math.round(heading)}°
				</span>
			</label>
		</div>
	);
}

export const InAViewer: Story = {
	parameters: {
		controls: {disable: true},
		docs: {
			description: {
				story:
					"Framed against a building model in a viewer. Drag the model (or use the Orbit slider) to change the heading — the minimap's satellite layer counter-rotates while the centre pin and view-cone stay upright, always pointing where you're facing.",
			},
		},
	},
	render: () => <MinimapOrbitDemo />,
};

export const AllVariants: Story = {
	parameters: {controls: {disable: true}},
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:items-end wwc:gap-6">
			<Minimap lon={46.6753} lat={24.7136} size="sm" label="Small" />
			<Minimap lon={46.6753} lat={24.7136} size="md" label="Medium" />
			<Minimap lon={46.6753} lat={24.7136} size="lg" label="Large" heading={35} />
		</div>
	),
};
