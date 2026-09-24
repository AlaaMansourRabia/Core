import {cn} from "@corensystem/coren-utils";
import {format} from "date-fns";
import {ArrowUp, AtSign, Calendar as CalendarIcon, Flag, Plus} from "lucide-react";
import * as React from "react";

import {Button} from "./button";
import {Calendar} from "./calendar";
import {Popover, PopoverContent, PopoverTrigger} from "./popover";
import {Toggle} from "./toggle";

export interface InlineCommentComposerSubmit {
	text: string;
	flagged: boolean;
	date?: Date;
}

export interface InlineCommentComposerProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: (submission: InlineCommentComposerSubmit) => void;
	onCancel?: () => void;

	placeholder?: string;
	disabled?: boolean;
	autoFocus?: boolean;
	submitting?: boolean;

	flagged?: boolean;
	onFlaggedChange?: (flagged: boolean) => void;

	date?: Date;
	onDateChange?: (date: Date | undefined) => void;

	onAddImage?: (files: FileList) => void;
	acceptImageTypes?: string;

	onAddMention?: () => void;

	cancelLabel?: React.ReactNode;
	submitLabel?: React.ReactNode;

	minHeight?: number;
	maxHeight?: number;

	className?: string;
}

const LINE_HEIGHT = 22;
const PADDING_Y = 24;

/**
 * Inline comment composer for thread replies — rounded Card, auto-resizing Textarea,
 * left-aligned metadata actions (flag toggle, add image, date picker, mention),
 * right-aligned Cancel + Post primary icon button. Submits on Enter (Shift+Enter for newline).
 *
 * Modeled after PromptInput. Distinct from `CommentComposer` (rich-text Tiptap editor) —
 * use this for quick inline replies inside a `CommentThread`.
 */
export function InlineCommentComposer({
	value,
	onChange,
	onSubmit,
	onCancel,
	placeholder = "Write your comment...",
	disabled = false,
	autoFocus = false,
	submitting = false,
	flagged = false,
	onFlaggedChange,
	date,
	onDateChange,
	onAddImage,
	acceptImageTypes = "image/*",
	onAddMention,
	cancelLabel = "Cancel",
	submitLabel,
	minHeight = LINE_HEIGHT + PADDING_Y,
	maxHeight = LINE_HEIGHT * 8 + PADDING_Y,
	className,
}: InlineCommentComposerProps) {
	const textareaRef = React.useRef<HTMLTextAreaElement>(null);
	const fileInputRef = React.useRef<HTMLInputElement>(null);
	const [showScrollbar, setShowScrollbar] = React.useState(false);
	const [datePopoverOpen, setDatePopoverOpen] = React.useState(false);

	const isBusy = disabled || submitting;
	const canSubmit = !isBusy && value.trim().length > 0;

	const handleSubmit = () => {
		if (!canSubmit) return;
		onSubmit({text: value.trim(), flagged, date});
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		} else if (e.key === "Escape" && onCancel) {
			e.preventDefault();
			onCancel();
		}
	};

	React.useEffect(() => {
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = `${minHeight}px`;
		const next = Math.min(el.scrollHeight, maxHeight);
		el.style.height = `${next}px`;
		setShowScrollbar(el.scrollHeight > maxHeight);
	}, [value, minHeight, maxHeight]);

	React.useEffect(() => {
		if (autoFocus) textareaRef.current?.focus();
	}, [autoFocus]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0 && onAddImage) {
			onAddImage(e.target.files);
			e.target.value = "";
		}
	};

	return (
		<div
			className={cn(
				"wwc:flex wwc:w-full wwc:flex-col wwc:rounded-2xl wwc:border wwc:bg-card wwc:transition-shadow wwc:focus-within:ring-2 wwc:focus-within:ring-ring/30",
				isBusy && "wwc:opacity-60",
				className,
			)}
		>
			<textarea
				ref={textareaRef}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				disabled={isBusy}
				rows={1}
				className={cn(
					"wwc:w-full wwc:resize-none wwc:bg-transparent wwc:px-4 wwc:py-3 wwc:text-sm wwc:leading-[22px] wwc:text-foreground wwc:placeholder:text-muted-foreground wwc:focus:outline-none wwc:disabled:cursor-not-allowed",
					showScrollbar ? "wwc:overflow-y-auto" : "wwc:overflow-hidden",
				)}
				style={{minHeight: `${minHeight}px`, maxHeight: `${maxHeight}px`}}
			/>

			<div className="wwc:flex wwc:items-center wwc:gap-1 wwc:px-2 wwc:pb-2">
				{onFlaggedChange && (
					<Toggle
						pressed={flagged}
						onPressedChange={onFlaggedChange}
						disabled={isBusy}
						size="sm"
						variant="outline"
						aria-label="Flag as potential issue"
						className="wwc:gap-1.5 wwc:text-xs wwc:[&_svg]:size-4 wwc:[&_svg]:shrink-0"
					>
						<Flag />
						<span className="wwc:hidden wwc:sm:inline">{flagged ? "Flagged" : "Flag"}</span>
					</Toggle>
				)}

				{onAddImage && (
					<>
						<Button
							type="button"
							variant="ghost"
							icon
							disabled={isBusy}
							onClick={() => fileInputRef.current?.click()}
							aria-label="Add image"
						>
							<Plus />
						</Button>
						<input
							ref={fileInputRef}
							type="file"
							className="wwc:hidden"
							accept={acceptImageTypes}
							onChange={handleFileChange}
						/>
					</>
				)}

				{onDateChange && (
					<Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
						<PopoverTrigger asChild>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								disabled={isBusy}
								className="wwc:gap-1.5"
								aria-label={date ? `Date: ${format(date, "PPP")}` : "Assign date"}
							>
								<CalendarIcon />
								<span className="wwc:hidden wwc:sm:inline">{date ? format(date, "M/d/yy") : "Date"}</span>
							</Button>
						</PopoverTrigger>
						<PopoverContent align="start" className="wwc:w-auto wwc:p-0">
							<Calendar
								mode="single"
								selected={date}
								onSelect={(next) => {
									onDateChange(next);
									setDatePopoverOpen(false);
								}}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
				)}

				{onAddMention && (
					<Button type="button" variant="ghost" icon disabled={isBusy} onClick={onAddMention} aria-label="Mention">
						<AtSign />
					</Button>
				)}

				<span className="wwc:flex-1" />

				{onCancel && (
					<Button type="button" variant="ghost" size="sm" disabled={submitting} onClick={onCancel}>
						{cancelLabel}
					</Button>
				)}

				<Button type="button" icon onClick={handleSubmit} disabled={!canSubmit} aria-label="Post comment">
					{submitLabel ?? <ArrowUp />}
				</Button>
			</div>
		</div>
	);
}
