import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

export function SheetPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Sheet</h1>
					<CopyButton
						value="Sheet"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Extends the Dialog component to display content that complements the main content of the screen.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Sides</CardTitle>
						<CopyButton
							value="Sheet - Sides"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent className="wwc:flex wwc:gap-2 wwc:flex-wrap">
					{(["top", "right", "bottom", "left"] as const).map((side) => (
						<Sheet key={side}>
							<SheetTrigger asChild>
								<Button variant="outline">{side}</Button>
							</SheetTrigger>
							<SheetContent side={side}>
								<SheetHeader>
									<SheetTitle>Edit profile</SheetTitle>
									<SheetDescription>Make changes to your profile here. Click save when you're done.</SheetDescription>
								</SheetHeader>
								<div className="wwc:grid wwc:gap-4 wwc:py-4">
									<div className="wwc:grid wwc:grid-cols-4 wwc:items-center wwc:gap-4">
										<Label htmlFor="name" className="wwc:text-right">
											Name
										</Label>
										<Input id="name" value="Pedro Duarte" className="wwc:col-span-3" />
									</div>
									<div className="wwc:grid wwc:grid-cols-4 wwc:items-center wwc:gap-4">
										<Label htmlFor="username" className="wwc:text-right">
											Username
										</Label>
										<Input id="username" value="@peduarte" className="wwc:col-span-3" />
									</div>
								</div>
								<SheetFooter>
									<SheetClose asChild>
										<Button type="submit">Save changes</Button>
									</SheetClose>
								</SheetFooter>
							</SheetContent>
						</Sheet>
					))}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Sheet - API Reference"
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
									{prop: "open", type: "boolean", def: "-", desc: "Controlled open state of the sheet."},
									{prop: "defaultOpen", type: "boolean", def: "false", desc: "Uncontrolled default open state."},
									{
										prop: "onOpenChange",
										type: "(open: boolean) => void",
										def: "-",
										desc: "Callback when the open state changes.",
									},
									{
										prop: "side",
										type: '"top" | "right" | "bottom" | "left"',
										def: '"right"',
										desc: "The side from which the sheet slides in (SheetContent).",
									},
									{prop: "className", type: "string", def: "-", desc: "Additional CSS classes for SheetContent."},
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
							value="Sheet - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

<Sheet>
  <SheetTrigger>Open</SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Are you sure?</SheetTitle>
      <SheetDescription>
        This action cannot be undone.
      </SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
