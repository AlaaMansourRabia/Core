/**
 * Avatar fallback with initials when image fails to load.
 */
import {Avatar, AvatarFallback, AvatarImage} from "@corensystem/coren-ui/avatar";

export function Fallback() {
	return (
		<div className="wwc:flex wwc:gap-3">
			<Avatar>
				<AvatarImage src="/broken-image.jpg" alt="JD" />
				<AvatarFallback>JD</AvatarFallback>
			</Avatar>
			<Avatar>
				<AvatarImage src="/broken-image.jpg" alt="AB" />
				<AvatarFallback>AB</AvatarFallback>
			</Avatar>
			<Avatar>
				<AvatarImage src="/broken-image.jpg" alt="MK" />
				<AvatarFallback>MK</AvatarFallback>
			</Avatar>
		</div>
	);
}
