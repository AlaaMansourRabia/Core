import {cn} from "@core/core-utils";
import {ArrowUpRight, Check, Copy, X} from "lucide-react";
import {useState} from "react";

import {Badge} from "../badge";
import {Button} from "../button";
import {ScrollArea} from "../scroll-area";
import {Separator} from "../separator";
import {useFileSystem, useNodeIcon, useNodeTone, useTypeLabel} from "./context";
import {FileSystemPathText} from "./file-system-path";
import {fsAncestors, fsDescendants, fsFolderPath, fsPath, type FileSystemNode} from "./model";

// The details panel: what a row IS, without leaving the list to find out.
//
// Selecting a row fills this in; nothing here navigates unless the reader asks. That split is the
// point — "what is this?" and "take me there" are different questions, and answering the first by
// performing the second is what makes a file browser feel like a trapdoor. The one way out is the
// action at the top, which names its destination.

export interface FileSystemDetailsProps {
	node: FileSystemNode;
	onClose: () => void;
	/** Open this project's page. Only passed for a project node. */
	onOpenProject?: (node: FileSystemNode) => void;
	className?: string;
}

export function FileSystemDetails({node, onClose, onOpenProject, className}: FileSystemDetailsProps) {
	const {index, openLabel, onOpenFile} = useFileSystem();
	const Icon = useNodeIcon(node);
	const tone = useNodeTone(node);
	const typeLabel = useTypeLabel();

	const isProject = node.kind === "project";
	const project = isProject ? node : fsAncestors(index, node.id).find((a) => a.kind === "project");
	const fileCount = isProject ? fsDescendants(index, node.id).filter((n) => n.kind === "file" && !n.trashed).length : 0;
	const label = node.ref !== undefined ? openLabel?.(node) : undefined;

	return (
		<div className={cn("wwc:flex wwc:h-full wwc:flex-col wwc:border-l wwc:border-border wwc:bg-card", className)}>
			<div className="wwc:flex wwc:flex-shrink-0 wwc:items-center wwc:gap-2 wwc:border-b wwc:border-border wwc:px-3 wwc:py-2.5">
				<span className="wwc:flex-1 wwc:text-[13px] wwc:font-medium">Overview</span>
				<Button
					variant="ghost"
					icon
					size="sm"
					aria-label="Close details"
					onClick={onClose}
					className="wwc:h-6 wwc:w-6 wwc:text-muted-foreground"
				>
					<X className="wwc:h-3.5 wwc:w-3.5" />
				</Button>
			</div>

			{/* `fitWidth`: without it Radix sizes this child to its content, and a long path pushes the
			    whole body — button included — past the panel's own right edge. */}
			<ScrollArea fitWidth className="wwc:min-h-0 wwc:flex-1" scrollbarClassName="wwc:w-2">
				<div className="wwc:flex wwc:w-full wwc:min-w-0 wwc:flex-col wwc:gap-4 wwc:p-3 wwc:pr-4">
					<div className="wwc:flex wwc:min-w-0 wwc:items-start wwc:gap-2.5">
						<span
							className={cn(
								"wwc:flex wwc:h-7 wwc:w-7 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-md",
								tone,
							)}
						>
							<Icon className="wwc:h-4 wwc:w-4" />
						</span>
						<span className="wwc:min-w-0 wwc:pt-0.5 wwc:text-[15px] wwc:font-semibold wwc:leading-snug">
							{node.name}
						</span>
					</div>

					{(label || (isProject && onOpenProject)) && (
						<Button
							size="sm"
							className="wwc:w-full wwc:gap-1.5"
							onClick={() => (isProject ? onOpenProject?.(node) : onOpenFile?.(node))}
						>
							<ArrowUpRight className="wwc:h-3.5 wwc:w-3.5" />
							{isProject ? "Open project" : label}
						</Button>
					)}

					{node.description && (
						<div className="wwc:flex wwc:flex-col wwc:gap-1">
							<span className="wwc:text-[12px] wwc:font-medium wwc:text-foreground">Description</span>
							<p className="wwc:text-[13px] wwc:leading-relaxed wwc:text-foreground">{node.description}</p>
						</div>
					)}

					<Separator />

					<div className="wwc:flex wwc:flex-col wwc:gap-3">
						<Row label="Type">{typeLabel(node)}</Row>

						{/* A project sits at the top level — it IS the location, so it has none to print. */}
						{!isProject && (
							<Row label="Location">
								<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-1">
									<FileSystemPathText
										path={fsFolderPath(index, node.id)}
										className="wwc:text-[12px] wwc:text-muted-foreground"
									/>
									<CopyButton value={fsPath(index, node.id)} label="Copy path" />
								</div>
							</Row>
						)}

						{project && !isProject && <Row label="Project">{project.name}</Row>}

						{isProject && (
							<Row label="Files">
								<span className="wwc:tabular-nums">{fileCount}</span>
							</Row>
						)}

						<Row label="Tags">
							{node.tags?.length ? (
								<div className="wwc:flex wwc:flex-wrap wwc:gap-1">
									{node.tags.map((tag) => (
										<Badge key={tag} variant="secondary" className="wwc:text-[11px] wwc:font-normal">
											{tag}
										</Badge>
									))}
								</div>
							) : (
								<span className="wwc:italic wwc:text-muted-foreground">No tags</span>
							)}
						</Row>

						<Row label="Last modified">{node.updatedAt}</Row>
					</div>
				</div>
			</ScrollArea>
		</div>
	);
}

/** One metadata pair. The label column is fixed so every value lines up down the panel. */
function Row({label, children}: {label: string; children: React.ReactNode}) {
	return (
		<div className="wwc:flex wwc:min-w-0 wwc:items-start wwc:gap-3">
			<span className="wwc:w-[92px] wwc:shrink-0 wwc:pt-px wwc:text-[12px] wwc:text-muted-foreground">{label}</span>
			<div className="wwc:min-w-0 wwc:flex-1 wwc:text-[13px] wwc:text-foreground">{children}</div>
		</div>
	);
}

/**
 * Copy, with the tick that says it happened. `navigator.clipboard` is absent over plain HTTP and can
 * reject when the document is not focused, so the failure path leaves the button alone rather than
 * claiming a copy that did not occur.
 */
function CopyButton({value, label}: {value: string; label: string}) {
	const [copied, setCopied] = useState(false);
	return (
		<Button
			variant="ghost"
			icon
			size="sm"
			aria-label={label}
			className="wwc:h-5 wwc:w-5 wwc:shrink-0 wwc:text-muted-foreground"
			onClick={() => {
				navigator.clipboard
					?.writeText(value)
					.then(() => {
						setCopied(true);
						setTimeout(() => setCopied(false), 1500);
					})
					.catch(() => undefined);
			}}
		>
			{copied ? <Check className="wwc:h-3 wwc:w-3" /> : <Copy className="wwc:h-3 wwc:w-3" />}
		</Button>
	);
}
