import {Button} from "@core/core-ui/button";
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "@core/core-ui/sheet";

export function FilterPanel() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline">Filters</Button>
			</SheetTrigger>
			<SheetContent side="right">
				<SheetHeader>
					<SheetTitle>Edit filters</SheetTitle>
				</SheetHeader>
				{/* filter form */}
			</SheetContent>
		</Sheet>
	);
}
