import {Button} from "@corensystem/coren-ui/button";
/**
 * 500 Server error page.
 */
import {ErrorPage} from "@corensystem/coren-ui/error-page";
import {RefreshCw} from "lucide-react";

export function ServerError() {
	return (
		<ErrorPage
			code="500"
			title="Server Error"
			description="Our servers are experiencing issues. Please try again later."
			action={
				<Button>
					<RefreshCw className="wwc:mr-2 wwc:h-4 wwc:w-4" />
					Refresh
				</Button>
			}
		/>
	);
}
