import type {Meta, StoryObj} from "storybook/internal/types";

import {
	FileSystem,
	fsNodeFromDraft,
	type FileSystemFileType,
	type FileSystemNode,
} from "@corensystem/coren-ui/file-system";
import {Box, FileText, Share2, Table2, Workflow} from "lucide-react";
import {useState} from "react";

// A file system over records that live somewhere else. The story supplies its own nodes and its own
// file types, which is the point of the widget: it holds no fixture and knows no product.

const FILE_TYPES: FileSystemFileType[] = [
	{
		id: "pipeline",
		label: "Pipeline",
		icon: Share2,
		tone: "wwc:bg-blue-500/10 wwc:text-blue-700 wwc:dark:text-blue-400",
		app: "Pipelines",
	},
	{
		id: "process",
		label: "Process",
		icon: Workflow,
		tone: "wwc:bg-violet-500/10 wwc:text-violet-700 wwc:dark:text-violet-400",
		app: "Processes",
	},
	{
		id: "object-type",
		label: "Object type",
		icon: Box,
		tone: "wwc:bg-emerald-500/10 wwc:text-emerald-700 wwc:dark:text-emerald-400",
		app: "Ontology",
	},
	{
		id: "dataset",
		label: "Dataset",
		icon: Table2,
		tone: "wwc:bg-teal-500/10 wwc:text-teal-700 wwc:dark:text-teal-400",
	},
	{id: "doc", label: "Document", icon: FileText},
];

const NODES: FileSystemNode[] = [
	{id: "root", name: "Northwind Energy", kind: "root", parentId: null, updatedAt: "Today", updatedTs: 900},

	{
		id: "p1",
		name: "Bergen Substation",
		kind: "project",
		parentId: "root",
		updatedAt: "Tue, Sep 8, 2026, 9:14 AM",
		updatedTs: 890,
		description: "Grid connection works. Intake pipelines and the asset ontology live here.",
		tags: ["grid", "norway"],
	},
	{id: "f1", name: "Intake", kind: "folder", parentId: "p1", updatedAt: "Sep 8", updatedTs: 889},
	{
		id: "n1",
		name: "SCADA intake — tags → readings",
		kind: "file",
		parentId: "f1",
		updatedAt: "Tue, Sep 8, 2026, 9:14 AM",
		updatedTs: 888,
		fileType: "pipeline",
		ref: {recordId: "pipe_scada"},
		tags: ["scada"],
	},
	{
		id: "n2",
		name: "Meter reconciliation",
		kind: "file",
		parentId: "f1",
		updatedAt: "Mon, Sep 7, 2026, 4:02 PM",
		updatedTs: 870,
		fileType: "pipeline",
		ref: {recordId: "pipe_meter"},
	},
	{id: "f2", name: "Assets", kind: "folder", parentId: "p1", updatedAt: "Sep 7", updatedTs: 865},
	{
		id: "n3",
		name: "Transformer",
		kind: "file",
		parentId: "f2",
		updatedAt: "Mon, Sep 7, 2026, 11:31 AM",
		updatedTs: 864,
		fileType: "object-type",
		ref: {recordId: "ot_transformer"},
	},
	{
		id: "n4",
		name: "Commissioning notes",
		kind: "file",
		parentId: "f2",
		updatedAt: "Fri, Sep 4, 2026, 1:20 PM",
		updatedTs: 840,
		fileType: "doc",
	},

	{
		id: "p2",
		name: "Stavanger Interconnect",
		kind: "project",
		parentId: "root",
		updatedAt: "Mon, Sep 7, 2026, 2:45 PM",
		updatedTs: 868,
		description: "Subsea interconnect. Outage planning and its supporting datasets.",
		tags: ["subsea"],
	},
	{id: "f3", name: "Outages", kind: "folder", parentId: "p2", updatedAt: "Sep 7", updatedTs: 867},
	{
		id: "n5",
		name: "Outage approval",
		kind: "file",
		parentId: "f3",
		updatedAt: "Mon, Sep 7, 2026, 2:45 PM",
		updatedTs: 866,
		fileType: "process",
		ref: {recordId: "proc_outage"},
		tags: ["planning"],
	},
	{
		id: "n6",
		name: "Load forecast",
		kind: "file",
		parentId: "f3",
		updatedAt: "Sun, Sep 6, 2026, 8:15 AM",
		updatedTs: 855,
		fileType: "dataset",
	},
	{
		id: "n7",
		name: "Retired cable survey",
		kind: "file",
		parentId: "f3",
		updatedAt: "Thu, Aug 27, 2026, 10:00 AM",
		updatedTs: 770,
		fileType: "doc",
		trashed: true,
	},
];

function FileSystemDemo() {
	// The widget owns no data: the host holds the nodes and appends on create.
	const [nodes, setNodes] = useState(NODES);
	const [opened, setOpened] = useState<string | null>(null);

	return (
		<div className="wwc:flex wwc:h-screen wwc:w-full wwc:flex-col">
			{opened && (
				<div className="wwc:flex-shrink-0 wwc:border-b wwc:border-border wwc:bg-muted wwc:px-4 wwc:py-2 wwc:text-[13px]">
					A host would navigate here: <span className="wwc:font-medium">{opened}</span>
				</div>
			)}
			<FileSystem
				nodes={nodes}
				rootId="root"
				fileTypes={FILE_TYPES}
				searchPlaceholder="Search Northwind Energy..."
				openLabel={(node) => (node.ref ? "Open in Pipelines" : undefined)}
				onOpenFile={(node) => setOpened(node.name)}
				onCreate={(draft) => {
					const node = fsNodeFromDraft(draft, `new-${nodes.length}`);
					setNodes((prev) => [...prev, node]);
					return node;
				}}
			/>
		</div>
	);
}

const meta = {
	title: "Widgets/File System",
	component: FileSystem,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"A file system over records that live somewhere else. Nodes are a flat array with `parentId`, " +
					"each file carrying an opaque `ref` the host reads back; file types — their labels, marks and " +
					"tints — are declared by the host, so the widget knows no product's vocabulary. Two layouts: a " +
					"flat listing with type / project / tag facets, and a project's own page with folders you can " +
					"open. A row selects into the details panel and never navigates; the underlined name is the only " +
					"thing that leaves. It owns no data — creation goes back out through `onCreate`, so the host " +
					"keeps nodes wherever the rest of its state lives.",
			},
		},
	},
} satisfies Meta<typeof FileSystem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => <FileSystemDemo />,
};
