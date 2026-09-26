/**
 * Keep menu depth shallow.
 */
import {MegaMenu, MegaMenuTrigger, MegaMenuContent, MegaMenuSection, MegaMenuItem} from "@corensystem/coren-ui/mega-menu";
import {Button} from "@corensystem/coren-ui/button";

export function DepthDo() {
	return (
		<MegaMenu>
			<MegaMenuTrigger asChild>
				<Button variant="ghost">Products</Button>
			</MegaMenuTrigger>
			<MegaMenuContent>
				<MegaMenuSection title="Categories">
					<MegaMenuItem href="/products/software">Software</MegaMenuItem>
					<MegaMenuItem href="/products/hardware">Hardware</MegaMenuItem>
					<MegaMenuItem href="/products/services">Services</MegaMenuItem>
				</MegaMenuSection>
			</MegaMenuContent>
		</MegaMenu>
	);
}
