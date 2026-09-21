import * as React from "react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {FormActionBar} from "@/components/ui/form-action-bar";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

function FormShell({children, rows = 10}: {children: React.ReactNode; rows?: number}) {
	return (
		<div className="wwc:flex wwc:h-[320px] wwc:flex-col wwc:overflow-auto wwc:rounded-lg wwc:border">
			<div className="wwc:mx-auto wwc:w-full wwc:max-w-[1200px] wwc:flex-1 wwc:space-y-4 wwc:p-6">
				{Array.from({length: rows}, (_, i) => (
					<div key={i} className="wwc:space-y-1.5">
						<Label required={i === 0}>Field {i + 1}</Label>
						<Input placeholder={`Value ${i + 1}`} required={i === 0} />
					</div>
				))}
			</div>
			{children}
		</div>
	);
}

export function FormActionBarPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">FormActionBar</h1>
					<CopyButton
						value="FormActionBar"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Page-level sticky form footer — status on the left, actions on the right.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Default</CardTitle>
					<CardDescription>Scroll the form — the bar stays pinned to the bottom of the scroll region.</CardDescription>
				</CardHeader>
				<CardContent>
					<FormShell>
						<FormActionBar status="3 unsaved changes">
							<Button variant="ghost" size="sm">
								Discard
							</Button>
							<Button size="sm">Save changes</Button>
						</FormActionBar>
					</FormShell>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Placement contract</CardTitle>
					<CardDescription>
						The bar owns its own background, border, and horizontal padding. Render it as a <strong>sibling</strong> of
						the padded content container, never a child — otherwise it inherits that padding and needs negative margins
						to cancel it.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:rounded-lg wwc:p-4 wwc:text-sm wwc:overflow-x-auto">
						{`// Correct — padding on the inner div, bar as its sibling
<main className="flex min-h-0 flex-1 flex-col overflow-auto">
  <div className="mx-auto w-full max-w-[1200px] p-6">
    {/* form fields */}
  </div>
  <FormActionBar status={<><b>{count}</b> unsaved changes</>}>
    <Button variant="ghost" onClick={discard}>Discard</Button>
    <Button onClick={save}>Save changes</Button>
  </FormActionBar>
</main>

// Wrong — nested inside the padded div, forcing negative margins
<main className="overflow-auto p-6">
  {/* form fields */}
  <div className="sticky bottom-0 -mx-6 -mb-6">…</div>
</main>`}
					</pre>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Not sticky</CardTitle>
					<CardDescription>
						<code>sticky={"{false}"}</code> renders the bar in normal flow.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FormShell rows={2}>
						<FormActionBar status="New role — not saved yet" sticky={false}>
							<Button size="sm">Save role</Button>
						</FormActionBar>
					</FormShell>
				</CardContent>
			</Card>
		</div>
	);
}
