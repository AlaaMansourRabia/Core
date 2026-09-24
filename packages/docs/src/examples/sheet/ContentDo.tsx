/**
 * Keep sheet content focused and scannable.
 */
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@corensystem/coren-ui/sheet";
import {Button} from "@corensystem/coren-ui/button";

export function ContentDo() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button>Quick Settings</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Display Settings</SheetTitle>
				</SheetHeader>
				<div className="wwc:py-4 wwc:space-y-4">
					<div className="wwc:flex wwc:justify-between wwc:items-center">
						<span>Dark mode</span>
						<span className="wwc:text-muted-foreground">Off</span>
					</div>
					<div className="wwc:flex wwc:justify-between wwc:items-center">
						<span>Notifications</span>
						<span className="wwc:text-muted-foreground">On</span>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
