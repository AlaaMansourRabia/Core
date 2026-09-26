import {Button} from "@corensystem/coren-ui/button";
/**
 * Basic mega menu navigation.
 */
import {
	MegaMenu,
	MegaMenuTrigger,
	MegaMenuContent,
	MegaMenuSection,
	MegaMenuItem,
} from "@corensystem/coren-ui/mega-menu";

export function Default() {
	return (
		<MegaMenu>
			<MegaMenuTrigger asChild>
				<Button variant="ghost">Products</Button>
			</MegaMenuTrigger>
			<MegaMenuContent>
				<MegaMenuSection title="Software">
					<MegaMenuItem href="#">Analytics Platform</MegaMenuItem>
					<MegaMenuItem href="#">CRM Solution</MegaMenuItem>
					<MegaMenuItem href="#">Marketing Tools</MegaMenuItem>
				</MegaMenuSection>
				<MegaMenuSection title="Services">
					<MegaMenuItem href="#">Consulting</MegaMenuItem>
					<MegaMenuItem href="#">Implementation</MegaMenuItem>
					<MegaMenuItem href="#">Training</MegaMenuItem>
				</MegaMenuSection>
			</MegaMenuContent>
		</MegaMenu>
	);
}
