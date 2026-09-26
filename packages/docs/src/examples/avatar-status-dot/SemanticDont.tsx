/**
 * Avoid misleading status indicators.
 */
import {Avatar, AvatarFallback} from "@corensystem/coren-ui/avatar";
import {AvatarStatusDot} from "@corensystem/coren-ui/avatar-status-dot";

export function SemanticDont() {
	return (
		<div className="wwc:relative wwc:inline-block">
			<Avatar><AvatarFallback>OF</AvatarFallback></Avatar>
			<AvatarStatusDot variant="online" label="Offline user" />
		</div>
	);
}
