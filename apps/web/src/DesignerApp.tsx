import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";

import {Layout} from "@/components/layout/Layout";
import {Toaster} from "@/components/ui/sonner";
import {ChangelogPage} from "@/pages/ChangelogPage";
import {AreaChartPage} from "@/pages/charts/AreaChartPage";
// Chart pages
import {BarChartPage} from "@/pages/charts/BarChartPage";
import {FunnelChartPage} from "@/pages/charts/FunnelChartPage";
import {GaugeChartPage} from "@/pages/charts/GaugeChartPage";
import {HeatmapChartPage} from "@/pages/charts/HeatmapChartPage";
import {LineChartPage} from "@/pages/charts/LineChartPage";
import {PieChartPage} from "@/pages/charts/PieChartPage";
import {RadarChartPage} from "@/pages/charts/RadarChartPage";
import {ScatterChartPage} from "@/pages/charts/ScatterChartPage";
import {TreemapChartPage} from "@/pages/charts/TreemapChartPage";
// Component pages
import {AccordionPage} from "@/pages/components/AccordionPage";
import {ActivityLogPage} from "@/pages/components/ActivityLogPage";
import {ActivitySheetPage} from "@/pages/components/ActivitySheetPage";
import {AIChatPage} from "@/pages/components/AIChatPage";
import {AlertDialogPage} from "@/pages/components/AlertDialogPage";
import {AlertPage} from "@/pages/components/AlertPage";
import {AnalysisWorkbenchPage} from "@/pages/components/AnalysisWorkbenchPage";
import {AppMarketplacePage} from "@/pages/components/AppMarketplacePage";
import {AppTopBarPage} from "@/pages/components/AppTopBarPage";
import {AreaTreePage} from "@/pages/components/AreaTreePage";
import {AspectRatioPage} from "@/pages/components/AspectRatioPage";
import {AssetListItemPage} from "@/pages/components/AssetListItemPage";
import {AvatarPage} from "@/pages/components/AvatarPage";
import {BadgePage} from "@/pages/components/BadgePage";
import {BannerPage} from "@/pages/components/BannerPage";
import {BlueprintSegmentPage} from "@/pages/components/BlueprintSegmentPage";
import {BreadcrumbPage} from "@/pages/components/BreadcrumbPage";
import {BrowserTabsPage} from "@/pages/components/BrowserTabsPage";
import {BuildingProgressPage} from "@/pages/components/BuildingProgressPage";
import {ButtonGroupPage} from "@/pages/components/ButtonGroupPage";
import {ButtonPage} from "@/pages/components/ButtonPage";
import {CalendarPage} from "@/pages/components/CalendarPage";
import {CalendarViewPage} from "@/pages/components/CalendarViewPage";
import {CanvasFilePickerPage} from "@/pages/components/CanvasFilePickerPage";
import {CanvasHeaderPage} from "@/pages/components/CanvasHeaderPage";
import {CanvasNavigatorPage} from "@/pages/components/CanvasNavigatorPage";
import {CanvasToolbarPage} from "@/pages/components/CanvasToolbarPage";
import {CaptureRouteMinimapPage} from "@/pages/components/CaptureRouteMinimapPage";
import {CardPage} from "@/pages/components/CardPage";
import {CarouselPage} from "@/pages/components/CarouselPage";
import {CatalogueViewTogglePage} from "@/pages/components/CatalogueViewTogglePage";
import {ChartPage} from "@/pages/components/ChartPage";
import {ChatWidgetPage} from "@/pages/components/ChatWidgetPage";
import {CheckboxPage} from "@/pages/components/CheckboxPage";
import {ChecklistCardPage} from "@/pages/components/ChecklistCardPage";
import {ChipPage} from "@/pages/components/ChipPage";
import {CollapsiblePage} from "@/pages/components/CollapsiblePage";
import {ComboboxPage} from "@/pages/components/ComboboxPage";
import {CommandPage} from "@/pages/components/CommandPage";
import {CommentComposerPage} from "@/pages/components/CommentComposerPage";
import {CommentThreadPage} from "@/pages/components/CommentThreadPage";
import {CompareBarsPage} from "@/pages/components/CompareBarsPage";
import {CompareViewPage} from "@/pages/components/CompareViewPage";
import {ContextMenuPage} from "@/pages/components/ContextMenuPage";
import {CopyButtonPage} from "@/pages/components/CopyButtonPage";
import {CreateProcessDialogPage} from "@/pages/components/CreateProcessDialogPage";
import {DataTablePage} from "@/pages/components/DataTablePage";
import {DatePickerPage} from "@/pages/components/DatePickerPage";
import {DialogPage} from "@/pages/components/DialogPage";
import {DrawerPage} from "@/pages/components/DrawerPage";
import {DrawingActionsPage} from "@/pages/components/DrawingActionsPage";
import {DropdownMenuPage} from "@/pages/components/DropdownMenuPage";
import {EmptyPage} from "@/pages/components/EmptyPage";
import {ErrorPagePage} from "@/pages/components/ErrorPagePage";
import {FieldPage} from "@/pages/components/FieldPage";
import {FilterPage} from "@/pages/components/FilterPage";
import {FilterStripPage} from "@/pages/components/FilterStripPage";
import {FloatingAssistantPage} from "@/pages/components/FloatingAssistantPage";
import {FormActionBarPage} from "@/pages/components/FormActionBarPage";
import {FormDialogPage} from "@/pages/components/FormDialogPage";
import {FormPage} from "@/pages/components/FormPage";
import {GanttPage} from "@/pages/components/GanttPage";
import {GraphCanvasPage} from "@/pages/components/GraphCanvasPage";
import {HealthViewPage} from "@/pages/components/HealthViewPage";
import {HoverCardPage} from "@/pages/components/HoverCardPage";
import {InputGroupPage} from "@/pages/components/InputGroupPage";
import {InputOTPPage} from "@/pages/components/InputOTPPage";
import {InputPage} from "@/pages/components/InputPage";
import {InstallProductDialogPage} from "@/pages/components/InstallProductDialogPage";
import {ItemPage} from "@/pages/components/ItemPage";
import {KbdPage} from "@/pages/components/KbdPage";
import {LabelPage} from "@/pages/components/LabelPage";
import {LegendPage} from "@/pages/components/LegendPage";
import {LineageImpactViewPage} from "@/pages/components/LineageImpactViewPage";
import {MapFilterBarPage} from "@/pages/components/MapFilterBarPage";
import {MapMinimapPage} from "@/pages/components/MapMinimapPage";
import {MapToolbarPage} from "@/pages/components/MapToolbarPage";
import {MenubarPage} from "@/pages/components/MenubarPage";
import {MilestoneTablePage} from "@/pages/components/MilestoneTablePage";
import {MultiSelectPage} from "@/pages/components/MultiSelectPage";
import {NavigationMenuPage} from "@/pages/components/NavigationMenuPage";
import {NewActionTypeDialogPage} from "@/pages/components/NewActionTypeDialogPage";
import {NewInterfaceDialogPage} from "@/pages/components/NewInterfaceDialogPage";
import {NewLinkTypeDialogPage} from "@/pages/components/NewLinkTypeDialogPage";
import {NewObjectTypeDialogPage} from "@/pages/components/NewObjectTypeDialogPage";
import {NewSharedPropertyDialogPage} from "@/pages/components/NewSharedPropertyDialogPage";
import {NewTypeGroupDialogPage} from "@/pages/components/NewTypeGroupDialogPage";
import {ObjectDrawingToolbarPage} from "@/pages/components/ObjectDrawingToolbarPage";
import {OperationsDrawerPage} from "@/pages/components/OperationsDrawerPage";
import {PageContentHeaderPage} from "@/pages/components/PageContentHeaderPage";
import {PaginationPage} from "@/pages/components/PaginationPage";
import {PopoverPage} from "@/pages/components/PopoverPage";
import {ProgressComparisonPage} from "@/pages/components/ProgressComparisonPage";
import {ProgressListItemPage} from "@/pages/components/ProgressListItemPage";
import {ProgressPage} from "@/pages/components/ProgressPage";
import {PromptInputPage} from "@/pages/components/PromptInputPage";
import {PropertyListPage} from "@/pages/components/PropertyListPage";
import {PushPanelPage} from "@/pages/components/PushPanelPage";
import {RadioGroupPage} from "@/pages/components/RadioGroupPage";
import {RecordDetailShellPage} from "@/pages/components/RecordDetailShellPage";
import {ResizablePage} from "@/pages/components/ResizablePage";
import {RunActionDialogPage} from "@/pages/components/RunActionDialogPage";
import {ScrollAreaPage} from "@/pages/components/ScrollAreaPage";
import {SearchFilterBarPage} from "@/pages/components/SearchFilterBarPage";
import {SelectPage} from "@/pages/components/SelectPage";
import {SeparatorPage} from "@/pages/components/SeparatorPage";
import {SetupStepsChecklistPage} from "@/pages/components/SetupStepsChecklistPage";
import {SheetPage} from "@/pages/components/SheetPage";
import {SidebarPage} from "@/pages/components/SidebarPage";
import {SkeletonPage} from "@/pages/components/SkeletonPage";
import {SliderPage} from "@/pages/components/SliderPage";
import {SonnerPage} from "@/pages/components/SonnerPage";
import {SpinnerPage} from "@/pages/components/SpinnerPage";
import {StateMachinePage} from "@/pages/components/StateMachinePage";
import {StepperPage} from "@/pages/components/StepperPage";
import {SwitchPage} from "@/pages/components/SwitchPage";
import {TablePage} from "@/pages/components/TablePage";
import {TabsPage} from "@/pages/components/TabsPage";
import {TaskMonitorPage} from "@/pages/components/TaskMonitorPage";
import {TextareaPage} from "@/pages/components/TextareaPage";
import {ThinkingPillPage} from "@/pages/components/ThinkingPillPage";
import {TimelineRangeSelectorPage} from "@/pages/components/TimelineRangeSelectorPage";
import {TimestampPickerPage} from "@/pages/components/TimestampPickerPage";
import {ToastPage} from "@/pages/components/ToastPage";
import {ToggleGroupPage} from "@/pages/components/ToggleGroupPage";
import {TogglePage} from "@/pages/components/TogglePage";
import {ToolbarColorPickerPage} from "@/pages/components/ToolbarColorPickerPage";
import {ToolbarMenuButtonPage} from "@/pages/components/ToolbarMenuButtonPage";
import {ToolbarPage} from "@/pages/components/ToolbarPage";
import {ToolbarPagerPage} from "@/pages/components/ToolbarPagerPage";
import {ToolbarStatsPage} from "@/pages/components/ToolbarStatsPage";
import {ToolCallPage} from "@/pages/components/ToolCallPage";
import {TooltipPage} from "@/pages/components/TooltipPage";
import {TopNavigationPage} from "@/pages/components/TopNavigationPage";
import {TreeRowPage} from "@/pages/components/TreeRowPage";
import {TurnProgressPage} from "@/pages/components/TurnProgressPage";
import {TurnTimerPage} from "@/pages/components/TurnTimerPage";
import {TypographyComponentPage} from "@/pages/components/TypographyComponentPage";
import {VerticalZoomToolsPage} from "@/pages/components/VerticalZoomToolsPage";
import {ViewTabBarPage} from "@/pages/components/ViewTabBarPage";
import {WalkthroughModalPage} from "@/pages/components/WalkthroughModalPage";
import {WeekSelectorPage} from "@/pages/components/WeekSelectorPage";
import {WizardDialogPage} from "@/pages/components/WizardDialogPage";
import {WorkItemCardPage} from "@/pages/components/WorkItemCardPage";
import {ZoomToolsPage} from "@/pages/components/ZoomToolsPage";
import {ChatWidgetDemo} from "@/pages/dashboard/ChatWidgetDemo";
import {DashboardHeaderDemo} from "@/pages/dashboard/DashboardHeaderDemo";
import {FilterStripDemo} from "@/pages/dashboard/FilterStripDemo";
// Dashboard pages
import {LoginPageDemo} from "@/pages/dashboard/LoginPageDemo";
import {OrgAIReportDemo} from "@/pages/dashboard/OrgAIReportDemo";
import {OrgOverviewDemo} from "@/pages/dashboard/OrgOverviewDemo";
import {OrgPerformanceDemo} from "@/pages/dashboard/OrgPerformanceDemo";
import {OrgRealityCaptureDemo} from "@/pages/dashboard/OrgRealityCaptureDemo";
import {OrgWorkforceDemo} from "@/pages/dashboard/OrgWorkforceDemo";
import {ProjectOverviewDemo} from "@/pages/dashboard/ProjectOverviewDemo";
import {ProjectQualityIssuesDemo} from "@/pages/dashboard/ProjectQualityIssuesDemo";
import {ProjectRealityCaptureDemo} from "@/pages/dashboard/ProjectRealityCaptureDemo";
import {ProjectScheduleCostDemo} from "@/pages/dashboard/ProjectScheduleCostDemo";
import {ProjectWorkforceSafetyDemo} from "@/pages/dashboard/ProjectWorkforceSafetyDemo";
import {TopNavigationDemo} from "@/pages/dashboard/TopNavigationDemo";
import {AppLayout2Page} from "@/pages/examples/AppLayout2Page";
import {AppLayout3Page} from "@/pages/examples/AppLayout3Page";
import {AppLayoutPage} from "@/pages/examples/AppLayoutPage";
import {BlueprintViewer2Page} from "@/pages/examples/BlueprintViewer2Page";
import {BlueprintViewer3Page} from "@/pages/examples/BlueprintViewer3Page";
import {BlueprintViewerPage} from "@/pages/examples/BlueprintViewerPage";
import {ContentDashboardPage} from "@/pages/examples/ContentDashboardPage";
import {ContentLayout2Page} from "@/pages/examples/ContentLayout2Page";
import {ContentLayout3Page} from "@/pages/examples/ContentLayout3Page";
import {ContentLayout4Page} from "@/pages/examples/ContentLayout4Page";
import {ContentLayout5Page} from "@/pages/examples/ContentLayout5Page";
import {ContentLayoutPage} from "@/pages/examples/ContentLayoutPage";
import {DesignCanvasExamplePage} from "@/pages/examples/DesignCanvasExamplePage";
import {FixedContent1Page} from "@/pages/examples/FixedContent1Page";
import {FixedContent2Page} from "@/pages/examples/FixedContent2Page";
import {FixedContent3Page} from "@/pages/examples/FixedContent3Page";
import {FixedContent4Page} from "@/pages/examples/FixedContent4Page";
import {MapCompareLayoutPage} from "@/pages/examples/MapCompareLayoutPage";
import {MapDashboardPage} from "@/pages/examples/MapDashboardPage";
import {ModelViewerPage} from "@/pages/examples/ModelViewerPage";
import {ObjectDrawingCanvasPage} from "@/pages/examples/ObjectDrawingCanvasPage";
import {OverviewExamplePage} from "@/pages/examples/OverviewExamplePage";
import {ProgressDetailsPage} from "@/pages/examples/ProgressDetailsPage";
import {ProjectSetupExamplePage} from "@/pages/examples/ProjectSetupExamplePage";
import {TaskMonitorExamplePage} from "@/pages/examples/TaskMonitorExamplePage";
import {TasksManagementPage} from "@/pages/examples/TasksManagementPage";
import {TemplatePartsReviewPage} from "@/pages/examples/TemplatePartsReviewPage";
import {DirectionsPage} from "@/pages/map/DirectionsPage";
import {DrawingPage} from "@/pages/map/DrawingPage";
import {HeatmapPage} from "@/pages/map/HeatmapPage";
// Map pages
import {MapPage} from "@/pages/map/MapPage";
import {ThreeDViewPage} from "@/pages/map/ThreeDViewPage";
import {OverviewPage} from "@/pages/OverviewPage";
import {StorybookPreviewPage} from "@/pages/StorybookPreviewPage";
import {TemplateViewerPage} from "@/pages/TemplateViewerPage";
// Theme pages
import {ColorsPage} from "@/pages/theme/ColorsPage";
import {RadiusPage} from "@/pages/theme/RadiusPage";
import {SpacingPage} from "@/pages/theme/SpacingPage";
import {TypographyPage} from "@/pages/theme/TypographyPage";

