import * as React from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {RecordDetailShell} from "@/components/ui/record-detail-shell";

const SECTIONS = [
	{
		items: [
			{id: "overview", label: "Overview"},
			{id: "properties", label: "Properties"},
			{id: "datasources", label: "Datasources"},
			{id: "metadata", label: "Metadata"},
			{id: "permissions", label: "Permissions"},
			{id: "canvas", label: "Canvas"},
		],
	},
];

function Filler({section}: {section: string}) {
	return (
		<>
			{Array.from({length: 6}, (_, i) => (
				<Card key={i}>
					<CardContent className="wwc:p-4">
						<h3 className="wwc:text-sm wwc:font-medium wwc:capitalize">
							{section} · block {i + 1}
						</h3>
						<p className="wwc:text-muted-foreground wwc:mt-1 wwc:text-xs">
							Scroll the column — the rail stays put and the page itself never scrolls.
						</p>
					</CardContent>
				</Card>
			))}
		</>
	);
}

function Example({flushCanvas = false}: {flushCanvas?: boolean}) {
	const [section, setSection] = React.useState(flushCanvas ? "canvas" : "overview");
	return (
		<div className="wwc:flex wwc:h-[420px] wwc:flex-col wwc:overflow-hidden wwc:rounded-lg wwc:border">
			<RecordDetailShell
				title="Object type"
				sections={SECTIONS}
				activeSectionId={section}
				onSectionChange={setSection}
				flush={flushCanvas && section === "canvas"}
			>
				{flushCanvas && section === "canvas" ? (
					<div className="wwc:bg-muted/20 wwc:text-muted-foreground wwc:m-6 wwc:flex wwc:min-h-0 wwc:flex-1 wwc:items-center wwc:justify-center wwc:rounded-lg wwc:border wwc:border-dashed wwc:text-sm">
						A canvas that fills the remaining height and scrolls nothing.
					</div>
				) : (
					<Filler section={section} />
				)}
			</RecordDetailShell>
		</div>
	);
}

export function RecordDetailShellPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">RecordDetailShell</h1>
					<CopyButton
						value="RecordDetailShell"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Left section rail beside a single scrolling content column, for a record whose detail genuinely warrants
					navigation.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Default</CardTitle>
					<CardDescription>Six sections, one at a time. Scroll the content — the rail does not move.</CardDescription>
				</CardHeader>
				<CardContent>
					<Example />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Flush section</CardTitle>
					<CardDescription>
						<code>flush</code> places the section as a direct flex child instead of inside the padded, scrolling well —
						for a section that owns the page height itself, such as a full-bleed graph canvas.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Example flushCanvas />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>When not to use it</CardTitle>
					<CardDescription>
						A record with three short sections stacks them full-width and needs no rail at all. A rail over two screens
						of content is chrome, not navigation.
					</CardDescription>
				</CardHeader>
			</Card>
		</div>
	);
}
