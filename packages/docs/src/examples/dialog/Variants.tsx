/**
 * Dialog layout variants: banded and stacked.
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

export function Variants() {
	return (
		<div className="wwc:flex wwc:gap-4">
			<Dialog>
				<DialogTrigger asChild>
					<Button variant="outline">Banded (Default)</Button>
				</DialogTrigger>
				<DialogContent variant="banded">
					<DialogHeader>
						<DialogTitle>Banded Dialog</DialogTitle>
						<DialogDescription>Header has a muted background band.</DialogDescription>
					</DialogHeader>
					<p className="wwc:p-4">Content area with banded header.</p>
				</DialogContent>
			</Dialog>
			<Dialog>
				<DialogTrigger asChild>
					<Button variant="outline">Stacked</Button>
				</DialogTrigger>
				<DialogContent variant="stacked">
					<DialogHeader>
						<DialogTitle>Stacked Dialog</DialogTitle>
						<DialogDescription>Simple stacked layout without bands.</DialogDescription>
					</DialogHeader>
					<p>Content area with stacked header.</p>
				</DialogContent>
			</Dialog>
		</div>
	);
}
