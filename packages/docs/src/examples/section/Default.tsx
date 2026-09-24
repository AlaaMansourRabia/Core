/**
 * A basic section with title.
 */
import {Section} from "@corensystem/coren-ui/section";

export function Default() {
	return (
		<Section title="Getting Started" className="wwc:w-[300px]">
			<p className="wwc:text-sm wwc:text-muted-foreground">
				Welcome to the documentation. Here you'll learn the basics.
			</p>
		</Section>
	);
}
