import {Send, Square} from "lucide-react";
import {useEffect, useRef, useState} from "react";

import {Button} from "../button";

interface ChatInputProps {
	onSend: (message: string) => void;
	disabled?: boolean;
	placeholder?: string;
}

export function ChatInput({onSend, disabled = false, placeholder = "Ask about your data..."}: ChatInputProps) {
	const [value, setValue] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const handleSubmit = () => {
		const trimmed = value.trim();
		if (!trimmed || disabled) return;

		onSend(trimmed);
		setValue("");

		// Reset textarea height
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	// Auto-resize textarea up to 3 rows, then scroll
	const LINE_HEIGHT = 21; // approx line height for wwc:text-sm
	const PADDING = 20; // py-2.5 = 10px top + 10px bottom
	const MIN_HEIGHT = LINE_HEIGHT + PADDING; // 1 row
	const MAX_HEIGHT = LINE_HEIGHT * 3 + PADDING; // 3 rows (~83px)

	const [showScrollbar, setShowScrollbar] = useState(false);

	useEffect(() => {
		if (textareaRef.current) {
			// Reset to min height first to get accurate scrollHeight
			textareaRef.current.style.height = `${MIN_HEIGHT}px`;
			const scrollHeight = textareaRef.current.scrollHeight;
			// Calculate new height, capped at 3 rows
			const newHeight = Math.min(scrollHeight, MAX_HEIGHT);
			textareaRef.current.style.height = `${newHeight}px`;
			// Only show scrollbar when content exceeds 3 rows
			setShowScrollbar(scrollHeight > MAX_HEIGHT);
		}
	}, [value]);

	// Focus on mount
	useEffect(() => {
		textareaRef.current?.focus();
	}, []);

	return (
		<div
			className="wwc:flex wwc:items-end wwc:gap-2 wwc:p-3 wwc:border-t wwc:bg-card"
			aria-busy={disabled || undefined}
		>
			<textarea
				ref={textareaRef}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				rows={1}
				className={`wwc:flex-1 wwc:resize-none wwc:rounded-xl wwc:border wwc:bg-muted/50 wwc:px-4 wwc:py-2.5 wwc:text-sm wwc:leading-[21px] wwc:focus:outline-none wwc:focus:ring-2 wwc:focus:ring-primary/50 wwc:placeholder:text-muted-foreground ${showScrollbar ? "wwc:overflow-y-auto" : "wwc:overflow-hidden"}`}
				style={{minHeight: "41px", maxHeight: "83px"}}
			/>
			<Button
				icon
				size="sm"
				onClick={handleSubmit}
				disabled={disabled || !value.trim()}
				aria-label={disabled ? "Generating response" : "Send"}
				className="wwc:shrink-0 wwc:rounded-lg wwc:mb-1"
			>
				{disabled ? <Square className="wwc:!size-3 wwc:fill-current" /> : <Send />}
			</Button>
		</div>
	);
}
