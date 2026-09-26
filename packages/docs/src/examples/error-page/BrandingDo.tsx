/**
 * Maintain brand consistency.
 */
import {ErrorPage} from "@corensystem/coren-ui/error-page";
import {Button} from "@corensystem/coren-ui/button";

export function BrandingDo() {
	return (
		<ErrorPage
			title="Oops! Lost in space"
			description="Don't worry, even astronauts get lost sometimes."
			action={<Button>Take me home</Button>}
		/>
	);
}
