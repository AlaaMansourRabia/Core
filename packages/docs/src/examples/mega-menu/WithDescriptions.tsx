import {Button} from "@corensystem/coren-ui/button";
/**
 * Mega menu with item descriptions.
 */
import {
	MegaMenu,
	MegaMenuTrigger,
	MegaMenuContent,
	MegaMenuSection,
	MegaMenuItem,
} from "@corensystem/coren-ui/mega-menu";

export function WithDescriptions() {
	return (
		<MegaMenu>
			<MegaMenuTrigger asChild>
				<Button variant="ghost">Solutions</Button>
			</MegaMenuTrigger>
			<MegaMenuContent>
				<MegaMenuSection title="By Industry">
					<MegaMenuItem href="#" description="Streamline patient care and records management">
						Healthcare
					</MegaMenuItem>
					<MegaMenuItem href="#" description="Secure banking and transaction processing">
						Finance
					</MegaMenuItem>
					<MegaMenuItem href="#" description="E-commerce and inventory solutions">
						Retail
					</MegaMenuItem>
				</MegaMenuSection>
			</MegaMenuContent>
		</MegaMenu>
	);
}
