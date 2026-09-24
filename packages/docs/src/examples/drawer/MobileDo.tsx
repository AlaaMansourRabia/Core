/**
 * Use drawers for mobile-friendly action sheets.
 */
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
	DrawerClose,
} from "@corensystem/coren-ui/drawer";
import {Button} from "@corensystem/coren-ui/button";

export function MobileDo() {
	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button>Filter Results</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Filter Options</DrawerTitle>
				</DrawerHeader>
				<div className="wwc:p-4 wwc:space-y-3">
					<DrawerClose asChild>
						<Button variant="outline" className="wwc:w-full">All Items</Button>
					</DrawerClose>
					<DrawerClose asChild>
						<Button variant="outline" className="wwc:w-full">Active Only</Button>
					</DrawerClose>
					<DrawerClose asChild>
						<Button variant="outline" className="wwc:w-full">Archived</Button>
					</DrawerClose>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
