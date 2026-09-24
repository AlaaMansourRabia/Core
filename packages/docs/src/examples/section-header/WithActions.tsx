/**
 * Section header with action buttons.
 */
import {SectionHeader, SectionHeaderTitle, SectionHeaderActions} from "@corensystem/coren-ui/section-header";
import {Button} from "@corensystem/coren-ui/button";

export function WithActions() {
	return (
		<SectionHeader>
			<SectionHeaderTitle>Team Members</SectionHeaderTitle>
			<SectionHeaderActions>
				<Button size="sm">Add Member</Button>
			</SectionHeaderActions>
		</SectionHeader>
	);
}
