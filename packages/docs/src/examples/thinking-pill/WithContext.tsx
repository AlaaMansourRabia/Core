/**
 * Thinking pill with context.
 */
import {ThinkingPill, ThinkingPillContext} from "@corensystem/coren-ui/thinking-pill";

export function WithContext() {
	return (
		<ThinkingPill>
			Analyzing
			<ThinkingPillContext>3 documents</ThinkingPillContext>
		</ThinkingPill>
	);
}
