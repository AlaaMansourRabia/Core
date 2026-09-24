import {Sidebar, SidebarContent, SidebarHeader, Toolbar, ZoomTools} from "@corensystem/coren-ui";

export const Studio = () => (
	<div className="studio-shell">
		<Sidebar>
			<SidebarHeader />
			<SidebarContent />
		</Sidebar>
		<main className="canvas" data-core-region="canvas">
			<Toolbar />
			<div className="absolute-canvas-tools">
				<ZoomTools />
			</div>
		</main>
	</div>
);
