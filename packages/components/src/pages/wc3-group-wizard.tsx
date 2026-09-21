import {cn} from "@wakecap/core-utils";
import {useState} from "react";

import {Button} from "../button";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "../dialog";
import {Input} from "../input";
import {Textarea} from "../textarea";
import {ToggleGroup, ToggleGroupItem} from "../toggle-group";

// The "New object type group" dialog. Lifted from the local dialog in the since-removed Workforce
// fork of this surface (same validation, same reset-on-close, same footer) with one change: the
// members picker is driven by an optional `objectTypes` prop. Omit it and the Members block is not
// rendered at all — which is exactly what the WC3 prototype's GrCreateModal is: name + description,
// nothing else. GroupsView (wc3-ontology-views.tsx) passes that list scoped to the surface it is
// mounted in, so a product only ever offers the object types it owns.

const SEGMENT_ON =
	"wwc:data-[state=on]:border-primary wwc:data-[state=on]:bg-primary/10 wwc:data-[state=on]:text-primary";

function FieldLabel({children}: {children: React.ReactNode}) {
	return (
		<span className="wwc:text-xs wwc:font-semibold wwc:tracking-wide wwc:text-muted-foreground wwc:uppercase">
			{children}
		</span>
	);
}

export interface NewTypeGroupDraft {
	name: string;
	description: string;
	/** Values of the picked `objectTypes` options; always empty when no picker was offered. */
	members: string[];
}

export interface NewTypeGroupOption {
	value: string;
	label: string;
	/** Rendered before the label in the picker — an object type's own glyph, where the host has one. */
	glyph?: React.ReactNode;
}

export interface NewTypeGroupDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Dialog heading. Defaults to the workforce wording. */
	title?: string;
	/** Placeholder for the name field, e.g. "e.g. Commercial & Cost". */
	namePlaceholder?: string;
	/** Members to offer at creation time. Omitted -> no Members block (prototype parity for WC3). */
	objectTypes?: NewTypeGroupOption[];
	onCreate: (draft: NewTypeGroupDraft) => void;
}

/** Create dialog for a type group: a required name, a description, and an optional members picker. */
export function NewTypeGroupDialog({
	open,
	onOpenChange,
	title = "New object type group",
	namePlaceholder,
	objectTypes,
	onCreate,
}: NewTypeGroupDialogProps) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [members, setMembers] = useState<string[]>([]);
	const [attempted, setAttempted] = useState(false);

	const valid = name.trim().length > 0;
	const nameError = attempted && !valid;

	const reset = () => {
		setName("");
		setDescription("");
		setMembers([]);
		setAttempted(false);
	};

	const create = () => {
		// Create is never disabled — the error appears once the user has actually tried.
		if (!valid) {
			setAttempted(true);
			return;
		}
		onCreate({name: name.trim(), description: description.trim(), members});
		reset();
		onOpenChange(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				if (!o) reset();
				onOpenChange(o);
			}}
		>
			<DialogContent className="wwc:flex wwc:max-h-[92vh] wwc:w-[calc(100vw-2rem)] wwc:max-w-2xl wwc:flex-col wwc:gap-0 wwc:overflow-hidden wwc:p-0">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<div className="wwc:min-h-0 wwc:flex-1 wwc:space-y-5 wwc:overflow-y-auto wwc:px-6 wwc:py-5">
					<div className="wwc:space-y-1.5">
						<FieldLabel>Group name</FieldLabel>
						<Input
							value={name}
							placeholder={namePlaceholder}
							onChange={(e) => setName(e.target.value)}
							aria-invalid={nameError}
							className={cn(nameError && "wwc:border-destructive")}
						/>
					</div>
					<div className="wwc:space-y-1.5">
						<FieldLabel>Description</FieldLabel>
						<Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
					</div>
					{objectTypes && objectTypes.length > 0 && (
						<div className="wwc:space-y-2">
							<FieldLabel>Members</FieldLabel>
							<ToggleGroup
								type="multiple"
								value={members}
								onValueChange={setMembers}
								variant="outline"
								size="sm"
								className="wwc:flex-wrap wwc:justify-start wwc:gap-2"
							>
								{objectTypes.map((o) => (
									<ToggleGroupItem key={o.value} value={o.value} className={cn("wwc:rounded-full", SEGMENT_ON)}>
										{o.glyph}
										{o.label}
									</ToggleGroupItem>
								))}
							</ToggleGroup>
						</div>
					)}
				</div>
				<DialogFooter>
					<span className="wwc:text-sm">
						{nameError ? (
							<span className="wwc:text-destructive">Name required.</span>
						) : (
							<span className="wwc:text-muted-foreground">Name it, then create.</span>
						)}
					</span>
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button onClick={create}>Create group</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
