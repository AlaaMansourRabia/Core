/**
 * Show timestamps in context with other metadata.
 */
import {Timestamp} from "@corensystem/coren-ui/timestamp";

export function ContextDo() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2">
			<span className="wwc:text-sm">Posted</span>
			<Timestamp date={new Date(Date.now() - 86400000)} />
		</div>
	);
}
