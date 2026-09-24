import {cn} from "@corensystem/coren-utils";
import * as React from "react";

import {Checkbox} from "./checkbox";
import {SectionPanel} from "./section-panel";

export type PermissionMatrixPermission = {
	id: string;
	label: string;
	disabled?: boolean;
};

export type PermissionMatrixGroup = {
	id: string;
	label: string;
	permissions: PermissionMatrixPermission[];
};

export type PermissionMatrixCategory = {
	id: string;
	label: string;
	groups: PermissionMatrixGroup[];
};

export interface PermissionMatrixProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
	categories: PermissionMatrixCategory[];
	/** Controlled map of leaf permission ids to their checked state. */
	value?: Record<string, boolean>;
	/** Initial checked state when the widget is uncontrolled. */
	defaultValue?: Record<string, boolean>;
	onValueChange?: (next: Record<string, boolean>) => void;
	/** Controlled top-level category shown in the second and third columns. */
	activeCategoryId?: string;
	defaultActiveCategoryId?: string;
	onActiveCategoryIdChange?: (id: string) => void;
	title?: string;
	selectAllLabel?: string;
	readOnly?: boolean;
	/** Hides the SectionPanel header while retaining the permission grid. */
	showHeader?: boolean;
}

type CheckedState = boolean | "indeterminate";

function permissionIds(category: PermissionMatrixCategory): string[] {
	return category.groups.flatMap((group) => group.permissions.map((permission) => permission.id));
}

function checkedState(ids: string[], value: Record<string, boolean>): CheckedState {
	if (ids.length === 0) return false;
	const checked = ids.filter((id) => value[id]).length;
	return checked === 0 ? false : checked === ids.length ? true : "indeterminate";
}

/**
 * A controlled or uncontrolled three-level role-permission chooser. All hierarchy levels share one
 * equal-track grid and a readable minimum width; narrow containers scroll the complete matrix instead
 * of allowing independently sized columns to drift apart.
 */
