import {Button} from "@corensystem/coren-ui/button";
/**
 * Mega menu with icons.
 */
import {
	MegaMenu,
	MegaMenuTrigger,
	MegaMenuContent,
	MegaMenuSection,
	MegaMenuItem,
} from "@corensystem/coren-ui/mega-menu";
import {BarChart, Users, Mail, Settings, HelpCircle, Book} from "lucide-react";

export function WithIcons() {
	return (
		<MegaMenu>
			<MegaMenuTrigger asChild>
				<Button variant="ghost">Features</Button>
			</MegaMenuTrigger>
			<MegaMenuContent>
				<MegaMenuSection title="Core">
					<MegaMenuItem href="#" icon={<BarChart className="wwc:h-4 wwc:w-4" />}>
						Analytics
					</MegaMenuItem>
					<MegaMenuItem href="#" icon={<Users className="wwc:h-4 wwc:w-4" />}>
						Team Management
					</MegaMenuItem>
					<MegaMenuItem href="#" icon={<Mail className="wwc:h-4 wwc:w-4" />}>
						Notifications
					</MegaMenuItem>
				</MegaMenuSection>
				<MegaMenuSection title="Support">
					<MegaMenuItem href="#" icon={<HelpCircle className="wwc:h-4 wwc:w-4" />}>
						Help Center
					</MegaMenuItem>
					<MegaMenuItem href="#" icon={<Book className="wwc:h-4 wwc:w-4" />}>
						Documentation
					</MegaMenuItem>
					<MegaMenuItem href="#" icon={<Settings className="wwc:h-4 wwc:w-4" />}>
						Settings
					</MegaMenuItem>
				</MegaMenuSection>
			</MegaMenuContent>
		</MegaMenu>
	);
}
