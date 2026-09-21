import type {ColumnDef} from "@tanstack/react-table";

import {ArrowLeft, Folder, Plus} from "lucide-react";
import {useMemo, useState} from "react";

import {Badge} from "../badge";
import {Button} from "../button";
import {Card, CardContent, CardHeader, CardTitle} from "../card";
import {ConfirmDialog} from "../confirm-dialog";
import {DataTable, DataTableColumnHeader} from "../data-table";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "../dropdown-menu";
import {Empty} from "../empty";
import {Input} from "../input";
import {Label} from "../label";
import {
	WC3_OBJECT_TYPES,
	WC3_TYPE_GROUPS,
	type Wc3ObjectType,
	type Wc3Status,
	type Wc3TypeGroup,
	getObjectType,
	instanceCount,
} from "./wc3-ontology-data";
import {OntologyGlyph} from "./wc3-ontology-glyphs";

// The type-group detail surface, ported from the prototype's GroupDetail: rename, membership and a
// danger zone. Edits apply immediately through `onChange` — a group carries no schema, so there is
// nothing to stage and no dirty/save bar (same model as the object-type drill-in).
//
// Membership is genuinely two-sided in the store (an object type lists its groups, a group lists its
// members). This surface owns only the group side, so "Also in" is derived from the other groups'
// member arrays rather than from ot.groups; the two agree as long as the host writes both, and this
// keeps the page consistent without lifting shared ontology state.

const STATUS_VARIANT: Record<Wc3Status, "successSoft" | "warningSoft" | "dangerSoft" | "infoSoft"> = {
	Active: "successSoft",
	Endorsed: "infoSoft",
	Experimental: "warningSoft",
	Deprecated: "dangerSoft",
};

/** One row of the Members table: the member type plus the other groups holding it. */
type MemberRow = {type: Wc3ObjectType; alsoIn: Wc3TypeGroup[]};

export interface TypeGroupDetailPageProps {
	/** The group being viewed. `null` renders the not-found state, as in the prototype's route guard. */
	group: Wc3TypeGroup | null;
	/** Every group in the store, for the "Also in" column. Defaults to the fixture. */
	groups?: Wc3TypeGroup[];
	/** Every object type, for the "+ Add object type" menu. Defaults to the fixture. */
	objectTypes?: Wc3ObjectType[];
	onBack: () => void;
	/** Rename, description and membership all commit here immediately. */
	onChange: (next: Wc3TypeGroup) => void;
	/** Danger zone renders only when supplied. */
	onDelete?: () => void;
	/** Member row click — the object-type drill-in. Rows are inert when omitted. */
	onOpenMember?: (objectTypeId: string) => void;
	/** Header action "Use as filter in Object types". Button hidden when omitted. */
	onUseAsFilter?: () => void;
}

