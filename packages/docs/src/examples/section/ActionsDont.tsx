/**
 * Avoid too many actions in the header.
 */
import {Section} from "@corensystem/coren-ui/section";
import {Button} from "@corensystem/coren-ui/button";

export function ActionsDont() {
	return (
		<Section
			title="Users"
			actions={
				<>
					<Button size="sm">Add</Button>
					<Button size="sm">Import</Button>
					<Button size="sm">Export</Button>
					<Button size="sm">Settings</Button>
				</>
			}
			className="wwc:w-[400px]"
		>
			<div className="wwc:h-8 wwc:rounded wwc:bg-muted" />
		</Section>
	);
}
