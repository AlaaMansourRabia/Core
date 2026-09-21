import * as DialogPrimitive from "@radix-ui/react-dialog";
import {cn} from "@core/core-utils";
import {X} from "lucide-react";
import * as React from "react";

/** A window overlaid on the primary window or another dialog, rendering content in a portal. */
function Dialog(props: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) {
	return <DialogPrimitive.Root {...props} />;
}
const DialogTrigger: typeof DialogPrimitive.Trigger = DialogPrimitive.Trigger;
const DialogPortal: typeof DialogPrimitive.Portal = DialogPrimitive.Portal;
const DialogClose: typeof DialogPrimitive.Close = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({className, ...props}, ref) => (
	<DialogPrimitive.Overlay
		ref={ref}
		className={cn(
			// Blur plus a moderate shade: the blur keeps the page readable as context, while the tint
			// gives the dialog enough separation to read as a layer above it.
			"wwc:fixed wwc:inset-0 wwc:z-50 wwc:bg-black/40 wwc:backdrop-blur-sm wwc:data-[state=open]:animate-in wwc:data-[state=closed]:animate-out wwc:data-[state=closed]:fade-out-0 wwc:data-[state=open]:fade-in-0",
			className,
		)}
		{...props}
	/>
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

/**
 * How a dialog is laid out. It is ONE decision, not three, which is why it lives on
 * {@link DialogContent} and reaches the header, the footer, the close button and the body padding
 * through context rather than asking a call site to keep three props in agreement.
 *
 * - `"banded"` (default) — the header and footer are 40px `bg-muted` strips, deliberately identical
 *   to `WidgetCardHeader` (charts) and `TableHeader` (tables), so a modal reads as the same kind of
 *   object as every other panel in the system. The close button centres in the header band and the
 *   body supplies its own padding.
 * - `"stacked"` — the pre-0.3 header: title over description, no band, no rule, the close button
 *   inset, and the content padded as a whole. Lighter, and right for a short dialog that is a
 *   sentence and two buttons rather than a panel.
 *
 * `"banded"` stays the default because the band is a SYSTEM decision, not a dialog one — flipping it
 * would leave dialogs as the only unbanded header in 0.13 — but the choice is one prop, and issue
 * #248 is the argument for making it per-dialog rather than for the library picking one and
 * overriding the other.
 */
export type DialogVariant = "banded" | "stacked";

/**
 * Read by DialogHeader and DialogFooter so the three pieces cannot disagree about which layout the
 * dialog is in. Defaults to `"banded"` for a header rendered outside a DialogContent.
 */
const DialogVariantContext = React.createContext<DialogVariant>("banded");

/**
 * The DialogContent element, published so a portalled overlay rendered inside this dialog can put
 * itself back inside it. See {@link useDialogContainer}.
 */
const DialogContainerContext = React.createContext<HTMLElement | null>(null);

/**
 * The enclosing {@link DialogContent} element, or `null` outside a dialog.
 *
 * A modal dialog sets `pointer-events: none` on `<body>` and grants `auto` back only to the layers
 * it knows about. An overlay portalled to `document.body` — a Popover, and so a `Combobox` or
 * `DatePicker` — is one of those layers, so this normally resolves itself. It does NOT when the host
 * app has a SECOND copy of `@radix-ui/react-dismissable-layer` (its own `@radix-ui/react-popover`
 * beside core-ui's, say): the two copies keep separate layer stacks, the dialog never grants the
 * popover `pointer-events: auto`, and every click inside the popover lands on the overlay instead —
 * which reads as an outside interaction and dismisses it. Issue #294.
 *
 * Portalling into the dialog sidesteps the whole negotiation: the popover is then a DOM descendant
 * of an element that already has `pointer-events: auto`, and it sits inside the dialog's focus scope
 * rather than fighting it. `PopoverContent` does this automatically; reach for the hook directly
 * only to pass a container to something that is not built on our Popover.
 *
 * ```tsx
 * const container = useDialogContainer();
 * <SomeThirdPartyPopover container={container} />
 * ```
 */
function useDialogContainer(): HTMLElement | null {
	return React.useContext(DialogContainerContext);
}

export interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
	/** Banded (default) or stacked. See {@link DialogVariant}. */
	variant?: DialogVariant;
	/**
	 * Where the close button sits. `"band"` centres it in the 40px DialogHeader band; `"padded"` insets
	 * it. Defaults to whatever `variant` implies, so it only needs setting for the rare dialog that
	 * wants the band's chrome without its header, or the reverse.
	 */
	closeAlign?: "padded" | "band";
}

