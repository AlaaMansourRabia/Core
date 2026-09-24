import {cn} from "@corensystem/coren-utils";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "./alert-dialog";

// ConfirmDialog — the "are you sure?" gate in front of a consequential action. A thin,
// controlled wrapper over AlertDialog so every surface asks the same way instead of
// re-assembling the eight AlertDialog parts (and drifting on button order and tone).

/**
 * The destructive tone applied to the confirm button. Exported so a surface that has to
 * compose AlertDialog directly still gets the same red as ConfirmDialog rather than copying it.
 */
export const confirmDestructiveClassName = "wwc:bg-destructive wwc:text-white wwc:hover:bg-destructive/90";

export interface ConfirmDialogProps extends Omit<
	React.ComponentPropsWithoutRef<typeof AlertDialogContent>,
	"title" | "children"
> {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: React.ReactNode;
	description: React.ReactNode;
	/** Confirm button label — name the action ("Demobilize", "Archive"), never "OK". */
	confirmLabel: string;
	/** Cancel button label. Default "Cancel". */
	cancelLabel?: string;
	/** Renders the confirm button in the destructive tone. */
	destructive?: boolean;
	/** Runs on confirm; the dialog closes itself afterwards. */
	onConfirm: () => void;
	className?: string;
}

/**
 * Controlled confirmation dialog. Drive `open` from the pending action — typically a piece
 * of state holding what is about to happen — and clear it in `onOpenChange`.
 *
 * Anything else you pass reaches the underlying `AlertDialogContent`. A confirm opened from
 * state has no trigger for Radix to restore focus to, so pass `onCloseAutoFocus` to put it
 * back on the control the user left:
 *
 * ```tsx
 * <ConfirmDialog … onCloseAutoFocus={(e) => { e.preventDefault(); triggerRef.current?.focus(); }} />
 * ```
 */
export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel,
	cancelLabel = "Cancel",
	destructive,
	onConfirm,
	className,
	...contentProps
}: ConfirmDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className={className} {...contentProps}>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
					<AlertDialogAction onClick={onConfirm} className={cn(destructive && confirmDestructiveClassName)}>
						{confirmLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
