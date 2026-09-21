import {
	AlertTriangle,
	BarChart3,
	Bell,
	BookOpen,
	Building2,
	Camera,
	Check,
	ChevronLeft,
	ChevronRight,
	ChevronsUpDown,
	ClipboardCheck,
	Clock,
	Cloud,
	Edit,
	Eye,
	Globe,
	Home,
	LayoutGrid,
	LifeBuoy,
	LogOut,
	Monitor,
	Moon,
	MoreHorizontal,
	Package,
	PanelRightOpen,
	Search,
	Settings,
	Smile,
	Sparkles,
	Sun,
	TrendingUp,
	Users,
	Video,
} from "lucide-react";
import {useState, useEffect, useRef} from "react";

import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Input} from "@/components/ui/input";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Separator} from "@/components/ui/separator";

// ─── Types ──────────────────────────────────────────────────────────────────

type NavItem = {
	id: string;
	label: string;
	icon: React.ComponentType<{className?: string}>;
	badge?: string;
	expandable?: boolean;
	subMenu?: SubMenu;
};

type NavGroup = {
	label?: string;
	items: NavItem[];
};

type SubMenu = {
	title: string;
	groups: SubMenuGroup[];
};

type SubMenuGroup = {
	label?: string;
	items: SubItem[];
};

type SubItem = {
	id: string;
	label: string;
	icon: React.ComponentType<{className?: string}>;
	badge?: string;
};

type NotifTab = "all" | "projects" | "system";
type ThemeMode = "system" | "light" | "dark";
type View = "main" | "sub";

// ─── Data ────────────────────────────────────────────────────────────────────

const PROJECT_GROUPS: NavGroup[] = [
	{
		items: [{id: "proj-dashboard", label: "Dashboard", icon: LayoutGrid}],
	},
	{
		label: "Workforce",
		items: [
			{id: "proj-verify-time", label: "Verify Time", icon: Clock},
			{id: "proj-site-workforce", label: "Site Workforce", icon: Users},
			{id: "proj-reports", label: "Reports", icon: ClipboardCheck},
		],
	},
	{
		label: "Site Operations",
		items: [
			{id: "proj-network-admin", label: "Network Administrator", icon: Globe},
			{id: "proj-map", label: "Map", icon: Globe},
			{id: "proj-vision-ai", label: "Vision AI", icon: Eye},
			{id: "proj-observation-mgr", label: "Observation Manager", icon: AlertTriangle},
		],
	},
	{
		label: "Tools",
		items: [
			{id: "proj-verify-response", label: "Verify Response", icon: Check},
			{id: "proj-weather", label: "Weather Station", icon: Cloud},
			{id: "proj-equipment", label: "Equipments", icon: Settings},
			{id: "proj-wecare", label: "Wecare", icon: LifeBuoy},
			{id: "proj-capture", label: "Capture", icon: Camera},
		],
	},
];

// ─── Org-level nav ────────────────────────────────────────────────────────────

const ORG_GROUPS: NavGroup[] = [
	{
		items: [
			{id: "org-overview", label: "Overview", icon: LayoutGrid},
			{id: "org-projects", label: "Projects", icon: Package},
		],
	},
	{
		label: "Monitoring",
		items: [
			{id: "org-compliance", label: "Compliance Forms", icon: ClipboardCheck},
			{id: "org-observations", label: "Observations", icon: Eye},
			{id: "org-cctv", label: "CCTV", icon: Video},
			{id: "org-progress", label: "Progress", icon: TrendingUp},
		],
	},
	{
		label: "Intelligence",
		items: [
			{id: "org-reality-capture", label: "Reality Capture", icon: Camera},
			{id: "org-ai-reports", label: "AI Reports", icon: Sparkles},
			{id: "org-workforce", label: "Workforce Intelligence", icon: Users},
			{id: "org-performance", label: "Performance", icon: BarChart3},
		],
	},
	{
		items: [
			{
				id: "org-settings",
				label: "Settings",
				icon: Settings,
				expandable: true,
				subMenu: {
					title: "Settings",
					groups: [
						{
							items: [
								{id: "os-general", label: "General", icon: Settings},
								{id: "os-members", label: "Members", icon: Users},
								{id: "os-billing", label: "Billing", icon: Clock},
								{id: "os-integrations", label: "Integrations", icon: Building2},
							],
						},
					],
				},
			},
		],
	},
];

