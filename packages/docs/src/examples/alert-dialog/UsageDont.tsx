/**
 * Avoid using alert dialogs for routine, reversible actions.
 */
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@corensystem/coren-ui/alert-dialog";
import {Button} from "@corensystem/coren-ui/button";

export function UsageDont() {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button>Save Draft</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Save draft?</AlertDialogTitle>
					<AlertDialogDescription>
						Your draft will be saved.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction>Save</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
