import {Button} from "@corensystem/core-ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@corensystem/core-ui/dialog";
import {Input} from "@corensystem/core-ui/input";
import {ScrollArea} from "@corensystem/core-ui/scroll-area";
import {cn} from "@corensystem/core-utils";
import {Search} from "lucide-react";

import {
	BLUEPRINT_ASSIGNMENT_DEPTH_BASE_PADDING,
	BLUEPRINT_ASSIGNMENT_DEPTH_INDENT,
	BLUEPRINT_ASSIGNMENT_EMPTY_HEIGHT_CLASS,
	BLUEPRINT_ASSIGNMENT_LIST_HEIGHT_CLASS,
	BLUEPRINT_MENU_ICON_SIZE,
} from "./constants";
import type {AssignmentDialogState, LbsLinkOption} from "./types";

type CanvasObjectAssignmentDialogProps = {
	open: boolean;
	mode: AssignmentDialogState["mode"];
	options: LbsLinkOption[];
	search: string;
	selectedId: number | null;
	onOpenChange: (open: boolean) => void;
	onSearchChange: (value: string) => void;
	onSelectionChange: (id: number) => void;
	onSave: (linkedLbsItemId: number | null) => void;
};

export function CanvasObjectAssignmentDialog({
	open,
	mode,
	options,
	search,
	selectedId,
	onOpenChange,
	onSearchChange,
	onSelectionChange,
	onSave,
}: CanvasObjectAssignmentDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-lg overflow-hidden">
				<DialogHeader>
					<DialogTitle>{mode === "create" ? "Assign shape" : "Assign LBS item"}</DialogTitle>
					<DialogDescription>
						Choose an LBS item in this blueprint context, or save it without a link.
					</DialogDescription>
				</DialogHeader>

				<div className="min-w-0 space-y-3 overflow-hidden">
					<div className="relative min-w-0">
						<Search
							size={BLUEPRINT_MENU_ICON_SIZE}
							className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
						/>
						<Input
							value={search}
							onChange={(event) => onSearchChange(event.target.value)}
							placeholder="Search LBS items"
							className="w-full min-w-0 pl-8"
						/>
					</div>

					<ScrollArea
						className={cn(
							BLUEPRINT_ASSIGNMENT_LIST_HEIGHT_CLASS,
							"w-full max-w-full min-w-0 rounded-md border border-border",
						)}
					>
						{options.length === 0 ? (
							<div
								className={cn(
									BLUEPRINT_ASSIGNMENT_EMPTY_HEIGHT_CLASS,
									"flex items-center justify-center px-4 text-center text-sm text-muted-foreground",
								)}
							>
								No LBS items match this search.
							</div>
						) : (
							<div className="flex min-w-0 flex-col p-1">
								{options.map((option) => (
									<button
										key={option.id}
										type="button"
										onClick={() => onSelectionChange(option.id)}
										className={cn(
											"flex w-full min-w-0 max-w-full items-start gap-2 rounded-md py-2 pr-3 text-left text-sm transition-colors",
											selectedId === option.id ? "bg-primary/10 text-foreground" : "hover:bg-secondary",
										)}
										style={{
											paddingLeft:
												BLUEPRINT_ASSIGNMENT_DEPTH_BASE_PADDING + option.depth * BLUEPRINT_ASSIGNMENT_DEPTH_INDENT,
										}}
									>
										<span className="grid min-w-0 flex-1 gap-0.5">
											<span className="wrap-break-word font-medium leading-snug">{option.code}</span>
											<span className="wrap-break-word leading-snug text-muted-foreground">{option.name}</span>
										</span>
									</button>
								))}
							</div>
						)}
					</ScrollArea>
				</div>

				<DialogFooter className="flex items-center justify-between sm:justify-between">
					<Button type="button" variant="outline" onClick={() => onSave(null)}>
						Save without link
					</Button>
					<div className="flex items-center gap-2">
						<Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button type="button" onClick={() => onSave(selectedId)} disabled={selectedId === null}>
							Save
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
