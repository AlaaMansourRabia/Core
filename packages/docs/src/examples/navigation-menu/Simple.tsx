/**
 * Simple navigation without dropdowns.
 */
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "@corensystem/coren-ui/navigation-menu";

export function Simple() {
	return (
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuLink asChild>
						<a
							href="#"
							className="wwc:group wwc:inline-flex wwc:h-10 wwc:w-max wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-background wwc:px-4 wwc:py-2 wwc:text-sm wwc:font-medium wwc:transition-colors wwc:hover:bg-accent"
						>
							Home
						</a>
					</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink asChild>
						<a
							href="#"
							className="wwc:group wwc:inline-flex wwc:h-10 wwc:w-max wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-background wwc:px-4 wwc:py-2 wwc:text-sm wwc:font-medium wwc:transition-colors wwc:hover:bg-accent"
						>
							About
						</a>
					</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink asChild>
						<a
							href="#"
							className="wwc:group wwc:inline-flex wwc:h-10 wwc:w-max wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-background wwc:px-4 wwc:py-2 wwc:text-sm wwc:font-medium wwc:transition-colors wwc:hover:bg-accent"
						>
							Contact
						</a>
					</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}
