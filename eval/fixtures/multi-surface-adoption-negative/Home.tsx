import {Card, DataTable} from "@wakecap/core-ui";

import {AppShell} from "./AppShell";

export const Home = () => (
	<AppShell>
		<main data-wakecore-region="work-items">
			<Card>
				<DataTable />
			</Card>
		</main>
	</AppShell>
);
