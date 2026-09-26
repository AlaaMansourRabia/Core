/**
 * Use consistent, recognizable icons for commands.
 */
import {Command, CommandGroup, CommandInput, CommandItem, CommandList} from "@corensystem/coren-ui/command";
import {Home, FileText, Folder, Search, Bell, HelpCircle} from "lucide-react";

export function IconsDo() {
	return (
		<Command className="wwc:rounded-lg wwc:border wwc:shadow-md">
			<CommandInput placeholder="Navigate to..." />
			<CommandList>
				<CommandGroup heading="Pages">
					<CommandItem>
						<Home className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						Home
					</CommandItem>
					<CommandItem>
						<FileText className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						Documents
					</CommandItem>
					<CommandItem>
						<Folder className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						Projects
					</CommandItem>
					<CommandItem>
						<Search className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						Search
					</CommandItem>
					<CommandItem>
						<Bell className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						Notifications
					</CommandItem>
					<CommandItem>
						<HelpCircle className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						Help
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</Command>
	);
}
