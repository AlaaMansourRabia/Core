import type {Meta, StoryObj} from "@storybook/react-vite";

import {fn, userEvent} from "storybook/test";

import {SiteBlockView} from "./SiteBlockView";

// No Assets View — No Assets: the flattest site representation. It borrows the Site Image Viewer's
// design-system chrome (the floating progress card, the SPA/Construction `TabbedLegend` mode switch, and
// the SHA-1036 milestone ramp) but drops the aerial image and 3D entirely. Each villa is a
// progress-tinted block, and the blocks are organised into neighbourhood blocks on a flat board.
// Hovering a villa raises its block and pops the progress card. Sibling: "Has Drone Image" (the same
// villas as massing blocks over the satellite ortho, in the ThatOpen model).
const meta = {
	title: "Templates/Building Viewer/Site Viewer/No Assets View/No Assets",
	component: SiteBlockView,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		// Live hover interaction, not a deterministic snapshot target.
		chromatic: {disableSnapshot: true},
		docs: {
			description: {
				component:
					"The lightest site representation: no aerial image, no 3D model — each villa is a progress-tinted " +
					"block, grouped into neighbourhood blocks on a flat board. It reuses the Site Image Viewer's chrome " +
					"(the DS `ProgressComparison` hover card and the `TabbedLegend` SPA ↔ Construction mode switch keyed " +
					"to the milestone ramp), so a block colours by its villa's approved % (SPA) or its ±plan variance " +
					"(Construction). Hover a block to raise it and pop the progress card; the same real ROSHN Almanar " +
					"villas as the other Site Viewer variants.",
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="wwc:relative wwc:h-screen wwc:w-full">
				<Story />
			</div>
		),
	],
	argTypes: {
		mapMode: {control: "inline-radio", options: ["progress", "variance"]},
	},
	args: {
		mapMode: "progress",
		onNavigate: fn(),
	},
} satisfies Meta<typeof SiteBlockView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** SPA / progress mode: villa blocks coloured by approved % across the M35–M100 ramp. */
export const ProgressMode: Story = {};

/** Construction / variance mode: blocks coloured behind / on-track / ahead of plan (±2.5%). */
export const VarianceMode: Story = {
	args: {mapMode: "variance"},
};

/**
 * A villa preselected as hovered so the raised block + floating progress card are visible without moving
 * the mouse; the play step also hovers it live so the card positions next to the block.
 */
export const SingleVillaHovered: Story = {
	args: {initialHoveredId: 3029},
	play: async ({canvasElement}) => {
		const villa = canvasElement.querySelector<HTMLButtonElement>('[data-villa-id="3029"]');
		if (villa) await userEvent.hover(villa);
	},
};
