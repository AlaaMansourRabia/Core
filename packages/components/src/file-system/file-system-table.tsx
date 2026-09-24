import type {ColumnDef} from "@tanstack/react-table";

import {cn} from "@corensystem/coren-utils";

import {Badge} from "../badge";
import {DataTable} from "../data-table";
import {useFileSystem, useNodeIcon, useNodeTone, useTypeLabel} from "./context";
import {FileSystemPathText} from "./file-system-path";
import {fsFolderPath, type FileSystemNode} from "./model";

// The listing, shared by the all-files view and a project's Files section so the two cannot drift.
//
// Two targets in one row, which is the whole interaction model:
//
//   the NAME  — underlined, and the only thing that leaves this surface.
//   the ROW   — selects, and the details panel fills in. Nothing navigates.
//
// Selecting and leaving are different intentions and they get different targets. A row that navigated
// on click would make "what is this?" impossible to ask without first losing your place.

export interface FileSystemTableProps {
	rows: FileSystemNode[];
	selectedId: string | null;
	onSelect: (node: FileSystemNode) => void;
	onOpenName: (node: FileSystemNode) => void;
	/**
	 * Print each row's folder under its name. The flat listing needs it — that line is the hierarchy;
	 * inside one folder every row shares it, so it only repeats.
	 */
	showPath?: boolean;
	pageSize?: number;
}

export function FileSystemTable({
	rows,
	selectedId,
	onSelect,
	onOpenName,
	showPath = true,
	pageSize = 25,
}: FileSystemTableProps) {
	const typeLabel = useTypeLabel();

	const columns: ColumnDef<FileSystemNode>[] = [
		{
			accessorKey: "name",
			header: "Name",
			cell: ({row}) => <NameCell node={row.original} showPath={showPath} onOpenName={onOpenName} />,
		},
		{
			id: "type",
			header: "Type",
			accessorFn: (node) => (node.kind === "project" ? "project" : (node.fileType ?? "")),
			cell: ({row}) => <span className="wwc:text-[13px] wwc:text-muted-foreground">{typeLabel(row.original)}</span>,
		},
		{
			id: "tags",
			header: "Tags",
			cell: ({row}) =>
				row.original.tags?.length ? (
					<div className="wwc:flex wwc:flex-wrap wwc:gap-1">
						{row.original.tags.map((tag) => (
							<Badge key={tag} variant="secondary" className="wwc:text-[11px] wwc:font-normal">
								{tag}
							</Badge>
						))}
					</div>
				) : null,
		},
		{
			id: "updated",
			header: "Last modified",
			accessorFn: (node) => node.updatedTs,
			cell: ({row}) => (
				<span className="wwc:whitespace-nowrap wwc:text-[13px] wwc:tabular-nums wwc:text-muted-foreground">
					{row.original.updatedAt}
				</span>
			),
		},
	];

	return (
		<DataTable
			columns={columns}
			data={rows}
			getRowId={(row) => row.id}
			onRowActivate={(row) => onSelect(row.original)}
			getRowAriaLabel={(row) => `Show details for ${row.original.name}`}
			getRowClassName={(row) => (row.original.id === selectedId ? "wwc:bg-accent" : undefined)}
			flushToolbar
			// Four columns, each the point of the row — so a menu to hide them offers only ways to make
			// the surface worse.
			showColumnToggle={false}
			showPagination={rows.length > pageSize}
			pageSize={pageSize}
			recordLabel="item"
		/>
	);
}

/** One row's name cell: the tinted mark, the underlined name that leaves, and the path beneath it. */
function NameCell({
	node,
	showPath,
	onOpenName,
}: {
	node: FileSystemNode;
	showPath: boolean;
	onOpenName: (node: FileSystemNode) => void;
}) {
	const {index} = useFileSystem();
	const Icon = useNodeIcon(node);
	const tone = useNodeTone(node);
	return (
		<div className="wwc:flex wwc:min-w-0 wwc:items-start wwc:gap-2.5">
			<span
				className={cn(
					"wwc:mt-px wwc:flex wwc:h-6 wwc:w-6 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-md",
					tone,
				)}
			>
				<Icon className="wwc:h-3.5 wwc:w-3.5" />
			</span>
			<div className="wwc:flex wwc:min-w-0 wwc:flex-col">
				<button
					type="button"
					// The row selects; only the name leaves, so the name's click must not reach the row.
					onClick={(e) => {
						e.stopPropagation();
						onOpenName(node);
					}}
					className="wwc:min-w-0 wwc:truncate wwc:text-left wwc:font-medium wwc:text-foreground wwc:underline wwc:underline-offset-2 wwc:transition-colors wwc:hover:text-primary"
				>
					{node.name}
				</button>
				{/* A project sits at the top level, so it has no path to print — the row would read "/" and
				    claim a location it does not have. */}
				{showPath && node.kind !== "project" && (
					<FileSystemPathText
						path={fsFolderPath(index, node.id)}
						className="wwc:text-[11px] wwc:text-muted-foreground"
					/>
				)}
			</div>
		</div>
	);
}
