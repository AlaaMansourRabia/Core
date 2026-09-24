/**
 * Provide clear context about the action consequences.
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

export function ContextDo() {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive">Delete Project</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete "My Project"?</AlertDialogTitle>
					<AlertDialogDescription>
						This will delete the project and all 23 associated tasks. Team
						members will lose access immediately. This cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Keep Project</AlertDialogCancel>
					<AlertDialogAction>Delete Project</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
