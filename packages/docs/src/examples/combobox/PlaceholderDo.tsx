/**
 * Use descriptive placeholder that indicates expected content.
 */
import * as React from "react";
import {ChevronsUpDown} from "lucide-react";
import {Button} from "@corensystem/coren-ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@corensystem/coren-ui/command";
import {Popover, PopoverContent, PopoverTrigger} from "@corensystem/coren-ui/popover";

const timezones = [
	{value: "pst", label: "Pacific Time (PT)"},
	{value: "mst", label: "Mountain Time (MT)"},
	{value: "cst", label: "Central Time (CT)"},
	{value: "est", label: "Eastern Time (ET)"},
];

export function PlaceholderDo() {
	const [open, setOpen] = React.useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					className="wwc:w-56 wwc:justify-between"
				>
					Select timezone...
					<ChevronsUpDown className="wwc:ml-2 wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="wwc:w-56 wwc:p-0">
				<Command>
					<CommandInput placeholder="Search timezone..." />
					<CommandList>
						<CommandEmpty>No timezone found.</CommandEmpty>
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
