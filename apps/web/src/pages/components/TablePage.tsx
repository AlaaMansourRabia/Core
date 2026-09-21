import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

const invoices = [
	{invoice: "INV001", status: "Paid", method: "Credit Card", amount: "$250.00"},
	{invoice: "INV002", status: "Pending", method: "PayPal", amount: "$150.00"},
	{invoice: "INV003", status: "Unpaid", method: "Bank Transfer", amount: "$350.00"},
	{invoice: "INV004", status: "Paid", method: "Credit Card", amount: "$450.00"},
	{invoice: "INV005", status: "Paid", method: "PayPal", amount: "$550.00"},
];

export function TablePage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Table</h1>
					<CopyButton
						value="Table"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">A responsive table component for displaying tabular data.</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Table - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<TableCaption>A list of your recent invoices.</TableCaption>
						<TableHeader>
							<TableRow>
								<TableHead className="wwc:w-[100px]">Invoice</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Method</TableHead>
								<TableHead className="wwc:text-right">Amount</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{invoices.map((invoice) => (
								<TableRow key={invoice.invoice}>
									<TableCell className="wwc:font-medium">{invoice.invoice}</TableCell>
									<TableCell>{invoice.status}</TableCell>
									<TableCell>{invoice.method}</TableCell>
									<TableCell className="wwc:text-right">{invoice.amount}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Table - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Each sub-component extends its native{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<table>"}</code> HTML
						element attributes.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Prop</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Default</th>
									<th className="wwc:text-left wwc:py-3 wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{
										prop: "Table",
										type: "React.HTMLAttributes<HTMLTableElement>",
										def: "-",
										desc: "Root table wrapper with horizontal scroll container.",
									},
									{
										prop: "TableHeader",
										type: "React.HTMLAttributes<HTMLTableSectionElement>",
										def: "-",
										desc: "Table header section (<thead>).",
									},
									{
										prop: "TableBody",
										type: "React.HTMLAttributes<HTMLTableSectionElement>",
										def: "-",
										desc: "Table body section (<tbody>).",
									},
									{
										prop: "TableFooter",
										type: "React.HTMLAttributes<HTMLTableSectionElement>",
										def: "-",
										desc: "Table footer section (<tfoot>) with muted background.",
									},
									{
										prop: "TableRow",
										type: "React.HTMLAttributes<HTMLTableRowElement>",
										def: "-",
										desc: "Table row with hover and selected states.",
									},
									{
										prop: "TableHead",
										type: "React.ThHTMLAttributes<HTMLTableCellElement>",
										def: "-",
										desc: "Table header cell (<th>).",
									},
									{
										prop: "TableCell",
										type: "React.TdHTMLAttributes<HTMLTableCellElement>",
										def: "-",
										desc: "Table data cell (<td>).",
									},
									{
										prop: "TableCaption",
										type: "React.HTMLAttributes<HTMLTableCaptionElement>",
										def: "-",
										desc: "Table caption element.",
									},
								].map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-primary wwc:font-medium wwc:whitespace-nowrap">
											{row.prop}
										</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.type}</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.def}</td>
										<td className="wwc:py-3 wwc:text-muted-foreground">{row.desc}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Table - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

<Table>
  <TableCaption>Caption</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Header</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Cell</TableCell>
    </TableRow>
  </TableBody>
</Table>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
