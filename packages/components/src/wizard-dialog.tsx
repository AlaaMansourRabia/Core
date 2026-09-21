import {cn} from "@wakecap/core-utils";
import * as React from "react";

import {Button} from "./button";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "./dialog";
import {Stepper, StepperIndicator, StepperItem, StepperLabel, StepperList, StepperSeparator} from "./stepper";

/**
 * The multi-step half of the authoring contract — {@link FormDialog} for anything that does not fit
 * one screen.
 *
 * It carries the same never-disable rule one level up: **Next is always pressable**, and pressing it
 * on an unsatisfied step reveals that step's errors rather than sitting greyed out. `attempted`
 * clears on every step change, forward or back, so an error the user has already moved past does not
 * follow them.
 *
 * A step declares its own `valid`; the wizard owns position, the Stepper rail, the "Step N of M"
 * counter, and which of Back / Next / submit is showing. Steps render lazily — only the current one
 * is mounted — so a heavy Review step costs nothing until it is reached.
 */

export interface WizardStep {
	/** Label in the Stepper rail. Keep it to one or two words — "Metadata", "Release evidence". */
	label: string;
	/**
	 * False while this step's required fields are unsatisfied. Next stays pressable regardless;
	 * pressing it flips `attempted` and holds position. Omit for a step that cannot be wrong.
	 */
	valid?: boolean;
	/**
	 * Overrides the Next button for this step only, e.g. a "Plan" button that computes before
	 * advancing. The click still runs the same validity gate.
	 */
	nextLabel?: React.ReactNode;
	/** Extra props for this step's Next button — test hooks, `data-*` attributes. */
	nextProps?: Omit<React.ComponentProps<typeof Button>, "onClick" | "children">;
	/**
	 * The step's body. Given as a function to receive `attempted` — true once Next has been refused
	 * on THIS step — so fields paint their errors at the right moment.
	 */
	content: React.ReactNode | ((state: {attempted: boolean}) => React.ReactNode);
}

export interface WizardDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Dialog heading. Stays fixed across steps; the Stepper communicates position. */
	title: React.ReactNode;
	/**
	 * Max width in pixels. Defaults to `720` — a wizard carries a step rail as well as its fields,
	 * so it needs more room than a {@link FormDialog}.
	 */
	width?: number;
	/** At least one. Order is the order they are visited. */
	steps: WizardStep[];
	/** Label of the final button, shown in place of Next on the last step. */
	submitLabel: React.ReactNode;
	/** Extra props for the final button — test hooks, `data-*` attributes. */
	submitProps?: Omit<React.ComponentProps<typeof Button>, "onClick" | "children">;
	/** Runs on the last step when its `valid` holds. Closes afterwards unless `keepOpenOnSubmit`. */
	onSubmit: () => void;
	/** Clears the form. Runs after a successful submit AND whenever the dialog closes. */
	onReset?: () => void;
	/** Keep the dialog open after a successful submit. */
	keepOpenOnSubmit?: boolean;
	/** Applied to `DialogContent`, after the width. */
	className?: string;
}

/** Multi-step authoring modal: Stepper rail, one step body at a time, Back / Next / submit footer. */
export function WizardDialog({
	open,
	onOpenChange,
	title,
	width = 720,
	steps,
	submitLabel,
	submitProps,
	onSubmit,
	onReset,
	keepOpenOnSubmit = false,
	className,
}: WizardDialogProps) {
	const [step, setStep] = React.useState(0);
	// Scoped to the current step by construction: every move clears it.
	const [attempted, setAttempted] = React.useState(false);

	const last = steps.length - 1;
	// A step past the end is only reachable if `steps` shrinks under a live dialog; clamp rather than
	// render nothing.
	const index = Math.min(step, last);
	const current = steps[index];
	const currentValid = current?.valid ?? true;

	const clear = React.useCallback(() => {
		setStep(0);
		setAttempted(false);
		onReset?.();
	}, [onReset]);

	const close = (next: boolean) => {
		if (!next) clear();
		onOpenChange(next);
	};

	const goNext = () => {
		// Don't block the button — pressing it reveals this step's error and holds position.
		if (!currentValid) {
			setAttempted(true);
			return;
		}
		setAttempted(false);
		setStep(index + 1);
	};

	const goBack = () => {
		setAttempted(false);
		setStep(index - 1);
	};

	const submit = () => {
		if (!currentValid) {
			setAttempted(true);
			return;
		}
		onSubmit();
		if (keepOpenOnSubmit) {
			clear();
			return;
		}
		close(false);
	};

	return (
		<Dialog open={open} onOpenChange={close}>
			<DialogContent
				data-wakecore-artifact="wizard-dialog"
				className={cn(
					"wwc:flex wwc:max-h-[92vh] wwc:w-[calc(100vw-2rem)] wwc:flex-col wwc:gap-0 wwc:overflow-hidden",
					className,
				)}
				style={{maxWidth: width}}
			>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>

				<div className="wwc:shrink-0 wwc:border-b wwc:border-border wwc:px-6 wwc:py-4">
					<Stepper value={index + 1} orientation="horizontal" className="wwc:w-full">
						<StepperList className="wwc:w-full">
							{steps.map((s, i) => (
								<React.Fragment key={s.label}>
									<StepperItem step={i + 1}>
										<StepperIndicator />
										<StepperLabel>{s.label}</StepperLabel>
									</StepperItem>
									{i < last ? <StepperSeparator /> : null}
								</React.Fragment>
							))}
						</StepperList>
					</Stepper>
				</div>

				{/* Only the current step is mounted, so a Review step's derived work is never paid for
				    on step 1. The scroll lives here rather than on the content, keeping the header band,
				    the rail and the footer fixed. */}
				<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-y-auto wwc:p-6">
					{typeof current?.content === "function" ? current.content({attempted}) : current?.content}
				</div>

				<DialogFooter>
					<span className="wwc:text-sm wwc:text-muted-foreground">
						Step {index + 1} of {steps.length}
					</span>
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						{index > 0 ? (
							<Button variant="outline" onClick={goBack}>
								← Back
							</Button>
						) : null}
						{index < last ? (
							<Button onClick={goNext} {...current?.nextProps}>
								{current?.nextLabel ?? "Next →"}
							</Button>
						) : (
							<Button onClick={submit} {...submitProps}>
								{submitLabel}
							</Button>
						)}
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
