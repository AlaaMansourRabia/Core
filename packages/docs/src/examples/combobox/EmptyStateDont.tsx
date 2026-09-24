/**
 * Avoid unhelpful or missing empty states.
 */
import * as React from "react";
import {ChevronsUpDown} from "lucide-react";
import {Button} from "@corensystem/coren-ui/button";
import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@corensystem/coren-ui/command";
import {Popover, PopoverContent, PopoverTrigger} from "@corensystem/coren-ui/popover";

const users = [
	{value: "alice", label: "Alice Smith"},
	{value: "bob", label: "Bob Johnson"},
];

export function EmptyStateDont() {
	const [open, setOpen] = React.useState(false);
	const [search, setSearch] = React.useState("xyz");

	const filtered = users.filter((u) =>
		u.label.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" className="wwc:w-56 wwc:justify-between">
					Select assignee...
					<ChevronsUpDown className="wwc:ml-2 wwc:h-4 wwc:w-4 wwc:opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="wwc:w-56 wwc:p-0">
				<Command>
					<CommandInput
						placeholder="Search..."
						value={search}
						onValueChange={setSearch}
					/>
					<CommandList>
						{/* Empty list with no feedback - confusing */}
						<CommandGroup>
							{filtered.map((user) => (
								<CommandItem key={user.value} value={user.value}>
									{user.label}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
