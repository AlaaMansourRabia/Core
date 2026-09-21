import type {ColumnDef, PaginationState, SortingState} from "@tanstack/react-table";

import * as React from "react";
import {expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {DataTable} from "./data-table";

type User = {id: string; name: string};

const columns: ColumnDef<User, unknown>[] = [
	{accessorKey: "id", header: "ID"},
	{accessorKey: "name", header: "Name"},
];

const pageOf = (start: number, count: number): User[] =>
	Array.from({length: count}, (_, i) => ({id: `u${start + i}`, name: `User ${start + i}`}));

test("DataTable stays client-side when no manual props are passed", async () => {
	await render(<DataTable columns={columns} data={pageOf(1, 25)} pageSize={10} />);
	// 25 rows, 10 per page — the client row model still does the paging.
	await expect.element(page.getByText("25 records")).toBeVisible();
	await expect.element(page.getByText("Page 1 of 3")).toBeVisible();
});

test("DataTable derives page count from rowCount in manual pagination", async () => {
	await render(
		<DataTable
			columns={columns}
			data={pageOf(1, 10)}
			manualPagination
			rowCount={4489}
			pageSize={10}
			getRowId={(row) => row.id}
		/>,
	);
	// Total comes from the server, not from the 10 rows held in memory.
	await expect.element(page.getByText("4,489 records")).toBeVisible();
	await expect.element(page.getByText("Page 1 of 449")).toBeVisible();
});

test("DataTable does not re-page server data", async () => {
	// 25 rows delivered as one server page must all render, despite pageSize 10.
	await render(<DataTable columns={columns} data={pageOf(1, 25)} manualPagination rowCount={4489} pageSize={10} />);
	await expect.element(page.getByText("User 25")).toBeVisible();
});

test("DataTable reports pagination changes to the caller", async () => {
	const seen: PaginationState[] = [];
	function Harness() {
		const [pagination, setPagination] = React.useState<PaginationState>({pageIndex: 0, pageSize: 10});
		return (
			<DataTable
				columns={columns}
				data={pageOf(1, 10)}
				manualPagination
				rowCount={100}
				pagination={pagination}
				onPaginationChange={(next) => {
					seen.push(next);
					setPagination(next);
				}}
			/>
		);
	}
	await render(<Harness />);
	await page.getByRole("button", {name: "Next"}).click();

	await expect.element(page.getByText("Page 2 of 10")).toBeVisible();
	expect(seen.at(-1)?.pageIndex).toBe(1);
});

test("DataTable routes sort toggles out when manualSorting is set", async () => {
	const seen: SortingState[] = [];
	function Harness() {
		const [sorting, setSorting] = React.useState<SortingState>([]);
		return (
			<DataTable
				columns={[
					{accessorKey: "name", header: ({column}) => <button onClick={() => column.toggleSorting()}>Name</button>},
				]}
				data={pageOf(1, 5)}
				manualSorting
				sorting={sorting}
				onSortingChange={(next) => {
					seen.push(next);
					setSorting(next);
				}}
			/>
		);
	}
	await render(<Harness />);
	await page.getByRole("button", {name: "Name"}).click();

	expect(seen.at(-1)).toEqual([{id: "name", desc: false}]);
});

test("DataTable renders a controlled server search box", async () => {
	const seen: string[] = [];
	await render(
		<DataTable
			columns={columns}
			data={pageOf(1, 3)}
			search=""
			onSearchChange={(next) => seen.push(next)}
			searchPlaceholder="Search users..."
		/>,
	);
	await page.getByPlaceholder("Search users...").fill("neom");
	expect(seen.at(-1)).toBe("neom");
});

test("DataTable renders skeleton rows while loading", async () => {
	const screen = await render(<DataTable columns={columns} data={[]} isLoading pageSize={5} />);
	// Skeletons stand in for rows, and the empty state must not flash.
	await expect.element(page.getByText("No results.")).not.toBeInTheDocument();
	expect(screen.container.querySelectorAll("tbody tr").length).toBe(5);
});

test("DataTable shows a custom empty message", async () => {
	await render(<DataTable columns={columns} data={[]} emptyMessage="No users match this filter." />);
	await expect.element(page.getByText("No users match this filter.")).toBeVisible();
});

test("DataTable gives bulk actions stable ids via getRowId", async () => {
	let received: string[] = [];
	await render(
		<DataTable
			columns={columns}
			data={pageOf(41, 2)}
			getRowId={(row) => row.id}
			bulkActions={[{label: "Delete", onClick: (ids) => (received = ids)}]}
		/>,
	);
	// Without getRowId these would be positional indices ("0", "1") and collide across server pages.
	expect(received).toEqual([]);
	await expect.element(page.getByText("User 41")).toBeVisible();
});
