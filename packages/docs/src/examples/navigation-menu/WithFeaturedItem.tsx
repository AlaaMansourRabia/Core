/**
 * Navigation menu with featured/highlighted item.
 */
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@corensystem/coren-ui/navigation-menu";

export function WithFeaturedItem() {
	return (
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Products</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="wwc:grid wwc:gap-3 wwc:p-4 wwc:w-[500px] wwc:grid-cols-[.75fr_1fr]">
							<li className="wwc:row-span-3">
								<NavigationMenuLink asChild>
									<a
										href="#"
										className="wwc:flex wwc:h-full wwc:w-full wwc:select-none wwc:flex-col wwc:justify-end wwc:rounded-md wwc:bg-gradient-to-b wwc:from-primary/50 wwc:to-primary wwc:p-6 wwc:no-underline wwc:outline-none wwc:focus:shadow-md"
									>
										<div className="wwc:mt-4 wwc:text-lg wwc:font-medium wwc:text-primary-foreground">Pro Plan</div>
										<p className="wwc:text-sm wwc:leading-tight wwc:text-primary-foreground/80">
											Unlock all features with our professional plan.
										</p>
									</a>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<a
										href="#"
										className="wwc:block wwc:select-none wwc:rounded-md wwc:p-3 wwc:leading-none wwc:no-underline wwc:outline-none wwc:transition-colors wwc:hover:bg-accent"
									>
										<div className="wwc:text-sm wwc:font-medium">Free</div>
										<p className="wwc:text-sm wwc:text-muted-foreground">Get started for free</p>
									</a>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<a
										href="#"
										className="wwc:block wwc:select-none wwc:rounded-md wwc:p-3 wwc:leading-none wwc:no-underline wwc:outline-none wwc:transition-colors wwc:hover:bg-accent"
									>
										<div className="wwc:text-sm wwc:font-medium">Team</div>
										<p className="wwc:text-sm wwc:text-muted-foreground">Collaborate with your team</p>
									</a>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<a
										href="#"
										className="wwc:block wwc:select-none wwc:rounded-md wwc:p-3 wwc:leading-none wwc:no-underline wwc:outline-none wwc:transition-colors wwc:hover:bg-accent"
									>
										<div className="wwc:text-sm wwc:font-medium">Enterprise</div>
										<p className="wwc:text-sm wwc:text-muted-foreground">Custom solutions</p>
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
