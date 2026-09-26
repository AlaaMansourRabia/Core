/**
 * Avoid overloading panels.
 */
import {PushPanel, PushPanelContent, PushPanelHeader} from "@corensystem/coren-ui/push-panel";

export function ContentDont() {
	return (
		<PushPanel open>
			<PushPanelContent className="wwc:space-y-4">
				<PushPanelHeader>Everything</PushPanelHeader>
				<p>Section 1</p><p>Section 2</p><p>Section 3</p><p>Section 4</p><p>Section 5</p>
			</PushPanelContent>
		</PushPanel>
	);
}
