/**
 * Use alert dialogs for irreversible or significant actions.
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

export function UsageDo() {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive">Revoke Access</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Revoke team access?</AlertDialogTitle>
					<AlertDialogDescription>
						All 5 team members will immediately lose access to this workspace. They will need to be re-invited to regain
						access.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Keep Access</AlertDialogCancel>
					<AlertDialogAction>Revoke Access</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
