/**
 * Avoid status dots without labels.
 */
import {Avatar, AvatarFallback} from "@corensystem/coren-ui/avatar";
import {AvatarStatusDot} from "@corensystem/coren-ui/avatar-status-dot";

export function LabelDont() {
	return (
		<div className="wwc:relative wwc:inline-block">
			<Avatar>
				<AvatarFallback>JD</AvatarFallback>
			</Avatar>
			<AvatarStatusDot variant="online" />
		</div>
	);
}
