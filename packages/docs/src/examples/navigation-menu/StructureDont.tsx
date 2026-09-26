/**
 * Avoid flat lists without organization.
 */
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@corensystem/coren-ui/navigation-menu";

export function StructureDont() {
	return (
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Products</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="wwc:p-4 wwc:w-64">
							{/* Flat list with no grouping - hard to scan */}
							<li>
								<NavigationMenuLink asChild>
									<a href="#" className="wwc:block wwc:py-2 wwc:text-sm wwc:hover:underline">
										For Startups
									</a>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<a href="#" className="wwc:block wwc:py-2 wwc:text-sm wwc:hover:underline">
										Analytics
									</a>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<a href="#" className="wwc:block wwc:py-2 wwc:text-sm wwc:hover:underline">
										For Enterprise
									</a>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<a href="#" className="wwc:block wwc:py-2 wwc:text-sm wwc:hover:underline">
										Reporting
									</a>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<a href="#" className="wwc:block wwc:py-2 wwc:text-sm wwc:hover:underline">
										Dashboard
									</a>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<a href="#" className="wwc:block wwc:py-2 wwc:text-sm wwc:hover:underline">
										API
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
