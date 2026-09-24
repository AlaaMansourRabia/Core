/**
 * 404 Not Found error page.
 */
import {ErrorPage} from "@corensystem/coren-ui/error-page";
import {Button} from "@corensystem/coren-ui/button";

export function NotFound() {
	return (
		<ErrorPage
			code="404"
			title="Page not found"
			description="The page you're looking for doesn't exist or has been moved."
			action={<Button>Go Home</Button>}
		/>
	);
}
