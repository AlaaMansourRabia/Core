/**
 * Avoid unfocused panels for modals.
 */
import {PushPanel, PushPanelContent, PushPanelHeader} from "@corensystem/coren-ui/push-panel";

export function FocusDont() {
	return (
		<PushPanel open modal>
			<PushPanelContent>
				<PushPanelHeader>Modal without focus trap</PushPanelHeader>
			</PushPanelContent>
		</PushPanel>
	);
}
