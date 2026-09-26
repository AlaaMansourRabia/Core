/**
 * Catalogue view toggle with text labels.
 */
import {CatalogueViewToggle, CatalogueViewToggleItem} from "@corensystem/coren-ui/catalogue-view-toggle";
import {Grid, List, LayoutGrid} from "lucide-react";

export function WithLabels() {
	return (
		<CatalogueViewToggle defaultValue="grid">
			<CatalogueViewToggleItem value="grid">
				<Grid className="wwc:h-4 wwc:w-4" /> Grid
			</CatalogueViewToggleItem>
			<CatalogueViewToggleItem value="list">
				<List className="wwc:h-4 wwc:w-4" /> List
			</CatalogueViewToggleItem>
			<CatalogueViewToggleItem value="compact">
				<LayoutGrid className="wwc:h-4 wwc:w-4" /> Compact
			</CatalogueViewToggleItem>
		</CatalogueViewToggle>
	);
}
