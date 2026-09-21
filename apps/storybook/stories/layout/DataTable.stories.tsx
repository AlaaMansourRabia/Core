import type {ColumnDef, Row, SortingState} from "@tanstack/react-table";
import type {Meta, StoryObj} from "storybook/internal/types";

import {Controls, Description, Primary, Stories, Subtitle, Title} from "@storybook/addon-docs/blocks";
import {Badge} from "@wakecap/core-ui/badge";
import {Button} from "@wakecap/core-ui/button";
import {Checkbox} from "@wakecap/core-ui/checkbox";
import {
	DataTable,
	DataTableColumnHeader,
	DataTableDetailPanel,
	DataTableExpandButton,
	DataTableTreeCell,
	type BulkAction,
} from "@wakecap/core-ui/data-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@wakecap/core-ui/dropdown-menu";
import {
	Filter,
	FilterCategory,
	FilterContent,
	FilterOption,
	FilterTrigger,
	type FilterValue,
} from "@wakecap/core-ui/filter";
import {Separator} from "@wakecap/core-ui/separator";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@wakecap/core-ui/table";
import {cn} from "@wakecap/core-utils";
import {Copy, Download, Edit, FileCode, FileImage, FileText, Folder, MoreHorizontal, Trash2} from "lucide-react";
import * as React from "react";

import dataTableManifest from "../../../../manifests/data-table.widget.json";
import {ComponentKnowledge} from "../_docs/ComponentKnowledge";
import {WidgetManifestPanel} from "../_docs/WidgetManifestPanel";

// Custom autodocs page for the first WIDGET: standard blocks + the Catalog knowledge panel (decision
// knowledge from library-index.json) + the Widget contract panel (build knowledge from the manifest).
// Overrides the global docs page (which has no manifest panel) for this page only.
function DataTableDocsPage() {
	return (
		<>
			<Title />
			<Subtitle />
			<Description />
			<ComponentKnowledge />
			<WidgetManifestPanel manifest={dataTableManifest} />
			<Primary />
			<Controls />
			<Stories />
		</>
	);
}

const meta = {
	// First promoted WIDGET (see docs/ARTIFACT-CLASSIFICATION.md + manifests/data-table.widget.json).
	// File and export are unchanged (@wakecap/core-ui/data-table); only the story title moved to Widgets/.
	title: "Widgets/Data/DataTable",
	component: DataTable,
	tags: ["autodocs"],
	argTypes: {
		searchKey: {control: "text", description: "Column key to filter by when search is enabled."},
		searchPlaceholder: {control: "text", description: "Placeholder text for the search input."},
		showColumnToggle: {control: "boolean", description: "Show column visibility toggle dropdown."},
		showPagination: {control: "boolean", description: "Show pagination controls."},
		showSelectedCount: {control: "boolean", description: "Show selected row count."},
		pageSize: {control: {type: "number", min: 5, max: 50, step: 5}, description: "Number of rows per page."},
		expandAllByDefault: {control: "boolean", description: "Expand all tree rows by default."},
	},
	parameters: {
		docs: {
			page: DataTableDocsPage,
			description: {
				component:
					"**DataTable is a widget, not a primitive.** Unlike `Table` (a presentational `<table>`), DataTable is a " +
					"composed product building block: it wraps the TanStack Table engine and five components (Table, Button, " +
					"Input, Popover, Collapsible) behind a **data contract** (`columns` + `data`) with sorting, filtering, " +
					"pagination, selection, column show/hide & reorder, and expandable/tree rows. **Use it** for >~10 rows or any " +
					"interactivity; **reach for `Table` instead** for a few static rows with a custom layout. The **Widget contract** " +
					"panel below is generated from its manifest — the same knowledge an agent or generator consumes.",
			},
		},
	},
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Payment data ---

type Payment = {
	id: string;
	amount: number;
	status: "pending" | "processing" | "success" | "failed";
	email: string;
};

const payments: Payment[] = [
	{id: "PAY-001", amount: 316.0, status: "success", email: "alice@example.com"},
	{id: "PAY-002", amount: 242.0, status: "success", email: "bob@example.com"},
	{id: "PAY-003", amount: 837.0, status: "processing", email: "charlie@example.com"},
	{id: "PAY-004", amount: 874.0, status: "failed", email: "diana@example.com"},
	{id: "PAY-005", amount: 721.0, status: "success", email: "eve@example.com"},
	{id: "PAY-006", amount: 150.0, status: "pending", email: "frank@example.com"},
	{id: "PAY-007", amount: 490.0, status: "success", email: "grace@example.com"},
	{id: "PAY-008", amount: 125.0, status: "failed", email: "heidi@example.com"},
];

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
	success: "default",
	processing: "secondary",
	pending: "outline",
	failed: "destructive",
};

