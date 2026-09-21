import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import {EditorContent, useEditor, type Editor} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {cn} from "@core/core-utils";
import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	Bold,
	Code,
	Image as ImageIcon,
	Italic,
	List,
	ListChecks,
	ListOrdered,
	Quote,
	Strikethrough,
	Underline as UnderlineIcon,
} from "lucide-react";
import * as React from "react";

import {Button} from "./button";

export type CommentToolbarAction =
	| "bold"
	| "italic"
	| "underline"
	| "strikethrough"
	| "align-left"
	| "align-center"
	| "align-right"
	| "list-bulleted"
	| "list-numbered"
	| "list-checklist"
	| "quote"
	| "code"
	| "image";

const DEFAULT_ACTIONS: CommentToolbarAction[] = [
	"bold",
	"italic",
	"underline",
	"strikethrough",
	"align-left",
	"align-center",
	"align-right",
	"list-bulleted",
	"list-numbered",
	"list-checklist",
	"quote",
	"code",
	"image",
];

interface ToolbarMeta {
	label: string;
	Icon: React.ComponentType<{className?: string}>;
	group: number;
	apply: (editor: Editor) => void;
	isActive: (editor: Editor) => boolean;
}

const TOOLBAR_META: Record<CommentToolbarAction, ToolbarMeta> = {
	bold: {
		label: "Bold",
		Icon: Bold,
		group: 0,
		apply: (e) => e.chain().focus().toggleBold().run(),
		isActive: (e) => e.isActive("bold"),
	},
	italic: {
		label: "Italic",
		Icon: Italic,
		group: 0,
		apply: (e) => e.chain().focus().toggleItalic().run(),
		isActive: (e) => e.isActive("italic"),
	},
	underline: {
		label: "Underline",
		Icon: UnderlineIcon,
		group: 0,
		apply: (e) => e.chain().focus().toggleUnderline().run(),
		isActive: (e) => e.isActive("underline"),
	},
	strikethrough: {
		label: "Strikethrough",
		Icon: Strikethrough,
		group: 0,
		apply: (e) => e.chain().focus().toggleStrike().run(),
		isActive: (e) => e.isActive("strike"),
	},
	"align-left": {
		label: "Align left",
		Icon: AlignLeft,
		group: 1,
		apply: (e) => e.chain().focus().setTextAlign("left").run(),
		isActive: (e) => e.isActive({textAlign: "left"}),
	},
	"align-center": {
		label: "Align center",
		Icon: AlignCenter,
		group: 1,
		apply: (e) => e.chain().focus().setTextAlign("center").run(),
		isActive: (e) => e.isActive({textAlign: "center"}),
	},
	"align-right": {
		label: "Align right",
		Icon: AlignRight,
		group: 1,
		apply: (e) => e.chain().focus().setTextAlign("right").run(),
		isActive: (e) => e.isActive({textAlign: "right"}),
	},
	"list-bulleted": {
		label: "Bulleted list",
		Icon: List,
		group: 2,
		apply: (e) => e.chain().focus().toggleBulletList().run(),
		isActive: (e) => e.isActive("bulletList"),
	},
	"list-numbered": {
		label: "Numbered list",
		Icon: ListOrdered,
		group: 2,
		apply: (e) => e.chain().focus().toggleOrderedList().run(),
		isActive: (e) => e.isActive("orderedList"),
	},
	"list-checklist": {
		label: "Checklist",
		Icon: ListChecks,
		group: 2,
		apply: (e) => e.chain().focus().toggleTaskList().run(),
		isActive: (e) => e.isActive("taskList"),
	},
	quote: {
		label: "Quote",
		Icon: Quote,
		group: 3,
		apply: (e) => e.chain().focus().toggleBlockquote().run(),
		isActive: (e) => e.isActive("blockquote"),
	},
	code: {
		label: "Code block",
		Icon: Code,
		group: 3,
		apply: (e) => e.chain().focus().toggleCodeBlock().run(),
		isActive: (e) => e.isActive("codeBlock"),
	},
	image: {
		label: "Insert image",
		Icon: ImageIcon,
		group: 4,
		apply: (e) => {
			const url = window.prompt("Image URL");
			if (url) e.chain().focus().setImage({src: url}).run();
		},
		isActive: () => false,
	},
};

export interface CommentComposerProps {
	/** Controlled HTML value of the editor. Pair with onChange. */
	value?: string;
	/** Uncontrolled initial HTML value. */
	defaultValue?: string;
	/** Fires on every editor update with the current HTML. */
	onChange?: (html: string) => void;
	/** Fires when the submit button is clicked or the user presses Cmd/Ctrl+Enter. Receives the editor HTML. */
	onSubmit?: (html: string) => void;
	/** Optional instrumentation hook fired in addition to applying the formatting command. */
	onToolbarAction?: (action: CommentToolbarAction) => void;

	placeholder?: string;
	/** Label shown on the submit button. Defaults to "Comment". */
	submitLabel?: string;
	/** Initial visible height (rem). Defaults to 4. */
	minHeight?: string;

	/** Restrict the toolbar to this subset (in this order). Defaults to all actions. */
	toolbarActions?: CommentToolbarAction[];

	disabled?: boolean;
	/** When true, the submit button shows the loading state and is disabled. */
	isSubmitting?: boolean;
	/** Class name applied to the outer container. */
	className?: string;
}

function groupActions(actions: CommentToolbarAction[]): CommentToolbarAction[][] {
	const groups: Record<number, CommentToolbarAction[]> = {};
	for (const a of actions) {
		const g = TOOLBAR_META[a].group;
		(groups[g] ||= []).push(a);
	}
	return Object.keys(groups)
		.map((k) => Number(k))
		.sort((a, b) => a - b)
		.map((k) => groups[k]);
}

