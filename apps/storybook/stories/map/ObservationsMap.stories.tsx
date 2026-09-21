import type {Meta, StoryObj} from "storybook/internal/types";

import {RNGLF_ZONES} from "@wakecap/core-ui/data/rnglf-zones";
import {ObservationsMap} from "@wakecap/core-ui/observations-map";
import {ObservationsMapView} from "@wakecap/core-ui/pages/core-observations-map-view";

const meta = {
	title: "Widgets/Map/Observations Map",
	component: ObservationsMap,
	tags: ["autodocs"],
	parameters: {
		// The map is a canvas surface — it should own the viewport, not sit inside the default padding.
		layout: "fullscreen",
		docs: {
			// Fullscreen stories are h-dvh; embedded in the docs page that would be a full viewport per
			// example. Render them in a sized iframe there instead, and let the standalone tab go full height.
			story: {inline: false, height: "560px"},
			description: {
				component:
					"Mapbox map with a georeferenced blueprint draped over the basemap and observations pinned on top. The blueprint is anchored by its four corners — [top-left, top-right, bottom-right, bottom-left] — so it stays locked to the ground while panning and zooming. Until a blueprint image is supplied the widget draws the footprint outline so the corner placement stays verifiable. Pass `fullHeight` to fill a height-constrained parent instead of the default 500px, and `timeline` to float a `TimeScrubber` — the same one the Workforce Map View uses — along the bottom edge.",
			},
		},
		chromatic: {disableSnapshot: true},
	},
} satisfies Meta<typeof ObservationsMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	name: "With Timeline",
	// The scene lives in the package as ObservationsMapView, so this story and the Safety Manager's
	// Map View show the same map rather than two copies of one demo.
	render: () => (
		<div className="wwc:h-dvh">
			<ObservationsMapView />
		</div>
	),
};

export const WithoutObservations: Story = {
	name: "Blueprint Only",
	render: () => (
		<div className="wwc:h-dvh">
			<ObservationsMap fullHeight className="wwc:rounded-none" />
		</div>
	),
};

export const Zones: Story = {
	name: "Zones",
	render: () => (
		<div className="wwc:h-dvh">
			<ObservationsMap
				fullHeight
				className="wwc:rounded-none"
				zones={RNGLF_ZONES}
				zoneOpacity={0.45}
				fitTo="zones"
				zoneColorMode="neutral"
			/>
		</div>
	),
};
