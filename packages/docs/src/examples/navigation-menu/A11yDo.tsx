/**
 * Ensure keyboard navigation works properly.
 */
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@corensystem/coren-ui/navigation-menu";

export function A11yDo() {
	return (
		<div className="wwc:space-y-2">
			<NavigationMenu>
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuTrigger>Menu</NavigationMenuTrigger>
						<NavigationMenuContent>
							<ul className="wwc:grid wwc:gap-2 wwc:p-4 wwc:w-48">
								<li>
									<NavigationMenuLink asChild>
										<a
											href="#"
											className="wwc:block wwc:rounded-md wwc:p-2 wwc:text-sm wwc:hover:bg-accent wwc:focus:bg-accent wwc:focus:outline-none"
										>
											Option 1
										</a>
									</NavigationMenuLink>
								</li>
								<li>
									<NavigationMenuLink asChild>
										<a
											href="#"
											className="wwc:block wwc:rounded-md wwc:p-2 wwc:text-sm wwc:hover:bg-accent wwc:focus:bg-accent wwc:focus:outline-none"
										>
											Option 2
										</a>
									</NavigationMenuLink>
								</li>
							</ul>
						</NavigationMenuContent>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>
			<p className="wwc:text-xs wwc:text-muted-foreground">Tab, arrow keys, and Escape all work</p>
		</div>
	);
}
