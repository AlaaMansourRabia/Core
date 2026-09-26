/**
 * Status dots scale with avatar size.
 */
import {Avatar, AvatarFallback} from "@corensystem/coren-ui/avatar";
import {AvatarStatusDot} from "@corensystem/coren-ui/avatar-status-dot";

export function Sizes() {
	return (
		<div className="wwc:flex wwc:items-end wwc:gap-4">
			<div className="wwc:relative wwc:inline-block">
				<Avatar className="wwc:h-8 wwc:w-8"><AvatarFallback className="wwc:text-xs">SM</AvatarFallback></Avatar>
				<AvatarStatusDot variant="online" avatarSize="sm" />
			</div>
			<div className="wwc:relative wwc:inline-block">
				<Avatar><AvatarFallback>MD</AvatarFallback></Avatar>
				<AvatarStatusDot variant="online" avatarSize="md" />
			</div>
			<div className="wwc:relative wwc:inline-block">
				<Avatar className="wwc:h-12 wwc:w-12"><AvatarFallback>LG</AvatarFallback></Avatar>
				<AvatarStatusDot variant="online" avatarSize="lg" />
			</div>
		</div>
	);
}
