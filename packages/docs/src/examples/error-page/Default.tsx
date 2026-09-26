import {Button} from "@corensystem/coren-ui/button";
/**
 * Basic error page layout.
 */
import {ErrorPage} from "@corensystem/coren-ui/error-page";

export function Default() {
	return (
		<ErrorPage
			title="Something went wrong"
			description="We encountered an unexpected error. Please try again."
			action={<Button>Try Again</Button>}
		/>
	);
}
