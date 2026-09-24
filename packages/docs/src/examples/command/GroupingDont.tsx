/**
 * Avoid mixing unrelated commands without grouping.
 */
import {
	Command,
	CommandInput,
	CommandItem,
	CommandList,
} from "@corensystem/coren-ui/command";
import {FileText, Settings, Download, User, FilePlus, Trash} from "lucide-react";

export function GroupingDont() {
	return (
		<Command className="wwc:rounded-lg wwc:border wwc:shadow-md">
			<CommandInput placeholder="Search..." />
			<CommandList>
				{/* All items in flat list without grouping - confusing */}
				<CommandItem>
					<FilePlus className="wwc:mr-2 wwc:h-4 wwc:w-4" />
					New File
				</CommandItem>
				<CommandItem>
					<User className="wwc:mr-2 wwc:h-4 wwc:w-4" />
					Profile
				</CommandItem>
				<CommandItem>
					<Download className="wwc:mr-2 wwc:h-4 wwc:w-4" />
					Export
				</CommandItem>
				<CommandItem>
					<Settings className="wwc:mr-2 wwc:h-4 wwc:w-4" />
					Settings
				</CommandItem>
				<CommandItem>
					<Trash className="wwc:mr-2 wwc:h-4 wwc:w-4" />
					Delete
				</CommandItem>
				<CommandItem>
					<FileText className="wwc:mr-2 wwc:h-4 wwc:w-4" />
					Documents
				</CommandItem>
			</CommandList>
		</Command>
	);
}
