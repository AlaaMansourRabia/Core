import React from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {cn} from "@/lib/utils";

const ListItem = React.forwardRef<React.ElementRef<"a">, React.ComponentPropsWithoutRef<"a">>(
	({className, title, children, ...props}, ref) => {
		return (
			<li>
				<NavigationMenuLink asChild>
					<a
						ref={ref}
						className={cn(
							"wwc:block wwc:select-none wwc:space-y-1 wwc:rounded-md wwc:p-3 wwc:leading-none wwc:no-underline wwc:outline-none wwc:transition-colors wwc:hover:bg-accent wwc:hover:text-accent-foreground wwc:focus:bg-accent wwc:focus:text-accent-foreground",
							className,
						)}
						{...props}
					>
						<div className="wwc:text-sm wwc:font-medium wwc:leading-none">{title}</div>
						<p className="wwc:line-clamp-2 wwc:text-sm wwc:leading-snug wwc:text-muted-foreground">{children}</p>
					</a>
				</NavigationMenuLink>
			</li>
		);
	},
);
ListItem.displayName = "ListItem";

export function NavigationMenuPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Navigation Menu</h1>
					<CopyButton
						value="Navigation Menu"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">A collection of links for navigating websites.</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Navigation Menu - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<NavigationMenu>
						<NavigationMenuList>
							<NavigationMenuItem>
								<NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
								<NavigationMenuContent>
									<ul className="wwc:grid wwc:gap-3 wwc:p-6 wwc:md:w-[400px] wwc:lg:w-[500px] wwc:lg:grid-cols-[.75fr_1fr]">
										<li className="wwc:row-span-3">
											<NavigationMenuLink asChild>
												<a
													className="wwc:flex wwc:h-full wwc:w-full wwc:select-none wwc:flex-col wwc:justify-end wwc:rounded-md wwc:bg-gradient-to-b wwc:from-muted/50 wwc:to-muted wwc:p-6 wwc:no-underline wwc:outline-none wwc:focus:shadow-md"
													href="/"
												>
													<div className="wwc:mb-2 wwc:mt-4 wwc:text-lg wwc:font-medium">shadcn/ui</div>
													<p className="wwc:text-sm wwc:leading-tight wwc:text-muted-foreground">
														Beautifully designed components built with Radix UI and Tailwind CSS.
													</p>
												</a>
											</NavigationMenuLink>
										</li>
										<ListItem href="/docs" title="Introduction">
											Re-usable components built using Radix UI and Tailwind CSS.
										</ListItem>
										<ListItem href="/docs/installation" title="Installation">
											How to install dependencies and structure your app.
										</ListItem>
										<ListItem href="/docs/primitives/typography" title="Typography">
											Styles for headings, paragraphs, lists...etc
										</ListItem>
									</ul>
								</NavigationMenuContent>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<NavigationMenuTrigger>Components</NavigationMenuTrigger>
								<NavigationMenuContent>
									<ul className="wwc:grid wwc:w-[400px] wwc:gap-3 wwc:p-4 wwc:md:w-[500px] wwc:md:grid-cols-2 wwc:lg:w-[600px]">
										<ListItem title="Alert Dialog" href="/components/alert-dialog">
											A modal dialog that interrupts the user.
										</ListItem>
										<ListItem title="Hover Card" href="/components/hover-card">
											For sighted users to preview content.
										</ListItem>
										<ListItem title="Progress" href="/components/progress">
											Displays an indicator of progress.
										</ListItem>
										<ListItem title="Scroll Area" href="/components/scroll-area">
											Visually or semantically separates content.
										</ListItem>
									</ul>
								</NavigationMenuContent>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<NavigationMenuLink className={navigationMenuTriggerStyle()}>Documentation</NavigationMenuLink>
							</NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Navigation Menu - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Extends native{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<nav>"}</code> HTML
						attributes via Radix NavigationMenu.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Prop</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Default</th>
									<th className="wwc:text-left wwc:py-3 wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{
										prop: "className",
										type: "string",
										def: "-",
										desc: "Additional CSS classes for the navigation menu root.",
									},
									{prop: "children", type: "ReactNode", def: "-", desc: "NavigationMenuList and other content."},
									{
										prop: "asChild",
										type: "boolean",
										def: "false",
										desc: "Merge props onto child element instead of rendering a DOM node (NavigationMenuLink).",
									},
								].map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-primary wwc:font-medium wwc:whitespace-nowrap">
											{row.prop}
										</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.type}</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.def}</td>
										<td className="wwc:py-3 wwc:text-muted-foreground">{row.desc}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Navigation Menu - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink>Link</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
