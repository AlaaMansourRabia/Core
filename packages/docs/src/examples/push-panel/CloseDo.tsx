/**
 * Provide clear close action.
 */
import {PushPanel, PushPanelContent, PushPanelHeader, PushPanelClose} from "@corensystem/coren-ui/push-panel";

export function CloseDo() {
	return (
		<PushPanel open>
			<PushPanelContent>
				<PushPanelHeader>
					Panel Title
					<PushPanelClose />
				</PushPanelHeader>
			</PushPanelContent>
		</PushPanel>
	);
}
