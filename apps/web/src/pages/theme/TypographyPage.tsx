import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

export function TypographyPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Font Family</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">Font families and text styles for the design system.</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Font Families</CardTitle>
					<CardDescription>Three font families for different use cases</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:space-y-8">
						{/* Sans - Figtree */}
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
							<pre className="wwc:bg-muted wwc:p-3 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
								{"font-family: Figtree, ui-sans-serif, sans-serif, system-ui;"}
							</pre>
						</div>

						{/* Serif - Lora */}
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
							<pre className="wwc:bg-muted wwc:p-3 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
								{"font-family: Lora, ui-serif, serif;"}
							</pre>
						</div>

						{/* Mono - IBM Plex Mono */}
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
							<pre className="wwc:bg-muted wwc:p-3 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
								{`font-family: 'IBM Plex Mono', ui-monospace, monospace;`}
							</pre>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Type Scale</CardTitle>
					<CardDescription>Standard Tailwind text sizes</CardDescription>
				</CardHeader>
				<CardContent>
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
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Font Weights</CardTitle>
					<CardDescription>Figtree supports variable weights from 300 to 900</CardDescription>
				</CardHeader>
				<CardContent>
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
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Text Colors</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="wwc:space-y-4">
						<div className="wwc:flex wwc:items-center wwc:gap-4">
							<code className="wwc:text-xs wwc:text-muted-foreground wwc:w-40">text-foreground</code>
							<span className="wwc:text-foreground">Primary text</span>
						</div>
						<div className="wwc:flex wwc:items-center wwc:gap-4">
							<code className="wwc:text-xs wwc:text-muted-foreground wwc:w-40">text-muted-foreground</code>
							<span className="wwc:text-muted-foreground">Secondary/muted text</span>
						</div>
						<div className="wwc:flex wwc:items-center wwc:gap-4">
							<code className="wwc:text-xs wwc:text-muted-foreground wwc:w-40">text-primary</code>
							<span className="wwc:text-primary">Primary color text</span>
						</div>
						<div className="wwc:flex wwc:items-center wwc:gap-4">
							<code className="wwc:text-xs wwc:text-muted-foreground wwc:w-40">text-destructive</code>
							<span className="wwc:text-destructive">Destructive/error text</span>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Usage</CardTitle>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`{/* Sans (default) */}
<p className="wwc:font-sans">Body text with Figtree</p>

{/* Serif */}
<p className="wwc:font-serif">Editorial content with Lora</p>

{/* Monospace */}
<code className="wwc:font-mono">Code snippets with IBM Plex Mono</code>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
