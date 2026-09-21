import {ChevronLeft, ChevronRight} from "lucide-react";
import {Link, useLocation} from "react-router-dom";

import {Button} from "@/components/ui/button";

// Top items (Overview only - Welcome page has no navigation)
const topItems = [{name: "Overview", path: "/overview"}];

// Theme items
const themeItems = [
	{name: "Colors", path: "/theme/colors"},
	{name: "Font Family", path: "/theme/font-family"},
	{name: "Spacing", path: "/theme/spacing"},
	{name: "Radius", path: "/theme/radius"},
];

// Component items organized by category (same order as sidebar)
const componentItems = [
	// Primitives
	{name: "Button", path: "/components/button"},
	{name: "Button Group", path: "/components/button-group"},
	{name: "Input", path: "/components/input"},
	{name: "Input Group", path: "/components/input-group"},
	{name: "Textarea", path: "/components/textarea"},
	{name: "Select", path: "/components/select"},
	{name: "Checkbox", path: "/components/checkbox"},
	{name: "Radio Group", path: "/components/radio-group"},
	{name: "Switch", path: "/components/switch"},
	{name: "Slider", path: "/components/slider"},
	{name: "Label", path: "/components/label"},
	{name: "Badge", path: "/components/badge"},
	{name: "Avatar", path: "/components/avatar"},
	{name: "Kbd", path: "/components/kbd"},
	{name: "Spinner", path: "/components/spinner"},
	{name: "Progress", path: "/components/progress"},
	{name: "Skeleton", path: "/components/skeleton"},
	{name: "Separator", path: "/components/separator"},
	{name: "Toggle", path: "/components/toggle"},
	{name: "Toggle Group", path: "/components/toggle-group"},
	{name: "Copy Button", path: "/components/copy-button"},
	// Layout
	{name: "Card", path: "/components/card"},
	{name: "Table", path: "/components/table"},
	{name: "Data Table", path: "/components/data-table"},
	{name: "Tabs", path: "/components/tabs"},
	{name: "Accordion", path: "/components/accordion"},
	{name: "Collapsible", path: "/components/collapsible"},
	{name: "Scroll Area", path: "/components/scroll-area"},
	{name: "Aspect Ratio", path: "/components/aspect-ratio"},
	{name: "Resizable", path: "/components/resizable"},
	{name: "Sidebar", path: "/components/sidebar"},
	{name: "Push Panel", path: "/components/push-panel"},
	{name: "Browser Tabs", path: "/components/browser-tabs"},
	{name: "Filter Strip", path: "/components/filter-strip"},
	// Overlay
	{name: "Dialog", path: "/components/dialog"},
	{name: "Alert Dialog", path: "/components/alert-dialog"},
	{name: "Sheet", path: "/components/sheet"},
	{name: "Drawer", path: "/components/drawer"},
	{name: "Popover", path: "/components/popover"},
	{name: "Filter", path: "/components/filter"},
	{name: "Tooltip", path: "/components/tooltip"},
	{name: "Hover Card", path: "/components/hover-card"},
	{name: "Dropdown Menu", path: "/components/dropdown-menu"},
	{name: "Context Menu", path: "/components/context-menu"},
	{name: "Menubar", path: "/components/menubar"},
	// Navigation
	{name: "Top Navigation", path: "/components/top-navigation"},
	{name: "Navigation Menu", path: "/components/navigation-menu"},
	{name: "Breadcrumb", path: "/components/breadcrumb"},
	{name: "Pagination", path: "/components/pagination"},
	{name: "Stepper", path: "/components/stepper"},
	{name: "View Tab Bar", path: "/components/view-tab-bar"},
	{name: "Command", path: "/components/command"},
	// Form
	{name: "Form", path: "/components/form"},
	{name: "Field", path: "/components/field"},
	{name: "Input OTP", path: "/components/input-otp"},
	{name: "Combobox", path: "/components/combobox"},
	{name: "Multi Select", path: "/components/multi-select"},
	{name: "Form Action Bar", path: "/components/form-action-bar"},
	{name: "Date Picker", path: "/components/date-picker"},
	{name: "Calendar", path: "/components/calendar"},
	// Feedback
	{name: "Alert", path: "/components/alert"},
	{name: "Toast", path: "/components/toast"},
	{name: "Sonner", path: "/components/sonner"},
	{name: "Empty", path: "/components/empty"},
	{name: "Error Page", path: "/components/error-page"},
	{name: "Chat Widget", path: "/components/chat-widget"},
	{name: "Task Monitor", path: "/components/task-monitor"},
	{name: "Thinking Pill", path: "/components/thinking-pill"},
	{name: "Turn Timer", path: "/components/turn-timer"},
	// Display
	{name: "Carousel", path: "/components/carousel"},
	{name: "Gantt", path: "/components/gantt"},
	{name: "Timeline", path: "/components/timeline"},
	{name: "Typography", path: "/components/typography"},
	{name: "Item", path: "/components/item"},
];

// Charts items
const chartsItems = [
	{name: "Bar Chart", path: "/charts/bar"},
	{name: "Line Chart", path: "/charts/line"},
	{name: "Area Chart", path: "/charts/area"},
	{name: "Pie Chart", path: "/charts/pie"},
	{name: "Scatter Chart", path: "/charts/scatter"},
	{name: "Radar Chart", path: "/charts/radar"},
	{name: "Gauge Chart", path: "/charts/gauge"},
];

// Map items
const mapItems = [
	{name: "Default", path: "/map/map"},
	{name: "Directions", path: "/map/directions"},
	{name: "Heatmap", path: "/map/heatmap"},
	{name: "Drawing", path: "/map/drawing"},
	{name: "3D View", path: "/map/3d-view"},
];

const allItems = [...topItems, ...themeItems, ...componentItems, ...chartsItems, ...mapItems];

export function PageNavigation() {
	const location = useLocation();
	const currentPath = location.pathname;

	const currentIndex = allItems.findIndex((item) => item.path === currentPath);

	if (currentIndex === -1) return null;

	const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;
	const nextItem = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

	if (!prevItem && !nextItem) return null;

	return (
		<div className="wwc:flex wwc:items-center wwc:justify-between wwc:border-t wwc:pt-6 wwc:mt-12">
			<div>
				{prevItem && (
					<Button variant="ghost" asChild className="wwc:gap-2">
						<Link to={prevItem.path}>
							<ChevronLeft className="wwc:h-4 wwc:w-4" />
							<span className="wwc:text-muted-foreground">Previous</span>
							<span className="wwc:font-medium">{prevItem.name}</span>
						</Link>
					</Button>
				)}
			</div>
			<div>
				{nextItem && (
					<Button variant="ghost" asChild className="wwc:gap-2">
						<Link to={nextItem.path}>
							<span className="wwc:text-muted-foreground">Next</span>
							<span className="wwc:font-medium">{nextItem.name}</span>
							<ChevronRight className="wwc:h-4 wwc:w-4" />
						</Link>
					</Button>
				)}
			</div>
		</div>
	);
}
