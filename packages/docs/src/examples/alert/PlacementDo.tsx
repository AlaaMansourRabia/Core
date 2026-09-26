/**
 * Place alerts prominently where users will see them.
 */
import {Alert, AlertDescription, AlertTitle} from "@corensystem/coren-ui/alert";
import {AlertTriangle} from "lucide-react";

export function PlacementDo() {
	return (
		<div className="wwc:space-y-4">
			<Alert>
				<AlertTriangle className="wwc:h-4 wwc:w-4" />
				<AlertTitle>Action Required</AlertTitle>
				<AlertDescription>Please verify your email address to continue.</AlertDescription>
			</Alert>
			<div className="wwc:h-32 wwc:bg-muted wwc:rounded wwc:flex wwc:items-center wwc:justify-center wwc:text-muted-foreground">
				Page Content
			</div>
		</div>
	);
}
