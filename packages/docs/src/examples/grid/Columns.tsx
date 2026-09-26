/**
 * Grid with multiple columns.
 */
import {Grid} from "@corensystem/coren-ui/grid";

export function Columns() {
	return (
		<Grid columns={3} className="wwc:w-full wwc:max-w-[400px]">
			<div className="wwc:h-16 wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-16 wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-16 wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-16 wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-16 wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-16 wwc:rounded wwc:bg-muted" />
		</Grid>
	);
}
