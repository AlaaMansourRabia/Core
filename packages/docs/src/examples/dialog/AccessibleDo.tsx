/**
 * Include title and description for screen readers.
 */
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogTrigger,
} from "@corensystem/coren-ui/dialog";
import {Button} from "@corensystem/coren-ui/button";

export function AccessibleDo() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>Open Settings</Button>
			</DialogTrigger>
			<DialogContent aria-describedby="dialog-settings-desc">
				<DialogHeader>
					<DialogTitle>Account Settings</DialogTitle>
					<DialogDescription id="dialog-settings-desc">
						Update your account preferences and security settings.
					</DialogDescription>
				</DialogHeader>
				<p className="wwc:py-4">Settings content here.</p>
			</DialogContent>
		</Dialog>
	);
}
