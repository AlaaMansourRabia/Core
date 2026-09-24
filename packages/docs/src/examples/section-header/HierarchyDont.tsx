/**
 * Avoid skipping heading levels.
 */
import {SectionHeader, SectionHeaderTitle} from "@corensystem/coren-ui/section-header";

export function HierarchyDont() {
	return (
		<SectionHeader level={5}>
			<SectionHeaderTitle>Deep heading</SectionHeaderTitle>
		</SectionHeader>
	);
}
