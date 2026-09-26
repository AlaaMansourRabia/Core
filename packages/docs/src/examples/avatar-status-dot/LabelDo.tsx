/**
 * Always provide accessible labels.
 */
import {Avatar, AvatarFallback} from "@corensystem/coren-ui/avatar";
import {AvatarStatusDot} from "@corensystem/coren-ui/avatar-status-dot";

export function LabelDo() {
	return (
		<div className="wwc:relative wwc:inline-block">
			<Avatar>
				<AvatarFallback>JD</AvatarFallback>
			</Avatar>
			<AvatarStatusDot variant="online" label="User is online" />
		</div>
	);
}
