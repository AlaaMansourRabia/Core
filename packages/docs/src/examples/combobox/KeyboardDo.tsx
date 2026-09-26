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
import {Check, ChevronsUpDown} from "lucide-react";
/**
 * Support full keyboard navigation.
 */
import * as React from "react";

const options = [
	{value: "draft", label: "Draft"},
	{value: "published", label: "Published"},
	{value: "archived", label: "Archived"},
];

export function KeyboardDo() {
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState("");

	return (
		<div className="wwc:space-y-2">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						aria-haspopup="listbox"
						className="wwc:w-48 wwc:justify-between"
					>
						{value ? options.find((o) => o.value === value)?.label : "Select status..."}
						<ChevronsUpDown className="wwc:ml-2 wwc:h-4 wwc:w-4 wwc:opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="wwc:w-48 wwc:p-0">
					<Command>
						<CommandInput placeholder="Search..." />
						<CommandList>
							<CommandEmpty>No status found.</CommandEmpty>
							<CommandGroup>
								{options.map((option) => (
									<CommandItem
										key={option.value}
										value={option.value}
										onSelect={(currentValue) => {
											setValue(currentValue === value ? "" : currentValue);
											setOpen(false);
										}}
									>
										<Check
											className={`wwc:mr-2 wwc:h-4 wwc:w-4 ${
												value === option.value ? "wwc:opacity-100" : "wwc:opacity-0"
											}`}
										/>
										{option.label}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			<p className="wwc:text-xs wwc:text-muted-foreground">Press ↑↓ to navigate, Enter to select, Esc to close</p>
		</div>
	);
}
