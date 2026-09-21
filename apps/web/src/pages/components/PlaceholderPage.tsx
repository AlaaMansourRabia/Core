import {useParams} from "react-router-dom";

import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";

export function PlaceholderPage() {
	const {component} = useParams();
	const componentName =
		component
			?.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ") || "Component";

	return (
		<div className="wwc:space-y-8">
			<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">{componentName}</h1>
					<CopyButton
						value="{componentName}"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<Badge variant="secondary">Coming Soon</Badge>
			</div>
			<p className="wwc:text-muted-foreground">This component will be added to the library soon.</p>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Installation</CardTitle>
						<CopyButton
							value="{componentName} - Installation"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Install the component using the shadcn CLI.</CardDescription>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">{`npx shadcn@latest add ${component}`}</pre>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>About This Component</CardTitle>
						<CopyButton
							value="{componentName} - About This Component"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<p className="wwc:text-muted-foreground">
						This component is part of shadcn/ui and will be styled with your tweakcn theme automatically once added. Use
						the shadcn CLI to install it, and it will inherit all your theme variables.
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="{componentName} - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { ${componentName.replace(/ /g, "")} } from "@/components/ui/${component}"

// Usage examples will be added once the component is implemented
<${componentName.replace(/ /g, "")} />
`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
