import {cn} from "@corensystem/coren-utils";
import * as React from "react";

import {Button} from "./button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "./dialog";
import {Label} from "./label";

/**
 * The house contract for a single-step create/edit modal, in one place.
 *
 * Every authoring dialog in the library had grown its own copy of the same three decisions:
 *
 *   1. **Submit is never disabled.** A greyed-out button tells the user nothing about what is
 *      missing. Instead the press is swallowed, `attempted` flips true, and the offending fields
 *      light up. `FormDialog` owns that flag so a call site never declares it again.
 *   2. **Validity and error display are separate.** Call sites pass each field's *validity*
 *      (`invalid`) and this component decides *when* it becomes visible — never before the user has
 *      actually tried to submit. That is why `FormDialogField` takes `invalid`, not `showError`.
 *   3. **Reset runs on close as well as on success.** Re-opening a dialog that still holds the last
 *      attempt's half-typed values is a bug every copy had to remember not to write.
 *
 * The footer's left slot is guidance, not decoration: it holds `hint` in steady state and swaps to
 * `error` once a submit has been refused, so the explanation appears where the user is already
 * looking when the button does nothing.
 */

interface FormDialogContextValue {
	/** True once a submit has been refused; fields paint their errors only after this. */
	attempted: boolean;
}

const FormDialogContext = React.createContext<FormDialogContextValue>({attempted: false});

/**
 * Reads whether this dialog has already refused a submit. Rarely needed directly — `FormDialogField`
 * resolves it for you — but available for a call site rendering a field layout of its own.
 */
export function useFormDialogAttempted(): boolean {
	return React.useContext(FormDialogContext).attempted;
}

export interface FormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Dialog heading. */
	title: React.ReactNode;
	/** Optional sub-heading under the title band. */
	description?: React.ReactNode;
	/**
	 * Max width of the dialog in pixels. Defaults to `520` — the width of the narrowest shipped
	 * authoring dialog; widen only when a field row genuinely needs two columns.
	 */
	width?: number;
	/**
	 * Whether the form may be submitted. The submit button stays enabled either way — this only
	 * decides whether a press succeeds or reveals the errors.
	 */
	valid: boolean;
	/** Footer guidance shown until a submit is refused, e.g. "Name it, then create." */
	hint?: React.ReactNode;
	/** Replaces `hint` once a submit has been refused. Say what is missing, not that something is. */
	error?: React.ReactNode;
	/** Label of the confirming button, e.g. "Create process". */
	submitLabel: React.ReactNode;
	/** Label of the dismissing button. Defaults to "Cancel". */
	cancelLabel?: React.ReactNode;
	/** Variant of the confirming button. Defaults to the primary `default`. */
	submitVariant?: React.ComponentProps<typeof Button>["variant"];
	/** Extra props for the confirming button — test hooks, `data-*` attributes. */
	submitProps?: Omit<React.ComponentProps<typeof Button>, "onClick" | "variant" | "children">;
	/** Runs only when `valid` is true. Closes the dialog afterwards unless `keepOpenOnSubmit`. */
	onSubmit: () => void;
	/** Clears the form. Runs after a successful submit AND whenever the dialog closes. */
	onReset?: () => void;
	/** Keep the dialog open after a successful submit — for a form that stays up to add another. */
	keepOpenOnSubmit?: boolean;
	/** Applied to `DialogContent`, after the width. */
	className?: string;
	children: React.ReactNode;
}

