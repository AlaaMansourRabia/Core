/**
 * Pulsing animation for active status.
 */
import {Avatar, AvatarFallback} from "@corensystem/coren-ui/avatar";
import {AvatarStatusDot} from "@corensystem/coren-ui/avatar-status-dot";

export function Pulsing() {
	return (
		<div className="wwc:relative wwc:inline-block">
			<Avatar>
				<AvatarFallback>AC</AvatarFallback>
			</Avatar>
			<AvatarStatusDot variant="online" pulse label="Active now" />
		</div>
	);
}
