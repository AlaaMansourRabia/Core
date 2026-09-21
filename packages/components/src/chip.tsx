import * as TogglePrimitive from "@radix-ui/react-toggle";
import {cn} from "@wakecap/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import {Check, FileText, X} from "lucide-react";
import * as React from "react";

import {HoverCard, HoverCardContent, HoverCardTrigger} from "./hover-card";

const chipVariants = cva(
	"wwc:inline-flex wwc:items-center wwc:gap-1.5 wwc:font-medium wwc:transition-colors wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring wwc:focus-visible:ring-offset-2 wwc:disabled:pointer-events-none wwc:disabled:opacity-50",
	{
		variants: {
			variant: {
				/** Toggleable filter chip — selected has muted fill + slightly darker border; unselected has white bg + lighter border. */
				filter:
					"wwc:rounded-md wwc:border wwc:text-foreground wwc:data-[state=on]:bg-muted/50 wwc:data-[state=on]:border-muted-foreground/40 wwc:data-[state=on]:hover:bg-muted wwc:data-[state=off]:bg-background wwc:data-[state=off]:border-border/40 wwc:data-[state=off]:hover:bg-accent",
				/** Static attachment chip — square-rounded with muted bg, used to display attached files / context items. */
				attachment: "wwc:rounded-md wwc:border wwc:bg-muted/50 wwc:text-foreground",
			},
			size: {
				sm: "wwc:h-6 wwc:px-2 wwc:text-xs",
				default: "wwc:h-7 wwc:px-2.5 wwc:text-xs",
				lg: "wwc:h-8 wwc:px-3 wwc:text-sm",
			},
		},
		defaultVariants: {
			variant: "filter",
			size: "default",
		},
	},
);

type FilterChipProps = React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
	VariantProps<typeof chipVariants> & {
		variant?: "filter";
		/** Show a checkmark icon when selected. Defaults to true. */
		showCheck?: boolean;
		/** Optional leading icon. When provided, replaces the default checkmark. */
		leadingIcon?: React.ReactNode;
		/** Optional trailing icon. */
		trailingIcon?: React.ReactNode;
	};

/** Preview content shown when the user hovers over an attachment chip. */
export type AttachmentPreview =
	| {
			type: "image";
			/** Image URL or data URI. */
			src: string;
			/** Optional alt text. */
			alt?: string;
	  }
	| {
			type: "custom";
			/** Custom preview node (e.g. a code snippet, document excerpt). */
			content: React.ReactNode;
	  };

type AttachmentChipProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> &
	VariantProps<typeof chipVariants> & {
		variant: "attachment";
		/** Optional leading icon, displayed before the label. */
		leadingIcon?: React.ReactNode;
		/** Called when the user clicks the trailing X. When provided, a remove button is rendered. */
		onRemove?: () => void;
		/** Accessible label for the remove button. */
		removeLabel?: string;
		/** Disable the chip. */
		disabled?: boolean;
		children?: React.ReactNode;
		/** Hover preview content. When provided, hovering the chip shows a fixed-size preview card above. */
		preview?: AttachmentPreview;
		/** Caption shown under the preview content. Defaults to the chip's label (children). */
		previewCaption?: React.ReactNode;
	};

export type ChipProps = FilterChipProps | AttachmentChipProps;

/**
 * Chip primitive with two visual variants:
 * - `filter` (default): pill-shaped toggleable chip for filtering/selection
 * - `attachment`: square-rounded static chip for displaying attached files/context, with optional remove
 */
