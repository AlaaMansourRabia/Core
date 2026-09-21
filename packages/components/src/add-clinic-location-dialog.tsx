import {cn} from "@core/core-utils";
import * as React from "react";

import {Button} from "./button";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "./dialog";
import {Field, FieldError, FieldLabel} from "./field";
import {Input} from "./input";
import {Switch} from "./switch";

export interface AddClinicLocationValue {
	name: string;
	/** Makes this the site's default clinic, replacing whichever one held it before. */
	isDefault: boolean;
}

export interface AddClinicLocationDialogProps {
	/** Controlled open state. Omit to let the dialog manage its own. */
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** Rendered inside DialogTrigger. Omit when driving `open` yourself. */
	trigger?: React.ReactNode;
	onSave?: (value: AddClinicLocationValue) => void;
	className?: string;
}

/** Dialog form for creating a site clinic location. */
function AddClinicLocationDialog({open, onOpenChange, trigger, onSave, className}: AddClinicLocationDialogProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
	const isOpen = open ?? uncontrolledOpen;

	const [name, setName] = React.useState("");
	const [isDefault, setIsDefault] = React.useState(false);
	// Errors stay hidden until the first submit, so an untouched form is never pre-scolded.
	const [showErrors, setShowErrors] = React.useState(false);

	// Seed a fresh form on open so a cancelled entry never bleeds into the next one.
	const handleOpenChange = (next: boolean) => {
		if (next) {
			setName("");
			setIsDefault(false);
			setShowErrors(false);
		}
		if (open === undefined) setUncontrolledOpen(next);
		onOpenChange?.(next);
	};

	const nameError = name.trim() === "" ? "Enter a clinic name." : undefined;

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			{trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
			<DialogContent className={cn("wwc:gap-0 wwc:p-0 wwc:sm:max-w-[440px]", className)} aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>Add Clinic Location</DialogTitle>
				</DialogHeader>

				<div className="wwc:px-4 wwc:py-3">
					<Field>
						<FieldLabel htmlFor="clinic-location-name">Name</FieldLabel>
						<Input
							id="clinic-location-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g. Main Gate Clinic"
							aria-invalid={showErrors && !!nameError}
						/>
						{showErrors && nameError && <FieldError>{nameError}</FieldError>}
					</Field>

					<div className="wwc:mt-4 wwc:flex wwc:items-center wwc:justify-between wwc:gap-4">
						<FieldLabel htmlFor="clinic-location-default" className="wwc:cursor-pointer">
							Default
						</FieldLabel>
						<Switch id="clinic-location-default" checked={isDefault} onCheckedChange={setIsDefault} />
					</div>
				</div>

				<DialogFooter className="wwc:border-t wwc:border-border wwc:px-4 wwc:py-2">
					<Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
						Cancel
					</Button>
					<Button
						size="sm"
						onClick={() => {
							if (nameError) {
								setShowErrors(true);
								return;
							}
							onSave?.({name: name.trim(), isDefault});
							handleOpenChange(false);
						}}
					>
						Create
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export {AddClinicLocationDialog};
