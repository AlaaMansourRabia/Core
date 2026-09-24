/**
 * Destructive alert for errors and warnings.
 */
import {Alert, AlertDescription, AlertTitle} from "@corensystem/coren-ui/alert";
import {AlertCircle} from "lucide-react";

export function Destructive() {
	return (
		<Alert variant="destructive">
			<AlertCircle className="wwc:h-4 wwc:w-4" />
			<AlertTitle>Error</AlertTitle>
			<AlertDescription>
				Your session has expired. Please log in again.
			</AlertDescription>
		</Alert>
	);
}
