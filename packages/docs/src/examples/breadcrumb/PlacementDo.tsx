/**
 * Place breadcrumbs at the top of the page content.
 */
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@corensystem/coren-ui/breadcrumb";

export function PlacementDo() {
	return (
		<div className="wwc:space-y-4">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/">Home</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Settings</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<h1 className="wwc:text-2xl wwc:font-bold">Settings</h1>
			<p className="wwc:text-muted-foreground">Manage your preferences.</p>
		</div>
	);
}
