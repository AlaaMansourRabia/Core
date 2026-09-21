import type {Meta, StoryObj} from "storybook/internal/types";

import {
	PromptInput,
	type PromptAttachment,
	type PromptContextItem,
	type PromptModel,
	type PromptTool,
} from "@core/core-ui/prompt-input";
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

const landingSuggestions = [
	{id: "kb", label: "Company knowledge", icon: <Database className="wwc:h-3.5 wwc:w-3.5" />},
	{id: "doc", label: "Create document", icon: <FileText className="wwc:h-3.5 wwc:w-3.5" />},
	{id: "deck", label: "Create presentation", icon: <Presentation className="wwc:h-3.5 wwc:w-3.5" />},
	{id: "sheet", label: "Create spreadsheet", icon: <Table className="wwc:h-3.5 wwc:w-3.5" />},
	{id: "img", label: "Generate image", icon: <ImageIcon className="wwc:h-3.5 wwc:w-3.5" />},
	{id: "research", label: "Deep research", icon: <Search className="wwc:h-3.5 wwc:w-3.5" />},
	{id: "viz", label: "Visualize data", icon: <BarChart3 className="wwc:h-3.5 wwc:w-3.5" />},
];

const demoModels: PromptModel[] = [
	{
		id: "fast",
		label: "Core Fast",
		icon: <Sparkles className="wwc:h-4 wwc:w-4 wwc:text-primary" />,
		description: "Quick answers for everyday tasks",
	},
	{
		id: "balanced",
		label: "Core Balanced",
		icon: <Sparkles className="wwc:h-4 wwc:w-4 wwc:text-primary" />,
		description: "Best for most work",
	},
	{
		id: "thinking",
		label: "Core Thinking",
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

const meta = {
	title: "Components/Primitives/Prompt Input",
	component: PromptInput,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"A flexible AI prompt input. Composes an auto-resizing textarea, removable attachment chips, an Add context popover with a searchable list, an Upload file button, and a Send button. Used by `AIChat` and as a standalone input.",
			},
		},
	},
} satisfies Meta<typeof PromptInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Landing: Story = {
	render: () => {
		function Demo() {
			const [value, setValue] = useState("");
			const [model, setModel] = useState("balanced");
			const [activeTools, setActiveTools] = useState<string[]>([]);
			return (
				<div className="wwc:mx-auto wwc:flex wwc:w-full wwc:max-w-3xl wwc:flex-col wwc:items-center wwc:gap-6 wwc:py-16">
					<span className="wwc:inline-flex wwc:items-center wwc:gap-2 wwc:rounded-full wwc:border wwc:bg-background wwc:px-3 wwc:py-1 wwc:text-sm wwc:font-medium">
						<Sparkles className="wwc:h-4 wwc:w-4 wwc:text-primary" /> Core
					</span>
					<h1 className="wwc:text-center wwc:text-2xl wwc:font-semibold wwc:sm:text-3xl">What can I help with?</h1>
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
		return <Demo />;
	},
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				story:
					"Empty-state landing hero — the composer standing alone (no conversation/results frame): a brand chip, a greeting, the full composer, and quick-start suggestion pills.",
			},
		},
	},
};

export const Default: Story = {
	render: () => {
		function Demo() {
			const [value, setValue] = useState("");
			const [attachments, setAttachments] = useState<PromptAttachment[]>([]);
			return (
				<div className="wwc:w-[640px]">
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
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					"Full toolbar with Add context (popover with searchable list), Upload file (file picker), and Send button.",
			},
		},
	},
};

export const WithAttachments: Story = {
	render: () => {
		function Demo() {
			const [value, setValue] = useState("Summarize what changed in these files.");
			const [attachments, setAttachments] = useState<PromptAttachment[]>([
				{id: "a1", label: "Weekly progress report.pdf", type: "file"},
				{id: "a2", label: "Project schedule", type: "context"},
				{id: "a3", label: "Cost budget Q3.xlsx", type: "file"},
			]);
			return (
				<div className="wwc:w-[640px]">
					<PromptInput
						value={value}
						onChange={setValue}
						onSend={(v) => console.log("send", v, attachments)}
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
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story: "Pre-populated attachment chips above the textarea. Click an X on a chip to remove it.",
			},
		},
	},
};

