/**
 * Avoid inline outlines that scroll away from view.
 */
import {Outline} from "@corensystem/coren-ui/outline";

export function PlacementDont() {
	return (
		<div>
			<Outline
				items={[
					{id: "overview", label: "Overview", level: 1},
					{id: "details", label: "Details", level: 1},
					{id: "summary", label: "Summary", level: 1},
				]}
			/>
			<p className="wwc:mt-4">Content continues below, outline scrolls away...</p>
		</div>
	);
}
