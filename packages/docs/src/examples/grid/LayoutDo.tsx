/**
 * Use Grid for two-dimensional layouts.
 */
import {Grid} from "@corensystem/coren-ui/grid";

export function LayoutDo() {
	return (
		<Grid columns={2} gap="md" className="wwc:w-full wwc:max-w-[300px]">
			<div className="wwc:h-16 wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-16 wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-16 wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-16 wwc:rounded wwc:bg-muted" />
		</Grid>
	);
}
