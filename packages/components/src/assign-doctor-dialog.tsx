import {cn} from "@core/core-utils";
import {Search} from "lucide-react";
import * as React from "react";

import {Button} from "./button";
import {Checkbox} from "./checkbox";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "./dialog";
import {Field, FieldError, FieldLabel} from "./field";
import {Input} from "./input";
import {SearchableSelect} from "./select";

export interface AssignDoctorOption {
	value: string;
	label: string;
}

export interface AssignDoctorValue {
	doctor: string;
	companies: string[];
	clinics: string[];
}

export interface AssignDoctorDialogProps {
	/** Controlled open state. Omit to let the dialog manage its own. */
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** Rendered inside DialogTrigger. Omit when driving `open` yourself. */
	trigger?: React.ReactNode;
	doctors?: AssignDoctorOption[];
	companies?: AssignDoctorOption[];
	clinics?: AssignDoctorOption[];
	onSave?: (value: AssignDoctorValue) => void;
	className?: string;
}

const EMPTY: AssignDoctorOption[] = [];

/** Search box with a leading magnifier, used to filter the two checklists. */
function ListSearch({
	value,
	onChange,
	placeholder,
	label,
}: {
	value: string;
	onChange: (next: string) => void;
	placeholder: string;
	label: string;
}) {
	return (
		<div className="wwc:relative">
			<Search className="wwc:absolute wwc:left-2.5 wwc:top-1/2 wwc:h-4 wwc:w-4 wwc:-translate-y-1/2 wwc:text-muted-foreground" />
			<Input
				aria-label={label}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="wwc:pl-8"
			/>
		</div>
	);
}

/**
 * Scrollable checklist with a "Select all (N)" master control. The master reflects the *filtered*
 * set, so selecting all after a search only touches what is visible.
 */
