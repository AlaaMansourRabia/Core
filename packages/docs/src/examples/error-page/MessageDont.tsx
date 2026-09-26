import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid technical jargon.
 */
import {ErrorPage} from "@corensystem/coren-ui/error-page";

export function MessageDont() {
	return (
		<ErrorPage
			title="HTTP 404"
			description="ERR_NOT_FOUND: The requested resource could not be located on this server."
			action={<Button>OK</Button>}
		/>
	);
}
