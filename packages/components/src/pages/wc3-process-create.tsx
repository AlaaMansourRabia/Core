import {cn} from "@corensystem/core-utils";
import {useMemo, useState} from "react";

import {Combobox} from "../combobox";
import {FormDialog, FormDialogCaveat, FormDialogField, FormDialogNote, FormDialogRow} from "../form-dialog";
import {Input} from "../input";
import {ToggleGroup, ToggleGroupItem} from "../toggle-group";
import {WC3_OBJECT_TYPES, getObjectType} from "./wc3-ontology-data";
import {OntologyGlyph} from "./wc3-ontology-glyphs";
import {
	ProcessGlyph,
	WC3_PROCESS_ICONS,
	WC3_PROCESS_MESSAGES,
	createProcess,
	demoInstances,
	type Wc3ProcessDraft,
	type Wc3ProcessRecord,
} from "./wc3-process-shared";

/**
 * "Create process" — bind a state machine to an ontology object type.
 *
 * Net-new work: the WC3 prototype had no create, delete or rename process affordance anywhere. The
 * modal shell, the "never disable Create" required-field idiom and the reset-on-close rule are all
 * {@link FormDialog}'s, so this module carries only what is specific to a process:
 *
 *   · which object type backs it, and therefore which rows become its tokens,
 *   · which property on those rows holds the state value, pre-filled by a heuristic and freely
 *     changeable,
 *   · whether that object type is ALREADY claimed by another process — tokens are keyed by object
 *     type, not by process, so two processes on `ot_permit` share the same 28 rows.
 *
 * It hands back a DRAFT rather than a record. The caller builds the record with `createProcess()`,
 * which is what lets a host drill straight into the new process without this dialog knowing how the
 * host stores anything.
 */

/**
 * ProcessGlyph resolves an icon off a RECORD (four of the eight picker names have no glyph anywhere
 * and are patched inside the shared module, so LineageGlyph alone would render four identical boxes).
 * The picker has no record yet, so one inert probe supplies the shape and only its `icon` varies —
 * cheaper and safer than casting an object literal to Wc3Process.
 */
const ICON_PROBE = createProcess({name: "", icon: "", objectTypeId: "", statusProp: ""});

/** The property most likely to hold the state value, pre-filled and freely changeable. */
function guessStatusProp(objectTypeId: string): string {
	const ot = getObjectType(objectTypeId);
	if (!ot) return "";
	const byName = ot.properties.find((p) => p.apiName.includes("status") || p.apiName.includes("state"));
	if (byName) return byName.apiName;
	return ot.properties.find((p) => p.baseType === "string")?.apiName ?? ot.properties[0]?.apiName ?? "";
}

/**
 * "Create process" — net-new work: the prototype has no create/delete/rename process affordance
 * anywhere. The modal shell, the "never disable Create" required-field idiom and the reset-on-close
 * rule are all FormDialog's, so this file carries only what is specific to a process.
 *
 * It hands back a DRAFT; the caller builds the record with createProcess() and drills straight in.
 *
 * It takes the live array only to answer one honest question: whether the chosen object type is
 * ALREADY claimed by another process. Tokens are keyed by object type, not by process, so two
 * processes on ot_permit share the same 28 rows.
 */
