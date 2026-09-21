import {cn} from "@wakecap/core-utils";
import {useMemo, useState} from "react";

import {Button} from "../button";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "../dialog";
import {Input} from "../input";
import {Label} from "../label";
import {Textarea} from "../textarea";
import {ToggleGroup, ToggleGroupItem} from "../toggle-group";

// The "New interface" dialog. Ontology-agnostic on purpose — every option list is a prop whose
// default reproduces the private NewInterfaceDialog of the since-removed Workforce fork of this
// surface, so those defaults are exactly what that page rendered. It belongs next to
// link-type-wizard.tsx as src/interface-wizard.tsx; it lives here only because this agent may not
// create files outside src/pages/wc3-Interfaces-*.

const SEGMENT_ON =
	"wwc:data-[state=on]:border-primary wwc:data-[state=on]:bg-primary/10 wwc:data-[state=on]:text-primary";

/** "Site Asset" -> "siteAsset", matching the prototype's camel() used to seed the API name. */
export function camel(input: string) {
	const cleaned = input.trim().replace(/[^A-Za-z0-9]+(.)?/g, (_, c: string | undefined) => (c ? c.toUpperCase() : ""));
	return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
}

export interface NewInterfaceDraft {
	displayName: string;
	apiName: string;
	description: string;
	status: string;
	/** Index into the `icons` array the host supplied, so the host maps it back to its own glyph name. */
	iconIndex: number;
	/** Ids of the interfaces this one extends — multiple inheritance is allowed. */
	extends: string[];
}

export interface NewInterfaceExtendsOption {
	id: string;
	label: string;
	icon?: React.ComponentType<{className?: string}>;
}

export interface NewInterfaceDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Icon palette. `NewInterfaceDraft.iconIndex` indexes into THIS array. */
	icons?: React.ComponentType<{className?: string}>[];
	statuses?: string[];
	/** Default status. Must be one of `statuses`. */
	defaultStatus?: string;
	/** Interfaces selectable under "Extends". */
	extendsOptions?: NewInterfaceExtendsOption[];
	/** Enforce the prototype's best-practice #8 rule. Default false, so the workforce page is unchanged. */
	requireDescription?: boolean;
	onCreate: (draft: NewInterfaceDraft) => void;
}