/** The add-member menu, shared by the card header and the empty-group state. */
function AddMemberMenu({
	addable,
	onAdd,
	variant = "default",
}: {
	addable: Wc3ObjectType[];
	onAdd: (id: string) => void;
	variant?: "default" | "outline";
}) {
	if (addable.length === 0) return null;
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button size="sm" variant={variant}>
					<Plus className="wwc:h-3.5 wwc:w-3.5" />
					Add object type
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="wwc:max-h-80 wwc:overflow-auto">
				{addable.map((o) => (
					<DropdownMenuItem key={o.id} onSelect={() => onAdd(o.id)} className="wwc:gap-2">
						<OntologyGlyph name={o.icon} color={o.color} />
						{o.displayName}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/**
 * Full-page drill-in for one type group. No section nav: three short sections (identity, members,
 * danger zone) stack down the page — the same call LinkTypeDetailPage makes.
 */
export function TypeGroupDetailPage({
	group,
	groups = WC3_TYPE_GROUPS,
	objectTypes = WC3_OBJECT_TYPES,
	onBack,
	onChange,
	onDelete,
	onOpenMember,
	onUseAsFilter,
}: TypeGroupDetailPageProps) {
	const [confirmDelete, setConfirmDelete] = useState(false);

	const members: MemberRow[] = useMemo(() => {
		if (!group) return [];
		return group.members
			.map((id) => getObjectType(id) ?? objectTypes.find((o) => o.id === id))
			.filter((o): o is Wc3ObjectType => Boolean(o))
			.map((type) => ({
				type,
				alsoIn: groups.filter((g) => g.id !== group.id && g.members.includes(type.id)),
			}));
	}, [group, groups, objectTypes]);

	const addable = useMemo(
		() => (group ? objectTypes.filter((o) => !group.members.includes(o.id)) : []),
		[group, objectTypes],
	);

	const columns: ColumnDef<MemberRow, unknown>[] = useMemo(
		() => [
			{
				id: "label",
				accessorFn: (r) => r.type.displayName,
				header: ({column}) => <DataTableColumnHeader column={column} title="Object type" />,
				cell: ({row}) => (
					<span className="wwc:flex wwc:items-center wwc:gap-2 wwc:whitespace-nowrap wwc:font-medium">
						<OntologyGlyph name={row.original.type.icon} color={row.original.type.color} />
						{onOpenMember ? (
							<button
								type="button"
								onClick={() => onOpenMember(row.original.type.id)}
								className="wwc:text-left wwc:underline wwc:underline-offset-2 wwc:transition-colors wwc:hover:text-primary"
							>
								{row.original.type.displayName}
							</button>
						) : (
							row.original.type.displayName
						)}
					</span>
				),
			},
			{
				id: "status",
				accessorFn: (r) => r.type.status,
				header: ({column}) => <DataTableColumnHeader column={column} title="Status" />,
				cell: ({row}) => <Badge variant={STATUS_VARIANT[row.original.type.status]}>{row.original.type.status}</Badge>,
			},
			{
				id: "alsoIn",
				header: "Also in",
				cell: ({row}) =>
					row.original.alsoIn.length === 0 ? (
						<span className="wwc:text-muted-foreground">—</span>
					) : (
						<span className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1">
							{row.original.alsoIn.map((g) => (
								<Badge key={g.id} variant="neutralSoft" className="wwc:font-normal">
									{g.name}
								</Badge>
							))}
						</span>
					),
			},
			{
				id: "instances",
				accessorFn: (r) => instanceCount(r.type.id),
				header: ({column}) => <DataTableColumnHeader column={column} title="Instances" />,
				cell: ({row}) => (
					<span className="wwc:block wwc:text-right wwc:tabular-nums">{instanceCount(row.original.type.id)}</span>
				),
			},
			{
				id: "actions",
				header: "",
				// Action cells must size to their content, or the default max-w-0 truncation clips them.
				meta: {cellClassName: "wwc:w-px wwc:max-w-none wwc:whitespace-nowrap"},
				cell: ({row}) => (
					<Button
						variant="ghost"
						size="sm"
						className="wwc:text-destructive wwc:hover:text-destructive"
						onClick={(e) => {
							e.stopPropagation();
							if (group) onChange({...group, members: group.members.filter((m) => m !== row.original.type.id)});
						}}
					>
						Remove
					</Button>
				),
			},
		],
		[group, onChange, onOpenMember],
	);

	if (!group) {
		return (
			<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col">
				<div className="wwc:flex wwc:min-h-12 wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-3 wwc:border-b wwc:border-border wwc:bg-card wwc:px-3">
					<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-2.5">
						<Button variant="ghost" size="sm" className="wwc:gap-1.5" onClick={onBack}>
							<ArrowLeft className="wwc:h-4 wwc:w-4" />
							Back
						</Button>
						<div className="wwc:h-5 wwc:w-px wwc:shrink-0 wwc:bg-border" />
						<Folder className="wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-muted-foreground" />
						<h1 className="wwc:truncate wwc:text-sm wwc:font-semibold">Group not found</h1>
					</div>
				</div>
				<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
					<Empty
						icon={<Folder className="wwc:h-6 wwc:w-6" />}
						title="Group not found"
						description="It may have been deleted."
						action={
							<Button size="sm" onClick={onBack}>
								Back to groups
							</Button>
						}
					/>
				</div>
			</div>
		);
	}

	const addMember = (id: string) => onChange({...group, members: [...group.members, id]});

	return (
		<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col">
			{/* Fixed bar sized to PageContentHeader (compact -> min-h-12, px-3), as on every drill-in. */}
			<div className="wwc:flex wwc:min-h-12 wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-3 wwc:border-b wwc:border-border wwc:bg-card wwc:px-3">
				<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-2.5">
					<Button variant="ghost" size="sm" className="wwc:gap-1.5" onClick={onBack}>
						<ArrowLeft className="wwc:h-4 wwc:w-4" />
						Back
					</Button>
					<div className="wwc:h-5 wwc:w-px wwc:shrink-0 wwc:bg-border" />
					<Folder className="wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-muted-foreground" />
					<h1 className="wwc:truncate wwc:text-sm wwc:font-semibold">{group.name}</h1>
					<Badge variant="neutralSoft" className="wwc:font-normal">
						{group.members.length} member type{group.members.length === 1 ? "" : "s"}
					</Badge>
					<span className="wwc:hidden wwc:truncate wwc:font-mono wwc:text-[11px] wwc:text-muted-foreground wwc:lg:inline">
						{group.rid}
					</span>
				</div>
				{onUseAsFilter && (
					<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2">
						<Button variant="outline" size="sm" onClick={onUseAsFilter}>
							Use as filter in Object types →
						</Button>
					</div>
				)}
			</div>

			<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
				<div className="wwc:w-full wwc:space-y-4 wwc:p-6">
					<Card>
						<CardHeader>
							<CardTitle className="wwc:text-sm">Identity</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="wwc:grid wwc:gap-4 wwc:md:grid-cols-2">
								<div className="wwc:space-y-1.5">
									<Label htmlFor="grd-name">Name</Label>
									<Input
										id="grd-name"
										value={group.name}
										onChange={(e) => onChange({...group, name: e.target.value})}
									/>
								</div>
								<div className="wwc:space-y-1.5">
									<Label htmlFor="grd-desc">Description</Label>
									<Input
										id="grd-desc"
										value={group.description}
										onChange={(e) => onChange({...group, description: e.target.value})}
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Empty renders unframed on purpose — a Card around it would read as a double frame. */}
					{members.length === 0 ? (
						<div className="wwc:space-y-2">
							<h3 className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2 wwc:text-sm wwc:font-semibold">
								Members (0)
								<span className="wwc:text-xs wwc:font-normal wwc:text-muted-foreground">
									membership is many-to-many
								</span>
							</h3>
							<Empty
								icon={<Folder className="wwc:h-6 wwc:w-6" />}
								title="Empty group"
								description="This group has no members, so it filters nothing anywhere in the app."
								action={<AddMemberMenu addable={addable} onAdd={addMember} />}
							/>
						</div>
					) : (
						<Card>
							<CardHeader className="wwc:flex-row wwc:items-center wwc:justify-between wwc:space-y-0">
								<CardTitle className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2 wwc:text-sm">
									Members ({members.length})
									<span className="wwc:text-xs wwc:font-normal wwc:text-muted-foreground">
										membership is many-to-many
									</span>
								</CardTitle>
								<AddMemberMenu addable={addable} onAdd={addMember} />
							</CardHeader>
							<CardContent>
								<DataTable
									columns={columns}
									data={members}
									searchKey="label"
									searchPlaceholder="Filter members…"
									recordLabel="member type"
									// The largest group in the fixture holds eight rows — a pager would be furniture.
									showPagination={members.length > 10}
									pageSize={10}
									getRowId={(r) => r.type.id}
									emptyMessage="No member types match your search."
								/>
							</CardContent>
						</Card>
					)}

					{onDelete && (
						<Card>
							<CardHeader>
								<CardTitle className="wwc:text-sm wwc:text-destructive">Danger zone</CardTitle>
							</CardHeader>
							<CardContent className="wwc:space-y-3">
								<p className="wwc:text-sm wwc:text-muted-foreground">Member object types are untouched.</p>
								<Button
									variant="outline"
									size="sm"
									className="wwc:border-destructive/40 wwc:text-destructive"
									onClick={() => setConfirmDelete(true)}
								>
									Delete…
								</Button>
							</CardContent>
						</Card>
					)}
				</div>
			</div>

			<ConfirmDialog
				open={confirmDelete}
				onOpenChange={setConfirmDelete}
				destructive
				title="Delete group"
				description={
					<>
						Delete <span className="wwc:font-medium wwc:text-foreground">{group.name}</span>? Member types are
						untouched.
					</>
				}
				confirmLabel="Delete"
				onConfirm={() => {
					setConfirmDelete(false);
					onDelete?.();
				}}
			/>
		</div>
	);
}