/** Single-step create/edit modal: header band, field body, guidance-and-actions footer. */
export function FormDialog({
	open,
	onOpenChange,
	title,
	description,
	width = 520,
	valid,
	hint,
	error,
	submitLabel,
	cancelLabel = "Cancel",
	submitVariant,
	submitProps,
	onSubmit,
	onReset,
	keepOpenOnSubmit = false,
	className,
	children,
}: FormDialogProps) {
	const [attempted, setAttempted] = React.useState(false);

	// One place to land after every exit — a dismiss, a successful submit, or an Escape — so no path
	// can leave the next open showing the last attempt's values.
	const clear = React.useCallback(() => {
		setAttempted(false);
		onReset?.();
	}, [onReset]);

	const close = (next: boolean) => {
		if (!next) clear();
		onOpenChange(next);
	};

	const submit = () => {
		if (!valid) {
			setAttempted(true);
			return;
		}
		onSubmit();
		if (keepOpenOnSubmit) {
			// Same clear, minus the close: the form empties and stays up for the next entry.
			clear();
			return;
		}
		close(false);
	};

	const context = React.useMemo(() => ({attempted}), [attempted]);

	return (
		<Dialog open={open} onOpenChange={close}>
			<DialogContent
				data-core-artifact="form-dialog"
				className={cn("wwc:w-[calc(100vw-2rem)]", className)}
				style={{maxWidth: width}}
			>
				<DialogHeader className="wwc:flex-col wwc:items-start wwc:gap-0.5">
					<DialogTitle>{title}</DialogTitle>
					{description ? <DialogDescription className="wwc:text-xs">{description}</DialogDescription> : null}
				</DialogHeader>
				<FormDialogContext.Provider value={context}>
					<div className="wwc:grid wwc:gap-4 wwc:p-4">{children}</div>
				</FormDialogContext.Provider>
				<DialogFooter>
					<span className="wwc:text-sm">
						{attempted && !valid ? (
							<span className="wwc:text-destructive">{error}</span>
						) : (
							<span className="wwc:text-muted-foreground">{hint}</span>
						)}
					</span>
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						<Button variant="outline" onClick={() => close(false)}>
							{cancelLabel}
						</Button>
						<Button variant={submitVariant} onClick={submit} {...submitProps}>
							{submitLabel}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

/** What the render-prop form of a field hands its control. */
export interface FormDialogFieldState {
	/** Whether to paint the field red — validity already resolved against `attempted`. */
	invalid: boolean;
	/** Put this on the control. It is what the field's `<label>` points at. */
	id: string;
	/** Put this on the control as `aria-describedby` — the id of the hint line, when there is one. */
	describedBy?: string;
	/**
	 * Id of the caption itself. For a control `htmlFor` cannot name — a toggle group, a radio row —
	 * point the group at this with `aria-labelledby` instead.
	 */
	labelId: string;
}

export interface FormDialogFieldProps {
	/** Field name. Rendered as the house's uppercase muted caption, in a real `<label>`. */
	label: React.ReactNode;
	/**
	 * True while the field's value is unacceptable — plain validity, not "should I show red now".
	 * The dialog decides the timing: nothing paints until a submit has been refused.
	 */
	invalid?: boolean;
	/** Muted helper line under the control, e.g. "Its rows are the tokens of this process." */
	hint?: React.ReactNode;
	/**
	 * Id of the control this labels. Only needed for the plain-children form, where the field cannot
	 * reach the control to give it one — with the render prop, take `id` from the state instead.
	 */
	htmlFor?: string;
	className?: string;
	/**
	 * The control. Given as a function to receive `invalid` already resolved against `attempted`, plus
	 * the `id` the label points at and the `describedBy` of the hint line — spread them onto your own
	 * input as `aria-invalid`, `id` and `aria-describedby`. Fields with nothing to validate can pass
	 * plain children instead, naming the control with `htmlFor`.
	 */
	children: React.ReactNode | ((state: FormDialogFieldState) => React.ReactNode);
}

/**
 * One labelled field inside a {@link FormDialog}.
 *
 * The caption is a real `<label>` bound to the control, not a styled `<span>`: a caption that only
 * looks like a label reads to a screen reader as "edit, blank", and no amount of visual review
 * catches it. The id comes from here because the field is the only thing that sees both sides —
 * take it from the render prop, or name your own control with `htmlFor`.
 */
export function FormDialogField({label, invalid = false, hint, htmlFor, className, children}: FormDialogFieldProps) {
	const attempted = useFormDialogAttempted();
	// The whole point of the split: an untouched form is never red, however invalid it is.
	const showError = attempted && invalid;
	const generatedId = React.useId();
	const fieldId = htmlFor ?? generatedId;
	const hintId = `${generatedId}-hint`;
	const labelId = `${generatedId}-label`;

	return (
		<div className={cn("wwc:space-y-1.5", className)}>
			<Label
				id={labelId}
				htmlFor={fieldId}
				// `leading-4` restores what `text-xs` gave the plain <span> this replaced: `Label`'s own
				// `leading-none` would shorten every caption's line box by 4px and move every field.
				className="wwc:text-xs wwc:leading-4 wwc:font-semibold wwc:tracking-wide wwc:text-muted-foreground wwc:uppercase"
			>
				{label}
			</Label>
			{typeof children === "function"
				? children({invalid: showError, id: fieldId, describedBy: hint ? hintId : undefined, labelId})
				: children}
			{hint ? (
				<p id={hintId} className="wwc:text-xs wwc:text-muted-foreground">
					{hint}
				</p>
			) : null}
		</div>
	);
}

export interface FormDialogRowProps {
	/** Columns from the `sm` breakpoint up. Below it the fields always stack. Defaults to `2`. */
	columns?: 2 | 3;
	className?: string;
	children: React.ReactNode;
}

/** Puts sibling {@link FormDialogField}s side by side, stacking them on a narrow viewport. */
export function FormDialogRow({columns = 2, className, children}: FormDialogRowProps) {
	return (
		<div className={cn("wwc:grid wwc:gap-4", columns === 2 ? "wwc:sm:grid-cols-2" : "wwc:sm:grid-cols-3", className)}>
			{children}
		</div>
	);
}

/** Muted explanatory paragraph between fields — what the form will actually produce. */
export function FormDialogNote({className, children}: {className?: string; children: React.ReactNode}) {
	return <p className={cn("wwc:text-xs wwc:text-muted-foreground", className)}>{children}</p>;
}

/** Amber caveat between fields — true, non-blocking, and worth reading before submitting. */
export function FormDialogCaveat({className, children}: {className?: string; children: React.ReactNode}) {
	return <p className={cn("wwc:text-xs wwc:text-amber-600", className)}>{children}</p>;
}