const SEARCH_RESULTS = [
	{id: "r1", label: "owner-dashboard", sub: "Project", icon: "W", iconBg: "wwc:bg-black"},
	{id: "r2", label: "modon-prototype", sub: "Project", icon: "▲", iconBg: "wwc:bg-black"},
	{id: "r3", label: "owner-aramco-prototype", sub: "Project", icon: "W", iconBg: "wwc:bg-black"},
	{id: "r4", label: "Marketplace", sub: "Organization Name", icon: "→", iconBg: "wwc:bg-transparent wwc:border"},
	{
		id: "r5",
		label: "Build Machines",
		sub: "Organization Name / Build and Deployment / Settings",
		icon: "⚙",
		iconBg: "wwc:bg-transparent wwc:border",
	},
	{
		id: "r6",
		label: '"what did we deploy today?"',
		sub: "Navigation Assistant",
		icon: "✦",
		iconBg: "wwc:bg-transparent wwc:border",
	},
];

const NOTIFICATIONS = [
	{
		id: "n1",
		title: "Deployment succeeded",
		body: "owner-dashboard deployed to production",
		time: "2m ago",
		unread: true,
	},
	{id: "n2", title: "Build failed", body: "modon-prototype build #42 failed", time: "1h ago", unread: true},
	{id: "n3", title: "New team member", body: "ali@core.com joined Organization Name", time: "3h ago", unread: false},
	{id: "n4", title: "Usage alert", body: "You've reached 80% of your monthly limit", time: "1d ago", unread: false},
];

