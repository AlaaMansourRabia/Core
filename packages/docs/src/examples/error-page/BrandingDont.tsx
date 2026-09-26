/**
 * Avoid generic or impersonal errors.
 */
import {ErrorPage} from "@corensystem/coren-ui/error-page";
import {Button} from "@corensystem/coren-ui/button";

export function BrandingDont() {
	return (
		<ErrorPage
			title="Error"
			description="An error occurred."
			action={<Button>Back</Button>}
		/>
	);
}
