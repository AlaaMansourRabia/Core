/**
 * Avoid placing toggle far from content.
 */
import {CatalogueViewToggle, CatalogueViewToggleItem} from "@corensystem/coren-ui/catalogue-view-toggle";
import {Grid, List} from "lucide-react";

export function PlacementDont() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-8">
			<CatalogueViewToggle defaultValue="grid">
				<CatalogueViewToggleItem value="grid">
					<Grid className="wwc:h-4 wwc:w-4" />
				</CatalogueViewToggleItem>
				<CatalogueViewToggleItem value="list">
					<List className="wwc:h-4 wwc:w-4" />
				</CatalogueViewToggleItem>
			</CatalogueViewToggle>
			<div className="wwc:text-sm wwc:text-muted-foreground">Content area below...</div>
		</div>
	);
}
