/**
 * Avoid generic or unclear fallback content.
 */
import {Avatar, AvatarFallback, AvatarImage} from "@corensystem/coren-ui/avatar";

export function FallbackDont() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-3">
			<Avatar>
				<AvatarImage src="/broken.jpg" alt="User" />
				<AvatarFallback>?</AvatarFallback>
			</Avatar>
			<span className="wwc:text-sm">Jane Doe</span>
		</div>
	);
}
