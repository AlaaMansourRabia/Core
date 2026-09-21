import type {ColumnDef, Row} from "@tanstack/react-table";

import {FileCode, FileImage, FileText, Folder} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {CopyButton} from "@/components/ui/copy-button";
import {
	DataTable,
	DataTableColumnHeader,
	DataTableDetailPanel,
	DataTableExpandButton,
	DataTableTreeCell,
} from "@/components/ui/data-table";
import {Separator} from "@/components/ui/separator";
import {cn} from "@/lib/utils";

type Payment = {
	id: string;
	amount: number;
	status: "pending" | "processing" | "success" | "failed";
	email: string;
};

const data: Payment[] = [
	{id: "m5gr84i9", amount: 316, status: "success", email: "ken99@yahoo.com"},
	{id: "3u1reuv4", amount: 242, status: "success", email: "abe45@gmail.com"},
	{id: "derv1ws0", amount: 837, status: "processing", email: "monserrat44@gmail.com"},
	{id: "5kma53ae", amount: 874, status: "success", email: "silas22@gmail.com"},
	{id: "bhqecj4p", amount: 721, status: "failed", email: "carmella@hotmail.com"},
	{id: "p2osxhfi", amount: 123, status: "pending", email: "john.doe@example.com"},
	{id: "qwe12345", amount: 456, status: "success", email: "jane.smith@example.com"},
	{id: "asd67890", amount: 789, status: "processing", email: "bob.wilson@example.com"},
];

const columns: ColumnDef<Payment>[] = [
	{
		id: "select",
		header: ({table}) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
		enableHiding: false,
	},
	{
		accessorKey: "email",
		header: ({column}) => <DataTableColumnHeader column={column} title="Email" />,
		cell: ({row}) => <div className="wwc:lowercase">{row.getValue("email")}</div>,
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({row}) => {
			const status = row.getValue("status") as string;
			return (
				<Badge variant={status === "success" ? "default" : status === "failed" ? "destructive" : "secondary"}>
					{status}
				</Badge>
			);
		},
	},
	{
		accessorKey: "amount",
		header: ({column}) => <DataTableColumnHeader column={column} title="Amount" />,
		cell: ({row}) => {
			const amount = Number.parseFloat(row.getValue("amount"));
			const formatted = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			}).format(amount);
			return <div className="wwc:font-medium">{formatted}</div>;
		},
	},
];

// Expandable rows data
type Order = {
	id: string;
	customer: string;
	email: string;
	date: string;
	total: number;
	status: "pending" | "processing" | "shipped" | "delivered";
	items: OrderItem[];
};

type OrderItem = {
	name: string;
	quantity: number;
	price: number;
};

const ordersData: Order[] = [
	{
		id: "ORD-001",
		customer: "John Smith",
		email: "john.smith@email.com",
		date: "2024-01-15",
		total: 299.99,
		status: "delivered",
		items: [
			{name: "Wireless Headphones", quantity: 1, price: 199.99},
			{name: "USB-C Cable", quantity: 2, price: 29.99},
			{name: "Phone Case", quantity: 1, price: 39.99},
		],
	},
	{
		id: "ORD-002",
		customer: "Sarah Johnson",
		email: "sarah.j@email.com",
		date: "2024-01-16",
		total: 549.0,
		status: "shipped",
		items: [
			{name: "Mechanical Keyboard", quantity: 1, price: 149.0},
			{name: "Gaming Mouse", quantity: 1, price: 89.0},
			{name: "Mouse Pad XL", quantity: 1, price: 35.0},
			{name: "Monitor Stand", quantity: 1, price: 276.0},
		],
	},
	{
		id: "ORD-003",
		customer: "Mike Davis",
		email: "mike.davis@email.com",
		date: "2024-01-17",
		total: 89.99,
		status: "processing",
		items: [
			{name: "Laptop Sleeve", quantity: 1, price: 49.99},
			{name: "Screen Cleaner", quantity: 2, price: 19.99},
		],
	},
	{
		id: "ORD-004",
		customer: "Emily Brown",
		email: "emily.b@email.com",
		date: "2024-01-18",
		total: 1299.0,
		status: "pending",
		items: [{name: "4K Monitor", quantity: 1, price: 1299.0}],
	},
];

