/**
 * Basic informational alert.
 */
import {Alert, AlertDescription, AlertTitle} from "@corensystem/coren-ui/alert";
import {Info} from "lucide-react";

export function Default() {
	return (
		<Alert>
			<Info className="wwc:h-4 wwc:w-4" />
			<AlertTitle>Heads up!</AlertTitle>
			<AlertDescription>
				You can add components to your app using the CLI.
			</AlertDescription>
		</Alert>
	);
}
