/**
 * Available avatar sizes.
 */
import {Avatar, AvatarFallback, AvatarImage} from "@corensystem/coren-ui/avatar";

export function Sizes() {
	return (
		<div className="wwc:flex wwc:items-end wwc:gap-3">
			<Avatar size="xs">
				<AvatarImage src="https://github.com/shadcn.png" alt="XS" />
				<AvatarFallback size="xs">XS</AvatarFallback>
			</Avatar>
			<Avatar size="sm">
				<AvatarImage src="https://github.com/shadcn.png" alt="SM" />
				<AvatarFallback size="sm">SM</AvatarFallback>
			</Avatar>
			<Avatar size="md">
				<AvatarImage src="https://github.com/shadcn.png" alt="MD" />
				<AvatarFallback size="md">MD</AvatarFallback>
			</Avatar>
			<Avatar size="lg">
				<AvatarImage src="https://github.com/shadcn.png" alt="LG" />
				<AvatarFallback size="lg">LG</AvatarFallback>
			</Avatar>
			<Avatar size="xl">
				<AvatarImage src="https://github.com/shadcn.png" alt="XL" />
				<AvatarFallback size="xl">XL</AvatarFallback>
			</Avatar>
		</div>
	);
}
