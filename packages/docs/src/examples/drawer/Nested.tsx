import {Button} from "@corensystem/coren-ui/button";
/**
 * Nested drawers for multi-step flows.
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

export function Nested() {
	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button>Open Flow</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Step 1</DrawerTitle>
					<DrawerDescription>First step of the flow.</DrawerDescription>
				</DrawerHeader>
				<div className="wwc:p-4">
					<p>Step 1 content.</p>
				</div>
				<DrawerFooter>
					<Drawer>
						<DrawerTrigger asChild>
							<Button>Continue to Step 2</Button>
						</DrawerTrigger>
						<DrawerContent>
							<DrawerHeader>
								<DrawerTitle>Step 2</DrawerTitle>
								<DrawerDescription>Second step of the flow.</DrawerDescription>
							</DrawerHeader>
							<div className="wwc:p-4">
								<p>Step 2 content.</p>
							</div>
							<DrawerFooter>
								<DrawerClose asChild>
									<Button>Complete</Button>
								</DrawerClose>
							</DrawerFooter>
						</DrawerContent>
					</Drawer>
					<DrawerClose asChild>
						<Button variant="outline">Cancel</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
