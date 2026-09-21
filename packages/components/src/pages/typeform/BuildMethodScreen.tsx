// "How do you want to build your form?" — the method chooser. Start from scratch or import
// questions (one per line); AI generation is a "Coming soon" stub (dialog opens, action disabled).
import {FileText, Import, Sparkles} from "lucide-react";
import {useState} from "react";

import {Badge} from "../../badge";
import {Button} from "../../button";
import {Card, CardContent} from "../../card";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "../../dialog";
import {Input} from "../../input";
import {Label} from "../../label";
import {Textarea} from "../../textarea";
import {makeQuestion} from "./model";
import type {Question} from "./model";

export interface BuildMethodScreenProps {
	onStartFromScratch: () => void;
	onSeed: (questions: Question[]) => void;
	onCancel: () => void;
}

/** Turn pasted text (one question per line) into short-text questions. */
function parseImported(text: string): Question[] {
	return text
		.split("\n")
		.map((l) => l.trim())
		.filter(Boolean)
		.map((line) => {
			const q = makeQuestion("short_text");
			q.label = line;
			return q;
		});
}

export function BuildMethodScreen({onStartFromScratch, onSeed, onCancel}: BuildMethodScreenProps) {
	const [importOpen, setImportOpen] = useState(false);
	const [aiOpen, setAiOpen] = useState(false);
	const [importText, setImportText] = useState("");
	const [aiPrompt, setAiPrompt] = useState("");

	const methods = [
		{
			id: "scratch",
			icon: FileText,
			title: "Start from scratch",
			desc: "Build your form question by question.",
			action: onStartFromScratch,
			soon: false,
		},
		{
			id: "import",
			icon: Import,
			title: "Import questions",
			desc: "Paste your questions, one per line.",
			action: () => setImportOpen(true),
			soon: true,
		},
		{
			id: "ai",
			icon: Sparkles,
			title: "Create with AI",
			desc: "Describe your form and generate a starting point.",
			action: () => setAiOpen(true),
			soon: true,
		},
	];

	return (
		<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:items-center wwc:justify-center wwc:gap-8 wwc:overflow-auto wwc:bg-background wwc:px-8 wwc:py-12">
			<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-2 wwc:text-center">
				<h1 className="wwc:text-2xl wwc:font-semibold wwc:tracking-tight wwc:text-foreground">
					How do you want to build your form?
				</h1>
				<p className="wwc:text-sm wwc:text-muted-foreground">
					Pick a starting point — you can change everything later.
				</p>
			</div>

			<div className="wwc:grid wwc:w-full wwc:max-w-3xl wwc:grid-cols-1 wwc:gap-4 wwc:md:grid-cols-3">
				{methods.map((m) => (
					<Card
						key={m.id}
						className="wwc:relative wwc:cursor-pointer wwc:border wwc:border-border wwc:shadow-none wwc:transition-colors wwc:hover:border-primary wwc:hover:bg-accent"
						onClick={m.action}
					>
						{m.soon ? (
							<Badge variant="neutralSoft" className="wwc:absolute wwc:right-3 wwc:top-3 wwc:whitespace-nowrap">
								Coming soon
							</Badge>
						) : null}
						<CardContent className="wwc:flex wwc:flex-col wwc:items-start wwc:gap-3 wwc:p-5">
							<span className="wwc:flex wwc:size-9 wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-muted wwc:text-foreground">
								<m.icon className="wwc:size-4" />
							</span>
							<span className="wwc:text-sm wwc:font-medium wwc:text-foreground">{m.title}</span>
							<span className="wwc:text-xs wwc:text-muted-foreground">{m.desc}</span>
						</CardContent>
					</Card>
				))}
			</div>

			<Button variant="ghost" size="sm" className="wwc:text-muted-foreground" onClick={onCancel}>
				Cancel
			</Button>

			{/* Import dialog */}
			<Dialog open={importOpen} onOpenChange={setImportOpen}>
				<DialogContent className="wwc:max-w-lg">
					{/* Banded dialog: only the title lives in the 40px band; the description joins the body,
					    which supplies its own padding (DialogContent is edge-to-edge in this variant). */}
					<DialogHeader>
						<DialogTitle>Import questions</DialogTitle>
					</DialogHeader>
					<div className="wwc:flex wwc:flex-col wwc:gap-4 wwc:px-6 wwc:py-5">
						<DialogDescription>
							Paste one question per line. Each becomes a short-text question you can refine.
						</DialogDescription>
						<div className="wwc:flex wwc:flex-col wwc:gap-2">
							<Label htmlFor="import-text">Questions</Label>
							<Textarea
								id="import-text"
								rows={8}
								value={importText}
								placeholder={"What's your name?\nHow did you hear about us?\nAny feedback?"}
								onChange={(e) => setImportText(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="ghost" onClick={() => setImportOpen(false)}>
							Cancel
						</Button>
						<Button
							disabled={parseImported(importText).length === 0}
							onClick={() => {
								onSeed(parseImported(importText));
								setImportOpen(false);
							}}
						>
							Import questions
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* AI dialog */}
			<Dialog open={aiOpen} onOpenChange={setAiOpen}>
				<DialogContent className="wwc:max-w-lg">
					{/* Same banded layout as the import dialog: title in the band, description in the body. */}
					<DialogHeader>
						<DialogTitle>Create with AI</DialogTitle>
					</DialogHeader>
					<div className="wwc:flex wwc:flex-col wwc:gap-4 wwc:px-6 wwc:py-5">
						<DialogDescription>
							Describe what your form is about and we'll generate a starting set of questions.
						</DialogDescription>
						<div className="wwc:flex wwc:flex-col wwc:gap-2">
							<Label htmlFor="ai-prompt">What's your form about?</Label>
							<Input
								id="ai-prompt"
								value={aiPrompt}
								placeholder="e.g. a post-event feedback survey for a walking tour"
								onChange={(e) => setAiPrompt(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="ghost" onClick={() => setAiOpen(false)}>
							Cancel
						</Button>
						{/* Coming soon: generation is not wired up yet, so the action stays disabled. */}
						<Button disabled>
							<Sparkles className="wwc:size-3.5" />
							Generate form
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
