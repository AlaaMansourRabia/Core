/**
 * Push panel from right side.
 */
import {PushPanel, PushPanelContent, PushPanelHeader} from "@corensystem/coren-ui/push-panel";

export function FromRight() {
	return (
		<PushPanel open side="right">
			<PushPanelContent>
				<PushPanelHeader>Right Panel</PushPanelHeader>
			</PushPanelContent>
		</PushPanel>
	);
}
