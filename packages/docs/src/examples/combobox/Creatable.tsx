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
import {Check, ChevronsUpDown, Plus} from "lucide-react";
/**
 * Combobox that allows creating new options.
 */
import * as React from "react";

export function Creatable() {
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState("");
	const [search, setSearch] = React.useState("");
	const [tags, setTags] = React.useState([
		{value: "bug", label: "Bug"},
		{value: "feature", label: "Feature"},
		{value: "docs", label: "Documentation"},
	]);

	const createTag = () => {
		const newTag = {value: search.toLowerCase(), label: search};
		setTags([...tags, newTag]);
		setValue(newTag.value);
		setSearch("");
		setOpen(false);
	};

	const filteredTags = tags.filter((tag) => tag.label.toLowerCase().includes(search.toLowerCase()));

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" role="combobox" aria-expanded={open} className="wwc:w-52 wwc:justify-between">
					{value ? tags.find((t) => t.value === value)?.label : "Select tag..."}
					<ChevronsUpDown className="wwc:ml-2 wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="wwc:w-52 wwc:p-0">
				<Command>
					<CommandInput placeholder="Search or create..." value={search} onValueChange={setSearch} />
					<CommandList>
						{filteredTags.length === 0 && !search && <CommandEmpty>No tags found.</CommandEmpty>}
						<CommandGroup>
							{filteredTags.map((tag) => (
								<CommandItem
									key={tag.value}
									value={tag.value}
									onSelect={(currentValue) => {
										setValue(currentValue === value ? "" : currentValue);
										setOpen(false);
									}}
								>
									<Check
										className={`wwc:mr-2 wwc:h-4 wwc:w-4 ${value === tag.value ? "wwc:opacity-100" : "wwc:opacity-0"}`}
									/>
									{tag.label}
								</CommandItem>
							))}
						</CommandGroup>
						{search && !tags.some((t) => t.label.toLowerCase() === search.toLowerCase()) && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem onSelect={createTag}>
										<Plus className="wwc:mr-2 wwc:h-4 wwc:w-4" />
										Create "{search}"
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
