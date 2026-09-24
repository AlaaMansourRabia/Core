import {cn} from "@corensystem/coren-utils";
import {Check, Copy} from "lucide-react";
import * as React from "react";

import {Button} from "./button";

export interface CopyButtonProps {
	/** String written to the clipboard when the button is clicked. */
	value: string;
	className?: string;
	/** aria-label override. Defaults to `Copy ${value}` (or "Copied" once active). */
	label?: string;
	/** How long the success state lasts before reverting. Defaults to 1500ms. */
	resetMs?: number;
}

const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
	({value, className, label, resetMs = 1500}, ref) => {
		const [copied, setCopied] = React.useState(false);

		const handleCopy = async () => {
			try {
				await navigator.clipboard.writeText(value);
				setCopied(true);
				setTimeout(() => setCopied(false), resetMs);
			} catch (err) {
				console.error("Failed to copy to clipboard", err);
			}
		};

		return (
			<Button
				ref={ref}
				type="button"
				variant="ghost"
				icon
				onClick={handleCopy}
				aria-label={label ?? (copied ? "Copied" : `Copy ${value}`)}
				className={cn("wwc:text-muted-foreground wwc:hover:text-foreground", className)}
			>
				{copied ? <Check className="wwc:h-4 wwc:w-4 wwc:text-green-600" /> : <Copy className="wwc:h-4 wwc:w-4" />}
			</Button>
		);
	},
);
CopyButton.displayName = "CopyButton";

export {CopyButton};
