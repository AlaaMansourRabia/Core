/**
 * Section with header actions.
 */
import {Section} from "@corensystem/coren-ui/section";
import {Button} from "@corensystem/coren-ui/button";

export function WithActions() {
	return (
		<Section
			title="Team Members"
			description="People with access to this project."
			actions={<Button size="sm">Add Member</Button>}
			className="wwc:w-[350px]"
		>
			<div className="wwc:h-24 wwc:rounded wwc:bg-muted" />
		</Section>
	);
}