const paymentColumns: ColumnDef<Payment>[] = [
	{
		id: "select",
		header: ({table}) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected()}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({row}) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
	},
	{
		accessorKey: "id",
		header: ({column}) => <DataTableColumnHeader column={column} title="ID" />,
	},
	{
		accessorKey: "email",
		header: ({column}) => <DataTableColumnHeader column={column} title="Email" />,
	},
	{
		accessorKey: "status",
		header: ({column}) => <DataTableColumnHeader column={column} title="Status" />,
		cell: ({row}) => {
			const status = row.getValue("status") as string;
			return <Badge variant={statusVariant[status]}>{status}</Badge>;
		},
	},
	{
		accessorKey: "amount",
		header: ({column}) => <DataTableColumnHeader column={column} title="Amount" />,
		cell: ({row}) => {
			const amount = Number.parseFloat(row.getValue("amount"));
			return new Intl.NumberFormat("en-US", {style: "currency", currency: "USD"}).format(amount);
		},
	},
];

export const Default: Story = {
	render: () => (
		<DataTable
			columns={paymentColumns}
			data={payments}
			searchKey="email"
			searchPlaceholder="Filter by email..."
			showColumnToggle
			showPagination
			showSelectedCount
			pageSize={5}
		/>
	),
};

// --- Expandable rows ---

type Order = {
	id: string;
	customer: string;
	date: string;
	total: number;
	status: string;
	items: {name: string; qty: number; price: number}[];
};

const orders: Order[] = [
	{
		id: "ORD-001",
		customer: "Alice Johnson",
		date: "2026-04-01",
		total: 245.0,
		status: "delivered",
		items: [
			{name: "Safety Helmet", qty: 5, price: 25.0},
			{name: "Hi-Vis Vest", qty: 10, price: 12.0},
		],
	},
	{
		id: "ORD-002",
		customer: "Bob Smith",
		date: "2026-04-05",
		total: 180.0,
		status: "shipped",
		items: [{name: "Sensor Tag", qty: 20, price: 9.0}],
	},
	{
		id: "ORD-003",
		customer: "Charlie Brown",
		date: "2026-04-10",
		total: 520.0,
		status: "processing",
		items: [
			{name: "Gateway Device", qty: 2, price: 200.0},
			{name: "Mounting Kit", qty: 4, price: 30.0},
		],
	},
];

const orderColumns: ColumnDef<Order>[] = [
	{accessorKey: "id", header: "Order ID"},
	{accessorKey: "customer", header: "Customer"},
	{accessorKey: "date", header: "Date"},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({row}) => {
			const status = row.getValue("status") as string;
			return <Badge variant={status === "delivered" ? "default" : "secondary"}>{status}</Badge>;
		},
	},
	{
		accessorKey: "total",
		header: "Total",
		cell: ({row}) => `$${(row.getValue("total") as number).toFixed(2)}`,
	},
];

