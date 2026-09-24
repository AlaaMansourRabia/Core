/**
 * Avoid using error variant for non-error content.
 */
import {Text} from "@corensystem/coren-ui/text";

export function VariantDont() {
	return <Text variant="error">Welcome to our platform!</Text>;
}
