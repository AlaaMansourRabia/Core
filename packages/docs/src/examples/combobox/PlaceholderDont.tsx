import {Button} from "@corensystem/coren-ui/button";
import {Command, CommandGroup, CommandInput, CommandItem, CommandList} from "@corensystem/coren-ui/command";
import {Popover, PopoverContent, PopoverTrigger} from "@corensystem/coren-ui/popover";
import {ChevronsUpDown} from "lucide-react";
/**
 * Avoid generic or unhelpful placeholders.
 */
import * as React from "react";

const timezones = [
	{value: "pst", label: "Pacific Time (PT)"},
	{value: "est", label: "Eastern Time (ET)"},
];

export function PlaceholderDont() {
	const [open, setOpen] = React.useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" role="combobox" className="wwc:w-56 wwc:justify-between">
					{/* Generic placeholder - not helpful */}
					Select...
					<ChevronsUpDown className="wwc:ml-2 wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="wwc:w-56 wwc:p-0">
				<Command>
					{/* Generic search placeholder */}
					<CommandInput placeholder="Type here..." />
					<CommandList>
						<CommandGroup>
							{timezones.map((tz) => (
								<CommandItem key={tz.value} value={tz.value}>
									{tz.label}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
