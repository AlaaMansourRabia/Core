/**
 * Group related commands logically.
 */
import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@corensystem/coren-ui/command";
import {FileText, FolderOpen, FilePlus, Download, Trash, Settings, User} from "lucide-react";

export function GroupingDo() {
	return (
		<Command className="wwc:rounded-lg wwc:border wwc:shadow-md">
			<CommandInput placeholder="Search..." />
			<CommandList>
				<CommandGroup heading="File">
					<CommandItem>
						<FilePlus className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						New File
					</CommandItem>
					<CommandItem>
						<FolderOpen className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						Open
					</CommandItem>
					<CommandItem>
						<Download className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						Export
					</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading="Account">
					<CommandItem>
						<User className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						Profile
					</CommandItem>
					<CommandItem>
						<Settings className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						Settings
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</Command>
	);
}
