import {Button} from "@corensystem/coren-ui/button";
/**
 * Multi-column mega menu layout.
 */
import {
	MegaMenu,
	MegaMenuTrigger,
	MegaMenuContent,
	MegaMenuSection,
	MegaMenuItem,
} from "@corensystem/coren-ui/mega-menu";

export function MultiColumn() {
	return (
		<MegaMenu>
			<MegaMenuTrigger asChild>
				<Button variant="ghost">Resources</Button>
			</MegaMenuTrigger>
			<MegaMenuContent columns={3}>
				<MegaMenuSection title="Learn">
					<MegaMenuItem href="#">Documentation</MegaMenuItem>
					<MegaMenuItem href="#">Tutorials</MegaMenuItem>
					<MegaMenuItem href="#">Webinars</MegaMenuItem>
				</MegaMenuSection>
				<MegaMenuSection title="Community">
					<MegaMenuItem href="#">Forum</MegaMenuItem>
					<MegaMenuItem href="#">Discord</MegaMenuItem>
					<MegaMenuItem href="#">GitHub</MegaMenuItem>
				</MegaMenuSection>
				<MegaMenuSection title="Company">
					<MegaMenuItem href="#">About Us</MegaMenuItem>
					<MegaMenuItem href="#">Careers</MegaMenuItem>
					<MegaMenuItem href="#">Contact</MegaMenuItem>
				</MegaMenuSection>
			</MegaMenuContent>
		</MegaMenu>
	);
}
