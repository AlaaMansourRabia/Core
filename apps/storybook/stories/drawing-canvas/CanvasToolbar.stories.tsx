import type {DrawingToolId, LineKind, PinKind, ShapeKind} from "@corensystem/coren-ui/drawing-actions";
import type {Meta, StoryObj} from "storybook/internal/types";

import {CanvasToolbar, type CanvasToolbarBlueprint} from "@corensystem/coren-ui/canvas-toolbar";
import {useState} from "react";

const meta = {
	title: "Widgets/Canvas/Canvas Toolbar",
	component: CanvasToolbar,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Three-section canvas toolbar: Blueprint Selector (Select or searchable Combobox) on the left, `DrawingActions` in the middle, and `ZoomTools` on the right. Optional pager appears when `pageCount > 1`. Pass `null` for `drawingActions` or `zoomTools` to hide a section.",
			},
		},
	},
} satisfies Meta<typeof CanvasToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleBlueprints: CanvasToolbarBlueprint[] = [
	{id: "ground", name: "Retail_1__Ground_Floor.svg"},
	{id: "mezzanine", name: "Retail_1__Mezzanine.svg"},
	{id: "roof", name: "Retail_1__Roof.svg"},
];

const longBlueprintList: CanvasToolbarBlueprint[] = [
	{id: "ground", name: "Retail_1__Ground_Floor.svg"},
	{id: "mezzanine", name: "Retail_1__Mezzanine.svg"},
	{id: "l1", name: "Office_Tower__L1.svg"},
	{id: "l2", name: "Office_Tower__L2.svg"},
	{id: "l3", name: "Office_Tower__L3.svg"},
	{id: "l4", name: "Office_Tower__L4.svg"},
	{id: "l5", name: "Office_Tower__L5.svg"},
	{id: "l6", name: "Office_Tower__L6.svg"},
	{id: "l7", name: "Office_Tower__L7.svg"},
	{id: "l8", name: "Office_Tower__L8.svg"},
	{id: "roof", name: "Office_Tower__Roof.svg"},
];

function Demo({
	searchable,
	withPager,
	list,
}: {
	searchable?: boolean;
	withPager?: boolean;
	list?: CanvasToolbarBlueprint[];
}) {
	const blueprints = list ?? sampleBlueprints;
	const [activeId, setActiveId] = useState(blueprints[0].id);
	const [page, setPage] = useState(1);
	const [activeTool, setActiveTool] = useState<DrawingToolId>("select");
	const [shapeKind, setShapeKind] = useState<ShapeKind>("rectangle");
	const [lineKind, setLineKind] = useState<LineKind>("line");
	const [pinKind, setPinKind] = useState<PinKind>("pin");
	const [zoomLevel, setZoomLevel] = useState(1);

	return (
		<CanvasToolbar
			blueprints={blueprints}
			activeBlueprintId={activeId}
			onBlueprintChange={setActiveId}
			searchableBlueprints={searchable}
			pageIndex={withPager ? page : undefined}
			pageCount={withPager ? 3 : undefined}
			onPageChange={setPage}
			drawingActions={{
				activeTool,
				onActiveToolChange: setActiveTool,
				shapeKind,
				onShapeKindChange: setShapeKind,
				lineKind,
				onLineKindChange: setLineKind,
				pinKind,
				onPinKindChange: setPinKind,
			}}
			zoomTools={{
				zoomLevel,
				minZoom: 0.25,
				maxZoom: 4,
				onZoomIn: () => setZoomLevel((z) => Math.min(4, z + 0.25)),
				onZoomOut: () => setZoomLevel((z) => Math.max(0.25, z - 0.25)),
				onFit: () => setZoomLevel(1),
			}}
		/>
	);
}

export const Default: Story = {
	render: () => <Demo />,
};

export const WithPager: Story = {
	render: () => <Demo withPager />,
	parameters: {
		docs: {
			description: {
				story: "Pager appears next to the picker when `pageCount > 1`.",
			},
		},
	},
};

export const Searchable: Story = {
	render: () => <Demo searchable list={longBlueprintList} />,
	parameters: {
		docs: {
			description: {
				story: "Use `searchableBlueprints` once the blueprint count exceeds ~10.",
			},
		},
	},
};

export const SelectorOnly: Story = {
	render: () => {
		function SoloDemo() {
			const [activeId, setActiveId] = useState(sampleBlueprints[0].id);
			return (
				<CanvasToolbar
					blueprints={sampleBlueprints}
					activeBlueprintId={activeId}
					onBlueprintChange={setActiveId}
					drawingActions={null}
					zoomTools={null}
				/>
			);
		}
		return <SoloDemo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					"Pass `drawingActions={null}` and `zoomTools={null}` to render only the blueprint picker — useful for read-only viewers.",
			},
		},
	},
};
