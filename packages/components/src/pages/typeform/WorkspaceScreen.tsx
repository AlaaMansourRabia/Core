// Workspace / forms dashboard — the entry point. Lists the user's forms (Wakecore DataTable with
// sortable columns) and starts a new one.
import type {ColumnDef} from "@tanstack/react-table";

import {FileText, MoreHorizontal, Plus, Sparkles} from "lucide-react";
import {useState} from "react";

import {Badge} from "../../badge";
import {Button} from "../../button";
import {Card, CardContent} from "../../card";
import {DataTable, DataTableColumnHeader} from "../../data-table";
import {Separator} from "../../separator";

export interface SavedFormMeta {
	id: string;
	title: string;
	questionCount: number;
	responses: number;
	updated: string;
}

export interface WorkspaceScreenProps {
	forms: SavedFormMeta[];
	onCreate: () => void;
	onOpen: (id: string) => void;
	/** Heading shown above the list (default "My workspace"). */
	title?: string;
	/** Show the AI template-suggestion cards (default true). */
	showSuggestions?: boolean;
}

const TEMPLATE_SUGGESTIONS = [
	"Usability test — evaluate ease of use through specific tasks.",
	"Satisfaction survey — measure overall satisfaction with the product.",
	"Open feedback — short, open-ended questions on the experience.",
];

const COLUMNS: ColumnDef<SavedFormMeta>[] = [
	{
		accessorKey: "title",
		header: ({column}) => <DataTableColumnHeader column={column} title="Name" />,
		cell: ({row}) => (
			<span className="wwc:flex wwc:items-center wwc:gap-2 wwc:font-medium">
				<FileText className="wwc:size-4 wwc:shrink-0 wwc:text-muted-foreground" />
				{row.original.title}
			</span>
		),
	},
	{
		accessorKey: "questionCount",
		header: ({column}) => <DataTableColumnHeader column={column} title="Questions" />,
		cell: ({row}) => <span className="wwc:tabular-nums wwc:text-muted-foreground">{row.original.questionCount}</span>,
	},
	{
		accessorKey: "responses",
		header: ({column}) => <DataTableColumnHeader column={column} title="Responses" />,
		cell: ({row}) => <span className="wwc:tabular-nums wwc:text-muted-foreground">{row.original.responses}</span>,
	},
	{
		accessorKey: "updated",
		header: ({column}) => <DataTableColumnHeader column={column} title="Updated" />,
		cell: ({row}) => <span className="wwc:text-muted-foreground">{row.original.updated}</span>,
	},
	{
		id: "actions",
		enableHiding: false,
		cell: () => (
			<Button icon size="sm" variant="ghost" aria-label="Form options" onClick={(e) => e.stopPropagation()}>
				<MoreHorizontal className="wwc:size-3.5" />
			</Button>
		),
	},
];

export function WorkspaceScreen({
	forms,
	onCreate,
	onOpen,
	title = "My workspace",
	showSuggestions = true,
}: WorkspaceScreenProps) {
	const [dismissed, setDismissed] = useState<number[]>([]);
	const suggestions = showSuggestions
		? TEMPLATE_SUGGESTIONS.map((s, i) => ({s, i})).filter(({i}) => !dismissed.includes(i))
		: [];

	return (
		<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:overflow-auto wwc:bg-background">
			{/* Heading */}
			<div className="wwc:flex wwc:flex-row wwc:flex-wrap wwc:items-center wwc:gap-3 wwc:px-8 wwc:pt-7 wwc:pb-3">
				<h1 className="wwc:text-xl wwc:font-semibold wwc:tracking-tight wwc:text-foreground">{title}</h1>
				<Badge variant="secondary" className="wwc:tabular-nums">
					{forms.length} {forms.length === 1 ? "form" : "forms"}
				</Badge>
			</div>

			{/* AI template suggestions */}
			{suggestions.length > 0 ? (
				<div className="wwc:px-8 wwc:pb-4">
					<div className="wwc:mb-2 wwc:flex wwc:items-center wwc:gap-2 wwc:text-xs wwc:font-medium wwc:text-muted-foreground">
						<Sparkles className="wwc:size-3.5" />
						Start faster with a template
					</div>
					<div className="wwc:grid wwc:grid-cols-1 wwc:gap-3 wwc:md:grid-cols-3">
						{suggestions.map(({s, i}) => (
							<Card key={i} className="wwc:border wwc:border-border wwc:shadow-none">
								<CardContent className="wwc:flex wwc:flex-col wwc:gap-3 wwc:p-4">
									<p className="wwc:text-sm wwc:text-foreground">{s}</p>
									<div className="wwc:flex wwc:items-center wwc:gap-2">
										<Button size="sm" variant="outline" onClick={onCreate}>
											Use this form
										</Button>
										<Button
											size="sm"
											variant="ghost"
											className="wwc:text-muted-foreground"
											onClick={() => setDismissed((d) => [...d, i])}
										>
											Dismiss
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
					<Separator className="wwc:mt-5" />
				</div>
			) : null}

			{/* Forms table */}
			<div className="wwc:px-8 wwc:pb-6">
				<DataTable
					columns={COLUMNS}
					data={forms}
					searchKey="title"
					searchPlaceholder="Search forms…"
					showColumnToggle
					recordLabel="form"
					onRowActivate={(row) => onOpen(row.original.id)}
					getRowAriaLabel={(row) => `Open ${row.original.title}`}
					emptyMessage="No forms yet. Create your first form to get started."
					toolbarExtra={
						<Button onClick={onCreate}>
							<Plus className="wwc:h-4 wwc:w-4" />
							Create a new form
						</Button>
					}
				/>
			</div>
		</div>
	);
}
