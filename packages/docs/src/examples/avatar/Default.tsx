/**
 * Default avatar with image.
 */
import {Avatar, AvatarFallback, AvatarImage} from "@corensystem/coren-ui/avatar";

export function Default() {
	return (
		<Avatar>
			<AvatarImage src="https://github.com/shadcn.png" alt="User" />
			<AvatarFallback>CN</AvatarFallback>
		</Avatar>
	);
}
