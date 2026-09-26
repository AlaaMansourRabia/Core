/**
 * Default catalogue view toggle for list/grid views.
 */
import {CatalogueViewToggle, CatalogueViewToggleItem} from "@corensystem/coren-ui/catalogue-view-toggle";
import {Grid, List} from "lucide-react";

export function Default() {
	return (
		<CatalogueViewToggle defaultValue="grid">
			<CatalogueViewToggleItem value="grid">
				<Grid className="wwc:h-4 wwc:w-4" />
			</CatalogueViewToggleItem>
			<CatalogueViewToggleItem value="list">
				<List className="wwc:h-4 wwc:w-4" />
			</CatalogueViewToggleItem>
		</CatalogueViewToggle>
	);
}
