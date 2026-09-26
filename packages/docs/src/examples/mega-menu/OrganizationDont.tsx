import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid mixing unrelated items.
 */
import {
	MegaMenu,
	MegaMenuTrigger,
	MegaMenuContent,
	MegaMenuSection,
	MegaMenuItem,
} from "@corensystem/coren-ui/mega-menu";

export function OrganizationDont() {
	return (
		<MegaMenu>
			<MegaMenuTrigger asChild>
				<Button variant="ghost">Menu</Button>
			</MegaMenuTrigger>
			<MegaMenuContent>
				<MegaMenuSection>
					<MegaMenuItem href="#">API Access</MegaMenuItem>
					<MegaMenuItem href="#">About Us</MegaMenuItem>
					<MegaMenuItem href="#">SDKs</MegaMenuItem>
					<MegaMenuItem href="#">Careers</MegaMenuItem>
					<MegaMenuItem href="#">Documentation</MegaMenuItem>
				</MegaMenuSection>
			</MegaMenuContent>
		</MegaMenu>
	);
}
