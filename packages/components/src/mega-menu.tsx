import {cn} from "@corensystem/core-utils";
import {ChevronDown} from "lucide-react";
import * as React from "react";

import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "./navigation-menu";

export interface MegaMenuSection {
	title?: string;
	items: MegaMenuItem[];
}

export interface MegaMenuItem {
	title: string;
	description?: string;
	href: string;
	icon?: React.ReactNode;
}

export interface MegaMenuCategory {
	label: string;
	sections: MegaMenuSection[];
	/** Featured/highlighted item */
	featured?: {
		title: string;
		description: string;
		href: string;
		image?: string;
	};
}

export interface MegaMenuProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Menu categories */
	categories: MegaMenuCategory[];
	/** Logo or brand element */
	logo?: React.ReactNode;
	/** Actions on the right side */
	actions?: React.ReactNode;
}

/** Top navigation mega menu for complex navigation hierarchies. */
const MegaMenu = React.forwardRef<HTMLDivElement, MegaMenuProps>(
	({className, categories, logo, actions, ...props}, ref) => (
		<div
			ref={ref}
			className={cn(
				"wwc:flex wwc:items-center wwc:justify-between wwc:px-4 wwc:h-14 wwc:border-b wwc:border-border wwc:bg-background",
				className,
			)}
			{...props}
		>
			{logo && <div className="wwc:flex-shrink-0">{logo}</div>}

			<NavigationMenu className="wwc:hidden wwc:md:flex">
				<NavigationMenuList>
					{categories.map((category) => (
						<NavigationMenuItem key={category.label}>
							<NavigationMenuTrigger className="wwc:h-9">{category.label}</NavigationMenuTrigger>
							<NavigationMenuContent>
								<div className="wwc:grid wwc:gap-3 wwc:p-6 wwc:w-[400px] wwc:md:w-[500px] wwc:lg:w-[600px] wwc:lg:grid-cols-[.75fr_1fr]">
									{category.featured && (
										<div className="wwc:row-span-3">
											<NavigationMenuLink asChild>
												<a
													href={category.featured.href}
													className="wwc:flex wwc:h-full wwc:w-full wwc:select-none wwc:flex-col wwc:justify-end wwc:rounded-md wwc:bg-gradient-to-b wwc:from-muted/50 wwc:to-muted wwc:p-6 wwc:no-underline wwc:outline-none wwc:focus:shadow-md"
												>
													{category.featured.image && (
														<img
															src={category.featured.image}
															alt=""
															className="wwc:mb-4 wwc:rounded wwc:object-cover"
														/>
													)}
													<div className="wwc:mb-2 wwc:text-lg wwc:font-medium">{category.featured.title}</div>
													<p className="wwc:text-sm wwc:leading-tight wwc:text-muted-foreground">
														{category.featured.description}
													</p>
												</a>
											</NavigationMenuLink>
										</div>
									)}
									<div className={cn(!category.featured && "wwc:col-span-2")}>
										{category.sections.map((section, sectionIdx) => (
											<div key={sectionIdx} className="wwc:mb-4 wwc:last:mb-0">
												{section.title && (
													<h4 className="wwc:mb-2 wwc:text-sm wwc:font-semibold wwc:text-foreground">
														{section.title}
													</h4>
												)}
												<ul className="wwc:grid wwc:gap-2">
													{section.items.map((item) => (
														<li key={item.href}>
															<NavigationMenuLink asChild>
																<a
																	href={item.href}
																	className="wwc:flex wwc:items-start wwc:gap-3 wwc:rounded-md wwc:p-2 wwc:hover:bg-accent wwc:hover:text-accent-foreground"
																>
																	{item.icon && (
																		<div className="wwc:flex-shrink-0 wwc:text-muted-foreground">{item.icon}</div>
																	)}
																	<div>
																		<div className="wwc:text-sm wwc:font-medium wwc:leading-none">{item.title}</div>
																		{item.description && (
																			<p className="wwc:mt-1 wwc:text-xs wwc:text-muted-foreground wwc:line-clamp-2">
																				{item.description}
																			</p>
																		)}
																	</div>
																</a>
															</NavigationMenuLink>
														</li>
													))}
												</ul>
											</div>
										))}
									</div>
								</div>
							</NavigationMenuContent>
						</NavigationMenuItem>
					))}
				</NavigationMenuList>
			</NavigationMenu>

			{actions && <div className="wwc:flex wwc:items-center wwc:gap-2">{actions}</div>}
		</div>
	),
);
MegaMenu.displayName = "MegaMenu";

export {MegaMenu};