const expandableColumns: ColumnDef<Order>[] = [
	{
		id: "expand",
		header: () => null,
		cell: ({row}) => <DataTableExpandButton row={row} />,
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "id",
		header: "Order ID",
		cell: ({row}) => <span className="wwc:font-mono wwc:text-sm">{row.getValue("id")}</span>,
	},
	{
		accessorKey: "customer",
		header: ({column}) => <DataTableColumnHeader column={column} title="Customer" />,
	},
	{
		accessorKey: "date",
		header: ({column}) => <DataTableColumnHeader column={column} title="Date" />,
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({row}) => {
			const status = row.getValue("status") as string;
			return (
				<Badge
					variant={
						status === "delivered"
							? "default"
							: status === "shipped"
								? "secondary"
								: status === "processing"
									? "outline"
									: "secondary"
					}
				>
					{status}
				</Badge>
			);
		},
	},
	{
		accessorKey: "total",
		header: ({column}) => <DataTableColumnHeader column={column} title="Total" />,
		cell: ({row}) => {
			const total = Number.parseFloat(row.getValue("total"));
			const formatted = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			}).format(total);
			return <div className="wwc:font-medium">{formatted}</div>;
		},
	},
];

// Sub-component for expanded row content
function OrderDetails({row}: {row: Row<Order>}) {
	const order = row.original;
	return (
		<DataTableDetailPanel>
			<div className="wwc:space-y-4">
				<div className="wwc:grid wwc:grid-cols-2 wwc:gap-4 wwc:text-sm">
					<div>
						<span className="wwc:text-muted-foreground">Email:</span>
						<span className="wwc:ml-2">{order.email}</span>
					</div>
					<div>
						<span className="wwc:text-muted-foreground">Items:</span>
						<span className="wwc:ml-2">{order.items.length} items</span>
					</div>
				</div>
				<Separator />
				<div>
					<h4 className="wwc:text-sm wwc:font-medium wwc:mb-2">Order Items</h4>
					<div className="wwc:rounded-md wwc:border">
						<table className="wwc:w-full wwc:text-sm">
							<thead>
								<tr className="wwc:border-b wwc:bg-muted/50">
									<th className="wwc:text-left wwc:p-2 wwc:font-medium">Item</th>
									<th className="wwc:text-center wwc:p-2 wwc:font-medium">Qty</th>
									<th className="wwc:text-right wwc:p-2 wwc:font-medium">Price</th>
									<th className="wwc:text-right wwc:p-2 wwc:font-medium">Subtotal</th>
								</tr>
							</thead>
							<tbody>
								{order.items.map((item, index) => (
									<tr key={index} className="wwc:border-b wwc:last:border-b-0">
										<td className="wwc:p-2">{item.name}</td>
										<td className="wwc:p-2 wwc:text-center">{item.quantity}</td>
										<td className="wwc:p-2 wwc:text-right">
											{new Intl.NumberFormat("en-US", {
												style: "currency",
												currency: "USD",
											}).format(item.price)}
										</td>
										<td className="wwc:p-2 wwc:text-right wwc:font-medium">
											{new Intl.NumberFormat("en-US", {
												style: "currency",
												currency: "USD",
											}).format(item.price * item.quantity)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</DataTableDetailPanel>
	);
}

// Nested tree data
type FileNode = {
	id: string;
	name: string;
	type: "folder" | "file";
	fileType?: "document" | "code" | "image";
	size?: string;
	modified: string;
	subRows?: FileNode[];
};

const treeData: FileNode[] = [
	{
		id: "1",
		name: "src",
		type: "folder",
		modified: "2024-01-15",
		subRows: [
			{
				id: "1-1",
				name: "components",
				type: "folder",
				modified: "2024-01-15",
				subRows: [
					{
						id: "1-1-1",
						name: "ui",
						type: "folder",
						modified: "2024-01-14",
						subRows: [
							{
								id: "1-1-1-1",
								name: "button.tsx",
								type: "file",
								fileType: "code",
								size: "2.4 KB",
								modified: "2024-01-14",
							},
							{
								id: "1-1-1-2",
								name: "input.tsx",
								type: "file",
								fileType: "code",
								size: "1.8 KB",
								modified: "2024-01-13",
							},
							{
								id: "1-1-1-3",
								name: "dialog.tsx",
								type: "file",
								fileType: "code",
								size: "3.2 KB",
								modified: "2024-01-12",
							},
						],
					},
					{id: "1-1-2", name: "Header.tsx", type: "file", fileType: "code", size: "1.5 KB", modified: "2024-01-10"},
					{id: "1-1-3", name: "Footer.tsx", type: "file", fileType: "code", size: "0.9 KB", modified: "2024-01-10"},
				],
			},
			{
				id: "1-2",
				name: "pages",
				type: "folder",
				modified: "2024-01-15",
				subRows: [
					{id: "1-2-1", name: "index.tsx", type: "file", fileType: "code", size: "2.1 KB", modified: "2024-01-15"},
					{id: "1-2-2", name: "about.tsx", type: "file", fileType: "code", size: "1.2 KB", modified: "2024-01-11"},
				],
			},
			{id: "1-3", name: "App.tsx", type: "file", fileType: "code", size: "1.1 KB", modified: "2024-01-15"},
			{id: "1-4", name: "main.tsx", type: "file", fileType: "code", size: "0.4 KB", modified: "2024-01-08"},
		],
	},
	{
		id: "2",
		name: "public",
		type: "folder",
		modified: "2024-01-10",
		subRows: [
			{id: "2-1", name: "favicon.ico", type: "file", fileType: "image", size: "4.2 KB", modified: "2024-01-05"},
			{id: "2-2", name: "logo.svg", type: "file", fileType: "image", size: "2.8 KB", modified: "2024-01-05"},
		],
	},
	{
		id: "3",
		name: "docs",
		type: "folder",
		modified: "2024-01-12",
		subRows: [
			{id: "3-1", name: "README.md", type: "file", fileType: "document", size: "5.6 KB", modified: "2024-01-12"},
			{id: "3-2", name: "CHANGELOG.md", type: "file", fileType: "document", size: "12.3 KB", modified: "2024-01-12"},
		],
	},
	{id: "4", name: "package.json", type: "file", fileType: "code", size: "1.8 KB", modified: "2024-01-15"},
	{id: "5", name: "tsconfig.json", type: "file", fileType: "code", size: "0.6 KB", modified: "2024-01-08"},
];

function FileIcon({type, fileType}: {type: "folder" | "file"; fileType?: string}) {
	if (type === "folder") {
		return <Folder className="wwc:h-4 wwc:w-4 wwc:text-amber-500" />;
	}
	switch (fileType) {
		case "code":
			return <FileCode className="wwc:h-4 wwc:w-4 wwc:text-blue-500" />;
		case "image":
			return <FileImage className="wwc:h-4 wwc:w-4 wwc:text-green-500" />;
		case "document":
			return <FileText className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />;
		default:
			return <FileText className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />;
	}
}

const treeColumns: ColumnDef<FileNode>[] = [
	{
		accessorKey: "name",
		header: "Name",
		cell: ({row}) => (
			<DataTableTreeCell row={row}>
				<FileIcon type={row.original.type} fileType={row.original.fileType} />
				<span className={row.original.type === "folder" ? "wwc:font-medium" : ""}>{row.original.name}</span>
			</DataTableTreeCell>
		),
	},
	{
		accessorKey: "size",
		header: "Size",
		cell: ({row}) => <span className="wwc:text-muted-foreground">{row.original.size || "—"}</span>,
	},
	{
		accessorKey: "type",
		header: "Type",
		cell: ({row}) => (
			<Badge variant="outline" className="wwc:capitalize">
				{row.original.type === "folder" ? "Folder" : row.original.fileType}
			</Badge>
		),
	},
	{
		accessorKey: "modified",
		header: ({column}) => <DataTableColumnHeader column={column} title="Modified" />,
		cell: ({row}) => (
			<span className="wwc:text-muted-foreground">{new Date(row.original.modified).toLocaleDateString()}</span>
		),
	},
];

// Organization hierarchy with colored levels
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
							{id: "1-1-1-3", name: "Carol Williams", role: "Developer", email: "carol@acme.com", headcount: 1},
						],
					},
					{
						id: "1-1-2",
						name: "Backend Team",
						role: "Team",
						email: "backend@acme.com",
						headcount: 42,
						subRows: [
							{id: "1-1-2-1", name: "David Brown", role: "Tech Lead", email: "david@acme.com", headcount: 1},
							{id: "1-1-2-2", name: "Eva Martinez", role: "Senior Developer", email: "eva@acme.com", headcount: 1},
						],
					},
					{
						id: "1-1-3",
						name: "DevOps Team",
						role: "Team",
						email: "devops@acme.com",
						headcount: 18,
						subRows: [{id: "1-1-3-1", name: "Frank Lee", role: "Team Lead", email: "frank@acme.com", headcount: 1}],
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
						subRows: [
							{id: "1-2-1-1", name: "Grace Kim", role: "Design Lead", email: "grace@acme.com", headcount: 1},
							{id: "1-2-1-2", name: "Henry Chen", role: "UX Designer", email: "henry@acme.com", headcount: 1},
						],
					},
					{
						id: "1-2-2",
						name: "Product Management",
						role: "Team",
						email: "pm@acme.com",
						headcount: 12,
						subRows: [
							{id: "1-2-2-1", name: "Ivy Wilson", role: "Product Manager", email: "ivy@acme.com", headcount: 1},
						],
					},
				],
			},
			{
				id: "1-3",
				name: "Operations",
				role: "Department",
				email: "ops@acme.com",
				headcount: 80,
				subRows: [
					{
						id: "1-3-1",
						name: "HR Team",
						role: "Team",
						email: "hr@acme.com",
						headcount: 15,
					},
					{
						id: "1-3-2",
						name: "Finance Team",
						role: "Team",
						email: "finance@acme.com",
						headcount: 25,
					},
				],
			},
		],
	},
];

