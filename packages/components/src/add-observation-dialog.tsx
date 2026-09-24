import {cn} from "@corensystem/coren-utils";
import {Paperclip, Upload, X} from "lucide-react";
import * as React from "react";

import {Button} from "./button";
import {DateTimePicker} from "./date-picker";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "./dialog";
import {Field, FieldError, FieldLabel} from "./field";
import {Input} from "./input";
import {SearchableSelect} from "./select";
import {Switch} from "./switch";
import {Textarea} from "./textarea";

export interface AddObservationOption {
	value: string;
	label: string;
}

export interface AddObservationValue {
	zone: string;
	category: string;
	description: string;
	attachments: File[];
	worker: string;
	permitNumber: string;
	date: Date | undefined;
	stopWorkNotice: boolean;
}

export interface AddObservationDialogProps {
	/** Controlled open state. Omit to let the dialog manage its own. */
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** Rendered inside DialogTrigger. Omit when driving `open` yourself. */
	trigger?: React.ReactNode;
	zones?: AddObservationOption[];
	categories?: AddObservationOption[];
	workers?: AddObservationOption[];
	/** Seeds the Date field each time the dialog opens. Defaults to now. */
	defaultDate?: Date;
	descriptionMaxLength?: number;
	onSave?: (value: AddObservationValue) => void;
	className?: string;
}

const EMPTY: AddObservationOption[] = [];

/** Section wrapper — each block is separated by a rule, not just whitespace. */
function Section({title, children}: {title: React.ReactNode; children: React.ReactNode}) {
	return (
		<div className="wwc:border-b wwc:px-4 wwc:py-3 wwc:last:border-b-0">
			<p className="wwc:mb-2.5 wwc:text-xs wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
				{title}
			</p>
			{children}
		</div>
	);
}

