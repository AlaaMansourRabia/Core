import {Button} from "@corensystem/coren-ui/button";
/**
 * Use friendly, helpful language.
 */
import {ErrorPage} from "@corensystem/coren-ui/error-page";

export function MessageDo() {
	return (
		<ErrorPage
			title="We couldn't find that page"
			description="The link might be broken, or the page may have been removed. Let's get you back on track."
			action={<Button>Return to Dashboard</Button>}
		/>
	);
}
