/**
 * A vertical divider between inline elements.
 */
import {Divider} from "@corensystem/coren-ui/divider";

export function Vertical() {
	return (
		<div className="wwc:flex wwc:h-5 wwc:items-center wwc:space-x-4 wwc:text-sm">
			<span>Home</span>
			<Divider orientation="vertical" />
			<span>Profile</span>
			<Divider orientation="vertical" />
			<span>Settings</span>
		</div>
	);
}
