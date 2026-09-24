/**
 * Sheet panels from different sides of the screen.
 */
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@corensystem/coren-ui/sheet";
import {Button} from "@corensystem/coren-ui/button";

export function Sides() {
	return (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-2">
			<Sheet>
				<SheetTrigger asChild>
					<Button variant="outline">Right</Button>
				</SheetTrigger>
				<SheetContent side="right">
					<SheetHeader>
						<SheetTitle>Right Sheet</SheetTitle>
					</SheetHeader>
				</SheetContent>
			</Sheet>
			<Sheet>
				<SheetTrigger asChild>
					<Button variant="outline">Left</Button>
				</SheetTrigger>
				<SheetContent side="left">
					<SheetHeader>
						<SheetTitle>Left Sheet</SheetTitle>
					</SheetHeader>
				</SheetContent>
			</Sheet>
			<Sheet>
				<SheetTrigger asChild>
					<Button variant="outline">Top</Button>
				</SheetTrigger>
				<SheetContent side="top">
					<SheetHeader>
						<SheetTitle>Top Sheet</SheetTitle>
					</SheetHeader>
				</SheetContent>
			</Sheet>
			<Sheet>
				<SheetTrigger asChild>
					<Button variant="outline">Bottom</Button>
				</SheetTrigger>
				<SheetContent side="bottom">
					<SheetHeader>
						<SheetTitle>Bottom Sheet</SheetTitle>
					</SheetHeader>
				</SheetContent>
			</Sheet>
		</div>
	);
}
