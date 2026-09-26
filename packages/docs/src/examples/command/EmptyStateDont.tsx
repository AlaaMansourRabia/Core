/**
 * Avoid unhelpful or missing empty states.
 */
import {
	Command,
	CommandInput,
	CommandList,
} from "@corensystem/coren-ui/command";

export function EmptyStateDont() {
	return (
		<Command className="wwc:rounded-lg wwc:border wwc:shadow-md">
			<CommandInput placeholder="Search commands..." value="asdfghjk" />
			<CommandList>
				{/* Empty list with no feedback */}
				<div className="wwc:h-16" />
			</CommandList>
		</Command>
	);
}