const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DialogContentProps>(
	({className, children, variant = "banded", closeAlign, ...props}, ref) => {
		const banded = variant === "banded";
		const align = closeAlign ?? (banded ? "band" : "padded");
		// State, not a ref: a popover portalling into this node has to re-render once the node exists.
		const [container, setContainer] = React.useState<HTMLElement | null>(null);
		const composedRef = React.useCallback(
			(node: React.ElementRef<typeof DialogPrimitive.Content> | null) => {
				setContainer(node);
				if (typeof ref === "function") ref(node);
				else if (ref) ref.current = node;
			},
			[ref],
		);
		return (
			<DialogPortal>
				<DialogOverlay />
				<DialogPrimitive.Content
					ref={composedRef}
					className={cn(
						"wwc:fixed wwc:left-[50%] wwc:top-[50%] wwc:z-50 wwc:grid wwc:w-full wwc:max-w-lg wwc:translate-x-[-50%] wwc:translate-y-[-50%] wwc:border wwc:bg-card wwc:text-card-foreground wwc:shadow-lg wwc:duration-200 wwc:data-[state=open]:animate-in wwc:data-[state=closed]:animate-out wwc:data-[state=closed]:fade-out-0 wwc:data-[state=open]:fade-in-0 wwc:data-[state=closed]:zoom-out-95 wwc:data-[state=open]:zoom-in-95 wwc:data-[state=closed]:slide-out-to-left-1/2 wwc:data-[state=closed]:slide-out-to-top-[48%] wwc:data-[state=open]:slide-in-from-left-1/2 wwc:data-[state=open]:slide-in-from-top-[48%] wwc:sm:rounded-lg",
						// Banded dialogs are edge-to-edge: the strips carry their own padding and a gap
						// between them would break the rules they draw. A stacked one is a padded block.
						banded ? "wwc:gap-0 wwc:p-0" : "wwc:gap-4 wwc:p-6",
						className,
					)}
					{...props}
				>
					<DialogContainerContext.Provider value={container}>
						<DialogVariantContext.Provider value={variant}>{children}</DialogVariantContext.Provider>
					</DialogContainerContext.Provider>
					<DialogPrimitive.Close
						className={cn(
							"wwc:absolute wwc:rounded-sm wwc:opacity-70 wwc:ring-offset-background wwc:transition-opacity wwc:hover:opacity-100 wwc:focus:outline-none wwc:focus:ring-2 wwc:focus:ring-ring wwc:focus:ring-offset-2 wwc:disabled:pointer-events-none wwc:data-[state=open]:bg-accent wwc:data-[state=open]:text-muted-foreground",
							align === "band"
								? // Fills the band's height so the icon centres on the title, whatever the band contains.
									"wwc:right-0 wwc:top-0 wwc:flex wwc:h-10 wwc:w-10 wwc:items-center wwc:justify-center"
								: "wwc:right-4 wwc:top-4",
						)}
					>
						<X className="wwc:h-4 wwc:w-4" />
						<span className="wwc:sr-only">Close</span>
					</DialogPrimitive.Close>
				</DialogPrimitive.Content>
			</DialogPortal>
		);
	},
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Overrides the layout the enclosing {@link DialogContent} declared. Rarely needed. */
	variant?: DialogVariant;
}

/**
 * The dialog's header.
 *
 * `banded` is the 40px `bg-muted` strip, deliberately identical to `WidgetCardHeader` (charts) and
 * `TableHeader` (tables) so a modal header reads as the same object as every other header in the
 * system; `pr-10` reserves the close button's 40px square. `stacked` is the pre-0.3 header — title
 * over description, no band, no rule — restored under {@link DialogVariant} rather than as a
 * consumer override of shipped classes, which is what issue #248 asked for.
 *
 * The layout comes from the enclosing DialogContent, so the header, the footer, the close button and
 * the body padding cannot drift apart. `variant` here overrides that for the odd case.
 */
const DialogHeader = ({className, variant, ...props}: DialogHeaderProps) => {
	const inherited = React.useContext(DialogVariantContext);
	const banded = (variant ?? inherited) === "banded";
	return (
		<div
			className={cn(
				"wwc:flex wwc:shrink-0",
				banded
					? "wwc:min-h-10 wwc:flex-row wwc:items-center wwc:gap-2 wwc:space-y-0 wwc:border-b wwc:border-border wwc:bg-muted wwc:py-2 wwc:pl-4 wwc:pr-10"
					: "wwc:flex-col wwc:space-y-1.5 wwc:text-center wwc:sm:text-left",
				className,
			)}
			{...props}
		/>
	);
};
DialogHeader.displayName = "DialogHeader";

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Overrides the layout the enclosing {@link DialogContent} declared. Rarely needed. */
	variant?: DialogVariant;
}

/**
 * The dialog's action bar.
 *
 * `banded` sizes it to the same 40px as {@link DialogHeader} so a modal is banded top and bottom by
 * equal-height strips, and steps its buttons down to `h-7` from the library default `h-8` — a
 * full-size button cannot fit a 40px bar with breathing room — via a descendant selector, so call
 * sites keep writing plain `<Button>` and stay consistent automatically.
 *
 * `stacked` drops the strip and the step-down: with no band to fit inside, a full-size button is the
 * right one, and the row is just the actions right-aligned under the content.
 */
const DialogFooter = ({className, variant, ...props}: DialogFooterProps) => {
	const inherited = React.useContext(DialogVariantContext);
	const banded = (variant ?? inherited) === "banded";
	return (
		<div
			className={cn(
				"wwc:flex wwc:shrink-0 wwc:flex-col-reverse wwc:gap-2 wwc:sm:flex-row wwc:sm:justify-end",
				banded
					? "wwc:min-h-10 wwc:items-center wwc:border-t wwc:border-border wwc:px-4 wwc:py-1.5 wwc:[&_button]:h-7 wwc:[&_button]:px-3 wwc:[&_button]:text-xs"
					: "",
				className,
			)}
			{...props}
		/>
	);
};
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({className, ...props}, ref) => (
	<DialogPrimitive.Title
		ref={ref}
		className={cn("wwc:text-sm wwc:font-medium wwc:leading-none", className)}
		{...props}
	/>
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({className, ...props}, ref) => (
	<DialogPrimitive.Description
		ref={ref}
		className={cn("wwc:text-sm wwc:text-muted-foreground", className)}
		{...props}
	/>
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
	Dialog,
	DialogPortal,
	DialogOverlay,
	DialogTrigger,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
	useDialogContainer,
};
