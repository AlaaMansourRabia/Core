/**
 * Text variants for different contexts.
 */
import {Text} from "@corensystem/coren-ui/text";

export function Variants() {
	return (
		<div className="wwc:space-y-2">
			<Text variant="default">Default text</Text>
			<Text variant="muted">Muted text</Text>
			<Text variant="accent">Accent text</Text>
			<Text variant="error">Error text</Text>
			<Text variant="success">Success text</Text>
		</div>
	);
}
