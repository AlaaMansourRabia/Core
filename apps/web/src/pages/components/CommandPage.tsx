import {Calculator, Calendar, CreditCard, Settings, Smile, User} from "lucide-react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from "@/components/ui/command";
import {CopyButton} from "@/components/ui/copy-button";

export function CommandPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Command</h1>
					<CopyButton
						value="Command"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">Fast, composable, unstyled command menu for React.</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Command - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<Command className="wwc:rounded-lg wwc:border wwc:shadow-md">
						<CommandInput placeholder="Type a command or search..." />
						<CommandList>
							<CommandEmpty>No results found.</CommandEmpty>
							<CommandGroup heading="Suggestions">
								<CommandItem>
									<Calendar className="wwc:mr-2 wwc:h-4 wwc:w-4" />
									<span>Calendar</span>
								</CommandItem>
								<CommandItem>
									<Smile className="wwc:mr-2 wwc:h-4 wwc:w-4" />
									<span>Search Emoji</span>
								</CommandItem>
								<CommandItem>
									<Calculator className="wwc:mr-2 wwc:h-4 wwc:w-4" />
									<span>Calculator</span>
								</CommandItem>
							</CommandGroup>
							<CommandSeparator />
							<CommandGroup heading="Settings">
								<CommandItem>
									<User className="wwc:mr-2 wwc:h-4 wwc:w-4" />
									<span>Profile</span>
									<CommandShortcut>⌘P</CommandShortcut>
								</CommandItem>
								<CommandItem>
									<CreditCard className="wwc:mr-2 wwc:h-4 wwc:w-4" />
									<span>Billing</span>
									<CommandShortcut>⌘B</CommandShortcut>
								</CommandItem>
								<CommandItem>
									<Settings className="wwc:mr-2 wwc:h-4 wwc:w-4" />
									<span>Settings</span>
									<CommandShortcut>⌘S</CommandShortcut>
								</CommandItem>
							</CommandGroup>
						</CommandList>
					</Command>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Command - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Extends <code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<div>"}</code>{" "}
						HTML attributes via cmdk Command primitive.
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
									{prop: "label", type: "string", def: "—", desc: "Accessible label for the command menu."},
									{
										prop: "shouldFilter",
										type: "boolean",
										def: "true",
										desc: "Whether the command menu should filter items automatically.",
									},
									{
										prop: "filter",
										type: "(value: string, search: string) => number",
										def: "—",
										desc: "Custom filter function. Return 0 to hide, 1 to show.",
									},
									{prop: "value", type: "string", def: "—", desc: "The controlled selected value."},
									{
										prop: "onValueChange",
										type: "(value: string) => void",
										def: "—",
										desc: "Callback when the selected value changes.",
									},
									{
										prop: "loop",
										type: "boolean",
										def: "false",
										desc: "Whether keyboard navigation should loop around.",
									},
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
							value="Command - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

<Command>
  <CommandInput placeholder="Type a command..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>Calendar</CommandItem>
      <CommandItem>Search Emoji</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
