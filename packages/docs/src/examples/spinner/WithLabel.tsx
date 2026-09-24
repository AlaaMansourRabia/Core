/**
 * Spinner with an accessible loading label.
 */
import {Spinner} from "@corensystem/coren-ui/spinner";

export function WithLabel() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2" role="status" aria-label="Loading">
			<Spinner />
			<span className="wwc:text-sm wwc:text-muted-foreground">Loading...</span>
		</div>
	);
}
