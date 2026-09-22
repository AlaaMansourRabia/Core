import { Button } from "@corensystem/core-ui/button";
import { Card } from "@corensystem/core-ui/card";
import { Badge } from "@corensystem/core-ui/badge";

export default function App() {
	return (
		<div className="app:min-h-screen app:bg-background app:flex app:items-center app:justify-center">
			<Card>
				<div className="app:p-8 app:space-y-4 app:text-center">
					<h1 className="app:text-2xl app:font-bold app:text-foreground">Hello TW4 with prefix</h1>
					<p className="app:text-sm app:text-muted-foreground">
						Consumer uses <code className="app:bg-muted app:px-1.5 app:py-0.5 app:rounded app:text-xs">app:</code> prefix.
						Components use <code className="app:bg-muted app:px-1.5 app:py-0.5 app:rounded app:text-xs">wwc:</code> internally.
					</p>
					<div className="app:flex app:gap-2 app:justify-center">
						<Button onClick={() => alert("Pong!")}>Ping Me</Button>
						<Button variant="secondary">Secondary</Button>
						<Button variant="outline">Outline</Button>
					</div>
					<div className="app:flex app:gap-2 app:justify-center">
						<Badge>Default</Badge>
						<Badge variant="secondary">Secondary</Badge>
						<Badge variant="destructive">Destructive</Badge>
						<Badge variant="outline">Outline</Badge>
					</div>
				</div>
			</Card>
		</div>
	);
}
