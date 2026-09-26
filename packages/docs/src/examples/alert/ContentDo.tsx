/**
 * Keep alert content concise and actionable.
 */
import {Alert, AlertDescription, AlertTitle} from "@corensystem/coren-ui/alert";
import {Info} from "lucide-react";

export function ContentDo() {
	return (
		<Alert>
			<Info className="wwc:h-4 wwc:w-4" />
			<AlertTitle>Update Available</AlertTitle>
			<AlertDescription>Version 2.0 is available. Update now for new features.</AlertDescription>
		</Alert>
	);
}
