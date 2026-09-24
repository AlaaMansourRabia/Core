/**
 * Use consistent gap sizes across the layout.
 */
import {Grid} from "@corensystem/coren-ui/grid";

export function GapDo() {
	return (
		<Grid columns={2} gap="md" className="wwc:w-full wwc:max-w-[250px]">
			<div className="wwc:h-12 wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-12 wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-12 wwc:rounded wwc:bg-muted" />
			<div className="wwc:h-12 wwc:rounded wwc:bg-muted" />
		</Grid>
	);
}