function CheckList({
	title,
	options,
	selected,
	onChange,
	searchPlaceholder,
}: {
	title: string;
	options: AssignDoctorOption[];
	selected: string[];
	onChange: (next: string[]) => void;
	searchPlaceholder: string;
}) {
	const [query, setQuery] = React.useState("");

	const visible = React.useMemo(() => {
		const q = query.trim().toLowerCase();
		return q === "" ? options : options.filter((option) => option.label.toLowerCase().includes(q));
	}, [options, query]);

	const visibleValues = visible.map((option) => option.value);
	const allVisibleSelected = visibleValues.length > 0 && visibleValues.every((value) => selected.includes(value));
	const someVisibleSelected = visibleValues.some((value) => selected.includes(value));

	const toggleAll = (checked: boolean) => {
		if (checked) onChange(Array.from(new Set([...selected, ...visibleValues])));
		else onChange(selected.filter((value) => !visibleValues.includes(value)));
	};

	const toggleOne = (value: string, checked: boolean) => {
		onChange(checked ? [...selected, value] : selected.filter((v) => v !== value));
	};

	return (
		<div className="wwc:border-b wwc:px-4 wwc:py-3 wwc:last:border-b-0">
			<div className="wwc:mb-2.5 wwc:flex wwc:items-center wwc:justify-between wwc:gap-3">
				<p className="wwc:min-w-0 wwc:text-xs wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
					{title}
				</p>
				<span className="wwc:shrink-0 wwc:text-xs wwc:text-muted-foreground">{selected.length} selected</span>
			</div>

			<ListSearch value={query} onChange={setQuery} placeholder={searchPlaceholder} label={searchPlaceholder} />

			<label className="wwc:mt-2.5 wwc:flex wwc:cursor-pointer wwc:items-center wwc:gap-2 wwc:text-sm">
				<Checkbox
					checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
					onCheckedChange={(checked) => toggleAll(!!checked)}
				/>
				Select all ({visible.length})
			</label>

			<div className="wwc:mt-2 wwc:max-h-52 wwc:overflow-y-auto wwc:rounded-md wwc:border wwc:p-2">
				{visible.length === 0 ? (
					<p className="wwc:py-4 wwc:text-center wwc:text-sm wwc:text-muted-foreground">No matches.</p>
				) : (
					<ul className="wwc:space-y-1">
						{visible.map((option) => (
							<li key={option.value}>
								<label className="wwc:flex wwc:cursor-pointer wwc:items-center wwc:gap-2 wwc:rounded-sm wwc:px-1 wwc:py-1 wwc:text-sm wwc:hover:bg-accent">
									<Checkbox
										checked={selected.includes(option.value)}
										onCheckedChange={(checked) => toggleOne(option.value, !!checked)}
									/>
									{option.label}
								</label>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}

/** Dialog form for granting a doctor visibility over companies' workers and clinics' visitor-visits. */
function AssignDoctorDialog({
	open,
	onOpenChange,
	trigger,
	doctors = EMPTY,
	companies = EMPTY,
	clinics = EMPTY,
	onSave,
	className,
}: AssignDoctorDialogProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
	const isOpen = open ?? uncontrolledOpen;

	const [doctor, setDoctor] = React.useState("");
	const [selectedCompanies, setSelectedCompanies] = React.useState<string[]>([]);
	const [selectedClinics, setSelectedClinics] = React.useState<string[]>([]);
	// Errors stay hidden until the first submit, so an untouched form is never pre-scolded.
	const [showErrors, setShowErrors] = React.useState(false);

	// Seed a fresh form on open so a cancelled entry never bleeds into the next one.
	const handleOpenChange = (next: boolean) => {
		if (next) {
			setDoctor("");
			setSelectedCompanies([]);
			setSelectedClinics([]);
			setShowErrors(false);
		}
		if (open === undefined) setUncontrolledOpen(next);
		onOpenChange?.(next);
	};

	const doctorError = doctor === "" ? "Select a doctor." : undefined;
	// Access with no scope grants nothing, so at least one list must have a selection.
	const scopeError =
		selectedCompanies.length === 0 && selectedClinics.length === 0
			? "Select at least one company or clinic."
			: undefined;

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			{trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
			<DialogContent
				className={cn("wwc:max-h-[85vh] wwc:gap-0 wwc:overflow-y-auto wwc:p-0 wwc:sm:max-w-[560px]", className)}
				aria-describedby={undefined}
			>
				<DialogHeader>
					<DialogTitle>Assign Doctor</DialogTitle>
				</DialogHeader>

				<div className="wwc:border-b wwc:px-4 wwc:py-3">
					<Field>
						<FieldLabel htmlFor="assign-doctor">Doctor</FieldLabel>
						<SearchableSelect
							options={doctors}
							value={doctor}
							onValueChange={setDoctor}
							placeholder="Search doctor by name or email..."
							searchPlaceholder="Search doctors..."
							emptyMessage="No doctors found."
						/>
						{showErrors && doctorError && <FieldError>{doctorError}</FieldError>}
					</Field>
				</div>

				<CheckList
					title="Companies"
					options={companies}
					selected={selectedCompanies}
					onChange={setSelectedCompanies}
					searchPlaceholder="Search companies..."
				/>

				<CheckList
					title="Clinics"
					options={clinics}
					selected={selectedClinics}
					onChange={setSelectedClinics}
					searchPlaceholder="Search clinics..."
				/>

				{showErrors && scopeError && (
					<p className="wwc:border-b wwc:border-border wwc:px-4 wwc:py-2 wwc:text-sm wwc:text-destructive">
						{scopeError}
					</p>
				)}

				<DialogFooter className="wwc:border-t wwc:border-border wwc:px-4 wwc:py-2">
					<Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
						Cancel
					</Button>
					<Button
						size="sm"
						onClick={() => {
							if (doctorError || scopeError) {
								setShowErrors(true);
								return;
							}
							onSave?.({doctor, companies: selectedCompanies, clinics: selectedClinics});
							handleOpenChange(false);
						}}
					>
						Assign
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export {AssignDoctorDialog};
