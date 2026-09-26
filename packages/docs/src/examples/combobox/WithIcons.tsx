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
import {Check, ChevronsUpDown, Code, MessageCircle, Users, Globe} from "lucide-react";
/**
 * Combobox with icons for each option.
 */
import * as React from "react";

const platforms = [
	{value: "code", label: "Code", icon: Code},
	{value: "messages", label: "Messages", icon: MessageCircle},
	{value: "team", label: "Team", icon: Users},
	{value: "website", label: "Website", icon: Globe},
];

export function WithIcons() {
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState("");

	const selected = platforms.find((p) => p.value === value);
	const SelectedIcon = selected?.icon;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" role="combobox" aria-expanded={open} className="wwc:w-52 wwc:justify-between">
					<span className="wwc:flex wwc:items-center wwc:gap-2">
						{SelectedIcon && <SelectedIcon className="wwc:h-4 wwc:w-4" />}
						{selected?.label || "Select platform..."}
					</span>
					<ChevronsUpDown className="wwc:ml-2 wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="wwc:w-52 wwc:p-0">
				<Command>
					<CommandInput placeholder="Search platform..." />
					<CommandList>
						<CommandEmpty>No platform found.</CommandEmpty>
						<CommandGroup>
							{platforms.map((platform) => {
								const Icon = platform.icon;
								return (
									<CommandItem
										key={platform.value}
										value={platform.value}
										onSelect={(currentValue) => {
											setValue(currentValue === value ? "" : currentValue);
											setOpen(false);
										}}
									>
										<Check
											className={`wwc:mr-2 wwc:h-4 wwc:w-4 ${
												value === platform.value ? "wwc:opacity-100" : "wwc:opacity-0"
											}`}
										/>
										<Icon className="wwc:mr-2 wwc:h-4 wwc:w-4" />
										{platform.label}
									</CommandItem>
								);
							})}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
