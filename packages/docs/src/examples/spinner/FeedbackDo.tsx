/**
 * Provide context about what is loading.
 */
import {Spinner} from "@corensystem/coren-ui/spinner";

export function FeedbackDo() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2" role="status">
			<Spinner size="sm" />
			<span className="wwc:text-sm">Saving changes...</span>
		</div>
	);
}
