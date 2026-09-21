import {Sidebar, SidebarContent, SidebarHeader, Toolbar, ZoomTools} from "@wakecap/core-ui";

export const Studio = () => (
	<div className="studio-shell">
		<Sidebar>
			<SidebarHeader />
			<SidebarContent />
		</Sidebar>
		<main className="canvas" data-wakecore-region="canvas">
			<Toolbar />
			<div className="absolute-canvas-tools">
				<ZoomTools />
			</div>
		</main>
	</div>
);
