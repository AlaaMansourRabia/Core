/**
 * Drawer as an action sheet with multiple options.
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

export function ActionSheet() {
	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button variant="outline">Share</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Share to</DrawerTitle>
				</DrawerHeader>
				<div className="wwc:p-4 wwc:space-y-2">
					<DrawerClose asChild>
						<Button variant="ghost" className="wwc:w-full wwc:justify-start">
							Copy Link
						</Button>
					</DrawerClose>
					<DrawerClose asChild>
						<Button variant="ghost" className="wwc:w-full wwc:justify-start">
							Email
						</Button>
					</DrawerClose>
					<DrawerClose asChild>
						<Button variant="ghost" className="wwc:w-full wwc:justify-start">
							Message
						</Button>
					</DrawerClose>
					<DrawerClose asChild>
						<Button variant="ghost" className="wwc:w-full wwc:justify-start">
							More Options...
						</Button>
					</DrawerClose>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
