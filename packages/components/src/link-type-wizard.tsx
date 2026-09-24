import {cn} from "@corensystem/coren-utils";
import * as React from "react";

import {Button} from "./button";
import {Card} from "./card";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "./dialog";
import {Input} from "./input";
import {LINK_CARDINALITY_LABELS, LINK_VISIBILITIES, type LinkTypeSide} from "./link-type-detail";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./select";
import {Textarea} from "./textarea";
import {ToggleGroup, ToggleGroupItem} from "./toggle-group";

// The "New link type" dialog, shared by every ontology surface. The host supplies the object types,
// the foreign-key candidates and the target primary key; nothing about a particular ontology is baked
// in. Required fields validate inline on submit — Create is never disabled.

const SEGMENT_ON =
	"wwc:data-[state=on]:border-primary wwc:data-[state=on]:bg-primary/10 wwc:data-[state=on]:text-primary";

const DEFAULT_BACKINGS = ["Foreign key", "Join table", "Intermediary object"];

export interface LinkTypeObjectOption {
	id: string;
	label: string;
}

export interface NewLinkTypeDraft {
	sideA: LinkTypeSide;
	sideB: LinkTypeSide;
	cardinality: string;
	backing: string;
	/** Set only when the backing is a foreign key. */
	fkProperty: string;
	description: string;
}

export interface NewLinkTypeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Object types selectable on either side. The first two seed the initial draft. */
	objectTypes: LinkTypeObjectOption[];
	/** Foreign-key candidates on side A. Given side A's id so the host can scope them. */
	fkPropertiesFor?: (objectTypeId: string) => string[];
	/** Target primary key on side B, shown read-only next to the FK picker. */
	targetPrimaryKeyFor?: (objectTypeId: string) => string;
	cardinalities?: {value: string; short: string}[];
	visibilities?: string[];
	backings?: string[];
	onCreate: (draft: NewLinkTypeDraft) => void;
}

function FieldLabel({children}: {children: React.ReactNode}) {
	return <span className="wwc:block wwc:text-xs wwc:font-medium wwc:text-muted-foreground">{children}</span>;
}

