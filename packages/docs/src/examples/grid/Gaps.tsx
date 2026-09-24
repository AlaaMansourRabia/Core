/**
 * Grid gap options.
 */
import {Grid} from "@corensystem/coren-ui/grid";

export function Gaps() {
	return (
		<div className="wwc:flex wwc:gap-8">
			<div>
				<span className="wwc:text-xs wwc:text-muted-foreground">sm</span>
				<Grid columns={2} gap="sm" className="wwc:w-24">
					<div className="wwc:h-8 wwc:rounded wwc:bg-muted" />
					<div className="wwc:h-8 wwc:rounded wwc:bg-muted" />
					<div className="wwc:h-8 wwc:rounded wwc:bg-muted" />
					<div className="wwc:h-8 wwc:rounded wwc:bg-muted" />
				</Grid>
			</div>
			<div>
				<span className="wwc:text-xs wwc:text-muted-foreground">lg</span>
				<Grid columns={2} gap="lg" className="wwc:w-28">
					<div className="wwc:h-8 wwc:rounded wwc:bg-muted" />
					<div className="wwc:h-8 wwc:rounded wwc:bg-muted" />
					<div className="wwc:h-8 wwc:rounded wwc:bg-muted" />
					<div className="wwc:h-8 wwc:rounded wwc:bg-muted" />
				</Grid>
			</div>
		</div>
	);
}
