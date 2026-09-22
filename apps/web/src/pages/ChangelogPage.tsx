import {Badge} from "@/components/ui/badge";

interface ChangelogEntry {
	version: string;
	date: string;
	changes: {
		type: "component" | "theme" | "other";
		description: string;
	}[];
}

const changelog: ChangelogEntry[] = [
	{
		version: "1.0",
		date: "2025-01-05",
		changes: [
			{type: "component", description: "Initial release with 59 components"},
			{type: "theme", description: "Added Colors, Typography, Spacing, and Radius tokens"},
			{type: "component", description: "Added Primitives: Button, Input, Textarea, Select, Checkbox, Switch, and more"},
			{type: "component", description: "Added Layout components: Card, Table, Tabs, Accordion, Sidebar"},
			{type: "component", description: "Added Overlay components: Dialog, Sheet, Drawer, Popover, Tooltip"},
			{type: "component", description: "Added Navigation components: Breadcrumb, Pagination, Command"},
			{type: "component", description: "Added Form components: Form, Field, Calendar, Date Picker"},
			{type: "component", description: "Added Feedback components: Alert, Toast, Sonner, Empty"},
			{type: "component", description: "Added Display components: Carousel, Chart, Typography"},
		],
	},
];

function getTypeVariant(type: ChangelogEntry["changes"][0]["type"]) {
	switch (type) {
		case "component":
			return "destructive";
		case "theme":
			return "outline";
		case "other":
			return "outline";
	}
}

function getTypeLabel(type: ChangelogEntry["changes"][0]["type"]) {
	switch (type) {
		case "component":
			return "Component";
		case "theme":
			return "Theme";
		case "other":
			return "Other";
	}
}

export function ChangelogPage() {
	return (
		<div className="wwc:space-y-8">
			{/* Page Title */}
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Changelog</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">Track all changes and updates to the Core design system.</p>
			</div>

			{/* Timeline */}
			<div className="wwc:relative">
				{changelog.map((entry, index) => (
					<div key={entry.version} className="wwc:relative wwc:flex wwc:gap-6 wwc:pb-10 wwc:last:pb-0">
						{/* Date indicator on left */}
						<div className="wwc:flex wwc:flex-col wwc:items-end wwc:w-20 wwc:shrink-0 wwc:pt-0.5">
							<span className="wwc:text-xs wwc:text-muted-foreground">{entry.date}</span>
						</div>

						{/* Timeline line and dot */}
						<div className="wwc:relative wwc:flex wwc:flex-col wwc:items-center">
							<div className="wwc:h-2 wwc:w-2 wwc:rounded-full wwc:bg-foreground wwc:shrink-0 wwc:mt-1.5" />
							{index < changelog.length - 1 && <div className="wwc:w-px wwc:flex-1 wwc:bg-border wwc:mt-2" />}
						</div>

						{/* Content */}
						<div className="wwc:flex-1 wwc:pb-2">
							<h2 className="wwc:text-lg wwc:font-semibold wwc:mb-3">V{entry.version}</h2>
							<ul className="wwc:space-y-2">
								{entry.changes.map((change, changeIndex) => (
									<li key={changeIndex} className="wwc:flex wwc:items-start wwc:gap-2">
										<Badge
											variant={getTypeVariant(change.type) as "destructive" | "outline"}
											className="wwc:mt-0.5 wwc:shrink-0 wwc:text-[10px] wwc:px-1.5 wwc:py-0 wwc:h-4 wwc:font-normal"
										>
											{getTypeLabel(change.type)}
										</Badge>
										<span className="wwc:text-sm wwc:text-muted-foreground">{change.description}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
