import {cn} from "@core/core-utils";
import {ChevronDown, ChevronUp, Plus, X} from "lucide-react";

import {Button} from "../button";
import {Card, CardContent, CardHeader, CardTitle} from "../card";
import {Checkbox} from "../checkbox";
import {Combobox} from "../combobox";
import {Input} from "../input";
import {Label} from "../label";
import {Switch} from "../switch";

// Permit policy — the rules a permit issued FROM a template inherits, as opposed to the graph it
// moves through. Six independent cards: validity, extensions, receiver handover, required
// attachments, daily sign-off and geofence.
//
// It is its own module rather than another section inside state-machine.tsx because none of it
// touches the process graph: the builder authors states and transitions, and this authors the
// settings those permits carry. Splitting them keeps the builder's mutation helpers in one file and
// this one free of them.
//
// EVERY option list below is a FIXTURE. The receiver-eligibility and handover vocabularies, and the
// sign-off role list, are the ones the reference screen offers; nothing in this repo models them, so
// they are declared here where they can be swapped for the real ones in a single place.

// ─── Data model ──────────────────────────────────────────────────────────────

/** One attachment slot a requester must, or may, fill. */
export type Wc3PermitAttachmentSlot = {
	id: string;
	/** Stable machine key — what the stored file is filed under. */
	key: string;
	label: string;
	/** Accepted extension, e.g. ".pdf". One value, as the reference screen offers. */
	accept: string;
	required: boolean;
};

export type Wc3PermitPolicy = {
	validity: {defaultHours: number | null; maxHours: number | null};
	extension: {allowed: boolean; maxTotalHours: number | null; sameDayOnly: boolean; requireSignature: boolean};
	receiver: {eligibility: string; handover: string};
	attachments: Wc3PermitAttachmentSlot[];
	/** Slots carry an id so a reorder moves the ROW, not just the text inside a reused input. */
	dailySignOff: {required: boolean; roles: string[]; slots: {id: string; label: string}[]};
	/** Null inherits the project default for this permit type. */
	geofence: {radiusMeters: number | null};
};

export const WC3_PERMIT_POLICY_INITIAL: Wc3PermitPolicy = {
	validity: {defaultHours: null, maxHours: null},
	extension: {allowed: true, maxTotalHours: 8, sameDayOnly: true, requireSignature: false},
	receiver: {eligibility: "project_active", handover: "anyone_on_project"},
	attachments: [],
	dailySignOff: {required: true, roles: [], slots: []},
	geofence: {radiusMeters: null},
};

/**
 * Who a permit from this template may be handed to.
 *
 * Each option carries the behaviour it produces TODAY, shown under the picker. A policy control with
 * no statement of its effect is a setting the author has to test to understand.
 */
const RECEIVER_ELIGIBILITY: {value: string; label: string; note: string}[] = [
	{
		value: "project_active",
		label: "Anyone active on the project",
		note: "Today's behaviour: every active worker on the project is offered.",
	},
	{
		value: "zone_active",
		label: "Workers active in the permit's zone",
		note: "Only workers currently inside the permit's zone are offered.",
	},
	{
		value: "named_only",
		label: "Named receivers only",
		note: "Only the receivers named on the permit are offered; nobody else can be picked.",
	},
];

const HANDOVER_MODE: {value: string; label: string; note: string}[] = [
	{
		value: "anyone_on_project",
		label: "Change receiver — anyone on the project",
		note: "Today's behaviour: any active worker on the project may be assigned. A receiver far from another of their permits still raises the existing proximity warning.",
	},
	{
		value: "same_crew",
		label: "Change receiver — same crew only",
		note: "Only members of the current receiver's crew may be assigned.",
	},
	{
		value: "disabled",
		label: "Handover disabled",
		note: "The receiver is fixed once the permit is issued.",
	},
];

/** The sign-off roles the reference screen offers, verbatim. */
export const WC3_PERMIT_SIGNOFF_ROLES: string[] = [
	"Area Safety - Samsung HSE",
	"Area Safety Manager",
	"Area Safety Manager Subcontractor",
	"Permit Issuer",
	"Permit Receiver",
	"PTW Coordinator",
];

// Slot ids only have to be unique within one policy, and they never leave the session.
let slotSeq = 0;
const nextSlotId = () => `slot_${++slotSeq}`;

// ─── Small fields ────────────────────────────────────────────────────────────

/**
 * A number field whose empty value is NULL, not zero.
 *
 * "No maximum" and "a maximum of zero hours" are opposite policies, and an input that quietly turns
 * a cleared box into 0 would make the second one unreachable.
 */
