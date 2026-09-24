/**
 * Different thinking states.
 */
import {ThinkingPill} from "@corensystem/coren-ui/thinking-pill";

export function States() {
	return (
		<div className="wwc:flex wwc:gap-2">
			<ThinkingPill state="thinking">Thinking</ThinkingPill>
			<ThinkingPill state="loading">Loading</ThinkingPill>
			<ThinkingPill state="done">Done</ThinkingPill>
		</div>
	);
}
