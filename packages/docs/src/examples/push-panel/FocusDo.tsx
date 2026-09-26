import {Button} from "@corensystem/coren-ui/button";
/**
 * Trap focus within panel.
 */
import {PushPanel, PushPanelContent, PushPanelHeader} from "@corensystem/coren-ui/push-panel";

export function FocusDo() {
	return (
		<PushPanel open trapFocus>
			<PushPanelContent>
				<PushPanelHeader>Focused Panel</PushPanelHeader>
				<Button>First Action</Button>
			</PushPanelContent>
		</PushPanel>
	);
}
