/**
 * Use panels for contextual content.
 */
import {PushPanel, PushPanelContent, PushPanelHeader} from "@corensystem/coren-ui/push-panel";

export function ContentDo() {
	return (
		<PushPanel open>
			<PushPanelContent>
				<PushPanelHeader>Item Details</PushPanelHeader>
				<p>Related information</p>
			</PushPanelContent>
		</PushPanel>
	);
}
