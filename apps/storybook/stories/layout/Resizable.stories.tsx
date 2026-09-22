import type {Meta, StoryObj} from "storybook/internal/types";

import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@corensystem/core-ui/resizable";

const meta = {
	title: "Components/Layout/Resizable",
	component: ResizablePanelGroup,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Resizable panel groups for building split-pane layouts. Built on react-resizable-panels. Exports ResizablePanelGroup, ResizablePanel, and ResizableHandle. The handle supports an optional withHandle prop for a visible drag grip.",
			},
		},
	},
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<ResizablePanelGroup direction="horizontal" className="wwc:min-h-[200px] wwc:max-w-md wwc:rounded-lg wwc:border">
			<ResizablePanel defaultSize={50}>
				<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6">
					<span className="wwc:font-semibold">Panel A</span>
				</div>
			</ResizablePanel>
			<ResizableHandle />
			<ResizablePanel defaultSize={50}>
				<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6">
					<span className="wwc:font-semibold">Panel B</span>
				</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	),
};

export const WithHandle: Story = {
	render: () => (
		<ResizablePanelGroup direction="horizontal" className="wwc:min-h-[200px] wwc:max-w-md wwc:rounded-lg wwc:border">
			<ResizablePanel defaultSize={50}>
				<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6">
					<span className="wwc:font-semibold">Panel A</span>
				</div>
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={50}>
				<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6">
					<span className="wwc:font-semibold">Panel B</span>
				</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	),
};

export const Vertical: Story = {
	render: () => (
		<ResizablePanelGroup direction="vertical" className="wwc:min-h-[300px] wwc:max-w-md wwc:rounded-lg wwc:border">
			<ResizablePanel defaultSize={40}>
				<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6">
					<span className="wwc:font-semibold">Top</span>
				</div>
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={60}>
				<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6">
					<span className="wwc:font-semibold">Bottom</span>
				</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	),
};

export const ThreePanels: Story = {
	render: () => (
		<ResizablePanelGroup direction="horizontal" className="wwc:min-h-[200px] wwc:max-w-lg wwc:rounded-lg wwc:border">
			<ResizablePanel defaultSize={25} minSize={15}>
				<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6">
					<span className="wwc:font-semibold">Sidebar</span>
				</div>
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={50}>
				<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6">
					<span className="wwc:font-semibold">Content</span>
				</div>
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={25} minSize={15}>
				<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6">
					<span className="wwc:font-semibold">Inspector</span>
				</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	),
};

export const NestedLayout: Story = {
	render: () => (
		<ResizablePanelGroup direction="horizontal" className="wwc:min-h-[300px] wwc:max-w-lg wwc:rounded-lg wwc:border">
			<ResizablePanel defaultSize={30} minSize={20}>
				<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6">
					<span className="wwc:font-semibold">Sidebar</span>
				</div>
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={70}>
				<ResizablePanelGroup direction="vertical">
					<ResizablePanel defaultSize={60}>
						<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6">
							<span className="wwc:font-semibold">Main Content</span>
						</div>
					</ResizablePanel>
					<ResizableHandle withHandle />
					<ResizablePanel defaultSize={40}>
						<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6">
							<span className="wwc:font-semibold">Terminal</span>
						</div>
					</ResizablePanel>
				</ResizablePanelGroup>
			</ResizablePanel>
		</ResizablePanelGroup>
	),
};
