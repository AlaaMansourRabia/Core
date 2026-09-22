import type {Meta, StoryObj} from "storybook/internal/types";

import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "@core/core-ui/navigation-menu";

const meta = {
	title: "Components/Navigation/Navigation Menu",
	component: NavigationMenu,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"A collection of links for navigating websites. Built on top of Radix UI Navigation Menu with animated content transitions.",
			},
		},
	},
} satisfies Meta<typeof NavigationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="wwc:grid wwc:gap-3 wwc:p-4 wwc:md:w-[400px] wwc:lg:w-[500px] wwc:lg:grid-cols-[.75fr_1fr]">
							<li className="wwc:row-span-3">
								<NavigationMenuLink asChild>
									<a
										className="wwc:flex wwc:h-full wwc:w-full wwc:select-none wwc:flex-col wwc:justify-end wwc:rounded-md wwc:bg-gradient-to-b wwc:from-muted/50 wwc:to-muted wwc:p-6 wwc:no-underline wwc:outline-none wwc:focus:shadow-md"
										href="#"
									>
										<div className="wwc:mb-2 wwc:mt-4 wwc:text-lg wwc:font-medium">Core</div>
										<p className="wwc:text-sm wwc:leading-tight wwc:text-muted-foreground">
											Design system and component library for Core applications.
										</p>
									</a>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<a
										className="wwc:block wwc:select-none wwc:space-y-1 wwc:rounded-md wwc:p-3 wwc:leading-none wwc:no-underline wwc:outline-none wwc:transition-colors wwc:hover:bg-accent wwc:hover:text-accent-foreground wwc:focus:bg-accent wwc:focus:text-accent-foreground"
										href="#"
									>
										<div className="wwc:text-sm wwc:font-medium wwc:leading-none">Installation</div>
										<p className="wwc:line-clamp-2 wwc:text-sm wwc:leading-snug wwc:text-muted-foreground">
											How to install and set up Core.
										</p>
									</a>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<a
										className="wwc:block wwc:select-none wwc:space-y-1 wwc:rounded-md wwc:p-3 wwc:leading-none wwc:no-underline wwc:outline-none wwc:transition-colors wwc:hover:bg-accent wwc:hover:text-accent-foreground wwc:focus:bg-accent wwc:focus:text-accent-foreground"
										href="#"
									>
										<div className="wwc:text-sm wwc:font-medium wwc:leading-none">Typography</div>
										<p className="wwc:line-clamp-2 wwc:text-sm wwc:leading-snug wwc:text-muted-foreground">
											Styles for headings, paragraphs, and more.
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
						<ul className="wwc:grid wwc:w-[400px] wwc:gap-3 wwc:p-4 wwc:md:w-[500px] wwc:md:grid-cols-2">
							<li>
								<NavigationMenuLink asChild>
									<a
										className="wwc:block wwc:select-none wwc:space-y-1 wwc:rounded-md wwc:p-3 wwc:leading-none wwc:no-underline wwc:outline-none wwc:transition-colors wwc:hover:bg-accent wwc:hover:text-accent-foreground wwc:focus:bg-accent wwc:focus:text-accent-foreground"
										href="#"
									>
										<div className="wwc:text-sm wwc:font-medium wwc:leading-none">Button</div>
										<p className="wwc:line-clamp-2 wwc:text-sm wwc:leading-snug wwc:text-muted-foreground">
											Displays a button or a component that looks like a button.
										</p>
									</a>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<a
										className="wwc:block wwc:select-none wwc:space-y-1 wwc:rounded-md wwc:p-3 wwc:leading-none wwc:no-underline wwc:outline-none wwc:transition-colors wwc:hover:bg-accent wwc:hover:text-accent-foreground wwc:focus:bg-accent wwc:focus:text-accent-foreground"
										href="#"
									>
										<div className="wwc:text-sm wwc:font-medium wwc:leading-none">Dialog</div>
										<p className="wwc:line-clamp-2 wwc:text-sm wwc:leading-snug wwc:text-muted-foreground">
											A modal dialog that interrupts the user with important content.
										</p>
									</a>
								</NavigationMenuLink>
							</li>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
						Documentation
					</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	),
};

export const SimpleLinks: Story = {
	render: () => (
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
						Home
					</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
						About
					</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
						Contact
					</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	),
};

export const WithDropdown: Story = {
	render: () => (
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Products</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="wwc:grid wwc:w-[200px] wwc:gap-1 wwc:p-2">
							<li>
								<NavigationMenuLink asChild>
									<a className="wwc:block wwc:rounded-md wwc:p-2 wwc:text-sm wwc:hover:bg-accent" href="#">
										Analytics
									</a>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<a className="wwc:block wwc:rounded-md wwc:p-2 wwc:text-sm wwc:hover:bg-accent" href="#">
										Safety
									</a>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<a className="wwc:block wwc:rounded-md wwc:p-2 wwc:text-sm wwc:hover:bg-accent" href="#">
										Workforce
									</a>
								</NavigationMenuLink>
							</li>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
						Pricing
					</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	),
};
