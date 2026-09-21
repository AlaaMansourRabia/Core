import type {Meta, StoryObj} from "storybook/internal/types";

const colorTokens = [
	{name: "background", var: "--background", description: "Page background"},
	{name: "foreground", var: "--foreground", description: "Default text color"},
	{name: "card", var: "--card", description: "Card backgrounds"},
	{name: "card-foreground", var: "--card-foreground", description: "Card text"},
	{name: "popover", var: "--popover", description: "Popover backgrounds"},
	{name: "popover-foreground", var: "--popover-foreground", description: "Popover text"},
	{name: "primary", var: "--primary", description: "Primary actions & CTAs"},
	{name: "primary-foreground", var: "--primary-foreground", description: "Primary action text"},
	{name: "secondary", var: "--secondary", description: "Secondary elements"},
	{name: "secondary-foreground", var: "--secondary-foreground", description: "Secondary text"},
	{name: "muted", var: "--muted", description: "Muted backgrounds"},
	{name: "muted-foreground", var: "--muted-foreground", description: "Muted/subtle text"},
	{name: "accent", var: "--accent", description: "Selected/on-state fill"},
	{name: "accent-foreground", var: "--accent-foreground", description: "Accent text"},
	{name: "menu-highlight", var: "--menu-highlight", description: "Focused menu/list row"},
	{name: "menu-highlight-foreground", var: "--menu-highlight-foreground", description: "Focused menu row text"},
	{name: "destructive", var: "--destructive", description: "Danger/delete actions"},
	{name: "destructive-foreground", var: "--destructive-foreground", description: "Destructive text"},
	{name: "border", var: "--border", description: "Borders"},
	{name: "input", var: "--input", description: "Input borders"},
	{name: "ring", var: "--ring", description: "Focus rings"},
];

function ColorsStory() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<h2 className="wwc:text-2xl wwc:font-bold">Semantic Color Tokens</h2>
				<p className="wwc:text-muted-foreground wwc:mt-1">
					Each color has a paired foreground token for text contrast.
				</p>
			</div>
			<div className="wwc:grid wwc:gap-3">
				{colorTokens.map((token) => (
					<div key={token.name} className="wwc:flex wwc:items-center wwc:gap-4 wwc:rounded-lg wwc:border wwc:p-3">
						<div
							className="wwc:h-10 wwc:w-10 wwc:rounded-md wwc:border wwc:shadow-sm"
							style={{backgroundColor: `var(${token.var})`}}
						/>
						<div className="wwc:flex-1">
							<div className="wwc:font-mono wwc:text-sm wwc:font-medium">{token.name}</div>
							<div className="wwc:text-xs wwc:text-muted-foreground">{token.description}</div>
						</div>
						<code className="wwc:text-xs wwc:text-muted-foreground wwc:bg-muted wwc:px-2 wwc:py-1 wwc:rounded">
							{token.var}
						</code>
					</div>
				))}
			</div>

			<div>
				<h2 className="wwc:text-2xl wwc:font-bold">Usage</h2>
			</div>
			<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
				{`// Tailwind classes
<div className="wwc:bg-background wwc:text-foreground">
<button className="wwc:bg-primary wwc:text-primary-foreground">
<div className="wwc:bg-card wwc:text-card-foreground">
<span className="wwc:text-muted-foreground">

// CSS
background-color: var(--background);
color: var(--foreground);`}
			</pre>
		</div>
	);
}

const meta = {
	title: "Design Tokens/Colors",
	tags: ["autodocs", "!manifest"],
	parameters: {
		docs: {
			description: {
				component:
					"Theme colors using CSS variables with oklch color space. Includes semantic tokens for consistent theming.",
			},
		},
	},
	render: () => <ColorsStory />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
