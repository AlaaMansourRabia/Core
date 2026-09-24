import type {Meta, StoryObj} from "storybook/internal/types";

import {Avatar, AvatarFallback} from "@corensystem/coren-ui/avatar";
import {Badge} from "@corensystem/coren-ui/badge";
import {Button} from "@corensystem/coren-ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@corensystem/coren-ui/dropdown-menu";
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";
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
} from "@corensystem/coren-ui/push-panel";
import {Separator} from "@corensystem/coren-ui/separator";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@corensystem/coren-ui/tabs";
import {
	Award,
	Calendar,
	Copy,
	Download,
	Edit2,
	GraduationCap,
	ListIcon,
	MoreHorizontal,
	PanelLeft,
	PanelRight,
	Printer,
	Share2,
	Smartphone,
	Trash2,
	Users,
	X,
} from "lucide-react";
import * as React from "react";

const meta = {
	title: "Components/Layout/PushPanel",
	component: PushPanel,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"A push-style side panel that slides in from the edge and pushes the main content. Uses a context provider for state management with controlled and uncontrolled modes.",
			},
		},
	},
} satisfies Meta<typeof PushPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Right Side Panel ──

export const RightSidePanel: Story = {
	render: () => {
		const [open, setOpen] = React.useState(false);
		return (
			<PushPanelProvider open={open} onOpenChange={setOpen} side="right">
				<PushPanelContainer className="wwc:border wwc:rounded-lg wwc:h-[400px] wwc:overflow-hidden">
					<PushPanelMain className="wwc:p-6 wwc:bg-muted/30">
						<div className="wwc:flex wwc:flex-col wwc:items-center wwc:justify-center wwc:h-full wwc:gap-3">
							<PanelRight className="wwc:h-10 wwc:w-10 wwc:text-muted-foreground" />
							<p className="wwc:text-sm wwc:text-muted-foreground wwc:text-center">
								Click the button to open the panel.
							</p>
							<PushPanelTrigger asChild>
								<Button size="sm">
									<PanelRight className="wwc:h-4 wwc:w-4 wwc:mr-2" />
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
								<Label htmlFor="r-name">Name</Label>
								<Input id="r-name" placeholder="Enter name" />
							</div>
							<div className="wwc:space-y-1">
								<Label htmlFor="r-email">Email</Label>
								<Input id="r-email" type="email" placeholder="Enter email" />
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
		);
	},
};

// ── Left Side Panel ──

export const LeftSidePanel: Story = {
	render: () => {
		const [open, setOpen] = React.useState(false);
		return (
			<PushPanelProvider open={open} onOpenChange={setOpen} side="left">
				<PushPanelContainer className="wwc:border wwc:rounded-lg wwc:h-[350px] wwc:overflow-hidden">
					<PushPanelMain className="wwc:p-6 wwc:bg-muted/30">
						<div className="wwc:flex wwc:flex-col wwc:items-center wwc:justify-center wwc:h-full wwc:gap-3">
							<PanelLeft className="wwc:h-10 wwc:w-10 wwc:text-muted-foreground" />
							<PushPanelTrigger asChild>
								<Button size="sm">
									<PanelLeft className="wwc:h-4 wwc:w-4 wwc:mr-2" />
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
		);
	},
};

// ── Profile View Pattern ──

const workers = [
	{id: 1, name: "John Doe", code: "123423", role: "Supervisor", department: "Support & maintenance"},
	{id: 2, name: "Jane Smith", code: "123424", role: "Engineer", department: "Operations"},
	{id: 3, name: "Ahmed Ali", code: "123425", role: "Technician", department: "Field Services"},
];

