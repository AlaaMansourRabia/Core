/**
 * Keep navigation depth shallow.
 */
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@corensystem/coren-ui/navigation-menu";

export function DepthDo() {
	return (
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Resources</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="wwc:grid wwc:gap-3 wwc:p-4 wwc:w-80 wwc:grid-cols-2">
							{/* All items at same level - easy to navigate */}
							<li>
								<NavigationMenuLink asChild>
									<a href="#" className="wwc:block wwc:rounded-md wwc:p-3 wwc:text-sm wwc:hover:bg-accent">
										Documentation
									</a>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<a href="#" className="wwc:block wwc:rounded-md wwc:p-3 wwc:text-sm wwc:hover:bg-accent">
										API Reference
									</a>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<a href="#" className="wwc:block wwc:rounded-md wwc:p-3 wwc:text-sm wwc:hover:bg-accent">
										Tutorials
									</a>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<a href="#" className="wwc:block wwc:rounded-md wwc:p-3 wwc:text-sm wwc:hover:bg-accent">
										Examples
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
