// A1 — illustrative fair-baseline (hand-authored, NOT model-captured).
// Package-only knowledge: a plain static Table — no sorting, no filter, no pagination.
// Core guidance (A4) would choose DataTable, which provides those built in.
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@corensystem/core-ui/table";

const workers = [
	{name: "Aisha Khan", role: "Foreman", site: "Tower A"},
	{name: "Diego Ramos", role: "Electrician", site: "Tower B"},
	{name: "Mei Lin", role: "Safety Officer", site: "Tower A"},
	{name: "Omar Farouk", role: "Crane Operator", site: "Yard"},
	{name: "Sara Novak", role: "Surveyor", site: "Tower C"},
];

export default function WorkerTable() {
	return (
		<div className="app:p-2">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Role</TableHead>
						<TableHead>Site</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{workers.map((w) => (
						<TableRow key={w.name}>
							<TableCell>{w.name}</TableCell>
							<TableCell>{w.role}</TableCell>
							<TableCell>{w.site}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<p className="app:mt-2 app:text-xs app:text-gray-500">Showing 5 of 500 — no sort, filter, or paging.</p>
		</div>
	);
}
