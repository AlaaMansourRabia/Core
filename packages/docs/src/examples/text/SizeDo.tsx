/**
 * Use smaller sizes for secondary information.
 */
import {Text} from "@corensystem/coren-ui/text";

export function SizeDo() {
	return (
		<div className="wwc:space-y-1">
			<Text>Main content</Text>
			<Text size="sm" variant="muted">Last updated: 2 hours ago</Text>
		</div>
	);
}
