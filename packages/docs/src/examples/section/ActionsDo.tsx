/**
 * Place relevant actions in the section header.
 */
import {Section} from "@corensystem/coren-ui/section";
import {Button} from "@corensystem/coren-ui/button";

export function ActionsDo() {
	return (
		<Section
			title="Users"
			actions={<Button size="sm">Add User</Button>}
			className="wwc:w-[280px]"
		>
			<div className="wwc:h-8 wwc:rounded wwc:bg-muted" />
		</Section>
	);
}
