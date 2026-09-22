import type {Meta, StoryObj} from "storybook/internal/types";
import {useState} from "react";

import {Lightbox} from "@core/core-ui/lightbox";
import {Button} from "@core/core-ui/button";

const meta = {
	title: "Components/Primitives/Lightbox",
	component: Lightbox,
	tags: ["autodocs"],
} satisfies Meta<typeof meta>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleImages = [
	{
		src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
		alt: "Mountain landscape",
		caption: "Beautiful mountain landscape",
	},
	{
		src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200",
		alt: "Forest scene",
		caption: "Peaceful forest scene",
	},
	{
		src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200",
		alt: "Lake view",
		caption: "Serene lake view",
	},
];

export const SingleImage: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<>
				<Button onClick={() => setOpen(true)}>View Image</Button>
				<Lightbox open={open} onClose={() => setOpen(false)} images={[sampleImages[0]]} />
			</>
		);
	},
};

export const MultipleImages: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<>
				<Button onClick={() => setOpen(true)}>View Gallery</Button>
				<Lightbox open={open} onClose={() => setOpen(false)} images={sampleImages} />
			</>
		);
	},
};

export const NoZoom: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<>
				<Button onClick={() => setOpen(true)}>View (No Zoom)</Button>
				<Lightbox open={open} onClose={() => setOpen(false)} images={sampleImages} showZoom={false} />
			</>
		);
	},
};

export const StartAtIndex: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<>
				<Button onClick={() => setOpen(true)}>View (Start at 2nd Image)</Button>
				<Lightbox open={open} onClose={() => setOpen(false)} images={sampleImages} currentIndex={1} />
			</>
		);
	},
};
