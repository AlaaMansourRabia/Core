import {cn} from "@corensystem/coren-utils";
import {PanelLeft} from "lucide-react";
import * as React from "react";

import {Button} from "./button";
import {ScrollArea} from "./scroll-area";
import {Separator} from "./separator";
import {Sheet, SheetContent} from "./sheet";

const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";

type SidebarContext = {
	open: boolean;
	setOpen: (open: boolean) => void;
	openMobile: boolean;
	setOpenMobile: (open: boolean) => void;
	isMobile: boolean;
	toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
	const context = React.useContext(SidebarContext);
	if (!context) {
		throw new Error("useSidebar must be used within a SidebarProvider.");
	}
	return context;
}

const SidebarProvider = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<"div"> & {
		defaultOpen?: boolean;
	}
>(({defaultOpen = true, className, children, ...props}, ref) => {
	const [open, setOpen] = React.useState(defaultOpen);
	const [openMobile, setOpenMobile] = React.useState(false);
	const [isMobile, setIsMobile] = React.useState(false);

	React.useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 768);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const toggleSidebar = React.useCallback(() => {
		if (isMobile) {
			setOpenMobile((prev) => !prev);
		} else {
			setOpen((prev) => !prev);
		}
	}, [isMobile]);

	return (
		<SidebarContext.Provider
			value={{
				open,
				setOpen,
				openMobile,
				setOpenMobile,
				isMobile,
				toggleSidebar,
			}}
		>
			<div
				ref={ref}
				className={cn("wwc:flex wwc:min-h-svh wwc:w-full", className)}
				style={
					{
						"--sidebar-width": SIDEBAR_WIDTH,
						"--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
					} as React.CSSProperties
				}
				{...props}
			>
				{children}
			</div>
		</SidebarContext.Provider>
	);
});
SidebarProvider.displayName = "SidebarProvider";

/** Collapsible sidebar with menu groups, sub-menus, and responsive behavior. */
const Sidebar = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<"div"> & {
		side?: "left" | "right";
	}
>(({side = "left", className, children, ...props}, ref) => {
	const {isMobile, open, openMobile, setOpenMobile} = useSidebar();

	if (isMobile) {
		return (
			<Sheet open={openMobile} onOpenChange={setOpenMobile}>
				<SheetContent side={side} className="wwc:w-[var(--sidebar-width-mobile)] wwc:p-0">
					<div className="wwc:flex wwc:h-full wwc:w-full wwc:flex-col">{children}</div>
				</SheetContent>
			</Sheet>
		);
	}

	return (
		<div
			ref={ref}
			className={cn(
				"wwc:group/sidebar wwc:flex wwc:h-full wwc:flex-col wwc:border-r wwc:bg-sidebar wwc:transition-all wwc:duration-200",
				open ? "wwc:w-[var(--sidebar-width)]" : "wwc:w-0 wwc:overflow-hidden",
				side === "right" && "wwc:border-l wwc:border-r-0",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
});
Sidebar.displayName = "Sidebar";

const SidebarTrigger = React.forwardRef<React.ElementRef<typeof Button>, React.ComponentProps<typeof Button>>(
	({className, ...props}, ref) => {
		const {toggleSidebar} = useSidebar();

		return (
			<Button ref={ref} variant="ghost" icon className={className} onClick={toggleSidebar} {...props}>
				<PanelLeft className="wwc:h-4 wwc:w-4" />
				<span className="wwc:sr-only">Toggle Sidebar</span>
			</Button>
		);
	},
);
SidebarTrigger.displayName = "SidebarTrigger";

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({className, ...props}, ref) => (
	<div ref={ref} className={cn("wwc:flex wwc:h-14 wwc:items-center wwc:border-b wwc:px-4", className)} {...props} />
));
SidebarHeader.displayName = "SidebarHeader";

const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({className, ...props}, ref) => (
	<div ref={ref} className={cn("wwc:mt-auto wwc:border-t wwc:p-4", className)} {...props} />
));
SidebarFooter.displayName = "SidebarFooter";

const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({className, children}, ref) => (
	<ScrollArea className={cn("wwc:flex-1", className)}>
		<div ref={ref} className="wwc:p-4">
			{children}
		</div>
	</ScrollArea>
));
SidebarContent.displayName = "SidebarContent";

const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({className, ...props}, ref) => (
	<div ref={ref} className={cn("wwc:space-y-4", className)} {...props} />
));
SidebarGroup.displayName = "SidebarGroup";

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
	({className, ...props}, ref) => (
		<div
			ref={ref}
			className={cn(
				"wwc:px-2 wwc:text-xs wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground",
				className,
			)}
			{...props}
		/>
	),
);
SidebarGroupLabel.displayName = "SidebarGroupLabel";

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
	({className, ...props}, ref) => <div ref={ref} className={cn("wwc:space-y-1", className)} {...props} />,
);
SidebarGroupContent.displayName = "SidebarGroupContent";

const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(({className, ...props}, ref) => (
	<ul ref={ref} className={cn("wwc:space-y-1", className)} {...props} />
));
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({className, ...props}, ref) => (
	<li ref={ref} className={cn("", className)} {...props} />
));
SidebarMenuItem.displayName = "SidebarMenuItem";

const SidebarMenuButton = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<"button"> & {
		isActive?: boolean;
	}
>(({className, isActive, ...props}, ref) => (
	<button
		ref={ref}
		className={cn(
			"wwc:flex wwc:w-full wwc:items-center wwc:gap-3 wwc:rounded-lg wwc:px-3 wwc:py-2 wwc:text-sm wwc:transition-colors",
			isActive
				? "wwc:bg-sidebar-accent wwc:text-sidebar-accent-foreground"
				: "wwc:text-sidebar-foreground wwc:hover:bg-sidebar-accent wwc:hover:text-sidebar-accent-foreground",
			className,
		)}
		{...props}
	/>
));
SidebarMenuButton.displayName = "SidebarMenuButton";

const SidebarSeparator = React.forwardRef<React.ElementRef<typeof Separator>, React.ComponentProps<typeof Separator>>(
	({className, ...props}, ref) => <Separator ref={ref} className={cn("wwc:my-4", className)} {...props} />,
);
SidebarSeparator.displayName = "SidebarSeparator";

export {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarSeparator,
	SidebarTrigger,
	useSidebar,
};
