/**
 * Always include descriptive alt text for accessibility.
 */
import {Avatar, AvatarFallback, AvatarImage} from "@corensystem/coren-ui/avatar";

export function AltDo() {
	return (
		<Avatar>
			<AvatarImage src="https://github.com/shadcn.png" alt="Profile photo of Jane Doe" />
			<AvatarFallback>JD</AvatarFallback>
		</Avatar>
	);
}
