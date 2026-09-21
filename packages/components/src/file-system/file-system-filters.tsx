import {cn} from "@core/core-utils";
import {SlidersHorizontal, X} from "lucide-react";
import {useMemo, useState} from "react";

import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "../accordion";
import {Button} from "../button";
import {Checkbox} from "../checkbox";
import {Input} from "../input";
import {ScrollArea} from "../scroll-area";
import {useFileSystem} from "./context";
import {fsProjectCounts, fsTagCounts, fsTypeCounts} from "./model";

// The facet rail.
//
// Facets, not a folder tree. The folder a file sits in is already printed under its name, so a tree
// would repeat it and cost the widest column on the surface to do so. What this list is actually asked
// — "show me the pipelines", "everything on that site", "everything tagged hse" — are questions about
// a SET of files, which one click answers here and a tree cannot answer at all.
//
// Every facet is derived from the nodes under the root, so it never offers a value that matches
// nothing, and each count is what that value would leave standing.

export type FileSystemFilterValue = {
	types: string[];
	projectIds: string[];
	tags: string[];
};

export const FILE_SYSTEM_NO_FILTERS: FileSystemFilterValue = {types: [], projectIds: [], tags: []};

export function fileSystemFilterCount(filters: FileSystemFilterValue): number {
	return filters.types.length + filters.projectIds.length + filters.tags.length;
}

export interface FileSystemFiltersProps {
	value: FileSystemFilterValue;
	onChange: (next: FileSystemFilterValue) => void;
	className?: string;
}

export function FileSystemFilters({value, onChange, className}: FileSystemFiltersProps) {
	const {index, rootId, byType} = useFileSystem();
	const types = useMemo(() => fsTypeCounts(index, rootId), [index, rootId]);
	const projects = useMemo(() => fsProjectCounts(index, rootId), [index, rootId]);
	const tags = useMemo(() => fsTagCounts(index, rootId), [index, rootId]);

	// One search box per section, unconditionally. A control that appears once a section crosses some
	// row count is a control the reader cannot rely on being there.
	const [typeQuery, setTypeQuery] = useState("");
	const [projectQuery, setProjectQuery] = useState("");
	const [tagQuery, setTagQuery] = useState("");

	const applied = fileSystemFilterCount(value);
	const toggle = <T,>(list: T[], item: T): T[] =>
		list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

	const match = (text: string, q: string) => text.toLowerCase().includes(q.trim().toLowerCase());
	const shownTypes = types.filter((t) => match(byType.get(t.type)?.label ?? t.type, typeQuery));
	const shownProjects = projects.filter((p) => match(p.label, projectQuery));
	const shownTags = tags.filter((t) => match(t.tag, tagQuery));

	return (
		<div className={cn("wwc:flex wwc:h-full wwc:flex-col wwc:bg-card", className)}>
			<div className="wwc:flex wwc:flex-shrink-0 wwc:items-center wwc:gap-2 wwc:border-b wwc:border-border wwc:px-3 wwc:py-2.5">
				<SlidersHorizontal className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-muted-foreground" />
				<span className="wwc:flex-1 wwc:text-[13px] wwc:font-medium">Filters</span>
				{applied > 0 && (
					<Button
						variant="ghost"
						size="sm"
						className="wwc:h-6 wwc:gap-1 wwc:px-1.5 wwc:text-[12px] wwc:text-muted-foreground"
						onClick={() => onChange(FILE_SYSTEM_NO_FILTERS)}
					>
						<X className="wwc:h-3 wwc:w-3" />
						Clear {applied}
					</Button>
				)}
			</div>

			{/* The scrollbar is an overlay, so the rail keeps a gutter wider than it and every right-aligned
			    thing — the counts, the section chevrons — stays inside. `fitWidth` is what makes the gutter
			    real: Radix sizes a viewport's child to its content, which would put this padding outside
			    the visible box and leave the bar sitting on the numbers. */}
			<ScrollArea fitWidth className="wwc:min-h-0 wwc:flex-1" scrollbarClassName="wwc:w-2">
				<Accordion type="multiple" defaultValue={["types", "projects", "tags"]} className="wwc:py-1 wwc:pl-1 wwc:pr-4">
					<FacetSection id="types" label="Types">
						<FacetSearch value={typeQuery} onChange={setTypeQuery} placeholder="Search types..." />
						{shownTypes.map(({type, count}) => {
							const def = byType.get(type);
							const Icon = def?.icon;
							return (
								<FacetRow
									key={type}
									label={def?.label ?? type}
									count={count}
									mark={
										Icon ? (
											<span
												className={cn(
													"wwc:flex wwc:h-5 wwc:w-5 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded",
													def?.tone,
												)}
											>
												<Icon className="wwc:h-3 wwc:w-3" />
											</span>
										) : undefined
									}
									checked={value.types.includes(type)}
									onToggle={() => onChange({...value, types: toggle(value.types, type)})}
								/>
							);
						})}
						{shownTypes.length === 0 && <FacetEmpty />}
					</FacetSection>

					<FacetSection id="projects" label="Projects">
						<FacetSearch value={projectQuery} onChange={setProjectQuery} placeholder="Search projects..." />
						{shownProjects.map(({id, label, count}) => (
							<FacetRow
								key={id}
								label={label}
								count={count}
								checked={value.projectIds.includes(id)}
								onToggle={() => onChange({...value, projectIds: toggle(value.projectIds, id)})}
							/>
						))}
						{shownProjects.length === 0 && <FacetEmpty />}
					</FacetSection>

					<FacetSection id="tags" label="Tags">
						<FacetSearch value={tagQuery} onChange={setTagQuery} placeholder="Search tags..." />
						{shownTags.map(({tag, count}) => (
							<FacetRow
								key={tag}
								label={tag}
								count={count}
								mono
								checked={value.tags.includes(tag)}
								onToggle={() => onChange({...value, tags: toggle(value.tags, tag)})}
							/>
						))}
						{shownTags.length === 0 && <FacetEmpty />}
					</FacetSection>
				</Accordion>
			</ScrollArea>
		</div>
	);
}

