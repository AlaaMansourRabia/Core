/**
 * Toolbar with toggle buttons.
 */
import * as React from "react";
import {Toolbar, ToolbarSeparator, ToolbarButton} from "@corensystem/coren-ui/toolbar";
import {ToggleGroup, ToggleGroupItem} from "@corensystem/coren-ui/toggle-group";
import {Bold, Italic, Underline, Link} from "lucide-react";

export function WithToggle() {
	const [formatting, setFormatting] = React.useState<string[]>([]);

	return (
		<Toolbar className="wwc:border wwc:rounded-md wwc:p-1">
			<ToggleGroup
				type="multiple"
				value={formatting}
				onValueChange={setFormatting}
				className="wwc:flex wwc:gap-1"
			>
				<ToggleGroupItem value="bold" aria-label="Toggle bold" size="sm">
					<Bold className="wwc:h-4 wwc:w-4" />
				</ToggleGroupItem>
				<ToggleGroupItem value="italic" aria-label="Toggle italic" size="sm">
					<Italic className="wwc:h-4 wwc:w-4" />
				</ToggleGroupItem>
				<ToggleGroupItem value="underline" aria-label="Toggle underline" size="sm">
					<Underline className="wwc:h-4 wwc:w-4" />
				</ToggleGroupItem>
			</ToggleGroup>
			<ToolbarSeparator />
			<ToolbarButton aria-label="Insert link">
				<Link className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
		</Toolbar>
	);
}
