import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {
	ErrorPage,
	ErrorPageAction,
	ErrorPageCode,
	ErrorPageDescription,
	ErrorPageTitle,
} from "@/components/ui/error-page";

export function ErrorPagePage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Error Page</h1>
					<CopyButton
						value="Error Page"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Minimal error page components for displaying HTTP error states.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>404 - Not Found</CardTitle>
						<CopyButton
							value="Error Page - 404 - Not Found"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Page not found error state.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:border wwc:rounded-lg">
						<ErrorPage
							type="404"
							action={
								<Button variant="outline" size="sm">
									Go Home
								</Button>
							}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>401 - Unauthorized</CardTitle>
						<CopyButton
							value="Error Page - 401 - Unauthorized"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Authentication required error state.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:border wwc:rounded-lg">
						<ErrorPage type="401" action={<Button size="sm">Sign In</Button>} />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>403 - Forbidden</CardTitle>
						<CopyButton
							value="Error Page - 403 - Forbidden"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Access denied error state.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:border wwc:rounded-lg">
						<ErrorPage
							type="403"
							action={
								<Button variant="outline" size="sm">
									Go Back
								</Button>
							}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>500 - Server Error</CardTitle>
						<CopyButton
							value="Error Page - 500 - Server Error"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Internal server error state.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:border wwc:rounded-lg">
						<ErrorPage
							type="500"
							action={
								<Button variant="outline" size="sm">
									Try Again
								</Button>
							}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>503 - Service Unavailable</CardTitle>
						<CopyButton
							value="Error Page - 503 - Service Unavailable"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Service temporarily unavailable error state.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:border wwc:rounded-lg">
						<ErrorPage
							type="503"
							action={
								<Button variant="outline" size="sm">
									Refresh
								</Button>
							}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Custom Error</CardTitle>
						<CopyButton
							value="Error Page - Custom Error"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Custom error with your own code, title, and description.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:border wwc:rounded-lg">
						<ErrorPage
							code="Offline"
							title="No Internet Connection"
							description="Please check your network settings and try again."
							action={
								<Button variant="outline" size="sm">
									Retry
								</Button>
							}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Without Code</CardTitle>
						<CopyButton
							value="Error Page - Without Code"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Error page without the error code displayed.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:border wwc:rounded-lg">
						<ErrorPage
							type="generic"
							showCode={false}
							action={
								<Button variant="outline" size="sm">
									Return Home
								</Button>
							}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Compound Components</CardTitle>
						<CopyButton
							value="Error Page - Compound Components"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Build custom error pages with individual components.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:border wwc:rounded-lg">
						<div className="wwc:flex wwc:min-h-[400px] wwc:flex-col wwc:items-center wwc:justify-center wwc:p-8 wwc:text-center">
							<ErrorPageCode>408</ErrorPageCode>
							<ErrorPageTitle>Request Timeout</ErrorPageTitle>
							<ErrorPageDescription>The server took too long to respond.</ErrorPageDescription>
							<ErrorPageAction>
								<Button variant="outline" size="sm">
									Try Again
								</Button>
							</ErrorPageAction>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Error Page - API Reference"
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
										prop: "type",
										type: '"404" | "401" | "403" | "500" | "503" | "generic"',
										def: '"generic"',
										desc: "Predefined error type with built-in code, title, and description.",
									},
									{
										prop: "code",
										type: "string",
										def: "—",
										desc: "Custom error code. Overrides the type's default code.",
									},
									{prop: "title", type: "string", def: "—", desc: "Custom title. Overrides the type's default title."},
									{
										prop: "description",
										type: "string",
										def: "—",
										desc: "Custom description. Overrides the type's default description.",
									},
									{
										prop: "action",
										type: "ReactNode",
										def: "—",
										desc: "Action element (e.g. a Button) rendered below the description.",
									},
									{prop: "showCode", type: "boolean", def: "true", desc: "Whether to display the error code."},
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

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Error Page - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { ErrorPage } from "@/components/ui/error-page"
import { Button } from "@/components/ui/button"

// Predefined error types
<ErrorPage
  type="404"
  action={<Button>Go Home</Button>}
/>

// Custom error
<ErrorPage
  code="Offline"
  title="No Internet Connection"
  description="Please check your network settings."
  action={<Button>Retry</Button>}
/>

// Without code
<ErrorPage
  type="generic"
  showCode={false}
  action={<Button>Return Home</Button>}
/>

// Compound components
<div className="wwc:flex wwc:flex-col wwc:items-center">
  <ErrorPageCode>408</ErrorPageCode>
  <ErrorPageTitle>Request Timeout</ErrorPageTitle>
  <ErrorPageDescription>
    The server took too long to respond.
  </ErrorPageDescription>
  <ErrorPageAction>
    <Button>Try Again</Button>
  </ErrorPageAction>
</div>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
