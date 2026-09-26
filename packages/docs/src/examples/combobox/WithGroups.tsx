import {Button} from "@corensystem/coren-ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@corensystem/coren-ui/command";
import {Popover, PopoverContent, PopoverTrigger} from "@corensystem/coren-ui/popover";
import {Check, ChevronsUpDown} from "lucide-react";
/**
 * Combobox with grouped options.
 */
import * as React from "react";

const regions = [
	{
		group: "North America",
		items: [
			{value: "us", label: "United States"},
			{value: "ca", label: "Canada"},
		],
	},
	{
		group: "Europe",
		items: [
			{value: "uk", label: "United Kingdom"},
			{value: "de", label: "Germany"},
			{value: "fr", label: "France"},
		],
	},
	{
		group: "Asia Pacific",
		items: [
			{value: "jp", label: "Japan"},
			{value: "au", label: "Australia"},
		],
	},
];

export function WithGroups() {
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState("");

	const allItems = regions.flatMap((r) => r.items);
	const selected = allItems.find((item) => item.value === value);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" role="combobox" aria-expanded={open} className="wwc:w-52 wwc:justify-between">
					{selected?.label || "Select region..."}
					<ChevronsUpDown className="wwc:ml-2 wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="wwc:w-52 wwc:p-0">
				<Command>
					<CommandInput placeholder="Search region..." />
					<CommandList>
						<CommandEmpty>No region found.</CommandEmpty>
						{regions.map((region, index) => (
							<React.Fragment key={region.group}>
								{index > 0 && <CommandSeparator />}
								<CommandGroup heading={region.group}>
									{region.items.map((item) => (
										<CommandItem
											key={item.value}
											value={item.value}
											onSelect={(currentValue) => {
												setValue(currentValue === value ? "" : currentValue);
												setOpen(false);
											}}
										>
											<Check
												className={`wwc:mr-2 wwc:h-4 wwc:w-4 ${
													value === item.value ? "wwc:opacity-100" : "wwc:opacity-0"
												}`}
											/>
											{item.label}
										</CommandItem>
									))}
								</CommandGroup>
							</React.Fragment>
						))}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
