import {useState} from "react";

import {CanvasFilePicker, type CanvasFile} from "@/components/ui/canvas-file-picker";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";

const drawingFiles: CanvasFile[] = [
	{id: "ground", name: "Retail_1__Ground_Floor.svg"},
	{id: "mezzanine", name: "Retail_1__Mezzanine.svg"},
	{id: "roof", name: "Retail_1__Roof_Plan.svg"},
	{id: "tower-l1", name: "Office_Tower__Level_1_Plan.svg"},
	{id: "tower-l2", name: "Office_Tower__Level_2_Plan_Revised.svg", disabled: true},
];

export function CanvasFilePickerPage() {
	const [activeFileId, setActiveFileId] = useState("ground");
	const [searchableFileId, setSearchableFileId] = useState("ground");

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Canvas File Picker</h1>
					<CopyButton
						value="Canvas File Picker"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Compact picker for switching the active drawing/file on a canvas. Long file names are middle-truncated
					(keeping a configurable trailing extension) so the trigger stays a fixed width. Defaults to a{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">Select</code>; flip{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">searchable</code> to render a Combobox.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default — Select</CardTitle>
						<CopyButton
							value="Canvas File Picker - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Standard dropdown. Long names like{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">Office_Tower__Level_1_Plan.svg</code> are
						middle-truncated to fit the trigger. The last entry is disabled.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-col wwc:gap-4">
						<CanvasFilePicker files={drawingFiles} activeFileId={activeFileId} onFileChange={setActiveFileId} />
						<div className="wwc:rounded-md wwc:border wwc:bg-muted/30 wwc:p-3 wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
							activeFileId: {activeFileId}
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Searchable (Combobox)</CardTitle>
						<CopyButton
							value="Canvas File Picker - Searchable"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Set <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">searchable</code> to filter the list by
						typing — useful when a project has many drawings.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-col wwc:gap-4">
						<CanvasFilePicker
							files={drawingFiles}
							activeFileId={searchableFileId}
							onFileChange={setSearchableFileId}
							searchable
							searchPlaceholder="Search drawings…"
							triggerWidth={220}
						/>
						<div className="wwc:rounded-md wwc:border wwc:bg-muted/30 wwc:p-3 wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
							activeFileId: {searchableFileId}
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Canvas File Picker - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Prop</th>
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Default</th>
									<th className="wwc:py-3 wwc:text-left wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{
										prop: "files",
										type: "CanvasFile[]",
										def: "—",
										desc: "Array of {id, name, disabled?} entries shown in the picker.",
									},
									{prop: "activeFileId", type: "string", def: "—", desc: "Currently selected file id."},
									{prop: "onFileChange", type: "(id) => void", def: "—", desc: "Fires when a file is selected."},
									{
										prop: "searchable",
										type: "boolean",
										def: "false",
										desc: "Render a searchable Combobox instead of a Select.",
									},
									{
										prop: "searchPlaceholder",
										type: "string",
										def: "—",
										desc: "Placeholder shown in the Combobox search input.",
									},
									{prop: "triggerWidth", type: "number", def: "180", desc: "Fixed width (px) of the trigger."},
									{
										prop: "tailChars",
										type: "number",
										def: "7",
										desc: "Trailing chars kept when middle-truncating long names.",
									},
									{
										prop: "emptyLabel",
										type: "string",
										def: "—",
										desc: "Label shown when there are no files / no matches.",
									},
								].map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:font-medium wwc:text-primary wwc:whitespace-nowrap">
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
		</div>
	);
}
