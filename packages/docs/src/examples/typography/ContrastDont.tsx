/**
 * Avoid low contrast text.
 */
import {TypographyH1, TypographyH2, TypographyP} from "@corensystem/coren-ui/typography";

export function ContrastDont() {
	return (
		<div className="wwc:space-y-2">
			<TypographyH1>Heading</TypographyH1>
			<TypographyP>Body text with appropriate styling.</TypographyP>
		</div>
	);
}
