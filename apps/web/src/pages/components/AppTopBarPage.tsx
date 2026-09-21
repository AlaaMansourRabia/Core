import {useState} from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {CoreAppTopBar} from "@/components/ui/navigation/core-app-top-bar";

const PROJECTS = [
	"Fadhili GIP PKG 1",
	"ISSD_BI-10-13202",
	"Jafurah-JFGP-PKG-03",
	"Jafurah-Phase 2",
	"Jazan Refinery-Boiler Pkg.",
	"JC3C4",
];

export function AppTopBarPage() {
	const [selectedProject, setSelectedProject] = useState("Fadhili GIP PKG 1");
	const [isPinned, setIsPinned] = useState(true);

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">App Top Bar</h1>
					<CopyButton
						value="App Top Bar"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					A reusable top bar with sidebar toggle, project switcher, active page title, and feedback menu.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="App Top Bar - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Top bar with sidebar toggle, project selector, centered page title, and feedback menu.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:border wwc:border-border wwc:rounded-lg wwc:overflow-hidden wwc:bg-background">
						<CoreAppTopBar
							activeLabel="Dashboard"
							selectedProject={selectedProject}
							projects={PROJECTS}
							isPinned={isPinned}
							onSelectProject={setSelectedProject}
							onToggleSidebar={() => setIsPinned((v) => !v)}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Breadcrumb</CardTitle>
						<CopyButton
							value="App Top Bar - With Breadcrumb"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						When navigating into a sub-menu (e.g. Settings), the title shows a breadcrumb path like "Settings &gt;
						General".
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:border wwc:border-border wwc:rounded-lg wwc:overflow-hidden wwc:bg-background">
						<CoreAppTopBar
							activeLabel="Settings / General"
							selectedProject="Fadhili GIP PKG 1"
							projects={PROJECTS}
							isPinned={true}
							onSelectProject={() => {}}
							onToggleSidebar={() => {}}
						/>
					</div>
					<div className="wwc:border wwc:border-border wwc:rounded-lg wwc:overflow-hidden wwc:bg-background wwc:mt-4">
						<CoreAppTopBar
							activeLabel="Settings / Members"
							selectedProject="Jafurah-Phase 2"
							projects={PROJECTS}
							isPinned={true}
							onSelectProject={() => {}}
							onToggleSidebar={() => {}}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Collapsed State</CardTitle>
						<CopyButton
							value="App Top Bar - Collapsed State"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						When the sidebar is collapsed, the toggle icon changes to indicate it can be expanded.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:border wwc:border-border wwc:rounded-lg wwc:overflow-hidden wwc:bg-background">
						<CoreAppTopBar
							activeLabel="Overview"
							selectedProject="All Projects"
							projects={PROJECTS}
							isPinned={false}
							onSelectProject={() => {}}
							onToggleSidebar={() => {}}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Custom Right Content</CardTitle>
						<CopyButton
							value="App Top Bar - Custom Right Content"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Pass custom content to the right side using the{" "}
						<code className="wwc:text-sm wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">rightContent</code> prop.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:border wwc:border-border wwc:rounded-lg wwc:overflow-hidden wwc:bg-background">
						<CoreAppTopBar
							activeLabel="Settings"
							selectedProject="Jafurah-Phase 2"
							projects={PROJECTS}
							isPinned={true}
							onSelectProject={() => {}}
							onToggleSidebar={() => {}}
							rightContent={
								<div className="wwc:ml-auto wwc:flex wwc:items-center wwc:gap-2">
									<span className="wwc:text-[12px] wwc:text-muted-foreground">Last saved 2m ago</span>
									<button
										type="button"
										className="wwc:text-[13px] wwc:font-medium wwc:bg-primary wwc:text-primary-foreground wwc:px-3 wwc:py-1 wwc:rounded-lg"
									>
										Save
									</button>
								</div>
							}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="App Top Bar - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { CoreAppTopBar } from "@/pages/components/CoreAppTopBar";

<CoreAppTopBar
  activeLabel="Dashboard"
  selectedProject="Fadhili GIP PKG 1"
  projects={["Project A", "Project B"]}
  isPinned={true}
  onSelectProject={(project) => setProject(project)}
  onToggleSidebar={() => toggleSidebar()}
  onHoverSidebar={() => peekSidebar()}
  rightContent={<CustomActions />}  // optional
/>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
