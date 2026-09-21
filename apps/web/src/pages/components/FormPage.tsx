import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {CopyButton} from "@/components/ui/copy-button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

export function FormPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Form</h1>
					<CopyButton
						value="Form"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">Building forms with React Hook Form and Zod validation.</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Basic Form</CardTitle>
						<CopyButton
							value="Form - Basic Form"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>A simple login form with email, password, and remember me checkbox.</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="wwc:space-y-4 wwc:max-w-sm">
						<div className="wwc:space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" placeholder="Enter your email" />
						</div>
						<div className="wwc:space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input id="password" type="password" placeholder="Enter your password" />
						</div>
						<div className="wwc:flex wwc:items-center wwc:space-x-2">
							<Checkbox id="remember" />
							<Label htmlFor="remember">Remember me</Label>
						</div>
						<Button type="submit">Submit</Button>
					</form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Inline Form</CardTitle>
						<CopyButton
							value="Form - Inline Form"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>A compact horizontal form layout for subscriptions.</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="wwc:flex wwc:items-end wwc:gap-2 wwc:max-w-md">
						<div className="wwc:flex-1 wwc:space-y-2">
							<Label htmlFor="newsletter">Email</Label>
							<Input id="newsletter" type="email" placeholder="Enter your email" />
						</div>
						<Button type="submit">Subscribe</Button>
					</form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Form - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Built on React Hook Form. Compound component with context-aware sub-components.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Component</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Element</th>
									<th className="wwc:text-left wwc:py-3 wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{
										component: "Form",
										element: "FormProvider",
										desc: "React Hook Form context provider wrapping the form.",
									},
									{
										component: "FormField",
										element: "Controller",
										desc: "Connects a field to React Hook Form. Accepts name, control, and render props.",
									},
									{
										component: "FormItem",
										element: "<div>",
										desc: "Wrapper with vertical spacing and ID context for accessibility.",
									},
									{
										component: "FormLabel",
										element: "<label>",
										desc: "Label that auto-links to its FormControl via htmlFor. Shows destructive color on error.",
									},
									{
										component: "FormControl",
										element: "Slot",
										desc: "Passes id, aria-describedby, and aria-invalid to its child input.",
									},
									{
										component: "FormDescription",
										element: "<p>",
										desc: "Helper text linked to the input via aria-describedby.",
									},
									{
										component: "FormMessage",
										element: "<p>",
										desc: "Displays the field's validation error message automatically.",
									},
								].map((row) => (
									<tr key={row.component} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-primary wwc:font-medium wwc:whitespace-nowrap">
											{row.component}
										</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.element}</td>
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
							value="Form - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

// Basic Form
<form className="wwc:space-y-4">
  <div className="wwc:space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" placeholder="Enter your email" />
  </div>
  <div className="wwc:space-y-2">
    <Label htmlFor="password">Password</Label>
    <Input id="password" type="password" />
  </div>
  <div className="wwc:flex wwc:items-center wwc:space-x-2">
    <Checkbox id="remember" />
    <Label htmlFor="remember">Remember me</Label>
  </div>
  <Button type="submit">Submit</Button>
</form>

// Inline Form
<form className="wwc:flex wwc:items-end wwc:gap-2">
  <div className="wwc:flex-1 wwc:space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" />
  </div>
  <Button type="submit">Subscribe</Button>
</form>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
