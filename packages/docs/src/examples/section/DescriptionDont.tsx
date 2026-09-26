/**
 * Avoid redundant descriptions.
 */
import {Section} from "@corensystem/coren-ui/section";

export function DescriptionDont() {
	return (
		<Section title="Name" description="This is the name section where you enter your name." className="wwc:w-[300px]">
			<div className="wwc:h-8 wwc:rounded wwc:bg-muted" />
		</Section>
	);
}
