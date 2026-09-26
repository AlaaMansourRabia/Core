import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid putting too much content in a drawer.
 */
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger} from "@corensystem/coren-ui/drawer";

export function ContentDont() {
	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button variant="outline">View All</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>All Information</DrawerTitle>
				</DrawerHeader>
				<div className="wwc:p-4 wwc:space-y-4 wwc:max-h-96 wwc:overflow-y-auto">
					{Array.from({length: 10}, (_, i) => (
						<p key={i}>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Extensive content that requires scrolling.
						</p>
					))}
				</div>
			</DrawerContent>
		</Drawer>
	);
}
