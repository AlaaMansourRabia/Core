import * as React from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {MultiSelect} from "@/components/ui/multi-select";

const projects = [
	{value: "8f1d-neom", label: "NEOM"},
	{value: "2c4a-qiddiya", label: "Qiddiya"},
	{value: "7b3e-diriyah", label: "Diriyah"},
	{value: "9a5f-red-sea", label: "Red Sea Global"},
	{value: "1e6c-roshn", label: "ROSHN"},
	{value: "4d8b-aramco", label: "Aramco", disabled: true},
];

export function MultiSelectPage() {
	const [selected, setSelected] = React.useState<string[]>([]);
	const [invalidValue, setInvalidValue] = React.useState<string[]>([]);
	const [compact, setCompact] = React.useState<string[]>(["8f1d-neom", "7b3e-diriyah"]);

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">MultiSelect</h1>
					<CopyButton
						value="MultiSelect"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Searchable multi-select form field with removable pills. Search matches the option label, so opaque ids can be
					used as values.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="MultiSelect - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						The dropdown stays open while picking; selections appear as removable pills.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:max-w-sm">
						<MultiSelect
							options={projects}
							value={selected}
							onValueChange={setSelected}
							placeholder="Select project(s)"
							searchPlaceholder="Search projects..."
							emptyMessage="No project found."
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Invalid</CardTitle>
					<CardDescription>
						Sets <code>aria-invalid</code> and a destructive border — pair with react-hook-form validation.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:max-w-sm">
						<MultiSelect
							options={projects}
							value={invalidValue}
							onValueChange={setInvalidValue}
							placeholder="Select project(s)"
							invalid={invalidValue.length === 0}
						/>
						{invalidValue.length === 0 && (
							<p className="wwc:mt-1.5 wwc:text-xs wwc:text-destructive">Select at least one project.</p>
						)}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Without pills</CardTitle>
					<CardDescription>
						Set <code>showPills={"{false}"}</code> when space is tight — the trigger still shows the selection count.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:max-w-sm">
						<MultiSelect options={projects} value={compact} onValueChange={setCompact} showPills={false} />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Disabled</CardTitle>
					<CardDescription>The trigger and every pill remove button are disabled together.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:max-w-sm">
						<MultiSelect options={projects} value={["8f1d-neom"]} onValueChange={() => {}} disabled />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Usage</CardTitle>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:rounded-lg wwc:p-4 wwc:text-sm wwc:overflow-x-auto">
						{`import {MultiSelect} from "@core/core-ui/multi-select";

const [projectIds, setProjectIds] = React.useState<string[]>([]);

<MultiSelect
  options={projects.map((p) => ({value: p.id, label: p.name}))}
  value={projectIds}
  onValueChange={setProjectIds}
  placeholder="Select project(s)"
  searchPlaceholder="Search projects..."
  emptyMessage="No project found."
/>

// react-hook-form
<Controller
  name="projectIds"
  control={control}
  rules={{validate: (v) => v.length > 0}}
  render={({field, fieldState}) => (
    <MultiSelect
      options={options}
      value={field.value}
      onValueChange={field.onChange}
      invalid={!!fieldState.error}
    />
  )}
/>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
