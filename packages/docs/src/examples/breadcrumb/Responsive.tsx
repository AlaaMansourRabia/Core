/**
 * Responsive breadcrumb that collapses on mobile.
 */
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
	BreadcrumbEllipsis,
} from "@corensystem/coren-ui/breadcrumb";

export function Responsive() {
	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="/">Home</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator className="wwc:hidden wwc:md:block" />
				<BreadcrumbItem className="wwc:hidden wwc:md:block">
					<BreadcrumbLink href="/docs">Documentation</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator className="wwc:hidden wwc:md:block" />
				<BreadcrumbItem className="wwc:hidden wwc:md:block">
					<BreadcrumbLink href="/docs/components">Components</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>Breadcrumb</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
}
