import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {Field, FieldDescription, FieldError, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";

export function FieldPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Field</h1>
					<CopyButton
						value="Field"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					A form field wrapper with label, description, and error message support.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Field - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Basic field with label and input.</CardDescription>
				</CardHeader>
				<CardContent>
					<Field className="wwc:max-w-sm">
						<FieldLabel>Email</FieldLabel>
						<Input type="email" placeholder="Enter your email" />
					</Field>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Description</CardTitle>
						<CopyButton
							value="Field - With Description"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Field with helpful description text.</CardDescription>
				</CardHeader>
				<CardContent>
					<Field className="wwc:max-w-sm">
						<FieldLabel>Username</FieldLabel>
						<Input placeholder="Enter username" />
						<FieldDescription>This will be your public display name.</FieldDescription>
					</Field>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Error</CardTitle>
						<CopyButton
							value="Field - With Error"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Field displaying validation error.</CardDescription>
				</CardHeader>
				<CardContent>
					<Field className="wwc:max-w-sm">
						<FieldLabel>Password</FieldLabel>
						<Input type="password" placeholder="Enter password" />
						<FieldError>Password must be at least 8 characters.</FieldError>
					</Field>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Required Field</CardTitle>
						<CopyButton
							value="Field - Required Field"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Field marked as required.</CardDescription>
				</CardHeader>
				<CardContent>
					<Field className="wwc:max-w-sm">
						<FieldLabel>
							Full Name <span className="wwc:text-destructive">*</span>
						</FieldLabel>
						<Input placeholder="Enter your full name" required />
						<FieldDescription>Please enter your legal name.</FieldDescription>
					</Field>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Textarea</CardTitle>
						<CopyButton
							value="Field - With Textarea"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Field with textarea input.</CardDescription>
				</CardHeader>
				<CardContent>
					<Field className="wwc:max-w-sm">
						<FieldLabel>Bio</FieldLabel>
						<Textarea placeholder="Tell us about yourself" />
						<FieldDescription>Max 500 characters.</FieldDescription>
					</Field>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Select</CardTitle>
						<CopyButton
							value="Field - With Select"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Field with select dropdown.</CardDescription>
				</CardHeader>
				<CardContent>
					<Field className="wwc:max-w-sm">
						<FieldLabel>Country</FieldLabel>
						<Select>
							<SelectTrigger>
								<SelectValue placeholder="Select a country" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="us">United States</SelectItem>
								<SelectItem value="uk">United Kingdom</SelectItem>
								<SelectItem value="ca">Canada</SelectItem>
								<SelectItem value="au">Australia</SelectItem>
							</SelectContent>
						</Select>
						<FieldDescription>Select your country of residence.</FieldDescription>
					</Field>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Complete Example</CardTitle>
						<CopyButton
							value="Field - Complete Example"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Field with all elements combined.</CardDescription>
				</CardHeader>
				<CardContent>
					<Field className="wwc:max-w-sm">
						<FieldLabel>
							Email Address <span className="wwc:text-destructive">*</span>
						</FieldLabel>
						<Input type="email" placeholder="you@example.com" />
						<FieldDescription>We'll never share your email with anyone else.</FieldDescription>
						<FieldError>Please enter a valid email address.</FieldError>
					</Field>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Field - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Compound component. Each sub-component extends its native HTML element attributes.
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
									{component: "Field", element: "<div>", desc: "Wrapper container with vertical spacing (space-y-2)."},
									{
										component: "FieldLabel",
										element: "<label>",
										desc: "Label element. Extends the Label component props.",
									},
									{component: "FieldDescription", element: "<p>", desc: "Helper text displayed below the input."},
									{component: "FieldError", element: "<p>", desc: "Error message displayed in destructive color."},
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
							value="Field - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

// Basic field
<Field>
  <FieldLabel>Email</FieldLabel>
  <Input type="email" placeholder="Enter your email" />
</Field>

// With description
<Field>
  <FieldLabel>Username</FieldLabel>
  <Input placeholder="Enter username" />
  <FieldDescription>This will be your public display name.</FieldDescription>
</Field>

// With error
<Field>
  <FieldLabel>Password</FieldLabel>
  <Input type="password" />
  <FieldError>Password must be at least 8 characters.</FieldError>
</Field>

// Required field
<Field>
  <FieldLabel>
    Full Name <span className="wwc:text-destructive">*</span>
  </FieldLabel>
  <Input required />
</Field>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
