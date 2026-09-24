/**
 * Match avatarSize prop to actual avatar size.
 */
import {Avatar, AvatarFallback} from "@corensystem/coren-ui/avatar";
import {AvatarStatusDot} from "@corensystem/coren-ui/avatar-status-dot";

export function SizeDo() {
	return (
		<div className="wwc:relative wwc:inline-block">
			<Avatar className="wwc:h-12 wwc:w-12"><AvatarFallback>LG</AvatarFallback></Avatar>
			<AvatarStatusDot variant="online" avatarSize="lg" />
		</div>
	);
}
