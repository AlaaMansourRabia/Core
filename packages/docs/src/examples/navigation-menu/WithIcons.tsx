/**
 * Navigation menu with icons.
 */
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@corensystem/coren-ui/navigation-menu";
import {Layers, Palette, Settings, Zap} from "lucide-react";

export function WithIcons() {
	return (
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Features</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="wwc:grid wwc:gap-3 wwc:p-4 wwc:w-80">
							<li>
								<NavigationMenuLink asChild>
									<a
										href="#"
										className="wwc:flex wwc:select-none wwc:gap-3 wwc:rounded-md wwc:p-3 wwc:leading-none wwc:no-underline wwc:outline-none wwc:transition-colors wwc:hover:bg-accent"
									>
										<Layers className="wwc:h-5 wwc:w-5 wwc:text-primary" />
										<div>
											<div className="wwc:text-sm wwc:font-medium">Components</div>
											<p className="wwc:text-sm wwc:text-muted-foreground">
												50+ accessible components
											</p>
										</div>
									</a>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<a
										href="#"
										className="wwc:flex wwc:select-none wwc:gap-3 wwc:rounded-md wwc:p-3 wwc:leading-none wwc:no-underline wwc:outline-none wwc:transition-colors wwc:hover:bg-accent"
									>
										<Palette className="wwc:h-5 wwc:w-5 wwc:text-primary" />
										<div>
											<div className="wwc:text-sm wwc:font-medium">Theming</div>
											<p className="wwc:text-sm wwc:text-muted-foreground">
												Customizable design tokens
											</p>
										</div>
									</a>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<a
										href="#"
										className="wwc:flex wwc:select-none wwc:gap-3 wwc:rounded-md wwc:p-3 wwc:leading-none wwc:no-underline wwc:outline-none wwc:transition-colors wwc:hover:bg-accent"
									>
										<Zap className="wwc:h-5 wwc:w-5 wwc:text-primary" />
										<div>
											<div className="wwc:text-sm wwc:font-medium">Performance</div>
											<p className="wwc:text-sm wwc:text-muted-foreground">
												Optimized for speed
											</p>
										</div>
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
