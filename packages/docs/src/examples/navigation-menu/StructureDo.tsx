/**
 * Organize navigation items logically.
 */
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@corensystem/coren-ui/navigation-menu";

export function StructureDo() {
	return (
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Products</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="wwc:grid wwc:gap-2 wwc:p-4 wwc:w-64">
							<li className="wwc:text-xs wwc:font-semibold wwc:text-muted-foreground wwc:px-3 wwc:py-1">Solutions</li>
							<li>
								<NavigationMenuLink asChild>
									<a href="#" className="wwc:block wwc:rounded-md wwc:px-3 wwc:py-2 wwc:text-sm wwc:hover:bg-accent">
										For Startups
									</a>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<a href="#" className="wwc:block wwc:rounded-md wwc:px-3 wwc:py-2 wwc:text-sm wwc:hover:bg-accent">
										For Enterprise
									</a>
								</NavigationMenuLink>
							</li>
							<li className="wwc:text-xs wwc:font-semibold wwc:text-muted-foreground wwc:px-3 wwc:py-1 wwc:mt-2">
								Tools
							</li>
							<li>
								<NavigationMenuLink asChild>
									<a href="#" className="wwc:block wwc:rounded-md wwc:px-3 wwc:py-2 wwc:text-sm wwc:hover:bg-accent">
										Analytics
									</a>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<a href="#" className="wwc:block wwc:rounded-md wwc:px-3 wwc:py-2 wwc:text-sm wwc:hover:bg-accent">
										Reporting
									</a>
								</NavigationMenuLink>
							</li>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}