export const ContextOnly: Story = {
	render: () => {
		function Demo() {
			const [value, setValue] = useState("");
			const [attachments, setAttachments] = useState<PromptAttachment[]>([]);
			return (
				<div className="wwc:w-[640px]">
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
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {story: "Add context popover only — no upload button. Use when uploads aren't applicable."},
		},
	},
};

export const UploadOnly: Story = {
	render: () => {
		function Demo() {
			const [value, setValue] = useState("");
			const [attachments, setAttachments] = useState<PromptAttachment[]>([]);
			return (
				<div className="wwc:w-[640px]">
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
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {description: {story: "File upload without context picker."}},
	},
};

export const Minimal: Story = {
	render: () => {
		function Demo() {
			const [value, setValue] = useState("");
			return (
				<div className="wwc:w-[640px]">
					<PromptInput value={value} onChange={setValue} onSend={(v) => console.log("send", v)} />
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {description: {story: "No toolbar buttons — just textarea and send."}},
	},
};

export const Disabled: Story = {
	render: () => (
		<div className="wwc:w-[640px]">
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
		</div>
	),
	parameters: {
		docs: {description: {story: "Disabled while the assistant is generating a response."}},
	},
};

export const AttachmentsWithPreview: Story = {
	render: () => {
		function Demo() {
			const [value, setValue] = useState("Compare these two site shots and summarize the budget.");
			const [attachments, setAttachments] = useState<PromptAttachment[]>([
				{
					id: "img1",
					label: "building-elevation.jpg",
					type: "file",
					preview: {
						type: "image",
						src: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=600&q=80",
						alt: "Architectural concrete building",
					},
				},
				{
					id: "img2",
					label: "site-overview.jpg",
					type: "file",
					preview: {
						type: "image",
						src: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80",
						alt: "Construction site overview",
					},
				},
				{
					id: "ctx1",
					label: "Cost budget Q3",
					type: "context",
					preview: {
						type: "custom",
						content: (
							<div className="wwc:flex wwc:flex-col wwc:gap-1 wwc:font-mono wwc:text-[10px] wwc:text-foreground">
								<span>Q3 Costs · 124 rows</span>
								<span className="wwc:text-muted-foreground">Labor · $1.2M</span>
								<span className="wwc:text-muted-foreground">Materials · $3.4M</span>
								<span className="wwc:text-muted-foreground">Equipment · $0.8M</span>
							</div>
						),
					},
				},
			]);
			return (
				<div className="wwc:w-[640px]">
					<PromptInput
						value={value}
						onChange={setValue}
						onSend={(v) => console.log("send", v, attachments)}
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
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					"Hover any attachment chip to see its preview. The first two chips are images (object-cover scaled into a fixed h-32 container). The third has a custom preview node showing a quick file summary.",
			},
		},
	},
};

export const Composer: Story = {
	render: () => {
		function Demo() {
			const [value, setValue] = useState("");
			const [attachments, setAttachments] = useState<PromptAttachment[]>([]);
			const [model, setModel] = useState("balanced");
			const [activeTools, setActiveTools] = useState<string[]>(["canvas"]);
			return (
				<div className="wwc:w-[680px]">
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
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					"The full composer: `+` menu (Upload file + create actions), a Tools menu whose selections become removable pills (Canvas active here), a model picker, a mic, a suggestions row, and file-card attachments after upload.",
			},
		},
	},
};

export const WithModelPicker: Story = {
	render: () => {
		function Demo() {
			const [value, setValue] = useState("Draft a safety toolbox talk for tomorrow.");
			const [model, setModel] = useState("thinking");
			return (
				<div className="wwc:w-[640px]">
					<PromptInput
						value={value}
						onChange={setValue}
						onSend={(v) => console.log("send", v, model)}
						models={demoModels}
						modelId={model}
						onModelChange={setModel}
						onMic={() => {}}
					/>
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {description: {story: "Right-aligned model picker (with descriptions + selected check) and a mic button."}},
	},
};

export const WithTools: Story = {
	render: () => {
		function Demo() {
			const [value, setValue] = useState("");
			const [activeTools, setActiveTools] = useState<string[]>(["canvas", "web"]);
			return (
				<div className="wwc:w-[640px]">
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
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					"Tools menu with multi-select. Active tools render as removable primary-tinted pills; click a pill's X or re-toggle in the menu to remove.",
			},
		},
	},
};