export function NewInterfaceDialog({
	open,
	onOpenChange,
	icons = [],
	statuses = ["Active", "Experimental", "Endorsed"],
	defaultStatus = "Experimental",
	extendsOptions = [],
	requireDescription = false,
	onCreate,
}: NewInterfaceDialogProps) {
	const [displayName, setDisplayName] = useState("");
	const [apiName, setApiName] = useState("");
	// The API name follows the display name until the user edits it themselves; after that it is theirs.
	const [apiTouched, setApiTouched] = useState(false);
	const [description, setDescription] = useState("");
	const [status, setStatus] = useState(defaultStatus);
	const [iconIndex, setIconIndex] = useState(0);
	const [extendsSel, setExtendsSel] = useState<string[]>([]);
	const [attempted, setAttempted] = useState(false);

	// A palette may repeat a component, so its name alone is not a unique key — suffix each repeat
	// with its occurrence number. The position stays the value (`iconIndex`), never the key.
	const iconTiles = useMemo(() => {
		const seen = new Map<string, number>();
		return icons.map((Icon, index) => {
			const base = (Icon as {displayName?: string}).displayName ?? "icon";
			const n = (seen.get(base) ?? 0) + 1;
			seen.set(base, n);
			return {Icon, index, key: n === 1 ? base : `${base}~${n}`};
		});
	}, [icons]);

	const nameMissing = displayName.trim().length === 0;
	const descriptionMissing = requireDescription && description.trim().length === 0;
	const error = !attempted
		? null
		: nameMissing
			? "Display name required."
			: descriptionMissing
				? "Description required (best practice #8)."
				: null;

	const reset = () => {
		setDisplayName("");
		setApiName("");
		setApiTouched(false);
		setDescription("");
		setStatus(defaultStatus);
		setIconIndex(0);
		setExtendsSel([]);
		setAttempted(false);
	};

	const create = () => {
		if (nameMissing || descriptionMissing) {
			setAttempted(true);
			return;
		}
		onCreate({
			displayName: displayName.trim(),
			apiName: (apiName || camel(displayName)).trim(),
			description: description.trim(),
			status,
			iconIndex,
			extends: extendsSel,
		});
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
			<DialogContent className="wwc:flex wwc:max-h-[92vh] wwc:w-[calc(100vw-2rem)] wwc:max-w-3xl wwc:flex-col wwc:gap-0 wwc:overflow-hidden wwc:p-0">
				<DialogHeader>
					<DialogTitle>New interface</DialogTitle>
				</DialogHeader>

				<div className="wwc:min-h-0 wwc:flex-1 wwc:space-y-5 wwc:overflow-y-auto wwc:px-6 wwc:py-5">
					<div className="wwc:grid wwc:gap-6 wwc:sm:grid-cols-2">
						<div className="wwc:space-y-1.5">
							<Label htmlFor="if-new-dn">Display name</Label>
							<Input
								id="if-new-dn"
								value={displayName}
								onChange={(e) => {
									setDisplayName(e.target.value);
									if (!apiTouched) setApiName(camel(e.target.value));
								}}
								aria-invalid={attempted && nameMissing}
								className={cn(attempted && nameMissing && "wwc:border-destructive")}
							/>
							<p className="wwc:text-xs wwc:text-muted-foreground">An adjective-like abstraction, e.g. “Inspectable”</p>
						</div>
						<div className="wwc:space-y-1.5">
							<Label htmlFor="if-new-api">API name</Label>
							<Input
								id="if-new-api"
								className="wwc:font-mono"
								value={apiName}
								onChange={(e) => {
									setApiTouched(true);
									setApiName(e.target.value);
								}}
							/>
						</div>
					</div>

					<div className="wwc:space-y-1.5">
						<Label htmlFor="if-new-desc">Description</Label>
						<Textarea
							id="if-new-desc"
							rows={2}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							aria-invalid={attempted && descriptionMissing}
							className={cn(attempted && descriptionMissing && "wwc:border-destructive")}
						/>
					</div>

					<div className="wwc:grid wwc:gap-6 wwc:sm:grid-cols-2">
						<div className="wwc:space-y-1.5">
							<Label>Status</Label>
							<ToggleGroup
								type="single"
								value={status}
								onValueChange={(v) => v && setStatus(v)}
								variant="outline"
								size="sm"
								className="wwc:flex-wrap wwc:justify-start wwc:gap-2"
							>
								{statuses.map((s) => (
									<ToggleGroupItem key={s} value={s} className={SEGMENT_ON}>
										{s}
									</ToggleGroupItem>
								))}
							</ToggleGroup>
						</div>
						{icons.length > 0 && (
							<div className="wwc:space-y-2">
								<Label>Icon</Label>
								<div className="wwc:grid wwc:grid-cols-8 wwc:gap-2">
									{iconTiles.map(({Icon, index, key}) => (
										<button
											key={key}
											type="button"
											aria-label={`Icon ${index + 1}`}
											aria-pressed={index === iconIndex}
											onClick={() => setIconIndex(index)}
											className={cn(
												"wwc:flex wwc:aspect-square wwc:items-center wwc:justify-center wwc:rounded-lg wwc:border wwc:transition-colors",
												index === iconIndex
													? "wwc:border-primary wwc:bg-primary/10 wwc:text-primary"
													: "wwc:border-border wwc:text-muted-foreground wwc:hover:bg-muted",
											)}
										>
											<Icon className="wwc:h-4 wwc:w-4" />
										</button>
									))}
								</div>
							</div>
						)}
					</div>

					{extendsOptions.length > 0 && (
						<div className="wwc:space-y-2">
							<Label>Extends (multiple inheritance allowed)</Label>
							<ToggleGroup
								type="multiple"
								value={extendsSel}
								onValueChange={setExtendsSel}
								variant="outline"
								size="sm"
								className="wwc:flex-wrap wwc:justify-start wwc:gap-2"
							>
								{extendsOptions.map((o) => {
									const Icon = o.icon;
									return (
										<ToggleGroupItem key={o.id} value={o.id} className={SEGMENT_ON}>
											{Icon && <Icon className="wwc:h-3.5 wwc:w-3.5" />}
											{o.label}
										</ToggleGroupItem>
									);
								})}
							</ToggleGroup>
							<p className="wwc:text-xs wwc:text-muted-foreground">
								Inherited properties and constraints flow through transitively.
							</p>
						</div>
					)}
				</div>

				{/* Create is never disabled — the reason it would fail is spelled out here instead. */}
				<DialogFooter>
					<span className="wwc:text-sm">
						{error ? (
							<span className="wwc:text-destructive">{error}</span>
						) : (
							<span className="wwc:text-muted-foreground">Name it, then create.</span>
						)}
					</span>
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button onClick={create}>Create interface</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
