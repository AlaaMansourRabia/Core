/**
 * Always provide meaningful fallback initials.
 */
import {Avatar, AvatarFallback, AvatarImage} from "@corensystem/coren-ui/avatar";

export function FallbackDo() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-3">
			<Avatar>
				<AvatarImage src="/broken.jpg" alt="Jane Doe" />
				<AvatarFallback>JD</AvatarFallback>
			</Avatar>
			<span className="wwc:text-sm">Jane Doe</span>
		</div>
	);
}
