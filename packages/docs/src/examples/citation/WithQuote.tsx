/**
 * Citation following a quoted text.
 */
import {Citation} from "@corensystem/coren-ui/citation";

export function WithQuote() {
	return (
		<blockquote className="wwc:border-l-4 wwc:border-muted wwc:pl-4 wwc:space-y-2">
			<p className="wwc:italic">"The only way to do great work is to love what you do."</p>
			<Citation author="Steve Jobs" source="Stanford Commencement" date="2005" />
		</blockquote>
	);
}
