/**
 * Different avatar shapes.
 */
import {Avatar, AvatarFallback, AvatarImage} from "@corensystem/coren-ui/avatar";

export function Shapes() {
	return (
		<div className="wwc:flex wwc:gap-3">
			<Avatar shape="circle">
				<AvatarImage src="https://github.com/shadcn.png" alt="Circle" />
				<AvatarFallback>CI</AvatarFallback>
			</Avatar>
			<Avatar shape="rounded">
				<AvatarImage src="https://github.com/shadcn.png" alt="Rounded" />
				<AvatarFallback>RO</AvatarFallback>
			</Avatar>
			<Avatar shape="square">
				<AvatarImage src="https://github.com/shadcn.png" alt="Square" />
				<AvatarFallback>SQ</AvatarFallback>
			</Avatar>
		</div>
	);
}
