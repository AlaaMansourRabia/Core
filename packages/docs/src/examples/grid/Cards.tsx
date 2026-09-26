/**
 * Grid layout for card components.
 */
import {Grid} from "@corensystem/coren-ui/grid";

export function Cards() {
	return (
		<Grid columns={2} gap="md" className="wwc:w-full wwc:max-w-[400px]">
			{[1, 2, 3, 4].map((i) => (
				<div key={i} className="wwc:rounded-lg wwc:border wwc:p-4">
					<div className="wwc:h-4 wwc:w-20 wwc:rounded wwc:bg-muted wwc:mb-2" />
					<div className="wwc:h-3 wwc:w-full wwc:rounded wwc:bg-muted" />
				</div>
			))}
		</Grid>
	);
}
