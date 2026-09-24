import {Card, DataTable} from "@corensystem/coren-ui";

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
