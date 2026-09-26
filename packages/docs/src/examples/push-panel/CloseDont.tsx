/**
 * Avoid no close mechanism.
 */
import {PushPanel, PushPanelContent, PushPanelHeader} from "@corensystem/coren-ui/push-panel";

export function CloseDont() {
	return (
		<PushPanel open>
			<PushPanelContent>
				<PushPanelHeader>No Close Button</PushPanelHeader>
			</PushPanelContent>
		</PushPanel>
	);
}
