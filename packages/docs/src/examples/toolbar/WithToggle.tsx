/**
 * Toolbar with toggle buttons.
 */
import * as React from "react";
import {Toolbar, ToolbarToggleGroup, ToolbarToggleItem, ToolbarSeparator, ToolbarButton} from "@corensystem/coren-ui/toolbar";
import {Bold, Italic, Underline, Link} from "lucide-react";

export function WithToggle() {
	const [formatting, setFormatting] = React.useState<string[]>([]);

	return (
		<Toolbar className="wwc:border wwc:rounded-md wwc:p-1">
			<ToolbarToggleGroup
				type="multiple"
				value={formatting}
				onValueChange={setFormatting}
			>
				<ToolbarToggleItem value="bold" aria-label="Toggle bold">
					<Bold className="wwc:h-4 wwc:w-4" />
				</ToolbarToggleItem>
				<ToolbarToggleItem value="italic" aria-label="Toggle italic">
					<Italic className="wwc:h-4 wwc:w-4" />
				</ToolbarToggleItem>
				<ToolbarToggleItem value="underline" aria-label="Toggle underline">
					<Underline className="wwc:h-4 wwc:w-4" />
				</ToolbarToggleItem>
			</ToolbarToggleGroup>
			<ToolbarSeparator />
			<ToolbarButton aria-label="Insert link">
				<Link className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
		</Toolbar>
	);
}