export const Expandable: Story = {
	render: () => (
		<DataTable
			columns={orderColumns}
			data={orders}
			getRowCanExpand={() => true}
			renderSubComponent={({row}) => (
				<DataTableDetailPanel>
					<div className="wwc:space-y-2">
						<p className="wwc:text-sm wwc:font-medium">Order Items</p>
						<table className="wwc:w-full wwc:text-sm">
							<thead>
								<tr className="wwc:border-b">
									<th className="wwc:text-left wwc:py-1">Item</th>
									<th className="wwc:text-left wwc:py-1">Qty</th>
									<th className="wwc:text-left wwc:py-1">Price</th>
								</tr>
							</thead>
							<tbody>
								{row.original.items.map((item) => (
									<tr key={item.name} className="wwc:border-b wwc:last:border-0">
										<td className="wwc:py-1">{item.name}</td>
										<td className="wwc:py-1">{item.qty}</td>
										<td className="wwc:py-1">${item.price.toFixed(2)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</DataTableDetailPanel>
			)}
		/>
	),
};

// --- Tree rows ---

type FileNode = {
	id: string;
	name: string;
	type: "folder" | "file";
	size?: string;
	modified: string;
	subRows?: FileNode[];
};

const files: FileNode[] = [
	{
		id: "1",
		name: "src",
		type: "folder",
		modified: "2026-04-01",
		subRows: [
			{
				id: "1-1",
				name: "components",
				type: "folder",
				modified: "2026-04-01",
				subRows: [
					{id: "1-1-1", name: "Button.tsx", type: "file", size: "2.4 KB", modified: "2026-03-28"},
					{id: "1-1-2", name: "Input.tsx", type: "file", size: "1.8 KB", modified: "2026-03-30"},
				],
			},
			{id: "1-2", name: "utils.ts", type: "file", size: "0.9 KB", modified: "2026-03-25"},
		],
	},
	{
		id: "2",
		name: "package.json",
		type: "file",
		size: "1.2 KB",
		modified: "2026-04-10",
	},
	{
		id: "3",
		name: "README.md",
		type: "file",
		size: "3.1 KB",
		modified: "2026-04-08",
	},
];

const fileColumns: ColumnDef<FileNode>[] = [
	{
		accessorKey: "name",
		header: "Name",
		cell: ({row}) => (
			<DataTableTreeCell row={row}>
				<span>
					{row.original.type === "folder" ? "📁" : "📄"} {row.original.name}
				</span>
			</DataTableTreeCell>
		),
	},
	{accessorKey: "size", header: "Size", cell: ({row}) => row.original.size ?? "—"},
	{accessorKey: "modified", header: "Modified"},
];

export const TreeRows: Story = {
	render: () => <DataTable columns={fileColumns} data={files} getSubRows={(row) => row.subRows} expandAllByDefault />,
};

export const SearchOnly: Story = {
	render: () => (
		<DataTable
			columns={paymentColumns.filter((col) => "accessorKey" in col)}
			data={payments}
			searchKey="email"
			searchPlaceholder="Search emails..."
		/>
	),
};

// --- Bulk actions ---

const bulkActions: BulkAction[] = [
	{label: "Export", onClick: (ids) => alert(`Export: ${ids.join(", ")}`)},
	{label: "Archive", variant: "secondary", onClick: (ids) => alert(`Archive: ${ids.join(", ")}`)},
	{label: "Delete", variant: "destructive", onClick: (ids) => alert(`Delete: ${ids.join(", ")}`)},
];

export const WithBulkActions: Story = {
	render: () => (
		<DataTable
			columns={paymentColumns}
			data={payments}
			searchKey="email"
			searchPlaceholder="Filter by email..."
			showColumnToggle
			showPagination
			showSelectedCount
			pageSize={8}
			bulkActions={bulkActions}
		/>
	),
};

// --- Toolbar actions: Filter + Export + Columns ---

const paymentStatusOptions: {value: Payment["status"]; label: string}[] = [
	{value: "pending", label: "Pending"},
	{value: "processing", label: "Processing"},
	{value: "success", label: "Success"},
	{value: "failed", label: "Failed"},
];

function DataTableToolbarActionsExample() {
	const [filters, setFilters] = React.useState<FilterValue>({});
	const selectedStatuses = filters.status ?? [];
	const filteredPayments = selectedStatuses.length
		? payments.filter((payment) => selectedStatuses.includes(payment.status))
		: payments;

	return (
		<div data-wakecore-region="data-table-toolbar-example">
			<DataTable
				columns={paymentColumns}
				data={filteredPayments}
				searchKey="email"
				searchPlaceholder="Filter by email..."
				showColumnToggle
				showPagination
				toolbarExtra={
					<>
						<Filter value={filters} onChange={setFilters}>
							<FilterTrigger
								className="wwc:h-9 wwc:w-9"
								aria-label="Filter payments"
								data-wakecore-interaction="apply-status-filter"
							/>
							<FilterContent heading="Filter payments">
								<FilterCategory value="status" label="Status">
									{paymentStatusOptions.map((status) => (
										<FilterOption key={status.value} value={status.value}>
											{status.label}
										</FilterOption>
									))}
								</FilterCategory>
							</FilterContent>
						</Filter>
						<Button variant="outline" data-wakecore-interaction="export">
							<Download className="wwc:h-4 wwc:w-4" />
							Export
						</Button>
					</>
				}
			/>
		</div>
	);
}

export const WithFilterExportAndColumns: Story = {
	name: "Toolbar — Filter, Export, and Columns",
	parameters: {
		docs: {
			description: {
				story:
					"Uses DataTable's `toolbarExtra` slot to place the Filter widget and Export action directly beside the owned Columns dropdown. Apply one or more status values to reduce the displayed rows; Clear restores the full dataset.",
			},
		},
	},
	render: () => <DataTableToolbarActionsExample />,
};

// --- Organization hierarchy with level colors ---

type OrgNode = {
	id: string;
	name: string;
	role: string;
	email: string;
	headcount: number;
	subRows?: OrgNode[];
};

const orgData: OrgNode[] = [
	{
		id: "1",
		name: "Acme Corporation",
		role: "Organization",
		email: "info@acme.com",
		headcount: 245,
		subRows: [
			{
				id: "1-1",
				name: "Engineering",
				role: "Department",
				email: "engineering@acme.com",
				headcount: 120,
				subRows: [
					{
						id: "1-1-1",
						name: "Frontend Team",
						role: "Team",
						email: "frontend@acme.com",
						headcount: 35,
						subRows: [
							{id: "1-1-1-1", name: "Alice Johnson", role: "Tech Lead", email: "alice@acme.com", headcount: 1},
							{id: "1-1-1-2", name: "Bob Smith", role: "Senior Developer", email: "bob@acme.com", headcount: 1},
						],
					},
					{
						id: "1-1-2",
						name: "Backend Team",
						role: "Team",
						email: "backend@acme.com",
						headcount: 42,
						subRows: [{id: "1-1-2-1", name: "David Brown", role: "Tech Lead", email: "david@acme.com", headcount: 1}],
					},
				],
			},
			{
				id: "1-2",
				name: "Product",
				role: "Department",
				email: "product@acme.com",
				headcount: 45,
				subRows: [
					{
						id: "1-2-1",
						name: "Design Team",
						role: "Team",
						email: "design@acme.com",
						headcount: 20,
						subRows: [{id: "1-2-1-1", name: "Grace Kim", role: "Design Lead", email: "grace@acme.com", headcount: 1}],
					},
				],
			},
		],
	},
];

const levelColors = [
	{level: 0, label: "Organization", dotClass: "wwc:bg-sky-400"},
	{level: 1, label: "Department", dotClass: "wwc:bg-emerald-400"},
	{level: 2, label: "Team", dotClass: "wwc:bg-violet-400"},
	{level: 3, label: "Individual", dotClass: "wwc:bg-rose-400"},
];

function getLevelColor(depth: number) {
	return levelColors[Math.min(depth, levelColors.length - 1)];
}

function OrgTreeCell({row, children}: {row: Row<OrgNode>; children: React.ReactNode}) {
	const levelColor = getLevelColor(row.depth);
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2" style={{paddingLeft: `${row.depth * 1.5}rem`}}>
			<div className={cn("wwc:w-1 wwc:h-6 wwc:rounded-full wwc:shrink-0", levelColor.dotClass)} />
			<DataTableExpandButton row={row} />
			{children}
		</div>
	);
}

const orgColumns: ColumnDef<OrgNode>[] = [
	{
		accessorKey: "name",
		header: "Name",
		cell: ({row}) => (
			<OrgTreeCell row={row}>
				<span className="wwc:font-medium">{row.original.name}</span>
			</OrgTreeCell>
		),
	},
	{
		accessorKey: "role",
		header: "Role",
		cell: ({row}) => <Badge variant="outline">{row.original.role}</Badge>,
	},
	{
		accessorKey: "email",
		header: "Email",
		cell: ({row}) => <span className="wwc:text-muted-foreground wwc:text-sm">{row.original.email}</span>,
	},
	{
		accessorKey: "headcount",
		header: "Headcount",
		cell: ({row}) => <span className="wwc:font-medium">{row.original.headcount}</span>,
	},
];

export const OrgHierarchy: Story = {
	render: () => (
		<div>
			<div className="wwc:flex wwc:flex-wrap wwc:gap-4 wwc:p-3 wwc:bg-muted/30 wwc:rounded-lg wwc:mb-4">
				<span className="wwc:text-sm wwc:font-medium wwc:text-muted-foreground">Levels:</span>
				{levelColors.map((item) => (
					<div key={item.level} className="wwc:flex wwc:items-center wwc:gap-2">
						<div className={cn("wwc:w-3 wwc:h-3 wwc:rounded-full", item.dotClass)} />
						<span className="wwc:text-sm">{item.label}</span>
					</div>
				))}
			</div>
			<DataTable
				columns={orgColumns}
				data={orgData}
				searchKey="name"
				searchPlaceholder="Search organization..."
				getSubRows={(row) => row.subRows}
				getRowCanExpand={(row) => !!row.original.subRows?.length}
				expandAllByDefault
				showColumnToggle={false}
				showSelectedCount={false}
				showPagination={false}
			/>
		</div>
	),
};

// --- Actions column with 3-dot menu ---

type Employee = {
	id: string;
	name: string;
	email: string;
	role: string;
	department: string;
	status: "active" | "inactive" | "on-leave";
};

const employees: Employee[] = [
	{
		id: "EMP-001",
		name: "Alice Johnson",
		email: "alice@company.com",
		role: "Tech Lead",
		department: "Engineering",
		status: "active",
	},
	{
		id: "EMP-002",
		name: "Bob Smith",
		email: "bob@company.com",
		role: "Designer",
		department: "Product",
		status: "active",
	},
	{
		id: "EMP-003",
		name: "Carol Williams",
		email: "carol@company.com",
		role: "PM",
		department: "Product",
		status: "on-leave",
	},
	{
		id: "EMP-004",
		name: "David Brown",
		email: "david@company.com",
		role: "Developer",
		department: "Engineering",
		status: "active",
	},
	{
		id: "EMP-005",
		name: "Eva Martinez",
		email: "eva@company.com",
		role: "QA Engineer",
		department: "Engineering",
		status: "inactive",
	},
	{
		id: "EMP-006",
		name: "Frank Lee",
		email: "frank@company.com",
		role: "DevOps",
		department: "Infrastructure",
		status: "active",
	},
];

const employeeStatusVariant: Record<string, "default" | "secondary" | "destructive"> = {
	active: "default",
	"on-leave": "secondary",
	inactive: "destructive",
};

const employeeColumns: ColumnDef<Employee>[] = [
	{
		accessorKey: "name",
		header: ({column}) => <DataTableColumnHeader column={column} title="Name" />,
		cell: ({row}) => <span className="wwc:font-medium">{row.getValue("name")}</span>,
	},
	{
		accessorKey: "email",
		header: ({column}) => <DataTableColumnHeader column={column} title="Email" />,
		cell: ({row}) => <span className="wwc:text-muted-foreground">{row.getValue("email")}</span>,
	},
	{
		accessorKey: "role",
		header: "Role",
	},
	{
		accessorKey: "department",
		header: "Department",
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({row}) => {
			const status = row.getValue("status") as string;
			return <Badge variant={employeeStatusVariant[status]}>{status}</Badge>;
		},
	},
	{
		id: "actions",
		header: () => null,
		cell: () => (
			<div className="wwc:flex wwc:justify-end">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							icon
							className="wwc:h-8 wwc:w-8 wwc:hover:bg-transparent wwc:data-[state=open]:bg-muted"
						>
							<MoreHorizontal className="wwc:h-4 wwc:w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem>
							<Edit className="wwc:h-4 wwc:w-4 wwc:mr-2" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem>
							<Copy className="wwc:h-4 wwc:w-4 wwc:mr-2" />
							Duplicate
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="wwc:text-destructive wwc:focus:text-destructive">
							<Trash2 className="wwc:h-4 wwc:w-4 wwc:mr-2" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		),
		enableSorting: false,
		enableHiding: false,
	},
];

export const WithActionsColumn: Story = {
	render: () => (
		<DataTable
			columns={employeeColumns}
			data={employees}
			searchKey="name"
			searchPlaceholder="Search employees..."
			showColumnToggle
			showPagination
		/>
	),
};

// ============================================================================
// Widget-catalog stories — deterministic, Chromatic-friendly. No randomness, no
// timers, no portals/overlays open at snapshot time.
// ============================================================================

// Static columns (no select/header components) for the plain-Table comparison.
const plainColumns: ColumnDef<Payment>[] = [
	{accessorKey: "id", header: "ID"},
	{accessorKey: "email", header: "Email"},
	{accessorKey: "amount", header: "Amount", cell: ({row}) => `$${(row.getValue("amount") as number).toFixed(2)}`},
];

export const VsPlainTable: Story = {
	name: "DataTable vs plain Table",
	parameters: {
		docs: {
			description: {
				story:
					"**The decision.** `Table` (left) is a presentational `<table>` — static rows, your own layout, zero built-in " +
					"behaviour. `DataTable` (right) is the **widget** — the same rows gain search, sortable headers, column show/hide, " +
					"selection, and pagination from one `columns`/`data` contract. Choose `Table` for a few fixed rows; choose " +
					"`DataTable` the moment you need interactivity or more than ~10 rows.",
			},
		},
	},
	render: () => (
		<div className="wwc:grid wwc:grid-cols-1 wwc:gap-8 lg:wwc:grid-cols-2">
			<div>
				<p className="wwc:mb-2 wwc:text-sm wwc:font-semibold">Table — presentational primitive</p>
				<div className="wwc:rounded-md wwc:border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>ID</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Amount</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{payments.slice(0, 4).map((p) => (
								<TableRow key={p.id}>
									<TableCell>{p.id}</TableCell>
									<TableCell>{p.email}</TableCell>
									<TableCell>${p.amount.toFixed(2)}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
				<p className="wwc:mt-2 wwc:text-xs wwc:text-muted-foreground">
					No search · no sort · no pagination — you build those.
				</p>
			</div>
			<div>
				<p className="wwc:mb-2 wwc:text-sm wwc:font-semibold">DataTable — composed widget</p>
				<DataTable
					columns={plainColumns}
					data={payments}
					searchKey="email"
					searchPlaceholder="Filter by email..."
					pageSize={4}
				/>
				<p className="wwc:mt-2 wwc:text-xs wwc:text-muted-foreground">
					Search + sortable headers + pagination from one contract.
				</p>
			</div>
		</div>
	),
};

export const EmptyState: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Built-in **empty state**: when `data` (or the active filter) yields zero rows, DataTable renders a single " +
					'"No results." row spanning all columns. No extra wiring needed.',
			},
		},
	},
	render: () => <DataTable columns={plainColumns} data={[]} searchKey="email" searchPlaceholder="Filter by email..." />,
};

