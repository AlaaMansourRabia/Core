/**
 * A vertical stack with default spacing.
 */
import {Stack} from "@corensystem/coren-ui/stack";

export function Default() {
	return (
		<Stack>
			<div className="wwc:h-8 wwc:w-full wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-8 wwc:w-full wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-8 wwc:w-full wwc:rounded wwc:bg-muted" />
		</Stack>
	);
}