const PermissionMatrix = React.forwardRef<HTMLDivElement, PermissionMatrixProps>(
	(
		{
			categories,
			value: controlledValue,
			defaultValue,
			onValueChange,
			activeCategoryId: controlledActiveCategoryId,
			defaultActiveCategoryId,
			onActiveCategoryIdChange,
			title = "Set Up Permissions",
			selectAllLabel = "Select All",
			readOnly = false,
			showHeader = true,
			className,
			...rest
		},
		ref,
	) => {
		const allIds = React.useMemo(() => categories.flatMap(permissionIds), [categories]);
		const [internalValue, setInternalValue] = React.useState<Record<string, boolean>>(defaultValue ?? {});
		const value = controlledValue ?? internalValue;

		const fallbackCategoryId = categories[0]?.id ?? "";
		const [internalActiveCategoryId, setInternalActiveCategoryId] = React.useState(
			defaultActiveCategoryId ?? fallbackCategoryId,
		);
		const requestedActiveCategoryId = controlledActiveCategoryId ?? internalActiveCategoryId;
		const activeCategory = categories.find((category) => category.id === requestedActiveCategoryId) ?? categories[0];

		const setActiveCategoryId = (id: string) => {
			if (controlledActiveCategoryId === undefined) setInternalActiveCategoryId(id);
			onActiveCategoryIdChange?.(id);
		};

		const setMany = (ids: string[], checked: boolean) => {
			const next = {...value};
			for (const id of ids) next[id] = checked;
			if (controlledValue === undefined) setInternalValue(next);
			onValueChange?.(next);
		};

		const selectedCount = allIds.filter((id) => value[id]).length;
		const matrix = (
			<div
				className="wwc:overflow-x-auto wwc:overscroll-x-contain"
				data-core-responsive-group="permission-matrix-columns"
			>
				<div
					className="wwc:grid wwc:min-w-[45rem] wwc:grid-cols-3 wwc:divide-x wwc:divide-border"
					role="group"
					aria-label="Permission hierarchy"
				>
					<div className="wwc:divide-y wwc:divide-border" data-core-region="permission-level-one">
						<label className="wwc:flex wwc:h-12 wwc:cursor-pointer wwc:items-center wwc:gap-3 wwc:px-4">
							<Checkbox
								checked={checkedState(allIds, value)}
								onCheckedChange={(checked) => setMany(allIds, checked === true)}
								disabled={readOnly || allIds.length === 0}
								aria-label={selectAllLabel}
							/>
							<span className="wwc:min-w-0 wwc:truncate wwc:text-sm wwc:font-medium" title={selectAllLabel}>
								{selectAllLabel}
							</span>
						</label>

						{categories.map((category) => {
							const ids = permissionIds(category);
							const isActive = category.id === activeCategory?.id;
							return (
								<div
									key={category.id}
									className={cn(
										"wwc:flex wwc:h-12 wwc:min-w-0 wwc:items-center wwc:gap-3 wwc:px-4 wwc:transition-colors",
										isActive ? "wwc:bg-muted wwc:text-foreground" : "wwc:hover:bg-muted/50",
									)}
								>
									<Checkbox
										checked={checkedState(ids, value)}
										onCheckedChange={(checked) => setMany(ids, checked === true)}
										disabled={readOnly || ids.length === 0}
										aria-label={`Toggle all ${category.label} permissions`}
									/>
									<button
										type="button"
										onClick={() => setActiveCategoryId(category.id)}
										className="wwc:min-w-0 wwc:flex-1 wwc:truncate wwc:text-left wwc:text-sm wwc:font-medium wwc:outline-none wwc:focus-visible:underline wwc:focus-visible:underline-offset-4"
										aria-current={isActive ? "true" : undefined}
										title={category.label}
									>
										{category.label}
									</button>
								</div>
							);
						})}
					</div>

					<div className="wwc:col-span-2 wwc:flex wwc:min-w-0 wwc:flex-col">
						{activeCategory?.groups.map((group) => {
							const ids = group.permissions.map((permission) => permission.id);
							return (
								<div
									key={group.id}
									className="wwc:grid wwc:grid-cols-2 wwc:divide-x wwc:divide-border wwc:border-b wwc:border-border"
								>
									<label
										className="wwc:flex wwc:min-h-12 wwc:min-w-0 wwc:cursor-pointer wwc:items-start wwc:gap-3 wwc:px-4 wwc:py-4 wwc:transition-colors wwc:hover:bg-muted/50"
										data-core-region="permission-level-two"
									>
										<Checkbox
											checked={checkedState(ids, value)}
											onCheckedChange={(checked) => setMany(ids, checked === true)}
											disabled={readOnly || ids.length === 0}
											aria-label={`Toggle all ${group.label} permissions`}
										/>
										<span className="wwc:min-w-0 wwc:truncate wwc:text-sm wwc:font-medium" title={group.label}>
											{group.label}
										</span>
									</label>

									<div className="wwc:divide-y wwc:divide-border" data-core-region="permission-level-three">
										{group.permissions.map((permission) => (
											<label
												key={permission.id}
												className="wwc:flex wwc:h-12 wwc:min-w-0 wwc:cursor-pointer wwc:items-center wwc:gap-3 wwc:px-4 wwc:transition-colors wwc:hover:bg-muted/50"
											>
												<Checkbox
													checked={!!value[permission.id]}
													onCheckedChange={(checked) => setMany([permission.id], checked === true)}
													disabled={readOnly || permission.disabled}
													aria-label={permission.label}
												/>
												<span className="wwc:min-w-0 wwc:truncate wwc:text-sm" title={permission.label}>
													{permission.label}
												</span>
											</label>
										))}
									</div>
								</div>
							);
						})}
						<div aria-hidden className="wwc:grid wwc:min-h-0 wwc:flex-1 wwc:grid-cols-2 wwc:divide-x wwc:divide-border">
							<div />
							<div />
						</div>
					</div>
				</div>
			</div>
		);

		return (
			<div ref={ref} className={cn("wwc:min-w-0", className)} data-core-artifact="permission-matrix" {...rest}>
				{showHeader ? (
					<SectionPanel title={title} count={`${selectedCount}/${allIds.length}`} bodyClassName="wwc:px-0 wwc:pb-0">
						{matrix}
					</SectionPanel>
				) : (
					<div className="wwc:overflow-hidden wwc:rounded-md wwc:border wwc:border-border">{matrix}</div>
				)}
			</div>
		);
	},
);
PermissionMatrix.displayName = "PermissionMatrix";

export {PermissionMatrix};
