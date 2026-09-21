import {
	BarChart3,
	Calendar,
	Database,
	FileSpreadsheet,
	FileText,
	Globe,
	Image as ImageIcon,
	PenLine,
	Presentation,
	Search,
	Sparkles,
	Table,
} from "lucide-react";
import {useState} from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {
	PromptInput,
	type PromptAttachment,
	type PromptContextItem,
	type PromptModel,
	type PromptTool,
} from "@/components/ui/prompt-input";

const demoModels: PromptModel[] = [
	{
		id: "fast",
		label: "WakeCap Fast",
		icon: <Sparkles className="wwc:h-4 wwc:w-4 wwc:text-primary" />,
		description: "Quick answers for everyday tasks",
	},
	{
		id: "balanced",
		label: "WakeCap Balanced",
		icon: <Sparkles className="wwc:h-4 wwc:w-4 wwc:text-primary" />,
		description: "Best for most work",
	},
	{
		id: "thinking",
		label: "WakeCap Thinking",
		icon: <Sparkles className="wwc:h-4 wwc:w-4 wwc:text-primary" />,
		description: "Deeper multi-step reasoning",
	},
];

const demoTools: PromptTool[] = [
	{id: "canvas", label: "Canvas", icon: <PenLine className="wwc:h-4 wwc:w-4" />},
	{id: "web", label: "Web search", icon: <Globe className="wwc:h-4 wwc:w-4" />},
	{id: "image", label: "Generate image", icon: <ImageIcon className="wwc:h-4 wwc:w-4" />},
];

const createActions = [
	{id: "doc", label: "Create document", icon: <FileText className="wwc:h-4 wwc:w-4" />, onSelect: () => {}},
	{id: "deck", label: "Create presentation", icon: <Presentation className="wwc:h-4 wwc:w-4" />, onSelect: () => {}},
	{id: "sheet", label: "Create spreadsheet", icon: <Table className="wwc:h-4 wwc:w-4" />, onSelect: () => {}},
];

const landingSuggestions = [
	{id: "kb", label: "Company knowledge", icon: <Database className="wwc:h-3.5 wwc:w-3.5" />},
	{id: "doc", label: "Create document", icon: <FileText className="wwc:h-3.5 wwc:w-3.5" />},
	{id: "deck", label: "Create presentation", icon: <Presentation className="wwc:h-3.5 wwc:w-3.5" />},
	{id: "sheet", label: "Create spreadsheet", icon: <Table className="wwc:h-3.5 wwc:w-3.5" />},
	{id: "img", label: "Generate image", icon: <ImageIcon className="wwc:h-3.5 wwc:w-3.5" />},
	{id: "research", label: "Deep research", icon: <Search className="wwc:h-3.5 wwc:w-3.5" />},
	{id: "viz", label: "Visualize data", icon: <BarChart3 className="wwc:h-3.5 wwc:w-3.5" />},
];

const projectContext: PromptContextItem[] = [
	{
		id: "ctx-progress-report",
		label: "Weekly progress report",
		description: "Last updated 2 days ago",
		icon: <FileText className="wwc:h-3.5 wwc:w-3.5" />,
	},
	{
		id: "ctx-schedule",
		label: "Project schedule",
		description: "Gantt — 124 tasks",
		icon: <Calendar className="wwc:h-3.5 wwc:w-3.5" />,
	},
	{
		id: "ctx-cost-budget",
		label: "Cost budget Q3",
		description: "Excel spreadsheet",
		icon: <FileSpreadsheet className="wwc:h-3.5 wwc:w-3.5" />,
	},
	{
		id: "ctx-quality",
		label: "Quality issues log",
		description: "23 open issues",
		icon: <FileText className="wwc:h-3.5 wwc:w-3.5" />,
	},
	{
		id: "ctx-workforce",
		label: "Workforce roster",
		description: "412 active workers",
		icon: <FileText className="wwc:h-3.5 wwc:w-3.5" />,
	},
];

