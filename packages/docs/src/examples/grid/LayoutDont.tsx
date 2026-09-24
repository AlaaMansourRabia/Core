/**
 * Avoid Grid for simple single-row layouts.
 */
import {Grid} from "@corensystem/coren-ui/grid";

export function LayoutDont() {
	return (
		<Grid columns={3} gap="md" className="wwc:w-full wwc:max-w-[300px]">
			<div className="wwc:h-16 wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-16 wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-16 wwc:rounded wwc:bg-muted" />
		</Grid>
	);
}
