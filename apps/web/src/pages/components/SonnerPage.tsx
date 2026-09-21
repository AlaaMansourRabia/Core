import {toast} from "sonner";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";

export function SonnerPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Sonner</h1>
					<CopyButton
						value="Sonner"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">An opinionated toast component for React.</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Toast Types</CardTitle>
						<CopyButton
							value="Sonner - Toast Types"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent className="wwc:flex wwc:gap-2 wwc:flex-wrap">
					<Button
						variant="outline"
						onClick={() =>
							toast("Event has been created", {
								description: "Sunday, December 03, 2023 at 9:00 AM",
							})
						}
					>
						Default
					</Button>
					<Button variant="outline" onClick={() => toast.success("Event has been created")}>
						Success
					</Button>
					<Button variant="outline" onClick={() => toast.error("Event has been deleted")}>
						Error
					</Button>
					<Button variant="outline" onClick={() => toast.warning("Event starts in 10 minutes")}>
						Warning
					</Button>
					<Button variant="outline" onClick={() => toast.info("Be at the meeting by 9am")}>
						Info
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Action</CardTitle>
						<CopyButton
							value="Sonner - With Action"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<Button
						variant="outline"
						onClick={() =>
							toast("Event has been created", {
								description: "Sunday, December 03, 2023 at 9:00 AM",
								action: {
									label: "Undo",
									onClick: () => console.log("Undo"),
								},
							})
						}
					>
						Show Toast with Action
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Sonner - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Extends{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<Sonner.Toaster>"}</code>{" "}
						props from the sonner library.
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
										prop: "position",
										type: '"wwc:top-left" | "wwc:top-right" | "wwc:bottom-left" | "wwc:bottom-right" | "wwc:top-center" | "wwc:bottom-center"',
										def: '"wwc:bottom-right"',
										desc: "Position of the toasts on the screen.",
									},
									{
										prop: "richColors",
										type: "boolean",
										def: "false",
										desc: "Enable rich colors for different toast types.",
									},
									{prop: "expand", type: "boolean", def: "false", desc: "Whether toasts are expanded by default."},
									{prop: "duration", type: "number", def: "4000", desc: "Duration in ms before toasts auto-dismiss."},
									{prop: "closeButton", type: "boolean", def: "false", desc: "Show a close button on each toast."},
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
							value="Sonner - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { toast } from "sonner"

// Add <Toaster /> to your app root

// Then use toast anywhere
toast("Event has been created")
toast.success("Success!")
toast.error("Something went wrong")
toast.warning("Warning!")
toast.info("Info message")

// With description
toast("Event created", {
  description: "Sunday, December 03, 2023",
})

// With action
toast("Event created", {
  action: {
    label: "Undo",
    onClick: () => console.log("Undo"),
  },
})`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
