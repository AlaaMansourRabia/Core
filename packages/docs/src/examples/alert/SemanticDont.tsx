/**
 * Avoid using wrong variant for the message type.
 */
import {Alert, AlertDescription, AlertTitle} from "@corensystem/coren-ui/alert";
import {Check} from "lucide-react";

export function SemanticDont() {
	return (
		<Alert variant="destructive">
			<Check className="wwc:h-4 wwc:w-4" />
			<AlertTitle>Success!</AlertTitle>
			<AlertDescription>
				Your order was placed successfully. Using destructive style for success
				is confusing.
			</AlertDescription>
		</Alert>
	);
}