export function PromptInputPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Prompt Input</h1>
					<CopyButton
						value="Prompt Input"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:text-muted-foreground">
					A flexible prompt input for AI conversations. Composes an auto-resizing textarea, removable attachment chips,
					an "Add context" popover with searchable existing items, an "Upload file" button, and a Send button. Used by{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:py-0.5 wwc:text-xs">AIChat</code> and standalone.
				</p>
			</div>

			{/* Landing / empty-state hero — the composer standing alone, no results frame. */}
			<div className="wwc:rounded-2xl wwc:border wwc:bg-muted/30 wwc:px-6 wwc:py-14">
				<LandingVariant />
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Composer — everything</CardTitle>
						<CopyButton
							value="Prompt Input - Composer"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						The full composer: a <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">+</code> menu (Upload
						file + Create actions), a Tools menu whose selections become removable pills, a model picker, a mic, a
						suggestions row, and file-card attachments after upload.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ComposerVariant />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Model picker</CardTitle>
						<CopyButton
							value="Prompt Input - Model picker"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Right-aligned model selector (descriptions + selected check) alongside a mic button.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ModelPickerVariant />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Tools &amp; active pills</CardTitle>
						<CopyButton
							value="Prompt Input - Tools"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Multi-select Tools menu. Active tools show as primary-tinted pills — click a pill's X to remove.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ToolsVariant />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default — full toolbar</CardTitle>
						<CopyButton
							value="Prompt Input - Default — full toolbar"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Add context (popover with searchable list), Upload file (file picker), and Send. Try clicking each.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<DefaultVariant />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With attachments</CardTitle>
						<CopyButton
							value="Prompt Input - With attachments"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Pre-populated attachment chips above the textarea. Click the X on a chip to remove it.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<WithAttachmentsVariant />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Context-only</CardTitle>
						<CopyButton
							value="Prompt Input - Context-only"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>"Add context" but no upload — useful when uploads aren't applicable.</CardDescription>
				</CardHeader>
				<CardContent>
					<ContextOnlyVariant />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Upload-only</CardTitle>
						<CopyButton
							value="Prompt Input - Upload-only"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>File upload without context picker.</CardDescription>
				</CardHeader>
				<CardContent>
					<UploadOnlyVariant />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Minimal</CardTitle>
						<CopyButton
							value="Prompt Input - Minimal"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						No toolbar buttons — just textarea and send. The Send button moves into a compact row.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<MinimalVariant />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Disabled</CardTitle>
						<CopyButton
							value="Prompt Input - Disabled"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>While the assistant is generating a response.</CardDescription>
				</CardHeader>
				<CardContent>
					<DisabledVariant />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API</CardTitle>
						<CopyButton
							value="Prompt Input - API"
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
									<th className="wwc:py-3 wwc:text-left wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{p: "value / onChange", t: "string / (v: string) => void", d: "Controlled value of the textarea."},
									{p: "onSend", t: "(value: string) => void", d: "Called on Enter (no shift) or Send button click."},
									{p: "attachments", t: "PromptAttachment[]", d: "Removable chips above the textarea."},
									{p: "onRemoveAttachment", t: "(id: string) => void", d: "Called when a chip's X is clicked."},
									{
										p: "availableContext",
										t: "PromptContextItem[]",
										d: "Items shown in the Add context popover. Omit to hide.",
									},
									{
										p: "onAddContext",
										t: "(item: PromptContextItem) => void",
										d: "Called when a context item is picked.",
									},
									{p: "onUploadFile", t: "(files: FileList) => void", d: "Enables Upload file button. Omit to hide."},
									{p: "acceptFileTypes", t: "string", d: 'Accept attribute on file input (e.g. ".pdf,.png").'},
									{
										p: "trailingActions",
										t: "ReactNode",
										d: "Extra slots between Add context/Upload and Send (e.g. model selector).",
									},
									{
										p: "minHeight / maxHeight",
										t: "number",
										d: "Textarea min/max heights in pixels (default 88 ≈ 3 lines / 198).",
									},
								].map((row) => (
									<tr key={row.p} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:font-medium wwc:text-primary wwc:whitespace-nowrap">
											{row.p}
										</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground wwc:whitespace-nowrap">
											{row.t}
										</td>
										<td className="wwc:py-3 wwc:text-muted-foreground">{row.d}</td>
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

function DefaultVariant() {
	const [value, setValue] = useState("");
	const [attachments, setAttachments] = useState<PromptAttachment[]>([]);

	return (
		<PromptInput
			value={value}
			onChange={setValue}
			onSend={(v) => {
				console.log("send", v, attachments);
				setValue("");
				setAttachments([]);
			}}
			placeholder="Ask anything about your project..."
			attachments={attachments}
			onRemoveAttachment={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
			availableContext={projectContext}
			onAddContext={(item) =>
				setAttachments((prev) =>
					prev.some((a) => a.id === item.id)
						? prev
						: [...prev, {id: item.id, label: item.label, type: "context", icon: item.icon}],
				)
			}
			onUploadFile={(files) => {
				const newAttachments = Array.from(files).map((file) => ({
					id: `file-${Date.now()}-${file.name}`,
					label: file.name,
					type: "file" as const,
				}));
				setAttachments((prev) => [...prev, ...newAttachments]);
			}}
		/>
	);
}

function WithAttachmentsVariant() {
	const [value, setValue] = useState("Summarize what changed in these files.");
	const [attachments, setAttachments] = useState<PromptAttachment[]>([
		{id: "a1", label: "Weekly progress report.pdf", type: "file"},
		{id: "a2", label: "Project schedule", type: "context"},
		{id: "a3", label: "Cost budget Q3.xlsx", type: "file"},
	]);

	return (
		<PromptInput
			value={value}
			onChange={setValue}
			onSend={(v) => console.log("send", v, attachments)}
			placeholder="Ask anything..."
			attachments={attachments}
			onRemoveAttachment={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
			availableContext={projectContext}
			onAddContext={(item) =>
				setAttachments((prev) =>
					prev.some((a) => a.id === item.id)
						? prev
						: [...prev, {id: item.id, label: item.label, type: "context", icon: item.icon}],
				)
			}
			onUploadFile={(files) => {
				const newAttachments = Array.from(files).map((file) => ({
					id: `file-${Date.now()}-${file.name}`,
					label: file.name,
					type: "file" as const,
				}));
				setAttachments((prev) => [...prev, ...newAttachments]);
			}}
		/>
	);
}

function ContextOnlyVariant() {
	const [value, setValue] = useState("");
	const [attachments, setAttachments] = useState<PromptAttachment[]>([]);

	return (
		<PromptInput
			value={value}
			onChange={setValue}
			onSend={(v) => {
				console.log("send", v, attachments);
				setValue("");
				setAttachments([]);
			}}
			attachments={attachments}
			onRemoveAttachment={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
			availableContext={projectContext}
			onAddContext={(item) =>
				setAttachments((prev) =>
					prev.some((a) => a.id === item.id)
						? prev
						: [...prev, {id: item.id, label: item.label, type: "context", icon: item.icon}],
				)
			}
		/>
	);
}

function UploadOnlyVariant() {
	const [value, setValue] = useState("");
	const [attachments, setAttachments] = useState<PromptAttachment[]>([]);

	return (
		<PromptInput
			value={value}
			onChange={setValue}
			onSend={(v) => {
				console.log("send", v, attachments);
				setValue("");
				setAttachments([]);
			}}
			attachments={attachments}
			onRemoveAttachment={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
			onUploadFile={(files) => {
				const newAttachments = Array.from(files).map((file) => ({
					id: `file-${Date.now()}-${file.name}`,
					label: file.name,
					type: "file" as const,
				}));
				setAttachments((prev) => [...prev, ...newAttachments]);
			}}
		/>
	);
}

function MinimalVariant() {
	const [value, setValue] = useState("");
	return <PromptInput value={value} onChange={setValue} onSend={(v) => console.log("send", v)} />;
}

function DisabledVariant() {
	return (
		<PromptInput
			value="Generating response..."
			onChange={() => {}}
			onSend={() => {}}
			disabled
			availableContext={projectContext}
			onAddContext={() => {}}
			onUploadFile={() => {}}
			sendLabel={<Sparkles />}
		/>
	);
}

function ComposerVariant() {
	const [value, setValue] = useState("");
	const [attachments, setAttachments] = useState<PromptAttachment[]>([]);
	const [model, setModel] = useState("balanced");
	const [activeTools, setActiveTools] = useState<string[]>(["canvas"]);

	return (
		<PromptInput
			value={value}
			onChange={setValue}
			onSend={(v) => {
				console.log("send", {value: v, attachments, model, activeTools});
				setValue("");
			}}
			placeholder="Ask anything, @ for context and skills"
			attachments={attachments}
			onRemoveAttachment={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
			onUploadFile={(files) =>
				setAttachments((prev) => [
					...prev,
					...Array.from(files).map((file) => ({
						id: `file-${Date.now()}-${file.name}`,
						label: file.name,
						type: "file" as const,
						subtitle: "Document",
						icon: <FileText className="wwc:h-4 wwc:w-4 wwc:text-red-500" />,
					})),
				])
			}
			addActions={createActions}
			tools={demoTools}
			activeToolIds={activeTools}
			onToolToggle={(id) =>
				setActiveTools((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
			}
			models={demoModels}
			modelId={model}
			onModelChange={setModel}
			onMic={() => console.log("mic")}
			suggestions={[
				{id: "s1", label: "Summarize progress", icon: <FileText className="wwc:h-3.5 wwc:w-3.5" />},
				{id: "s2", label: "Draft an RFI"},
				{id: "s3", label: "Create weekly report"},
			]}
		/>
	);
}

function ModelPickerVariant() {
	const [value, setValue] = useState("Draft a safety toolbox talk for tomorrow.");
	const [model, setModel] = useState("thinking");
	return (
		<PromptInput
			value={value}
			onChange={setValue}
			onSend={(v) => console.log("send", v, model)}
			models={demoModels}
			modelId={model}
			onModelChange={setModel}
			onMic={() => {}}
		/>
	);
}

function ToolsVariant() {
	const [value, setValue] = useState("");
	const [activeTools, setActiveTools] = useState<string[]>(["canvas", "web"]);
	return (
		<PromptInput
			value={value}
			onChange={setValue}
			onSend={(v) => console.log("send", v, activeTools)}
			placeholder="Ask anything, @ for context and skills"
			tools={demoTools}
			activeToolIds={activeTools}
			onToolToggle={(id) =>
				setActiveTools((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
			}
		/>
	);
}

function LandingVariant() {
	const [value, setValue] = useState("");
	const [model, setModel] = useState("balanced");
	const [activeTools, setActiveTools] = useState<string[]>([]);
	return (
		<div className="wwc:mx-auto wwc:flex wwc:w-full wwc:max-w-3xl wwc:flex-col wwc:items-center wwc:gap-6">
			<span className="wwc:inline-flex wwc:items-center wwc:gap-2 wwc:rounded-full wwc:border wwc:bg-background wwc:px-3 wwc:py-1 wwc:text-sm wwc:font-medium">
				<Sparkles className="wwc:h-4 wwc:w-4 wwc:text-primary" /> WakeCap
			</span>
			<h2 className="wwc:text-center wwc:text-2xl wwc:font-semibold wwc:sm:text-3xl">What can I help with?</h2>
			<div className="wwc:w-full">
				<PromptInput
					value={value}
					onChange={setValue}
					onSend={(v) => {
						console.log("send", v);
						setValue("");
					}}
					placeholder="Ask anything, @ for context and skills"
					onUploadFile={() => {}}
					addActions={createActions}
					tools={demoTools}
					activeToolIds={activeTools}
					onToolToggle={(id) =>
						setActiveTools((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
					}
					models={demoModels}
					modelId={model}
					onModelChange={setModel}
					onMic={() => {}}
					suggestions={landingSuggestions}
				/>
			</div>
		</div>
	);
}
