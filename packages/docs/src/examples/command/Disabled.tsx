/**
 * Command items with disabled state.
 */
import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@corensystem/coren-ui/command";
import {Download, Upload, Share2, Lock} from "lucide-react";

export function Disabled() {
	return (
		<Command className="wwc:rounded-lg wwc:border wwc:shadow-md">
			<CommandInput placeholder="Search actions..." />
			<CommandList>
				<CommandGroup heading="Actions">
					<CommandItem>
						<Download className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						Download
					</CommandItem>
					<CommandItem>
						<Upload className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						Upload
					</CommandItem>
					<CommandItem disabled>
						<Share2 className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						Share
						<span className="wwc:ml-auto wwc:text-xs wwc:text-muted-foreground">
							Requires Pro
						</span>
					</CommandItem>
					<CommandItem disabled>
						<Lock className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						Admin Settings
						<span className="wwc:ml-auto wwc:text-xs wwc:text-muted-foreground">
							Admin only
						</span>
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</Command>
	);
}
