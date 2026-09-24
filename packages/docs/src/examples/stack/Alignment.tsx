/**
 * Stack alignment and justification options.
 */
import {Stack} from "@corensystem/coren-ui/stack";

export function Alignment() {
	return (
		<Stack direction="row" gap="md" justify="between" align="center" className="wwc:w-full wwc:max-w-[300px]">
			<div className="wwc:h-8 wwc:w-16 wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-12 wwc:w-16 wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-6 wwc:w-16 wwc:rounded wwc:bg-muted" />
		</Stack>
	);
}
