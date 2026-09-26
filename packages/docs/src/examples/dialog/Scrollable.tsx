import {Button} from "@corensystem/coren-ui/button";
/**
 * Dialog with scrollable content.
 */
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogTrigger,
} from "@corensystem/coren-ui/dialog";

export function Scrollable() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>View Terms</Button>
			</DialogTrigger>
			<DialogContent className="wwc:max-h-[80vh]">
				<DialogHeader>
					<DialogTitle>Terms of Service</DialogTitle>
					<DialogDescription>Please read carefully.</DialogDescription>
				</DialogHeader>
				<div className="wwc:overflow-y-auto wwc:pr-4">
					{Array.from({length: 10}, (_, i) => (
						<p key={i} className="wwc:mb-4">
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
							dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.
						</p>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}
