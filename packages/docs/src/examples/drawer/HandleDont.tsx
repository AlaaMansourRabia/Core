import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid hiding swipe indicators on touch devices.
 */
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger} from "@corensystem/coren-ui/drawer";

export function HandleDont() {
	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button variant="outline">Open Menu</Button>
			</DrawerTrigger>
			<DrawerContent className="wwc:[&>div:first-child]:hidden">
				{/* Handle hidden - no visual swipe affordance */}
				<DrawerHeader>
					<DrawerTitle>Menu</DrawerTitle>
				</DrawerHeader>
				<div className="wwc:p-4">
					<p>No visible handle - unclear how to dismiss.</p>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
