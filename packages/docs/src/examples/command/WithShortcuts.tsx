/**
 * Command items with keyboard shortcuts.
 */
import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandShortcut,
} from "@corensystem/coren-ui/command";
import {Copy, Clipboard, Scissors, Trash, Save, Undo, Redo} from "lucide-react";

export function WithShortcuts() {
	return (
		<Command className="wwc:rounded-lg wwc:border wwc:shadow-md">
			<CommandInput placeholder="Search commands..." />
			<CommandList>
				<CommandGroup heading="Edit">
					<CommandItem>
						<Undo className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						Undo
						<CommandShortcut>⌘Z</CommandShortcut>
					</CommandItem>
					<CommandItem>
						<Redo className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						Redo
						<CommandShortcut>⇧⌘Z</CommandShortcut>
					</CommandItem>
					<CommandItem>
						<Scissors className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						Cut
						<CommandShortcut>⌘X</CommandShortcut>
					</CommandItem>
					<CommandItem>
						<Copy className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						Copy
						<CommandShortcut>⌘C</CommandShortcut>
					</CommandItem>
					<CommandItem>
						<Clipboard className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						Paste
						<CommandShortcut>⌘V</CommandShortcut>
					</CommandItem>
				</CommandGroup>
				<CommandGroup heading="File">
					<CommandItem>
						<Save className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						Save
						<CommandShortcut>⌘S</CommandShortcut>
					</CommandItem>
					<CommandItem>
						<Trash className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						Delete
						<CommandShortcut>⌘⌫</CommandShortcut>
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</Command>
	);
}
