/**
 * Nest stacks for complex layouts.
 */
import {Stack} from "@corensystem/coren-ui/stack";

export function NestingDo() {
	return (
		<Stack gap="md">
			<Stack direction="row" gap="sm" justify="between">
				<div className="wwc:h-8 wwc:w-20 wwc:rounded wwc:bg-muted" />
				<div className="wwc:h-8 wwc:w-20 wwc:rounded wwc:bg-muted" />
			</Stack>
			<div className="wwc:h-8 wwc:rounded wwc:bg-muted" />
		</Stack>
	);
}
