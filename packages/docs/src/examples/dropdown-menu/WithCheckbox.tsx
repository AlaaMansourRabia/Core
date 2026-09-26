import {Button} from "@corensystem/coren-ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuCheckboxItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@corensystem/coren-ui/dropdown-menu";
/**
 * Dropdown menu with checkable items.
 */
import * as React from "react";

export function WithCheckbox() {
	const [showStatusBar, setShowStatusBar] = React.useState(true);
	const [showPanel, setShowPanel] = React.useState(false);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">View</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="wwc:w-56">
				<DropdownMenuLabel>Appearance</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuCheckboxItem checked={showStatusBar} onCheckedChange={setShowStatusBar}>
					Status Bar
				</DropdownMenuCheckboxItem>
				<DropdownMenuCheckboxItem checked={showPanel} onCheckedChange={setShowPanel}>
					Activity Panel
				</DropdownMenuCheckboxItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
