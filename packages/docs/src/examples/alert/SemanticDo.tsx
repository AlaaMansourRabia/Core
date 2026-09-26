/**
 * Use appropriate variant for the message type.
 */
import {Alert, AlertDescription, AlertTitle} from "@corensystem/coren-ui/alert";
import {AlertCircle} from "lucide-react";

export function SemanticDo() {
	return (
		<Alert variant="destructive">
			<AlertCircle className="wwc:h-4 wwc:w-4" />
			<AlertTitle>Payment Failed</AlertTitle>
			<AlertDescription>
				Your credit card was declined. Please update your payment method.
			</AlertDescription>
		</Alert>
	);
}
