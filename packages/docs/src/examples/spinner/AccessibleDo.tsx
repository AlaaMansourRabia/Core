/**
 * Include role and aria-label for screen readers.
 */
import {Spinner} from "@corensystem/coren-ui/spinner";

export function AccessibleDo() {
	return (
		<div role="status" aria-label="Loading content">
			<Spinner />
		</div>
	);
}