export const LoadingPattern: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"`isLoading` renders skeleton rows in place of data, sized to the current page size. Use it while a page " +
					"is in flight so the empty state never flashes between fetches.",
			},
		},
	},
	render: () => <DataTable columns={plainColumns} data={[]} isLoading pageSize={5} searchKey="email" />,
};

export const EmptyMessage: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'`emptyMessage` replaces the default "No results." copy — useful to distinguish an empty filter from an empty dataset.',
			},
		},
	},
	render: () => (
		<DataTable columns={plainColumns} data={[]} emptyMessage="No users match this filter." searchKey="email" />
	),
};

export const ServerDriven: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Opt-in manual mode for lists too large to fetch at once. Set `manualPagination` / `manualSorting`, pass " +
					"`rowCount` (the server total), and own `pagination` / `sorting` / `search` as controlled state. The table " +
					"then renders exactly the page it is handed and routes every page, sort, and search change back out to you. " +
					"Always pass `getRowId` in this mode — otherwise selection keys are row indices and collide across pages.",
			},
		},
	},
	render: () => {
		const TOTAL = 4489;
		const [pagination, setPagination] = React.useState({pageIndex: 0, pageSize: 10});
		const [sorting, setSorting] = React.useState<SortingState>([]);
		const [search, setSearch] = React.useState("");
		const [isLoading, setIsLoading] = React.useState(false);

		// Stand-in for a fetch: slice a synthetic dataset the way a server would.
		const rows = React.useMemo(() => {
			const start = pagination.pageIndex * pagination.pageSize;
			return Array.from({length: pagination.pageSize}, (_, i) => ({
				id: `u${start + i + 1}`,
				email: `user${start + i + 1}@wakecap.com`,
				amount: 100 + start + i,
				status: "success" as const,
			}));
		}, [pagination]);

		// Simulate the request latency so the skeleton state is visible.
		React.useEffect(() => {
			setIsLoading(true);
			const t = setTimeout(() => setIsLoading(false), 400);
			return () => clearTimeout(t);
		}, [pagination, sorting, search]);

		return (
			<DataTable
				columns={plainColumns}
				data={rows}
				getRowId={(row) => row.id}
				manualPagination
				manualSorting
				rowCount={TOTAL}
				pagination={pagination}
				onPaginationChange={setPagination}
				sorting={sorting}
				onSortingChange={setSorting}
				search={search}
				onSearchChange={setSearch}
				searchPlaceholder="Search all users..."
				isLoading={isLoading}
				recordLabel="user"
			/>
		);
	},
};