function NumberField({
	id,
	label,
	value,
	placeholder,
	onChange,
	className,
}: {
	id: string;
	label?: string;
	value: number | null;
	placeholder?: string;
	onChange: (next: number | null) => void;
	className?: string;
}) {
	return (
		<div className={cn("wwc:space-y-1.5", className)}>
			{label && <Label htmlFor={id}>{label}</Label>}
			<Input
				id={id}
				inputMode="numeric"
				value={value ?? ""}
				placeholder={placeholder}
				onChange={(event) => {
					const raw = event.target.value.trim();
					if (raw === "") return onChange(null);
					const parsed = Number(raw);
					// Refuse silently rather than committing NaN: a non-numeric keystroke leaves the previous
					// value standing, which is what an author expects from a numeric box.
					if (Number.isFinite(parsed) && parsed >= 0) onChange(parsed);
				}}
			/>
		</div>
	);
}

function ToggleRow({
	id,
	label,
	checked,
	onCheckedChange,
}: {
	id: string;
	label: string;
	checked: boolean;
	onCheckedChange: (next: boolean) => void;
}) {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2">
			<Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
			<Label htmlFor={id} className="wwc:font-normal">
				{label}
			</Label>
		</div>
	);
}

function PolicyCard({title, description, children}: {title: string; description: string; children: React.ReactNode}) {
	return (
		<Card className="wwc:flex wwc:flex-col">
			<CardHeader className="wwc:space-y-1 wwc:p-4 wwc:pb-3">
				<CardTitle className="wwc:text-sm">{title}</CardTitle>
				<p className="wwc:text-xs wwc:text-muted-foreground">{description}</p>
			</CardHeader>
			<CardContent className="wwc:space-y-3 wwc:p-4 wwc:pt-0">{children}</CardContent>
		</Card>
	);
}

// ─── The section ─────────────────────────────────────────────────────────────

/**
 * The Policy section of the work-permit builder.
 *
 * Fully controlled: every edit hands back a whole new policy, so the host owns persistence exactly
 * as it does for the rest of {@link Wc3PermitMeta}. Nothing here is derived from the graph.
 */
