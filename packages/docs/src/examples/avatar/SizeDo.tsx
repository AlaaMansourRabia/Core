/**
 * Use consistent avatar sizes in lists and tables.
 */
import {Avatar, AvatarFallback, AvatarImage} from "@corensystem/coren-ui/avatar";

export function SizeDo() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-2">
			{["Alice", "Bob", "Carol"].map((name) => (
				<div key={name} className="wwc:flex wwc:items-center wwc:gap-2">
					<Avatar size="sm">
						<AvatarFallback size="sm">{name[0]}</AvatarFallback>
					</Avatar>
					<span className="wwc:text-sm">{name}</span>
				</div>
			))}
		</div>
	);
}