/** Machine-readable inventory for WakeCore showcase validation and catalog audits. */
export const wakecoreInventory = {
	templates: [
		"admin-panel",
		"app-installer",
		"blueprint-viewer",
		"blueprint-viewer-3",
		"clinic",
		"error-page",
		"login-page",
		"map-compare-layout",
		"object-drawing-canvas",
		"progress-details",
		"safety-manager",
		"site-reality",
		"timesheet",
		"workforce",
	],
	widgets: ["core-app-sidebar", "core-app-top-bar"],
	components: ["Button", "Input", "ScrollArea", "Separator", "Tooltip"],
	tokens: ["color.background.surface"],
} as const;

// The Designers Hub — the component/widget/template/theme showcase. It is one tab of the WakeCore Hub
// shell (see App.tsx): mounted natively (no iframe) under the "/designer" URL segment, so its router
// owns "/designer/*" while the hub shell owns the top-level tab routing. The hub owns the theme, so this
// takes `dark` as a prop and renders its own Layout in embedded mode (no duplicate GitHub/theme chrome).
export function DesignerApp({dark}: {dark: boolean}) {
	return (
		<BrowserRouter basename="/designer">
			<Routes>
				<Route path="/" element={<Layout darkMode={dark} onToggleDarkMode={() => {}} embedded />}>
					<Route index element={<Navigate to="/overview" replace />} />

					{/* Overview is the landing page; /welcome redirects to it */}
					<Route path="welcome" element={<Navigate to="/overview" replace />} />
					<Route path="overview" element={<OverviewPage />} />
					<Route path="changelog" element={<ChangelogPage />} />

					{/* Templates — all 16 rendered by the shared viewer */}
					<Route path="templates/:id" element={<TemplateViewerPage />} />

					{/* Theme routes */}
					<Route path="theme/colors" element={<ColorsPage />} />
					<Route path="theme/font-family" element={<TypographyPage />} />
					<Route path="theme/spacing" element={<SpacingPage />} />
					<Route path="theme/radius" element={<RadiusPage />} />

					{/* Map routes */}
					<Route path="map/map" element={<MapPage />} />
					<Route path="map/directions" element={<DirectionsPage />} />
					<Route path="map/heatmap" element={<HeatmapPage />} />
					<Route path="map/drawing" element={<DrawingPage />} />
					<Route path="map/3d-view" element={<ThreeDViewPage />} />

					{/* Component routes */}
					<Route path="components/accordion" element={<AccordionPage />} />
					<Route path="components/ai-chat" element={<AIChatPage />} />
					<Route path="components/alert" element={<AlertPage />} />
					<Route path="components/alert-dialog" element={<AlertDialogPage />} />
					<Route path="components/aspect-ratio" element={<AspectRatioPage />} />
					<Route path="components/avatar" element={<AvatarPage />} />
					<Route path="components/badge" element={<BadgePage />} />
					<Route path="components/banner" element={<BannerPage />} />
					<Route path="components/blueprint-segment" element={<BlueprintSegmentPage />} />
					<Route path="components/breadcrumb" element={<BreadcrumbPage />} />
					<Route path="components/browser-tabs" element={<BrowserTabsPage />} />
					<Route path="components/building-progress" element={<BuildingProgressPage />} />
					<Route path="components/button" element={<ButtonPage />} />
					<Route path="components/calendar" element={<CalendarPage />} />
					<Route path="components/canvas-header" element={<CanvasHeaderPage />} />
					<Route path="components/capture-route-minimap" element={<CaptureRouteMinimapPage />} />
					<Route path="components/card" element={<CardPage />} />
					<Route path="components/carousel" element={<CarouselPage />} />
					<Route path="components/compare-bars" element={<CompareBarsPage />} />
					<Route path="components/compare-view" element={<CompareViewPage />} />
					<Route path="components/chart" element={<ChartPage />} />
					<Route path="components/chat-widget" element={<ChatWidgetPage />} />
					<Route path="components/floating-assistant" element={<FloatingAssistantPage />} />
					<Route path="components/checkbox" element={<CheckboxPage />} />
					<Route path="components/collapsible" element={<CollapsiblePage />} />
					<Route path="components/command" element={<CommandPage />} />
					<Route path="components/context-menu" element={<ContextMenuPage />} />
					<Route path="components/copy-button" element={<CopyButtonPage />} />
					<Route path="components/dialog" element={<DialogPage />} />
					<Route path="components/drawer" element={<DrawerPage />} />
					<Route path="components/drawing-actions" element={<DrawingActionsPage />} />
					<Route path="components/map-filter-bar" element={<MapFilterBarPage />} />
					<Route path="components/milestone-table" element={<MilestoneTablePage />} />
					<Route path="components/operations-drawer" element={<OperationsDrawerPage />} />
					<Route path="components/progress-list-item" element={<ProgressListItemPage />} />
					<Route path="components/walkthrough-modal" element={<WalkthroughModalPage />} />
					<Route path="components/zoom-tools" element={<ZoomToolsPage />} />
					<Route path="components/vertical-zoom-tools" element={<VerticalZoomToolsPage />} />
					<Route path="components/map-toolbar" element={<MapToolbarPage />} />
					<Route path="components/map-minimap" element={<MapMinimapPage />} />
					<Route path="examples/blueprint-viewer-3" element={<BlueprintViewer3Page />} />
					<Route path="examples/map-compare-layout" element={<MapCompareLayoutPage />} />
					<Route path="components/toolbar" element={<ToolbarPage />} />
					<Route path="components/toolbar-menu-button" element={<ToolbarMenuButtonPage />} />
					<Route path="components/toolbar-color-picker" element={<ToolbarColorPickerPage />} />
					<Route path="components/canvas-toolbar" element={<CanvasToolbarPage />} />
					<Route path="components/canvas-file-picker" element={<CanvasFilePickerPage />} />
					<Route path="components/toolbar-pager" element={<ToolbarPagerPage />} />
					<Route path="components/toolbar-stats" element={<ToolbarStatsPage />} />
					<Route path="components/comment-thread" element={<CommentThreadPage />} />
					<Route path="components/dropdown-menu" element={<DropdownMenuPage />} />
					<Route path="components/hover-card" element={<HoverCardPage />} />
					<Route path="components/input" element={<InputPage />} />
					<Route path="components/input-otp" element={<InputOTPPage />} />
					<Route path="components/label" element={<LabelPage />} />
					<Route path="components/legend" element={<LegendPage />} />
					<Route path="components/menubar" element={<MenubarPage />} />
					<Route path="components/navigation-menu" element={<NavigationMenuPage />} />
					<Route path="components/object-drawing-toolbar" element={<ObjectDrawingToolbarPage />} />
					<Route path="components/pagination" element={<PaginationPage />} />
					<Route path="components/page-content-header" element={<PageContentHeaderPage />} />
					<Route path="components/view-tab-bar" element={<ViewTabBarPage />} />
					<Route path="components/popover" element={<PopoverPage />} />
					<Route path="components/progress" element={<ProgressPage />} />
					<Route path="components/progress-comparison" element={<ProgressComparisonPage />} />
					<Route path="components/turn-progress" element={<TurnProgressPage />} />
					<Route path="components/prompt-input" element={<PromptInputPage />} />
					<Route path="components/push-panel" element={<PushPanelPage />} />
					<Route path="components/radio-group" element={<RadioGroupPage />} />
					<Route path="components/resizable" element={<ResizablePage />} />
					<Route path="components/scroll-area" element={<ScrollAreaPage />} />
					<Route path="components/search-filter-bar" element={<SearchFilterBarPage />} />
					<Route path="components/select" element={<SelectPage />} />
					<Route path="components/chip" element={<ChipPage />} />
					<Route path="components/separator" element={<SeparatorPage />} />
					<Route path="components/setup-steps-checklist" element={<SetupStepsChecklistPage />} />
					<Route path="components/sheet" element={<SheetPage />} />
					<Route path="components/skeleton" element={<SkeletonPage />} />
					<Route path="components/slider" element={<SliderPage />} />
					<Route path="components/sonner" element={<SonnerPage />} />
					<Route path="components/stepper" element={<StepperPage />} />
					<Route path="components/switch" element={<SwitchPage />} />
					<Route path="components/table" element={<TablePage />} />
					<Route path="components/tabs" element={<TabsPage />} />
					<Route path="components/task-monitor" element={<TaskMonitorPage />} />
					<Route path="components/textarea" element={<TextareaPage />} />
					<Route path="components/thinking-pill" element={<ThinkingPillPage />} />
					<Route path="components/toggle" element={<TogglePage />} />
					<Route path="components/toggle-group" element={<ToggleGroupPage />} />
					<Route path="components/tool-call" element={<ToolCallPage />} />
					<Route path="components/tooltip" element={<TooltipPage />} />
					<Route path="components/top-navigation" element={<TopNavigationPage />} />
					<Route path="components/turn-timer" element={<TurnTimerPage />} />
					<Route path="components/button-group" element={<ButtonGroupPage />} />
					<Route path="components/combobox" element={<ComboboxPage />} />
					<Route path="components/multi-select" element={<MultiSelectPage />} />
					<Route path="components/form-action-bar" element={<FormActionBarPage />} />
					<Route path="components/form-dialog" element={<FormDialogPage />} />
					<Route path="components/new-object-type-dialog" element={<NewObjectTypeDialogPage />} />
					<Route path="components/new-link-type-dialog" element={<NewLinkTypeDialogPage />} />
					<Route path="components/new-action-type-dialog" element={<NewActionTypeDialogPage />} />
					<Route path="components/new-interface-dialog" element={<NewInterfaceDialogPage />} />
					<Route path="components/new-type-group-dialog" element={<NewTypeGroupDialogPage />} />
					<Route path="components/new-shared-property-dialog" element={<NewSharedPropertyDialogPage />} />
					<Route path="components/create-process-dialog" element={<CreateProcessDialogPage />} />
					<Route path="components/install-product-dialog" element={<InstallProductDialogPage />} />
					<Route path="components/run-action-dialog" element={<RunActionDialogPage />} />
					<Route path="components/analysis-workbench" element={<AnalysisWorkbenchPage />} />
					<Route path="components/app-marketplace" element={<AppMarketplacePage />} />
					<Route path="components/lineage-impact-view" element={<LineageImpactViewPage />} />
					<Route path="components/health-view" element={<HealthViewPage />} />
					<Route path="components/state-machine" element={<StateMachinePage />} />
					<Route path="components/catalogue-view-toggle" element={<CatalogueViewTogglePage />} />
					<Route path="components/asset-list-item" element={<AssetListItemPage />} />
					<Route path="components/record-detail-shell" element={<RecordDetailShellPage />} />
					<Route path="components/graph-canvas" element={<GraphCanvasPage />} />
					<Route path="components/wizard-dialog" element={<WizardDialogPage />} />
					<Route path="components/data-table" element={<DataTablePage />} />
					<Route path="components/date-picker" element={<DatePickerPage />} />
					<Route path="components/empty" element={<EmptyPage />} />
					<Route path="components/error-page" element={<ErrorPagePage />} />
					<Route path="components/field" element={<FieldPage />} />
					<Route path="components/filter" element={<FilterPage />} />
					<Route path="components/filter-strip" element={<FilterStripPage />} />
					<Route path="components/form" element={<FormPage />} />
					<Route path="components/input-group" element={<InputGroupPage />} />
					<Route path="components/item" element={<ItemPage />} />
					<Route path="components/kbd" element={<KbdPage />} />
					<Route path="components/sidebar" element={<SidebarPage />} />
					<Route path="components/app-top-bar" element={<AppTopBarPage />} />
					<Route path="components/spinner" element={<SpinnerPage />} />
					<Route path="components/toast" element={<ToastPage />} />
					<Route path="components/typography" element={<TypographyComponentPage />} />
					<Route path="components/gantt" element={<GanttPage />} />
					<Route path="components/timeline-range-selector" element={<TimelineRangeSelectorPage />} />
					<Route path="components/timestamp-picker" element={<TimestampPickerPage />} />
					<Route path="components/area-tree" element={<AreaTreePage />} />
					<Route path="components/checklist-card" element={<ChecklistCardPage />} />
					<Route path="components/week-selector" element={<WeekSelectorPage />} />
					<Route path="components/work-item-card" element={<WorkItemCardPage />} />
					<Route path="components/property-list" element={<PropertyListPage />} />
					<Route path="components/activity-log" element={<ActivityLogPage />} />
					<Route path="components/activity-sheet" element={<ActivitySheetPage />} />
					<Route path="components/comment-composer" element={<CommentComposerPage />} />
					<Route path="components/calendar-view" element={<CalendarViewPage />} />
					<Route path="components/tree-row" element={<TreeRowPage />} />
					<Route path="components/canvas-navigator" element={<CanvasNavigatorPage />} />
					<Route
						path="components/app-card"
						element={<StorybookPreviewPage title="App Card" storyId="components-layout-card-app-card--default" />}
					/>
					<Route
						path="components/sidebar-primitive"
						element={
							<StorybookPreviewPage
								title="Sidebar Primitive"
								storyId="components-layout-sidebar-primitive--composition"
							/>
						}
					/>
					<Route
						path="components/image-zoom"
						element={<StorybookPreviewPage title="Image Zoom" storyId="components-data-display-image-zoom--default" />}
					/>
					<Route
						path="components/time-scrubber"
						element={
							<StorybookPreviewPage title="Time Scrubber" storyId="components-data-display-timescrubber--bar-graph" />
						}
					/>
					<Route
						path="components/kpi-bar"
						element={<StorybookPreviewPage title="KPI Bar" storyId="widgets-analytics-kpibar--default" />}
					/>
					<Route
						path="components/kpi-summary"
						element={<StorybookPreviewPage title="KPI Summary" storyId="widgets-analytics-kpisummary--default" />}
					/>
					<Route
						path="components/metric-card"
						element={<StorybookPreviewPage title="Metric Card" storyId="widgets-analytics-metriccard--default" />}
					/>
					<Route
						path="components/trend-chart"
						element={<StorybookPreviewPage title="Trend Chart" storyId="widgets-charts-trend-chart--default" />}
					/>
					<Route
						path="components/building-model-placeholder"
						element={
							<StorybookPreviewPage
								title="Building Model Placeholder"
								storyId="widgets-map-building-model-placeholder--default"
							/>
						}
					/>
					<Route
						path="components/map-compass"
						element={<StorybookPreviewPage title="Map Compass" storyId="widgets-map-map-compass--default" />}
					/>
					<Route
						path="components/side-menu"
						element={<StorybookPreviewPage title="Side Menu" storyId="widgets-navigation-side-menu--integrations" />}
					/>
					<Route
						path="components/add-observation-dialog"
						element={
							<StorybookPreviewPage
								title="Add Observation Dialog"
								storyId="components-overlay-addobservationdialog--default"
							/>
						}
					/>
					<Route
						path="components/export-dialog"
						element={<StorybookPreviewPage title="Export Dialog" storyId="components-overlay-exportdialog--default" />}
					/>
					<Route
						path="components/fragment-viewer"
						element={
							<StorybookPreviewPage title="Fragment Viewer" storyId="widgets-three-js-fragment-viewer--default" />
						}
					/>
					<Route
						path="components/permission-matrix"
						element={
							<StorybookPreviewPage title="Permission Matrix" storyId="widgets-admin-permission-matrix--default" />
						}
					/>
					<Route
						path="components/profile"
						element={<StorybookPreviewPage title="Profile" storyId="widgets-profile--default" />}
					/>

					{/* Chart routes */}
					<Route path="charts/bar" element={<BarChartPage />} />
					<Route path="charts/line" element={<LineChartPage />} />
					<Route path="charts/area" element={<AreaChartPage />} />
					<Route path="charts/pie" element={<PieChartPage />} />
					<Route path="charts/scatter" element={<ScatterChartPage />} />
					<Route path="charts/radar" element={<RadarChartPage />} />
					<Route path="charts/gauge" element={<GaugeChartPage />} />
					<Route path="charts/heatmap" element={<HeatmapChartPage />} />
					<Route path="charts/treemap" element={<TreemapChartPage />} />
					<Route path="charts/funnel" element={<FunnelChartPage />} />

					{/* Dashboard routes - Organization Level */}
					<Route path="dashboard/login" element={<LoginPageDemo />} />
					<Route path="dashboard/org-overview" element={<OrgOverviewDemo />} />
					<Route path="dashboard/org-performance" element={<OrgPerformanceDemo />} />
					<Route path="dashboard/org-workforce" element={<OrgWorkforceDemo />} />
					<Route path="dashboard/org-reality-capture" element={<OrgRealityCaptureDemo />} />
					<Route path="dashboard/org-ai-report" element={<OrgAIReportDemo />} />

					{/* Dashboard routes - Project Level */}
					<Route path="dashboard/project-overview" element={<ProjectOverviewDemo />} />
					<Route path="dashboard/project-schedule-cost" element={<ProjectScheduleCostDemo />} />
					<Route path="dashboard/project-workforce-safety" element={<ProjectWorkforceSafetyDemo />} />
					<Route path="dashboard/project-quality-issues" element={<ProjectQualityIssuesDemo />} />
					<Route path="dashboard/project-reality-capture" element={<ProjectRealityCaptureDemo />} />

					{/* Examples */}
					<Route path="examples/app-layout" element={<AppLayoutPage />} />
					<Route path="examples/app-layout-2" element={<AppLayout2Page />} />
					<Route path="examples/app-layout-3" element={<AppLayout3Page />} />
					<Route path="examples/content-dashboard" element={<ContentDashboardPage />} />
					<Route path="examples/content-layout" element={<ContentLayoutPage />} />
					<Route path="examples/design-canvas" element={<DesignCanvasExamplePage />} />
					<Route path="examples/model-viewer" element={<ModelViewerPage />} />
					<Route path="examples/object-drawing-canvas" element={<ObjectDrawingCanvasPage />} />
					<Route path="examples/blueprint-viewer" element={<BlueprintViewerPage />} />
					<Route path="examples/blueprint-viewer-2" element={<BlueprintViewer2Page />} />
					<Route path="examples/content-layout-2" element={<ContentLayout2Page />} />
					<Route path="examples/content-layout-3" element={<ContentLayout3Page />} />
					<Route path="examples/content-layout-4" element={<ContentLayout4Page />} />
					<Route path="examples/content-layout-5" element={<ContentLayout5Page />} />
					<Route path="examples/fixed-content-1" element={<FixedContent1Page />} />
					<Route path="examples/fixed-content-2" element={<FixedContent2Page />} />
					<Route path="examples/fixed-content-3" element={<FixedContent3Page />} />
					<Route path="examples/fixed-content-4" element={<FixedContent4Page />} />
					<Route path="examples/progress-details" element={<ProgressDetailsPage />} />
					<Route path="examples/tasks-management" element={<TasksManagementPage />} />
					<Route path="examples/map-dashboard" element={<MapDashboardPage />} />
					<Route path="examples/overview" element={<OverviewExamplePage />} />
					<Route path="examples/project-setup" element={<ProjectSetupExamplePage />} />
					<Route path="examples/task-monitor" element={<TaskMonitorExamplePage />} />
					<Route path="examples/template-parts-review" element={<TemplatePartsReviewPage />} />

					{/* Dashboard routes - Shared Components */}
					<Route path="dashboard/header" element={<DashboardHeaderDemo />} />
					<Route path="dashboard/top-navigation" element={<TopNavigationDemo />} />
					<Route path="dashboard/filter-strip" element={<FilterStripDemo />} />
					<Route path="dashboard/chat-widget" element={<ChatWidgetDemo />} />
				</Route>
			</Routes>
			<Toaster position="top-right" />
		</BrowserRouter>
	);
}
