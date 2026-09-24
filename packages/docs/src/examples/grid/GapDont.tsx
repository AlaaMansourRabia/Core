/**
 * Avoid mixing gap values with custom spacing.
 */
import {Grid} from "@corensystem/coren-ui/grid";

export function GapDont() {
	return (
		<Grid columns={2} gap="none" className="wwc:w-full wwc:max-w-[250px]">
			<div className="wwc:h-12 wwc:rounded wwc:bg-muted wwc:m-1" />
			<div className="wwc:h-12 wwc:rounded wwc:bg-muted wwc:m-3" />
			<div className="wwc:h-12 wwc:rounded wwc:bg-muted wwc:m-2" />
			<div className="wwc:h-12 wwc:rounded wwc:bg-muted wwc:m-1" />
		</Grid>
	);
}
