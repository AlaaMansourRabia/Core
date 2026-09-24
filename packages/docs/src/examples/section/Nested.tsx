/**
 * Nested sections for hierarchical content.
 */
import {Section} from "@corensystem/coren-ui/section";

export function Nested() {
	return (
		<Section title="Main Section" className="wwc:w-[300px]">
			<Section title="Subsection">
				<p className="wwc:text-sm wwc:text-muted-foreground">Nested content here.</p>
			</Section>
		</Section>
	);
}