export const ProfileViewPattern: Story = {
	render: () => {
		const [open, setOpen] = React.useState(false);
		const [selected, setSelected] = React.useState<(typeof workers)[0] | null>(null);

		return (
			<PushPanelProvider open={open} onOpenChange={setOpen} side="right">
				<PushPanelContainer className="wwc:border wwc:rounded-lg wwc:h-[520px] wwc:overflow-hidden">
					<PushPanelMain className="wwc:p-4">
						<div className="wwc:space-y-2">
							<h3 className="wwc:font-medium wwc:text-sm wwc:mb-2">Workers</h3>
							{workers.map((worker) => (
								<button
									key={worker.id}
									onClick={() => {
										setSelected(worker);
										setOpen(true);
									}}
									className={`wwc:w-full wwc:text-left wwc:p-2 wwc:rounded-lg wwc:border wwc:transition-colors wwc:hover:bg-muted ${
										selected?.id === worker.id && open
											? "wwc:border-primary wwc:bg-primary/5"
											: "wwc:border-transparent"
									}`}
								>
									<div className="wwc:flex wwc:items-center wwc:gap-3">
										<Avatar className="wwc:h-10 wwc:w-10">
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
									<AvatarFallback className="wwc:text-xs">
										{selected?.name
											.split(" ")
											.map((n) => n[0])
											.join("") || "?"}
									</AvatarFallback>
								</Avatar>
								<PushPanelTitle>{selected?.name || "Worker"}</PushPanelTitle>
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
						{selected && (
							<Tabs defaultValue="general" className="wwc:flex-1 wwc:flex wwc:flex-col wwc:overflow-hidden">
								<div className="wwc:px-4 wwc:py-2 wwc:shrink-0">
									<TabsList>
										<TabsTrigger value="general">
											<ListIcon className="wwc:h-4 wwc:w-4" />
										</TabsTrigger>
										<TabsTrigger value="certificates">
											<Award className="wwc:h-4 wwc:w-4" />
										</TabsTrigger>
										<TabsTrigger value="trainings">
											<GraduationCap className="wwc:h-4 wwc:w-4" />
										</TabsTrigger>
										<TabsTrigger value="device">
											<Smartphone className="wwc:h-4 wwc:w-4" />
										</TabsTrigger>
										<TabsTrigger value="crew">
											<Users className="wwc:h-4 wwc:w-4" />
										</TabsTrigger>
										<TabsTrigger value="visits">
											<Calendar className="wwc:h-4 wwc:w-4" />
										</TabsTrigger>
									</TabsList>
								</div>
								<TabsContent value="general" className="wwc:flex-1 wwc:overflow-auto wwc:m-0 wwc:p-4">
									<h4 className="wwc:font-medium wwc:text-sm wwc:mb-3">General</h4>
									<div className="wwc:space-y-2.5">
										<div className="wwc:flex wwc:justify-between wwc:text-sm">
											<span className="wwc:text-muted-foreground">Name:</span>
											<span className="wwc:font-medium">{selected.name}</span>
										</div>
										<div className="wwc:flex wwc:justify-between wwc:text-sm">
											<span className="wwc:text-muted-foreground">Code:</span>
											<span className="wwc:font-medium">{selected.code}</span>
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
											<span className="wwc:font-medium">{selected.role}</span>
										</div>
										<div className="wwc:flex wwc:justify-between wwc:text-sm">
											<span className="wwc:text-muted-foreground">Department:</span>
											<span className="wwc:font-medium">{selected.department}</span>
										</div>
										<Separator />
										<div className="wwc:flex wwc:justify-between wwc:text-sm">
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
									<p className="wwc:text-sm wwc:text-muted-foreground">No training records found.</p>
								</TabsContent>
								<TabsContent value="device" className="wwc:flex-1 wwc:overflow-auto wwc:m-0 wwc:p-4">
									<h4 className="wwc:font-medium wwc:text-sm wwc:mb-3">Device</h4>
									<p className="wwc:text-sm wwc:text-muted-foreground">No device assigned.</p>
								</TabsContent>
								<TabsContent value="crew" className="wwc:flex-1 wwc:overflow-auto wwc:m-0 wwc:p-4">
									<h4 className="wwc:font-medium wwc:text-sm wwc:mb-3">Crew</h4>
									<p className="wwc:text-sm wwc:text-muted-foreground">No crew assignment.</p>
								</TabsContent>
								<TabsContent value="visits" className="wwc:flex-1 wwc:overflow-auto wwc:m-0 wwc:p-4">
									<h4 className="wwc:font-medium wwc:text-sm wwc:mb-3">Visits</h4>
									<p className="wwc:text-sm wwc:text-muted-foreground">No visit records.</p>
								</TabsContent>
							</Tabs>
						)}
					</PushPanel>
				</PushPanelContainer>
			</PushPanelProvider>
		);
	},
};
