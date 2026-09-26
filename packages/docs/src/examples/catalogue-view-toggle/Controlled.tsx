/**
 * Controlled view toggle with external state.
 */
import {CatalogueViewToggle, CatalogueViewToggleItem} from "@corensystem/coren-ui/catalogue-view-toggle";
import {Grid, List} from "lucide-react";

export function Controlled() {
	return (
		<CatalogueViewToggle value="list">
			<CatalogueViewToggleItem value="grid">
				<Grid className="wwc:h-4 wwc:w-4" />
			</CatalogueViewToggleItem>
			<CatalogueViewToggleItem value="list">
				<List className="wwc:h-4 wwc:w-4" />
			</CatalogueViewToggleItem>
		</CatalogueViewToggle>
	);
}
