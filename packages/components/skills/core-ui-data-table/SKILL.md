---
name: core-ui-data-table
description: >
  DataTable from @core/core-ui/data-table with @tanstack/react-table
  ColumnDef. Sorting, text filtering via searchKey, pagination, column
  visibility toggle. Expandable detail rows (renderSubComponent +
  getRowCanExpand). Tree/nested rows (getSubRows + getSubRows). Collapsible
  row groups (DataTableRowGroup). Indented tree cells (DataTableTreeCell).
  Sort header button (DataTableColumnHeader). Load when building any table view.
metadata:
  type: core
  library: core
  library_version: "0.0.1"
sources:
  - "core/Core:packages/components/src/data-table.tsx"
---

# @core/core-ui — Data Table

## Setup

```tsx
import {DataTable, DataTableColumnHeader} from "@core/core-ui/data-table";
import type {ColumnDef} from "@tanstack/react-table";

interface Worker {
	id: string;
	name: string;
	trade: string;
	status: "active" | "idle";
}

const columns: ColumnDef<Worker>[] = [
	{
		accessorKey: "name",
		header: ({column}) => <DataTableColumnHeader column={column} title="Name" />,
	},
	{
		accessorKey: "trade",
		header: "Trade",
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({row}) => <span>{row.getValue("status")}</span>,
	},
];

export function WorkersTable({data}: {data: Worker[]}) {
	return <DataTable columns={columns} data={data} searchKey="name" searchPlaceholder="Filter by name..." />;
}
```

## Core Patterns

### Expandable detail panel (renderSubComponent)

```tsx
import {DataTable, DataTableDetailPanel} from "@core/core-ui/data-table";

<DataTable
	columns={columns}
	data={data}
	getRowCanExpand={() => true}
	renderSubComponent={({row}) => (
		<DataTableDetailPanel>
			<p>Worker ID: {row.original.id}</p>
			<p>Trade: {row.original.trade}</p>
		</DataTableDetailPanel>
	)}
/>;
```

### Tree / nested rows (getSubRows)

```tsx
interface Zone {
	id: string;
	name: string;
	children?: Zone[];
}

const treeColumns: ColumnDef<Zone>[] = [
	{
		accessorKey: "name",
		header: "Zone",
		cell: ({row}) => <DataTableTreeCell row={row}>{row.getValue("name")}</DataTableTreeCell>,
	},
];

<DataTable columns={treeColumns} data={zones} getSubRows={(row) => row.children} expandAllByDefault={true} />;
```

### Collapsible row groups (DataTableRowGroup)

Use inside a custom `TableBody` when rows need section grouping with
collapse/expand. `DataTableRowGroup` renders as a `<Collapsible>` wrapping
`TableRow` children:

```tsx
import {DataTableRowGroup} from "@core/core-ui/data-table";
import {TableRow, TableCell} from "@core/core-ui/table";

// Render inside a table body, not via DataTable directly
<DataTableRowGroup title="Zone A" colSpan={columns.length} defaultOpen={true}>
	{zoneARows.map((row) => (
		<TableRow key={row.id}>
			<TableCell>{row.name}</TableCell>
		</TableRow>
	))}
</DataTableRowGroup>;
```

### Controlling page size and visibility defaults

```tsx
<DataTable
	columns={columns}
	data={data}
	pageSize={25}
	showPagination={true}
	showColumnToggle={true}
	showSelectedCount={false}
/>
```

## Common Mistakes

### HIGH searchKey does not match any column accessorKey

Wrong:

```tsx
const columns: ColumnDef<Worker>[] = [{accessorKey: "name", header: "Name"}];

<DataTable columns={columns} data={data} searchKey="fullName" />;
// "fullName" doesn't match "name" — filter input renders but does nothing
```

Correct:

```tsx
<DataTable columns={columns} data={data} searchKey="name" />
// Must exactly match the accessorKey or the column's id
```

`DataTable` calls `table.getColumn(searchKey)` — if no column matches, the
column is `undefined`. The filter input renders and accepts input but
`setFilterValue` is never called. No error or warning is thrown.

Source: `packages/components/src/data-table.tsx:108`

---

### MEDIUM Using renderSubComponent without getRowCanExpand

Wrong:

```tsx
<DataTable
	columns={columns}
	data={data}
	renderSubComponent={({row}) => <Detail row={row} />}
	// getRowCanExpand missing — rows can never expand
/>
```

Correct:

```tsx
<DataTable
	columns={columns}
	data={data}
	getRowCanExpand={() => true}
	renderSubComponent={({row}) => <Detail row={row} />}
/>
```

`renderSubComponent` is only rendered when `row.getIsExpanded()` is true.
Without `getRowCanExpand` returning `true`, rows cannot be expanded — there is
no expand button and the sub-component is silently never rendered.

Source: `packages/components/src/data-table.tsx:171`

---

### MEDIUM Using both getSubRows and renderSubComponent simultaneously

Wrong:

```tsx
<DataTable
	data={zones}
	getSubRows={(row) => row.children} // tree mode
	renderSubComponent={({row}) => <Detail />} // detail panel mode
/>
```

Correct:

```tsx
// Use getSubRows for hierarchical tree data (children rendered as nested rows)
<DataTable data={zones} getSubRows={(row) => row.children} />

// Use renderSubComponent for expand-to-detail (full-width panel below the row)
<DataTable data={items} getRowCanExpand={() => true} renderSubComponent={...} />
```

Using both simultaneously causes double rendering: child rows from the tree
model AND a detail panel appear when a row is expanded, producing duplicate
content with no error.

Source: `packages/components/src/data-table.tsx:40`

---

### MEDIUM DataTableTreeCell used without getSubRows on the table

Wrong:

```tsx
// Using DataTableTreeCell but no getSubRows — row.depth is always 0
const columns: ColumnDef<Item>[] = [
	{
		accessorKey: "name",
		cell: ({row}) => <DataTableTreeCell row={row}>{row.getValue("name")}</DataTableTreeCell>,
	},
];
<DataTable columns={columns} data={flatData} />;
```

Correct:

```tsx
// DataTableTreeCell only produces meaningful indentation with nested rows
<DataTable columns={treeColumns} data={nestedData} getSubRows={(row) => row.children} />
```

`DataTableTreeCell` indents by `row.depth * 1.5rem`. With flat data and no
`getSubRows`, depth is always 0 and the cell renders a placeholder expand
button with no expand capability — the UI looks broken.

Source: `packages/components/src/data-table.tsx:350`