export function PermitPolicySection({
	policy,
	onChange,
}: {
	policy: Wc3PermitPolicy;
	onChange: (next: Wc3PermitPolicy) => void;
}) {
	const patch = <K extends keyof Wc3PermitPolicy>(key: K, value: Wc3PermitPolicy[K]) =>
		onChange({...policy, [key]: value});

	const eligibilityNote = RECEIVER_ELIGIBILITY.find((o) => o.value === policy.receiver.eligibility)?.note;
	const handoverNote = HANDOVER_MODE.find((o) => o.value === policy.receiver.handover)?.note;

	const setSlot = (id: string, label: string) =>
		patch("dailySignOff", {
			...policy.dailySignOff,
			slots: policy.dailySignOff.slots.map((slot) => (slot.id === id ? {...slot, label} : slot)),
		});

	const moveSlot = (index: number, by: number) => {
		const slots = [...policy.dailySignOff.slots];
		const target = index + by;
		if (target < 0 || target >= slots.length) return;
		[slots[index], slots[target]] = [slots[target], slots[index]];
		patch("dailySignOff", {...policy.dailySignOff, slots});
	};

	return (
		<div className="wwc:grid wwc:gap-4 wwc:xl:grid-cols-2">
			<PolicyCard title="Validity" description="How long a permit issued from this template is valid.">
				<div className="wwc:grid wwc:grid-cols-2 wwc:gap-3">
					<NumberField
						id="policy-validity-default"
						label="Default validity (hours)"
						value={policy.validity.defaultHours}
						onChange={(defaultHours) => patch("validity", {...policy.validity, defaultHours})}
					/>
					<NumberField
						id="policy-validity-max"
						label="Max validity (hours)"
						value={policy.validity.maxHours}
						onChange={(maxHours) => patch("validity", {...policy.validity, maxHours})}
					/>
				</div>
			</PolicyCard>

			<PolicyCard title="Extension policy" description="Whether and how far an issued permit can be extended.">
				<ToggleRow
					id="policy-extension-allowed"
					label="Extensions allowed"
					checked={policy.extension.allowed}
					onCheckedChange={(allowed) => patch("extension", {...policy.extension, allowed})}
				/>
				{/* The three settings below only mean anything if extensions are allowed at all, so they are
				    hidden rather than disabled — a disabled row still reads as a policy that is in force. */}
				{policy.extension.allowed && (
					<div className="wwc:flex wwc:flex-wrap wwc:items-end wwc:gap-4">
						<NumberField
							id="policy-extension-max"
							label="Max total (hours)"
							value={policy.extension.maxTotalHours}
							className="wwc:w-32"
							onChange={(maxTotalHours) => patch("extension", {...policy.extension, maxTotalHours})}
						/>
						<ToggleRow
							id="policy-extension-sameday"
							label="Same-day only"
							checked={policy.extension.sameDayOnly}
							onCheckedChange={(sameDayOnly) => patch("extension", {...policy.extension, sameDayOnly})}
						/>
						<ToggleRow
							id="policy-extension-signature"
							label="Require a signature to extend"
							checked={policy.extension.requireSignature}
							onCheckedChange={(requireSignature) => patch("extension", {...policy.extension, requireSignature})}
						/>
					</div>
				)}
			</PolicyCard>

			<PolicyCard title="Receiver policy" description="How this permit's receiver may be handed to someone else.">
				<div className="wwc:space-y-1.5">
					<Label>Who may be a receiver</Label>
					<Combobox
						options={RECEIVER_ELIGIBILITY.map(({value, label}) => ({value, label}))}
						value={policy.receiver.eligibility}
						onValueChange={(eligibility) => patch("receiver", {...policy.receiver, eligibility})}
						className="wwc:w-full"
					/>
					{eligibilityNote && <p className="wwc:text-[10.5px] wwc:text-muted-foreground">{eligibilityNote}</p>}
				</div>

				<div className="wwc:space-y-1.5">
					<Label>Handover mode</Label>
					<Combobox
						options={HANDOVER_MODE.map(({value, label}) => ({value, label}))}
						value={policy.receiver.handover}
						onValueChange={(handover) => patch("receiver", {...policy.receiver, handover})}
						className="wwc:w-full"
					/>
					{handoverNote && <p className="wwc:text-[10.5px] wwc:text-muted-foreground">{handoverNote}</p>}
				</div>
			</PolicyCard>

			<PolicyCard title="Required attachments" description="Attachment slots the permit requester must (or may) fill.">
				{policy.attachments.length === 0 ? (
					<p className="wwc:text-xs wwc:text-muted-foreground">No attachment slots. Permits ask for no files.</p>
				) : (
					<div className="wwc:space-y-2">
						{policy.attachments.map((slot, index) => (
							<div key={slot.id} className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
								<Input
									value={slot.key}
									placeholder="key"
									aria-label={`Attachment ${index + 1} key`}
									className="wwc:w-28 wwc:font-mono wwc:text-xs"
									onChange={(event) =>
										patch(
											"attachments",
											policy.attachments.map((a) => (a.id === slot.id ? {...a, key: event.target.value} : a)),
										)
									}
								/>
								<Input
									value={slot.label}
									placeholder="Label"
									aria-label={`Attachment ${index + 1} label`}
									className="wwc:min-w-0 wwc:flex-1"
									onChange={(event) =>
										patch(
											"attachments",
											policy.attachments.map((a) => (a.id === slot.id ? {...a, label: event.target.value} : a)),
										)
									}
								/>
								<Input
									value={slot.accept}
									placeholder=".pdf"
									aria-label={`Attachment ${index + 1} accepted type`}
									className="wwc:w-20 wwc:font-mono wwc:text-xs"
									onChange={(event) =>
										patch(
											"attachments",
											policy.attachments.map((a) => (a.id === slot.id ? {...a, accept: event.target.value} : a)),
										)
									}
								/>
								<ToggleRow
									id={`policy-attachment-${slot.id}`}
									label="Required"
									checked={slot.required}
									onCheckedChange={(required) =>
										patch(
											"attachments",
											policy.attachments.map((a) => (a.id === slot.id ? {...a, required} : a)),
										)
									}
								/>
								<Button
									variant="ghost"
									icon
									aria-label={`Remove attachment ${index + 1}`}
									className="wwc:h-7 wwc:w-7 wwc:text-muted-foreground"
									onClick={() =>
										patch(
											"attachments",
											policy.attachments.filter((a) => a.id !== slot.id),
										)
									}
								>
									<X className="wwc:h-3.5 wwc:w-3.5" />
								</Button>
							</div>
						))}
					</div>
				)}

				<Button
					variant="outline"
					size="sm"
					className="wwc:gap-1.5"
					onClick={() =>
						patch("attachments", [
							...policy.attachments,
							{id: nextSlotId(), key: "", label: "", accept: ".pdf", required: false},
						])
					}
				>
					<Plus className="wwc:h-3.5 wwc:w-3.5" />
					Add slot
				</Button>
			</PolicyCard>

			<PolicyCard
				title="Daily sign-off"
				description="Roles that must sign the permit each day, and the sign-off slots of the day (e.g. start / end of shift)."
			>
				<ToggleRow
					id="policy-signoff-required"
					label="Daily sign-off required"
					checked={policy.dailySignOff.required}
					onCheckedChange={(required) => patch("dailySignOff", {...policy.dailySignOff, required})}
				/>

				{policy.dailySignOff.required && (
					<>
						<div className="wwc:space-y-1.5">
							<Label>Roles</Label>
							<div className="wwc:flex wwc:flex-wrap wwc:gap-x-4 wwc:gap-y-2">
								{WC3_PERMIT_SIGNOFF_ROLES.map((role) => (
									<div key={role} className="wwc:flex wwc:items-center wwc:gap-1.5">
										<Checkbox
											id={`policy-role-${role}`}
											checked={policy.dailySignOff.roles.includes(role)}
											onCheckedChange={(next) =>
												patch("dailySignOff", {
													...policy.dailySignOff,
													roles: next
														? [...policy.dailySignOff.roles, role]
														: policy.dailySignOff.roles.filter((r) => r !== role),
												})
											}
										/>
										<Label htmlFor={`policy-role-${role}`} className="wwc:text-xs wwc:font-normal">
											{role}
										</Label>
									</div>
								))}
							</div>
						</div>

						<div className="wwc:space-y-1.5">
							<Label>Slots (optional)</Label>
							{policy.dailySignOff.slots.map((slot, index) => (
								<div key={slot.id} className="wwc:flex wwc:items-center wwc:gap-1.5">
									<Input
										value={slot.label}
										aria-label={`Sign-off slot ${index + 1}`}
										className="wwc:min-w-0 wwc:flex-1"
										onChange={(event) => setSlot(slot.id, event.target.value)}
									/>
									{/* Order is the day's order — start of shift before end of shift — so the slots move
									    rather than being sorted by whatever they happen to be called. */}
									<Button
										variant="ghost"
										icon
										aria-label="Move slot up"
										disabled={index === 0}
										className="wwc:h-7 wwc:w-7"
										onClick={() => moveSlot(index, -1)}
									>
										<ChevronUp className="wwc:h-3.5 wwc:w-3.5" />
									</Button>
									<Button
										variant="ghost"
										icon
										aria-label="Move slot down"
										disabled={index === policy.dailySignOff.slots.length - 1}
										className="wwc:h-7 wwc:w-7"
										onClick={() => moveSlot(index, 1)}
									>
										<ChevronDown className="wwc:h-3.5 wwc:w-3.5" />
									</Button>
									<Button
										variant="ghost"
										icon
										aria-label={`Remove slot ${index + 1}`}
										className="wwc:h-7 wwc:w-7 wwc:text-muted-foreground"
										onClick={() =>
											patch("dailySignOff", {
												...policy.dailySignOff,
												slots: policy.dailySignOff.slots.filter((s) => s.id !== slot.id),
											})
										}
									>
										<X className="wwc:h-3.5 wwc:w-3.5" />
									</Button>
								</div>
							))}
							<Button
								variant="outline"
								size="sm"
								className="wwc:gap-1.5"
								onClick={() =>
									patch("dailySignOff", {
										...policy.dailySignOff,
										slots: [
											...policy.dailySignOff.slots,
											{id: nextSlotId(), label: `New slot ${policy.dailySignOff.slots.length + 1}`},
										],
									})
								}
							>
								<Plus className="wwc:h-3.5 wwc:w-3.5" />
								Add slot
							</Button>
						</div>
					</>
				)}
			</PolicyCard>

			<PolicyCard title="Geofence" description="Default geofence radius for permits from this template.">
				<NumberField
					id="policy-geofence-radius"
					label="Default radius (m)"
					value={policy.geofence.radiusMeters}
					className="wwc:w-40"
					onChange={(radiusMeters) => patch("geofence", {radiusMeters})}
				/>
				<p className="wwc:text-[10.5px] wwc:text-muted-foreground">
					Project default for this permit type is 25 m (see Settings). Leave empty to inherit it.
				</p>
			</PolicyCard>
		</div>
	);
}
