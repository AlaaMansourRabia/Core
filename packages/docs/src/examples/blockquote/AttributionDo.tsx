/**
 * Include attribution for quoted content.
 */
import {Blockquote} from "@corensystem/coren-ui/blockquote";

export function AttributionDo() {
	return (
		<figure>
			<Blockquote>Simplicity is the ultimate sophistication.</Blockquote>
			<figcaption className="wwc:mt-2 wwc:text-sm wwc:text-muted-foreground">— Leonardo da Vinci</figcaption>
		</figure>
	);
}
