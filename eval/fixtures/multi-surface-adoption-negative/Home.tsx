import {Card, DataTable} from "@core/core-ui";

import {AppShell} from "./AppShell";

export const Home = () => (
	<AppShell>
		<main data-core-region="work-items">
			<Card>
				<DataTable />
			</Card>
		</main>
	</AppShell>
);
