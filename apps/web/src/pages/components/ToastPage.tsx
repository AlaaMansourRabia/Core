import {toast} from "sonner";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";

export function ToastPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Toast</h1>
					<CopyButton
						value="Toast"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Brief notifications that appear temporarily to provide feedback.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default Toast</CardTitle>
						<CopyButton
							value="Toast - Default Toast"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Basic toast notification.</CardDescription>
				</CardHeader>
				<CardContent>
					<Button onClick={() => toast("This is a toast message")}>Show Toast</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Toast Variants</CardTitle>
						<CopyButton
							value="Toast - Toast Variants"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Different toast types for various scenarios.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-wrap wwc:gap-2">
						<Button variant="outline" onClick={() => toast.success("Successfully saved!")}>
							Success
						</Button>
						<Button variant="outline" onClick={() => toast.error("Something went wrong")}>
							Error
						</Button>
						<Button variant="outline" onClick={() => toast.warning("Please review your input")}>
							Warning
						</Button>
						<Button variant="outline" onClick={() => toast.info("New update available")}>
							Info
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Description</CardTitle>
						<CopyButton
							value="Toast - With Description"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Toast with additional description text.</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						variant="outline"
						onClick={() =>
							toast("Event created", {
								description: "Your event has been scheduled for tomorrow at 3pm.",
							})
						}
					>
						With Description
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Action</CardTitle>
						<CopyButton
							value="Toast - With Action"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Toast with an action button.</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						variant="outline"
						onClick={() =>
							toast("Message deleted", {
								description: "The message has been removed from your inbox.",
								action: {
									label: "Undo",
									onClick: () => toast.success("Message restored"),
								},
							})
						}
					>
						With Action
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Promise Toast</CardTitle>
						<CopyButton
							value="Toast - Promise Toast"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Toast that tracks promise state.</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						variant="outline"
						onClick={() => {
							const promise = new Promise((resolve) => setTimeout(resolve, 2000));
							toast.promise(promise, {
								loading: "Loading...",
								success: "Data loaded successfully!",
								error: "Failed to load data",
							});
						}}
					>
						Promise Toast
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Custom Duration</CardTitle>
						<CopyButton
							value="Toast - Custom Duration"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Toast with custom display duration.</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						variant="outline"
						onClick={() =>
							toast("This will stay for 10 seconds", {
								duration: 10000,
							})
						}
					>
						Long Duration
					</Button>
				</CardContent>
			</Card>

			{/* API Reference */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Toast - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						The Toast component uses Sonner under the hood. The{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<Toast>"}</code> wrapper
						extends Radix Toast primitives.
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
										prop: "variant",
										type: '"default" | "destructive"',
										def: '"default"',
										desc: "Visual style of the toast.",
									},
									{prop: "description", type: "string", def: "—", desc: "Additional description text below the title."},
									{
										prop: "action",
										type: "{ label: string; onClick: () => void }",
										def: "—",
										desc: "Action button configuration.",
									},
									{prop: "duration", type: "number", def: "4000", desc: "Auto-dismiss duration in milliseconds."},
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
							value="Toast - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { toast } from "sonner"

// Default toast
toast("This is a toast message")

// Variants
toast.success("Successfully saved!")
toast.error("Something went wrong")
toast.warning("Please review your input")
toast.info("New update available")

// With description
toast("Event created", {
  description: "Your event has been scheduled.",
})

// With action
toast("Message deleted", {
  action: {
    label: "Undo",
    onClick: () => toast.success("Restored"),
  },
})

// Promise toast
toast.promise(fetchData(), {
  loading: "Loading...",
  success: "Data loaded!",
  error: "Failed to load",
})

// Custom duration
toast("Message", { duration: 10000 })`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
