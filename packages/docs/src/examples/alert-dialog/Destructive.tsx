/**
 * Alert dialog with destructive action styling.
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

export function Destructive() {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive">Remove All Data</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete all data?</AlertDialogTitle>
					<AlertDialogDescription>
						This will permanently remove all files, settings, and user data. This action cannot be reversed.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction className={buttonVariants({variant: "destructive"})}>Delete Everything</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
