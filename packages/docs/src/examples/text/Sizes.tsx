/**
 * Text comes in five sizes: xs, sm, md, lg, and xl.
 */
import {Text} from "@corensystem/coren-ui/text";

export function Sizes() {
	return (
		<div className="wwc:space-y-2">
			<Text size="xs">Extra small text</Text>
			<Text size="sm">Small text</Text>
			<Text size="md">Medium text (default)</Text>
			<Text size="lg">Large text</Text>
			<Text size="xl">Extra large text</Text>
		</div>
	);
}
