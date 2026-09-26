import {Button} from "@corensystem/coren-ui/button";
/**
 * Group related items logically.
 */
import {
	MegaMenu,
	MegaMenuTrigger,
	MegaMenuContent,
	MegaMenuSection,
	MegaMenuItem,
} from "@corensystem/coren-ui/mega-menu";

export function OrganizationDo() {
	return (
		<MegaMenu>
			<MegaMenuTrigger asChild>
				<Button variant="ghost">Products</Button>
			</MegaMenuTrigger>
			<MegaMenuContent>
				<MegaMenuSection title="For Developers">
					<MegaMenuItem href="#">API Access</MegaMenuItem>
					<MegaMenuItem href="#">SDKs</MegaMenuItem>
				</MegaMenuSection>
				<MegaMenuSection title="For Teams">
					<MegaMenuItem href="#">Collaboration</MegaMenuItem>
					<MegaMenuItem href="#">Project Management</MegaMenuItem>
				</MegaMenuSection>
			</MegaMenuContent>
		</MegaMenu>
	);
}
