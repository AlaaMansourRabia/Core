/**
 * Use descriptive action labels that match the action.
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

export function ActionLabelsDo() {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button>Leave Page</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Leave without saving?</AlertDialogTitle>
					<AlertDialogDescription>
						Your changes will be lost if you leave now.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Stay on Page</AlertDialogCancel>
					<AlertDialogAction>Leave Without Saving</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
