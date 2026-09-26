import {
	Menubar,
	MenubarCheckboxItem,
	MenubarContent,
	MenubarMenu,
	MenubarRadioGroup,
	MenubarRadioItem,
	MenubarSeparator,
	MenubarTrigger,
} from "@corensystem/coren-ui/menubar";
/**
 * Menubar with checkbox and radio items.
 */
import * as React from "react";

export function WithCheckboxes() {
	const [showBookmarks, setShowBookmarks] = React.useState(true);
	const [showHistory, setShowHistory] = React.useState(false);
	const [zoom, setZoom] = React.useState("100");

	return (
		<Menubar>
			<MenubarMenu>
				<MenubarTrigger>View</MenubarTrigger>
				<MenubarContent>
					<MenubarCheckboxItem checked={showBookmarks} onCheckedChange={setShowBookmarks}>
						Show Bookmarks Bar
					</MenubarCheckboxItem>
					<MenubarCheckboxItem checked={showHistory} onCheckedChange={setShowHistory}>
						Show History Panel
					</MenubarCheckboxItem>
					<MenubarSeparator />
					<MenubarRadioGroup value={zoom} onValueChange={setZoom}>
						<MenubarRadioItem value="75">Zoom 75%</MenubarRadioItem>
						<MenubarRadioItem value="100">Zoom 100%</MenubarRadioItem>
						<MenubarRadioItem value="125">Zoom 125%</MenubarRadioItem>
						<MenubarRadioItem value="150">Zoom 150%</MenubarRadioItem>
					</MenubarRadioGroup>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	);
}
