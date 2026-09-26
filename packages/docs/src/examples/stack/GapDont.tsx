/**
 * Avoid arbitrary custom gap values.
 */
import {Stack} from "@corensystem/coren-ui/stack";

export function GapDont() {
	return (
		<Stack className="wwc:gap-[13px]">
			<div className="wwc:h-8 wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-8 wwc:rounded wwc:bg-muted" />
		</Stack>
	);
}