export function CreateProcessDialog({
	open,
	onOpenChange,
	onCreate,
	processes,
	locationField,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreate: (draft: Wc3ProcessDraft) => void;
	processes: Wc3ProcessRecord[];
	/** The file system's "where does this go?", supplied by the shell. See Wc3FsLinkProps. */
	locationField?: React.ReactNode;
}) {
	const [name, setName] = useState("");
	const [icon, setIcon] = useState(WC3_PROCESS_ICONS[0] ?? "workflow");
	const [objectTypeId, setObjectTypeId] = useState("");
	const [statusProp, setStatusProp] = useState("");

	const nameValid = name.trim().length > 0;
	const valid = nameValid && objectTypeId.length > 0 && statusProp.length > 0;

	const objectTypeOptions = useMemo(
		() =>
			WC3_OBJECT_TYPES.map((ot) => ({
				value: ot.id,
				label: ot.displayName,
				icon: <OntologyGlyph name={ot.icon} color={ot.color} />,
			})),
		[],
	);

	// Every property, not just the string-typed ones: a status property is a string in both shipped
	// processes, but filtering would leave an object type with no string property un-creatable.
	const statusPropOptions = useMemo(() => {
		const ot = getObjectType(objectTypeId);
		if (!ot) return [];
		return ot.properties.map((p) => ({value: p.apiName, label: `${p.displayName} (${p.apiName})`}));
	}, [objectTypeId]);

	/**
	 * How many token rows the chosen object type actually has, and which process already claims them.
	 *
	 * processInstances() reads the rows off a RECORD, so a throwaway record on the chosen object type
	 * is the exact answer rather than a guess — and it goes through the shared seam rather than
	 * reaching into the fixture's instance map.
	 */
	const backing = useMemo(() => {
		if (!objectTypeId) return null;
		// The probe carries only the object type: nothing else affects which rows back it, so the
		// dependency list stays honest and complete.
		const probe = createProcess({name: "", icon: "", objectTypeId, statusProp: ""});
		const claimedBy = processes.find((p) => p.objectTypeId === objectTypeId);
		return {rows: demoInstances(probe).length, claimedBy, objectType: getObjectType(objectTypeId)};
	}, [objectTypeId, processes]);

	const reset = () => {
		setName("");
		setIcon(WC3_PROCESS_ICONS[0] ?? "workflow");
		setObjectTypeId("");
		setStatusProp("");
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Create process"
			width={560}
			valid={valid}
			hint="Name it, bind it to an object type, then create."
			error={!nameValid ? WC3_PROCESS_MESSAGES.nameRequired : "Pick a backing object type and its status property."}
			submitLabel="Create process"
			onSubmit={() => onCreate({name: name.trim(), icon, objectTypeId, statusProp})}
			onReset={reset}
		>
			{/* First, because where a thing goes is decided before what it is called is worth typing. */}
			{locationField && <FormDialogField label="Location">{locationField}</FormDialogField>}
			<FormDialogField label="Name" invalid={!nameValid}>
				{({invalid, id}) => (
					<Input
						id={id}
						value={name}
						placeholder="e.g. Lifting plan approval"
						onChange={(e) => setName(e.target.value)}
						aria-invalid={invalid}
						className={cn(invalid && "wwc:border-destructive")}
					/>
				)}
			</FormDialogField>

			<FormDialogRow>
				<FormDialogField
					label="Backing object type"
					invalid={objectTypeId.length === 0}
					hint="Its rows are the tokens of this process."
				>
					{({invalid, id, describedBy}) => (
						<Combobox
							id={id}
							aria-describedby={describedBy}
							aria-invalid={invalid}
							options={objectTypeOptions}
							value={objectTypeId}
							onValueChange={(next) => {
								setObjectTypeId(next);
								// Re-pointed, not cleared: a status property from the previous type would not
								// resolve on this one.
								setStatusProp(guessStatusProp(next));
							}}
							placeholder="Pick an object type…"
							searchPlaceholder="Search object types…"
							className={cn("wwc:w-full", invalid && "wwc:border-destructive")}
							popoverClassName="wwc:w-[260px]"
						/>
					)}
				</FormDialogField>
				<FormDialogField
					label="Status property"
					invalid={statusProp.length === 0}
					hint="Holds the current state value on a row."
				>
					{({invalid, id, describedBy}) => (
						<Combobox
							id={id}
							aria-describedby={describedBy}
							aria-invalid={invalid}
							options={statusPropOptions}
							value={statusProp}
							onValueChange={setStatusProp}
							placeholder={objectTypeId ? "Pick a property…" : "Pick an object type first"}
							searchPlaceholder="Search properties…"
							emptyMessage="That object type declares no properties."
							disabled={!objectTypeId}
							className={cn("wwc:w-full", invalid && "wwc:border-destructive")}
							popoverClassName="wwc:w-[260px]"
						/>
					)}
				</FormDialogField>
			</FormDialogRow>

			<FormDialogField label="Icon" className="wwc:space-y-2">
				{({labelId}) => (
					<ToggleGroup
						type="single"
						value={icon}
						// A group is not a labelable control, so the caption names it by id rather than `htmlFor`.
						aria-labelledby={labelId}
						// Radix emits "" when the active item is pressed again; a process always has an icon,
						// so a de-select is swallowed the same way the view-mode toggle swallows it.
						onValueChange={(next) => {
							if (next) setIcon(next);
						}}
						variant="outline"
						size="sm"
						className="wwc:flex-wrap wwc:justify-start wwc:gap-2"
					>
						{WC3_PROCESS_ICONS.map((iconName) => (
							<ToggleGroupItem key={iconName} value={iconName} aria-label={iconName} title={iconName}>
								<ProcessGlyph process={{...ICON_PROBE, icon: iconName}} />
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				)}
			</FormDialogField>

			{/* What the created process will actually be — stated here rather than discovered on the
			    canvas. It is deliberately born failing lint rule L7 on every edge; that is a checklist
			    over a working graph, not breakage. */}
			<FormDialogNote>
				It opens on a worked example, not a blank canvas: <b>Draft</b> → <b>In review</b> → <b>Active</b> →{" "}
				<b>Closed</b>, with a <b>Rejected</b> branch that can reopen. Every state is flagged custom and every edge is
				drawn dashed and <b>unbound</b> — a generic process cannot know which of your action types fires each one, so
				binding them is the one thing left to do and rule L7 lists them until it is. It carries no product provenance
				and no SLA layer.
			</FormDialogNote>
			{backing ? (
				<FormDialogCaveat>
					{backing.claimedBy
						? WC3_PROCESS_MESSAGES.sharedTokens(
								backing.objectType?.displayName ?? backing.claimedBy.objectTypeId,
								backing.claimedBy.name,
							)
						: `${backing.rows} instance row(s) back this object type. A row sits in whichever state's value matches its status field, so the example's five states will hold ${backing.rows === 0 ? "none" : "only the rows whose value already matches one of them"}.`}
				</FormDialogCaveat>
			) : null}
		</FormDialog>
	);
}

/** Re-exported so a caller types its handler without reaching into the process fixture. */
export type {Wc3ProcessDraft, Wc3ProcessRecord} from "./wc3-process-shared";