function FacetSection({id, label, children}: {id: string; label: string; children: React.ReactNode}) {
	return (
		<AccordionItem value={id} className="wwc:border-none">
			<AccordionTrigger className="wwc:px-2 wwc:py-2 wwc:text-[11px] wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground wwc:hover:no-underline">
				{label}
			</AccordionTrigger>
			<AccordionContent className="wwc:pb-2">
				<div className="wwc:flex wwc:flex-col wwc:gap-0.5">{children}</div>
			</AccordionContent>
		</AccordionItem>
	);
}

function FacetSearch({
	value,
	onChange,
	placeholder,
}: {
	value: string;
	onChange: (v: string) => void;
	placeholder: string;
}) {
	return (
		<Input
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			className="wwc:mb-1 wwc:h-7 wwc:text-[12px]"
		/>
	);
}

/**
 * One facet value. The whole row is the target — a checkbox alone is a 16px hit area, and the count on
 * the right is part of what the reader is aiming at.
 */
function FacetRow({
	label,
	count,
	checked,
	onToggle,
	mono,
	mark,
}: {
	label: string;
	count: number;
	checked: boolean;
	onToggle: () => void;
	mono?: boolean;
	/** Optional glyph between the checkbox and the label — the type's tinted mark. */
	mark?: React.ReactNode;
}) {
	return (
		<label
			className={cn(
				"wwc:flex wwc:cursor-pointer wwc:items-center wwc:gap-2 wwc:rounded-md wwc:px-2 wwc:py-1.5 wwc:transition-colors",
				checked ? "wwc:bg-accent" : "wwc:hover:bg-accent/50",
			)}
		>
			<Checkbox checked={checked} onCheckedChange={onToggle} className="wwc:shrink-0" />
			{mark}
			<span
				className={cn("wwc:min-w-0 wwc:flex-1 wwc:truncate wwc:text-[13px]", mono && "wwc:font-mono wwc:text-[12px]")}
			>
				{label}
			</span>
			<span className="wwc:shrink-0 wwc:text-[12px] wwc:tabular-nums wwc:text-muted-foreground">{count}</span>
		</label>
	);
}

function FacetEmpty() {
	return <p className="wwc:px-2 wwc:py-1.5 wwc:text-[12px] wwc:text-muted-foreground">No matches</p>;
}
