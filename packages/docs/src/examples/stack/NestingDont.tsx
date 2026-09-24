/**
 * Avoid deeply nested stacks when grid is more appropriate.
 */
import {Stack} from "@corensystem/coren-ui/stack";

export function NestingDont() {
	return (
		<Stack>
			<Stack direction="row">
				<Stack>
					<div className="wwc:h-8 wwc:w-12 wwc:rounded wwc:bg-muted" />
				</Stack>
				<Stack>
					<div className="wwc:h-8 wwc:w-12 wwc:rounded wwc:bg-muted" />
				</Stack>
			</Stack>
		</Stack>
	);
}
