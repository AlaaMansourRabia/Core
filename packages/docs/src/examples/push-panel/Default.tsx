/**
 * Default push panel for side content.
 */
import {PushPanel, PushPanelTrigger, PushPanelContent, PushPanelHeader} from "@corensystem/coren-ui/push-panel";
import {Button} from "@corensystem/coren-ui/button";

export function Default() {
	return (
		<PushPanel>
			<PushPanelTrigger asChild><Button>Open Panel</Button></PushPanelTrigger>
			<PushPanelContent>
				<PushPanelHeader>Details</PushPanelHeader>
				<p>Panel content here</p>
			</PushPanelContent>
		</PushPanel>
	);
}
