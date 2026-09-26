/**
 * Avoid dead ends without actions.
 */
import {ErrorPage} from "@corensystem/coren-ui/error-page";

export function ActionsDont() {
	return (
		<ErrorPage
			title="Error"
			description="Something went wrong."
			/* No action - user is stuck */
		/>
	);
}
