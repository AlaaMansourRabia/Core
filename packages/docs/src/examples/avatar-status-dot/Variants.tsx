/**
 * All status dot variants.
 */
import {Avatar, AvatarFallback} from "@corensystem/coren-ui/avatar";
import {AvatarStatusDot} from "@corensystem/coren-ui/avatar-status-dot";

export function Variants() {
	return (
		<div className="wwc:flex wwc:gap-4">
			<div className="wwc:relative wwc:inline-block">
				<Avatar>
					<AvatarFallback>ON</AvatarFallback>
				</Avatar>
				<AvatarStatusDot variant="online" label="Online" />
			</div>
			<div className="wwc:relative wwc:inline-block">
				<Avatar>
					<AvatarFallback>AW</AvatarFallback>
				</Avatar>
				<AvatarStatusDot variant="away" label="Away" />
			</div>
			<div className="wwc:relative wwc:inline-block">
				<Avatar>
					<AvatarFallback>BY</AvatarFallback>
				</Avatar>
				<AvatarStatusDot variant="busy" label="Busy" />
			</div>
			<div className="wwc:relative wwc:inline-block">
				<Avatar>
					<AvatarFallback>DN</AvatarFallback>
				</Avatar>
				<AvatarStatusDot variant="dnd" label="Do not disturb" />
			</div>
			<div className="wwc:relative wwc:inline-block">
				<Avatar>
					<AvatarFallback>OF</AvatarFallback>
				</Avatar>
				<AvatarStatusDot variant="offline" label="Offline" />
			</div>
		</div>
	);
}
