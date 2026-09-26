/**
 * Place toggle near content it controls.
 */
import {CatalogueViewToggle, CatalogueViewToggleItem} from "@corensystem/coren-ui/catalogue-view-toggle";
import {Grid, List} from "lucide-react";

export function PlacementDo() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-4">
			<span className="wwc:text-sm wwc:text-muted-foreground">12 items</span>
			<CatalogueViewToggle defaultValue="grid">
				<CatalogueViewToggleItem value="grid"><Grid className="wwc:h-4 wwc:w-4" /></CatalogueViewToggleItem>
				<CatalogueViewToggleItem value="list"><List className="wwc:h-4 wwc:w-4" /></CatalogueViewToggleItem>
			</CatalogueViewToggle>
		</div>
	);
}
