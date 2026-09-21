import {Card, ChartContainer} from "@core/core-ui";

import {AppShell} from "./AppShell";

export const Monitoring = () => (
	<AppShell>
		<main data-core-region="monitoring">
			<Card>
				<ChartContainer config={{throughput: {color: "#0f6fc6"}}} />
				<svg aria-label="Trend">
					<path stroke="#7c3aed" />
				</svg>
			</Card>
			<button onClick={() => window.location.reload()}>Refresh</button>
		</main>
	</AppShell>
);