const AttachmentChip = React.forwardRef<HTMLSpanElement, AttachmentChipProps>((props, ref) => {
	const {
		className,
		size,
		leadingIcon,
		onRemove,
		removeLabel,
		disabled,
		children,
		preview,
		previewCaption,
		variant: _variant,
		...rest
	} = props;
	void _variant;

	const chip = (
		<span
			ref={ref}
			className={cn(
				chipVariants({variant: "attachment", size}),
				disabled && "wwc:pointer-events-none wwc:opacity-50",
				className,
			)}
			{...rest}
		>
			{leadingIcon && <span className="wwc:text-muted-foreground">{leadingIcon}</span>}
			<span className="wwc:max-w-[200px] wwc:truncate">{children}</span>
			{onRemove && (
				<button
					type="button"
					onClick={onRemove}
					aria-label={removeLabel ?? "Remove"}
					disabled={disabled}
					className="wwc:ml-0.5 wwc:rounded-sm wwc:text-muted-foreground wwc:transition-colors wwc:hover:text-foreground wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring"
				>
					<X className="wwc:h-3 wwc:w-3" />
				</button>
			)}
		</span>
	);

	if (!preview || disabled) return chip;

	return (
		<HoverCard openDelay={150} closeDelay={100}>
			<HoverCardTrigger asChild>{chip}</HoverCardTrigger>
			<HoverCardContent side="top" align="start" sideOffset={6} className="wwc:w-56 wwc:p-2">
				<div className="wwc:flex wwc:h-32 wwc:w-full wwc:items-center wwc:justify-center wwc:overflow-hidden wwc:rounded-md wwc:bg-muted">
					{preview.type === "image" ? (
						<img
							src={preview.src}
							alt={preview.alt ?? (typeof children === "string" ? children : "Attachment preview")}
							className="wwc:h-full wwc:w-full wwc:object-cover"
						/>
					) : (
						<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:overflow-hidden wwc:p-2 wwc:text-xs wwc:text-muted-foreground">
							{preview.content ?? <FileText className="wwc:h-8 wwc:w-8" />}
						</div>
					)}
				</div>
				<div className="wwc:mt-2 wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-xs">
					{leadingIcon && <span className="wwc:shrink-0 wwc:text-muted-foreground">{leadingIcon}</span>}
					<span className="wwc:truncate wwc:font-medium wwc:text-foreground">{previewCaption ?? children}</span>
				</div>
			</HoverCardContent>
		</HoverCard>
	);
});
AttachmentChip.displayName = "AttachmentChip";

const FilterChip = React.forwardRef<React.ElementRef<typeof TogglePrimitive.Root>, FilterChipProps>((props, ref) => {
	const {
		className,
		size,
		showCheck = true,
		leadingIcon,
		trailingIcon,
		children,
		pressed,
		defaultPressed,
		onPressedChange,
		variant: _variant,
		...rest
	} = props;
	void _variant;

	const isControlled = pressed !== undefined;
	const [internalPressed, setInternalPressed] = React.useState(defaultPressed ?? false);
	const isPressed = isControlled ? pressed : internalPressed;

	const handlePressedChange = (next: boolean) => {
		if (!isControlled) setInternalPressed(next);
		onPressedChange?.(next);
	};

	const resolvedLeading = leadingIcon ?? (showCheck && isPressed ? <Check className="wwc:h-3.5 wwc:w-3.5" /> : null);

	return (
		<TogglePrimitive.Root
			ref={ref}
			pressed={isPressed}
			onPressedChange={handlePressedChange}
			className={cn(chipVariants({variant: "filter", size}), className)}
			{...rest}
		>
			{resolvedLeading}
			{children}
			{trailingIcon}
		</TogglePrimitive.Root>
	);
});
FilterChip.displayName = "FilterChip";

/**
 * A compact pill-shaped element with two variants: a toggleable `filter` chip with a checkmark,
 * and a static `attachment` chip for displaying selected files or context items.
 */
const Chip = React.forwardRef<HTMLElement, ChipProps>((props, ref) => {
	if (props.variant === "attachment") {
		return <AttachmentChip ref={ref as React.Ref<HTMLSpanElement>} {...props} />;
	}
	return <FilterChip ref={ref as React.Ref<React.ElementRef<typeof TogglePrimitive.Root>>} {...props} />;
});
Chip.displayName = "Chip";

export {Chip, chipVariants};
