import {Button} from "@corensystem/coren-ui/button";
/**
 * Empty state for error condition.
 */
import {Empty} from "@corensystem/coren-ui/empty";
import {AlertCircle, RefreshCw} from "lucide-react";

export function ErrorEmpty() {
	return (
		<Empty
			icon={<AlertCircle className="wwc:h-12 wwc:w-12 wwc:text-destructive" />}
			title="Failed to load data"
			description="Something went wrong while fetching your data."
		>
			<Button variant="outline">
				<RefreshCw className="wwc:mr-2 wwc:h-4 wwc:w-4" />
				Try Again
			</Button>
		</Empty>
	);
}