export const SearchKeyContract: Story = {
	name: "Data contract — searchKey must match a column",
	parameters: {
		docs: {
			description: {
				story:
					"**The #1 DataTable mistake (`fm-dt-1`).** `searchKey` must equal a column's `accessorKey`/`id`. On the left it " +
					'is `"email"` (a real column) and filtering works. On the right it is `"e-mail"` (no such column) — the input ' +
					"still renders but typing filters nothing, silently. Always point `searchKey` at an existing column key.",
			},
		},
	},
	render: () => (
		<div className="wwc:grid wwc:grid-cols-1 wwc:gap-8 lg:wwc:grid-cols-2">
			<div>
				<p className="wwc:mb-2 wwc:text-sm wwc:font-semibold wwc:text-green-700">
					✓ searchKey=&quot;email&quot; — works
				</p>
				<DataTable
					columns={plainColumns}
					data={payments}
					searchKey="email"
					searchPlaceholder="Filter by email..."
					pageSize={4}
				/>
			</div>
			<div>
				<p className="wwc:mb-2 wwc:text-sm wwc:font-semibold wwc:text-destructive">
					✗ searchKey=&quot;e-mail&quot; — silently does nothing
				</p>
				<DataTable
					columns={plainColumns}
					data={payments}
					searchKey="e-mail"
					searchPlaceholder="Type here — nothing filters..."
					pageSize={4}
				/>
			</div>
		</div>
	),
};

