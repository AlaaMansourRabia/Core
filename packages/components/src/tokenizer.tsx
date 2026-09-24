import {cn} from "@corensystem/coren-utils";
import {X} from "lucide-react";
import * as React from "react";

import {Badge} from "./badge";

export interface TokenizerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
	/** Current tokens */
	value?: string[];
	/** Callback when tokens change */
	onChange?: (tokens: string[]) => void;
	/** Placeholder text */
	placeholder?: string;
	/** Allow duplicates */
	allowDuplicates?: boolean;
	/** Custom validator for tokens */
	validator?: (token: string) => boolean;
	/** Separator keys (default: Enter, comma) */
	separators?: string[];
	/** Maximum number of tokens */
	max?: number;
}

/** A tag/chip input component for managing multiple values. */
const Tokenizer = React.forwardRef<HTMLInputElement, TokenizerProps>(
	(
		{
			className,
			value = [],
			onChange,
			placeholder = "Type and press Enter...",
			allowDuplicates = false,
			validator,
			separators = ["Enter", ","],
			max,
			disabled,
			...props
		},
		ref,
	) => {
		const [input, setInput] = React.useState("");
		const [tokens, setTokens] = React.useState<string[]>(value);
		const inputRef = React.useRef<HTMLInputElement>(null);

		React.useEffect(() => {
			setTokens(value);
		}, [value]);

		const addToken = (token: string) => {
			const trimmed = token.trim();
			if (!trimmed) return;

			if (max && tokens.length >= max) return;

			if (!allowDuplicates && tokens.includes(trimmed)) {
				setInput("");
				return;
			}

			if (validator && !validator(trimmed)) {
				setInput("");
				return;
			}

			const newTokens = [...tokens, trimmed];
			setTokens(newTokens);
			onChange?.(newTokens);
			setInput("");
		};

		const removeToken = (index: number) => {
			const newTokens = tokens.filter((_, i) => i !== index);
			setTokens(newTokens);
			onChange?.(newTokens);
		};

		const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (separators.includes(e.key)) {
				e.preventDefault();
				addToken(input);
			} else if (e.key === "Backspace" && !input && tokens.length > 0) {
				removeToken(tokens.length - 1);
			}
		};

		const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			// Handle comma separator while typing
			if (separators.includes(",") && value.endsWith(",")) {
				addToken(value.slice(0, -1));
			} else {
				setInput(value);
			}
		};

		const handleContainerClick = () => {
			inputRef.current?.focus();
		};

		return (
			<div
				className={cn(
					"wwc:flex wwc:flex-wrap wwc:gap-2 wwc:min-h-9 wwc:w-full wwc:rounded-md wwc:border wwc:border-input wwc:bg-transparent wwc:px-3 wwc:py-2 wwc:text-sm wwc:shadow-sm wwc:transition-colors wwc:focus-within:ring-1 wwc:focus-within:ring-ring",
					disabled && "wwc:opacity-50 wwc:cursor-not-allowed",
					className,
				)}
				onClick={handleContainerClick}
			>
				{tokens.map((token, index) => (
					<Badge key={index} variant="secondary" className="wwc:gap-1">
						{token}
						{!disabled && (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									removeToken(index);
								}}
								className="wwc:ml-1 wwc:rounded-full wwc:hover:bg-muted"
							>
								<X className="wwc:h-3 wwc:w-3" />
							</button>
						)}
					</Badge>
				))}
				<input
					ref={(node) => {
						if (typeof ref === "function") {
							ref(node);
						} else if (ref) {
							ref.current = node;
						}
						// @ts-ignore
						inputRef.current = node;
					}}
					type="text"
					value={input}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					placeholder={tokens.length === 0 ? placeholder : ""}
					disabled={disabled || (max !== undefined && tokens.length >= max)}
					className="wwc:flex-1 wwc:min-w-[120px] wwc:bg-transparent wwc:outline-none wwc:placeholder:text-muted-foreground"
					{...props}
				/>
			</div>
		);
	},
);
Tokenizer.displayName = "Tokenizer";

export {Tokenizer};