// Level colors configuration - light pastel colors
const levelColors = [
	{level: 0, label: "Organization", dotClass: "wwc:bg-sky-400"},
	{level: 1, label: "Department", dotClass: "wwc:bg-emerald-400"},
	{level: 2, label: "Team", dotClass: "wwc:bg-violet-400"},
	{level: 3, label: "Individual", dotClass: "wwc:bg-rose-400"},
];

function getLevelColor(depth: number) {
	return levelColors[Math.min(depth, levelColors.length - 1)];
}

// Custom row component with level color indicator at the start
function OrgTreeCell({row, children}: {row: Row<OrgNode>; children: React.ReactNode}) {
	const levelColor = getLevelColor(row.depth);
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2" style={{paddingLeft: `${row.depth * 1.5}rem`}}>
			{/* Color indicator bar */}
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

// Legend component
function TreeLevelLegend() {
	return (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-4 wwc:p-3 wwc:bg-muted/30 wwc:rounded-lg wwc:mb-4">
			<span className="wwc:text-sm wwc:font-medium wwc:text-muted-foreground">Levels:</span>
			{levelColors.map((item) => (
				<div key={item.level} className="wwc:flex wwc:items-center wwc:gap-2">
					<div className={cn("wwc:w-3 wwc:h-3 wwc:rounded-full", item.dotClass)} />
					<span className="wwc:text-sm">{item.label}</span>
				</div>
			))}
		</div>
	);
}

export function DataTablePage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Data Table</h1>
					<CopyButton
						value="Data Table"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Powerful data table with sorting, filtering, and pagination built on TanStack Table.
				</p>
			</div>

			<div className="wwc:space-y-8">
				{/* Default Example */}
				<div className="wwc:space-y-3">
					<h2 className="wwc:text-xl wwc:font-semibold">Default with All Features</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						Basic data table with sorting, filtering, column visibility, and row selection.
					</p>
					<DataTable columns={columns} data={data} searchKey="email" searchPlaceholder="Filter emails..." />
				</div>

				{/* Expandable Rows Example */}
				<div className="wwc:space-y-3">
					<h2 className="wwc:text-xl wwc:font-semibold">Expandable Rows</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						Click the chevron to expand rows and view order details. Each row reveals additional information in a
						collapsible panel.
					</p>
					<DataTable
						columns={expandableColumns}
						data={ordersData}
						searchKey="customer"
						searchPlaceholder="Search customers..."
						getRowCanExpand={() => true}
						renderSubComponent={OrderDetails}
						showSelectedCount={false}
					/>
				</div>

				{/* Nested Tree Rows Example */}
				<div className="wwc:space-y-3">
					<h2 className="wwc:text-xl wwc:font-semibold">Nested Tree Rows</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						Hierarchical data with nested rows. Click folders to expand and reveal their contents. Supports multiple
						levels of nesting.
					</p>
					<DataTable
						columns={treeColumns}
						data={treeData}
						searchKey="name"
						searchPlaceholder="Search files..."
						getSubRows={(row) => row.subRows}
						getRowCanExpand={(row) => !!row.original.subRows?.length}
						expandAllByDefault={false}
						showColumnToggle={false}
						showSelectedCount={false}
						showPagination={false}
					/>
				</div>

				{/* Colored Hierarchy Tree Example */}
				<div className="wwc:space-y-3">
					<h2 className="wwc:text-xl wwc:font-semibold">Organization Hierarchy with Level Colors</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						Hierarchical organization structure with color-coded levels. Each level has a distinct background color for
						easy visual distinction.
					</p>
					<TreeLevelLegend />
					<DataTable
						columns={orgColumns}
						data={orgData}
						searchKey="name"
						searchPlaceholder="Search organization..."
						getSubRows={(row) => row.subRows}
						getRowCanExpand={(row) => !!row.original.subRows?.length}
						expandAllByDefault={true}
						showColumnToggle={false}
						showSelectedCount={false}
						showPagination={false}
					/>
				</div>

				{/* API Reference */}
				<Card>
					<CardHeader>
						<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
							<CardTitle>API Reference</CardTitle>
							<CopyButton
								value="Data Table - API Reference"
								className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
							/>
						</div>
						<CardDescription>
							Props for the{" "}
							<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<DataTable>"}</code>{" "}
							component.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="wwc:overflow-x-auto">
							<table className="wwc:w-full wwc:text-[13px]">
								<thead>
									<tr className="wwc:border-b wwc:border-border">
										<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Prop</th>
										<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Type</th>
										<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Default</th>
										<th className="wwc:text-left wwc:py-3 wwc:font-semibold wwc:text-foreground">Description</th>
									</tr>
								</thead>
								<tbody>
									{[
										{
											prop: "columns",
											type: "ColumnDef<TData, TValue>[]",
											def: "—",
											desc: "Column definitions for the table.",
										},
										{prop: "data", type: "TData[]", def: "—", desc: "Array of data to display."},
										{prop: "searchKey", type: "string", def: "—", desc: "Column key to enable search/filter on."},
										{
											prop: "searchPlaceholder",
											type: "string",
											def: '"Filter..."',
											desc: "Placeholder text for the search input.",
										},
										{
											prop: "showColumnToggle",
											type: "boolean",
											def: "true",
											desc: "Show the column visibility toggle dropdown.",
										},
										{prop: "showPagination", type: "boolean", def: "true", desc: "Show pagination controls."},
										{prop: "showSelectedCount", type: "boolean", def: "true", desc: "Show selected row count."},
										{prop: "pageSize", type: "number", def: "10", desc: "Number of rows per page."},
										{
											prop: "getRowCanExpand",
											type: "(row: Row<TData>) => boolean",
											def: "—",
											desc: "Determine if a row can be expanded.",
										},
										{
											prop: "renderSubComponent",
											type: "({ row }) => ReactNode",
											def: "—",
											desc: "Render function for expanded row content.",
										},
										{
											prop: "getSubRows",
											type: "(row: TData) => TData[] | undefined",
											def: "—",
											desc: "Accessor for nested/tree child rows.",
										},
										{
											prop: "expandAllByDefault",
											type: "boolean",
											def: "false",
											desc: "Whether all rows are expanded initially.",
										},
									].map((row) => (
										<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
											<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-primary wwc:font-medium wwc:whitespace-nowrap">
												{row.prop}
											</td>
											<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.type}</td>
											<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.def}</td>
											<td className="wwc:py-3 wwc:text-muted-foreground">{row.desc}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>

				{/* Usage */}
				<div className="wwc:space-y-3">
					<h2 className="wwc:text-xl wwc:font-semibold">Usage</h2>
					<div className="wwc:border wwc:rounded-lg">
						<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
							{`import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"

// Define columns
const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge>{row.getValue("status")}</Badge>,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
  },
]

// Basic data table
<DataTable
  columns={columns}
  data={data}
  searchKey="email"
  searchPlaceholder="Filter emails..."
/>

// With expandable rows
<DataTable
  columns={columns}
  data={data}
  getRowCanExpand={() => true}
  renderSubComponent={({ row }) => <Details row={row} />}
/>

// Tree/nested rows
<DataTable
  columns={columns}
  data={treeData}
  getSubRows={(row) => row.subRows}
  getRowCanExpand={(row) => !!row.original.subRows?.length}
  expandAllByDefault={true}
/>`}
						</pre>
					</div>
				</div>
			</div>
		</div>
	);
}