// ── Row activation (#207) ────────────────────────────────────────────────────
// Before this, a table whose primary record is the navigation target had to put a link in one cell and
// repeat an Open action, so the row itself was inert. `getRowHref` makes the WHOLE row the link;
// `onRowActivate` covers destinations that are not addressable. Both are off by default — a table that
// supplies neither behaves exactly as it always has.

export const RowActivationWithHref: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"`getRowHref` makes the row a real link. Click anywhere on it, or focus it and press **Enter**. Because a genuine anchor does the navigating, ⌘/Ctrl-click and middle-click open a new tab and the browser's own context menu offers *Copy link address* — none of which a synthetic click handler gives you. Nested controls keep their own click: the checkbox selects, the row does not navigate.",
			},
		},
	},
	render: () => (
		<DataTable
			columns={paymentColumns}
			data={payments}
			searchKey="email"
			searchPlaceholder="Filter by email..."
			pageSize={5}
			getRowHref={(row) => `#/payments/${row.original.id}`}
			getRowAriaLabel={(row) => `Open payment from ${row.original.email}`}
		/>
	),
};

function RowActivationDemo({compact}: {compact?: boolean}) {
	const [opened, setOpened] = React.useState<string | null>(null);
	return (
		<div className="wwc:space-y-3">
			<DataTable
				columns={paymentColumns}
				data={compact ? payments.slice(0, 4) : payments}
				searchKey="email"
				searchPlaceholder="Filter by email..."
				pageSize={5}
				onRowActivate={(row) => setOpened(row.original.email)}
				getRowAriaLabel={(row) => `Open payment from ${row.original.email}`}
			/>
			<p className="wwc:text-sm wwc:text-muted-foreground">
				Last activated: <span className="wwc:font-medium wwc:text-foreground">{opened ?? "—"}</span>
			</p>
		</div>
	);
}

