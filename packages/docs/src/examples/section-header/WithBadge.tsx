/**
 * Section header with count badge.
 */
import {SectionHeader, SectionHeaderTitle, SectionHeaderBadge} from "@corensystem/coren-ui/section-header";

export function WithBadge() {
	return (
		<SectionHeader>
			<SectionHeaderTitle>Notifications</SectionHeaderTitle>
			<SectionHeaderBadge>5</SectionHeaderBadge>
		</SectionHeader>
	);
}
