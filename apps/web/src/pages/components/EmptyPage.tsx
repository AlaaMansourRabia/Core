import {FileText, FolderOpen, Inbox, Search} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {Empty} from "@/components/ui/empty";

export function EmptyPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Empty</h1>
					<CopyButton
						value="Empty"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Empty state component to display when there is no data or content to show.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Empty - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Basic empty state with icon, title, and description.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:border wwc:rounded-lg wwc:p-8">
						<Empty
							icon={<Inbox className="wwc:h-12 wwc:w-12" />}
							title="No messages"
							description="You don't have any messages yet. Start a conversation!"
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Action</CardTitle>
						<CopyButton
							value="Empty - With Action"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Empty state with a call-to-action button.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:border wwc:rounded-lg wwc:p-8">
						<Empty
							icon={<FileText className="wwc:h-12 wwc:w-12" />}
							title="No documents"
							description="Get started by creating your first document."
							action={<Button>Create Document</Button>}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Search Results</CardTitle>
						<CopyButton
							value="Empty - Search Results"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:border wwc:rounded-lg wwc:p-8">
						<Empty
							icon={<Search className="wwc:h-12 wwc:w-12" />}
							title="No results found"
							description="Try adjusting your search terms or filters to find what you're looking for."
							action={<Button variant="outline">Clear Filters</Button>}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Multiple Actions</CardTitle>
						<CopyButton
							value="Empty - Multiple Actions"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:border wwc:rounded-lg wwc:p-8">
						<Empty
							icon={<FolderOpen className="wwc:h-12 wwc:w-12" />}
							title="This folder is empty"
							description="Upload files or create subfolders to organize your content."
							action={
								<div className="wwc:flex wwc:gap-2">
									<Button>Upload Files</Button>
									<Button variant="outline">New Folder</Button>
								</div>
							}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Empty - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Extends native{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<div>"}</code> HTML
						attributes.
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
										prop: "icon",
										type: "ReactNode",
										def: "—",
										desc: "Icon element displayed at the top of the empty state.",
									},
									{prop: "title", type: "string", def: "—", desc: "Heading text for the empty state."},
									{prop: "description", type: "string", def: "—", desc: "Descriptive text below the title."},
									{
										prop: "action",
										type: "ReactNode",
										def: "—",
										desc: "Action element (e.g. a Button) rendered below the description.",
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
							value="Empty - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { Empty } from "@/components/ui/empty"
import { Inbox } from "lucide-react"

// Basic empty state
<Empty
  icon={<Inbox className="wwc:h-12 wwc:w-12" />}
  title="No messages"
  description="You don't have any messages yet."
/>

// With action button
<Empty
  icon={<FileText className="wwc:h-12 wwc:w-12" />}
  title="No documents"
  description="Get started by creating your first document."
  action={<Button>Create Document</Button>}
/>

// With multiple actions
<Empty
  icon={<FolderOpen className="wwc:h-12 wwc:w-12" />}
  title="This folder is empty"
  description="Upload files or create subfolders."
  action={
    <div className="wwc:flex wwc:gap-2">
      <Button>Upload Files</Button>
      <Button variant="outline">New Folder</Button>
    </div>
  }
/>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
