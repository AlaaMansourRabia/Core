import {DataTable} from "@core/core-ui/data-table";

const columns = [
	{accessorKey: "name", header: "Name"},
	{accessorKey: "role", header: "Role"},
	{accessorKey: "site", header: "Site"},
];

export function WorkersTable({data}) {
	return <DataTable columns={columns} data={data} searchKey="name" />;
}
