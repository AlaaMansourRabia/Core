import type {
	CanvasObjectDomainSchema,
	CanvasObjectDTOSchema,
	CanvasObjectPaginatedDTOSchema,
	CanvasObjectTypeSchema,
	BulkCreateCanvasObjectsDTOSchema,
	BulkCreateCanvasObjectsResultDTOSchema,
	CreateCanvasObjectDTOSchema,
	CreateCanvasObjectSchema,
	UpdateCanvasObjectDTOSchema,
	UpdateCanvasObjectSchema,
} from "./canvas-object-schema";

export type CanvasObjectType = typeof CanvasObjectTypeSchema.infer;
export type CanvasObjectDTO = typeof CanvasObjectDTOSchema.infer;
export type CanvasObject = typeof CanvasObjectDomainSchema.infer;
export type CanvasObjectPaginatedDTO = typeof CanvasObjectPaginatedDTOSchema.infer;
export type CanvasObjectPage = {
	data: CanvasObject[];
	count: number;
	pageNumber: number;
	pageSize: number;
};

export type CreateCanvasObjectDTO = typeof CreateCanvasObjectDTOSchema.infer;
export type CreateCanvasObject = typeof CreateCanvasObjectSchema.infer;
export type BulkCreateCanvasObjectsDTO = typeof BulkCreateCanvasObjectsDTOSchema.infer;
export type BulkCreateCanvasObjectsResultDTO = typeof BulkCreateCanvasObjectsResultDTOSchema.infer;
export type BulkCanvasObjectValidationError = {
	index: number;
	field: string;
	message: string;
};
export type BulkCreateCanvasObjectsResult = {
	requestedCount: number;
	createdCount: number;
	failedCount: number;
	created: CanvasObject[];
	errors: BulkCanvasObjectValidationError[];
};

export type UpdateCanvasObjectDTO = typeof UpdateCanvasObjectDTOSchema.infer;
export type UpdateCanvasObject = typeof UpdateCanvasObjectSchema.infer;

export type CanvasObjectListParams = {
	pageNumber?: number;
	pageSize?: number;
	search?: string;
	lbsItemBlueprintAssignmentId?: number;
};
