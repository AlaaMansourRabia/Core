/**
 * A basic single-column grid.
 */
import {Grid} from "@corensystem/coren-ui/grid";

export function Default() {
	return (
		<Grid className="wwc:w-full wwc:max-w-[300px]">
			<div className="wwc:h-12 wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-12 wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-12 wwc:rounded wwc:bg-muted" />
		</Grid>
	);
}