function isEditorEmpty(editor: Editor | null): boolean {
	if (!editor) return true;
	return editor.getText().trim().length === 0;
}

export function CommentComposer({
	value,
	defaultValue,
	onChange,
	onSubmit,
	onToolbarAction,
	placeholder = "Add comment",
	submitLabel = "Comment",
	minHeight = "4rem",
	toolbarActions = DEFAULT_ACTIONS,
	disabled,
	isSubmitting,
	className,
}: CommentComposerProps) {
	const isControlled = value !== undefined;
	// Force re-render whenever the editor's internal state changes (for active-state styling on toolbar buttons).
	const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				codeBlock: {HTMLAttributes: {class: "wwc:rounded wwc:bg-muted wwc:p-3 wwc:font-mono wwc:text-xs"}},
				blockquote: {
					HTMLAttributes: {class: "wwc:border-l-2 wwc:border-border wwc:pl-3 wwc:italic wwc:text-muted-foreground"},
				},
				bulletList: {HTMLAttributes: {class: "wwc:list-disc wwc:pl-5"}},
				orderedList: {HTMLAttributes: {class: "wwc:list-decimal wwc:pl-5"}},
			}),
			Underline,
			TextAlign.configure({types: ["heading", "paragraph"]}),
			TaskList.configure({HTMLAttributes: {class: "wwc:flex wwc:flex-col wwc:gap-1 wwc:pl-1 wwc:list-none"}}),
			TaskItem.configure({
				nested: true,
				HTMLAttributes: {class: "wwc:flex wwc:items-start wwc:gap-2 [&>label>input]:wwc:mt-1"},
			}),
			Image.configure({HTMLAttributes: {class: "wwc:rounded wwc:max-w-full"}}),
			Placeholder.configure({placeholder}),
		],
		content: isControlled ? value || "" : defaultValue || "",
		editable: !disabled && !isSubmitting,
		editorProps: {
			attributes: {
				class:
					"wwc:min-h-[var(--wwc-cc-min-h)] wwc:w-full wwc:bg-transparent wwc:px-3 wwc:py-2.5 wwc:text-sm wwc:text-foreground wwc:outline-none [&_p.is-editor-empty:first-child]:wwc:text-muted-foreground [&_p.is-editor-empty:first-child]:wwc:before:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child]:wwc:before:float-left [&_p.is-editor-empty:first-child]:wwc:before:h-0 [&_p.is-editor-empty:first-child]:wwc:before:pointer-events-none",
			},
			handleKeyDown(_view, event) {
				if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
					event.preventDefault();
					handleSubmit();
					return true;
				}
				return false;
			},
		},
		onUpdate: ({editor}) => {
			onChange?.(editor.getHTML());
		},
		onSelectionUpdate: () => forceUpdate(),
		onTransaction: () => forceUpdate(),
	});

	// Sync external value changes into the editor (controlled mode).
	React.useEffect(() => {
		if (!editor || !isControlled) return;
		const current = editor.getHTML();
		if (value !== current && value !== undefined) {
			editor.commands.setContent(value, {emitUpdate: false});
		}
	}, [editor, isControlled, value]);

	// Sync editable toggle.
	React.useEffect(() => {
		if (!editor) return;
		editor.setEditable(!disabled && !isSubmitting);
	}, [editor, disabled, isSubmitting]);

	const handleSubmit = React.useCallback(() => {
		if (!editor || isEditorEmpty(editor) || disabled || isSubmitting) return;
		onSubmit?.(editor.getHTML());
		if (!isControlled) editor.commands.clearContent();
	}, [editor, disabled, isSubmitting, isControlled, onSubmit]);

	const groups = React.useMemo(() => groupActions(toolbarActions), [toolbarActions]);
	const canSubmit = !!editor && !isEditorEmpty(editor) && !disabled && !isSubmitting;

	return (
		<div
			style={{["--wwc-cc-min-h" as string]: minHeight}}
			className={cn(
				"wwc:flex wwc:flex-col wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:focus-within:border-ring wwc:focus-within:ring-1 wwc:focus-within:ring-ring",
				className,
			)}
		>
			<EditorContent editor={editor} />

			<div className="wwc:flex wwc:items-center wwc:gap-1 wwc:border-t wwc:border-border wwc:bg-muted/40 wwc:px-1.5 wwc:py-1">
				{groups.map((group, gi) => (
					<React.Fragment key={gi}>
						{gi > 0 && <span aria-hidden="true" className="wwc:mx-1 wwc:h-5 wwc:w-px wwc:bg-border" />}
						{group.map((action) => {
							const meta = TOOLBAR_META[action];
							const Icon = meta.Icon;
							const active = editor ? meta.isActive(editor) : false;
							return (
								<Button
									key={action}
									type="button"
									variant="ghost"
									icon
									className={cn(
										"wwc:h-7 wwc:w-7",
										active
											? "wwc:bg-accent wwc:text-accent-foreground"
											: "wwc:text-muted-foreground wwc:hover:text-foreground",
									)}
									aria-label={meta.label}
									aria-pressed={active}
									title={meta.label}
									disabled={disabled || isSubmitting || !editor}
									onClick={() => {
										if (!editor) return;
										meta.apply(editor);
										onToolbarAction?.(action);
									}}
								>
									<Icon className="wwc:h-3.5 wwc:w-3.5" />
								</Button>
							);
						})}
					</React.Fragment>
				))}

				<div className="wwc:flex-1" />

				<Button type="button" size="sm" className="wwc:h-7" disabled={!canSubmit} onClick={handleSubmit}>
					{isSubmitting ? "Posting..." : submitLabel}
				</Button>
			</div>
		</div>
	);
}
