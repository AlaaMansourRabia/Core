/**
 * Use appropriate column count for content.
 */
import {Grid} from "@corensystem/coren-ui/grid";

export function ColumnsDo() {
	return (
		<Grid columns={3} gap="md" className="wwc:w-full wwc:max-w-[350px]">
			<div className="wwc:h-20 wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-20 wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-20 wwc:rounded wwc:bg-muted" />
		</Grid>
	);
}
