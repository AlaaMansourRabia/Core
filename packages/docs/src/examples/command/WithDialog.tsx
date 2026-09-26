import {Button} from "@corensystem/coren-ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandShortcut,
} from "@corensystem/coren-ui/command";
import {Dialog, DialogContent} from "@corensystem/coren-ui/dialog";
import {FileText, Settings, User, Search} from "lucide-react";
/**
 * Command palette in a dialog with keyboard shortcut.
 */
import * as React from "react";

export function WithDialog() {
	const [open, setOpen] = React.useState(false);

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((o) => !o);
			}
		};
		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	return (
		<>
			<Button variant="outline" onClick={() => setOpen(true)}>
				<Search className="wwc:mr-2 wwc:h-4 wwc:w-4" />
				Search...
				<kbd className="wwc:ml-4 wwc:pointer-events-none wwc:hidden wwc:h-5 wwc:select-none wwc:items-center wwc:gap-1 wwc:rounded wwc:border wwc:bg-muted wwc:px-1.5 wwc:font-mono wwc:text-xs wwc:font-medium sm:wwc:inline-flex">
					⌘K
				</kbd>
			</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="wwc:p-0">
					<Command>
						<CommandInput placeholder="Type a command or search..." />
						<CommandList>
							<CommandEmpty>No results found.</CommandEmpty>
							<CommandGroup heading="Quick Actions">
								<CommandItem>
									<FileText className="wwc:mr-2 wwc:h-4 wwc:w-4" />
									New Document
									<CommandShortcut>⌘N</CommandShortcut>
								</CommandItem>
								<CommandItem>
									<User className="wwc:mr-2 wwc:h-4 wwc:w-4" />
									Go to Profile
									<CommandShortcut>⌘P</CommandShortcut>
								</CommandItem>
								<CommandItem>
									<Settings className="wwc:mr-2 wwc:h-4 wwc:w-4" />
									Settings
									<CommandShortcut>⌘,</CommandShortcut>
								</CommandItem>
							</CommandGroup>
						</CommandList>
					</Command>
				</DialogContent>
			</Dialog>
		</>
	);
}
