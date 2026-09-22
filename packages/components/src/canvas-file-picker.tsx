import {cn} from "@core/core-utils";
import {Check, ChevronsUpDown} from "lucide-react";
import * as React from "react";

import {Button} from "./button";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "./command";
import {Popover, PopoverContent, PopoverTrigger} from "./popover";
import {Select, SelectContent, SelectItem, SelectTrigger} from "./select";

export interface CanvasFile {
	id: string;
	name: string;
	disabled?: boolean;
}

export interface CanvasFilePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
	/** Files available for selection. */
	files: CanvasFile[];
	/** Currently active file id. */
	activeFileId: string;
	onFileChange?: (id: string) => void;
	/** Render as a searchable Combobox instead of a Select. */
	searchable?: boolean;
	/** Placeholder for the searchable input. */
	searchPlaceholder?: string;
	/** Trigger width in px. */
	triggerWidth?: number;
	/** Trailing chars kept visible during middle truncation. */
	tailChars?: number;
	/** Empty-state text for the searchable list. */
	emptyLabel?: string;
}

function MiddleTruncate({text, tail}: {text: string; tail: number}) {
	if (text.length <= tail) {
		return <div className="wwc:min-w-0 wwc:flex-1 wwc:truncate">{text}</div>;
	}
	const head = text.slice(0, -tail);
	const tailText = text.slice(-tail);
	return (
		<div className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:overflow-hidden">
			<span className="wwc:min-w-0 wwc:overflow-hidden wwc:text-ellipsis wwc:whitespace-pre">{head}</span>
			{/* `whitespace-pre` — see MiddleLabel in tree-row.tsx: a boundary space would collapse. */}
			<span className="wwc:shrink-0 wwc:whitespace-pre">{tailText}</span>
		</div>
	);
}

const CanvasFilePicker = React.forwardRef<HTMLDivElement, CanvasFilePickerProps>(
	(
		{
			className,
			files,
			activeFileId,
			onFileChange,
			searchable = false,
			searchPlaceholder = "Search files...",
			triggerWidth = 180,
			tailChars = 7,
			emptyLabel = "No file found.",
			...rest
		},
		ref,
	) => {
		const activeFile = files.find((f) => f.id === activeFileId);
		const triggerStyle = {width: triggerWidth};
		const [searchOpen, setSearchOpen] = React.useState(false);

		return (
			<div ref={ref} className={cn("wwc:flex wwc:items-center", className)} {...rest}>
				{searchable ? (
					<Popover open={searchOpen} onOpenChange={setSearchOpen}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								role="combobox"
								aria-expanded={searchOpen}
								className="wwc:h-9 wwc:gap-2 wwc:overflow-hidden wwc:font-medium"
								style={triggerStyle}
							>
								<MiddleTruncate text={activeFile?.name ?? ""} tail={tailChars} />
								<ChevronsUpDown className="wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent
							align="start"
							className="wwc:w-auto wwc:min-w-[var(--radix-popover-trigger-width)] wwc:max-w-[480px] wwc:p-0"
						>
							<Command>
								<CommandInput placeholder={searchPlaceholder} />
								<CommandList>
									<CommandEmpty>{emptyLabel}</CommandEmpty>
									<CommandGroup>
										{files.map((f) => (
											<CommandItem
												key={f.id}
												value={f.id}
												disabled={f.disabled}
												onSelect={(next) => {
													onFileChange?.(next);
													setSearchOpen(false);
												}}
											>
												<Check
													className={cn(
														"wwc:mr-2 wwc:h-4 wwc:w-4",
														f.id === activeFileId ? "wwc:opacity-100" : "wwc:opacity-0",
													)}
												/>
												{f.name}
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				) : (
					<Select value={activeFileId} onValueChange={onFileChange}>
						<SelectTrigger className="wwc:h-9 wwc:gap-2 wwc:overflow-hidden wwc:font-medium" style={triggerStyle}>
							<MiddleTruncate text={activeFile?.name ?? ""} tail={tailChars} />
						</SelectTrigger>
						<SelectContent className="wwc:w-auto wwc:max-w-[480px]">
							{files.map((f) => (
								<SelectItem key={f.id} value={f.id} disabled={f.disabled}>
									{f.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}
			</div>
		);
	},
);
CanvasFilePicker.displayName = "CanvasFilePicker";

export {CanvasFilePicker};
