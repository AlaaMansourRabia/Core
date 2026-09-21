import type {Meta, StoryObj} from "storybook/internal/types";

function FontFamilyStory() {
	return (
		<div className="wwc:space-y-8">
			{/* Font Families */}
			<div>
				<h2 className="wwc:text-2xl wwc:font-bold">Font Families</h2>
				<p className="wwc:text-muted-foreground wwc:mt-1">Three font families for different use cases.</p>
			</div>
			<div className="wwc:space-y-8">
				<div className="wwc:space-y-3">
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						<span className="wwc:text-sm wwc:font-medium wwc:bg-primary wwc:text-primary-foreground wwc:px-2 wwc:py-0.5 wwc:rounded">
							Sans
						</span>
						<span className="wwc:text-sm wwc:text-muted-foreground">Figtree</span>
					</div>
					<p className="wwc:text-2xl wwc:font-sans">The quick brown fox jumps over the lazy dog</p>
					<p className="wwc:text-sm wwc:text-muted-foreground wwc:font-sans">
						ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
					</p>
				</div>
				<div className="wwc:space-y-3">
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						<span className="wwc:text-sm wwc:font-medium wwc:bg-primary wwc:text-primary-foreground wwc:px-2 wwc:py-0.5 wwc:rounded">
							Serif
						</span>
						<span className="wwc:text-sm wwc:text-muted-foreground">Lora</span>
					</div>
					<p className="wwc:text-2xl wwc:font-serif">The quick brown fox jumps over the lazy dog</p>
					<p className="wwc:text-sm wwc:text-muted-foreground wwc:font-serif">
						ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
					</p>
				</div>
				<div className="wwc:space-y-3">
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						<span className="wwc:text-sm wwc:font-medium wwc:bg-primary wwc:text-primary-foreground wwc:px-2 wwc:py-0.5 wwc:rounded">
							Mono
						</span>
						<span className="wwc:text-sm wwc:text-muted-foreground">IBM Plex Mono</span>
					</div>
					<p className="wwc:text-2xl wwc:font-mono">The quick brown fox jumps over the lazy dog</p>
					<p className="wwc:text-sm wwc:text-muted-foreground wwc:font-mono">
						ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
					</p>
				</div>
			</div>

			{/* Type Scale */}
			<div>
				<h2 className="wwc:text-2xl wwc:font-bold">Type Scale</h2>
				<p className="wwc:text-muted-foreground wwc:mt-1">Standard Tailwind text sizes.</p>
			</div>
			<div className="wwc:space-y-6">
				{[
					{class: "wwc:text-xs", size: "12px"},
					{class: "wwc:text-sm", size: "14px"},
					{class: "wwc:text-base", size: "16px"},
					{class: "wwc:text-lg", size: "18px"},
					{class: "wwc:text-xl", size: "20px"},
					{class: "wwc:text-2xl", size: "24px"},
					{class: "wwc:text-3xl", size: "30px"},
					{class: "wwc:text-4xl", size: "36px"},
				].map((item) => (
					<div key={item.class} className="wwc:flex wwc:items-baseline wwc:gap-4">
						<code className="wwc:text-xs wwc:text-muted-foreground wwc:w-20">{item.class}</code>
						<span className={item.class}>The quick brown fox</span>
						<span className="wwc:text-xs wwc:text-muted-foreground">{item.size}</span>
					</div>
				))}
			</div>

			{/* Font Weights */}
			<div>
				<h2 className="wwc:text-2xl wwc:font-bold">Font Weights</h2>
				<p className="wwc:text-muted-foreground wwc:mt-1">Figtree supports variable weights from 300 to 900.</p>
			</div>
			<div className="wwc:space-y-4">
				{[
					{class: "wwc:font-light", weight: "300"},
					{class: "wwc:font-normal", weight: "400"},
					{class: "wwc:font-medium", weight: "500"},
					{class: "wwc:font-semibold", weight: "600"},
					{class: "wwc:font-bold", weight: "700"},
					{class: "wwc:font-extrabold", weight: "800"},
					{class: "wwc:font-black", weight: "900"},
				].map((item) => (
					<div key={item.class} className="wwc:flex wwc:items-center wwc:gap-4">
						<code className="wwc:text-xs wwc:text-muted-foreground wwc:w-28">{item.class}</code>
						<span className={`wwc:text-lg ${item.class}`}>The quick brown fox</span>
						<span className="wwc:text-xs wwc:text-muted-foreground">{item.weight}</span>
					</div>
				))}
			</div>

			{/* Text Colors */}
			<div>
				<h2 className="wwc:text-2xl wwc:font-bold">Text Colors</h2>
			</div>
			<div className="wwc:space-y-4">
				<div className="wwc:flex wwc:items-center wwc:gap-4">
					<code className="wwc:text-xs wwc:text-muted-foreground wwc:w-40">wwc:text-foreground</code>
					<span className="wwc:text-foreground">Primary text</span>
				</div>
				<div className="wwc:flex wwc:items-center wwc:gap-4">
					<code className="wwc:text-xs wwc:text-muted-foreground wwc:w-40">wwc:text-muted-foreground</code>
					<span className="wwc:text-muted-foreground">Secondary/muted text</span>
				</div>
				<div className="wwc:flex wwc:items-center wwc:gap-4">
					<code className="wwc:text-xs wwc:text-muted-foreground wwc:w-40">wwc:text-primary</code>
					<span className="wwc:text-primary">Primary color text</span>
				</div>
				<div className="wwc:flex wwc:items-center wwc:gap-4">
					<code className="wwc:text-xs wwc:text-muted-foreground wwc:w-40">wwc:text-destructive</code>
					<span className="wwc:text-destructive">Destructive/error text</span>
				</div>
			</div>
		</div>
	);
}

const meta = {
	title: "Design Tokens/Font Family",
	tags: ["autodocs", "!manifest"],
	parameters: {
		docs: {
			description: {
				component: "Font families (Sans, Serif, Mono), type scale, font weights, and text color utilities.",
			},
		},
	},
	render: () => <FontFamilyStory />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