/** Dialog form for logging a safety observation — zone, category, description, and evidence. */
function AddObservationDialog({
	open,
	onOpenChange,
	trigger,
	zones = EMPTY,
	categories = EMPTY,
	workers = EMPTY,
	defaultDate,
	descriptionMaxLength = 300,
	onSave,
	className,
}: AddObservationDialogProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
	const isOpen = open ?? uncontrolledOpen;

	const [zone, setZone] = React.useState("");
	const [category, setCategory] = React.useState("");
	const [description, setDescription] = React.useState("");
	const [attachments, setAttachments] = React.useState<File[]>([]);
	const [worker, setWorker] = React.useState("");
	const [permitNumber, setPermitNumber] = React.useState("");
	const [date, setDate] = React.useState<Date | undefined>(defaultDate);
	const [stopWorkNotice, setStopWorkNotice] = React.useState(false);

	// Errors stay hidden until the first submit, so an untouched form is never pre-scolded.
	const [showErrors, setShowErrors] = React.useState(false);

	const fileInputRef = React.useRef<HTMLInputElement>(null);

	const reset = React.useCallback(() => {
		setZone("");
		setCategory("");
		setDescription("");
		setAttachments([]);
		setWorker("");
		setPermitNumber("");
		setDate(defaultDate ?? new Date());
		setStopWorkNotice(false);
		setShowErrors(false);
	}, [defaultDate]);

	// Seed a fresh form on open so a cancelled entry never bleeds into the next one.
	const handleOpenChange = (next: boolean) => {
		if (next) reset();
		if (open === undefined) setUncontrolledOpen(next);
		onOpenChange?.(next);
	};

	const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
		const picked = Array.from(event.target.files ?? []);
		if (picked.length > 0) setAttachments((prev) => [...prev, ...picked]);
		// Clear the input so re-picking the same file still fires a change event.
		event.target.value = "";
	};

	const removeAttachment = (index: number) => {
		setAttachments((prev) => prev.filter((_, i) => i !== index));
	};

	const errors = {
		zone: zone === "" ? "Select a zone." : undefined,
		category: category === "" ? "Select a category." : undefined,
		description: description.trim() === "" ? "Describe what you observed." : undefined,
	};
	const hasErrors = Object.values(errors).some(Boolean);

	const handleSave = () => {
		if (hasErrors) {
			setShowErrors(true);
			return;
		}
		onSave?.({zone, category, description, attachments, worker, permitNumber, date, stopWorkNotice});
		handleOpenChange(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			{trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
			<DialogContent className={cn("wwc:gap-0 wwc:p-0 wwc:sm:max-w-[560px]", className)} aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>Add Observation</DialogTitle>
				</DialogHeader>

				<Section title="What & Where">
					<div className="wwc:grid wwc:gap-3 wwc:sm:grid-cols-2">
						<Field>
							<FieldLabel htmlFor="observation-zone">Zone</FieldLabel>
							<SearchableSelect
								options={zones}
								value={zone}
								onValueChange={setZone}
								placeholder="Select Zone"
								searchPlaceholder="Search zones..."
								emptyMessage="No zones found."
							/>
							{showErrors && errors.zone && <FieldError>{errors.zone}</FieldError>}
						</Field>

						<Field>
							<FieldLabel htmlFor="observation-category">Category</FieldLabel>
							<SearchableSelect
								options={categories}
								value={category}
								onValueChange={setCategory}
								placeholder="Select Category"
								searchPlaceholder="Search categories..."
								emptyMessage="No categories found."
							/>
							{showErrors && errors.category && <FieldError>{errors.category}</FieldError>}
						</Field>
					</div>
				</Section>

				<Section title="Description">
					<Field>
						<div className="wwc:flex wwc:items-center wwc:justify-between">
							<FieldLabel htmlFor="observation-description">Description</FieldLabel>
							<span className="wwc:text-xs wwc:text-muted-foreground">
								<span className="wwc:font-medium wwc:text-foreground">{description.length}</span> /{" "}
								{descriptionMaxLength}
							</span>
						</div>
						<Textarea
							id="observation-description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							maxLength={descriptionMaxLength}
							placeholder="Add description here..."
							className="wwc:min-h-20 wwc:resize-y"
							aria-invalid={showErrors && !!errors.description}
						/>
						{showErrors && errors.description && <FieldError>{errors.description}</FieldError>}
					</Field>
				</Section>

				<Section title="Evidence">
					<Field>
						<FieldLabel>Attachments</FieldLabel>
						<input ref={fileInputRef} type="file" multiple onChange={handleFiles} className="wwc:hidden" />
						<Button
							type="button"
							variant="outline"
							className="wwc:w-full"
							onClick={() => fileInputRef.current?.click()}
						>
							<Upload className="wwc:h-4 wwc:w-4" />
							Choose File
						</Button>
						{attachments.length > 0 && (
							<ul className="wwc:space-y-1">
								{attachments.map((file, index) => (
									<li
										key={`${file.name}-${file.size}-${file.lastModified}`}
										className="wwc:flex wwc:items-center wwc:gap-2 wwc:rounded-md wwc:border wwc:border-border wwc:px-2 wwc:py-1 wwc:text-sm"
									>
										<Paperclip className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-muted-foreground" />
										<span className="wwc:line-clamp-1 wwc:flex-1">{file.name}</span>
										<button
											type="button"
											onClick={() => removeAttachment(index)}
											aria-label={`Remove ${file.name}`}
											className="wwc:shrink-0 wwc:text-muted-foreground wwc:transition-colors wwc:hover:text-foreground"
										>
											<X className="wwc:h-3.5 wwc:w-3.5" />
										</button>
									</li>
								))}
							</ul>
						)}
					</Field>
				</Section>

				<Section title="Details">
					<div className="wwc:grid wwc:gap-3 wwc:sm:grid-cols-2">
						<Field>
							<FieldLabel htmlFor="observation-worker">Worker</FieldLabel>
							<SearchableSelect
								options={workers}
								value={worker}
								onValueChange={setWorker}
								placeholder="Select Worker"
								searchPlaceholder="Search workers..."
								emptyMessage="No workers found."
							/>
						</Field>

						<Field>
							<FieldLabel htmlFor="observation-permit">Permit Number</FieldLabel>
							<Input
								id="observation-permit"
								value={permitNumber}
								onChange={(e) => setPermitNumber(e.target.value)}
								placeholder="Ex. 123456"
							/>
						</Field>

						<Field>
							<FieldLabel>Date</FieldLabel>
							<DateTimePicker variant="unified" date={date} onDateChange={setDate} />
						</Field>

						<Field>
							<FieldLabel htmlFor="observation-stop-work">Stop Work Notice</FieldLabel>
							{/* Sits at input height so the toggle baselines with the Date control beside it. */}
							<div className="wwc:flex wwc:h-9 wwc:items-center">
								<Switch id="observation-stop-work" checked={stopWorkNotice} onCheckedChange={setStopWorkNotice} />
							</div>
						</Field>
					</div>
				</Section>

				<DialogFooter className="wwc:border-t wwc:border-border wwc:px-4 wwc:py-2">
					<Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
						Cancel
					</Button>
					<Button size="sm" onClick={handleSave}>
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export {AddObservationDialog};
