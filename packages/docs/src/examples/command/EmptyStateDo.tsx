/**
 * Provide helpful empty state messaging.
 */
import {Command, CommandGroup, CommandInput, CommandItem, CommandList} from "@corensystem/coren-ui/command";
import {Search, HelpCircle} from "lucide-react";

export function EmptyStateDo() {
	return (
		<Command className="wwc:rounded-lg wwc:border wwc:shadow-md">
			<CommandInput placeholder="Search commands..." value="asdfghjk" />
			<CommandList>
				<div className="wwc:py-6 wwc:text-center">
					<Search className="wwc:mx-auto wwc:h-10 wwc:w-10 wwc:text-muted-foreground/50" />
					<p className="wwc:mt-3 wwc:text-sm wwc:text-muted-foreground">No commands match your search</p>
					<p className="wwc:mt-1 wwc:text-xs wwc:text-muted-foreground">
						Try different keywords or <span className="wwc:text-primary wwc:cursor-pointer">browse all commands</span>
					</p>
				</div>
			</CommandList>
		</Command>
	);
}
