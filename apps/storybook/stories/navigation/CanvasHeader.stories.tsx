import type {Meta, StoryObj} from "storybook/internal/types";

import {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@corensystem/core-ui/breadcrumb";
import {Button} from "@corensystem/core-ui/button";
import {CanvasHeader} from "@corensystem/core-ui/canvas-header";
import {type WeekSelectorWeek} from "@corensystem/core-ui/week-selector";
import {Maximize2} from "lucide-react";
import {useState} from "react";

const WEEKS: WeekSelectorWeek[] = [
	{value: "W109", start: new Date(2026, 5, 12), end: new Date(2026, 5, 18)},
	{value: "W110", start: new Date(2026, 5, 19), end: new Date(2026, 5, 25)},
	{value: "W111", start: new Date(2026, 5, 26), end: new Date(2026, 6, 2)},
	{value: "W112", start: new Date(2026, 6, 3), end: new Date(2026, 6, 9)},
	{value: "W113", start: new Date(2026, 6, 10), end: new Date(2026, 6, 16)},
	{value: "W114", start: new Date(2026, 6, 17), end: new Date(2026, 6, 23)},
	{value: "W115", start: new Date(2026, 6, 24), end: new Date(2026, 6, 30)},
];

function Crumbs() {
	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="#">Riverside Compound</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbEllipsis items={[{label: "Zone A — Waterfront"}]} />
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbLink href="#">HOUSE-A01</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>Ground Floor</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
}

function FullScreenButton() {
	return (
		<Button type="button" variant="outline" icon size="sm" aria-label="Full screen">
			<Maximize2 className="wwc:h-4 wwc:w-4" />
		</Button>
	);
}

const meta = {
	title: "Widgets/Navigation/Canvas Header",
	component: CanvasHeader,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"The canvas-level header bar: a bordered `min-h-12` row with a `left` cluster (breadcrumb — takes the free width, stays on one line, and truncates its trailing crumb when tight), an optional centered cluster, and a `right` cluster (an optional built-in `weekSelector` + your actions). It heads a single workspace canvas — distinct from the platform `CoreAppTopBar` — and pairs with `ViewTabBar` (view switching) and `CanvasToolbar` (on-canvas tools).",
			},
		},
	},
} satisfies Meta<typeof CanvasHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => <CanvasHeader left={<Crumbs />} right={<FullScreenButton />} />,
};

export const WithWeekSelector: Story = {
	render: () => {
		function Demo() {
			const [week, setWeek] = useState("W112");
			return (
				<CanvasHeader
					left={<Crumbs />}
					weekSelector={{weeks: WEEKS, value: week, onValueChange: setWeek, visibleCount: 4}}
					right={<FullScreenButton />}
				/>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					"Pass `weekSelector` (the WeekSelector's props) to dock a period selector at the start of the right cluster — rendered `bare` so it sits flush in the bar, before your `right` actions.",
			},
		},
	},
};
