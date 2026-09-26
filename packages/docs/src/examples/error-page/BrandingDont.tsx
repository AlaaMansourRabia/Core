import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid generic or impersonal errors.
 */
import {ErrorPage} from "@corensystem/coren-ui/error-page";

export function BrandingDont() {
	return <ErrorPage title="Error" description="An error occurred." action={<Button>Back</Button>} />;
}
