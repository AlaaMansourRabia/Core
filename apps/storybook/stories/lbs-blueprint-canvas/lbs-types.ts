// Minimal LBS hierarchy node for the Storybook harness. The blueprint canvas only reads
// `id, code, name, objectType?, hierarchyLevel?, children, childCount` (via collectLbsLinkOptions /
// collectLbsScopeItemIds in utils.ts), so this stands in for the full service-layer LbsHierarchyNode
// without pulling the LBS schema chain into the demo. Shape mirrors src/services/lbs/schema.ts.
export interface LbsHierarchyNode {
	id: number;
	code: string;
	name: string;
	objectType?: string;
	childCount: number;
	children: LbsHierarchyNode[];
	category?: string;
	hierarchyLevel?: number;
	parentObjectId?: number;
	isBillable?: boolean;
	billableType?: string;
	quantity?: number;
	unit?: string;
}

// LbsNode is the domain hierarchy node from the service layer.
export type LbsNode = LbsHierarchyNode;
