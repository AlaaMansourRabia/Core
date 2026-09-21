import type {LucideIcon} from "lucide-react";

import {cn} from "@wakecap/core-utils";
// The BUILDER half of the Typeform-style form tool: a three-column editor (question rail /
// canvas preview / inspector). The parent supplies the outer Shell + topbar; this fills the
// main area. All mutations route through the `FormBuilder` hook — this file is pure UI.
import {
	AlertTriangle,
	AlignLeft,
	ArrowLeft,
	Calendar,
	Check,
	Circle,
	CircleDot,
	Copy,
	Database,
	Eye,
	Grid3x3,
	GripVertical,
	Mail,
	Paperclip,
	Pencil,
	PenLine,
	Plus,
	Send,
	Sigma,
	Star,
	Table,
	Trash2,
	Type,
	Zap,
} from "lucide-react";
import {useEffect, useRef, useState} from "react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../../alert-dialog";
import {Badge} from "../../badge";
import {Button} from "../../button";
import {Card, CardContent} from "../../card";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "../../dialog";
import {Input} from "../../input";
import {Separator} from "../../separator";
import {Textarea} from "../../textarea";
import {ToggleGroup, ToggleGroupItem} from "../../toggle-group";
import {questionLogicBroken, wouldMoveQuestionBreak, wouldReorderSectionsBreak} from "./logic";
import {QUESTION_TYPES} from "./model";
import type {Question, QuestionType, QuestionTypeMeta} from "./model";
import {QuestionInspector} from "./QuestionInspector";
import {QuestionRenderer} from "./QuestionRenderer";
import type {FormBuilder} from "./useFormBuilder";

/** Does a question carry any conditional logic or restriction? Used for the rail "logic" badge. */
function hasLogic(q: Question): boolean {
	return Boolean(
		q.visibilityRule ||
		q.requirednessRule ||
		q.editableRule ||
		(q.optionRestrictions && q.optionRestrictions.length > 0),
	);
}

/** Resolve the model's lucide icon name to an actual component. */
const ICONS: Record<QuestionTypeMeta["icon"], LucideIcon> = {
	Type,
	AlignLeft,
	Mail,
	CircleDot,
	Star,
	Calendar,
	PenLine,
	Paperclip,
	Grid3x3,
	Table,
	Database,
	Sigma,
};

function TypeIcon({type, className}: {type: QuestionType; className?: string}) {
	const meta = QUESTION_TYPES.find((t) => t.type === type) ?? QUESTION_TYPES[0];
	const Icon = ICONS[meta.icon];
	return <Icon className={className} />;
}

