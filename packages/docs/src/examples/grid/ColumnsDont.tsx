/**
 * Avoid too many columns for limited content.
 */
import {Grid} from "@corensystem/coren-ui/grid";

export function ColumnsDont() {
	return (
		<Grid columns={6} gap="md" className="wwc:w-full wwc:max-w-[350px]">
			<div className="wwc:h-20 wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-20 wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-20 wwc:rounded wwc:bg-muted" />
		</Grid>
	);
}
