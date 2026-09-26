/**
 * Basic typography styles.
 */
import {TypographyH1, TypographyH2, TypographyH3, TypographyP, TypographySmall} from "@corensystem/coren-ui/typography";

export function Default() {
	return (
		<div className="wwc:space-y-4">
			<TypographyH1>Heading 1</TypographyH1>
			<TypographyH2>Heading 2</TypographyH2>
			<TypographyH3>Heading 3</TypographyH3>
			<TypographyP>Body text paragraph with regular styling.</TypographyP>
			<TypographySmall>Small text for captions.</TypographySmall>
		</div>
	);
}
