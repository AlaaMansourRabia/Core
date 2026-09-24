/**
 * Use appropriate status for the context.
 */
import {Avatar, AvatarFallback} from "@corensystem/coren-ui/avatar";
import {AvatarStatusDot} from "@corensystem/coren-ui/avatar-status-dot";

export function SemanticDo() {
	return (
		<div className="wwc:relative wwc:inline-block">
			<Avatar><AvatarFallback>BY</AvatarFallback></Avatar>
			<AvatarStatusDot variant="busy" label="In a meeting" />
		</div>
	);
}