export function BuilderScreen({
	builder,
	onPreview,
	onBack,
	onPublish,
	showDisplayModeToggle,
}: {
	builder: FormBuilder;
	onPreview: () => void;
	/** When set, shows a back control (e.g. to the forms list) in the toolbar. */
	onBack?: () => void;
	/** When set, shows a Publish action in the toolbar. */
	onPublish?: () => void;
	/** Show a single-question / full-form respondent-view toggle beside Preview. */
	showDisplayModeToggle?: boolean;
}) {
	const [addOpen, setAddOpen] = useState(false);
	const {schema, selected} = builder;
	const questions = schema.questions;
	const sections = schema.sections ?? [];
	// When the form has multiple sections, new content lands in the active one — surface its name.
	const activeSection = sections.length > 1 ? sections.find((s) => s.id === builder.activeSectionId) : undefined;
	const displayMode = schema.displayMode ?? "one_question";

	// The canvas shows every question in ONE section together (not just the selected one): the
	// selected question's section, else the add-target section, else the first. Orphaned questions
	// (no/unknown section) fold into the first section, matching the left rail's grouping.
	const canvasSectionId = selected?.sectionId ?? builder.activeSectionId ?? sections[0]?.id;
	const canvasSection = sections.find((s) => s.id === canvasSectionId);
	const canvasQuestions =
		sections.length === 0
			? questions
			: questions.filter(
					(q) =>
						q.sectionId === canvasSectionId ||
						(sections[0]?.id === canvasSectionId && (!q.sectionId || !sections.some((s) => s.id === q.sectionId))),
				);

	function pickType(type: QuestionType) {
		builder.addQuestion(type);
		setAddOpen(false);
	}

	return (
		<div className="wwc:flex wwc:h-full wwc:min-h-0 wwc:w-full wwc:flex-col wwc:bg-background">
			{/* Canvas toolbar */}
			<div className="wwc:flex wwc:h-12 wwc:shrink-0 wwc:items-center wwc:justify-between wwc:border-b wwc:border-border wwc:bg-white wwc:px-4">
				<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-2">
					{onBack ? (
						<Button variant="ghost" size="sm" className="wwc:gap-1.5" onClick={onBack}>
							<ArrowLeft />
							Forms
						</Button>
					) : null}
					<span className="wwc:truncate wwc:text-sm wwc:font-medium wwc:text-foreground">{schema.title}</span>
					<Badge variant="neutralSoft">
						{questions.length} {questions.length === 1 ? "question" : "questions"}
					</Badge>
				</div>
				<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2">
					{showDisplayModeToggle ? (
						<div className="wwc:flex wwc:items-center wwc:gap-2">
							<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Question mode</span>
							<ToggleGroup
								type="single"
								size="sm"
								variant="outline"
								value={displayMode}
								// Radix emits "" when the active item is pressed again — ignore it so a mode is always set.
								onValueChange={(v) => {
									if (v === "one_question" || v === "list") builder.setMeta({displayMode: v});
								}}
								aria-label="Question mode"
							>
								<ToggleGroupItem
									value="one_question"
									aria-label="One question at a time"
									className="wwc:gap-1.5 wwc:text-xs wwc:[&_svg]:size-3.5 wwc:[&_svg]:shrink-0"
								>
									{displayMode === "one_question" ? (
										<CircleDot className="wwc:text-primary" />
									) : (
										<Circle className="wwc:text-muted-foreground" />
									)}
									Single question
								</ToggleGroupItem>
								<ToggleGroupItem
									value="list"
									aria-label="Full form on one page"
									className="wwc:gap-1.5 wwc:text-xs wwc:[&_svg]:size-3.5 wwc:[&_svg]:shrink-0"
								>
									{displayMode === "list" ? (
										<CircleDot className="wwc:text-primary" />
									) : (
										<Circle className="wwc:text-muted-foreground" />
									)}
									Full form
								</ToggleGroupItem>
							</ToggleGroup>
						</div>
					) : null}
					<Button size="sm" variant={onPublish ? "outline" : "default"} onClick={onPreview}>
						<Eye />
						Preview
					</Button>
					{onPublish ? (
						<Button size="sm" onClick={onPublish}>
							<Send />
							Publish
						</Button>
					) : null}
				</div>
			</div>

			<div className="wwc:flex wwc:min-h-0 wwc:flex-1">
				{/* ── LEFT: question rail ─────────────────────────────── */}
				<aside className="wwc:flex wwc:w-[240px] wwc:shrink-0 wwc:flex-col wwc:border-r wwc:border-border wwc:bg-white">
					<div className="wwc:flex wwc:items-center wwc:justify-between wwc:px-3 wwc:py-2">
						<span className="wwc:text-xs wwc:font-semibold wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
							Content
						</span>
					</div>
					<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-y-auto wwc:px-2">
						{questions.length === 0 && sections.length === 0 ? (
							<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-1 wwc:px-3 wwc:py-8 wwc:text-center">
								<p className="wwc:text-sm wwc:font-medium wwc:text-foreground">No questions yet</p>
								<p className="wwc:text-xs wwc:text-muted-foreground">Add your first</p>
							</div>
						) : sections.length === 0 ? (
							// No sections: flat list.
							<ul className="wwc:flex wwc:flex-col wwc:gap-1 wwc:pb-2">
								{questions.map((q) => (
									<QuestionRow key={q.id} builder={builder} question={q} index={questions.indexOf(q)} />
								))}
							</ul>
						) : (
							// Grouped by section. Orphans (no/unknown section) fold into the first section.
							<div className="wwc:flex wwc:flex-col wwc:gap-3 wwc:pb-2">
								{sections.map((section, sIdx) => {
									const sectionQuestions = questions.filter(
										(q) =>
											q.sectionId === section.id ||
											(sIdx === 0 && (!q.sectionId || !sections.some((s) => s.id === q.sectionId))),
									);
									return (
										<div key={section.id} className="wwc:flex wwc:flex-col wwc:gap-1">
											<SectionHeader
												builder={builder}
												sectionId={section.id}
												title={section.title}
												index={sIdx}
												total={sections.length}
												active={sections.length > 1 && builder.activeSectionId === section.id}
												onAddQuestion={() => {
													builder.selectSection(section.id);
													setAddOpen(true);
												}}
											/>
											<ul className="wwc:flex wwc:flex-col wwc:gap-1">
												{sectionQuestions.map((q) => (
													<QuestionRow key={q.id} builder={builder} question={q} index={questions.indexOf(q)} />
												))}
												<SectionAddDrop
													builder={builder}
													sectionId={section.id}
													onAdd={() => {
														builder.selectSection(section.id);
														setAddOpen(true);
													}}
												/>
											</ul>
										</div>
									);
								})}
							</div>
						)}
					</div>
					<div className="wwc:flex wwc:shrink-0 wwc:flex-col wwc:gap-2 wwc:border-t wwc:border-border wwc:p-2">
						<Button variant="outline" size="sm" className="wwc:w-full" onClick={() => builder.addSection()}>
							<Plus />
							Add section
						</Button>
					</div>
				</aside>

				{/* ── CENTER: canvas — every question in the active section, stacked ──── */}
				<main className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-start wwc:justify-center wwc:overflow-y-auto wwc:bg-muted/10 wwc:p-8">
					{canvasQuestions.length > 0 ? (
						<div className="wwc:flex wwc:w-full wwc:max-w-xl wwc:flex-col wwc:gap-4">
							{canvasSection ? (
								<div className="wwc:flex wwc:flex-col wwc:gap-0.5">
									<span className="wwc:text-xs wwc:font-semibold wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
										{canvasSection.title || "Untitled section"}
									</span>
									{canvasSection.description ? (
										<span className="wwc:text-sm wwc:text-muted-foreground">{canvasSection.description}</span>
									) : null}
								</div>
							) : null}
							{canvasQuestions.map((q) => (
								<QuestionCard key={q.id} builder={builder} question={q} />
							))}
						</div>
					) : (
						<div className="wwc:flex wwc:h-full wwc:flex-col wwc:items-center wwc:justify-center wwc:gap-2 wwc:text-center">
							<p className="wwc:text-sm wwc:font-medium wwc:text-foreground">No questions here yet</p>
							<p className="wwc:text-xs wwc:text-muted-foreground">Add your first from the left.</p>
						</div>
					)}
				</main>

				{/* ── RIGHT: inspector ────────────────────────────────── */}
				<aside className="wwc:flex wwc:min-h-0 wwc:w-[300px] wwc:shrink-0 wwc:flex-col wwc:border-l wwc:border-border wwc:bg-white">
					<QuestionInspector builder={builder} />
				</aside>
			</div>

			{/* ── Add-content dialog ────────────────────────────────── */}
			<Dialog open={addOpen} onOpenChange={setAddOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add content</DialogTitle>
					</DialogHeader>
					<div className="wwc:p-4">
						<DialogDescription className="wwc:mb-3">
							{activeSection
								? `Choose a question type to add to “${activeSection.title || "Untitled section"}”.`
								: "Choose a question type to add to your form."}
						</DialogDescription>
						<div className="wwc:grid wwc:grid-cols-2 wwc:gap-2">
							{QUESTION_TYPES.map((meta) => {
								const Icon = ICONS[meta.icon];
								return (
									<button
										key={meta.type}
										type="button"
										onClick={() => pickType(meta.type)}
										className="wwc:flex wwc:items-start wwc:gap-3 wwc:rounded-md wwc:border wwc:border-border wwc:bg-card wwc:p-3 wwc:text-left wwc:transition-colors wwc:hover:border-primary wwc:hover:bg-accent"
									>
										<span className="wwc:flex wwc:h-8 wwc:w-8 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-muted wwc:text-foreground">
											<Icon className="wwc:h-4 wwc:w-4" />
										</span>
										<span className="wwc:flex wwc:min-w-0 wwc:flex-col">
											<span className="wwc:text-sm wwc:font-medium wwc:text-foreground">{meta.label}</span>
											<span className="wwc:text-xs wwc:text-muted-foreground">{meta.hint}</span>
										</span>
									</button>
								);
							})}
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

// ── Canvas question card ───────────────────────────────────────────────────────
// One editable card per question. All cards in the active section render together; clicking a card
// (or focusing its fields) selects that question so the inspector follows. Label + description edit
// inline; the control below is a live, non-interactive preview via QuestionRenderer.

function QuestionCard({builder, question: q}: {builder: FormBuilder; question: Question}) {
	const selected = q.id === builder.selectedId;
	const ref = useRef<HTMLDivElement>(null);
	// Selecting a question (e.g. from the left rail) scrolls its card into view. `block: "nearest"`
	// is a no-op when the card is already visible, so clicking a visible card never jumps.
	useEffect(() => {
		if (selected) ref.current?.scrollIntoView({behavior: "smooth", block: "nearest"});
	}, [selected]);
	return (
		<Card
			ref={ref}
			onClick={() => builder.select(q.id)}
			className={cn(
				"wwc:w-full wwc:cursor-pointer wwc:transition-shadow",
				selected ? "wwc:border-foreground wwc:ring-2 wwc:ring-foreground" : "wwc:hover:shadow-md",
			)}
		>
			<CardContent className="wwc:flex wwc:flex-col wwc:gap-4 wwc:p-8">
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<TypeIcon type={q.type} className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
					<span className="wwc:text-xs wwc:text-muted-foreground">
						{QUESTION_TYPES.find((t) => t.type === q.type)?.label}
					</span>
				</div>
				<div className="wwc:flex wwc:flex-col wwc:gap-2">
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						<Input
							aria-label="Question title"
							className="wwc:h-auto wwc:min-w-0 wwc:flex-1 wwc:border-0 wwc:bg-transparent wwc:px-0 wwc:text-lg wwc:font-semibold wwc:shadow-none wwc:focus-visible:ring-0"
							placeholder="Your question here..."
							value={q.label}
							onFocus={() => builder.select(q.id)}
							onChange={(e) => builder.updateQuestion(q.id, {label: e.target.value})}
						/>
						{q.required === true ? (
							<span className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-1 wwc:text-sm wwc:font-medium wwc:text-destructive">
								<span aria-hidden className="wwc:text-lg wwc:font-semibold">
									*
								</span>
								Required
							</span>
						) : null}
					</div>
					<Textarea
						aria-label="Question description"
						className="wwc:min-h-0 wwc:resize-none wwc:border-0 wwc:bg-transparent wwc:px-0 wwc:text-sm wwc:text-muted-foreground wwc:shadow-none wwc:focus-visible:ring-0"
						rows={1}
						placeholder="Add a description (optional)"
						value={q.description ?? ""}
						onFocus={() => builder.select(q.id)}
						onChange={(e) => builder.updateQuestion(q.id, {description: e.target.value})}
					/>
				</div>
				<Separator />
				<div className="wwc:pt-2">
					<QuestionRenderer question={q} value={undefined} onChange={() => {}} idPrefix={`canvas-${q.id}`} />
				</div>
			</CardContent>
		</Card>
	);
}

// ── Shared move-confirmation plumbing ──────────────────────────────────────────
// A drag that would break conditional logic waits on a confirmation. `PendingMove.apply` performs the
// move if confirmed; MoveBreakDialog renders the shared warning. Used by rows, section headers, and the
// empty-section drop zone so all three confirm identically.

type PendingMove = {labels: string[]; apply: () => void};

function labelsFor(builder: FormBuilder, ids: string[]): string[] {
	return ids.map((x) => builder.schema.questions.find((y) => y.id === x)?.label || "Untitled question");
}

function MoveBreakDialog({pending, onClose}: {pending: PendingMove | null; onClose: () => void}) {
	return (
		<AlertDialog open={pending !== null} onOpenChange={(o) => !o && onClose()}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>This move breaks logic</AlertDialogTitle>
					<AlertDialogDescription>
						This move will break conditional logic on{" "}
						{pending?.labels.length === 1 ? "this question" : "these questions"}:
					</AlertDialogDescription>
				</AlertDialogHeader>
				{pending ? (
					<ul className="wwc:flex wwc:list-disc wwc:flex-col wwc:gap-1 wwc:pl-5 wwc:text-sm wwc:text-foreground">
						{pending.labels.map((label, idx) => (
							<li key={idx}>{label || "Untitled question"}</li>
						))}
					</ul>
				) : null}
				<AlertDialogFooter>
					<AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => {
							pending?.apply();
							onClose();
						}}
					>
						Move anyway
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

// ── Per-section add / drop zone ────────────────────────────────────────────────
// Sits at the end of every section: a dotted container with a single "+" that adds a question to the
// section, and doubles as a drop target that appends a dragged question to it (same break-logic guard).

function SectionAddDrop({builder, sectionId, onAdd}: {builder: FormBuilder; sectionId: string; onAdd: () => void}) {
	const [over, setOver] = useState(false);
	const [pending, setPending] = useState<PendingMove | null>(null);

	function handleDrop(id: string) {
		const chk = wouldMoveQuestionBreak(builder.schema, id, sectionId, null);
		const apply = () => builder.moveQuestion(id, sectionId, null);
		if (chk.breaks) setPending({labels: labelsFor(builder, chk.newlyBroken), apply});
		else apply();
	}

	return (
		<li>
			<div
				onDragOver={(e) => {
					if (!e.dataTransfer.types.includes("text/plain")) return;
					e.preventDefault();
					e.dataTransfer.dropEffect = "move";
					setOver(true);
				}}
				onDragLeave={() => setOver(false)}
				onDrop={(e) => {
					e.preventDefault();
					setOver(false);
					const data = e.dataTransfer.getData("text/plain");
					if (data.startsWith("q:")) handleDrop(data.slice(2));
				}}
				className={cn(
					"wwc:flex wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:border-dashed wwc:border-border wwc:py-1",
					over ? "wwc:border-primary wwc:bg-accent/60" : "wwc:hover:border-muted-foreground/50",
				)}
			>
				<button
					type="button"
					aria-label="Add question to section"
					onClick={onAdd}
					className="wwc:flex wwc:h-6 wwc:w-full wwc:items-center wwc:justify-center wwc:text-muted-foreground wwc:hover:text-foreground"
				>
					<Plus className="wwc:h-4 wwc:w-4" />
				</button>
			</div>
			<MoveBreakDialog pending={pending} onClose={() => setPending(null)} />
		</li>
	);
}

// ── Question rail row ──────────────────────────────────────────────────────────

function QuestionRow({builder, question: q, index: i}: {builder: FormBuilder; question: Question; index: number}) {
	const active = q.id === builder.selectedId;
	const broken = questionLogicBroken(builder.schema, q.id);
	const sections = builder.schema.sections ?? [];
	// The section a question dropped here would adopt (this row's section, orphans → first section).
	const rowSectionId = q.sectionId && sections.some((s) => s.id === q.sectionId) ? q.sectionId : sections[0]?.id;
	// Pending breaking move awaiting confirmation. null ⇒ dialog closed.
	const [pending, setPending] = useState<PendingMove | null>(null);
	// Drag-to-reorder state. `grabbed` gates the native `draggable` so a drag only starts from the grip
	// handle (not from a click on the row body); `dropTarget` draws the "insert above" indicator.
	const [grabbed, setGrabbed] = useState(false);
	const [dropTarget, setDropTarget] = useState(false);

	/** Guarded move: drop `id` immediately before THIS row (adopting its section); confirm if it breaks logic. */
	function attemptMove(id: string) {
		if (id === q.id) return;
		const chk = wouldMoveQuestionBreak(builder.schema, id, rowSectionId, q.id);
		const apply = () => builder.moveQuestion(id, rowSectionId, q.id);
		if (chk.breaks) setPending({labels: labelsFor(builder, chk.newlyBroken), apply});
		else apply();
	}

	return (
		<li>
			<div
				draggable={grabbed}
				onDragStart={(e) => {
					e.dataTransfer.effectAllowed = "move";
					e.dataTransfer.setData("text/plain", `q:${q.id}`);
				}}
				onDragEnd={() => {
					setGrabbed(false);
					setDropTarget(false);
				}}
				onDragOver={(e) => {
					// Only questions drop onto a row; a dragged section targets section headers instead.
					if (!e.dataTransfer.types.includes("text/plain")) return;
					e.preventDefault();
					e.dataTransfer.dropEffect = "move";
					setDropTarget(true);
				}}
				onDragLeave={() => setDropTarget(false)}
				onDrop={(e) => {
					e.preventDefault();
					setDropTarget(false);
					const data = e.dataTransfer.getData("text/plain");
					if (data.startsWith("q:")) attemptMove(data.slice(2));
				}}
				className={cn(
					"wwc:group wwc:flex wwc:items-center wwc:gap-1 wwc:rounded-md wwc:border-t-2 wwc:border-transparent wwc:px-1 wwc:py-1.5",
					active ? "wwc:bg-accent wwc:text-accent-foreground" : "wwc:hover:bg-accent/50",
					dropTarget ? "wwc:border-primary" : null,
				)}
			>
				<span
					role="button"
					aria-label="Drag to reorder"
					onMouseDown={() => setGrabbed(true)}
					onMouseUp={() => setGrabbed(false)}
					className="wwc:flex wwc:h-5 wwc:w-4 wwc:shrink-0 wwc:cursor-grab wwc:items-center wwc:justify-center wwc:text-muted-foreground wwc:opacity-0 wwc:group-hover:opacity-100 wwc:active:cursor-grabbing"
				>
					<GripVertical className="wwc:h-4 wwc:w-4" />
				</span>
				<button
					type="button"
					onClick={() => builder.select(q.id)}
					className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:gap-2 wwc:text-left"
				>
					<span className="wwc:flex wwc:h-5 wwc:w-5 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded wwc:bg-muted wwc:text-[10px] wwc:font-medium wwc:text-muted-foreground">
						{i + 1}
					</span>
					<TypeIcon type={q.type} className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-muted-foreground" />
					<span className="wwc:truncate wwc:text-sm">{q.label || "Untitled question"}</span>
					{broken ? (
						<Badge variant="destructive" className="wwc:gap-1 wwc:px-1.5">
							<AlertTriangle className="wwc:h-3 wwc:w-3" />
							Logic broken
						</Badge>
					) : hasLogic(q) ? (
						<Badge variant="neutralSoft" className="wwc:gap-1 wwc:px-1.5">
							<Zap className="wwc:h-3 wwc:w-3" />
							Logic
						</Badge>
					) : null}
				</button>
				<div className="wwc:hidden wwc:shrink-0 wwc:items-center wwc:group-hover:flex">
					<Button icon size="sm" variant="ghost" aria-label="Duplicate" onClick={() => builder.duplicate(q.id)}>
						<Copy />
					</Button>
					<Button icon size="sm" variant="ghost" aria-label="Delete" onClick={() => builder.removeQuestion(q.id)}>
						<Trash2 />
					</Button>
				</div>
			</div>

			<MoveBreakDialog pending={pending} onClose={() => setPending(null)} />
		</li>
	);
}

// ── Section header (drag reorder + inline rename + add / delete) ───────────────

function SectionHeader({
	builder,
	sectionId,
	title,
	index,
	total,
	active,
	onAddQuestion,
}: {
	builder: FormBuilder;
	sectionId: string;
	title: string;
	index: number;
	total: number;
	/** Highlight this section as the target for new content (only meaningful with >1 section). */
	active?: boolean;
	/** Add a new question to THIS section (the hover "+" affordance). */
	onAddQuestion: () => void;
}) {
	const sections = builder.schema.sections ?? [];
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(title);
	// Drag state — mirrors the question rows: `grabbed` gates the native drag to the grip handle only.
	const [grabbed, setGrabbed] = useState(false);
	const [dropTarget, setDropTarget] = useState(false);
	// Pending breaking move awaiting confirmation; `apply` performs it. null ⇒ dialog closed.
	const [pending, setPending] = useState<PendingMove | null>(null);

	function commit() {
		const next = draft.trim();
		builder.updateSection(sectionId, {title: next || "Untitled section"});
		setEditing(false);
	}

	/** A dragged SECTION dropped here → reorder it to this section's index (confirm if it breaks logic). */
	function dropSection(draggedId: string) {
		if (draggedId === sectionId) return;
		const from = sections.findIndex((s) => s.id === draggedId);
		if (from < 0) return;
		const chk = wouldReorderSectionsBreak(builder.schema, from, index);
		const apply = () => builder.reorderSection(from, index);
		if (chk.breaks) setPending({labels: labelsFor(builder, chk.newlyBroken), apply});
		else apply();
	}

	/** A dragged QUESTION dropped here → append it to this section (confirm if it breaks logic). */
	function dropQuestion(draggedId: string) {
		const chk = wouldMoveQuestionBreak(builder.schema, draggedId, sectionId, null);
		const apply = () => builder.moveQuestion(draggedId, sectionId, null);
		if (chk.breaks) setPending({labels: labelsFor(builder, chk.newlyBroken), apply});
		else apply();
	}

	if (editing) {
		return (
			<div className="wwc:flex wwc:items-center wwc:gap-1 wwc:px-1 wwc:py-1">
				<Input
					autoFocus
					className="wwc:h-7"
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") commit();
						if (e.key === "Escape") {
							setDraft(title);
							setEditing(false);
						}
					}}
				/>
				<Button icon size="sm" variant="ghost" aria-label="Save section name" onClick={commit}>
					<Check />
				</Button>
			</div>
		);
	}

	return (
		<>
			<div
				draggable={grabbed}
				onDragStart={(e) => {
					e.dataTransfer.effectAllowed = "move";
					e.dataTransfer.setData("text/plain", `s:${sectionId}`);
				}}
				onDragEnd={() => {
					setGrabbed(false);
					setDropTarget(false);
				}}
				onDragOver={(e) => {
					e.preventDefault();
					e.dataTransfer.dropEffect = "move";
					setDropTarget(true);
				}}
				onDragLeave={() => setDropTarget(false)}
				onDrop={(e) => {
					e.preventDefault();
					setDropTarget(false);
					const data = e.dataTransfer.getData("text/plain");
					if (data.startsWith("s:")) dropSection(data.slice(2));
					else if (data.startsWith("q:")) dropQuestion(data.slice(2));
				}}
				className={cn(
					"wwc:group/section wwc:flex wwc:items-center wwc:gap-1 wwc:rounded-md wwc:border-t-2 wwc:border-transparent wwc:px-1 wwc:py-1",
					active ? "wwc:bg-accent" : null,
					dropTarget ? "wwc:border-primary wwc:bg-accent/60" : null,
				)}
			>
				{total > 1 ? (
					<span
						role="button"
						aria-label="Drag to reorder section"
						onMouseDown={() => setGrabbed(true)}
						onMouseUp={() => setGrabbed(false)}
						className="wwc:flex wwc:h-5 wwc:w-4 wwc:shrink-0 wwc:cursor-grab wwc:items-center wwc:justify-center wwc:text-muted-foreground wwc:opacity-0 wwc:group-hover/section:opacity-100 wwc:active:cursor-grabbing"
					>
						<GripVertical className="wwc:h-4 wwc:w-4" />
					</span>
				) : null}
				<button
					type="button"
					onClick={() => builder.selectSection(sectionId)}
					aria-pressed={active}
					title="Add new content to this section"
					className={cn(
						"wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:gap-1.5 wwc:text-left wwc:text-xs wwc:font-semibold wwc:uppercase wwc:tracking-wide",
						active ? "wwc:text-foreground" : "wwc:text-muted-foreground wwc:hover:text-foreground",
					)}
				>
					{active ? (
						<span aria-hidden className="wwc:h-1.5 wwc:w-1.5 wwc:shrink-0 wwc:rounded-full wwc:bg-primary" />
					) : null}
					<span className="wwc:truncate">{title || "Untitled section"}</span>
				</button>
				<div className="wwc:hidden wwc:shrink-0 wwc:items-center wwc:group-hover/section:flex">
					<Button icon size="sm" variant="ghost" aria-label="Add question to section" onClick={onAddQuestion}>
						<Plus />
					</Button>
					<Button
						icon
						size="sm"
						variant="ghost"
						aria-label="Rename section"
						onClick={() => {
							setDraft(title);
							setEditing(true);
						}}
					>
						<Pencil />
					</Button>
					<Button
						icon
						size="sm"
						variant="ghost"
						aria-label="Delete section"
						onClick={() => builder.removeSection(sectionId)}
					>
						<Trash2 />
					</Button>
				</div>
			</div>

			<MoveBreakDialog pending={pending} onClose={() => setPending(null)} />
		</>
	);
}
