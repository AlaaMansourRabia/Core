import {Button} from "@corensystem/coren-ui/button";
/**
 * Provide clear next steps.
 */
import {ErrorPage} from "@corensystem/coren-ui/error-page";

export function ActionsDo() {
	return (
		<ErrorPage
			code="404"
			title="Page not found"
			description="The page you're looking for doesn't exist."
			action={
				<div className="wwc:flex wwc:gap-2">
					<Button>Go Home</Button>
					<Button variant="outline">Contact Support</Button>
				</div>
			}
		/>
	);
}
