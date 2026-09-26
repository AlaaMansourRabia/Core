/**
 * Avoid burying alerts at the bottom of the page.
 */
import {Alert, AlertDescription, AlertTitle} from "@corensystem/coren-ui/alert";
import {AlertTriangle} from "lucide-react";

export function PlacementDont() {
	return (
		<div className="wwc:space-y-4">
			<div className="wwc:h-32 wwc:bg-muted wwc:rounded wwc:flex wwc:items-center wwc:justify-center wwc:text-muted-foreground">
				Page Content
			</div>
			<div className="wwc:h-32 wwc:bg-muted wwc:rounded wwc:flex wwc:items-center wwc:justify-center wwc:text-muted-foreground">
				More Content
			</div>
			<Alert>
				<AlertTriangle className="wwc:h-4 wwc:w-4" />
				<AlertTitle>Action Required</AlertTitle>
				<AlertDescription>Important alert hidden at the bottom.</AlertDescription>
			</Alert>
		</div>
	);
}
