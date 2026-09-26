/**
 * Provide helpful empty state with guidance.
 */
import * as React from "react";
import {ChevronsUpDown, Search} from "lucide-react";
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

export function EmptyStateDo() {
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
						placeholder="Search by name..."
						value={search}
						onValueChange={setSearch}
					/>
					<CommandList>
						{filtered.length === 0 ? (
							<div className="wwc:py-6 wwc:text-center">
								<Search className="wwc:mx-auto wwc:h-8 wwc:w-8 wwc:text-muted-foreground/50" />
								<p className="wwc:mt-2 wwc:text-sm wwc:text-muted-foreground">
									No users match "{search}"
								</p>
								<p className="wwc:text-xs wwc:text-muted-foreground">
									Try a different search term
								</p>
							</div>
						) : (
							<CommandGroup>
								{filtered.map((user) => (
									<CommandItem key={user.value} value={user.value}>
										{user.label}
									</CommandItem>
								))}
							</CommandGroup>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
