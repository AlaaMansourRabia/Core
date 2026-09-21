import {cn} from "@core/core-utils";
import * as React from "react";

import {Button} from "./button";
import {DatePicker, TimePicker} from "./date-picker";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "./dialog";
import {Field, FieldError, FieldLabel} from "./field";
import {Input} from "./input";
import {SearchableSelect, Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./select";
import {Textarea} from "./textarea";

export interface AddClinicVisitOption {
	value: string;
	label: string;
}

export interface AddClinicVisitValue {
	/** Selected worker id, or "" when the visit is logged against a visitor. */
	worker: string;
	/** True when the visit was recorded for a visitor rather than a registered worker. */
	isVisitor: boolean;
	/** Free-text visitor name; empty unless `isVisitor`. */
	visitorName: string;
	/** Free-text visitor company; empty unless `isVisitor`. */
	visitorCompany: string;
	clinic: string;
	visitDate: Date | undefined;
	/** 12-hour time string, e.g. "06:30 PM". */
	timeIn: string;
	/** Empty while the visit is still open — Time Out is filled on discharge. */
	timeOut: string;
	reason: string;
	fitToWork: string;
	notes: string;
}

export interface AddClinicVisitDialogProps {
	/** Controlled open state. Omit to let the dialog manage its own. */
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** Rendered inside DialogTrigger. Omit when driving `open` yourself. */
	trigger?: React.ReactNode;
	workers?: AddClinicVisitOption[];
	clinics?: AddClinicVisitOption[];
	reasons?: AddClinicVisitOption[];
	fitnessOutcomes?: AddClinicVisitOption[];
	/** Seeds the Visit Date field each time the dialog opens. Defaults to today. */
	defaultDate?: Date;
	/** Seeds Time In each time the dialog opens, e.g. "09:00 AM". Defaults to empty. */
	defaultTimeIn?: string;
	notesMaxLength?: number;
	onSave?: (value: AddClinicVisitValue) => void;
	className?: string;
}

const EMPTY: AddClinicVisitOption[] = [];

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

/**
 * Dialog form for recording a clinic visit — who was seen, where, when, why, and the fitness
 * outcome. The Worker field flips to a free-text visitor pair for guests with no worker record.
 */
function AddClinicVisitDialog({
	open,
	onOpenChange,
	trigger,
	workers = EMPTY,
	clinics = EMPTY,
	reasons = EMPTY,
	fitnessOutcomes = EMPTY,
	defaultDate,
	defaultTimeIn = "",
	notesMaxLength = 500,
	onSave,
	className,
}: AddClinicVisitDialogProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
	const isOpen = open ?? uncontrolledOpen;

	const [worker, setWorker] = React.useState("");
	const [isVisitor, setIsVisitor] = React.useState(false);
	const [visitorName, setVisitorName] = React.useState("");
	const [visitorCompany, setVisitorCompany] = React.useState("");
	const [clinic, setClinic] = React.useState("");
	const [visitDate, setVisitDate] = React.useState<Date | undefined>(defaultDate);
	const [timeIn, setTimeIn] = React.useState(defaultTimeIn);
	const [timeOut, setTimeOut] = React.useState("");
	const [reason, setReason] = React.useState("");
	const [fitToWork, setFitToWork] = React.useState("");
	const [notes, setNotes] = React.useState("");
	// Errors stay hidden until the first submit, so an untouched form is never pre-scolded.
	const [showErrors, setShowErrors] = React.useState(false);

	const reset = React.useCallback(() => {
		setWorker("");
		setIsVisitor(false);
		setVisitorName("");
		setVisitorCompany("");
		setClinic(clinics[0]?.value ?? "");
		setVisitDate(defaultDate ?? new Date());
		setTimeIn(defaultTimeIn);
		setTimeOut("");
		setReason("");
		setFitToWork("");
		setNotes("");
		setShowErrors(false);
	}, [clinics, defaultDate, defaultTimeIn]);

	// Seed a fresh form on open so a cancelled entry never bleeds into the next one.
	const handleOpenChange = (next: boolean) => {
		if (next) reset();
		if (open === undefined) setUncontrolledOpen(next);
		onOpenChange?.(next);
	};

	// Time Out is deliberately optional — a visit is logged on arrival and closed on discharge.
	const subjectChosen = isVisitor ? visitorName.trim() !== "" : worker !== "";
	const errors = {
		subject: subjectChosen ? undefined : isVisitor ? "Enter the visitor's name." : "Select a worker.",
		clinic: clinic === "" ? "Select a clinic location." : undefined,
		visitDate: visitDate === undefined ? "Pick a visit date." : undefined,
		reason: reason === "" ? "Select a reason." : undefined,
		fitToWork: fitToWork === "" ? "Select a fitness outcome." : undefined,
	};
	const hasErrors = Object.values(errors).some(Boolean);

	const handleSave = () => {
		if (hasErrors) {
			setShowErrors(true);
			return;
		}
		onSave?.({
			worker,
			isVisitor,
			visitorName,
			visitorCompany,
			clinic,
			visitDate,
			timeIn,
			timeOut,
			reason,
			fitToWork,
			notes,
		});
		handleOpenChange(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			{trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
			<DialogContent className={cn("wwc:gap-0 wwc:p-0 wwc:sm:max-w-[560px]", className)} aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>New Clinic Visit</DialogTitle>
				</DialogHeader>

				<Section title="Subject">
					{isVisitor ? (
						<div className="wwc:grid wwc:gap-3 wwc:sm:grid-cols-2">
							<Field>
								<FieldLabel htmlFor="visit-visitor-name">Visitor Name</FieldLabel>
								<Input
									id="visit-visitor-name"
									value={visitorName}
									onChange={(e) => setVisitorName(e.target.value)}
									placeholder="Full name"
									aria-invalid={showErrors && !!errors.subject}
								/>
								{showErrors && errors.subject && <FieldError>{errors.subject}</FieldError>}
							</Field>
							<Field>
								<FieldLabel htmlFor="visit-visitor-company">Company</FieldLabel>
								<Input
									id="visit-visitor-company"
									value={visitorCompany}
									onChange={(e) => setVisitorCompany(e.target.value)}
									placeholder="Ex. AERAMCO"
								/>
							</Field>
							<button
								type="button"
								onClick={() => setIsVisitor(false)}
								className="wwc:justify-self-start wwc:text-sm wwc:font-medium wwc:text-primary wwc:transition-colors wwc:hover:underline"
							>
								Search a registered worker instead
							</button>
						</div>
					) : (
						<Field>
							<FieldLabel htmlFor="visit-worker">Worker</FieldLabel>
							<SearchableSelect
								options={workers}
								value={worker}
								onValueChange={setWorker}
								placeholder="Search worker by name or badge code..."
								searchPlaceholder="Search workers..."
								emptyMessage="No workers found."
							/>
							{showErrors && errors.subject && <FieldError>{errors.subject}</FieldError>}
							<button
								type="button"
								onClick={() => setIsVisitor(true)}
								className="wwc:justify-self-start wwc:text-sm wwc:font-medium wwc:text-primary wwc:transition-colors wwc:hover:underline"
							>
								Register as visitor instead
							</button>
						</Field>
					)}
				</Section>

				<Section title="Visit Details">
					<Field className="wwc:mb-3">
						<FieldLabel htmlFor="visit-clinic">Clinic Location</FieldLabel>
						<Select value={clinic} onValueChange={setClinic}>
							<SelectTrigger id="visit-clinic">
								<SelectValue placeholder="Select clinic" />
							</SelectTrigger>
							<SelectContent>
								{clinics.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{showErrors && errors.clinic && <FieldError>{errors.clinic}</FieldError>}
					</Field>

					<div className="wwc:grid wwc:gap-3 wwc:sm:grid-cols-3">
						<Field>
							<FieldLabel>Visit Date</FieldLabel>
							<DatePicker date={visitDate} onDateChange={setVisitDate} className="wwc:w-full" />
							{showErrors && errors.visitDate && <FieldError>{errors.visitDate}</FieldError>}
						</Field>
						<Field>
							<FieldLabel htmlFor="visit-time-in">Time In</FieldLabel>
							<TimePicker id="visit-time-in" value={timeIn} onValueChange={setTimeIn} className="wwc:w-full" />
						</Field>
						<Field>
							<FieldLabel htmlFor="visit-time-out">Time Out</FieldLabel>
							<TimePicker id="visit-time-out" value={timeOut} onValueChange={setTimeOut} className="wwc:w-full" />
						</Field>
					</div>
				</Section>

				<Section title="Assessment">
					<Field className="wwc:mb-3">
						<FieldLabel htmlFor="visit-reason">Reason</FieldLabel>
						<Select value={reason} onValueChange={setReason}>
							<SelectTrigger id="visit-reason">
								<SelectValue placeholder="Select reason" />
							</SelectTrigger>
							<SelectContent>
								{reasons.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{showErrors && errors.reason && <FieldError>{errors.reason}</FieldError>}
					</Field>

					<Field className="wwc:mb-3">
						<FieldLabel htmlFor="visit-fitness">Fit to Work</FieldLabel>
						<Select value={fitToWork} onValueChange={setFitToWork}>
							<SelectTrigger id="visit-fitness">
								<SelectValue placeholder="Select outcome" />
							</SelectTrigger>
							<SelectContent>
								{fitnessOutcomes.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{showErrors && errors.fitToWork && <FieldError>{errors.fitToWork}</FieldError>}
					</Field>

					<Field>
						<div className="wwc:flex wwc:items-center wwc:justify-between">
							<FieldLabel htmlFor="visit-notes">Notes</FieldLabel>
							<span className="wwc:text-xs wwc:text-muted-foreground">
								<span className="wwc:font-medium wwc:text-foreground">{notes.length}</span> / {notesMaxLength}
							</span>
						</div>
						<Textarea
							id="visit-notes"
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							maxLength={notesMaxLength}
							placeholder="Clinical observations..."
							className="wwc:min-h-20 wwc:resize-y"
						/>
					</Field>
				</Section>

				<DialogFooter className="wwc:border-t wwc:border-border wwc:px-4 wwc:py-2">
					<Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
						Cancel
					</Button>
					<Button size="sm" onClick={handleSave}>
						Save Visit
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export {AddClinicVisitDialog};
