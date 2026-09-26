/**
 * Avatar with online status indicator.
 */
import {Avatar, AvatarFallback} from "@corensystem/coren-ui/avatar";
import {AvatarStatusDot} from "@corensystem/coren-ui/avatar-status-dot";

export function Default() {
	return (
		<div className="wwc:relative wwc:inline-block">
			<Avatar>
				<AvatarFallback>JD</AvatarFallback>
			</Avatar>
			<AvatarStatusDot variant="online" />
		</div>
	);
}
