import {cn} from "@core/core-utils";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import {type VariantProps, cva} from "class-variance-authority";
import {ChevronDown} from "lucide-react";
import * as React from "react";

import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "./dropdown-menu";

type TabsVariant = "default" | "underline";
type TabsSize = "sm" | "md" | "lg";

const TabsStyleContext = React.createContext<{variant: TabsVariant; size: TabsSize}>({
	variant: "default",
	size: "md",
});

/** Tabbed navigation with composable trigger and content sub-components. */
const Tabs = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & {
		variant?: TabsVariant;
		size?: TabsSize;
	}
>(({variant = "default", size = "md", ...props}, ref) => {
	const ctx = React.useMemo(() => ({variant, size}), [variant, size]);
	return (
		<TabsStyleContext.Provider value={ctx}>
			<TabsPrimitive.Root ref={ref} {...props} />
		</TabsStyleContext.Provider>
	);
});
Tabs.displayName = "Tabs";

/* -----------------------------------------------------------------------------
 * TabsList
 * -------------------------------------------------------------------------- */

const tabsListVariants = cva("wwc:inline-flex wwc:items-center wwc:text-muted-foreground", {
	variants: {
		variant: {
			default: "wwc:justify-center wwc:rounded-lg wwc:bg-muted wwc:p-1",
			underline: "wwc:h-auto wwc:w-full wwc:justify-start wwc:border-b wwc:border-border wwc:bg-transparent wwc:p-0",
		},
		size: {
			sm: "",
			md: "",
			lg: "",
		},
	},
	compoundVariants: [
		{variant: "default", size: "sm", className: "wwc:h-8"},
		{variant: "default", size: "md", className: "wwc:h-9"},
		{variant: "default", size: "lg", className: "wwc:h-10"},
		{variant: "underline", size: "sm", className: "wwc:gap-4"},
		{variant: "underline", size: "md", className: "wwc:gap-6"},
		{variant: "underline", size: "lg", className: "wwc:gap-8"},
	],
	defaultVariants: {
		variant: "default",
		size: "md",
	},
});

const TabsList = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({className, ...props}, ref) => {
	const {variant, size} = React.useContext(TabsStyleContext);
	return <TabsPrimitive.List ref={ref} className={cn(tabsListVariants({variant, size}), className)} {...props} />;
});
TabsList.displayName = TabsPrimitive.List.displayName;

/* -----------------------------------------------------------------------------
 * TabsTrigger
 * -------------------------------------------------------------------------- */

const tabsTriggerVariants = cva(
	"wwc:inline-flex wwc:items-center wwc:justify-center wwc:whitespace-nowrap wwc:font-medium wwc:ring-offset-background wwc:transition-all wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring wwc:focus-visible:ring-offset-2 wwc:disabled:pointer-events-none wwc:disabled:opacity-50",
	{
		variants: {
			// Active state keys off `aria-selected`, NOT `data-[state=active]`. A trigger wrapped in
			// HoverTooltip gets Radix's tooltip `data-state` ("open"/"closed") merged over its own by
			// `asChild`, so data-state rules silently never match. aria-selected is set by Radix Tabs
			// and nothing overwrites it. Cues are redundant on purpose (surface + ring + weight +
			// color) so the state survives icon-only tabs, where there is no label to carry it.
			variant: {
				default:
					"wwc:rounded-md wwc:aria-selected:bg-card wwc:aria-selected:text-foreground wwc:aria-selected:font-semibold wwc:aria-selected:ring-1 wwc:aria-selected:ring-border wwc:aria-selected:shadow-(--shadow-surface)",
				underline:
					"wwc:-mb-px wwc:rounded-none wwc:border-b-2 wwc:border-transparent wwc:bg-transparent wwc:text-muted-foreground wwc:aria-selected:border-foreground wwc:aria-selected:text-foreground wwc:aria-selected:font-semibold",
			},
			display: {
				text: "wwc:px-3 wwc:py-1 wwc:text-sm wwc:gap-2",
				icon: "wwc:px-2.5 wwc:py-1.5",
				"icon-text": "wwc:px-3 wwc:py-1 wwc:text-sm wwc:gap-2",
			},
			size: {
				sm: "",
				md: "",
				lg: "",
			},
		},
		compoundVariants: [
			// Default rounded variant: size affects text size + padding
			{variant: "default", display: "text", size: "sm", className: "wwc:px-2.5 wwc:py-0.5 wwc:text-xs"},
			{variant: "default", display: "text", size: "lg", className: "wwc:px-4 wwc:py-1.5 wwc:text-base"},
			{variant: "default", display: "icon-text", size: "sm", className: "wwc:px-2.5 wwc:py-0.5 wwc:text-xs"},
			{variant: "default", display: "icon-text", size: "lg", className: "wwc:px-4 wwc:py-1.5 wwc:text-base"},
			{variant: "default", display: "icon", size: "sm", className: "wwc:px-2 wwc:py-1"},
			{variant: "default", display: "icon", size: "lg", className: "wwc:px-3 wwc:py-2"},
			// Underline + text/icon-text: padding + text-size scale with size
			{variant: "underline", display: "text", size: "sm", className: "wwc:px-1 wwc:py-2 wwc:text-sm"},
			{variant: "underline", display: "text", size: "md", className: "wwc:px-1 wwc:py-3 wwc:text-base"},
			{variant: "underline", display: "text", size: "lg", className: "wwc:px-1 wwc:py-4 wwc:text-lg"},
			{variant: "underline", display: "icon-text", size: "sm", className: "wwc:px-1 wwc:py-2 wwc:text-sm"},
			{variant: "underline", display: "icon-text", size: "md", className: "wwc:px-1 wwc:py-3 wwc:text-base"},
			{variant: "underline", display: "icon-text", size: "lg", className: "wwc:px-1 wwc:py-4 wwc:text-lg"},
			{variant: "underline", display: "icon", size: "sm", className: "wwc:px-1 wwc:py-2"},
			{variant: "underline", display: "icon", size: "md", className: "wwc:px-1 wwc:py-3"},
			{variant: "underline", display: "icon", size: "lg", className: "wwc:px-1 wwc:py-4"},
		],
		defaultVariants: {
			variant: "default",
			display: "text",
			size: "md",
		},
	},
);

