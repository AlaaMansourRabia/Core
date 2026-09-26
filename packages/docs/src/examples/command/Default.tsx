/**
 * Basic command palette with search and groups.
 */
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@corensystem/coren-ui/command";
import {Calendar, Smile, Calculator, User, CreditCard, Settings} from "lucide-react";

export function Default() {
	return (
		<Command className="wwc:rounded-lg wwc:border wwc:shadow-md">
			<CommandInput placeholder="Type a command or search..." />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup heading="Suggestions">
					<CommandItem>
						<Calendar className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						<span>Calendar</span>
					</CommandItem>
					<CommandItem>
						<Smile className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						<span>Search Emoji</span>
					</CommandItem>
					<CommandItem>
						<Calculator className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						<span>Calculator</span>
					</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading="Settings">
					<CommandItem>
						<User className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						<span>Profile</span>
					</CommandItem>
					<CommandItem>
						<CreditCard className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						<span>Billing</span>
					</CommandItem>
					<CommandItem>
						<Settings className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						<span>Settings</span>
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</Command>
	);
}
