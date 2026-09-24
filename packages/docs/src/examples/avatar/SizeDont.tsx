/**
 * Avoid inconsistent avatar sizes in the same context.
 */
import {Avatar, AvatarFallback} from "@corensystem/coren-ui/avatar";

export function SizeDont() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-2">
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Avatar size="lg">
					<AvatarFallback size="lg">A</AvatarFallback>
				</Avatar>
				<span className="wwc:text-sm">Alice</span>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Avatar size="sm">
					<AvatarFallback size="sm">B</AvatarFallback>
				</Avatar>
				<span className="wwc:text-sm">Bob</span>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Avatar size="md">
					<AvatarFallback size="md">C</AvatarFallback>
				</Avatar>
				<span className="wwc:text-sm">Carol</span>
			</div>
		</div>
	);
}
