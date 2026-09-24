/**
 * Use clear heading hierarchy.
 */
import {SectionHeader, SectionHeaderTitle} from "@corensystem/coren-ui/section-header";

export function HierarchyDo() {
	return (
		<SectionHeader level={2}>
			<SectionHeaderTitle>Subsection</SectionHeaderTitle>
		</SectionHeader>
	);
}
