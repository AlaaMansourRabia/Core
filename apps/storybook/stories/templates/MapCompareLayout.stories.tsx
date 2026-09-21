import type {Meta, StoryObj} from "storybook/internal/types";

import {MapCompareLayout} from "@core/core-ui/pages/core-map-compare-layout";

import manifest from "../../../../manifests/map-compare-layout.template.json";
import {TemplateDocsPage} from "../_docs/TemplateDocsPage";

// The map-compare workspace renders from deterministic SVG MapScenes (no live Mapbox tiles), so the
// real page component is safe to render directly in Chromatic. The Default story is the live preview;
// the docs page shows the template manifest contract.
const meta = {
	title: "Templates/Map Compare Layout",
	component: MapCompareLayout,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			page: () => (
				<TemplateDocsPage
					manifest={manifest}
					family={
						<>
							Canonical: <code>core-map-compare-layout</code> (composes the <strong>MapCompareLayout</strong> widget +{" "}
							<strong>TimestampPicker</strong>, with an optional <strong>TimelineRangeSelector</strong>). No
							variants/instances.
						</>
					}
				/>
			),
			description: {
				component:
					"A side-by-side map comparison workspace: two geo-aligned scenes (as-planned / as-built) in one pannable, zoomable compare surface with a floating toolbar, an overview minimap, a per-view **TimestampPicker** to scrub each capture, an optional session **TimelineRangeSelector**, and a fullscreen toggle. Canonical: `core-map-compare-layout`.",
			},
		},
	},
} satisfies Meta<typeof MapCompareLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = ({children}: {children: React.ReactNode}) => <div className="wwc:h-screen">{children}</div>;

export const Preview: Story = {
	render: () => (
		<Frame>
			<MapCompareLayout />
		</Frame>
	),
};

export const WithSessionTimeline: Story = {
	render: () => (
		<Frame>
			<MapCompareLayout withSessionTimeline />
		</Frame>
	),
};
