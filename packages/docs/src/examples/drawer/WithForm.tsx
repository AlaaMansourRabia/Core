/**
 * Drawer containing a form.
 */
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerDescription,
	DrawerFooter,
	DrawerTrigger,
	DrawerClose,
} from "@corensystem/coren-ui/drawer";
import {Button} from "@corensystem/coren-ui/button";
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function WithForm() {
	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button>Add Note</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>New Note</DrawerTitle>
					<DrawerDescription>
						Create a quick note.
					</DrawerDescription>
				</DrawerHeader>
				<div className="wwc:p-4 wwc:space-y-4">
					<div className="wwc:grid wwc:gap-2">
						<Label htmlFor="drawer-form-title">Title</Label>
						<Input id="drawer-form-title" placeholder="Note title" />
					</div>
					<div className="wwc:grid wwc:gap-2">
						<Label htmlFor="drawer-form-content">Content</Label>
						<Input id="drawer-form-content" placeholder="Note content" />
					</div>
				</div>
				<DrawerFooter>
					<Button>Save Note</Button>
					<DrawerClose asChild>
						<Button variant="outline">Cancel</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
