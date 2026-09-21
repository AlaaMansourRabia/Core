import {Button} from "@wakecap/core-ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@wakecap/core-ui/dialog";

export function FilterPanel() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline">Filters</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit filters</DialogTitle>
				</DialogHeader>
				{/* filter form */}
			</DialogContent>
		</Dialog>
	);
}
