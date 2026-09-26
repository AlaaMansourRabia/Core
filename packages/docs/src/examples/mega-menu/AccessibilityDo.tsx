import {Button} from "@corensystem/coren-ui/button";
/**
 * Include keyboard navigation support.
 */
import {
	MegaMenu,
	MegaMenuTrigger,
	MegaMenuContent,
	MegaMenuSection,
	MegaMenuItem,
} from "@corensystem/coren-ui/mega-menu";

export function AccessibilityDo() {
	return (
		<MegaMenu>
			<MegaMenuTrigger asChild>
				<Button variant="ghost" aria-haspopup="true">
					Products
				</Button>
			</MegaMenuTrigger>
			<MegaMenuContent role="menu" aria-label="Products menu">
				<MegaMenuSection title="Options">
					<MegaMenuItem href="#" role="menuitem">
						Option 1
					</MegaMenuItem>
					<MegaMenuItem href="#" role="menuitem">
						Option 2
					</MegaMenuItem>
				</MegaMenuSection>
			</MegaMenuContent>
		</MegaMenu>
	);
}
