import {Button} from "@corensystem/coren-ui/button";
/**
 * Keep the drag handle visible for swipe affordance.
 */
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger} from "@corensystem/coren-ui/drawer";

export function HandleDo() {
	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button>Open Menu</Button>
			</DrawerTrigger>
			<DrawerContent>
				{/* Default drawer has visible handle */}
				<DrawerHeader>
					<DrawerTitle>Menu</DrawerTitle>
				</DrawerHeader>
				<div className="wwc:p-4">
					<p>Swipe down to dismiss.</p>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
