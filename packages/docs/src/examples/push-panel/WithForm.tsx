import {Button} from "@corensystem/coren-ui/button";
import {Input} from "@corensystem/coren-ui/input";
/**
 * Push panel with form content.
 */
import {PushPanel, PushPanelContent, PushPanelHeader, PushPanelFooter} from "@corensystem/coren-ui/push-panel";

export function WithForm() {
	return (
		<PushPanel open>
			<PushPanelContent>
				<PushPanelHeader>Edit Item</PushPanelHeader>
				<Input placeholder="Name" />
				<PushPanelFooter>
					<Button variant="outline">Cancel</Button>
					<Button>Save</Button>
				</PushPanelFooter>
			</PushPanelContent>
		</PushPanel>
	);
}
