/**
 * Alert dialog for non-destructive confirmations.
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

export function Confirmation() {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button>Publish Post</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Ready to publish?</AlertDialogTitle>
					<AlertDialogDescription>
						Your post will be visible to all users. You can edit it after publishing.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Go Back</AlertDialogCancel>
					<AlertDialogAction>Publish</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
