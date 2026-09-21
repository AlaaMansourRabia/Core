import type {Meta, StoryObj} from "storybook/internal/types";

const spacingScale = [
	{class: "0", value: "0px"},
	{class: "0.5", value: "2px"},
	{class: "1", value: "4px"},
	{class: "1.5", value: "6px"},
	{class: "2", value: "8px"},
	{class: "2.5", value: "10px"},
	{class: "3", value: "12px"},
	{class: "3.5", value: "14px"},
	{class: "4", value: "16px"},
	{class: "5", value: "20px"},
	{class: "6", value: "24px"},
	{class: "7", value: "28px"},
	{class: "8", value: "32px"},
	{class: "9", value: "36px"},
	{class: "10", value: "40px"},
	{class: "11", value: "44px"},
	{class: "12", value: "48px"},
	{class: "14", value: "56px"},
	{class: "16", value: "64px"},
	{class: "20", value: "80px"},
	{class: "24", value: "96px"},
];

function SpacingStory() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<h2 className="wwc:text-2xl wwc:font-bold">Spacing Scale</h2>
				<p className="wwc:text-muted-foreground wwc:mt-1">
					Standard Tailwind spacing scale (4px base unit). Use for margin, padding, gap, width, and height.
				</p>
			</div>
			<div className="wwc:space-y-3">
				{spacingScale.map((item) => (
					<div key={item.class} className="wwc:flex wwc:items-center wwc:gap-4">
						<code className="wwc:text-xs wwc:text-muted-foreground wwc:w-10 wwc:text-right">{item.class}</code>
						<div className="wwc:h-4 wwc:bg-primary wwc:rounded" style={{width: item.value}} />
						<span className="wwc:text-xs wwc:text-muted-foreground">{item.value}</span>
					</div>
				))}
			</div>

			<div>
				<h2 className="wwc:text-2xl wwc:font-bold">Usage Examples</h2>
			</div>
			<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
				{`// Padding
<div className="wwc:p-4">     // 16px all sides
<div className="wwc:px-6">    // 24px horizontal
<div className="wwc:py-2">    // 8px vertical

// Margin
<div className="wwc:m-4">     // 16px all sides
<div className="wwc:mx-auto"> // center horizontally
<div className="wwc:mt-6">    // 24px top margin

// Gap (flexbox/grid)
<div className="wwc:gap-4">   // 16px gap
<div className="wwc:gap-x-2"> // 8px horizontal gap

// Space between (children)
<div className="wwc:space-y-4">  // 16px vertical space
<div className="wwc:space-x-2">  // 8px horizontal space`}
			</pre>

			<div>
				<h2 className="wwc:text-2xl wwc:font-bold">Common Patterns</h2>
			</div>
			<div className="wwc:space-y-6">
				<div>
					<p className="wwc:text-sm wwc:font-medium wwc:mb-2">Component padding</p>
					<div className="wwc:flex wwc:gap-2">
						<span className="wwc:px-3 wwc:py-2 wwc:bg-muted wwc:rounded wwc:text-sm">wwc:p-4 (16px)</span>
						<span className="wwc:px-3 wwc:py-2 wwc:bg-muted wwc:rounded wwc:text-sm">wwc:p-6 (24px)</span>
					</div>
				</div>
				<div>
					<p className="wwc:text-sm wwc:font-medium wwc:mb-2">Section gaps</p>
					<div className="wwc:flex wwc:gap-2">
						<span className="wwc:px-3 wwc:py-2 wwc:bg-muted wwc:rounded wwc:text-sm">wwc:gap-6 (24px)</span>
						<span className="wwc:px-3 wwc:py-2 wwc:bg-muted wwc:rounded wwc:text-sm">wwc:gap-8 (32px)</span>
					</div>
				</div>
				<div>
					<p className="wwc:text-sm wwc:font-medium wwc:mb-2">Page margins</p>
					<div className="wwc:flex wwc:gap-2">
						<span className="wwc:px-3 wwc:py-2 wwc:bg-muted wwc:rounded wwc:text-sm">wwc:px-8 (32px)</span>
						<span className="wwc:px-3 wwc:py-2 wwc:bg-muted wwc:rounded wwc:text-sm">wwc:py-8 (32px)</span>
					</div>
				</div>
			</div>
		</div>
	);
}

const meta = {
	title: "Design Tokens/Spacing",
	tags: ["autodocs", "!manifest"],
	parameters: {
		docs: {
			description: {
				component: "Tailwind spacing scale (4px base unit) with visual bars, usage examples, and common patterns.",
			},
		},
	},
	render: () => <SpacingStory />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
