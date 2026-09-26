/**
 * Keep drawer content concise and actionable.
 */
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerFooter,
	DrawerTrigger,
	DrawerClose,
} from "@corensystem/coren-ui/drawer";
import {Button} from "@corensystem/coren-ui/button";

export function ContentDo() {
	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button>Quick Action</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Confirm Action</DrawerTitle>
				</DrawerHeader>
				<div className="wwc:p-4">
					<p className="wwc:text-center">
						Are you sure you want to proceed?
					</p>
				</div>
				<DrawerFooter>
					<Button>Confirm</Button>
					<DrawerClose asChild>
						<Button variant="outline">Cancel</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
