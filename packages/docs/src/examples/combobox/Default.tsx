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
 * Basic combobox with search and selection.
 */
import * as React from "react";

const frameworks = [
	{value: "next", label: "Next.js"},
	{value: "remix", label: "Remix"},
	{value: "astro", label: "Astro"},
	{value: "nuxt", label: "Nuxt"},
	{value: "svelte", label: "SvelteKit"},
];

export function Default() {
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState("");

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" role="combobox" aria-expanded={open} className="wwc:w-52 wwc:justify-between">
					{value ? frameworks.find((f) => f.value === value)?.label : "Select framework..."}
					<ChevronsUpDown className="wwc:ml-2 wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="wwc:w-52 wwc:p-0">
				<Command>
					<CommandInput placeholder="Search framework..." />
					<CommandList>
						<CommandEmpty>No framework found.</CommandEmpty>
						<CommandGroup>
							{frameworks.map((framework) => (
								<CommandItem
									key={framework.value}
									value={framework.value}
									onSelect={(currentValue) => {
										setValue(currentValue === value ? "" : currentValue);
										setOpen(false);
									}}
								>
									<Check
										className={`wwc:mr-2 wwc:h-4 wwc:w-4 ${
											value === framework.value ? "wwc:opacity-100" : "wwc:opacity-0"
										}`}
									/>
									{framework.label}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
