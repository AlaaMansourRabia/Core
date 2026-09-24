/**
 * Use semantic gap values for consistent spacing.
 */
import {Stack} from "@corensystem/coren-ui/stack";

export function GapDo() {
	return (
		<Stack gap="md">
			<div className="wwc:h-8 wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-8 wwc:rounded wwc:bg-muted" />
		</Stack>
	);
}
