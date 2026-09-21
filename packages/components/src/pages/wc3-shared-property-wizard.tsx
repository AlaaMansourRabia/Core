import {TriangleAlert} from "lucide-react";
import * as React from "react";

import {Button} from "../button";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "../dialog";
import {Input} from "../input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../select";
import {Textarea} from "../textarea";
import {SHARED_PROPERTY_FORMATTINGS, type SharedPropertyFormatting} from "./wc3-shared-property-detail";

// "New shared property", ported from the prototype's SpCreateModal (06-unified-workspace.html:4108).
// Data-driven like the other wizards: the host supplies the option sets and the validation rules, so
// nothing about a particular ontology is baked in.

/** Default pattern seeded when a formatting kind is picked; the other kinds carry no pattern. */
const PATTERN_SEED: Record<string, string> = {number: "#,##0.0", date: "YYYY-MM-DD"};

const BASE_TYPE_FALLBACK = ["string", "integer", "double", "boolean", "date", "timestamp", "geopoint", "array"];

/** The prototype's slugify: everything that is not a-z0-9 collapses to a single underscore. */
export function slugifyApiName(displayName: string): string {
	return displayName
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_|_$/g, "");
}

export interface NewSharedPropertyDraft {
	displayName: string;
	apiName: string;
	description: string;
	baseType: string;
	formatting: SharedPropertyFormatting | null;
	typeClasses: string[];
}

export interface NewSharedPropertyDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	baseTypes?: string[];
	formattings?: {value: string; label: string}[];
	/**
	 * Return a message to block creation. Defaults to "display name required" only — hosts that need
	 * more (a required API name, a uniqueness check) pass the full rule set in the order they want it
	 * reported.
	 */
	validate?: (draft: NewSharedPropertyDraft) => string | null;
	onCreate: (draft: NewSharedPropertyDraft) => void;
}

const EMPTY: NewSharedPropertyDraft = {
	displayName: "",
	apiName: "",
	description: "",
	baseType: "string",
	formatting: null,
	typeClasses: [],
};

const defaultValidate = (d: NewSharedPropertyDraft) => (d.displayName.trim() ? null : "Display name required.");

function FieldLabel({children}: {children: React.ReactNode}) {
	return <span className="wwc:block wwc:text-xs wwc:font-medium wwc:text-muted-foreground">{children}</span>;
}

export function NewSharedPropertyDialog({
	open,
	onOpenChange,
	baseTypes = BASE_TYPE_FALLBACK,
	formattings = SHARED_PROPERTY_FORMATTINGS,
	validate = defaultValidate,
	onCreate,
}: NewSharedPropertyDialogProps) {
	const [draft, setDraft] = React.useState<NewSharedPropertyDraft>(EMPTY);
	// Free text while typing; only split into classes on blur, so a trailing comma is not a class.
	const [classText, setClassText] = React.useState("");
	const [error, setError] = React.useState<string | null>(null);

	const patch = (next: Partial<NewSharedPropertyDraft>) => setDraft((prev) => ({...prev, ...next}));

	const reset = () => {
		setDraft(EMPTY);
		setClassText("");
		setError(null);
	};

	const parseClasses = (text: string) =>
		text
			.split(",")
			.map((x) => x.trim())
			.filter(Boolean);

	const create = () => {
		const typeClasses = parseClasses(classText);
		const candidate = {...draft, typeClasses};
		const message = validate(candidate);
		if (message) {
			setError(message);
			return;
		}
		onCreate(candidate);
		reset();
		onOpenChange(false);
	};

	const setFormattingKind = (kind: string) => {
		// Picking Number or Date seeds the prototype's default pattern; the rest carry none.
		patch({formatting: kind === "none" ? null : {kind, pattern: PATTERN_SEED[kind] ?? ""}});
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
					<DialogTitle>New shared property</DialogTitle>
				</DialogHeader>

				<div className="wwc:min-h-0 wwc:flex-1 wwc:space-y-5 wwc:overflow-y-auto wwc:px-6 wwc:py-5">
					<div className="wwc:grid wwc:gap-6 wwc:md:grid-cols-2">
						<div className="wwc:space-y-1.5">
							<FieldLabel>Display name *</FieldLabel>
							<Input
								value={draft.displayName}
								placeholder="e.g. Inspection due date"
								onChange={(e) => patch({displayName: e.target.value})}
								// Derive on blur, and only while the API name is untouched — typing one by hand wins.
								onBlur={() => !draft.apiName && patch({apiName: slugifyApiName(draft.displayName)})}
							/>
						</div>
						<div className="wwc:space-y-1.5">
							<FieldLabel>API name *</FieldLabel>
							<Input
								value={draft.apiName}
								onChange={(e) => patch({apiName: e.target.value})}
								className="wwc:font-mono"
							/>
							<p className="wwc:text-xs wwc:text-muted-foreground">snake_case, qualified (e.g. quantity_installed)</p>
						</div>
					</div>

					<div className="wwc:space-y-1.5">
						<FieldLabel>Description *</FieldLabel>
						<Textarea rows={2} value={draft.description} onChange={(e) => patch({description: e.target.value})} />
					</div>

					<div className="wwc:grid wwc:gap-6 wwc:md:grid-cols-2">
						<div className="wwc:space-y-1.5">
							<FieldLabel>Base type</FieldLabel>
							<Select value={draft.baseType} onValueChange={(v) => patch({baseType: v})}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{baseTypes.map((t) => (
										<SelectItem key={t} value={t}>
											{t}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="wwc:space-y-1.5">
							<FieldLabel>Value formatting</FieldLabel>
							<Select value={draft.formatting?.kind ?? "none"} onValueChange={setFormattingKind}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{formattings.map((f) => (
										<SelectItem key={f.value} value={f.value}>
											{f.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="wwc:space-y-1.5">
						<FieldLabel>Type classes (comma-separated)</FieldLabel>
						<Input
							value={classText}
							placeholder="kpi, telemetry"
							onChange={(e) => setClassText(e.target.value)}
							onBlur={() => patch({typeClasses: parseClasses(classText)})}
						/>
					</div>

					{error ? (
						<div className="wwc:flex wwc:items-start wwc:gap-2 wwc:rounded-lg wwc:border wwc:border-destructive/40 wwc:bg-destructive/10 wwc:p-3 wwc:text-sm wwc:text-destructive">
							<TriangleAlert className="wwc:mt-0.5 wwc:h-4 wwc:w-4 wwc:shrink-0" />
							<span>{error}</span>
						</div>
					) : null}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={create}>Create shared property</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
