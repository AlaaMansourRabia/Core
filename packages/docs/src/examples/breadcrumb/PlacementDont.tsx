/**
 * Avoid burying breadcrumbs below page content.
 */
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@corensystem/coren-ui/breadcrumb";

export function PlacementDont() {
	return (
		<div className="wwc:space-y-4">
			<h1 className="wwc:text-2xl wwc:font-bold">Settings</h1>
			<p className="wwc:text-muted-foreground">Manage your preferences.</p>
			<div className="wwc:border-t wwc:pt-4 wwc:mt-8">
				<p className="wwc:text-sm wwc:text-muted-foreground">You are here:</p>
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
			</div>
		</div>
	);
}
