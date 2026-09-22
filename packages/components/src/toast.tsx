import {cn} from "@core/core-utils";
import * as ToastPrimitives from "@radix-ui/react-toast";
import {type VariantProps, cva} from "class-variance-authority";
import {X} from "lucide-react";
import * as React from "react";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
	React.ElementRef<typeof ToastPrimitives.Viewport>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({className, ...props}, ref) => (
	<ToastPrimitives.Viewport
		ref={ref}
		className={cn(
			"wwc:fixed wwc:top-0 wwc:z-[100] wwc:flex wwc:max-h-screen wwc:w-full wwc:flex-col-reverse wwc:p-4 wwc:sm:bottom-0 wwc:sm:right-0 wwc:sm:top-auto wwc:sm:flex-col wwc:md:max-w-[420px]",
			className,
		)}
		{...props}
	/>
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
	"wwc:group wwc:pointer-events-auto wwc:relative wwc:flex wwc:w-full wwc:items-center wwc:justify-between wwc:space-x-4 wwc:overflow-hidden wwc:rounded-md wwc:border wwc:p-6 wwc:pr-8 wwc:shadow-lg wwc:transition-all wwc:data-[swipe=cancel]:translate-x-0 wwc:data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] wwc:data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] wwc:data-[swipe=move]:transition-none wwc:data-[state=open]:animate-in wwc:data-[state=closed]:animate-out wwc:data-[swipe=end]:animate-out wwc:data-[state=closed]:fade-out-80 wwc:data-[state=closed]:slide-out-to-right-full wwc:data-[state=open]:slide-in-from-top-full wwc:data-[state=open]:sm:slide-in-from-bottom-full",
	{
		variants: {
			variant: {
				default: "wwc:border wwc:bg-card wwc:text-foreground",
				destructive: "destructive wwc:group wwc:border-destructive wwc:bg-destructive wwc:text-destructive-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

const Toast = React.forwardRef<
	React.ElementRef<typeof ToastPrimitives.Root>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>
>(({className, variant, ...props}, ref) => {
	return <ToastPrimitives.Root ref={ref} className={cn(toastVariants({variant}), className)} {...props} />;
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
	React.ElementRef<typeof ToastPrimitives.Action>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({className, ...props}, ref) => (
	<ToastPrimitives.Action
		ref={ref}
		className={cn(
			"wwc:inline-flex wwc:h-8 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:bg-transparent wwc:px-3 wwc:text-sm wwc:font-medium wwc:ring-offset-background wwc:transition-colors wwc:hover:bg-secondary wwc:focus:outline-none wwc:focus:ring-2 wwc:focus:ring-ring wwc:focus:ring-offset-2 wwc:disabled:pointer-events-none wwc:disabled:opacity-50 wwc:group-[.destructive]:border-muted/40 wwc:group-[.destructive]:hover:border-destructive/30 wwc:group-[.destructive]:hover:bg-destructive wwc:group-[.destructive]:hover:text-destructive-foreground wwc:group-[.destructive]:focus:ring-destructive",
			className,
		)}
		{...props}
	/>
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
	React.ElementRef<typeof ToastPrimitives.Close>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({className, ...props}, ref) => (
	<ToastPrimitives.Close
		ref={ref}
		className={cn(
			"wwc:absolute wwc:right-2 wwc:top-2 wwc:rounded-md wwc:p-1 wwc:text-foreground/50 wwc:opacity-0 wwc:transition-opacity wwc:hover:text-foreground wwc:focus:opacity-100 wwc:focus:outline-none wwc:focus:ring-2 wwc:group-hover:opacity-100 wwc:group-[.destructive]:text-red-300 wwc:group-[.destructive]:hover:text-red-50 wwc:group-[.destructive]:focus:ring-red-400 wwc:group-[.destructive]:focus:ring-offset-red-600",
			className,
		)}
		toast-close=""
		{...props}
	>
		<X className="wwc:h-4 wwc:w-4" />
	</ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
	React.ElementRef<typeof ToastPrimitives.Title>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({className, ...props}, ref) => (
	<ToastPrimitives.Title ref={ref} className={cn("wwc:text-sm wwc:font-semibold", className)} {...props} />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
	React.ElementRef<typeof ToastPrimitives.Description>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({className, ...props}, ref) => (
	<ToastPrimitives.Description ref={ref} className={cn("wwc:text-sm wwc:opacity-90", className)} {...props} />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
	type ToastProps,
	type ToastActionElement,
	ToastProvider,
	ToastViewport,
	Toast,
	ToastTitle,
	ToastDescription,
	ToastClose,
	ToastAction,
};