const ORGS = [
	{name: "Aramco", active: true},
	{name: "Roshn", active: false},
	{name: "Emaar", active: false},
	{name: "Enppi", active: false},
	{name: "NEOM", active: false},
	{name: "Modon", active: false},
	{name: "Red Sea Global", active: false},
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function OrgAvatar({size = "md"}: {size?: "sm" | "md" | "sm-md"}) {
	const sz = size === "sm" ? "wwc:h-6 wwc:w-6" : size === "sm-md" ? "wwc:h-7 wwc:w-7" : "wwc:h-8 wwc:w-8";
	return (
		<Avatar className={sz}>
			<AvatarFallback
				className="wwc:text-white wwc:text-[10px] wwc:font-bold"
				style={{background: "radial-gradient(circle at 35% 35%, #a855f7, #6366f1, #1e40af)"}}
			/>
		</Avatar>
	);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AppSidebarDemo({
	onNavigate,
	seamless = false,
	onPin,
	onOrgClick,
	viewLevel = "project",
}: {
	onNavigate?: (label: string, keepOpen?: boolean, parentLabel?: string) => void;
	seamless?: boolean;
	onPin?: () => void;
	onOrgClick?: () => void;
	viewLevel?: "org" | "project";
} = {}) {
	const [view, setView] = useState<View>("main");
	const [activeSubMenuId, setActiveSubMenuId] = useState<string | null>(null);
	const [activeItem, setActiveItem] = useState("projects");
	const [orgOpen, setOrgOpen] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
	const [notifOpen, setNotifOpen] = useState(false);
	const [notifTab, setNotifTab] = useState<NotifTab>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [orgSearch, setOrgSearch] = useState("");
	const [theme, setTheme] = useState<ThemeMode>("system");

	const groups = viewLevel === "org" ? ORG_GROUPS : PROJECT_GROUPS;
	const allNavItems = groups.flatMap((g) => g.items);
	const activeSubMenu = allNavItems.find((n) => n.id === activeSubMenuId)?.subMenu ?? null;

	// Reset to main view when level switches and navigate to the first tab
	const onNavigateRef = useRef(onNavigate);
	onNavigateRef.current = onNavigate;
	const prevViewLevel = useRef(viewLevel);
	useEffect(() => {
		setView("main");
		setActiveSubMenuId(null);
		const firstItem = viewLevel === "org" ? ORG_GROUPS[0]?.items[0] : PROJECT_GROUPS[0]?.items[0];
		if (firstItem) {
			setActiveItem(firstItem.id);
			// Only navigate when viewLevel actually changes, not on initial mount
			if (prevViewLevel.current !== viewLevel) {
				onNavigateRef.current?.(firstItem.label);
			}
			prevViewLevel.current = viewLevel;
		}
	}, [viewLevel]);

	function openSub(item: NavItem) {
		if (item.expandable && item.subMenu) {
			setActiveSubMenuId(item.id);
			setView("sub");
			const firstSubItem = item.subMenu.groups[0]?.items[0];
			if (firstSubItem) {
				setActiveItem(firstSubItem.id);
				onNavigate?.(firstSubItem.label, true, item.label);
			} else {
				onNavigate?.(item.label, true);
			}
		} else {
			setActiveItem(item.id);
			onNavigate?.(item.label);
		}
	}

	function closeSub() {
		setView("main");
		setActiveSubMenuId(null);
	}

	// ── Nav item renderer ──
	function NavRow({item}: {item: NavItem}) {
		const isActive =
			activeItem === item.id || (item.subMenu?.groups.some((g) => g.items.some((i) => i.id === activeItem)) ?? false);
		return (
			<button
				type="button"
				onClick={() => openSub(item)}
				className={`wwc:w-full wwc:flex wwc:items-center wwc:gap-3 wwc:px-3 wwc:py-[7px] wwc:rounded-lg wwc:text-[13px] wwc:transition-colors wwc:group ${
					isActive
						? "wwc:bg-muted wwc:font-medium wwc:text-foreground"
						: "wwc:text-foreground/80 wwc:hover:bg-muted wwc:hover:text-foreground"
				}`}
			>
				<item.icon className="wwc:h-[15px] wwc:w-[15px] wwc:flex-shrink-0 wwc:text-muted-foreground wwc:group-hover:text-foreground" />
				<span className="wwc:flex-1 wwc:text-left wwc:truncate wwc:min-w-0">{item.label}</span>
				{item.badge && (
					<Badge
						variant="secondary"
						className="wwc:ml-1 wwc:text-[10px] wwc:px-1.5 wwc:py-0.5 wwc:rounded-full wwc:leading-none wwc:h-auto wwc:font-medium"
					>
						{item.badge}
					</Badge>
				)}
				{item.expandable && (
					<ChevronRight className="wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground wwc:flex-shrink-0" />
				)}
			</button>
		);
	}

	const filteredResults = SEARCH_RESULTS.filter(
		(r) =>
			searchQuery === "" ||
			r.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
			r.sub.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const NOTIF_TABS: {id: NotifTab; label: string}[] = [
		{id: "all", label: "All"},
		{id: "projects", label: "Projects"},
		{id: "system", label: "System"},
	];

	// ── Render ──
	return (
		<div className="wwc:relative wwc:w-[260px] wwc:h-[700px] wwc:select-none wwc:flex-shrink-0">
			{/* ── Inner sidebar (overflow-hidden for border-radius clipping) ── */}
			<div
				className={`wwc:absolute wwc:inset-0 wwc:overflow-hidden wwc:bg-background wwc:flex wwc:flex-col ${seamless ? "" : "wwc:border wwc:rounded-xl wwc:shadow-sm"}`}
			>
				{/* ── Header: Org Switcher ── */}
				<div className="wwc:h-11 wwc:flex wwc:items-center wwc:px-3 wwc:border-b wwc:flex-shrink-0">
					<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:px-2 wwc:w-full wwc:min-w-0">
						{onPin && (
							<Button
								variant="ghost"
								icon
								onClick={onPin}
								className="wwc:h-7 wwc:w-7 wwc:text-muted-foreground wwc:hover:text-foreground wwc:flex-shrink-0"
							>
								<PanelRightOpen className="wwc:h-4 wwc:w-4" />
							</Button>
						)}
						<button
							type="button"
							onClick={onOrgClick}
							className="wwc:flex wwc:items-center wwc:gap-2 wwc:min-w-0 wwc:rounded-lg wwc:hover:bg-muted wwc:px-1.5 wwc:py-1 wwc:-mx-1.5 wwc:transition-colors"
						>
							<OrgAvatar size="sm-md" />
							<span className="wwc:text-[13px] wwc:font-semibold wwc:text-foreground wwc:truncate">Aramco</span>
						</button>
						<div className="wwc:flex-1" />
						<Popover
							open={orgOpen}
							onOpenChange={(open) => {
								setOrgOpen(open);
								if (!open) setOrgSearch("");
							}}
						>
							<PopoverTrigger asChild>
								<Button
									variant="ghost"
									icon
									className={`wwc:h-7 wwc:w-7 wwc:flex-shrink-0 ${orgOpen ? "wwc:bg-accent wwc:text-foreground" : "wwc:text-muted-foreground wwc:hover:text-foreground"}`}
								>
									<ChevronsUpDown className="wwc:h-4 wwc:w-4" />
								</Button>
							</PopoverTrigger>
							<PopoverContent side="right" align="start" className="wwc:w-[300px] wwc:p-0 wwc:rounded-xl">
								<div className="wwc:px-3 wwc:pt-3 wwc:pb-2 wwc:border-b wwc:border-border wwc:flex-shrink-0">
									<div className="wwc:flex wwc:items-center wwc:gap-2">
										<Input
											autoFocus
											value={orgSearch}
											onChange={(e) => setOrgSearch(e.target.value)}
											placeholder="Find Organization..."
											className="wwc:h-9 wwc:text-[13px]"
										/>
									</div>
								</div>
								<ScrollArea className="wwc:max-h-[280px]">
									<div className="wwc:px-3 wwc:py-2 wwc:space-y-0.5">
										{ORGS.filter((o) => orgSearch === "" || o.name.toLowerCase().includes(orgSearch.toLowerCase())).map(
											(org) => (
												<button
													key={org.name}
													type="button"
													className={`wwc:w-full wwc:flex wwc:items-center wwc:gap-3 wwc:px-3 wwc:py-2.5 wwc:rounded-lg wwc:transition-colors ${org.active ? "wwc:bg-muted" : "wwc:hover:bg-muted"}`}
												>
													<OrgAvatar />
													<span className="wwc:flex-1 wwc:text-left wwc:text-[13px] wwc:font-medium wwc:truncate wwc:min-w-0">
														{org.name}
													</span>
													{org.active && <Check className="wwc:h-4 wwc:w-4 wwc:text-foreground/80 wwc:flex-shrink-0" />}
												</button>
											),
										)}
									</div>
								</ScrollArea>
							</PopoverContent>
						</Popover>
					</div>
				</div>

				{/* ── Search Bar ── */}
				<div className="wwc:px-3 wwc:py-2 wwc:border-b">
					<Popover
						open={searchOpen}
						onOpenChange={(open) => {
							setSearchOpen(open);
							if (!open) setSearchQuery("");
						}}
					>
						<PopoverTrigger asChild>
							<button
								type="button"
								className={`wwc:w-full wwc:flex wwc:items-center wwc:gap-2 wwc:px-3 wwc:h-8 wwc:rounded-lg wwc:border wwc:transition-colors ${searchOpen ? "wwc:bg-muted wwc:border-border" : "wwc:bg-muted/50 wwc:hover:bg-muted"}`}
							>
								<Search className="wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground wwc:flex-shrink-0" />
								<span className="wwc:flex-1 wwc:text-left wwc:text-[13px] wwc:text-muted-foreground">Find...</span>
								<span className="wwc:text-[11px] wwc:text-muted-foreground wwc:border wwc:rounded wwc:px-1.5 wwc:py-0.5 wwc:bg-background">
									F
								</span>
							</button>
						</PopoverTrigger>
						<PopoverContent
							side="right"
							align="start"
							className="wwc:w-[300px] wwc:p-0 wwc:rounded-xl wwc:h-[360px] wwc:flex wwc:flex-col"
						>
							<div className="wwc:px-3 wwc:pt-3 wwc:pb-2 wwc:border-b wwc:border-border wwc:flex-shrink-0">
								<div className="wwc:flex wwc:items-center wwc:gap-2">
									<Search className="wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground wwc:flex-shrink-0" />
									<Input
										autoFocus
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										placeholder="Find..."
										className="wwc:h-8 wwc:text-[13px] wwc:border-0 wwc:shadow-none wwc:focus-visible:ring-0 wwc:px-0"
									/>
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											setSearchOpen(false);
											setSearchQuery("");
										}}
										className="wwc:h-6 wwc:px-1.5 wwc:text-[11px] wwc:text-muted-foreground"
									>
										Esc
									</Button>
								</div>
							</div>
							{filteredResults.length === 0 ? (
								<div className="wwc:flex-1 wwc:flex wwc:flex-col wwc:items-center wwc:justify-center wwc:gap-2 wwc:text-center wwc:px-6">
									<Search className="wwc:h-8 wwc:w-8 wwc:text-muted-foreground/30" />
									<p className="wwc:text-[13px] wwc:font-medium wwc:text-muted-foreground">
										No results for "{searchQuery}"
									</p>
									<p className="wwc:text-[11px] wwc:text-muted-foreground/70">
										Try searching for pages, projects, or settings.
									</p>
								</div>
							) : (
								<ScrollArea className="wwc:flex-1">
									<div className="wwc:py-1">
										{filteredResults.map((r) => (
											<button
												key={r.id}
												type="button"
												className="wwc:w-full wwc:flex wwc:items-center wwc:gap-3 wwc:px-4 wwc:py-2.5 wwc:hover:bg-muted wwc:transition-colors"
											>
												<Avatar className="wwc:h-7 wwc:w-7">
													<AvatarFallback className={`wwc:text-[11px] wwc:font-bold ${r.iconBg} wwc:text-white`}>
														{r.icon}
													</AvatarFallback>
												</Avatar>
												<div className="wwc:flex-1 wwc:text-left wwc:min-w-0">
													<div className="wwc:text-[13px] wwc:font-medium wwc:text-foreground wwc:truncate">
														{r.label}
													</div>
													<div className="wwc:text-[11px] wwc:text-muted-foreground/70 wwc:truncate">{r.sub}</div>
												</div>
											</button>
										))}
									</div>
								</ScrollArea>
							)}
						</PopoverContent>
					</Popover>
				</div>

				{/* ── Nav ── */}
				<ScrollArea className="wwc:flex-1">
					{view === "main" ? (
						<div className="wwc:px-2 wwc:py-2">
							{groups.map((group, gi) => (
								<div key={group.label ?? gi}>
									{gi > 0 && <Separator className="wwc:my-2" />}
									{group.label && (
										<div className="wwc:px-3 wwc:pt-2 wwc:pb-1 wwc:text-[10px] wwc:font-semibold wwc:text-muted-foreground/40 wwc:uppercase wwc:tracking-widest">
											{group.label}
										</div>
									)}
									<div className="wwc:space-y-0.5">
										{group.items.map((item) => (
											<NavRow key={item.id} item={item} />
										))}
									</div>
								</div>
							))}
						</div>
					) : (
						/* Sub-nav view */
						<div className="wwc:px-2 wwc:py-2">
							{/* Back + Title */}
							<button
								type="button"
								onClick={closeSub}
								className="wwc:w-full wwc:flex wwc:items-center wwc:gap-2 wwc:px-3 wwc:py-2 wwc:mb-1 wwc:hover:bg-muted wwc:rounded-lg wwc:transition-colors"
							>
								<ChevronLeft className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
								<span className="wwc:text-[13px] wwc:font-semibold wwc:text-foreground">{activeSubMenu?.title}</span>
							</button>
							{activeSubMenu?.groups.map((group, gi) => (
								<div key={gi} className="wwc:mb-1">
									{group.label && (
										<div className="wwc:px-3 wwc:py-1.5 wwc:text-[10px] wwc:font-semibold wwc:text-muted-foreground/70 wwc:uppercase wwc:tracking-widest">
											{group.label}
										</div>
									)}
									{group.items.map((item) => {
										const isActive = activeItem === item.id;
										return (
											<button
												key={item.id}
												type="button"
												onClick={() => {
													setActiveItem(item.id);
													const parentItem = allNavItems.find((n) => n.id === activeSubMenuId);
													onNavigate?.(item.label, false, parentItem?.label);
												}}
												className={`wwc:w-full wwc:flex wwc:items-center wwc:gap-3 wwc:px-3 wwc:py-[7px] wwc:rounded-lg wwc:text-[13px] wwc:transition-colors ${
													isActive
														? "wwc:bg-muted wwc:font-medium wwc:text-foreground"
														: "wwc:text-foreground/80 wwc:hover:bg-muted wwc:hover:text-foreground"
												}`}
											>
												<item.icon className="wwc:h-[15px] wwc:w-[15px] wwc:flex-shrink-0 wwc:text-muted-foreground" />
												<span className="wwc:flex-1 wwc:text-left wwc:truncate wwc:min-w-0">{item.label}</span>
												{item.badge && (
													<Badge
														variant="secondary"
														className="wwc:ml-1 wwc:text-[10px] wwc:px-1.5 wwc:py-0.5 wwc:rounded-full wwc:leading-none wwc:h-auto wwc:font-medium"
													>
														{item.badge}
													</Badge>
												)}
											</button>
										);
									})}
								</div>
							))}
						</div>
					)}
				</ScrollArea>

				{/* ── Footer: Profile bar ── */}
				<div className="wwc:border-t wwc:px-3 wwc:py-2 wwc:flex wwc:items-center wwc:gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								type="button"
								className="wwc:flex wwc:items-center wwc:gap-2 wwc:flex-1 wwc:min-w-0 wwc:rounded-lg wwc:px-2 wwc:py-1.5 wwc:transition-colors wwc:hover:bg-muted"
							>
								<Avatar className="wwc:h-6 wwc:w-6">
									<AvatarFallback
										className="wwc:text-white wwc:text-[9px] wwc:font-bold"
										style={{background: "radial-gradient(circle at 35% 35%, #a855f7, #6366f1, #1e40af)"}}
									/>
								</Avatar>
								<span className="wwc:text-[12px] wwc:font-medium wwc:text-foreground/80 wwc:truncate wwc:min-w-0">
									Abdullah Alzahrani
								</span>
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent side="top" align="start" className="wwc:w-[280px] wwc:rounded-xl">
							<DropdownMenuLabel className="wwc:font-normal">
								<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2">
									<div className="wwc:min-w-0">
										<div className="wwc:text-[13px] wwc:font-semibold wwc:text-foreground wwc:truncate">
											Abdullah Alzahrani
										</div>
										<div className="wwc:text-[12px] wwc:text-muted-foreground wwc:truncate">abdullah@core.com</div>
									</div>
									<Button variant="ghost" icon className="wwc:h-7 wwc:w-7 wwc:text-muted-foreground wwc:flex-shrink-0">
										<Settings className="wwc:h-4 wwc:w-4" />
									</Button>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							{(
								[
									{label: "Feedback", icon: Smile},
									{label: "Home Page", icon: Home},
									{label: "Changelog", icon: Edit},
									{label: "Help", icon: LifeBuoy},
									{label: "Docs", icon: BookOpen},
								] as const
							).map((item) => (
								<DropdownMenuItem key={item.label} className="wwc:flex wwc:items-center wwc:justify-between wwc:py-2.5">
									<span className="wwc:text-[13px]">{item.label}</span>
									<item.icon className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
								</DropdownMenuItem>
							))}
							<div className="wwc:flex wwc:items-center wwc:justify-between wwc:px-2 wwc:py-2.5">
								<span className="wwc:text-[13px] wwc:text-foreground/80">Theme</span>
								<div className="wwc:flex wwc:items-center wwc:gap-0.5 wwc:border wwc:rounded-lg wwc:p-0.5">
									{(["system", "light", "dark"] as ThemeMode[]).map((m) => {
										const Icon = m === "system" ? Monitor : m === "light" ? Sun : Moon;
										return (
											<Button
												key={m}
												variant="ghost"
												icon
												onClick={(e) => {
													e.preventDefault();
													setTheme(m);
												}}
												className={`wwc:h-7 wwc:w-7 ${theme === m ? "wwc:bg-muted wwc:text-foreground" : "wwc:text-muted-foreground/70 wwc:hover:text-foreground"}`}
											>
												<Icon className="wwc:h-3.5 wwc:w-3.5" />
											</Button>
										);
									})}
								</div>
							</div>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="wwc:flex wwc:items-center wwc:justify-between wwc:py-2.5">
								<span className="wwc:text-[13px]">Log Out</span>
								<LogOut className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<div className="wwc:px-2 wwc:py-3">
								<div className="wwc:flex wwc:items-center wwc:justify-between">
									<div>
										<div className="wwc:text-[11px] wwc:text-muted-foreground/70 wwc:uppercase wwc:tracking-wide wwc:mb-0.5">
											Platform Status
										</div>
										<div className="wwc:text-[13px] wwc:text-muted-foreground">All systems normal.</div>
									</div>
									<div className="wwc:h-2.5 wwc:w-2.5 wwc:rounded-full wwc:bg-blue-500 wwc:flex-shrink-0" />
								</div>
							</div>
						</DropdownMenuContent>
					</DropdownMenu>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" icon className="wwc:h-7 wwc:w-7 wwc:text-muted-foreground">
								<MoreHorizontal className="wwc:h-4 wwc:w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent side="top" align="start" className="wwc:w-[280px] wwc:rounded-xl">
							<DropdownMenuLabel className="wwc:font-normal">
								<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2">
									<div className="wwc:min-w-0">
										<div className="wwc:text-[13px] wwc:font-semibold wwc:text-foreground wwc:truncate">
											Abdullah Alzahrani
										</div>
										<div className="wwc:text-[12px] wwc:text-muted-foreground wwc:truncate">abdullah@core.com</div>
									</div>
									<Button variant="ghost" icon className="wwc:h-7 wwc:w-7 wwc:text-muted-foreground wwc:flex-shrink-0">
										<Settings className="wwc:h-4 wwc:w-4" />
									</Button>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							{(
								[
									{label: "Feedback", icon: Smile},
									{label: "Home Page", icon: Home},
									{label: "Changelog", icon: Edit},
									{label: "Help", icon: LifeBuoy},
									{label: "Docs", icon: BookOpen},
								] as const
							).map((item) => (
								<DropdownMenuItem key={item.label} className="wwc:flex wwc:items-center wwc:justify-between wwc:py-2.5">
									<span className="wwc:text-[13px]">{item.label}</span>
									<item.icon className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
								</DropdownMenuItem>
							))}
							<div className="wwc:flex wwc:items-center wwc:justify-between wwc:px-2 wwc:py-2.5">
								<span className="wwc:text-[13px] wwc:text-foreground/80">Theme</span>
								<div className="wwc:flex wwc:items-center wwc:gap-0.5 wwc:border wwc:rounded-lg wwc:p-0.5">
									{(["system", "light", "dark"] as ThemeMode[]).map((m) => {
										const Icon = m === "system" ? Monitor : m === "light" ? Sun : Moon;
										return (
											<Button
												key={m}
												variant="ghost"
												icon
												onClick={(e) => {
													e.preventDefault();
													setTheme(m);
												}}
												className={`wwc:h-7 wwc:w-7 ${theme === m ? "wwc:bg-muted wwc:text-foreground" : "wwc:text-muted-foreground/70 wwc:hover:text-foreground"}`}
											>
												<Icon className="wwc:h-3.5 wwc:w-3.5" />
											</Button>
										);
									})}
								</div>
							</div>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="wwc:flex wwc:items-center wwc:justify-between wwc:py-2.5">
								<span className="wwc:text-[13px]">Log Out</span>
								<LogOut className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<div className="wwc:px-2 wwc:py-3">
								<div className="wwc:flex wwc:items-center wwc:justify-between">
									<div>
										<div className="wwc:text-[11px] wwc:text-muted-foreground/70 wwc:uppercase wwc:tracking-wide wwc:mb-0.5">
											Platform Status
										</div>
										<div className="wwc:text-[13px] wwc:text-muted-foreground">All systems normal.</div>
									</div>
									<div className="wwc:h-2.5 wwc:w-2.5 wwc:rounded-full wwc:bg-blue-500 wwc:flex-shrink-0" />
								</div>
							</div>
						</DropdownMenuContent>
					</DropdownMenu>

					<Popover open={notifOpen} onOpenChange={setNotifOpen}>
						<PopoverTrigger asChild>
							<Button variant="ghost" icon className="wwc:relative wwc:h-8 wwc:w-8">
								<Bell className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
								<span className="wwc:absolute wwc:top-1 wwc:right-1 wwc:h-2 wwc:w-2 wwc:rounded-full wwc:bg-blue-500" />
							</Button>
						</PopoverTrigger>
						<PopoverContent
							side="top"
							align="end"
							className="wwc:w-[300px] wwc:p-0 wwc:rounded-xl wwc:flex wwc:flex-col wwc:max-h-[620px]"
						>
							<div className="wwc:px-3 wwc:pt-3 wwc:pb-0 wwc:border-b wwc:border-border wwc:flex-shrink-0">
								<div className="wwc:flex wwc:gap-1">
									{NOTIF_TABS.map((t) => (
										<button
											key={t.id}
											type="button"
											onClick={() => setNotifTab(t.id)}
											className={`wwc:px-3 wwc:py-1.5 wwc:text-[12px] wwc:transition-colors ${notifTab === t.id ? "wwc:border-b-2 wwc:border-foreground wwc:text-foreground wwc:font-medium" : "wwc:text-muted-foreground wwc:hover:text-foreground"}`}
										>
											{t.label}
										</button>
									))}
								</div>
							</div>
							<ScrollArea className="wwc:flex-1">
								{NOTIFICATIONS.filter(
									(n) => notifTab === "all" || (notifTab === "system" ? n.id === "n4" : n.id !== "n4"),
								).map((n) => (
									<div
										key={n.id}
										className={`wwc:px-4 wwc:py-3 wwc:border-b wwc:last:border-b-0 wwc:hover:bg-muted wwc:transition-colors wwc:cursor-pointer ${n.unread ? "wwc:bg-accent/40" : ""}`}
									>
										<div className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-2">
											<div className="wwc:min-w-0">
												<div className="wwc:flex wwc:items-center wwc:gap-1.5">
													{n.unread && (
														<div className="wwc:h-1.5 wwc:w-1.5 wwc:rounded-full wwc:bg-blue-500 wwc:flex-shrink-0 wwc:mt-0.5" />
													)}
													<span className="wwc:text-[12px] wwc:font-medium wwc:text-foreground">{n.title}</span>
												</div>
												<div className="wwc:text-[11px] wwc:text-muted-foreground wwc:mt-0.5">{n.body}</div>
											</div>
											<span className="wwc:text-[11px] wwc:text-muted-foreground/70 wwc:flex-shrink-0">{n.time}</span>
										</div>
									</div>
								))}
							</ScrollArea>
						</PopoverContent>
					</Popover>
				</div>
			</div>
			{/* end inner sidebar */}
		</div>
	);
}
