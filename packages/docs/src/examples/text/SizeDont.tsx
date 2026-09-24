/**
 * Avoid using the same size for all text regardless of importance.
 */
import {Text} from "@corensystem/coren-ui/text";

export function SizeDont() {
	return (
		<div className="wwc:space-y-1">
			<Text>Main content</Text>
			<Text>Last updated: 2 hours ago</Text>
		</div>
	);
}
