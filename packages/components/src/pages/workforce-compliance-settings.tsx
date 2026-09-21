import {cn} from "@core/core-utils";
import {Plus, ShieldCheck, SquarePen, Trash2} from "lucide-react";
import {useEffect, useMemo, useState} from "react";

import {Badge} from "../badge";
import {Button} from "../button";
import {Card} from "../card";
import {Combobox} from "../combobox";
import {ConfirmDialog} from "../confirm-dialog";
import {Dialog, DialogContent, DialogTitle} from "../dialog";
import {toast, Toaster} from "../sonner";
import {Switch} from "../switch";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../table";
import {ToggleGroup, ToggleGroupItem} from "../toggle-group";
import {
	COMPLIANCE_CONDITIONS,
	COMPLIANCE_TYPES,
	type ComplianceCondition,
	type ComplianceElement,
	type ComplianceRule,
	type ComplianceType,
	conditionLabel,
	KNOWN_COMPLIANCE_ELEMENTS,
	typeLabel,
} from "./workforce-compliance";

// Compliance settings — configure, per project, which elements count toward compliance, their type, the
// condition, and how heavily. The Element picker is a searchable, creatable combobox (pick a known element
// or type a new name to add it); Type and Condition are pill selectors. The score column reads rules live.

const WEIGHTS = [1, 2, 3, 4, 5];

// Filled-primary when selected, outline when not — a clear pill selector.
const PILL_ON =
	"wwc:data-[state=on]:border-primary wwc:data-[state=on]:bg-primary wwc:data-[state=on]:text-primary-foreground";

interface RuleDraft {
	name: string;
	type: ComplianceType;
	dataKey?: ComplianceElement;
	condition: ComplianceCondition;
	weight: number;
}

const EMPTY_DRAFT: RuleDraft = {name: "", type: "document", dataKey: undefined, condition: "valid", weight: 1};

type ElementOption = {name: string; type: ComplianceType; dataKey?: ComplianceElement};

