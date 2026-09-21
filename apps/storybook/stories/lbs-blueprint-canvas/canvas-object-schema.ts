import {scope, type} from "arktype";

export const CANVAS_OBJECT_TYPES = ["Rectangle", "Polygon", "Line"] as const;
export const CANVAS_OBJECT_TYPE_DEFINITION = "'Rectangle'|'Polygon'|'Line'" as const;

const canvasObjectDTOShape = {
	id: "number",
	projectId: "string",
	blueprintId: "number",
	"lbsItemBlueprintAssignmentId?": "number|null",
	"linkedLbsItemId?": "number|null",
	name: "string",
	"description?": "string|null",
	type: CANVAS_OBJECT_TYPE_DEFINITION,
	x: "number",
	y: "number",
	width: "number",
	height: "number",
	"pointsJson?": "string|null",
	"renderMetadataJson?": "string|null",
	"assignedActivities?": "string[]|null",
	"strokeColor?": "string|null",
	"fillColor?": "string|null",
	zIndex: "number",
	rotation: "number",
	opacity: "number",
	isLocked: "boolean",
	createdAt: "string",
	createdById: "string",
} as const;

export const CanvasObjectTypeSchema = type(CANVAS_OBJECT_TYPE_DEFINITION);

export const CanvasObjectDTOSchema = type(canvasObjectDTOShape);
export const CanvasObjectDTOArraySchema = CanvasObjectDTOSchema.array();

export const CanvasObjectDomainSchema = type({
	id: "number",
	projectId: "string",
	blueprintId: "number",
	"lbsItemBlueprintAssignmentId?": "number|undefined",
	"linkedLbsItemId?": "number|undefined",
	name: "string",
	"description?": "string|undefined",
	type: CANVAS_OBJECT_TYPE_DEFINITION,
	x: "number",
	y: "number",
	width: "number",
	height: "number",
	"pointsJson?": "string|undefined",
	"renderMetadataJson?": "string|undefined",
	"assignedActivities?": "string[]|undefined",
	"strokeColor?": "string|undefined",
	"fillColor?": "string|undefined",
	zIndex: "number",
	rotation: "number",
	opacity: "number",
	isLocked: "boolean",
	createdAt: "Date",
	createdById: "string",
});

const responseSchemas = scope({
	CanvasObjectDTO: canvasObjectDTOShape,
	BulkCanvasObjectValidationErrorDTO: {
		index: "number",
		field: "string",
		message: "string",
	},
	BulkCreateCanvasObjectsResultDTO: {
		requestedCount: "number",
		createdCount: "number",
		failedCount: "number",
		created: "CanvasObjectDTO[]",
		"errors?": "BulkCanvasObjectValidationErrorDTO[]|undefined",
	},
	CanvasObjectPaginatedDTO: {
		"attributes?": "unknown|null",
		"filterKeyValues?": "unknown|null",
		data: "CanvasObjectDTO[]",
		count: "number",
		pageNumber: "number",
		pageSize: "number",
		correlationId: "string",
	},
}).export();

export const CanvasObjectPaginatedDTOSchema = responseSchemas.CanvasObjectPaginatedDTO;
export const BulkCreateCanvasObjectsResultDTOSchema = responseSchemas.BulkCreateCanvasObjectsResultDTO;

export const CreateCanvasObjectDTOSchema = type({
	name: "string>=1",
	type: CANVAS_OBJECT_TYPE_DEFINITION,
	x: "number",
	y: "number",
	width: "number",
	height: "number",
	"description?": "string|null|undefined",
	"pointsJson?": "string|null|undefined",
	"renderMetadataJson?": "string|null|undefined",
	"assignedActivities?": "string[]|null|undefined",
	"strokeColor?": "string|null|undefined",
	"fillColor?": "string|null|undefined",
	"zIndex?": "number|undefined",
	"rotation?": "number|undefined",
	"opacity?": "number|undefined",
	"isLocked?": "boolean|undefined",
	"lbsItemBlueprintAssignmentId?": "number|undefined",
	"linkedLbsItemId?": "number|null|undefined",
});
export const BulkCreateCanvasObjectsDTOSchema = CreateCanvasObjectDTOSchema.array();

export const CreateCanvasObjectSchema = type({
	name: "string>=1",
	type: CANVAS_OBJECT_TYPE_DEFINITION,
	x: "number",
	y: "number",
	width: "number",
	height: "number",
	"description?": "string|undefined",
	"pointsJson?": "string|undefined",
	"renderMetadataJson?": "string|undefined",
	"assignedActivities?": "string[]|undefined",
	"strokeColor?": "string|null|undefined",
	"fillColor?": "string|null|undefined",
	"zIndex?": "number|undefined",
	"rotation?": "number|undefined",
	"opacity?": "number|undefined",
	"isLocked?": "boolean|undefined",
	"lbsItemBlueprintAssignmentId?": "number|undefined",
	"linkedLbsItemId?": "number|null|undefined",
});

export const UpdateCanvasObjectDTOSchema = type({
	"name?": "string|null|undefined",
	"description?": "string|null|undefined",
	"type?": `${CANVAS_OBJECT_TYPE_DEFINITION}|null|undefined`,
	"x?": "number|null|undefined",
	"y?": "number|null|undefined",
	"width?": "number|null|undefined",
	"height?": "number|null|undefined",
	"pointsJson?": "string|null|undefined",
	"renderMetadataJson?": "string|null|undefined",
	"assignedActivities?": "string[]|null|undefined",
	"strokeColor?": "string|null|undefined",
	"fillColor?": "string|null|undefined",
	"zIndex?": "number|null|undefined",
	"rotation?": "number|null|undefined",
	"opacity?": "number|null|undefined",
	"isLocked?": "boolean|null|undefined",
	"lbsItemBlueprintAssignmentId?": "number|null|undefined",
	"linkedLbsItemId?": "number|null|undefined",
	"clearLinkedLbsItem?": "boolean|undefined",
	"clearDescription?": "boolean|undefined",
	"clearPointsJson?": "boolean|undefined",
	"clearRenderMetadataJson?": "boolean|undefined",
	"clearStrokeColor?": "boolean|undefined",
	"clearFillColor?": "boolean|undefined",
});

export const UpdateCanvasObjectSchema = type({
	"name?": "string|undefined",
	"description?": "string|undefined",
	"type?": `${CANVAS_OBJECT_TYPE_DEFINITION}|undefined`,
	"x?": "number|undefined",
	"y?": "number|undefined",
	"width?": "number|undefined",
	"height?": "number|undefined",
	"pointsJson?": "string|undefined",
	"renderMetadataJson?": "string|undefined",
	"assignedActivities?": "string[]|undefined",
	"strokeColor?": "string|undefined",
	"fillColor?": "string|undefined",
	"zIndex?": "number|undefined",
	"rotation?": "number|undefined",
	"opacity?": "number|undefined",
	"isLocked?": "boolean|undefined",
	"lbsItemBlueprintAssignmentId?": "number|undefined",
	"linkedLbsItemId?": "number|undefined",
	"clearLinkedLbsItem?": "boolean|undefined",
	"clearDescription?": "boolean|undefined",
	"clearPointsJson?": "boolean|undefined",
	"clearRenderMetadataJson?": "boolean|undefined",
	"clearStrokeColor?": "boolean|undefined",
	"clearFillColor?": "boolean|undefined",
});
