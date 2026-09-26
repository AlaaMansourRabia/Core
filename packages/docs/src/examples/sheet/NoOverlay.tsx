import {Button} from "@corensystem/coren-ui/button";
/**
 * Sheet without overlay scrim for non-modal use.
 */
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "@corensystem/coren-ui/sheet";

export function NoOverlay() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline">Open Panel</Button>
			</SheetTrigger>
			<SheetContent overlay={null}>
				<SheetHeader>
					<SheetTitle>Side Panel</SheetTitle>
				</SheetHeader>
				<p className="wwc:text-sm wwc:text-muted-foreground">
					This sheet has no overlay, allowing interaction with the page behind.
				</p>
			</SheetContent>
		</Sheet>
	);
}
