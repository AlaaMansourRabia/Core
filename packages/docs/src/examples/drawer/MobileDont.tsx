/**
 * Avoid drawers for complex desktop workflows.
 */
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@corensystem/coren-ui/drawer";
import {Button} from "@corensystem/coren-ui/button";
import {Input} from "@corensystem/coren-ui/input";

export function MobileDont() {
	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button variant="outline">Advanced Settings</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Advanced Configuration</DrawerTitle>
				</DrawerHeader>
				<div className="wwc:p-4 wwc:space-y-2 wwc:text-sm">
					<Input placeholder="Setting 1" />
					<Input placeholder="Setting 2" />
					<Input placeholder="Setting 3" />
					<p className="wwc:text-muted-foreground">
						Complex forms work better in a dialog or full page.
					</p>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
