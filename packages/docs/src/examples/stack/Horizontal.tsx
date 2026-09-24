/**
 * A horizontal stack (row direction).
 */
import {Stack} from "@corensystem/coren-ui/stack";

export function Horizontal() {
	return (
		<Stack direction="row">
			<div className="wwc:h-12 wwc:w-12 wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-12 wwc:w-12 wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-12 wwc:w-12 wwc:rounded wwc:bg-muted" />
		</Stack>
	);
}
