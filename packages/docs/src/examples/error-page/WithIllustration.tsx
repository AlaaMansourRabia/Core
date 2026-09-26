import {Button} from "@corensystem/coren-ui/button";
/**
 * Error page with custom illustration.
 */
import {ErrorPage} from "@corensystem/coren-ui/error-page";
import {AlertCircle} from "lucide-react";

export function WithIllustration() {
	return (
		<ErrorPage
			illustration={<AlertCircle className="wwc:h-24 wwc:w-24 wwc:text-muted-foreground" />}
			title="Access Denied"
			description="You don't have permission to view this page."
			action={<Button variant="outline">Request Access</Button>}
		/>
	);
}
