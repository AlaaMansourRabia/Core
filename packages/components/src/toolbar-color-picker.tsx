import {cn} from "@corensystem/core-utils";
import {Check, ChevronDown, Pipette} from "lucide-react";
import * as React from "react";

import {Popover, PopoverContent, PopoverTrigger} from "./popover";
import {ToolbarButton} from "./toolbar";

/** A labeled group of swatches (e.g. "Theme colors", "Standard colors"). */
export interface ColorGroup {
	label?: string;
	colors: string[];
}

export interface ToolbarColorPickerProps {
	/** Selected color (controlled). Empty string `""` means "no fill". */
	value?: string;
	defaultValue?: string;
	onValueChange?: (color: string) => void;
	/** Swatch groups. Defaults to a standard-colors + grays palette. */
	groups?: ColorGroup[];
	/** Number of swatches per row. Default 10. */
	columns?: number;
	/** Show the "No fill" option (value becomes `""`). Default true. */
	allowNoColor?: boolean;
	/** Label for the no-fill option. Default "No fill". */
	noColorLabel?: string;
	/** Show the custom OS color picker ("More colors…"). Default true. */
	allowCustom?: boolean;
	/** Label for the custom-picker button. Default "More colors…". */
	customLabel?: string;
	/** Recently-used custom colors shown in their own row. */
	recentColors?: string[];
	/** Accessible label for the trigger. Default "Color". */
	label?: string;
	/** Optional glyph on the trigger. */
	icon?: React.ReactNode;
	/**
	 * How the current color previews next to `icon`. `"bar"` (default) shows it as a bar beneath the
	 * icon (PowerPoint style); `"swatch"` shows a square swatch to the right of the icon. Ignored
	 * when no `icon` is set (always a swatch).
	 */
	preview?: "bar" | "swatch";
	/** Popover alignment relative to the trigger. */
	align?: "start" | "center" | "end";
	/**
	 * Compact mode: the popover is swatches only — no group labels, no-fill/custom rendered as
	 * swatches (the custom swatch opens the OS picker), and no text.
	 */
	compact?: boolean;
	disabled?: boolean;
	className?: string;
}

const DEFAULT_GROUPS: ColorGroup[] = [
	{
		label: "Standard colors",
		colors: [
			"#C00000",
			"#FF0000",
			"#FFC000",
			"#FFFF00",
			"#92D050",
			"#00B050",
			"#00B0F0",
			"#0070C0",
			"#002060",
			"#7030A0",
		],
	},
	{
		label: "Grays",
		colors: ["#000000", "#404040", "#595959", "#7F7F7F", "#A6A6A6", "#BFBFBF", "#D9D9D9", "#F2F2F2", "#FFFFFF"],
	},
];

// White square with a red diagonal line — the "no fill" indicator.
const NO_FILL_STYLE: React.CSSProperties = {
	backgroundColor: "#ffffff",
	backgroundImage:
		"linear-gradient(to top right, transparent calc(50% - 0.75px), #ef4444 calc(50% - 0.75px), #ef4444 calc(50% + 0.75px), transparent calc(50% + 0.75px))",
};

// Color-wheel swatch that opens the OS picker in compact mode.
const CUSTOM_SWATCH_STYLE: React.CSSProperties = {
	background: "conic-gradient(from 0deg, #ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ef4444)",
};

// The EyeDropper API is only available in Chromium-based browsers.
interface EyeDropperResult {
	sRGBHex: string;
}
interface EyeDropperInstance {
	open: (options?: {signal?: AbortSignal}) => Promise<EyeDropperResult>;
}
type EyeDropperCtor = new () => EyeDropperInstance;
function getEyeDropper(): EyeDropperCtor | undefined {
	if (typeof window === "undefined") return undefined;
	return (window as unknown as {EyeDropper?: EyeDropperCtor}).EyeDropper;
}

function useControllable<T>(controlled: T | undefined, fallback: T, onChange?: (value: T) => void) {
	const [internal, setInternal] = React.useState<T>(fallback);
	const value = controlled !== undefined ? controlled : internal;
	const set = React.useCallback(
		(next: T) => {
			if (controlled === undefined) setInternal(next);
			onChange?.(next);
		},
		[controlled, onChange],
	);
	return [value, set] as const;
}

