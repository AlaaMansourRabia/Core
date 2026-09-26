/**
 * Section with title and description.
 */
import {Section} from "@corensystem/coren-ui/section";

export function WithDescription() {
	return (
		<Section
			title="Account Settings"
			description="Manage your account preferences and security."
			className="wwc:w-[300px]"
		>
			<div className="wwc:h-16 wwc:rounded wwc:bg-muted" />
		</Section>
	);
}