export const RowActivationWithCallback: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"`onRowActivate` for destinations that are not addressable — opening a drawer, selecting into a split view. Pointer and keyboard are equivalent: click the row, or Tab to it and press **Enter** or **Space** (Space is prevented from scrolling the page). Clicking the checkbox or the row's action menu does **not** activate the row.",
			},
		},
	},
	render: () => <RowActivationDemo />,
};

export const RowActivationExpandable: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Row activation alongside expansion and selection. The expand chevron and the select checkbox are nested controls, so they claim their own click — only the rest of the row activates. Loading and empty states are unaffected: skeleton rows and the empty row are never activatable.",
			},
		},
	},
	render: () => (
		<DataTable
			columns={paymentColumns}
			data={payments}
			pageSize={5}
			getRowCanExpand={() => true}
			renderSubComponent={({row}) => (
				<div className="wwc:p-4 wwc:text-sm wwc:text-muted-foreground">
					Detail panel for <span className="wwc:font-medium wwc:text-foreground">{row.original.email}</span>
				</div>
			)}
			onRowActivate={(row) => window.console.log("activate", row.original.id)}
			getRowAriaLabel={(row) => `Open payment from ${row.original.email}`}
		/>
	),
};

export const RowActivationLoadingAndEmpty: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"An activation owner is supplied, but there is nothing to activate. Skeleton rows and the empty-state row carry no role, no tab stop and no handler — a table mid-fetch never offers a row that would navigate nowhere.",
			},
		},
	},
	render: () => (
		<div className="wwc:space-y-8">
			<DataTable
				columns={paymentColumns}
				data={[]}
				isLoading
				pageSize={3}
				getRowHref={(row) => `#/payments/${row.original.id}`}
			/>
			<DataTable
				columns={paymentColumns}
				data={[]}
				pageSize={3}
				emptyMessage="No payments yet."
				getRowHref={(row) => `#/payments/${row.original.id}`}
			/>
		</div>
	),
};
