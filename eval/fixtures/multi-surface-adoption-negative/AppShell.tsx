import {CoreAppSidebar} from "@core/core-ui";

export function AppShell({children}: {children: React.ReactNode}) {
	return (
		<div className="app-shell" data-core-shell="experiment-shell">
			<CoreAppSidebar density="compact" />
			<div className="main-shell">
				<header>Reference-brand toolbar</header>
				<div className="route-content">{children}</div>
			</div>
		</div>
	);
}
