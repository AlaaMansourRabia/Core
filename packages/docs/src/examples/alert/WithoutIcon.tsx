/**
 * Alert without an icon.
 */
import {Alert, AlertDescription, AlertTitle} from "@corensystem/coren-ui/alert";

export function WithoutIcon() {
	return (
		<Alert>
			<AlertTitle>Note</AlertTitle>
			<AlertDescription>
				This is an alert without an icon for simpler messaging.
			</AlertDescription>
		</Alert>
	);
}
