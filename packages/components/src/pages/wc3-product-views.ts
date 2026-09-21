import type {ReactElement} from "react";

import {ProductCatalogueView} from "./wc3-product-catalogue-view";
import type {Wc3ProductViewProps} from "./wc3-product-shared";

// The Products perspective is ONE surface — the 17-product first-party catalogue. The six names the
// shell used to carry as top-level tabs (outputs / permissions / evidence / dependencies / readiness /
// installs) are the SECTIONS of a single product's detail page (prototype PRODUCT_TABS, line 11155),
// not perspective tabs; they live in wc3-product-detail.tsx behind a left SideMenu.
//
// Same seam as ONTOLOGY_VIEWS (wc3-ontology-views.tsx:1282) and LINEAGE_VIEWS (wc3-lineage-views.ts:11):
// keyed by TAB ID, looked up by the shell, and a tab left out of this record still falls through to the
// perspective's `placeholders` entry.
export const PRODUCT_VIEWS: Record<string, (props: Wc3ProductViewProps) => ReactElement> = {
	catalogue: ProductCatalogueView,
};

// Re-exported so the shell needs one import line and never reaches into the shared module.
export type {Wc3ProductViewProps} from "./wc3-product-shared";
