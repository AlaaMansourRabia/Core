// Fill-time renderer for grid answers: `matrix` (one uniform cell type) and `gas_test_table`
// (per-column cell types). Renders a real <Table>: a header of column labels, then one row per
// `rows[]` with its label and a cell per column. Value is nested `{ [rowId]: { [colId]: cellValue } }`
// written immutably on each edit. Standalone + frozen prop contract so the RJSF widget can wrap it.
import {Input} from "../../input";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../../table";
import {ToggleGroup, ToggleGroupItem} from "../../toggle-group";
import type {CellType, TableColumn, TableRow as TableRowModel} from "./model";
import {RatingInput} from "./RatingInput";

export interface TableInputProps {
	rows: TableRowModel[];
	columns: TableColumn[];
	/** Uniform cell type for `matrix`; ignored when a column carries its own `type` (gas_test_table). */
	cellType?: CellType;
	/** Nested by row then column: `{ [rowId]: { [colId]: cellValue } }`. */
	value?: Record<string, Record<string, unknown>>;
	onChange: (value: Record<string, Record<string, unknown>>) => void;
	disabled?: boolean;
}

export function TableInput({rows, columns, cellType, value, onChange, disabled}: TableInputProps) {
	function setCell(rowId: string, colId: string, cellValue: unknown) {
		const current = value ?? {};
		onChange({
			...current,
			[rowId]: {...(current[rowId] ?? {}), [colId]: cellValue},
		});
	}

	function renderCell(rowId: string, column: TableColumn) {
		const type: CellType = column.type ?? cellType ?? "text";
		const cellValue = value?.[rowId]?.[column.id];
		const cellId = `${rowId}-${column.id}`;

		switch (type) {
			case "yes_no":
				return (
					<ToggleGroup
						type="single"
						size="sm"
						variant="outline"
						disabled={disabled}
						value={typeof cellValue === "string" ? cellValue : ""}
						onValueChange={(next) => {
							// Radix emits "" when the active item is pressed again — keep that as a clear.
							setCell(rowId, column.id, next);
						}}
						className="wwc:justify-start"
					>
						<ToggleGroupItem value="yes" aria-label="Yes">
							Yes
						</ToggleGroupItem>
						<ToggleGroupItem value="no" aria-label="No">
							No
						</ToggleGroupItem>
					</ToggleGroup>
				);
			case "number":
				return (
					<Input
						id={cellId}
						type="number"
						disabled={disabled}
						value={typeof cellValue === "number" || typeof cellValue === "string" ? String(cellValue) : ""}
						onChange={(e) => setCell(rowId, column.id, e.target.value === "" ? "" : Number(e.target.value))}
					/>
				);
			case "rating":
				return (
					<RatingInput
						id={cellId}
						disabled={disabled}
						value={typeof cellValue === "number" ? cellValue : undefined}
						onChange={(n) => setCell(rowId, column.id, n)}
					/>
				);
			case "text":
			default:
				return (
					<Input
						id={cellId}
						type="text"
						disabled={disabled}
						value={typeof cellValue === "string" ? cellValue : ""}
						onChange={(e) => setCell(rowId, column.id, e.target.value)}
					/>
				);
		}
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead />
					{columns.map((col) => (
						<TableHead key={col.id}>{col.label}</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{rows.map((row) => (
					<TableRow key={row.id}>
						<TableCell className="wwc:font-medium wwc:text-foreground">{row.label}</TableCell>
						{columns.map((col) => (
							<TableCell key={col.id}>{renderCell(row.id, col)}</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
