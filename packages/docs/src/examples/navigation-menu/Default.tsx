/**
 * Basic navigation menu with dropdowns.
 */
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@corensystem/coren-ui/navigation-menu";

export function Default() {
	return (
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="wwc:grid wwc:gap-3 wwc:p-4 wwc:w-96">
							<li>
								<NavigationMenuLink asChild>
									<a
										href="#"
										className="wwc:block wwc:select-none wwc:rounded-md wwc:p-3 wwc:leading-none wwc:no-underline wwc:outline-none wwc:transition-colors wwc:hover:bg-accent"
									>
										<div className="wwc:text-sm wwc:font-medium">Introduction</div>
										<p className="wwc:text-sm wwc:text-muted-foreground">
											Learn the basics of our design system
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
										<div className="wwc:text-sm wwc:font-medium">Installation</div>
										<p className="wwc:text-sm wwc:text-muted-foreground">
											Step-by-step installation guide
										</p>
									</a>
								</NavigationMenuLink>
							</li>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Components</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="wwc:grid wwc:gap-3 wwc:p-4 wwc:w-96 wwc:grid-cols-2">
							<li>
								<NavigationMenuLink asChild>
									<a
										href="#"
										className="wwc:block wwc:select-none wwc:rounded-md wwc:p-3 wwc:leading-none wwc:no-underline wwc:outline-none wwc:transition-colors wwc:hover:bg-accent"
									>
										<div className="wwc:text-sm wwc:font-medium">Button</div>
									</a>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<a
										href="#"
										className="wwc:block wwc:select-none wwc:rounded-md wwc:p-3 wwc:leading-none wwc:no-underline wwc:outline-none wwc:transition-colors wwc:hover:bg-accent"
									>
										<div className="wwc:text-sm wwc:font-medium">Input</div>
									</a>
								</NavigationMenuLink>
							</li>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink asChild>
						<a
							href="#"
							className="wwc:group wwc:inline-flex wwc:h-10 wwc:w-max wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-background wwc:px-4 wwc:py-2 wwc:text-sm wwc:font-medium wwc:transition-colors wwc:hover:bg-accent"
						>
							Documentation
						</a>
					</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}
