/**
 * Section header with description.
 */
import {SectionHeader, SectionHeaderTitle, SectionHeaderDescription} from "@corensystem/coren-ui/section-header";

export function WithDescription() {
	return (
		<SectionHeader>
			<SectionHeaderTitle>Settings</SectionHeaderTitle>
			<SectionHeaderDescription>Configure your preferences</SectionHeaderDescription>
		</SectionHeader>
	);
}
