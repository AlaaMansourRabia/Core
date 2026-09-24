/**
 * Alert dialog with custom action buttons.
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
import {buttonVariants} from "@corensystem/coren-ui/button";

export function CustomActions() {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="outline">Unsaved Changes</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Unsaved changes</AlertDialogTitle>
					<AlertDialogDescription>
						You have unsaved changes. Do you want to save before leaving?
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction className={buttonVariants({variant: "outline"})}>
						Discard
					</AlertDialogAction>
					<AlertDialogAction>Save</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
