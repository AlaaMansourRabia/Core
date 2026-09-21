import {Link2, MessageSquare, Paperclip, Reply, Trash2} from "lucide-react";

import {ActivityActor, ActivityItem, ActivityLog, ActivityRef} from "@/components/ui/activity-log";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";

const propertyListProps: {prop: string; type: string; def: string; desc: string}[] = [
	{prop: "children", type: "ReactNode", def: "—", desc: "ActivityItem children. Renders inside an <ol>."},
];

const activityItemProps: {prop: string; type: string; def: string; desc: string}[] = [
	{prop: "icon", type: "ReactNode", def: "undefined", desc: "Leading icon rendered inside the circular badge."},
	{prop: "timestamp", type: "ReactNode", def: "undefined", desc: "Relative timestamp displayed after the message."},
	{prop: "children", type: "ReactNode", def: "—", desc: "The message content. Wrap actor names in <ActivityActor>."},
];

export function ActivityLogPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Activity Log</h1>
					<CopyButton
						value="Activity Log"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:text-muted-foreground">
					Vertical chronological feed of activity / history entries. A continuous connector line passes through each
					item's icon badge. Composable — each item picks its own icon, message, and relative timestamp.
				</p>
			</div>

			{/* Default — Plane-style activity feed */}
			<div>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-4">Default</h2>
				<p className="wwc:text-muted-foreground wwc:mb-4">
					A work item activity feed mixing description edits, attachment and link changes, and a relation update.
				</p>
				<div className="wwc:max-w-2xl wwc:rounded-xl wwc:border wwc:border-border wwc:bg-card wwc:p-6">
					<ActivityLog>
						<ActivityItem icon={<MessageSquare className="wwc:h-4 wwc:w-4" />} timestamp="less than a minute ago">
							<ActivityActor>samlee.mobbin+1</ActivityActor> updated the description.
						</ActivityItem>
						<ActivityItem icon={<Paperclip className="wwc:h-4 wwc:w-4" />} timestamp="about 12 hours ago">
							<ActivityActor>samlee.mobbin+1</ActivityActor> removed an attachment.
						</ActivityItem>
						<ActivityItem icon={<Link2 className="wwc:h-4 wwc:w-4" />} timestamp="about 12 hours ago">
							<ActivityActor>samlee.mobbin+1</ActivityActor> removed this <ActivityRef>link</ActivityRef>.
						</ActivityItem>
						<ActivityItem icon={<MessageSquare className="wwc:h-4 wwc:w-4" />} timestamp="about 13 hours ago">
							<ActivityActor>samlee.mobbin+1</ActivityActor> updated the description.
						</ActivityItem>
						<ActivityItem icon={<Paperclip className="wwc:h-4 wwc:w-4" />} timestamp="about 13 hours ago">
							<ActivityActor>samlee.mobbin+1</ActivityActor> uploaded a new attachment.
						</ActivityItem>
						<ActivityItem icon={<Link2 className="wwc:h-4 wwc:w-4" />} timestamp="about 13 hours ago">
							<ActivityActor>samlee.mobbin+1</ActivityActor> added <ActivityRef>link</ActivityRef>.
						</ActivityItem>
						<ActivityItem icon={<Reply className="wwc:h-4 wwc:w-4" />} timestamp="about 13 hours ago">
							<ActivityActor>samlee.mobbin+1</ActivityActor> marked that this work item relates to{" "}
							<ActivityRef>ASMOB-6</ActivityRef>.
						</ActivityItem>
						<ActivityItem icon={<MessageSquare className="wwc:h-4 wwc:w-4" />} timestamp="about 13 hours ago">
							<ActivityActor>samlee.mobbin+1</ActivityActor> updated the description.
						</ActivityItem>
						<ActivityItem icon={<MessageSquare className="wwc:h-4 wwc:w-4" />} timestamp="about 13 hours ago">
							<ActivityActor>samlee.mobbin+1</ActivityActor> updated the description.
						</ActivityItem>
					</ActivityLog>
				</div>
			</div>

			{/* Single item */}
			<div>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-4">Single item</h2>
				<p className="wwc:text-muted-foreground wwc:mb-4">
					With one item, the connector line is invisible — the icon badge stands alone.
				</p>
				<div className="wwc:max-w-2xl wwc:rounded-xl wwc:border wwc:border-border wwc:bg-card wwc:p-6">
					<ActivityLog>
						<ActivityItem icon={<MessageSquare className="wwc:h-4 wwc:w-4" />} timestamp="just now">
							<ActivityActor>alaa@wakecap.com</ActivityActor> created this work item.
						</ActivityItem>
					</ActivityLog>
				</div>
			</div>

			{/* Mixed actors and actions */}
			<div>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-4">Mixed actors and actions</h2>
				<p className="wwc:text-muted-foreground wwc:mb-4">
					Multi-author feed with a destructive action highlighted via icon choice.
				</p>
				<div className="wwc:max-w-2xl wwc:rounded-xl wwc:border wwc:border-border wwc:bg-card wwc:p-6">
					<ActivityLog>
						<ActivityItem icon={<MessageSquare className="wwc:h-4 wwc:w-4" />} timestamp="2 minutes ago">
							<ActivityActor>Layla N.</ActivityActor> commented.
						</ActivityItem>
						<ActivityItem icon={<Paperclip className="wwc:h-4 wwc:w-4" />} timestamp="1 hour ago">
							<ActivityActor>Ahmed R.</ActivityActor> uploaded <ActivityRef>safety-report.pdf</ActivityRef>.
						</ActivityItem>
						<ActivityItem icon={<Reply className="wwc:h-4 wwc:w-4" />} timestamp="3 hours ago">
							<ActivityActor>Maya K.</ActivityActor> linked this to <ActivityRef>WC-1042</ActivityRef>.
						</ActivityItem>
						<ActivityItem icon={<Trash2 className="wwc:h-4 wwc:w-4" />} timestamp="yesterday">
							<ActivityActor>Ahmed R.</ActivityActor> removed the previous attachment.
						</ActivityItem>
					</ActivityLog>
				</div>
			</div>

			{/* ActivityLog Props */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>ActivityLog Props</CardTitle>
						<CopyButton
							value="ActivityLog - Props"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-sm">
							<thead>
								<tr className="wwc:border-b wwc:border-border wwc:text-left">
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Prop</th>
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Type</th>
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Default</th>
									<th className="wwc:py-2 wwc:font-semibold">Description</th>
								</tr>
							</thead>
							<tbody>
								{propertyListProps.map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:font-medium wwc:text-primary wwc:whitespace-nowrap">
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

			{/* ActivityItem Props */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>ActivityItem Props</CardTitle>
						<CopyButton
							value="ActivityItem - Props"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-sm">
							<thead>
								<tr className="wwc:border-b wwc:border-border wwc:text-left">
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Prop</th>
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Type</th>
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Default</th>
									<th className="wwc:py-2 wwc:font-semibold">Description</th>
								</tr>
							</thead>
							<tbody>
								{activityItemProps.map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:font-medium wwc:text-primary wwc:whitespace-nowrap">
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

			{/* Usage */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Activity Log - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { ActivityLog, ActivityItem, ActivityActor, ActivityRef } from "@/components/ui/activity-log";
import { MessageSquare, Paperclip } from "lucide-react";

<ActivityLog>
  <ActivityItem
    icon={<MessageSquare className="h-4 w-4" />}
    timestamp="less than a minute ago"
  >
    <ActivityActor>samlee.mobbin+1</ActivityActor> updated the description.
  </ActivityItem>
  <ActivityItem
    icon={<Paperclip className="h-4 w-4" />}
    timestamp="about 12 hours ago"
  >
    <ActivityActor>samlee.mobbin+1</ActivityActor> uploaded a new attachment.
  </ActivityItem>
</ActivityLog>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
