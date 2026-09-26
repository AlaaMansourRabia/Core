/**
 * Basic error page layout.
 */
import {ErrorPage} from "@corensystem/coren-ui/error-page";
import {Button} from "@corensystem/coren-ui/button";

export function Default() {
	return (
		<ErrorPage
			title="Something went wrong"
			description="We encountered an unexpected error. Please try again."
			action={<Button>Try Again</Button>}
		/>
	);
}
