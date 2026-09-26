/**
 * Push panel size variants.
 */
import {PushPanel, PushPanelContent, PushPanelHeader} from "@corensystem/coren-ui/push-panel";

export function Sizes() {
	return (
		<PushPanel open size="lg">
			<PushPanelContent>
				<PushPanelHeader>Large Panel</PushPanelHeader>
				<p>More space for content</p>
			</PushPanelContent>
		</PushPanel>
	);
}