interface TabsTriggerProps
	extends
		React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
		Omit<VariantProps<typeof tabsTriggerVariants>, "variant" | "size"> {}

const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, TabsTriggerProps>(
	({className, display, ...props}, ref) => {
		const {variant, size} = React.useContext(TabsStyleContext);
		return (
			<TabsPrimitive.Trigger
				ref={ref}
				className={cn(tabsTriggerVariants({variant, display, size}), className)}
				{...props}
			/>
		);
	},
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

/* -----------------------------------------------------------------------------
 * TabsContent
 * -------------------------------------------------------------------------- */

const TabsContent = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({className, ...props}, ref) => (
	<TabsPrimitive.Content
		ref={ref}
		className={cn(
			"wwc:mt-2 wwc:ring-offset-background wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring wwc:focus-visible:ring-offset-2",
			className,
		)}
		{...props}
	/>
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

/* -----------------------------------------------------------------------------
 * TabsDropdownTrigger
 * -------------------------------------------------------------------------- */

/** A single choice inside a {@link TabsDropdownTrigger}. */
export interface TabsDropdownItem {
	value: string;
	label: React.ReactNode;
}

interface TabsDropdownTriggerProps
	extends
		Omit<React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>, "onSelect">,
		Pick<VariantProps<typeof tabsTriggerVariants>, "display"> {
	/** The sub-views this tab pages between. */
	items: TabsDropdownItem[];
	/** Called with the chosen sub-item's value. Selecting also activates this tab. */
	onSelect?: (value: string) => void;
	/** The currently selected sub-item value (highlighted in the menu). */
	activeItem?: string;
}

/**
 * A tab trigger that opens a dropdown of sub-views. Clicking it activates the tab (like any
 * `TabsTrigger`) and opens the menu; it inherits the surrounding `Tabs` variant/size, so it sits
 * flush inside an `underline` tab row. Place it inside a `TabsList`.
 */
const TabsDropdownTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, TabsDropdownTriggerProps>(
	({className, children, items, onSelect, activeItem, display = "icon-text", ...props}, ref) => {
		const {variant, size} = React.useContext(TabsStyleContext);
		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<TabsPrimitive.Trigger
						ref={ref}
						className={cn(tabsTriggerVariants({variant, display, size}), "wwc:gap-1.5", className)}
						{...props}
					>
						{children}
						<ChevronDown className="wwc:size-3.5 wwc:opacity-60" aria-hidden="true" />
					</TabsPrimitive.Trigger>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start">
					{items.map((item) => (
						<DropdownMenuItem
							key={item.value}
							onSelect={() => onSelect?.(item.value)}
							className={cn(item.value === activeItem && "wwc:font-semibold wwc:text-foreground")}
						>
							{item.label}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		);
	},
);
TabsDropdownTrigger.displayName = "TabsDropdownTrigger";

export {Tabs, TabsList, TabsTrigger, TabsContent, TabsDropdownTrigger};
