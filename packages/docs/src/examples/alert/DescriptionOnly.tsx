/**
 * Simple alert with description only.
 */
import {Alert, AlertDescription} from "@corensystem/coren-ui/alert";

export function DescriptionOnly() {
	return (
		<Alert>
			<AlertDescription>Your changes have been saved successfully.</AlertDescription>
		</Alert>
	);
}
