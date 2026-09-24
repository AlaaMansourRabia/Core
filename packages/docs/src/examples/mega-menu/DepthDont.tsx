/**
 * Avoid deeply nested submenus.
 */
import {MegaMenu, MegaMenuTrigger, MegaMenuContent, MegaMenuSection, MegaMenuItem, MegaMenuSubmenu} from "@corensystem/coren-ui/mega-menu";
import {Button} from "@corensystem/coren-ui/button";

export function DepthDont() {
	return (
		<MegaMenu>
			<MegaMenuTrigger asChild>
				<Button variant="ghost">Products</Button>
			</MegaMenuTrigger>
			<MegaMenuContent>
				<MegaMenuSection title="Categories">
					<MegaMenuSubmenu label="Software">
						<MegaMenuSubmenu label="Enterprise">
							<MegaMenuSubmenu label="Cloud">
								<MegaMenuItem href="#">AWS</MegaMenuItem>
							</MegaMenuSubmenu>
						</MegaMenuSubmenu>
					</MegaMenuSubmenu>
				</MegaMenuSection>
			</MegaMenuContent>
		</MegaMenu>
	);
}