function RuleDialog({
	open,
	onOpenChange,
	mode,
	initial,
	elementOptions,
	onSubmit,
}: {
	open: boolean;
	onOpenChange: (o: boolean) => void;
	mode: "add" | "edit";
	initial: RuleDraft;
	elementOptions: ElementOption[];
	onSubmit: (draft: RuleDraft) => void;
}) {
	const [draft, setDraft] = useState<RuleDraft>(initial);
	useEffect(() => {
		if (open) setDraft(initial);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	const set = <K extends keyof RuleDraft>(key: K, value: RuleDraft[K]) => setDraft((d) => ({...d, [key]: value}));

	// The element is picked from a searchable list, or created by typing a new name (custom → no data key).
	const isCustom = draft.name.length > 0 && !draft.dataKey;
	const options = useMemo(() => elementOptions.map((o) => ({value: o.name, label: o.name})), [elementOptions]);
	const valid = draft.name.trim().length > 0;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent closeAlign="padded" className="wwc:p-6 wwc:w-[calc(100vw-2rem)] wwc:max-w-md">
				<DialogTitle className="wwc:text-lg wwc:font-semibold">
					{mode === "add" ? "New compliance condition" : "Edit condition"}
				</DialogTitle>
				<div className="wwc:space-y-4">
					<Field label="Element">
						<Combobox
							options={options}
							value={draft.name || undefined}
							placeholder="Select or search element…"
							searchPlaceholder="Search elements…"
							emptyMessage="No element found."
							creatable
							createLabel={(input) => `Add "${input}"`}
							className="wwc:w-full"
							popoverClassName="wwc:w-[var(--radix-popover-trigger-width)]"
							onValueChange={(name) => {
								const opt = elementOptions.find((o) => o.name === name);
								if (opt) setDraft((d) => ({...d, name: opt.name, type: opt.type, dataKey: opt.dataKey}));
								else setDraft((d) => ({...d, name}));
							}}
							onCreateOption={(name) => setDraft((d) => ({...d, name, dataKey: undefined}))}
						/>
						{isCustom && (
							<p className="wwc:text-xs wwc:text-muted-foreground">
								New element — it’s scored once wired to project data.
							</p>
						)}
					</Field>

					<Field label="Type">
						<ToggleGroup
							type="single"
							variant="outline"
							value={draft.type}
							onValueChange={(v) => v && set("type", v as ComplianceType)}
							className="wwc:flex-wrap wwc:justify-start wwc:gap-1.5"
						>
							{COMPLIANCE_TYPES.map((t) => (
								<ToggleGroupItem key={t.value} value={t.value} className={PILL_ON}>
									{t.label}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
					</Field>

					<Field label="Condition">
						<ToggleGroup
							type="single"
							variant="outline"
							value={draft.condition}
							onValueChange={(v) => v && set("condition", v as ComplianceCondition)}
							className="wwc:flex-wrap wwc:justify-start wwc:gap-1.5"
						>
							{COMPLIANCE_CONDITIONS.map((c) => (
								<ToggleGroupItem key={c.value} value={c.value} className={PILL_ON}>
									{c.label}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
					</Field>

					<Field label="Weight">
						<ToggleGroup
							type="single"
							variant="outline"
							value={String(draft.weight)}
							onValueChange={(v) => v && set("weight", Number(v))}
							className="wwc:flex-wrap wwc:justify-start wwc:gap-1.5"
						>
							{WEIGHTS.map((w) => (
								<ToggleGroupItem key={w} value={String(w)} className={cn(PILL_ON, "wwc:w-9 wwc:tabular-nums")}>
									{w}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
					</Field>
				</div>
				<div className="wwc:flex wwc:items-center wwc:justify-end wwc:gap-2">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						disabled={!valid}
						onClick={() => {
							onSubmit(draft);
							onOpenChange(false);
						}}
					>
						{mode === "add" ? "Add condition" : "Save"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function Field({label, children}: {label: string; children: React.ReactNode}) {
	return (
		<div className="wwc:space-y-1.5">
			<span className="wwc:text-sm wwc:font-semibold">{label}</span>
			{children}
		</div>
	);
}

/** The Compliance settings surface — configure the conditions that make up the compliance score. */
export function ComplianceSettings({
	rules,
	onRulesChange,
}: {
	rules: ComplianceRule[];
	onRulesChange: (rules: ComplianceRule[]) => void;
}) {
	const [modal, setModal] = useState<{mode: "add" | "edit"; id?: string} | null>(null);
	const [pendingDelete, setPendingDelete] = useState<ComplianceRule | null>(null);
	const [seq, setSeq] = useState(0);

	const [ownToaster, setOwnToaster] = useState(false);
	useEffect(() => {
		const has = document.querySelector('[data-sonner-toaster], section[aria-live][aria-label*="Notification"]');
		setOwnToaster(!has);
	}, []);

	// Built-in elements plus any custom ones already defined, for the picker.
	const elementOptions = useMemo<ElementOption[]>(() => {
		const map = new Map<string, ElementOption>();
		for (const e of KNOWN_COMPLIANCE_ELEMENTS) map.set(e.name, e);
		for (const r of rules) if (!map.has(r.name)) map.set(r.name, {name: r.name, type: r.type, dataKey: r.dataKey});
		return [...map.values()];
	}, [rules]);

	const draftFor = (id?: string): RuleDraft => {
		const rule = rules.find((r) => r.id === id);
		return rule
			? {name: rule.name, type: rule.type, dataKey: rule.dataKey, condition: rule.condition, weight: rule.weight}
			: EMPTY_DRAFT;
	};

	const submit = (draft: RuleDraft) => {
		if (modal?.mode === "edit" && modal.id) {
			onRulesChange(rules.map((r) => (r.id === modal.id ? {...r, ...draft, name: draft.name.trim()} : r)));
			toast.success("Condition updated");
		} else {
			onRulesChange([...rules, {id: `r-new-${seq}`, enabled: true, ...draft, name: draft.name.trim()}]);
			setSeq((s) => s + 1);
			toast.success("Condition added");
		}
	};

	const activeCount = rules.filter((r) => r.enabled).length;

	return (
		<div className="wwc:w-full wwc:space-y-4 wwc:p-6">
			<div className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-4">
				<div>
					<h1 className="wwc:text-xl wwc:font-semibold wwc:tracking-tight">Compliance</h1>
					<p className="wwc:mt-1 wwc:max-w-2xl wwc:text-sm wwc:text-muted-foreground">
						Define what makes a worker compliant on this project. Each enabled condition weighs into the compliance
						score shown in the Compliance tab — {activeCount} of {rules.length} conditions active.
					</p>
				</div>
				<Button className="wwc:shrink-0 wwc:gap-1.5" onClick={() => setModal({mode: "add"})}>
					<Plus className="wwc:h-4 wwc:w-4" />
					Add condition
				</Button>
			</div>

			<Card className="wwc:overflow-hidden wwc:p-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Element</TableHead>
							<TableHead className="wwc:w-[7rem]">Type</TableHead>
							<TableHead>Condition</TableHead>
							<TableHead className="wwc:w-[6rem]">Weight</TableHead>
							<TableHead className="wwc:w-[6rem]">Enabled</TableHead>
							<TableHead className="wwc:w-[6rem] wwc:text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{rules.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="wwc:py-8 wwc:text-center wwc:text-sm wwc:text-muted-foreground">
									No conditions — add one to start scoring compliance.
								</TableCell>
							</TableRow>
						) : (
							rules.map((rule) => (
								<TableRow key={rule.id} className={rule.enabled ? undefined : "wwc:opacity-60"}>
									<TableCell>
										<span className="wwc:inline-flex wwc:items-center wwc:gap-2 wwc:font-medium">
											<ShieldCheck className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
											{rule.name}
											{!rule.dataKey && (
												<Badge variant="outline" className="wwc:h-5 wwc:text-[10px]">
													Custom
												</Badge>
											)}
										</span>
									</TableCell>
									<TableCell>
										<Badge variant="secondary" className="wwc:h-5 wwc:text-[10px]">
											{typeLabel(rule.type)}
										</Badge>
									</TableCell>
									<TableCell className="wwc:text-muted-foreground">{conditionLabel(rule.condition)}</TableCell>
									<TableCell>
										<Badge variant="secondary" className="wwc:h-5 wwc:tabular-nums">
											×{rule.weight}
										</Badge>
									</TableCell>
									<TableCell>
										<Switch
											checked={rule.enabled}
											onCheckedChange={(v) =>
												onRulesChange(rules.map((r) => (r.id === rule.id ? {...r, enabled: v} : r)))
											}
											aria-label={`Enable ${rule.name} condition`}
										/>
									</TableCell>
									<TableCell className="wwc:text-right">
										<div className="wwc:flex wwc:items-center wwc:justify-end wwc:gap-0.5">
											<Button
												variant="ghost"
												size="sm"
												icon
												aria-label="Edit condition"
												className="wwc:h-7 wwc:w-7 wwc:text-muted-foreground"
												onClick={() => setModal({mode: "edit", id: rule.id})}
											>
												<SquarePen className="wwc:h-4 wwc:w-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												icon
												aria-label="Delete condition"
												className="wwc:h-7 wwc:w-7 wwc:text-muted-foreground wwc:hover:text-destructive"
												onClick={() => setPendingDelete(rule)}
											>
												<Trash2 className="wwc:h-4 wwc:w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</Card>

			<p className="wwc:text-xs wwc:text-muted-foreground">
				The compliance score is the enabled conditions a worker satisfies, weighted — shown as a percentage in the
				Compliance tab. Custom elements are scored once wired to real project data.
			</p>

			<RuleDialog
				open={modal !== null}
				onOpenChange={(o) => !o && setModal(null)}
				mode={modal?.mode ?? "add"}
				initial={draftFor(modal?.id)}
				elementOptions={elementOptions}
				onSubmit={submit}
			/>
			<ConfirmDialog
				open={pendingDelete !== null}
				onOpenChange={(o) => !o && setPendingDelete(null)}
				destructive
				title="Delete condition?"
				description={
					<>
						The <span className="wwc:font-medium wwc:text-foreground">{pendingDelete?.name ?? ""}</span> condition will
						be removed from the compliance score. This can't be undone.
					</>
				}
				confirmLabel="Delete"
				onConfirm={() => {
					if (!pendingDelete) return;
					onRulesChange(rules.filter((r) => r.id !== pendingDelete.id));
					toast.success("Condition deleted");
					setPendingDelete(null);
				}}
			/>
			{ownToaster ? <Toaster position="top-right" /> : null}
		</div>
	);
}