export function NewLinkTypeDialog({
	open,
	onOpenChange,
	objectTypes,
	fkPropertiesFor,
	targetPrimaryKeyFor,
	cardinalities = LINK_CARDINALITY_LABELS,
	visibilities = LINK_VISIBILITIES,
	backings = DEFAULT_BACKINGS,
	onCreate,
}: NewLinkTypeDialogProps) {
	const firstId = objectTypes[0]?.id ?? "";
	const secondId = objectTypes[1]?.id ?? firstId;

	const [objectA, setObjectA] = React.useState(firstId);
	const [objectB, setObjectB] = React.useState(secondId);
	const [apiAB, setApiAB] = React.useState("");
	const [displayAB, setDisplayAB] = React.useState("");
	const [apiBA, setApiBA] = React.useState("");
	const [displayBA, setDisplayBA] = React.useState("");
	const [visA, setVisA] = React.useState(visibilities[1] ?? visibilities[0]);
	const [visB, setVisB] = React.useState(visibilities[1] ?? visibilities[0]);
	const [cardinality, setCardinality] = React.useState(cardinalities[2]?.value ?? cardinalities[0].value);
	const [backing, setBacking] = React.useState(backings[0]);
	const [fkProperty, setFkProperty] = React.useState("");
	const [description, setDescription] = React.useState("");
	const [attempted, setAttempted] = React.useState(false);

	const labelOf = (id: string) => objectTypes.find((o) => o.id === id)?.label ?? id;
	const needsFk = backing === "Foreign key";
	const fkCandidates = fkPropertiesFor?.(objectA) ?? [];
	// Only demand a FK property when the host actually offers candidates to pick from.
	const fkRequired = needsFk && fkCandidates.length > 0;
	const fkError = attempted && fkRequired && !fkProperty;
	const targetPk = targetPrimaryKeyFor?.(objectB) ?? `${labelOf(objectB).toLowerCase().replace(/\s+/g, "_")}_id`;

	const reset = () => {
		setObjectA(firstId);
		setObjectB(secondId);
		setApiAB("");
		setDisplayAB("");
		setApiBA("");
		setDisplayBA("");
		setVisA(visibilities[1] ?? visibilities[0]);
		setVisB(visibilities[1] ?? visibilities[0]);
		setCardinality(cardinalities[2]?.value ?? cardinalities[0].value);
		setBacking(backings[0]);
		setFkProperty("");
		setDescription("");
		setAttempted(false);
	};

	const create = () => {
		if (fkRequired && !fkProperty) {
			setAttempted(true);
			return;
		}
		onCreate({
			sideA: {
				objectTypeId: objectA,
				objectTypeLabel: labelOf(objectA),
				apiName: apiAB || "linkAB",
				displayName: displayAB || "Link",
				visibility: visA,
			},
			sideB: {
				objectTypeId: objectB,
				objectTypeLabel: labelOf(objectB),
				apiName: apiBA || "linkBA",
				displayName: displayBA || "Link",
				visibility: visB,
			},
			cardinality,
			backing: needsFk && fkProperty ? `Foreign key (${fkProperty} → ${targetPk})` : backing,
			fkProperty,
			description,
		});
		reset();
		onOpenChange(false);
	};

	const sides = [
		{
			title: "Side A",
			obj: objectA,
			setObj: setObjectA,
			api: apiAB,
			setApi: setApiAB,
			disp: displayAB,
			setDisp: setDisplayAB,
			vis: visA,
			setVis: setVisA,
			dir: "A→B",
		},
		{
			title: "Side B",
			obj: objectB,
			setObj: setObjectB,
			api: apiBA,
			setApi: setApiBA,
			disp: displayBA,
			setDisp: setDisplayBA,
			vis: visB,
			setVis: setVisB,
			dir: "B→A",
		},
	];

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
					<DialogTitle>New link type</DialogTitle>
				</DialogHeader>

				<div className="wwc:min-h-0 wwc:flex-1 wwc:space-y-5 wwc:overflow-y-auto wwc:px-6 wwc:py-5">
					<div className="wwc:grid wwc:grid-cols-2 wwc:gap-5">
						{sides.map((side) => (
							<Card key={side.title} className="wwc:space-y-3 wwc:p-4">
								<h3 className="wwc:text-base wwc:font-semibold">{side.title}</h3>
								<div className="wwc:space-y-1.5">
									<FieldLabel>Object type</FieldLabel>
									<Select value={side.obj} onValueChange={side.setObj}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{objectTypes.map((o) => (
												<SelectItem key={o.id} value={o.id}>
													{o.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="wwc:space-y-1.5">
									<FieldLabel>API name ({side.dir})</FieldLabel>
									<Input value={side.api} onChange={(e) => side.setApi(e.target.value)} className="wwc:font-mono" />
								</div>
								<div className="wwc:space-y-1.5">
									<FieldLabel>Display name</FieldLabel>
									<Input value={side.disp} onChange={(e) => side.setDisp(e.target.value)} />
								</div>
								<div className="wwc:space-y-1.5">
									<FieldLabel>Visibility</FieldLabel>
									<ToggleGroup
										type="single"
										value={side.vis}
										onValueChange={(v) => v && side.setVis(v)}
										variant="outline"
										size="sm"
										className="wwc:justify-start"
									>
										{visibilities.map((v) => (
											<ToggleGroupItem key={v} value={v} className={SEGMENT_ON}>
												{v}
											</ToggleGroupItem>
										))}
									</ToggleGroup>
								</div>
							</Card>
						))}
					</div>

					<div className="wwc:space-y-1.5">
						<FieldLabel>Cardinality</FieldLabel>
						<ToggleGroup
							type="single"
							value={cardinality}
							onValueChange={(v) => v && setCardinality(v)}
							variant="outline"
							size="sm"
							className="wwc:justify-start"
						>
							{cardinalities.map((c) => (
								<ToggleGroupItem key={c.value} value={c.value} className={SEGMENT_ON}>
									{c.short}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
					</div>

					<div className="wwc:space-y-1.5">
						<FieldLabel>Backing</FieldLabel>
						<ToggleGroup
							type="single"
							value={backing}
							onValueChange={(v) => v && setBacking(v)}
							variant="outline"
							size="sm"
							className="wwc:justify-start"
						>
							{backings.map((b) => (
								<ToggleGroupItem key={b} value={b} className={SEGMENT_ON}>
									{b}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
						<p className="wwc:text-xs wwc:text-muted-foreground">
							Foreign key on the many side pointing at the target primary key.
						</p>
					</div>

					{needsFk && fkCandidates.length > 0 ? (
						<div className="wwc:grid wwc:grid-cols-2 wwc:gap-5">
							<div className="wwc:space-y-1.5">
								<FieldLabel>FK property (on {labelOf(objectA)})</FieldLabel>
								<Select value={fkProperty} onValueChange={setFkProperty}>
									<SelectTrigger className={cn(fkError && "wwc:border-destructive")}>
										<SelectValue placeholder="pick property…" />
									</SelectTrigger>
									<SelectContent className="wwc:max-h-72">
										{fkCandidates.map((p) => (
											<SelectItem key={p} value={p}>
												{p}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="wwc:space-y-1.5">
								<FieldLabel>Target primary key</FieldLabel>
								<p className="wwc:pt-2 wwc:text-sm">
									<code className="wwc:font-mono">{targetPk}</code>{" "}
									<span className="wwc:text-muted-foreground">(auto from {labelOf(objectB)})</span>
								</p>
							</div>
						</div>
					) : null}

					<div className="wwc:space-y-1.5">
						<FieldLabel>Description</FieldLabel>
						<Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
					</div>
				</div>

				<DialogFooter>
					<span className="wwc:text-sm">
						{fkError ? (
							<span className="wwc:text-destructive">Pick the foreign-key property.</span>
						) : (
							<span className="wwc:text-muted-foreground">Configure both sides, then create.</span>
						)}
					</span>
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button onClick={create}>Create link type</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
