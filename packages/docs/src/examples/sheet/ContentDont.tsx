/**
 * Avoid cramming too much content into a sheet.
 */
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@corensystem/coren-ui/sheet";
import {Button} from "@corensystem/coren-ui/button";
import {Input} from "@corensystem/coren-ui/input";

export function ContentDont() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline">All Settings</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>All Application Settings</SheetTitle>
				</SheetHeader>
				<div className="wwc:py-4 wwc:space-y-2 wwc:text-sm">
					<Input placeholder="Setting 1" />
					<Input placeholder="Setting 2" />
					<Input placeholder="Setting 3" />
					<Input placeholder="Setting 4" />
					<Input placeholder="Setting 5" />
					<Input placeholder="Setting 6" />
					<p className="wwc:text-muted-foreground">Too many settings...</p>
				</div>
			</SheetContent>
		</Sheet>
	);
}
