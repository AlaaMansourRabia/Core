/**
 * Avoid missing or unhelpful alt text.
 */
import {Avatar, AvatarFallback, AvatarImage} from "@corensystem/coren-ui/avatar";

export function AltDont() {
	return (
		<Avatar>
			<AvatarImage src="https://github.com/shadcn.png" alt="" />
			<AvatarFallback>JD</AvatarFallback>
		</Avatar>
	);
}
