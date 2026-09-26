/**
 * Avoid hover-only without keyboard support.
 */
import {
	MegaMenu,
	MegaMenuTrigger,
	MegaMenuContent,
	MegaMenuSection,
	MegaMenuItem,
} from "@corensystem/coren-ui/mega-menu";

export function AccessibilityDont() {
	return (
		<MegaMenu trigger="hover">
			<MegaMenuTrigger>
				{/* Non-focusable trigger */}
				<span>Products</span>
			</MegaMenuTrigger>
			<MegaMenuContent>
				<MegaMenuSection>
					<MegaMenuItem href="#">Option 1</MegaMenuItem>
				</MegaMenuSection>
			</MegaMenuContent>
		</MegaMenu>
	);
}
