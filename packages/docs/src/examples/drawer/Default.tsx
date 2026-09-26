import {Button} from "@corensystem/coren-ui/button";
/**
 * Basic drawer sliding from bottom.
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

export function Default() {
	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button variant="outline">Open Drawer</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Drawer Title</DrawerTitle>
					<DrawerDescription>This is a drawer component built on Vaul.</DrawerDescription>
				</DrawerHeader>
				<div className="wwc:p-4">
					<p>Drawer content goes here.</p>
				</div>
				<DrawerFooter>
					<Button>Submit</Button>
					<DrawerClose asChild>
						<Button variant="outline">Cancel</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
