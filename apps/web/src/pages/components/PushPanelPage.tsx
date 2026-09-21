import {
	ArrowUp,
	Award,
	Calendar,
	ChevronLeft,
	ChevronRight,
	Copy,
	Download,
	Edit2,
	GraduationCap,
	ListIcon,
	MapPin,
	Minus,
	MoreHorizontal,
	PanelLeft,
	PanelRight,
	Printer,
	Search,
	Share2,
	Smartphone,
	Trash2,
	Users,
	X,
} from "lucide-react";
import {useState} from "react";

import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Progress} from "@/components/ui/progress";
import {
	PushPanel,
	PushPanelClose,
	PushPanelContainer,
	PushPanelContent,
	PushPanelFooter,
	PushPanelHeader,
	PushPanelHeaderActions,
	PushPanelHeaderTitle,
	PushPanelMain,
	PushPanelProvider,
	PushPanelTitle,
	PushPanelTrigger,
} from "@/components/ui/push-panel";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Separator} from "@/components/ui/separator";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

export function PushPanelPage() {
	const [rightPanelOpen, setRightPanelOpen] = useState(false);
	const [leftPanelOpen, setLeftPanelOpen] = useState(false);
	const [profilePanelOpen, setProfilePanelOpen] = useState(false);
	const [selectedWorker, setSelectedWorker] = useState<(typeof workers)[0] | null>(null);
	const [projectsPanelOpen, setProjectsPanelOpen] = useState(true);
	const [selectedProject, setSelectedProject] = useState<(typeof projects)[0] | null>(null);
	const [projectSearchQuery, setProjectSearchQuery] = useState("");

	const projects = [
		{
			id: 1,
			name: "Downtown Tower",
			description: "42-story mixed-use development",
			schedulePercent: 72,
			scheduleHealth: "on-track",
			cpi: 1.02,
			costHealth: "on-track",
			ltiFreeDay: 145,
			safetyStatus: "safe",
			workers: 342,
			readiness: 67,
		},
		{
			id: 2,
			name: "Harbor Bridge",
			description: "Infrastructure connecting mainland to port",
			schedulePercent: 38,
			scheduleHealth: "at-risk",
			cpi: 0.89,
			costHealth: "at-risk",
			ltiFreeDay: 67,
			safetyStatus: "warning",
			workers: 128,
			readiness: 45,
		},
		{
			id: 3,
			name: "Tech Park Campus",
			description: "Modern office complex with sustainable design",
			schedulePercent: 91,
			scheduleHealth: "on-track",
			cpi: 1.05,
			costHealth: "on-track",
			ltiFreeDay: 234,
			safetyStatus: "safe",
			workers: 215,
			readiness: 89,
		},
	];

	const filteredProjects = projects.filter((p) => p.name.toLowerCase().includes(projectSearchQuery.toLowerCase()));

	const workers = [
		{id: 1, name: "John Doe", code: "123423", avatar: "", role: "Supervisor", department: "Support & maintenance"},
		{id: 2, name: "Jane Smith", code: "123424", avatar: "", role: "Engineer", department: "Operations"},
		{id: 3, name: "Ahmed Ali", code: "123425", avatar: "", role: "Technician", department: "Field Services"},
	];

	return (
		<div className="wwc:space-y-6">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Push Panel</h1>
					<CopyButton
						value="Push Panel"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">A panel that pushes page content instead of overlaying it.</p>
			</div>

			{/* Right Side Panel */}
			<Card>
				<CardHeader className="wwc:pb-3">
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Right Side Panel</CardTitle>
						<CopyButton
							value="Push Panel - Right Side Panel"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Panel slides in from the right.</CardDescription>
				</CardHeader>
				<CardContent>
					<PushPanelProvider open={rightPanelOpen} onOpenChange={setRightPanelOpen} side="right">
						<PushPanelContainer className="wwc:border wwc:rounded-lg wwc:h-[400px]">
							<PushPanelMain className="wwc:p-6 wwc:bg-muted/30">
								<div className="wwc:flex wwc:flex-col wwc:items-center wwc:justify-center wwc:h-full wwc:gap-3">
									<PanelRight className="wwc:h-10 wwc:w-10 wwc:text-muted-foreground" />
									<p className="wwc:text-sm wwc:text-muted-foreground wwc:text-center">
										Click the button to open the panel.
									</p>
									<PushPanelTrigger asChild>
										<Button size="sm">
											<PanelRight />
											Open Panel
										</Button>
									</PushPanelTrigger>
								</div>
							</PushPanelMain>
							<PushPanel width={320}>
								<PushPanelHeader>
									<PushPanelHeaderTitle>
										<PushPanelTitle>Settings</PushPanelTitle>
									</PushPanelHeaderTitle>
									<PushPanelHeaderActions>
										<PushPanelClose asChild>
											<Button variant="ghost" icon className="wwc:h-6 wwc:w-6">
												<X className="wwc:h-4 wwc:w-4" />
											</Button>
										</PushPanelClose>
									</PushPanelHeaderActions>
								</PushPanelHeader>
								<PushPanelContent className="wwc:space-y-3">
									<div className="wwc:space-y-1">
										<Label htmlFor="name">Name</Label>
										<Input id="name" placeholder="Enter name" />
									</div>
									<div className="wwc:space-y-1">
										<Label htmlFor="email">Email</Label>
										<Input id="email" type="email" placeholder="Enter email" />
									</div>
								</PushPanelContent>
								<PushPanelFooter className="wwc:justify-end">
									<PushPanelClose asChild>
										<Button variant="outline" size="sm">
											Cancel
										</Button>
									</PushPanelClose>
									<Button size="sm">Save</Button>
								</PushPanelFooter>
							</PushPanel>
						</PushPanelContainer>
					</PushPanelProvider>
				</CardContent>
			</Card>

			{/* Left Side Panel */}
			<Card>
				<CardHeader className="wwc:pb-3">
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Left Side Panel</CardTitle>
						<CopyButton
							value="Push Panel - Left Side Panel"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Panel slides in from the left.</CardDescription>
				</CardHeader>
				<CardContent>
					<PushPanelProvider open={leftPanelOpen} onOpenChange={setLeftPanelOpen} side="left">
						<PushPanelContainer className="wwc:border wwc:rounded-lg wwc:h-[350px]">
							<PushPanelMain className="wwc:p-6 wwc:bg-muted/30">
								<div className="wwc:flex wwc:flex-col wwc:items-center wwc:justify-center wwc:h-full wwc:gap-3">
									<PanelLeft className="wwc:h-10 wwc:w-10 wwc:text-muted-foreground" />
									<PushPanelTrigger asChild>
										<Button size="sm">
											<PanelLeft />
											Open Panel
										</Button>
									</PushPanelTrigger>
								</div>
							</PushPanelMain>
							<PushPanel width={260}>
								<PushPanelHeader>
									<PushPanelHeaderTitle>
										<PushPanelTitle>Menu</PushPanelTitle>
									</PushPanelHeaderTitle>
									<PushPanelHeaderActions>
										<PushPanelClose asChild>
											<Button variant="ghost" icon className="wwc:h-6 wwc:w-6">
												<X className="wwc:h-4 wwc:w-4" />
											</Button>
										</PushPanelClose>
									</PushPanelHeaderActions>
								</PushPanelHeader>
								<PushPanelContent>
									<nav className="wwc:space-y-1">
										{["Home", "Dashboard", "Profile", "Projects", "Settings"].map((item) => (
											<button
												key={item}
												className="wwc:w-full wwc:text-left wwc:px-3 wwc:py-2 wwc:rounded-md wwc:hover:bg-muted wwc:text-sm"
											>
												{item}
											</button>
										))}
									</nav>
								</PushPanelContent>
							</PushPanel>
						</PushPanelContainer>
					</PushPanelProvider>
				</CardContent>
			</Card>

			{/* Profile View Pattern */}
			<Card>
				<CardHeader className="wwc:pb-3">
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Profile View Pattern</CardTitle>
						<CopyButton
							value="Push Panel - Profile View Pattern"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Avatar header with tabbed data sections for viewing records.</CardDescription>
				</CardHeader>
				<CardContent>
					<PushPanelProvider open={profilePanelOpen} onOpenChange={setProfilePanelOpen} side="right">
						<PushPanelContainer className="wwc:border wwc:rounded-lg wwc:h-[520px]">
							<PushPanelMain className="wwc:p-4">
								<div className="wwc:space-y-2">
									<h3 className="wwc:font-medium wwc:text-sm wwc:mb-2">Workers</h3>
									{workers.map((worker) => (
										<button
											key={worker.id}
											onClick={() => {
												setSelectedWorker(worker);
												setProfilePanelOpen(true);
											}}
											className={`wwc:w-full wwc:text-left wwc:p-2 wwc:rounded-lg wwc:border wwc:transition-colors wwc:hover:bg-muted ${
												selectedWorker?.id === worker.id && profilePanelOpen
													? "wwc:border-primary wwc:bg-primary/5"
													: "wwc:border-transparent"
											}`}
										>
											<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
												<Avatar className="wwc:h-10 wwc:w-10">
													<AvatarImage src={worker.avatar} />
													<AvatarFallback>
														{worker.name
															.split(" ")
															.map((n) => n[0])
															.join("")}
													</AvatarFallback>
												</Avatar>
												<div>
													<div className="wwc:font-medium wwc:text-sm">{worker.name}</div>
													<div className="wwc:text-xs wwc:text-muted-foreground">
														{worker.role} • {worker.code}
													</div>
												</div>
											</div>
										</button>
									))}
								</div>
							</PushPanelMain>
							<PushPanel width={360}>
								<PushPanelHeader>
									<PushPanelHeaderTitle>
										<Avatar className="wwc:h-7 wwc:w-7">
											<AvatarImage src={selectedWorker?.avatar} />
											<AvatarFallback className="wwc:text-xs">
												{selectedWorker?.name
													.split(" ")
													.map((n) => n[0])
													.join("") || "?"}
											</AvatarFallback>
										</Avatar>
										<PushPanelTitle>{selectedWorker?.name || "Worker"}</PushPanelTitle>
									</PushPanelHeaderTitle>
									<PushPanelHeaderActions>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" icon className="wwc:h-6 wwc:w-6">
													<MoreHorizontal className="wwc:h-4 wwc:w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end" side="bottom">
												<DropdownMenuItem>
													<Edit2 className="wwc:h-4 wwc:w-4 wwc:mr-2" />
													Edit
												</DropdownMenuItem>
												<DropdownMenuItem>
													<Share2 className="wwc:h-4 wwc:w-4 wwc:mr-2" />
													Share
												</DropdownMenuItem>
												<DropdownMenuItem>
													<Copy className="wwc:h-4 wwc:w-4 wwc:mr-2" />
													Duplicate
												</DropdownMenuItem>
												<DropdownMenuItem>
													<Download className="wwc:h-4 wwc:w-4 wwc:mr-2" />
													Export
												</DropdownMenuItem>
												<DropdownMenuItem>
													<Printer className="wwc:h-4 wwc:w-4 wwc:mr-2" />
													Print
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem className="wwc:text-destructive wwc:focus:text-destructive">
													<Trash2 className="wwc:h-4 wwc:w-4 wwc:mr-2" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
										<PushPanelClose asChild>
											<Button variant="ghost" icon className="wwc:h-6 wwc:w-6">
												<X className="wwc:h-4 wwc:w-4" />
											</Button>
										</PushPanelClose>
									</PushPanelHeaderActions>
								</PushPanelHeader>
								{selectedWorker && (
									<Tabs defaultValue="general" className="wwc:flex-1 wwc:flex wwc:flex-col wwc:overflow-hidden">
										<div className="wwc:px-4 wwc:py-2 wwc:shrink-0">
											<TabsList>
												<TabsTrigger value="general" display="icon">
													<ListIcon className="wwc:h-4 wwc:w-4" />
												</TabsTrigger>
												<TabsTrigger value="certificates" display="icon">
													<Award className="wwc:h-4 wwc:w-4" />
												</TabsTrigger>
												<TabsTrigger value="trainings" display="icon">
													<GraduationCap className="wwc:h-4 wwc:w-4" />
												</TabsTrigger>
												<TabsTrigger value="device" display="icon">
													<Smartphone className="wwc:h-4 wwc:w-4" />
												</TabsTrigger>
												<TabsTrigger value="crew" display="icon">
													<Users className="wwc:h-4 wwc:w-4" />
												</TabsTrigger>
												<TabsTrigger value="visits" display="icon">
													<Calendar className="wwc:h-4 wwc:w-4" />
												</TabsTrigger>
											</TabsList>
										</div>
										<TabsContent value="general" className="wwc:flex-1 wwc:overflow-auto wwc:m-0 wwc:p-4">
											<h4 className="wwc:font-medium wwc:text-sm wwc:mb-3">General</h4>
											<div className="wwc:space-y-2.5">
												<div className="wwc:flex wwc:justify-between wwc:text-sm">
													<span className="wwc:text-muted-foreground">Name:</span>
													<span className="wwc:font-medium">{selectedWorker.name}</span>
												</div>
												<div className="wwc:flex wwc:justify-between wwc:text-sm">
													<span className="wwc:text-muted-foreground">Code:</span>
													<span className="wwc:font-medium">{selectedWorker.code}</span>
												</div>
												<div className="wwc:flex wwc:justify-between wwc:text-sm">
													<span className="wwc:text-muted-foreground">Company:</span>
													<span className="wwc:font-medium">Aramco</span>
												</div>
												<div className="wwc:flex wwc:justify-between wwc:text-sm">
													<span className="wwc:text-muted-foreground">Trade:</span>
													<span className="wwc:font-medium">Electrician</span>
												</div>
												<div className="wwc:flex wwc:justify-between wwc:text-sm">
													<span className="wwc:text-muted-foreground">Mobilization:</span>
													<Badge variant="default" className="wwc:h-5 wwc:text-xs">
														Mobilized
													</Badge>
												</div>
												<div className="wwc:flex wwc:justify-between wwc:text-sm">
													<span className="wwc:text-muted-foreground">Role:</span>
													<span className="wwc:font-medium">{selectedWorker.role}</span>
												</div>
												<div className="wwc:flex wwc:justify-between wwc:text-sm">
													<span className="wwc:text-muted-foreground">Department:</span>
													<span className="wwc:font-medium">{selectedWorker.department}</span>
												</div>
												<div className="wwc:flex wwc:justify-between wwc:text-sm wwc:pt-2 wwc:border-t">
													<span className="wwc:text-muted-foreground">Blood Type:</span>
													<span className="wwc:font-medium">AB+</span>
												</div>
												<div className="wwc:flex wwc:justify-between wwc:text-sm">
													<span className="wwc:text-muted-foreground">Phone Number:</span>
													<span className="wwc:font-medium">+966 566 549 213</span>
												</div>
												<div className="wwc:flex wwc:justify-between wwc:text-sm">
													<span className="wwc:text-muted-foreground">Nationality:</span>
													<span className="wwc:font-medium">Indian</span>
												</div>
												<div className="wwc:flex wwc:justify-between wwc:text-sm">
													<span className="wwc:text-muted-foreground">Email:</span>
													<span className="wwc:font-medium wwc:text-xs">john.doe@example.com</span>
												</div>
											</div>
										</TabsContent>
										<TabsContent value="certificates" className="wwc:flex-1 wwc:overflow-auto wwc:m-0 wwc:p-4">
											<h4 className="wwc:font-medium wwc:text-sm wwc:mb-3">Certificates</h4>
											<div className="wwc:space-y-4">
												{[
													{title: "Foam Work Excellence", date: "12 Oct, 2027", status: "Valid"},
													{title: "Foam Work Excellence", date: "12 Oct, 2027", status: "Expires Soon"},
													{title: "Foam Work Excellence", date: "12 Oct, 2027", status: "Expired"},
												].map((cert, i) => (
													<div key={i} className="wwc:space-y-1.5 wwc:pb-3 wwc:border-b wwc:last:border-0">
														<div className="wwc:flex wwc:justify-between wwc:text-sm">
															<span className="wwc:text-muted-foreground">Certificate Title:</span>
															<span className="wwc:font-medium">{cert.title}</span>
														</div>
														<div className="wwc:flex wwc:justify-between wwc:text-sm">
															<span className="wwc:text-muted-foreground">Expire Date:</span>
															<span className="wwc:font-medium">{cert.date}</span>
														</div>
														<div className="wwc:flex wwc:justify-between wwc:text-sm">
															<span className="wwc:text-muted-foreground">Status:</span>
															<Badge
																variant={
																	cert.status === "Valid"
																		? "default"
																		: cert.status === "Expires Soon"
																			? "secondary"
																			: "destructive"
																}
																className="wwc:h-5 wwc:text-xs"
															>
																{cert.status}
															</Badge>
														</div>
													</div>
												))}
											</div>
										</TabsContent>
										<TabsContent value="trainings" className="wwc:flex-1 wwc:overflow-auto wwc:m-0 wwc:p-4">
											<h4 className="wwc:font-medium wwc:text-sm wwc:mb-3">Trainings</h4>
											<div className="wwc:space-y-4">
												{[
													{title: "Foam Work Excellence", date: "12 Oct, 2027", status: "Valid"},
													{title: "Safety Training", date: "12 Oct, 2027", status: "Expired"},
												].map((training, i) => (
													<div key={i} className="wwc:space-y-1.5 wwc:pb-3 wwc:border-b wwc:last:border-0">
														<div className="wwc:flex wwc:justify-between wwc:text-sm">
															<span className="wwc:text-muted-foreground">Training Title:</span>
															<span className="wwc:font-medium">{training.title}</span>
														</div>
														<div className="wwc:flex wwc:justify-between wwc:text-sm">
															<span className="wwc:text-muted-foreground">Expire Date:</span>
															<span className="wwc:font-medium">{training.date}</span>
														</div>
														<div className="wwc:flex wwc:justify-between wwc:text-sm">
															<span className="wwc:text-muted-foreground">Status:</span>
															<Badge
																variant={training.status === "Valid" ? "default" : "destructive"}
																className="wwc:h-5 wwc:text-xs"
															>
																{training.status}
															</Badge>
														</div>
													</div>
												))}
											</div>
										</TabsContent>
										<TabsContent value="device" className="wwc:flex-1 wwc:overflow-auto wwc:m-0 wwc:p-4">
											<h4 className="wwc:font-medium wwc:text-sm wwc:mb-3">Device</h4>
											<div className="wwc:space-y-2.5">
												<div className="wwc:flex wwc:justify-between wwc:text-sm">
													<span className="wwc:text-muted-foreground">Device ID:</span>
													<span className="wwc:font-medium">127129</span>
												</div>
												<div className="wwc:flex wwc:justify-between wwc:text-sm">
													<span className="wwc:text-muted-foreground">Last Detected:</span>
													<span className="wwc:font-medium wwc:text-xs">12 Oct, 2026 - 1:23 AM</span>
												</div>
												<div className="wwc:flex wwc:justify-between wwc:text-sm">
													<span className="wwc:text-muted-foreground">Assigned Date:</span>
													<span className="wwc:font-medium wwc:text-xs">12 Oct, 2025 - 2:00 AM</span>
												</div>
												<div className="wwc:flex wwc:justify-between wwc:text-sm">
													<span className="wwc:text-muted-foreground">Status:</span>
													<Badge variant="default" className="wwc:h-5 wwc:text-xs">
														Online
													</Badge>
												</div>
											</div>
										</TabsContent>
										<TabsContent value="crew" className="wwc:flex-1 wwc:overflow-auto wwc:m-0 wwc:p-4">
											<h4 className="wwc:font-medium wwc:text-sm wwc:mb-3">Crew</h4>
											<div className="wwc:space-y-2.5 wwc:mb-4">
												<div className="wwc:flex wwc:justify-between wwc:text-sm">
													<span className="wwc:text-muted-foreground">Crew name:</span>
													<span className="wwc:font-medium">Carpenters</span>
												</div>
												<div className="wwc:flex wwc:justify-between wwc:text-sm">
													<span className="wwc:text-muted-foreground">Crew Code:</span>
													<span className="wwc:font-medium">12178</span>
												</div>
												<div className="wwc:flex wwc:justify-between wwc:text-sm">
													<span className="wwc:text-muted-foreground">Assigned by:</span>
													<span className="wwc:font-medium">Ahmed Salem</span>
												</div>
											</div>
											<div className="wwc:space-y-3">
												{["12 Oct", "12 Oct", "12 Oct"].map((date, i) => (
													<div key={i} className="wwc:flex wwc:gap-3 wwc:items-start">
														<div className="wwc:text-xs wwc:text-muted-foreground wwc:w-12 wwc:shrink-0 wwc:pt-0.5">
															{date}
														</div>
														<div className="wwc:w-2 wwc:h-2 wwc:rounded-full wwc:bg-primary wwc:mt-1.5 wwc:shrink-0" />
														<div>
															<div className="wwc:text-sm wwc:font-medium">Crew Name here</div>
															<div className="wwc:text-xs wwc:text-muted-foreground">Assigned By: Ahmed Ali Khan</div>
														</div>
													</div>
												))}
											</div>
										</TabsContent>
										<TabsContent value="visits" className="wwc:flex-1 wwc:overflow-auto wwc:m-0 wwc:p-4">
											<h4 className="wwc:font-medium wwc:text-sm wwc:mb-3">Clinic Visits History</h4>
											<div className="wwc:space-y-4">
												{[
													{number: "1212312", date: "12 Oct, 2027", clinic: "Clinic A", status: "Fit to work"},
													{number: "12332423", date: "12 Oct, 2027", clinic: "Clinic A", status: "Unfit to work"},
												].map((visit, i) => (
													<div key={i} className="wwc:space-y-1.5 wwc:pb-3 wwc:border-b wwc:last:border-0">
														<div className="wwc:flex wwc:justify-between wwc:text-sm">
															<span className="wwc:text-muted-foreground">Visit Number:</span>
															<span className="wwc:font-medium">{visit.number}</span>
														</div>
														<div className="wwc:flex wwc:justify-between wwc:text-sm">
															<span className="wwc:text-muted-foreground">Visit Date:</span>
															<span className="wwc:font-medium">{visit.date}</span>
														</div>
														<div className="wwc:flex wwc:justify-between wwc:text-sm">
															<span className="wwc:text-muted-foreground">Clinic Name:</span>
															<span className="wwc:font-medium">{visit.clinic}</span>
														</div>
														<div className="wwc:flex wwc:justify-between wwc:text-sm">
															<span className="wwc:text-muted-foreground">Status After Visit:</span>
															<Badge
																variant={visit.status === "Fit to work" ? "default" : "destructive"}
																className="wwc:h-5 wwc:text-xs"
															>
																{visit.status}
															</Badge>
														</div>
													</div>
												))}
											</div>
										</TabsContent>
									</Tabs>
								)}
							</PushPanel>
						</PushPanelContainer>
					</PushPanelProvider>
				</CardContent>
			</Card>

			{/* Projects List with Details Panel */}
			<Card>
				<CardHeader className="wwc:pb-3">
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Projects List with Details Panel</CardTitle>
						<CopyButton
							value="Push Panel - Projects List with Details Panel"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Left panel with project cards list, right panel shows project details when selected.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<PushPanelProvider open={projectsPanelOpen} onOpenChange={setProjectsPanelOpen} side="left">
						<PushPanelContainer className="wwc:border wwc:rounded-lg wwc:h-[500px]">
							<PushPanelMain className="wwc:relative wwc:flex">
								{/* Floating expand button when panel is closed */}
								{!projectsPanelOpen && (
									<PushPanelTrigger asChild>
										<Button
											variant="secondary"
											icon
											className="wwc:absolute wwc:left-2 wwc:top-2 wwc:z-10 wwc:h-8 wwc:w-8 wwc:shadow-md"
										>
											<ChevronRight className="wwc:h-4 wwc:w-4" />
										</Button>
									</PushPanelTrigger>
								)}

								{/* Main content area - simulated map */}
								<div className="wwc:flex-1 wwc:flex wwc:flex-col wwc:min-w-0">
									<div className="wwc:flex-1 wwc:bg-muted/30 wwc:flex wwc:items-center wwc:justify-center wwc:relative">
										<div className="wwc:text-center wwc:text-muted-foreground">
											<MapPin className="wwc:h-10 wwc:w-10 wwc:mx-auto wwc:mb-2" />
											<p className="wwc:text-sm">Map View Area</p>
											<p className="wwc:text-xs">Select a project from the list</p>
										</div>
									</div>
								</div>

								{/* Right Panel - Project Details (when selected) */}
								{selectedProject && (
									<div className="wwc:w-[280px] wwc:border-l wwc:bg-background wwc:flex wwc:flex-col wwc:shrink-0">
										<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2 wwc:px-4 wwc:h-12 wwc:border-b wwc:shrink-0">
											<h3 className="wwc:text-sm wwc:font-semibold wwc:truncate">Project Details</h3>
											<Button
												variant="ghost"
												icon
												className="wwc:h-7 wwc:w-7 wwc:shrink-0"
												onClick={() => setSelectedProject(null)}
											>
												<X className="wwc:h-4 wwc:w-4" />
											</Button>
										</div>
										<ScrollArea className="wwc:flex-1">
											<div className="wwc:space-y-4 wwc:p-4">
												{/* Thumbnail */}
												<div className="wwc:aspect-video wwc:w-full wwc:overflow-hidden wwc:rounded-lg wwc:bg-muted">
													<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:bg-gradient-to-br wwc:from-orange-100 wwc:to-orange-200 wwc:dark:from-orange-900/30 wwc:dark:to-orange-800/30">
														<span className="wwc:text-2xl wwc:font-bold wwc:text-orange-600">
															{selectedProject.name.charAt(0)}
														</span>
													</div>
												</div>

												{/* Title and Status */}
												<div>
													<h2 className="wwc:text-base wwc:font-semibold">{selectedProject.name}</h2>
													<div className="wwc:mt-2">
														<Badge variant={selectedProject.scheduleHealth === "on-track" ? "default" : "secondary"}>
															{selectedProject.scheduleHealth === "on-track" ? "On Track" : "At Risk"}
														</Badge>
													</div>
												</div>

												<p className="wwc:text-xs wwc:text-muted-foreground">{selectedProject.description}</p>

												<Button className="wwc:w-full" size="sm">
													Open Project
												</Button>

												<Separator />

												{/* Readiness */}
												<div className="wwc:space-y-2">
													<div className="wwc:flex wwc:items-center wwc:justify-between">
														<span className="wwc:text-xs wwc:font-medium">Readiness</span>
														<span className="wwc:text-xs wwc:font-bold">{selectedProject.readiness}%</span>
													</div>
													<Progress value={selectedProject.readiness} className="wwc:h-1.5" />
												</div>

												<Separator />

												{/* Tabs placeholder */}
												<Tabs defaultValue="overview" className="wwc:w-full">
													<TabsList className="wwc:w-full">
														<TabsTrigger value="overview" className="wwc:flex-1 wwc:text-xs">
															Overview
														</TabsTrigger>
														<TabsTrigger value="team" className="wwc:flex-1 wwc:text-xs">
															Team
														</TabsTrigger>
													</TabsList>
													<TabsContent value="overview" className="wwc:mt-3 wwc:space-y-2">
														<Card className="wwc:p-2">
															<div className="wwc:flex wwc:items-start wwc:gap-2">
																<MapPin className="wwc:mt-0.5 wwc:h-3 wwc:w-3 wwc:text-muted-foreground" />
																<div>
																	<p className="wwc:text-xs wwc:font-medium">Location</p>
																	<p className="wwc:text-[10px] wwc:text-muted-foreground">25.2048°N, 55.2708°E</p>
																</div>
															</div>
														</Card>
													</TabsContent>
													<TabsContent value="team" className="wwc:mt-3">
														<p className="wwc:text-xs wwc:text-muted-foreground">12 team members assigned</p>
													</TabsContent>
												</Tabs>
											</div>
										</ScrollArea>
									</div>
								)}
							</PushPanelMain>

							{/* Left Panel - Projects List */}
							<PushPanel width={300} className="wwc:border-r">
								<div className="wwc:border-b">
									<PushPanelHeader className="wwc:border-b-0">
										<PushPanelHeaderTitle>
											<PushPanelTitle>Projects</PushPanelTitle>
											<Badge variant="secondary" className="wwc:ml-2">
												{filteredProjects.length}
											</Badge>
										</PushPanelHeaderTitle>
										<PushPanelHeaderActions>
											<PushPanelTrigger asChild>
												<Button variant="ghost" icon className="wwc:h-7 wwc:w-7">
													<ChevronLeft className="wwc:h-4 wwc:w-4" />
												</Button>
											</PushPanelTrigger>
										</PushPanelHeaderActions>
									</PushPanelHeader>
									<div className="wwc:px-3 wwc:pb-3">
										<div className="wwc:relative">
											<Search className="wwc:absolute wwc:left-2 wwc:top-1/2 wwc:h-3.5 wwc:w-3.5 wwc:-translate-y-1/2 wwc:text-muted-foreground" />
											<Input
												placeholder="Search projects..."
												value={projectSearchQuery}
												onChange={(e) => setProjectSearchQuery(e.target.value)}
												className="wwc:h-8 wwc:pl-8 wwc:text-sm"
											/>
										</div>
									</div>
								</div>
								<PushPanelContent className="wwc:p-0">
									<ScrollArea className="wwc:h-full">
										<div className="wwc:space-y-2 wwc:p-3">
											{filteredProjects.map((project) => (
												<Card
													key={project.id}
													className={`wwc:cursor-pointer wwc:overflow-hidden wwc:transition-all wwc:hover:shadow-md ${
														selectedProject?.id === project.id ? "wwc:ring-2 wwc:ring-primary" : ""
													}`}
													onClick={() => setSelectedProject(project)}
												>
													<div className="wwc:p-2.5 wwc:space-y-2">
														{/* Top section */}
														<div className="wwc:flex wwc:gap-2">
															<div className="wwc:h-12 wwc:w-16 wwc:shrink-0 wwc:overflow-hidden wwc:rounded wwc:bg-muted">
																<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:bg-gradient-to-br wwc:from-orange-100 wwc:to-orange-200 wwc:dark:from-orange-900/30 wwc:dark:to-orange-800/30">
																	<span className="wwc:text-sm wwc:font-bold wwc:text-orange-600">
																		{project.name.charAt(0)}
																	</span>
																</div>
															</div>
															<div className="wwc:min-w-0 wwc:flex-1">
																<h3 className="wwc:text-xs wwc:font-semibold wwc:line-clamp-1">{project.name}</h3>
																<p className="wwc:text-[10px] wwc:text-muted-foreground wwc:line-clamp-2">
																	{project.description}
																</p>
															</div>
														</div>

														{/* KPIs Row */}
														<div className="wwc:grid wwc:grid-cols-4 wwc:gap-1 wwc:pt-1.5 wwc:border-t">
															<div className="wwc:text-center">
																<div className="wwc:flex wwc:items-center wwc:justify-center wwc:gap-0.5">
																	<span
																		className={`wwc:text-xs wwc:font-bold ${
																			project.scheduleHealth === "on-track"
																				? "wwc:text-green-600"
																				: "wwc:text-amber-600"
																		}`}
																	>
																		{project.schedulePercent}%
																	</span>
																	{project.scheduleHealth === "on-track" ? (
																		<ArrowUp className="wwc:h-2.5 wwc:w-2.5 wwc:text-green-600" />
																	) : (
																		<Minus className="wwc:h-2.5 wwc:w-2.5 wwc:text-amber-600" />
																	)}
																</div>
																<p className="wwc:text-[9px] wwc:text-muted-foreground">Schedule</p>
															</div>
															<div className="wwc:text-center">
																<div className="wwc:flex wwc:items-center wwc:justify-center wwc:gap-0.5">
																	<span
																		className={`wwc:text-xs wwc:font-bold ${
																			project.costHealth === "on-track" ? "wwc:text-green-600" : "wwc:text-amber-600"
																		}`}
																	>
																		{project.cpi.toFixed(2)}
																	</span>
																	{project.costHealth === "on-track" ? (
																		<ArrowUp className="wwc:h-2.5 wwc:w-2.5 wwc:text-green-600" />
																	) : (
																		<Minus className="wwc:h-2.5 wwc:w-2.5 wwc:text-amber-600" />
																	)}
																</div>
																<p className="wwc:text-[9px] wwc:text-muted-foreground">CPI</p>
															</div>
															<div className="wwc:text-center">
																<div className="wwc:flex wwc:items-center wwc:justify-center wwc:gap-0.5">
																	<span
																		className={`wwc:text-xs wwc:font-bold ${
																			project.safetyStatus === "safe" ? "wwc:text-green-600" : "wwc:text-amber-600"
																		}`}
																	>
																		{project.ltiFreeDay}
																	</span>
																	{project.safetyStatus === "safe" ? (
																		<ArrowUp className="wwc:h-2.5 wwc:w-2.5 wwc:text-green-600" />
																	) : (
																		<Minus className="wwc:h-2.5 wwc:w-2.5 wwc:text-amber-600" />
																	)}
																</div>
																<p className="wwc:text-[9px] wwc:text-muted-foreground">LTI-Free</p>
															</div>
															<div className="wwc:text-center">
																<span className="wwc:text-xs wwc:font-bold">{project.workers}</span>
																<p className="wwc:text-[9px] wwc:text-muted-foreground">Workers</p>
															</div>
														</div>
													</div>
												</Card>
											))}
										</div>
									</ScrollArea>
								</PushPanelContent>
							</PushPanel>
						</PushPanelContainer>
					</PushPanelProvider>
				</CardContent>
			</Card>

			{/* API Reference */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Push Panel - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Extends native{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<div>"}</code> HTML
						attributes.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Prop</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Default</th>
									<th className="wwc:text-left wwc:py-3 wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{
										prop: "open",
										type: "boolean",
										def: "—",
										desc: "Controlled open state of the panel (PushPanelProvider).",
									},
									{
										prop: "onOpenChange",
										type: "(open: boolean) => void",
										def: "—",
										desc: "Callback when open state changes (PushPanelProvider).",
									},
									{
										prop: "defaultOpen",
										type: "boolean",
										def: "false",
										desc: "Default open state for uncontrolled usage (PushPanelProvider).",
									},
									{
										prop: "side",
										type: '"left" | "right"',
										def: '"right"',
										desc: "Which side the panel slides in from (PushPanelProvider).",
									},
									{
										prop: "width",
										type: "string | number",
										def: "320",
										desc: "Width of the panel in pixels (PushPanel).",
									},
									{
										prop: "asChild",
										type: "boolean",
										def: "false",
										desc: "Merge props onto child element (PushPanelTrigger, PushPanelClose).",
									},
								].map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-primary wwc:font-medium wwc:whitespace-nowrap">
											{row.prop}
										</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.type}</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.def}</td>
										<td className="wwc:py-3 wwc:text-muted-foreground">{row.desc}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			{/* Usage */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Push Panel - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import {
  PushPanelProvider,
  PushPanelContainer,
  PushPanelMain,
  PushPanel,
  PushPanelHeader,
  PushPanelHeaderTitle,
  PushPanelHeaderActions,
  PushPanelContent,
  PushPanelFooter,
  PushPanelTitle,
  PushPanelTrigger,
  PushPanelClose,
} from "@/components/ui/push-panel"

const [open, setOpen] = useState(false)

// Basic push panel
<PushPanelProvider open={open} onOpenChange={setOpen} side="right">
  <PushPanelContainer className="wwc:h-[400px]">
    <PushPanelMain>
      <PushPanelTrigger asChild>
        <Button>Open Panel</Button>
      </PushPanelTrigger>
    </PushPanelMain>
    <PushPanel width={320}>
      <PushPanelHeader>
        <PushPanelHeaderTitle>
          <PushPanelTitle>Title</PushPanelTitle>
        </PushPanelHeaderTitle>
        <PushPanelHeaderActions>
          <PushPanelClose asChild>
            <Button variant="ghost" icon>
              <X className="wwc:h-4 wwc:w-4" />
            </Button>
          </PushPanelClose>
        </PushPanelHeaderActions>
      </PushPanelHeader>
      <PushPanelContent>
        Panel content here
      </PushPanelContent>
      <PushPanelFooter>
        <Button>Save</Button>
      </PushPanelFooter>
    </PushPanel>
  </PushPanelContainer>
</PushPanelProvider>

// Left side panel
<PushPanelProvider side="left">
  ...
</PushPanelProvider>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
