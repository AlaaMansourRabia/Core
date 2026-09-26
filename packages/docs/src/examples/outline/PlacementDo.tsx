/**
 * Position outline in a sticky sidebar for long content.
 */
import {Outline} from "@corensystem/coren-ui/outline";

export function PlacementDo() {
	return (
		<aside className="wwc:sticky wwc:top-4 wwc:w-48">
			<Outline
				items={[
					{id: "overview", label: "Overview", level: 1},
					{id: "details", label: "Details", level: 1},
					{id: "summary", label: "Summary", level: 1},
				]}
			/>
		</aside>
	);
}
