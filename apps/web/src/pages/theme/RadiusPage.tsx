import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

export function RadiusPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Border Radius</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Base radius: <code className="wwc:bg-muted wwc:px-2 wwc:py-0.5 wwc:rounded">--radius: 0.625rem (10px)</code>
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Radius Scale</CardTitle>
					<CardDescription>Derived from the base --radius CSS variable.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-wrap wwc:gap-6">
						{[
							{class: "wwc:rounded-none", label: "none", value: "0px"},
							{class: "wwc:rounded-sm", label: "sm", value: "6px"},
							{class: "wwc:rounded-md", label: "md", value: "8px"},
							{class: "wwc:rounded-lg", label: "lg", value: "10px"},
							{class: "wwc:rounded-xl", label: "xl", value: "14px"},
							{class: "wwc:rounded-2xl", label: "2xl", value: "16px"},
							{class: "wwc:rounded-full", label: "full", value: "9999px"},
						].map((item) => (
							<div key={item.class} className="wwc:text-center">
								<div className={`wwc:h-16 wwc:w-16 wwc:bg-primary wwc:mb-2 ${item.class}`} />
								<code className="wwc:text-xs wwc:text-muted-foreground wwc:block">{item.label}</code>
								<span className="wwc:text-xs wwc:text-muted-foreground">{item.value}</span>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Component Recommendations</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="wwc:space-y-4">
						{[
							{component: "Buttons", radius: "rounded-md", example: "8px"},
							{component: "Cards", radius: "rounded-lg", example: "10px"},
							{component: "Inputs", radius: "rounded-md", example: "8px"},
							{component: "Badges", radius: "rounded-md or wwc:rounded-full", example: "8px or pill"},
							{component: "Modals/Dialogs", radius: "rounded-lg", example: "10px"},
							{component: "Avatars", radius: "rounded-full", example: "circle"},
							{component: "Tooltips", radius: "rounded-md", example: "8px"},
						].map((item) => (
							<div key={item.component} className="wwc:flex wwc:items-center wwc:justify-between wwc:border-b wwc:pb-3">
								<span className="wwc:font-medium">{item.component}</span>
								<div className="wwc:flex wwc:items-center wwc:gap-4">
									<code className="wwc:text-sm wwc:text-muted-foreground wwc:bg-muted wwc:px-2 wwc:py-1 wwc:rounded">
										{item.radius}
									</code>
									<span className="wwc:text-xs wwc:text-muted-foreground wwc:w-16">{item.example}</span>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>CSS Variable Calculation</CardTitle>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`/* Base radius from tweakcn theme */
--radius: 0.625rem;  /* 10px */

/* Derived values in Tailwind config */
rounded-sm: calc(var(--radius) - 4px)  /* 6px */
rounded-md: calc(var(--radius) - 2px)  /* 8px */
rounded-lg: var(--radius)              /* 10px */
rounded-xl: calc(var(--radius) + 4px)  /* 14px */`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
