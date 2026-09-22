import {cn} from "@corensystem/core-utils";
import * as React from "react";

import {BottomSheet} from "./bottom-sheet";

export interface BottomSheetSwitcherSheet {
	id: string;
	title: string;
	description?: string;
	content: React.ReactNode;
}

export interface BottomSheetSwitcherProps {
	/** Available sheets */
	sheets: BottomSheetSwitcherSheet[];
	/** Currently active sheet ID */
	activeSheetId?: string;
	/** Whether the switcher is open */
	open: boolean;
	/** Callback when switcher closes */
	onClose: () => void;
	/** Callback when active sheet changes */
	onSheetChange?: (sheetId: string) => void;
	/** Height of the bottom sheet */
	height?: "auto" | "full" | "half" | "third";
	/** Whether sheets can be swiped */
	swipeable?: boolean;
}

/** Multi-sheet bottom sheet with tab-like switching between sheets. */
const BottomSheetSwitcher = ({
	sheets,
	activeSheetId,
	open,
	onClose,
	onSheetChange,
	height = "auto",
	swipeable = true,
}: BottomSheetSwitcherProps) => {
	const [currentSheetId, setCurrentSheetId] = React.useState(activeSheetId || sheets[0]?.id);

	React.useEffect(() => {
		if (activeSheetId) {
			setCurrentSheetId(activeSheetId);
		}
	}, [activeSheetId]);

	const currentSheet = sheets.find((sheet) => sheet.id === currentSheetId) || sheets[0];

	const handleSheetChange = (sheetId: string) => {
		setCurrentSheetId(sheetId);
		onSheetChange?.(sheetId);
	};

	if (!currentSheet) return null;

	return (
		<BottomSheet
			open={open}
			onClose={onClose}
			title={currentSheet.title}
			description={currentSheet.description}
			height={height}
			swipeable={swipeable}
		>
			{sheets.length > 1 && (
				<div className="wwc:flex wwc:gap-1 wwc:p-1 wwc:mb-4 wwc:bg-muted wwc:rounded-lg">
					{sheets.map((sheet) => (
						<button
							key={sheet.id}
							type="button"
							onClick={() => handleSheetChange(sheet.id)}
							className={cn(
								"wwc:flex-1 wwc:px-3 wwc:py-1.5 wwc:text-sm wwc:font-medium wwc:rounded-md wwc:transition-colors",
								sheet.id === currentSheetId
									? "wwc:bg-background wwc:text-foreground wwc:shadow-sm"
									: "wwc:text-muted-foreground hover:wwc:text-foreground",
							)}
						>
							{sheet.title}
						</button>
					))}
				</div>
			)}
			{currentSheet.content}
		</BottomSheet>
	);
};
BottomSheetSwitcher.displayName = "BottomSheetSwitcher";

export {BottomSheetSwitcher};
