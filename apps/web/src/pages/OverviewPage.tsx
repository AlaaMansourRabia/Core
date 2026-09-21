import {Link} from "react-router-dom";

import {
	type ComponentCategory,
	componentCategories,
	countItems,
	templateItems,
	themeItems,
	widgetCategories,
	widgetItems,
} from "@/components/layout/Sidebar";
import {Button} from "@/components/ui/button";

// Overview is generated from the same nav taxonomy the sidebar uses, so it always
// reflects the current sections (Components / Widgets / Templates) without drifting.

function CategoryGrid({categories}: {categories: ComponentCategory[]}) {
	return (
		<div className="wwc:grid wwc:grid-cols-1 wwc:md:grid-cols-2 wwc:lg:grid-cols-3 wwc:gap-8">
			{categories.map((category) => (
				<div key={category.name}>
					<h3 className="wwc:mb-3 wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-sm wwc:font-medium wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
						{category.label}
						<span className="wwc:font-normal wwc:text-muted-foreground/50">{category.items.length}</span>
					</h3>
					<div className="wwc:space-y-0.5">
						{category.items.map((item) => (
							<Button
								key={item.path}
								variant="link"
								asChild
								className="wwc:justify-start wwc:px-0 wwc:h-auto wwc:py-1 wwc:w-full"
							>
								<Link to={item.path}>{item.name}</Link>
							</Button>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

export function OverviewPage() {
	return (
		<div className="wwc:space-y-8" data-wakecore-region="catalog-content" data-wakecore-surface-owner="route">
			{/* Hero banner */}
			<img
				src={`${import.meta.env.BASE_URL}designers-hub-hero.png`}
				alt="Wakecore — One Artifact Library: Tokens → Components → Widgets → Templates → Knowledge → AI"
				className="wwc:w-full wwc:rounded-xl wwc:border wwc:border-border"
			/>

			{/* Page Title */}
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Overview</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Every theme token, component, widget, and template in the Wakecore design system — grouped exactly as they
					appear in the sidebar.
				</p>
			</div>

			{/* Storybook: Getting Started / Design Tokens */}
			<section>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-4">Getting Started</h2>
				<h3 className="wwc:mb-3 wwc:text-sm wwc:font-medium wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
					Design Tokens
				</h3>
				<div className="wwc:grid wwc:grid-cols-2 wwc:sm:grid-cols-4 wwc:gap-x-4 wwc:gap-y-1">
					{themeItems.map((item) => (
						<Button key={item.path} variant="link" asChild className="wwc:justify-start wwc:px-0 wwc:h-auto wwc:py-1">
							<Link to={item.path}>{item.name}</Link>
						</Button>
					))}
				</div>
			</section>

			{/* Components Section */}
			<section>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-6">Components ({countItems(componentCategories)})</h2>
				<CategoryGrid categories={componentCategories} />
			</section>

			{/* Widgets Section */}
			<section>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-6">
					Widgets ({countItems(widgetCategories) + widgetItems.length})
				</h2>
				<CategoryGrid categories={widgetCategories} />
				<div className="wwc:mt-6">
					{widgetItems.map((item) => (
						<Button key={item.path} variant="link" asChild className="wwc:h-auto wwc:px-0 wwc:py-1">
							<Link to={item.path}>{item.name}</Link>
						</Button>
					))}
				</div>
			</section>

			{/* Templates Section */}
			<section>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-6">Templates ({templateItems.length})</h2>
				<div className="wwc:grid wwc:grid-cols-2 wwc:sm:grid-cols-3 wwc:lg:grid-cols-4 wwc:gap-x-4 wwc:gap-y-1">
					{templateItems.map((item) => (
						<Button key={item.path} variant="link" asChild className="wwc:justify-start wwc:px-0 wwc:h-auto wwc:py-1">
							<Link to={item.path}>{item.name}</Link>
						</Button>
					))}
				</div>
			</section>
		</div>
	);
}