/** A small color square used in the grid and the trigger preview. */
function Swatch({
	color,
	selected,
	className,
	...props
}: {color: string; selected?: boolean} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
	const noFill = color === "";
	return (
		<button
			type="button"
			aria-pressed={selected}
			className={cn(
				"wwc:relative wwc:h-5 wwc:w-5 wwc:shrink-0 wwc:rounded-[var(--radius-control)] wwc:border wwc:border-border wwc:transition-shadow wwc:hover:ring-1 wwc:hover:ring-ring wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring",
				selected && "wwc:ring-2 wwc:ring-ring",
				className,
			)}
			style={noFill ? NO_FILL_STYLE : {backgroundColor: color}}
			{...props}
		>
			{selected && (
				<Check
					className={cn(
						"wwc:absolute wwc:inset-0 wwc:m-auto wwc:h-3 wwc:w-3",
						noFill ? "wwc:text-foreground" : "wwc:text-white wwc:mix-blend-difference",
					)}
				/>
			)}
		</button>
	);
}

const ToolbarColorPicker = React.forwardRef<HTMLButtonElement, ToolbarColorPickerProps>(
	(
		{
			value: valueProp,
			defaultValue = "#000000",
			onValueChange,
			groups = DEFAULT_GROUPS,
			columns = 10,
			allowNoColor = true,
			noColorLabel = "No fill",
			allowCustom = true,
			customLabel = "More colors…",
			recentColors,
			label = "Color",
			icon,
			preview = "bar",
			align = "start",
			compact = false,
			disabled,
			className,
		},
		ref,
	) => {
		const [value, setValue] = useControllable<string>(valueProp, defaultValue, onValueChange);
		const [recent, setRecent] = React.useState<string[]>(() => recentColors ?? []);
		const [open, setOpen] = React.useState(false);
		const customInputRef = React.useRef<HTMLInputElement>(null);
		// Resolve once on mount so we don't render the eyedropper on unsupported browsers.
		const [supportsEyeDropper, setSupportsEyeDropper] = React.useState(false);
		React.useEffect(() => setSupportsEyeDropper(getEyeDropper() !== undefined), []);

		// Grid/no-fill selection: apply and close.
		const pick = (color: string) => {
			setValue(color);
			setOpen(false);
		};
		// Custom picker: apply and remember, but keep the popover open to fine-tune.
		const pickCustom = (color: string) => {
			setValue(color);
			setRecent((prev) => [color, ...prev.filter((c) => c !== color)].slice(0, columns));
		};
		// Eyedropper: sample any pixel on screen, then apply like a custom color.
		const pickEyedropper = async () => {
			const Ctor = getEyeDropper();
			if (!Ctor) return;
			try {
				const {sRGBHex} = await new Ctor().open();
				pickCustom(sRGBHex);
			} catch {
				// User dismissed the eyedropper — nothing to do.
			}
		};

		const gridStyle: React.CSSProperties = {gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`};
		const customInputValue = value.startsWith("#") ? value : "#000000";
		const isNoFill = value === "";

		return (
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<ToolbarButton
						ref={ref}
						label={label}
						active={open}
						disabled={disabled}
						className={cn("wwc:gap-0.5 wwc:px-1.5", className)}
					>
						{icon && preview === "bar" ? (
							<span className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-0.5">
								{icon}
								<span
									className="wwc:h-1 wwc:w-4 wwc:rounded-[var(--radius-control)] wwc:border wwc:border-border"
									style={isNoFill ? NO_FILL_STYLE : {backgroundColor: value}}
								/>
							</span>
						) : (
							<>
								{icon}
								<span
									className="wwc:h-4 wwc:w-4 wwc:rounded-[var(--radius-control)] wwc:border wwc:border-border"
									style={isNoFill ? NO_FILL_STYLE : {backgroundColor: value}}
								/>
							</>
						)}
						<ChevronDown className="wwc:!h-3 wwc:!w-3 wwc:text-muted-foreground" />
					</ToolbarButton>
				</PopoverTrigger>
				<PopoverContent align={align} className="wwc:w-auto wwc:p-2">
					{compact ? (
						// Swatches only — no labels or text. No-fill and custom render as swatches.
						<div className="wwc:grid wwc:gap-1" style={gridStyle}>
							{allowNoColor && (
								<Swatch color="" selected={isNoFill} aria-label={noColorLabel} onClick={() => pick("")} />
							)}
							{groups
								.flatMap((group) => group.colors)
								.map((color) => (
									<Swatch
										key={color}
										color={color}
										selected={value.toLowerCase() === color.toLowerCase()}
										aria-label={color}
										onClick={() => pick(color)}
									/>
								))}
							{recent.map((color) => (
								<Swatch
									key={`recent-${color}`}
									color={color}
									selected={value.toLowerCase() === color.toLowerCase()}
									aria-label={color}
									onClick={() => pick(color)}
								/>
							))}
							{allowCustom && (
								<button
									type="button"
									aria-label={customLabel}
									onClick={() => customInputRef.current?.click()}
									className="wwc:h-5 wwc:w-5 wwc:shrink-0 wwc:rounded-[var(--radius-control)] wwc:border wwc:border-border wwc:transition-shadow wwc:hover:ring-1 wwc:hover:ring-ring wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring"
									style={CUSTOM_SWATCH_STYLE}
								/>
							)}
							{supportsEyeDropper && (
								<button
									type="button"
									aria-label="Pick a color from the screen"
									onClick={pickEyedropper}
									className="wwc:flex wwc:h-5 wwc:w-5 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-[var(--radius-control)] wwc:border wwc:border-border wwc:text-muted-foreground wwc:transition-colors wwc:hover:bg-accent wwc:hover:text-foreground wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring"
								>
									<Pipette className="wwc:h-3 wwc:w-3" />
								</button>
							)}
						</div>
					) : (
						<div className="wwc:space-y-2">
							{allowNoColor && (
								<button
									type="button"
									onClick={() => pick("")}
									className="wwc:flex wwc:w-full wwc:items-center wwc:gap-2 wwc:rounded-[var(--radius-control)] wwc:px-1 wwc:py-1 wwc:text-xs wwc:font-medium wwc:transition-colors wwc:hover:bg-accent wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring"
								>
									<span
										className="wwc:h-5 wwc:w-5 wwc:shrink-0 wwc:rounded-[var(--radius-control)] wwc:border wwc:border-border"
										style={NO_FILL_STYLE}
									/>
									{noColorLabel}
								</button>
							)}

							{groups.map((group, index) => (
								<div key={group.label ?? index} className="wwc:space-y-1">
									{group.label && (
										<p className="wwc:text-[10px] wwc:font-medium wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
											{group.label}
										</p>
									)}
									<div className="wwc:grid wwc:gap-1" style={gridStyle}>
										{group.colors.map((color) => (
											<Swatch
												key={color}
												color={color}
												selected={value.toLowerCase() === color.toLowerCase()}
												aria-label={color}
												onClick={() => pick(color)}
											/>
										))}
									</div>
								</div>
							))}

							{recent.length > 0 && (
								<div className="wwc:space-y-1">
									<p className="wwc:text-[10px] wwc:font-medium wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
										Recent
									</p>
									<div className="wwc:grid wwc:gap-1" style={gridStyle}>
										{recent.map((color) => (
											<Swatch
												key={color}
												color={color}
												selected={value.toLowerCase() === color.toLowerCase()}
												aria-label={color}
												onClick={() => pick(color)}
											/>
										))}
									</div>
								</div>
							)}

							{allowCustom && (
								<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:border-t wwc:border-border wwc:pt-2">
									<button
										type="button"
										onClick={() => customInputRef.current?.click()}
										className="wwc:flex wwc:items-center wwc:gap-2 wwc:rounded-[var(--radius-control)] wwc:px-1 wwc:py-1 wwc:text-xs wwc:font-medium wwc:transition-colors wwc:hover:bg-accent wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring"
									>
										<span
											className="wwc:h-5 wwc:w-5 wwc:shrink-0 wwc:rounded-[var(--radius-control)] wwc:border wwc:border-border"
											style={isNoFill ? NO_FILL_STYLE : {backgroundColor: value}}
										/>
										{customLabel}
									</button>
									{supportsEyeDropper && (
										<button
											type="button"
											aria-label="Pick a color from the screen"
											onClick={pickEyedropper}
											className="wwc:flex wwc:h-7 wwc:w-7 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-[var(--radius-control)] wwc:text-muted-foreground wwc:transition-colors wwc:hover:bg-accent wwc:hover:text-foreground wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring"
										>
											<Pipette className="wwc:h-4 wwc:w-4" />
										</button>
									)}
									<span className="wwc:ml-auto wwc:font-mono wwc:text-[11px] wwc:text-muted-foreground">
										{isNoFill ? noColorLabel : value.toUpperCase()}
									</span>
								</div>
							)}
						</div>
					)}

					{allowCustom && (
						<input
							ref={customInputRef}
							type="color"
							value={customInputValue}
							onChange={(e) => pickCustom(e.target.value)}
							tabIndex={-1}
							aria-hidden="true"
							className="wwc:pointer-events-none wwc:absolute wwc:h-0 wwc:w-0 wwc:opacity-0"
						/>
					)}
				</PopoverContent>
			</Popover>
		);
	},
);
ToolbarColorPicker.displayName = "ToolbarColorPicker";

export {ToolbarColorPicker};
