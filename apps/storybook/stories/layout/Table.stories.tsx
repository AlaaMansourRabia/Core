import type {Meta, StoryObj} from "storybook/internal/types";

import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@core/core-ui/table";

const meta = {
	title: "Components/Layout/Table",
	component: Table,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"A semantic HTML table with composable sub-components: Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption, and TableFooter.",
			},
		},
	},
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const invoices = [
	{invoice: "INV001", status: "Paid", method: "Credit Card", amount: "$250.00"},
	{invoice: "INV002", status: "Pending", method: "PayPal", amount: "$150.00"},
	{invoice: "INV003", status: "Unpaid", method: "Bank Transfer", amount: "$350.00"},
	{invoice: "INV004", status: "Paid", method: "Credit Card", amount: "$450.00"},
	{invoice: "INV005", status: "Paid", method: "PayPal", amount: "$550.00"},
];

export const Default: Story = {
	render: () => (
		<Table>
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
	),
};

export const WithCaption: Story = {
	render: () => (
		<Table>
			<TableCaption>A list of recent invoices.</TableCaption>
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
	),
};

export const WithFooter: Story = {
	render: () => (
		<Table>
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
			<TableFooter>
				<TableRow>
					<TableCell colSpan={3}>Total</TableCell>
					<TableCell className="wwc:text-right">$1,750.00</TableCell>
				</TableRow>
			</TableFooter>
		</Table>
	),
};

export const Minimal: Story = {
	render: () => (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Role</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableCell>Ahmed</TableCell>
					<TableCell>Engineer</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>Sara</TableCell>
					<TableCell>Designer</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	),
};

export const WithTruncation: Story = {
	render: () => (
		<div className="wwc:max-w-[600px]">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="wwc:w-[100px]">ID</TableHead>
						<TableHead>Name</TableHead>
						<TableHead>Description</TableHead>
						<TableHead className="wwc:text-right wwc:w-[100px]">Amount</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow>
						<TableCell className="wwc:font-medium">INV-001</TableCell>
						<TableCell>Mohammed Al-Qahtani Al-Rashidi</TableCell>
						<TableCell>
							Annual subscription renewal for enterprise plan with premium support and dedicated account manager
						</TableCell>
						<TableCell className="wwc:text-right">$2,500.00</TableCell>
					</TableRow>
					<TableRow>
						<TableCell className="wwc:font-medium">INV-002</TableCell>
						<TableCell>Khalid Ibrahim Hassan Al-Dosari</TableCell>
						<TableCell>
							One-time setup fee for custom integration with existing ERP system including data migration
						</TableCell>
						<TableCell className="wwc:text-right">$8,750.00</TableCell>
					</TableRow>
					<TableRow>
						<TableCell className="wwc:font-medium">INV-003</TableCell>
						<TableCell>Faisal Nasser</TableCell>
						<TableCell>Monthly sensor tag replenishment order</TableCell>
						<TableCell className="wwc:text-right">$450.00</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</div>
	),
};
