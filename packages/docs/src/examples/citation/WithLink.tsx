/**
 * Citation with clickable link to source.
 */
import {Citation} from "@corensystem/coren-ui/citation";

export function WithLink() {
	return (
		<Citation
			href="https://example.com/article"
			author="Jane Doe"
			source="Tech Review"
			date="2024"
		/>
	);
}
