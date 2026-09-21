// WC3 product catalogue fixture — extracted verbatim from `window.__STORE__.state.products` of the
// unified-workspace prototype (apps/wc3-platform-web/prototypes/ontology-manager/06-unified-workspace.html,
// the prototype's PRODUCT_MANIFESTS global), which is itself a verbatim read of the repo's
// products/*/manifests/*.product.manifest.json files.
//
// Not hand-authored: dumped from the running prototype with Playwright and code-generated from that
// JSON, so every product key, version, enclave id, output name, dependency, evidence ref and
// readiness field matches the prototype exactly — 17 products across
// 4 product types.
//
// Deliberately NOT duplicated here (they already ship in ./wc3-lineage-data):
//   • WC3_INSTALLS          — the 4 applied installs, with plan + lifecycle
//   • WC3_PRODUCT_TYPE_META — product-type label/icon
//   • WC3_LINEAGE_PRODUCTS  — the reduced {productKey, displayName, productType} projection, which is
//     a strict subset of WC3_PRODUCTS below and should eventually be derived from it.
// All data is fictional (PROTOTYPE FIXTURE).

import {WC3_INSTALLS, type Wc3Install} from "./wc3-lineage-data";

/* ------------------------------------------------------------------ types */

/** The ontology primitives a product manifest declares, split by primitive kind. */
export type Wc3ProductOntology = {
	objectTypes: string[];
	linkTypes: string[];
	actionTypes: string[];
	functionTypes: string[];
	valueTypes: string[];
	structTypes: string[];
	sharedProperties: string[];
	interfaces: string[];
};

/** Metadata-surface refs a product contributes (search, provenance, impact index, readiness). */
export type Wc3ProductMetadataOutputs = {
	searchableRefs: string[];
	provenanceRefs: string[];
	impactIndexRefs: string[];
	readinessRefs: string[];
};

/** Lineage-surface refs a product contributes. */
export type Wc3ProductLineageOutputs = {operationalEventRefs: string[]; readbackRefs: string[]};

/** Lakehouse-surface refs a product contributes. */
export type Wc3ProductLakehouseOutputs = {tableRefs: string[]; projectionReceiptRefs: string[]; readbackRefs: string[]};

/** Property template values written by an integration binding. Placeholders look like `$projectId`. */
export type Wc3ProductBindingProperties = Record<string, string | boolean>;

/** A source→target object-type binding a product declares against its source package. */
export type Wc3ProductIntegrationBinding = {
	bindingId: string;
	label: string;
	sourceObjectType: string;
	targetObjectType: string;
	linkType: string;
	classification: string;
	sourceProperties?: Wc3ProductBindingProperties;
	targetProperties?: Wc3ProductBindingProperties;
	linkProperties?: Wc3ProductBindingProperties;
};

/** A containerised workload a runtime-product ships. */
export type Wc3ProductRuntimeWorkload = {
	workloadId: string;
	kind: string;
	imageRef: string;
	parameterSchemaRef: string;
	timeoutSeconds: number;
	resources: {cpu: string; memory: string};
	linkedInterfaceRefs: string[];
	linkedOntologyObjectTypes: string[];
	secretRefs: string[];
	evidenceClassification: string;
	environmentVariables: Record<string, string>;
};

/** A platform capability the install flow must hold before a marketplace product can be installed. */
export type Wc3ProductCapability = {key: string; displayName: string};

/** Broker requirements a marketplace source-product install must satisfy. */
export type Wc3ProductBrokerTarget = {
	requiredCapabilities: string[];
	requiredAuthenticationModes: string[];
	externalTlsRequired: boolean;
	externalHostnameVerificationRequired: boolean;
	requiredPublishTopicPrefixes: string[];
	requiredSubscribeTopicPrefixes: string[];
};

/** The pipeline the install flow seeds once the broker target is bound. */
export type Wc3ProductPipelineStarter = {sourceKind: string; targetTypeId: string; governedFailurePath: boolean};

/** Extra install-time contract carried by marketplace-installable products. */
export type Wc3ProductMarketplaceInstall = {
	requiredCapabilities: Wc3ProductCapability[];
	brokerTarget: Wc3ProductBrokerTarget;
	pipelineStarter: Wc3ProductPipelineStarter;
};

/**
 * Everything a product puts into the workspace when it is installed.
 * `ontologyObjectTypes` / `ontologyLinkTypes` are the flat manifest name lists the install plan
 * camel-cases into API names; `ontology` is the same declaration split by primitive kind.
 */
export type Wc3ProductOutputs = {
	requiredProjectRoles: string[];
	sourceBindings: string[];
	sourcePackages: string[];
	ontologyObjectTypes: string[];
	ontologyLinkTypes: string[];
	ontology: Wc3ProductOntology;
	appRoutes: string[];
	osdkScopes: string[];
	filesystemResources: string[];
	integrationBindings: Wc3ProductIntegrationBinding[];
	metadata: Wc3ProductMetadataOutputs;
	lineage: Wc3ProductLineageOutputs;
	lakehouse: Wc3ProductLakehouseOutputs;
	/** Only on `gateway-mqtt-ingress`. */
	marketplaceInstall?: Wc3ProductMarketplaceInstall;
	/** Only on `wirepas-device-simulator`. */
	runtimeWorkloads?: Wc3ProductRuntimeWorkload[];
};

/** WC3 platform roles allowed to perform each product lifecycle operation. Empty list = nobody. */
export type Wc3ProductPermissions = {
	publishRoles: string[];
	installDevRoles: string[];
	installTestRoles: string[];
	installProdRoles: string[];
	upgradeRoles: string[];
	rollbackRoles: string[];
	uninstallRoles: string[];
	bindResourceRoles: string[];
	scopeViewerRoles: string[];
};

/** A key of {@link Wc3ProductPermissions} — what `roleGate` is asked to check. */
export type Wc3ProductPermissionKey = keyof Wc3ProductPermissions;

/** Evidence refs backing the product's claims, one bucket per evidence category. */
export type Wc3ProductEvidence = {
	sourceEnvelopeRefs: string[];
	readModelRefs: string[];
	permissionRefs: string[];
	osdkRefs: string[];
	appRouteRefs: string[];
	rollbackRefs: string[];
	realDataRefs: string[];
	metadataRefs: string[];
	lineageRefs: string[];
	lakehouseRefs: string[];
	/** Only on `wirepas-device-simulator`. */
	simulatorBackedRefs?: string[];
};

/** A hard dependency on another product; the install is blocked while `required` and unsatisfied. */
export type Wc3ProductDependency = {productKey: string; versionRange: string; required: boolean};

/** A sibling product a composite/runtime product is assembled from. */
export type Wc3ProductLink = {productKey: string; version: string; role: string; optional: boolean};

/** Declared production readiness. `blockedReasons` block a Prod install outright. */
export type Wc3ProductReadiness = {
	classification: string;
	required: string[];
	blockedReasons: string[];
	sourceRefs: string[];
	testRefs: string[];
};

/** One first-party Core product manifest, as the catalogue and detail screens render it. */
export type Wc3Product = {
	productKey: string;
	displayName: string;
	version: string;
	productType: string;
	ownerEnclaveId: string;
	dependencies: Wc3ProductDependency[];
	linkedProducts: Wc3ProductLink[];
	permissions: Wc3ProductPermissions;
	evidence: Wc3ProductEvidence;
	outputs: Wc3ProductOutputs;
	/** Present on 4 of the 17 products; absent means no readiness was declared. */
	readiness?: Wc3ProductReadiness;
	/** Path of the manifest this product was read from. */
	_manifestRef: string;
};

/* ------------------------------------------------------------------- data */

/** The Core first-party product catalogue — 17 products, alphabetical by manifest order. */
export const WC3_PRODUCTS: Wc3Product[] = [
	{
		productKey: "capture",
		displayName: "Capture",
		version: "2026-06-02.v1",
		productType: "ontology-product",
		ownerEnclaveId: "core",
		dependencies: [],
		linkedProducts: [],
		permissions: {
			publishRoles: ["Admin"],
			installDevRoles: ["Admin", "ProjectController"],
			installTestRoles: ["Admin", "ProjectController"],
			installProdRoles: [],
			upgradeRoles: ["Admin", "ProjectController"],
			rollbackRoles: ["Admin"],
			uninstallRoles: ["Admin"],
			bindResourceRoles: ["Admin", "ProjectController"],
			scopeViewerRoles: ["Admin", "ProjectController", "ProjectEngineer"],
		},
		evidence: {
			sourceEnvelopeRefs: [
				"products/capture/ontology/actions.yaml",
				"products/capture/ontology/functions.yaml",
				"products/capture/ontology/links.yaml",
				"products/capture/ontology/provenance.yaml",
				"products/capture/ontology/types.yaml",
			],
			readModelRefs: [
				"products/capture/ontology/actions.yaml",
				"products/capture/ontology/functions.yaml",
				"products/capture/ontology/links.yaml",
				"products/capture/ontology/provenance.yaml",
				"products/capture/ontology/types.yaml",
			],
			permissionRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
			],
			osdkRefs: [
				"src/platform/product-control/Wc3.Platform.Applications/Models/Osdk/OsdkApplication.cs",
				"tools/generate/openapi.json",
			],
			appRouteRefs: [],
			rollbackRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
			],
			realDataRefs: [
				"products/capture/ontology/actions.yaml",
				"products/capture/ontology/functions.yaml",
				"products/capture/ontology/links.yaml",
				"products/capture/ontology/provenance.yaml",
				"products/capture/ontology/types.yaml",
			],
			metadataRefs: [],
			lineageRefs: [
				"products/capture/ontology/actions.yaml",
				"products/capture/ontology/functions.yaml",
				"products/capture/ontology/links.yaml",
				"products/capture/ontology/provenance.yaml",
				"products/capture/ontology/types.yaml",
			],
			lakehouseRefs: [],
		},
		outputs: {
			requiredProjectRoles: ["Owner", "Editor", "Viewer", "Discoverer"],
			sourceBindings: [],
			sourcePackages: [],
			ontologyObjectTypes: [
				"capture_activity",
				"capture_blueprint",
				"capture_boq_allocation",
				"capture_boq_item",
				"capture_earned_value",
				"capture_lbs_blueprint_assignment",
				"capture_lbs_item",
				"capture_object",
				"capture_openspace_binding",
				"capture_openspace_capture",
				"capture_openspace_pano",
				"capture_openspace_sheet",
				"capture_operation",
				"capture_operation_template",
				"capture_payment_advance_ledger",
				"capture_payment_advance_transaction",
				"capture_payment_application",
				"capture_payment_attachment",
				"capture_payment_audit_log",
				"capture_payment_certificate",
				"capture_payment_comment",
				"capture_payment_contract",
				"capture_payment_deduction",
				"capture_payment_disbursement",
				"capture_payment_line",
				"capture_payment_retention_ledger",
				"capture_payment_retention_transaction",
				"capture_payment_workflow_definition",
				"capture_payment_workflow_status",
				"capture_payment_workflow_transition",
				"capture_progress_event",
				"capture_progress_import",
				"capture_progress_link",
				"capture_progress_period",
				"capture_schedule",
				"capture_schedule_import",
				"capture_task_object_mapping",
				"capture_task_object_operation_mapping",
				"capture_wbs_node",
			],
			ontologyLinkTypes: [
				"captureActivityInWbs",
				"captureAdvanceLedgerForContract",
				"captureAdvanceTransactionForCertificate",
				"captureAdvanceTransactionForLedger",
				"captureBlueprintForLbsItem",
				"captureBlueprintForOpenSpaceSheet",
				"captureBoqAllocationForActivity",
				"captureBoqAllocationForBoqItem",
				"captureBoqAllocationForLbsItem",
				"captureBoqAllocationForOperation",
				"captureEarnedValueForBoqAllocation",
				"captureEarnedValueForProgressPeriod",
				"captureLbsBlueprintAssignmentForBlueprint",
				"captureLbsBlueprintAssignmentForLbsItem",
				"captureObjectParentChild",
				"captureOpenSpaceBindingForLbsItem",
				"captureOpenSpaceCaptureForSheet",
				"captureOpenSpacePanoForCapture",
				"captureOpenSpaceSheetForBinding",
				"captureOperationInTemplate",
				"capturePaymentApplicationForContract",
				"capturePaymentAuditForApplication",
				"capturePaymentCertificateForApplication",
				"capturePaymentContractHasBoqItem",
				"capturePaymentDeductionForCertificate",
				"capturePaymentDisbursementForCertificate",
				"capturePaymentLineForApplication",
				"captureProgressEventForPeriod",
				"captureProgressEventForTaskObjectOperation",
				"captureProgressImportHasEvent",
				"captureProgressLinkForCaptureObject",
				"captureProgressLinkForOpenSpacePano",
				"captureProgressLinkForProgressEvent",
				"captureRetentionLedgerForContract",
				"captureRetentionTransactionForCertificate",
				"captureRetentionTransactionForLedger",
				"captureScheduleHasImport",
				"captureScheduleImportHasWbsNode",
				"captureTaskObjectMappingForActivity",
				"captureTaskObjectMappingForCaptureObject",
				"captureTaskObjectMappingForLbsItem",
				"captureTaskObjectOperationForMapping",
				"captureTaskObjectOperationForOperation",
				"captureWbsParentChild",
			],
			ontology: {
				objectTypes: [
					"capture_activity",
					"capture_blueprint",
					"capture_boq_allocation",
					"capture_boq_item",
					"capture_earned_value",
					"capture_lbs_blueprint_assignment",
					"capture_lbs_item",
					"capture_object",
					"capture_openspace_binding",
					"capture_openspace_capture",
					"capture_openspace_pano",
					"capture_openspace_sheet",
					"capture_operation",
					"capture_operation_template",
					"capture_payment_advance_ledger",
					"capture_payment_advance_transaction",
					"capture_payment_application",
					"capture_payment_attachment",
					"capture_payment_audit_log",
					"capture_payment_certificate",
					"capture_payment_comment",
					"capture_payment_contract",
					"capture_payment_deduction",
					"capture_payment_disbursement",
					"capture_payment_line",
					"capture_payment_retention_ledger",
					"capture_payment_retention_transaction",
					"capture_payment_workflow_definition",
					"capture_payment_workflow_status",
					"capture_payment_workflow_transition",
					"capture_progress_event",
					"capture_progress_import",
					"capture_progress_link",
					"capture_progress_period",
					"capture_schedule",
					"capture_schedule_import",
					"capture_task_object_mapping",
					"capture_task_object_operation_mapping",
					"capture_wbs_node",
				],
				linkTypes: [
					"captureActivityInWbs",
					"captureAdvanceLedgerForContract",
					"captureAdvanceTransactionForCertificate",
					"captureAdvanceTransactionForLedger",
					"captureBlueprintForLbsItem",
					"captureBlueprintForOpenSpaceSheet",
					"captureBoqAllocationForActivity",
					"captureBoqAllocationForBoqItem",
					"captureBoqAllocationForLbsItem",
					"captureBoqAllocationForOperation",
					"captureEarnedValueForBoqAllocation",
					"captureEarnedValueForProgressPeriod",
					"captureLbsBlueprintAssignmentForBlueprint",
					"captureLbsBlueprintAssignmentForLbsItem",
					"captureObjectParentChild",
					"captureOpenSpaceBindingForLbsItem",
					"captureOpenSpaceCaptureForSheet",
					"captureOpenSpacePanoForCapture",
					"captureOpenSpaceSheetForBinding",
					"captureOperationInTemplate",
					"capturePaymentApplicationForContract",
					"capturePaymentAuditForApplication",
					"capturePaymentCertificateForApplication",
					"capturePaymentContractHasBoqItem",
					"capturePaymentDeductionForCertificate",
					"capturePaymentDisbursementForCertificate",
					"capturePaymentLineForApplication",
					"captureProgressEventForPeriod",
					"captureProgressEventForTaskObjectOperation",
					"captureProgressImportHasEvent",
					"captureProgressLinkForCaptureObject",
					"captureProgressLinkForOpenSpacePano",
					"captureProgressLinkForProgressEvent",
					"captureRetentionLedgerForContract",
					"captureRetentionTransactionForCertificate",
					"captureRetentionTransactionForLedger",
					"captureScheduleHasImport",
					"captureScheduleImportHasWbsNode",
					"captureTaskObjectMappingForActivity",
					"captureTaskObjectMappingForCaptureObject",
					"captureTaskObjectMappingForLbsItem",
					"captureTaskObjectOperationForMapping",
					"captureTaskObjectOperationForOperation",
					"captureWbsParentChild",
				],
				actionTypes: [
					"allocate-capture-boq",
					"apply-capture-progress-import",
					"approve-capture-progress-event",
					"assign-capture-operation-template",
					"calculate-capture-earned-value",
					"close-capture-progress-period",
					"configure-capture-openspace-binding",
					"generate-capture-payment-certificate",
					"import-capture-schedule",
					"reject-capture-progress-event",
					"reopen-capture-progress-period",
					"revert-capture-progress-import",
					"transition-capture-payment-application",
				],
				functionTypes: [
					"apply-capture-progress-import",
					"calculate-capture-earned-value",
					"generate-capture-payment-certificate",
					"import-capture-payment-progress-records",
					"import-capture-schedule",
					"revert-capture-progress-import",
					"transition-capture-payment-application",
				],
				valueTypes: [],
				structTypes: [],
				sharedProperties: [],
				interfaces: [],
			},
			appRoutes: [],
			osdkScopes: ["api:use-ontologies-read"],
			filesystemResources: [],
			integrationBindings: [],
			metadata: {
				searchableRefs: [],
				provenanceRefs: [
					"products/capture/ontology/actions.yaml",
					"products/capture/ontology/functions.yaml",
					"products/capture/ontology/links.yaml",
					"products/capture/ontology/provenance.yaml",
					"products/capture/ontology/types.yaml",
				],
				impactIndexRefs: [],
				readinessRefs: [
					"products/capture/ontology/actions.yaml",
					"products/capture/ontology/functions.yaml",
					"products/capture/ontology/links.yaml",
					"products/capture/ontology/provenance.yaml",
					"products/capture/ontology/types.yaml",
				],
			},
			lineage: {
				operationalEventRefs: [],
				readbackRefs: [
					"products/capture/ontology/actions.yaml",
					"products/capture/ontology/functions.yaml",
					"products/capture/ontology/links.yaml",
					"products/capture/ontology/provenance.yaml",
					"products/capture/ontology/types.yaml",
				],
			},
			lakehouse: {
				tableRefs: [],
				projectionReceiptRefs: [],
				readbackRefs: [],
			},
		},
		_manifestRef: "products/capture/manifests/01-capture-ontology.product.manifest.json",
	},
	{
		productKey: "contracts",
		displayName: "Contracts",
		version: "2026-06-02.v1",
		productType: "ontology-product",
		ownerEnclaveId: "core",
		dependencies: [],
		linkedProducts: [],
		permissions: {
			publishRoles: ["Admin"],
			installDevRoles: ["Admin", "ProjectController"],
			installTestRoles: ["Admin", "ProjectController"],
			installProdRoles: [],
			upgradeRoles: ["Admin", "ProjectController"],
			rollbackRoles: ["Admin"],
			uninstallRoles: ["Admin"],
			bindResourceRoles: ["Admin", "ProjectController"],
			scopeViewerRoles: ["Admin", "ProjectController", "ProjectEngineer"],
		},
		evidence: {
			sourceEnvelopeRefs: [
				"products/contracts/ontology/links.yaml",
				"products/contracts/ontology/provenance.yaml",
				"products/contracts/ontology/types.yaml",
			],
			readModelRefs: [
				"products/contracts/ontology/links.yaml",
				"products/contracts/ontology/provenance.yaml",
				"products/contracts/ontology/types.yaml",
			],
			permissionRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
			],
			osdkRefs: [
				"src/platform/product-control/Wc3.Platform.Applications/Models/Osdk/OsdkApplication.cs",
				"tools/generate/openapi.json",
			],
			appRouteRefs: [],
			rollbackRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
			],
			realDataRefs: [
				"products/contracts/ontology/links.yaml",
				"products/contracts/ontology/provenance.yaml",
				"products/contracts/ontology/types.yaml",
			],
			metadataRefs: [],
			lineageRefs: [
				"products/contracts/ontology/links.yaml",
				"products/contracts/ontology/provenance.yaml",
				"products/contracts/ontology/types.yaml",
			],
			lakehouseRefs: [],
		},
		outputs: {
			requiredProjectRoles: ["Owner", "Editor", "Viewer", "Discoverer"],
			sourceBindings: [],
			sourcePackages: [],
			ontologyObjectTypes: [],
			ontologyLinkTypes: [],
			ontology: {
				objectTypes: [],
				linkTypes: [],
				actionTypes: [],
				functionTypes: [],
				valueTypes: [],
				structTypes: [],
				sharedProperties: [],
				interfaces: [],
			},
			appRoutes: [],
			osdkScopes: ["api:use-ontologies-read"],
			filesystemResources: [],
			integrationBindings: [],
			metadata: {
				searchableRefs: [],
				provenanceRefs: [
					"products/contracts/ontology/links.yaml",
					"products/contracts/ontology/provenance.yaml",
					"products/contracts/ontology/types.yaml",
				],
				impactIndexRefs: [],
				readinessRefs: [
					"products/contracts/ontology/links.yaml",
					"products/contracts/ontology/provenance.yaml",
					"products/contracts/ontology/types.yaml",
				],
			},
			lineage: {
				operationalEventRefs: [],
				readbackRefs: [
					"products/contracts/ontology/links.yaml",
					"products/contracts/ontology/provenance.yaml",
					"products/contracts/ontology/types.yaml",
				],
			},
			lakehouse: {
				tableRefs: [],
				projectionReceiptRefs: [],
				readbackRefs: [],
			},
		},
		_manifestRef: "products/contracts/manifests/01-contracts-ontology.product.manifest.json",
	},
	{
		productKey: "datamanagement",
		displayName: "Datamanagement",
		version: "2026-06-02.v1",
		productType: "ontology-product",
		ownerEnclaveId: "core",
		dependencies: [],
		linkedProducts: [],
		permissions: {
			publishRoles: ["Admin"],
			installDevRoles: ["Admin", "ProjectController"],
			installTestRoles: ["Admin", "ProjectController"],
			installProdRoles: [],
			upgradeRoles: ["Admin", "ProjectController"],
			rollbackRoles: ["Admin"],
			uninstallRoles: ["Admin"],
			bindResourceRoles: ["Admin", "ProjectController"],
			scopeViewerRoles: ["Admin", "ProjectController", "ProjectEngineer"],
		},
		evidence: {
			sourceEnvelopeRefs: [
				"products/datamanagement/ontology/actions.yaml",
				"products/datamanagement/ontology/provenance.yaml",
				"products/datamanagement/ontology/types.yaml",
			],
			readModelRefs: [
				"products/datamanagement/ontology/actions.yaml",
				"products/datamanagement/ontology/provenance.yaml",
				"products/datamanagement/ontology/types.yaml",
			],
			permissionRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
			],
			osdkRefs: [
				"src/platform/product-control/Wc3.Platform.Applications/Models/Osdk/OsdkApplication.cs",
				"tools/generate/openapi.json",
			],
			appRouteRefs: [],
			rollbackRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
			],
			realDataRefs: [
				"products/datamanagement/ontology/actions.yaml",
				"products/datamanagement/ontology/provenance.yaml",
				"products/datamanagement/ontology/types.yaml",
			],
			metadataRefs: [],
			lineageRefs: [
				"products/datamanagement/ontology/actions.yaml",
				"products/datamanagement/ontology/provenance.yaml",
				"products/datamanagement/ontology/types.yaml",
			],
			lakehouseRefs: [],
		},
		outputs: {
			requiredProjectRoles: ["Owner", "Editor", "Viewer", "Discoverer"],
			sourceBindings: [],
			sourcePackages: [],
			ontologyObjectTypes: ["Trade", "data_group"],
			ontologyLinkTypes: [],
			ontology: {
				objectTypes: ["Trade", "data_group"],
				linkTypes: [],
				actionTypes: ["create-data-group", "create-trade", "edit-trade", "toggle-data-group-activation"],
				functionTypes: [],
				valueTypes: [],
				structTypes: [],
				sharedProperties: [],
				interfaces: [],
			},
			appRoutes: [],
			osdkScopes: ["api:use-ontologies-read"],
			filesystemResources: [],
			integrationBindings: [],
			metadata: {
				searchableRefs: [],
				provenanceRefs: [
					"products/datamanagement/ontology/actions.yaml",
					"products/datamanagement/ontology/provenance.yaml",
					"products/datamanagement/ontology/types.yaml",
				],
				impactIndexRefs: [],
				readinessRefs: [
					"products/datamanagement/ontology/actions.yaml",
					"products/datamanagement/ontology/provenance.yaml",
					"products/datamanagement/ontology/types.yaml",
				],
			},
			lineage: {
				operationalEventRefs: [],
				readbackRefs: [
					"products/datamanagement/ontology/actions.yaml",
					"products/datamanagement/ontology/provenance.yaml",
					"products/datamanagement/ontology/types.yaml",
				],
			},
			lakehouse: {
				tableRefs: [],
				projectionReceiptRefs: [],
				readbackRefs: [],
			},
		},
		_manifestRef: "products/datamanagement/manifests/01-datamanagement-ontology.product.manifest.json",
	},
	{
		productKey: "equipment",
		displayName: "Equipment",
		version: "2026-06-02.v1",
		productType: "ontology-product",
		ownerEnclaveId: "core",
		dependencies: [],
		linkedProducts: [],
		permissions: {
			publishRoles: ["Admin"],
			installDevRoles: ["Admin", "ProjectController"],
			installTestRoles: ["Admin", "ProjectController"],
			installProdRoles: [],
			upgradeRoles: ["Admin", "ProjectController"],
			rollbackRoles: ["Admin"],
			uninstallRoles: ["Admin"],
			bindResourceRoles: ["Admin", "ProjectController"],
			scopeViewerRoles: ["Admin", "ProjectController", "ProjectEngineer"],
		},
		evidence: {
			sourceEnvelopeRefs: ["products/equipment/ontology/source-ports.yaml"],
			readModelRefs: ["products/equipment/ontology/source-ports.yaml"],
			permissionRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
			],
			osdkRefs: [
				"src/platform/product-control/Wc3.Platform.Applications/Models/Osdk/OsdkApplication.cs",
				"tools/generate/openapi.json",
			],
			appRouteRefs: [],
			rollbackRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
			],
			realDataRefs: ["products/equipment/ontology/source-ports.yaml"],
			metadataRefs: [],
			lineageRefs: ["products/equipment/ontology/source-ports.yaml"],
			lakehouseRefs: [],
		},
		outputs: {
			requiredProjectRoles: ["Owner", "Editor", "Viewer", "Discoverer"],
			sourceBindings: [],
			sourcePackages: [],
			ontologyObjectTypes: [
				"avl_device",
				"co2_inspection",
				"device",
				"device_location",
				"equipment_alert_history",
				"equipment_alert_rule",
				"equipment_asset",
				"equipment_operator",
				"equipment_type",
				"inspection",
				"registration_type",
				"resource_device",
			],
			ontologyLinkTypes: [
				"avlOnEquipment",
				"deviceAssignedToPeople",
				"deviceLastLocation",
				"equipmentAlertForEquipment",
				"equipmentAlertUsesRule",
				"equipmentHasCo2Inspection",
				"equipmentHasInspection",
				"equipmentOperatedBy",
				"equipmentOwnedByCompany",
			],
			ontology: {
				objectTypes: [
					"avl_device",
					"co2_inspection",
					"device",
					"device_location",
					"equipment_alert_history",
					"equipment_alert_rule",
					"equipment_asset",
					"equipment_operator",
					"equipment_type",
					"inspection",
					"registration_type",
					"resource_device",
				],
				linkTypes: [
					"avlOnEquipment",
					"deviceAssignedToPeople",
					"deviceLastLocation",
					"equipmentAlertForEquipment",
					"equipmentAlertUsesRule",
					"equipmentHasCo2Inspection",
					"equipmentHasInspection",
					"equipmentOperatedBy",
					"equipmentOwnedByCompany",
				],
				actionTypes: [],
				functionTypes: [],
				valueTypes: [],
				structTypes: [],
				sharedProperties: [],
				interfaces: [],
			},
			appRoutes: [],
			osdkScopes: ["api:use-ontologies-read"],
			filesystemResources: [],
			integrationBindings: [],
			metadata: {
				searchableRefs: [],
				provenanceRefs: ["products/equipment/ontology/source-ports.yaml"],
				impactIndexRefs: [],
				readinessRefs: ["products/equipment/ontology/source-ports.yaml"],
			},
			lineage: {
				operationalEventRefs: [],
				readbackRefs: ["products/equipment/ontology/source-ports.yaml"],
			},
			lakehouse: {
				tableRefs: [],
				projectionReceiptRefs: [],
				readbackRefs: [],
			},
		},
		_manifestRef: "products/equipment/manifests/01-equipment-ontology.product.manifest.json",
	},
	{
		productKey: "gateway-mqtt-ingress",
		displayName: "Gateway MQTT Ingress",
		version: "2026-07-21.v2",
		productType: "source-product",
		ownerEnclaveId: "core",
		dependencies: [
			{
				productKey: "raw-device-events",
				versionRange: "2026-06-02.v1",
				required: true,
			},
		],
		linkedProducts: [],
		permissions: {
			publishRoles: ["Admin"],
			installDevRoles: ["Admin", "ProjectController"],
			installTestRoles: ["Admin", "ProjectController"],
			installProdRoles: ["Admin"],
			upgradeRoles: ["Admin", "ProjectController"],
			rollbackRoles: ["Admin"],
			uninstallRoles: ["Admin"],
			bindResourceRoles: ["Admin", "ProjectController"],
			scopeViewerRoles: ["Admin", "ProjectController", "ProjectEngineer"],
		},
		evidence: {
			sourceEnvelopeRefs: ["products/gateway-mqtt-ingress/source/gateway-mqtt-ingress.source-package.json"],
			readModelRefs: ["products/raw-device-events/ontology/raw-device-events.yaml"],
			permissionRefs: ["src/platform/security/Wc3.Platform.Security/Models/ControlPanel/AccessControlContracts.cs"],
			osdkRefs: ["products/gateway-mqtt-ingress/source/gateway-mqtt-ingress.source-package.json"],
			appRouteRefs: [],
			rollbackRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
			],
			realDataRefs: ["https://github.com/core/wc3-platform/issues/1052"],
			metadataRefs: [],
			lineageRefs: ["products/gateway-mqtt-ingress/source/gateway-mqtt-ingress.source-registry.json"],
			lakehouseRefs: [],
		},
		readiness: {
			classification: "config-only",
			required: ["registered-compatible-broker-target", "project-business-role-assignment", "gateway-credential"],
			blockedReasons: ["Physical gateway validation remains gated by #1052."],
			sourceRefs: ["products/gateway-mqtt-ingress/source/gateway-mqtt-ingress.source-registry.json"],
			testRefs: ["tests/Wc3.Tests/Product/GatewayMqttIngressMarketplaceTests.cs"],
		},
		outputs: {
			requiredProjectRoles: ["Owner", "Editor", "Viewer", "Discoverer"],
			sourceBindings: ["gateway-mqtt-raw-events"],
			sourcePackages: ["gateway-mqtt-ingress"],
			ontologyObjectTypes: ["RawGatewayEvent"],
			ontologyLinkTypes: [],
			ontology: {
				objectTypes: ["RawGatewayEvent"],
				linkTypes: [],
				actionTypes: [],
				functionTypes: [],
				valueTypes: [],
				structTypes: [],
				sharedProperties: [],
				interfaces: [],
			},
			appRoutes: [],
			osdkScopes: ["api:use-ontologies-read"],
			integrationBindings: [],
			filesystemResources: [],
			metadata: {
				searchableRefs: [],
				provenanceRefs: [
					"products/gateway-mqtt-ingress/source/gateway-mqtt-ingress.source-package.json",
					"products/gateway-mqtt-ingress/source/gateway-mqtt-ingress.source-registry.json",
				],
				impactIndexRefs: [],
				readinessRefs: ["tests/Wc3.Tests/Product/GatewayMqttIngressMarketplaceTests.cs"],
			},
			lineage: {
				operationalEventRefs: [],
				readbackRefs: ["products/gateway-mqtt-ingress/source/gateway-mqtt-ingress.source-registry.json"],
			},
			lakehouse: {
				tableRefs: [],
				projectionReceiptRefs: [],
				readbackRefs: [],
			},
			marketplaceInstall: {
				requiredCapabilities: [
					{
						key: "source.mqtt.credential.list",
						displayName: "List MQTT credentials",
					},
					{
						key: "source.mqtt.credential.issue",
						displayName: "Issue MQTT credentials",
					},
					{
						key: "source.mqtt.topic-grant.manage",
						displayName: "Manage MQTT topic grants",
					},
					{
						key: "source.mqtt.credential.rotate",
						displayName: "Rotate MQTT credentials",
					},
					{
						key: "source.mqtt.credential.revoke",
						displayName: "Revoke MQTT credentials",
					},
					{
						key: "source.mqtt.activation.manage",
						displayName: "Manage MQTT ingress activation",
					},
				],
				brokerTarget: {
					requiredCapabilities: ["publish", "subscribe"],
					requiredAuthenticationModes: ["vmq-diversity-postgresql"],
					externalTlsRequired: true,
					externalHostnameVerificationRequired: true,
					requiredPublishTopicPrefixes: ["production/esp_uplink/"],
					requiredSubscribeTopicPrefixes: ["production/esp_uplink/", "production/esp_downlink/"],
				},
				pipelineStarter: {
					sourceKind: "source-registry-binding",
					targetTypeId: "RawGatewayEvent",
					governedFailurePath: true,
				},
			},
		},
		_manifestRef: "products/gateway-mqtt-ingress/manifests/01-gateway-mqtt-ingress.product.manifest.json",
	},
	{
		productKey: "labour",
		displayName: "Labour & Workforce",
		version: "2026-06-02.v1",
		productType: "ontology-product",
		ownerEnclaveId: "core",
		dependencies: [],
		linkedProducts: [],
		permissions: {
			publishRoles: ["Admin"],
			installDevRoles: ["Admin", "ProjectController"],
			installTestRoles: ["Admin", "ProjectController"],
			installProdRoles: [],
			upgradeRoles: ["Admin", "ProjectController"],
			rollbackRoles: ["Admin"],
			uninstallRoles: ["Admin"],
			bindResourceRoles: ["Admin", "ProjectController"],
			scopeViewerRoles: ["Admin", "ProjectController", "ProjectEngineer"],
		},
		evidence: {
			sourceEnvelopeRefs: [
				"products/labour/ontology/actions.yaml",
				"products/labour/ontology/functions.yaml",
				"products/labour/ontology/links.yaml",
				"products/labour/ontology/provenance.yaml",
				"products/labour/ontology/types.yaml",
			],
			readModelRefs: [
				"products/labour/ontology/actions.yaml",
				"products/labour/ontology/functions.yaml",
				"products/labour/ontology/links.yaml",
				"products/labour/ontology/provenance.yaml",
				"products/labour/ontology/types.yaml",
			],
			permissionRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
			],
			osdkRefs: [
				"src/platform/product-control/Wc3.Platform.Applications/Models/Osdk/OsdkApplication.cs",
				"tools/generate/openapi.json",
			],
			appRouteRefs: [],
			rollbackRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
			],
			realDataRefs: [
				"products/labour/ontology/actions.yaml",
				"products/labour/ontology/functions.yaml",
				"products/labour/ontology/links.yaml",
				"products/labour/ontology/provenance.yaml",
				"products/labour/ontology/types.yaml",
			],
			metadataRefs: [],
			lineageRefs: [
				"products/labour/ontology/actions.yaml",
				"products/labour/ontology/functions.yaml",
				"products/labour/ontology/links.yaml",
				"products/labour/ontology/provenance.yaml",
				"products/labour/ontology/types.yaml",
			],
			lakehouseRefs: [],
		},
		outputs: {
			requiredProjectRoles: ["Owner", "Editor", "Viewer", "Discoverer"],
			sourceBindings: [],
			sourcePackages: [],
			ontologyObjectTypes: [
				"Assignment",
				"Attendance",
				"CertificateType",
				"Company",
				"CompanyType",
				"Crew",
				"CrewType",
				"Department",
				"Discipline",
				"ExpiryDuration",
				"Nationality",
				"OBSCurrent",
				"Package",
				"PeopleTitle",
				"Shift",
				"Timecard",
				"Trade",
				"TrainingCourse",
				"TrainingSession",
				"TrainingSessionAttendee",
				"Worker",
				"certificate",
				"project_card_template",
				"workshift_resource_assignment",
			],
			ontologyLinkTypes: [
				"attendanceForShift",
				"attendeeForWorker",
				"companyWorksOnProject",
				"crewForProject",
				"crewHasTrade",
				"crewHasWorker",
				"crewManagedBy",
				"departmentForCompany",
				"trainingCourseHasExpiryDuration",
				"trainingSessionConductedBy",
				"trainingSessionForCourse",
				"trainingSessionHasAttendee",
				"workerAssignedToCrew",
				"workerBelongsToCompany",
				"workerHasAttendance",
				"workerHasNationality",
				"workerHasTimecard",
				"workerHasTrade",
				"workerInDepartment",
				"workerWorksOnProject",
			],
			ontology: {
				objectTypes: [
					"Assignment",
					"Attendance",
					"CertificateType",
					"Company",
					"CompanyType",
					"Crew",
					"CrewType",
					"Department",
					"Discipline",
					"ExpiryDuration",
					"Nationality",
					"OBSCurrent",
					"Package",
					"PeopleTitle",
					"Shift",
					"Timecard",
					"Trade",
					"TrainingCourse",
					"TrainingSession",
					"TrainingSessionAttendee",
					"Worker",
					"certificate",
					"project_card_template",
					"workshift_resource_assignment",
				],
				linkTypes: [
					"attendanceForShift",
					"attendeeForWorker",
					"companyWorksOnProject",
					"crewForProject",
					"crewHasTrade",
					"crewHasWorker",
					"crewManagedBy",
					"departmentForCompany",
					"trainingCourseHasExpiryDuration",
					"trainingSessionConductedBy",
					"trainingSessionForCourse",
					"trainingSessionHasAttendee",
					"workerAssignedToCrew",
					"workerBelongsToCompany",
					"workerHasAttendance",
					"workerHasNationality",
					"workerHasTimecard",
					"workerHasTrade",
					"workerInDepartment",
					"workerWorksOnProject",
				],
				actionTypes: [
					"activate-worker",
					"add-certificate",
					"approveTimecard",
					"assign-activity-to-crew",
					"assign-company-to-package",
					"assign-crew-manager",
					"assign-managing-crews",
					"assign-subordinates",
					"assign-supervisor",
					"assign-to-workshift",
					"assign-worker-to-crew",
					"bulk-assign-worker-to-crew",
					"bulk-unassign-worker-from-crew",
					"cancel-training-session",
					"create-certificate-type",
					"create-company",
					"create-company-type",
					"create-crew",
					"create-crew-type",
					"create-department",
					"create-discipline",
					"create-package",
					"create-people-title",
					"create-training-course",
					"create-worker",
					"deactivate-worker",
					"delete-crew",
					"delete-crew-composition",
					"delete-crew-type",
					"delete-package",
					"delete-training-course",
					"delete-worker",
					"edit-company",
					"edit-crew",
					"edit-department",
					"edit-discipline",
					"edit-package",
					"edit-people-title",
					"edit-training-course",
					"edit-worker",
					"recordAttendance",
					"save-card-template",
					"schedule-training-session",
					"seed-default-crew",
					"unassign-activity-from-crew",
				],
				functionTypes: [
					"assign-worker-to-crew",
					"cancel-training-session",
					"create-certificate-type",
					"create-training-course",
					"delete-training-course",
					"edit-training-course",
					"schedule-training-session",
				],
				valueTypes: [],
				structTypes: [],
				sharedProperties: [],
				interfaces: [],
			},
			appRoutes: [],
			osdkScopes: ["api:use-ontologies-read"],
			filesystemResources: [],
			integrationBindings: [],
			metadata: {
				searchableRefs: [],
				provenanceRefs: [
					"products/labour/ontology/actions.yaml",
					"products/labour/ontology/functions.yaml",
					"products/labour/ontology/links.yaml",
					"products/labour/ontology/provenance.yaml",
					"products/labour/ontology/types.yaml",
				],
				impactIndexRefs: [],
				readinessRefs: [
					"products/labour/ontology/actions.yaml",
					"products/labour/ontology/functions.yaml",
					"products/labour/ontology/links.yaml",
					"products/labour/ontology/provenance.yaml",
					"products/labour/ontology/types.yaml",
				],
			},
			lineage: {
				operationalEventRefs: [],
				readbackRefs: [
					"products/labour/ontology/actions.yaml",
					"products/labour/ontology/functions.yaml",
					"products/labour/ontology/links.yaml",
					"products/labour/ontology/provenance.yaml",
					"products/labour/ontology/types.yaml",
				],
			},
			lakehouse: {
				tableRefs: [],
				projectionReceiptRefs: [],
				readbackRefs: [],
			},
		},
		_manifestRef: "products/labour/manifests/01-labour-ontology.product.manifest.json",
	},
	{
		productKey: "mapmanagement",
		displayName: "Map Management",
		version: "2026-06-02.v1",
		productType: "ontology-product",
		ownerEnclaveId: "core",
		dependencies: [],
		linkedProducts: [],
		permissions: {
			publishRoles: ["Admin"],
			installDevRoles: ["Admin", "ProjectController"],
			installTestRoles: ["Admin", "ProjectController"],
			installProdRoles: [],
			upgradeRoles: ["Admin", "ProjectController"],
			rollbackRoles: ["Admin"],
			uninstallRoles: ["Admin"],
			bindResourceRoles: ["Admin", "ProjectController"],
			scopeViewerRoles: ["Admin", "ProjectController", "ProjectEngineer"],
		},
		evidence: {
			sourceEnvelopeRefs: [
				"products/mapmanagement/ontology/actions.yaml",
				"products/mapmanagement/ontology/functions.yaml",
				"products/mapmanagement/ontology/links.yaml",
				"products/mapmanagement/ontology/provenance.yaml",
				"products/mapmanagement/ontology/types.yaml",
				"products/mapmanagement/source/fadhili-map-timescale.source-package.json",
			],
			readModelRefs: [
				"products/mapmanagement/ontology/actions.yaml",
				"products/mapmanagement/ontology/functions.yaml",
				"products/mapmanagement/ontology/links.yaml",
				"products/mapmanagement/ontology/provenance.yaml",
				"products/mapmanagement/ontology/types.yaml",
				"products/mapmanagement/source/fadhili-map-timescale.source-package.json",
			],
			permissionRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
			],
			osdkRefs: [
				"src/platform/product-control/Wc3.Platform.Applications/Models/Osdk/OsdkApplication.cs",
				"tools/generate/openapi.json",
			],
			appRouteRefs: [],
			rollbackRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
			],
			realDataRefs: [
				"products/mapmanagement/ontology/actions.yaml",
				"products/mapmanagement/ontology/functions.yaml",
				"products/mapmanagement/ontology/links.yaml",
				"products/mapmanagement/ontology/provenance.yaml",
				"products/mapmanagement/ontology/types.yaml",
				"products/mapmanagement/source/fadhili-map-timescale.source-package.json",
			],
			metadataRefs: [],
			lineageRefs: [
				"products/mapmanagement/ontology/actions.yaml",
				"products/mapmanagement/ontology/functions.yaml",
				"products/mapmanagement/ontology/links.yaml",
				"products/mapmanagement/ontology/provenance.yaml",
				"products/mapmanagement/ontology/types.yaml",
			],
			lakehouseRefs: [],
		},
		outputs: {
			requiredProjectRoles: ["Owner", "Editor", "Viewer", "Discoverer"],
			sourceBindings: ["binding-fadhili-space-timescale", "binding-fadhili-site-zone-timescale"],
			sourcePackages: ["fadhili-map-timescale"],
			ontologyObjectTypes: [
				"Blueprint",
				"BlueprintHandleDetails",
				"LocationGroup",
				"LocationGroupZone",
				"ManualLocationAssignment",
				"SiteZone",
				"Space",
				"SpaceHistory",
				"ZoneAuthorizedResource",
				"ZoneCategory",
				"ZoneHistory",
				"ZoneViolationLog",
			],
			ontologyLinkTypes: [
				"blueprintHandleOfBlueprint",
				"blueprintOfSpace",
				"locationGroupOnProject",
				"locationGroupZoneOfGroup",
				"locationGroupZoneOfZone",
				"manualAssignmentForWorker",
				"manualAssignmentInCrew",
				"manualAssignmentInGroup",
				"spaceHistoryOfSpace",
				"spaceOnProject",
				"zoneAuthorizedFor",
				"zoneAuthorizedTo",
				"zoneHistoryOfZone",
				"zoneInSpace",
				"zoneOfCategory",
				"zoneViolationOfWorker",
				"zoneViolationOfZone",
			],
			ontology: {
				objectTypes: [
					"Blueprint",
					"BlueprintHandleDetails",
					"LocationGroup",
					"LocationGroupZone",
					"ManualLocationAssignment",
					"SiteZone",
					"Space",
					"SpaceHistory",
					"ZoneAuthorizedResource",
					"ZoneCategory",
					"ZoneHistory",
					"ZoneViolationLog",
				],
				linkTypes: [
					"blueprintHandleOfBlueprint",
					"blueprintOfSpace",
					"locationGroupOnProject",
					"locationGroupZoneOfGroup",
					"locationGroupZoneOfZone",
					"manualAssignmentForWorker",
					"manualAssignmentInCrew",
					"manualAssignmentInGroup",
					"spaceHistoryOfSpace",
					"spaceOnProject",
					"zoneAuthorizedFor",
					"zoneAuthorizedTo",
					"zoneHistoryOfZone",
					"zoneInSpace",
					"zoneOfCategory",
					"zoneViolationOfWorker",
					"zoneViolationOfZone",
				],
				actionTypes: [
					"create-space",
					"create-zone",
					"set-zone-stay-limit",
					"toggle-zone-restriction",
					"update-space",
					"update-zone",
				],
				functionTypes: [
					"create-space",
					"create-zone",
					"set-zone-stay-limit",
					"toggle-zone-restriction",
					"update-space",
					"update-zone",
				],
				valueTypes: [],
				structTypes: [],
				sharedProperties: [],
				interfaces: [],
			},
			appRoutes: [],
			osdkScopes: ["api:use-ontologies-read"],
			filesystemResources: [],
			integrationBindings: [],
			metadata: {
				searchableRefs: [],
				provenanceRefs: [
					"products/mapmanagement/ontology/actions.yaml",
					"products/mapmanagement/ontology/functions.yaml",
					"products/mapmanagement/ontology/links.yaml",
					"products/mapmanagement/ontology/provenance.yaml",
					"products/mapmanagement/ontology/types.yaml",
					"products/mapmanagement/source/fadhili-map-timescale.source-package.json",
				],
				impactIndexRefs: [],
				readinessRefs: [
					"products/mapmanagement/ontology/actions.yaml",
					"products/mapmanagement/ontology/functions.yaml",
					"products/mapmanagement/ontology/links.yaml",
					"products/mapmanagement/ontology/provenance.yaml",
					"products/mapmanagement/ontology/types.yaml",
					"products/mapmanagement/source/fadhili-map-timescale.source-package.json",
				],
			},
			lineage: {
				operationalEventRefs: [],
				readbackRefs: [
					"products/mapmanagement/ontology/actions.yaml",
					"products/mapmanagement/ontology/functions.yaml",
					"products/mapmanagement/ontology/links.yaml",
					"products/mapmanagement/ontology/provenance.yaml",
					"products/mapmanagement/ontology/types.yaml",
					"products/mapmanagement/source/fadhili-map-timescale.source-package.json",
				],
			},
			lakehouse: {
				tableRefs: [],
				projectionReceiptRefs: [],
				readbackRefs: [],
			},
		},
		_manifestRef: "products/mapmanagement/manifests/01-mapmanagement-ontology.product.manifest.json",
	},
	{
		productKey: "media",
		displayName: "Media",
		version: "2026-06-02.v1",
		productType: "ontology-product",
		ownerEnclaveId: "core",
		dependencies: [],
		linkedProducts: [],
		permissions: {
			publishRoles: ["Admin"],
			installDevRoles: ["Admin", "ProjectController"],
			installTestRoles: ["Admin", "ProjectController"],
			installProdRoles: [],
			upgradeRoles: ["Admin", "ProjectController"],
			rollbackRoles: ["Admin"],
			uninstallRoles: ["Admin"],
			bindResourceRoles: ["Admin", "ProjectController"],
			scopeViewerRoles: ["Admin", "ProjectController", "ProjectEngineer"],
		},
		evidence: {
			sourceEnvelopeRefs: [
				"products/media/ontology/actions.yaml",
				"products/media/ontology/links.yaml",
				"products/media/ontology/provenance.yaml",
				"products/media/ontology/types.yaml",
			],
			readModelRefs: [
				"products/media/ontology/actions.yaml",
				"products/media/ontology/links.yaml",
				"products/media/ontology/provenance.yaml",
				"products/media/ontology/types.yaml",
			],
			permissionRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
			],
			osdkRefs: [
				"src/platform/product-control/Wc3.Platform.Applications/Models/Osdk/OsdkApplication.cs",
				"tools/generate/openapi.json",
			],
			appRouteRefs: [],
			rollbackRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
			],
			realDataRefs: [
				"products/media/ontology/actions.yaml",
				"products/media/ontology/links.yaml",
				"products/media/ontology/provenance.yaml",
				"products/media/ontology/types.yaml",
			],
			metadataRefs: [],
			lineageRefs: [
				"products/media/ontology/actions.yaml",
				"products/media/ontology/links.yaml",
				"products/media/ontology/provenance.yaml",
				"products/media/ontology/types.yaml",
			],
			lakehouseRefs: [],
		},
		outputs: {
			requiredProjectRoles: ["Owner", "Editor", "Viewer", "Discoverer"],
			sourceBindings: [],
			sourcePackages: [],
			ontologyObjectTypes: [
				"Camera",
				"CameraChannel",
				"CameraGeometry",
				"CameraHealthCurrent",
				"MediaDetection",
				"PtzCommandAudit",
				"RecordingGap",
				"RecordingSegment",
				"StorageSyncLedger",
				"StreamPathConfig",
				"VideoClip",
			],
			ontologyLinkTypes: [
				"cameraChannelOfCamera",
				"cameraGeometryForCamera",
				"cameraHealthForCamera",
				"detectionFromCameraChannel",
				"recordingGapForCameraChannel",
				"recordingSegmentForCameraChannel",
				"storageSyncForRecordingSegment",
				"videoClipForObservation",
				"videoClipFromRecordingSegment",
			],
			ontology: {
				objectTypes: [
					"Camera",
					"CameraChannel",
					"CameraGeometry",
					"CameraHealthCurrent",
					"MediaDetection",
					"PtzCommandAudit",
					"RecordingGap",
					"RecordingSegment",
					"StorageSyncLedger",
					"StreamPathConfig",
					"VideoClip",
				],
				linkTypes: [
					"cameraChannelOfCamera",
					"cameraGeometryForCamera",
					"cameraHealthForCamera",
					"detectionFromCameraChannel",
					"recordingGapForCameraChannel",
					"recordingSegmentForCameraChannel",
					"storageSyncForRecordingSegment",
					"videoClipForObservation",
					"videoClipFromRecordingSegment",
				],
				actionTypes: [
					"attachVideoClipToObservation",
					"generateSignedPlaybackUrl",
					"ignoreRecordingGap",
					"movePtzCamera",
					"startRecordingGapFill",
					"syncCameraConfig",
					"updateCameraGeometry",
				],
				functionTypes: [],
				valueTypes: [],
				structTypes: [],
				sharedProperties: [],
				interfaces: [],
			},
			appRoutes: [],
			osdkScopes: ["api:use-ontologies-read"],
			filesystemResources: [],
			integrationBindings: [],
			metadata: {
				searchableRefs: [],
				provenanceRefs: [
					"products/media/ontology/actions.yaml",
					"products/media/ontology/links.yaml",
					"products/media/ontology/provenance.yaml",
					"products/media/ontology/types.yaml",
				],
				impactIndexRefs: [],
				readinessRefs: [
					"products/media/ontology/actions.yaml",
					"products/media/ontology/links.yaml",
					"products/media/ontology/provenance.yaml",
					"products/media/ontology/types.yaml",
				],
			},
			lineage: {
				operationalEventRefs: [],
				readbackRefs: [
					"products/media/ontology/actions.yaml",
					"products/media/ontology/links.yaml",
					"products/media/ontology/provenance.yaml",
					"products/media/ontology/types.yaml",
				],
			},
			lakehouse: {
				tableRefs: [],
				projectionReceiptRefs: [],
				readbackRefs: [],
			},
		},
		_manifestRef: "products/media/manifests/01-media-ontology.product.manifest.json",
	},
	{
		productKey: "raw-device-events",
		displayName: "Raw Device Events",
		version: "2026-06-02.v1",
		productType: "ontology-product",
		ownerEnclaveId: "core",
		dependencies: [],
		linkedProducts: [],
		permissions: {
			publishRoles: ["Admin"],
			installDevRoles: ["Admin", "ProjectController"],
			installTestRoles: ["Admin", "ProjectController"],
			installProdRoles: ["Admin"],
			upgradeRoles: ["Admin", "ProjectController"],
			rollbackRoles: ["Admin"],
			uninstallRoles: ["Admin"],
			bindResourceRoles: ["Admin", "ProjectController"],
			scopeViewerRoles: ["Admin", "ProjectController", "ProjectEngineer"],
		},
		evidence: {
			sourceEnvelopeRefs: ["products/raw-device-events/ontology/raw-device-events.yaml"],
			readModelRefs: ["products/raw-device-events/ontology/raw-device-events.yaml"],
			permissionRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
			],
			osdkRefs: [
				"src/platform/product-control/Wc3.Platform.Applications/Models/Osdk/OsdkApplication.cs",
				"tools/generate/openapi.json",
			],
			appRouteRefs: [],
			rollbackRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
			],
			realDataRefs: ["products/raw-device-events/ontology/raw-device-events.yaml"],
			metadataRefs: [],
			lineageRefs: ["products/raw-device-events/ontology/raw-device-events.yaml"],
			lakehouseRefs: [],
		},
		outputs: {
			requiredProjectRoles: ["Owner", "Editor", "Viewer", "Discoverer"],
			sourceBindings: [],
			sourcePackages: [],
			ontologyObjectTypes: [
				"RawDeviceLocationFact",
				"RawDiagnosticsEvent",
				"RawGatewayEvent",
				"RawSensorFact",
				"equipment_alert_history",
				"equipment_alert_rule",
			],
			ontologyLinkTypes: [],
			ontology: {
				objectTypes: [
					"RawDeviceLocationFact",
					"RawDiagnosticsEvent",
					"RawGatewayEvent",
					"RawSensorFact",
					"equipment_alert_history",
					"equipment_alert_rule",
				],
				linkTypes: [],
				actionTypes: [],
				functionTypes: [],
				valueTypes: [],
				structTypes: [],
				sharedProperties: [],
				interfaces: [],
			},
			appRoutes: [],
			osdkScopes: ["api:use-ontologies-read"],
			filesystemResources: [],
			integrationBindings: [],
			metadata: {
				searchableRefs: [],
				provenanceRefs: ["products/raw-device-events/ontology/raw-device-events.yaml"],
				impactIndexRefs: [],
				readinessRefs: ["products/raw-device-events/ontology/raw-device-events.yaml"],
			},
			lineage: {
				operationalEventRefs: [],
				readbackRefs: ["products/raw-device-events/ontology/raw-device-events.yaml"],
			},
			lakehouse: {
				tableRefs: [],
				projectionReceiptRefs: [],
				readbackRefs: [],
			},
		},
		_manifestRef: "products/raw-device-events/manifests/01-raw-device-events-ontology.product.manifest.json",
	},
	{
		productKey: "reset-baseline-governed-action",
		displayName: "Reset Baseline Governed Action",
		version: "2026-07-12.v2",
		productType: "ontology-product",
		ownerEnclaveId: "core",
		dependencies: [],
		linkedProducts: [],
		permissions: {
			publishRoles: ["Admin"],
			installDevRoles: ["Admin", "ProjectController"],
			installTestRoles: ["Admin", "ProjectController"],
			installProdRoles: [],
			upgradeRoles: ["Admin", "ProjectController"],
			rollbackRoles: ["Admin"],
			uninstallRoles: ["Admin"],
			bindResourceRoles: ["Admin", "ProjectController"],
			scopeViewerRoles: ["Admin", "ProjectController", "ProjectEngineer"],
		},
		evidence: {
			sourceEnvelopeRefs: ["products/reset-baseline-governed-action/ontology/reset-baseline-governed-action.yaml"],
			readModelRefs: ["products/reset-baseline-governed-action/ontology/reset-baseline-governed-action.yaml"],
			permissionRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresActionTypePermissionEvaluator.cs",
			],
			osdkRefs: ["tools/generate/openapi.json"],
			appRouteRefs: [],
			rollbackRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresGovernedActionAtomicCommit.cs",
			],
			realDataRefs: ["products/reset-baseline-governed-action/ontology/reset-baseline-governed-action.yaml"],
			metadataRefs: [],
			lineageRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresGovernedActionAtomicCommit.cs",
			],
			lakehouseRefs: [],
		},
		outputs: {
			requiredProjectRoles: ["Owner", "Editor", "Viewer", "Discoverer"],
			sourceBindings: [],
			sourcePackages: [],
			ontologyObjectTypes: ["ResetBaselineSpace", "ResetBaselineSpaceHistory"],
			ontologyLinkTypes: ["resetBaselineSpaceHistoryOfSpace"],
			ontology: {
				objectTypes: ["ResetBaselineSpace", "ResetBaselineSpaceHistory"],
				linkTypes: ["resetBaselineSpaceHistoryOfSpace"],
				actionTypes: ["create-reset-baseline-space"],
				functionTypes: ["create-reset-baseline-space"],
				valueTypes: [],
				structTypes: [],
				sharedProperties: [],
				interfaces: [],
			},
			appRoutes: [],
			osdkScopes: ["api:use-actions-execute", "api:use-ontologies-read"],
			filesystemResources: [],
			integrationBindings: [],
			metadata: {
				searchableRefs: [],
				provenanceRefs: ["products/reset-baseline-governed-action/ontology/reset-baseline-governed-action.yaml"],
				impactIndexRefs: [],
				readinessRefs: ["products/reset-baseline-governed-action/ontology/reset-baseline-governed-action.yaml"],
			},
			lineage: {
				operationalEventRefs: [
					"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresGovernedActionAtomicCommit.cs",
				],
				readbackRefs: ["products/reset-baseline-governed-action/ontology/reset-baseline-governed-action.yaml"],
			},
			lakehouse: {
				tableRefs: [],
				projectionReceiptRefs: [],
				readbackRefs: [],
			},
		},
		_manifestRef:
			"products/reset-baseline-governed-action/manifests/01-reset-baseline-governed-action.product.manifest.json",
	},
	{
		productKey: "safety",
		displayName: "Safety & Compliance",
		version: "2026-06-02.v1",
		productType: "ontology-product",
		ownerEnclaveId: "core",
		dependencies: [],
		linkedProducts: [],
		permissions: {
			publishRoles: ["Admin"],
			installDevRoles: ["Admin", "ProjectController"],
			installTestRoles: ["Admin", "ProjectController"],
			installProdRoles: [],
			upgradeRoles: ["Admin", "ProjectController"],
			rollbackRoles: ["Admin"],
			uninstallRoles: ["Admin"],
			bindResourceRoles: ["Admin", "ProjectController"],
			scopeViewerRoles: ["Admin", "ProjectController", "ProjectEngineer"],
		},
		evidence: {
			sourceEnvelopeRefs: [
				"products/safety/ontology/actions.yaml",
				"products/safety/ontology/links.yaml",
				"products/safety/ontology/provenance.yaml",
				"products/safety/ontology/types.yaml",
			],
			readModelRefs: [
				"products/safety/ontology/actions.yaml",
				"products/safety/ontology/links.yaml",
				"products/safety/ontology/provenance.yaml",
				"products/safety/ontology/types.yaml",
			],
			permissionRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
			],
			osdkRefs: [
				"src/platform/product-control/Wc3.Platform.Applications/Models/Osdk/OsdkApplication.cs",
				"tools/generate/openapi.json",
			],
			appRouteRefs: [],
			rollbackRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
			],
			realDataRefs: [
				"products/safety/ontology/actions.yaml",
				"products/safety/ontology/links.yaml",
				"products/safety/ontology/provenance.yaml",
				"products/safety/ontology/types.yaml",
			],
			metadataRefs: [],
			lineageRefs: [
				"products/safety/ontology/actions.yaml",
				"products/safety/ontology/links.yaml",
				"products/safety/ontology/provenance.yaml",
				"products/safety/ontology/types.yaml",
			],
			lakehouseRefs: [],
		},
		outputs: {
			requiredProjectRoles: ["Owner", "Editor", "Viewer", "Discoverer"],
			sourceBindings: [],
			sourcePackages: [],
			ontologyObjectTypes: ["EnvironmentalReading", "Incident", "Observation", "Zone", "ZoneViolation"],
			ontologyLinkTypes: [
				"environmentalReadingInZone",
				"observationInZone",
				"zoneViolationByWorker",
				"zoneViolationInZone",
			],
			ontology: {
				objectTypes: ["EnvironmentalReading", "Incident", "Observation", "Zone", "ZoneViolation"],
				linkTypes: ["environmentalReadingInZone", "observationInZone", "zoneViolationByWorker", "zoneViolationInZone"],
				actionTypes: ["closeObservation", "createObservation", "logIncident"],
				functionTypes: [],
				valueTypes: [],
				structTypes: [],
				sharedProperties: [],
				interfaces: [],
			},
			appRoutes: [],
			osdkScopes: ["api:use-ontologies-read"],
			filesystemResources: [],
			integrationBindings: [],
			metadata: {
				searchableRefs: [],
				provenanceRefs: [
					"products/safety/ontology/actions.yaml",
					"products/safety/ontology/links.yaml",
					"products/safety/ontology/provenance.yaml",
					"products/safety/ontology/types.yaml",
				],
				impactIndexRefs: [],
				readinessRefs: [
					"products/safety/ontology/actions.yaml",
					"products/safety/ontology/links.yaml",
					"products/safety/ontology/provenance.yaml",
					"products/safety/ontology/types.yaml",
				],
			},
			lineage: {
				operationalEventRefs: [],
				readbackRefs: [
					"products/safety/ontology/actions.yaml",
					"products/safety/ontology/links.yaml",
					"products/safety/ontology/provenance.yaml",
					"products/safety/ontology/types.yaml",
				],
			},
			lakehouse: {
				tableRefs: [],
				projectionReceiptRefs: [],
				readbackRefs: [],
			},
		},
		_manifestRef: "products/safety/manifests/01-safety-ontology.product.manifest.json",
	},
	{
		productKey: "verifyprogress",
		displayName: "Verifyprogress",
		version: "2026-06-02.v1",
		productType: "ontology-product",
		ownerEnclaveId: "core",
		dependencies: [],
		linkedProducts: [],
		permissions: {
			publishRoles: ["Admin"],
			installDevRoles: ["Admin", "ProjectController"],
			installTestRoles: ["Admin", "ProjectController"],
			installProdRoles: [],
			upgradeRoles: ["Admin", "ProjectController"],
			rollbackRoles: ["Admin"],
			uninstallRoles: ["Admin"],
			bindResourceRoles: ["Admin", "ProjectController"],
			scopeViewerRoles: ["Admin", "ProjectController", "ProjectEngineer"],
		},
		evidence: {
			sourceEnvelopeRefs: [
				"products/verifyprogress/ontology/actions.yaml",
				"products/verifyprogress/ontology/provenance.yaml",
				"products/verifyprogress/ontology/types.yaml",
			],
			readModelRefs: [
				"products/verifyprogress/ontology/actions.yaml",
				"products/verifyprogress/ontology/provenance.yaml",
				"products/verifyprogress/ontology/types.yaml",
			],
			permissionRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
			],
			osdkRefs: [
				"src/platform/product-control/Wc3.Platform.Applications/Models/Osdk/OsdkApplication.cs",
				"tools/generate/openapi.json",
			],
			appRouteRefs: [],
			rollbackRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
			],
			realDataRefs: [
				"products/verifyprogress/ontology/actions.yaml",
				"products/verifyprogress/ontology/provenance.yaml",
				"products/verifyprogress/ontology/types.yaml",
			],
			metadataRefs: [],
			lineageRefs: [
				"products/verifyprogress/ontology/actions.yaml",
				"products/verifyprogress/ontology/provenance.yaml",
				"products/verifyprogress/ontology/types.yaml",
			],
			lakehouseRefs: [],
		},
		outputs: {
			requiredProjectRoles: ["Owner", "Editor", "Viewer", "Discoverer"],
			sourceBindings: [],
			sourcePackages: [],
			ontologyObjectTypes: ["progress_delay_reason"],
			ontologyLinkTypes: [],
			ontology: {
				objectTypes: ["progress_delay_reason"],
				linkTypes: [],
				actionTypes: ["create-progress-delay-reason"],
				functionTypes: [],
				valueTypes: [],
				structTypes: [],
				sharedProperties: [],
				interfaces: [],
			},
			appRoutes: [],
			osdkScopes: ["api:use-ontologies-read"],
			filesystemResources: [],
			integrationBindings: [],
			metadata: {
				searchableRefs: [],
				provenanceRefs: [
					"products/verifyprogress/ontology/actions.yaml",
					"products/verifyprogress/ontology/provenance.yaml",
					"products/verifyprogress/ontology/types.yaml",
				],
				impactIndexRefs: [],
				readinessRefs: [
					"products/verifyprogress/ontology/actions.yaml",
					"products/verifyprogress/ontology/provenance.yaml",
					"products/verifyprogress/ontology/types.yaml",
				],
			},
			lineage: {
				operationalEventRefs: [],
				readbackRefs: [
					"products/verifyprogress/ontology/actions.yaml",
					"products/verifyprogress/ontology/provenance.yaml",
					"products/verifyprogress/ontology/types.yaml",
				],
			},
			lakehouse: {
				tableRefs: [],
				projectionReceiptRefs: [],
				readbackRefs: [],
			},
		},
		_manifestRef: "products/verifyprogress/manifests/01-verifyprogress-ontology.product.manifest.json",
	},
	{
		productKey: "verifytime",
		displayName: "Verifytime",
		version: "2026-06-02.v1",
		productType: "ontology-product",
		ownerEnclaveId: "core",
		dependencies: [],
		linkedProducts: [],
		permissions: {
			publishRoles: ["Admin"],
			installDevRoles: ["Admin", "ProjectController"],
			installTestRoles: ["Admin", "ProjectController"],
			installProdRoles: [],
			upgradeRoles: ["Admin", "ProjectController"],
			rollbackRoles: ["Admin"],
			uninstallRoles: ["Admin"],
			bindResourceRoles: ["Admin", "ProjectController"],
			scopeViewerRoles: ["Admin", "ProjectController", "ProjectEngineer"],
		},
		evidence: {
			sourceEnvelopeRefs: [
				"products/verifytime/ontology/actions.yaml",
				"products/verifytime/ontology/provenance.yaml",
				"products/verifytime/ontology/types.yaml",
			],
			readModelRefs: [
				"products/verifytime/ontology/actions.yaml",
				"products/verifytime/ontology/provenance.yaml",
				"products/verifytime/ontology/types.yaml",
			],
			permissionRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
			],
			osdkRefs: [
				"src/platform/product-control/Wc3.Platform.Applications/Models/Osdk/OsdkApplication.cs",
				"tools/generate/openapi.json",
			],
			appRouteRefs: [],
			rollbackRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
			],
			realDataRefs: [
				"products/verifytime/ontology/actions.yaml",
				"products/verifytime/ontology/provenance.yaml",
				"products/verifytime/ontology/types.yaml",
			],
			metadataRefs: [],
			lineageRefs: [
				"products/verifytime/ontology/actions.yaml",
				"products/verifytime/ontology/provenance.yaml",
				"products/verifytime/ontology/types.yaml",
			],
			lakehouseRefs: [],
		},
		outputs: {
			requiredProjectRoles: ["Owner", "Editor", "Viewer", "Discoverer"],
			sourceBindings: [],
			sourcePackages: [],
			ontologyObjectTypes: ["delay_reason"],
			ontologyLinkTypes: [],
			ontology: {
				objectTypes: ["delay_reason"],
				linkTypes: [],
				actionTypes: ["create-delay-reason", "edit-delay-reason", "toggle-delay-reason-activation"],
				functionTypes: [],
				valueTypes: [],
				structTypes: [],
				sharedProperties: [],
				interfaces: [],
			},
			appRoutes: [],
			osdkScopes: ["api:use-ontologies-read"],
			filesystemResources: [],
			integrationBindings: [],
			metadata: {
				searchableRefs: [],
				provenanceRefs: [
					"products/verifytime/ontology/actions.yaml",
					"products/verifytime/ontology/provenance.yaml",
					"products/verifytime/ontology/types.yaml",
				],
				impactIndexRefs: [],
				readinessRefs: [
					"products/verifytime/ontology/actions.yaml",
					"products/verifytime/ontology/provenance.yaml",
					"products/verifytime/ontology/types.yaml",
				],
			},
			lineage: {
				operationalEventRefs: [],
				readbackRefs: [
					"products/verifytime/ontology/actions.yaml",
					"products/verifytime/ontology/provenance.yaml",
					"products/verifytime/ontology/types.yaml",
				],
			},
			lakehouse: {
				tableRefs: [],
				projectionReceiptRefs: [],
				readbackRefs: [],
			},
		},
		_manifestRef: "products/verifytime/manifests/01-verifytime-ontology.product.manifest.json",
	},
	{
		productKey: "wirepas-device-simulator",
		displayName: "Wirepas Device Simulator",
		version: "2026-06-10.v1",
		productType: "runtime-product",
		ownerEnclaveId: "core",
		dependencies: [],
		linkedProducts: [
			{
				productKey: "wirepas-nms",
				version: "2026-05-26.v1",
				role: "target-product",
				optional: false,
			},
		],
		permissions: {
			publishRoles: ["Admin"],
			installDevRoles: ["Admin", "ProjectController"],
			installTestRoles: ["Admin", "ProjectController"],
			installProdRoles: ["Admin"],
			upgradeRoles: ["Admin", "ProjectController"],
			rollbackRoles: ["Admin"],
			uninstallRoles: ["Admin"],
			bindResourceRoles: ["Admin", "ProjectController"],
			scopeViewerRoles: ["Admin", "ProjectController", "ProjectEngineer"],
		},
		evidence: {
			sourceEnvelopeRefs: [
				"tools/dev/device-lab/scripts/wirepas_nms_simulate.py",
				"tools/dev/device-lab/simulators/wirepas_gateway_replay.py",
			],
			readModelRefs: [
				"products/wirepas-nms/ontology/wirepas-nms.yaml",
				"decisions/ADR-050-product-runtime-kubernetes-operator.md",
			],
			permissionRefs: [
				"decisions/ADR-039-wc3-authorization-source-of-truth.md",
				"decisions/ADR-050-product-runtime-kubernetes-operator.md",
			],
			osdkRefs: [],
			appRouteRefs: [],
			rollbackRefs: ["decisions/ADR-050-product-runtime-kubernetes-operator.md"],
			realDataRefs: [],
			simulatorBackedRefs: [
				"simulator-backed://wirepas-device-simulator/local-device-lab",
				"tools/dev/device-lab/scripts/wirepas_nms_simulate.py#simulator-backed-wnms-protobuf",
			],
			metadataRefs: [],
			lineageRefs: [
				"products/wirepas-nms/ontology/wirepas-nms.yaml",
				"decisions/ADR-050-product-runtime-kubernetes-operator.md",
			],
			lakehouseRefs: [],
		},
		outputs: {
			requiredProjectRoles: ["Owner", "Editor", "Viewer", "Discoverer"],
			sourceBindings: [],
			ontologyObjectTypes: ["WirepasNetwork", "WirepasGateway", "WirepasSink", "WirepasNode", "DeviceIdentity"],
			ontologyLinkTypes: [
				"wirepas-network-to-gateway",
				"wirepas-network-to-node",
				"wirepas-gateway-to-node",
				"wirepas-gateway-to-sink",
				"wirepas-node-to-device-identity",
			],
			appRoutes: ["/apps/wirepas-device-simulator"],
			osdkScopes: ["api:use-ontologies-read"],
			integrationBindings: [],
			runtimeWorkloads: [
				{
					workloadId: "wirepas-simulator-burst",
					kind: "kubernetesJob",
					imageRef: "local/wc3-wirepas-device-simulator:2026-06-10.v1",
					parameterSchemaRef: "wirepas-device-simulator.burst.v1",
					timeoutSeconds: 300,
					resources: {
						cpu: "500m",
						memory: "512Mi",
					},
					linkedInterfaceRefs: ["WirepasDeviceSimulator"],
					linkedOntologyObjectTypes: [
						"WirepasNetwork",
						"WirepasGateway",
						"WirepasSink",
						"WirepasNode",
						"DeviceIdentity",
					],
					secretRefs: ["wc3-wirepas-nms-mqtt-gateway-credentials"],
					evidenceClassification: "simulator-backed",
					environmentVariables: {
						WIREPAS_NMS_MQTT_HOST: "vernemq.wc3-device-lab-nms.svc.cluster.local",
						WIREPAS_NMS_MQTT_FORWARD_PORT: "1883",
					},
				},
			],
			sourcePackages: [],
			ontology: {
				objectTypes: ["WirepasNetwork", "WirepasGateway", "WirepasSink", "WirepasNode", "DeviceIdentity"],
				linkTypes: [
					"wirepas-network-to-gateway",
					"wirepas-network-to-node",
					"wirepas-gateway-to-node",
					"wirepas-gateway-to-sink",
					"wirepas-node-to-device-identity",
				],
				actionTypes: [],
				functionTypes: [],
				valueTypes: [],
				structTypes: [],
				sharedProperties: [],
				interfaces: ["WirepasDeviceSimulator"],
			},
			filesystemResources: [],
			metadata: {
				searchableRefs: [],
				provenanceRefs: [
					"tools/dev/device-lab/scripts/wirepas_nms_simulate.py",
					"tools/dev/device-lab/simulators/wirepas_gateway_replay.py",
				],
				impactIndexRefs: [],
				readinessRefs: [],
			},
			lineage: {
				operationalEventRefs: [],
				readbackRefs: [
					"products/wirepas-nms/ontology/wirepas-nms.yaml",
					"decisions/ADR-050-product-runtime-kubernetes-operator.md",
				],
			},
			lakehouse: {
				tableRefs: [],
				projectionReceiptRefs: [],
				readbackRefs: [],
			},
		},
		_manifestRef: "products/wirepas-device-simulator/manifests/01-wirepas-device-simulator.product.manifest.json",
	},
	{
		productKey: "wirepas-nms-ontology",
		displayName: "Wirepas NMS Ontology Product",
		version: "2026-05-26.v1",
		productType: "ontology-product",
		ownerEnclaveId: "core",
		dependencies: [],
		linkedProducts: [],
		permissions: {
			publishRoles: ["Admin"],
			installDevRoles: ["Admin", "ProjectController"],
			installTestRoles: ["Admin", "ProjectController"],
			installProdRoles: ["Admin"],
			upgradeRoles: ["Admin", "ProjectController"],
			rollbackRoles: ["Admin"],
			uninstallRoles: ["Admin"],
			bindResourceRoles: ["Admin", "ProjectController"],
			scopeViewerRoles: ["Admin", "ProjectController", "ProjectEngineer"],
		},
		evidence: {
			sourceEnvelopeRefs: [
				"products/wirepas-nms/source/wirepas-nms-rest.source-registry.json",
				"decisions/ADR-044-device-and-reality-capture-source-platform.md",
			],
			readModelRefs: [
				"products/wirepas-nms/ontology/wirepas-nms.yaml",
				"decisions/ADR-044-device-and-reality-capture-source-platform.md",
			],
			permissionRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresOpenFgaProjectionBuilder.cs",
				"decisions/ADR-039-wc3-authorization-source-of-truth.md",
			],
			osdkRefs: [
				"products/wirepas-nms/source/wirepas-nms-rest.source-package.json",
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Data/SourceOnboardingPackageInstallService.cs",
				"src/platform/product-control/Wc3.Platform.Applications/Models/Osdk/OsdkApplication.cs",
			],
			appRouteRefs: [],
			rollbackRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
				"src/platform/product-control/Wc3.Platform.Products/Models/Marketplace/Product.cs",
			],
			realDataRefs: [
				"foundry://wnms/rest-source/ri.magritte..source.be1e8c64-85b6-4020-a409-757521522b4b",
				"foundry://wnms/build/ri.foundry.main.build.48a6e60c-013e-43dc-900f-925b8ac4a732",
				"foundry://wnms/dataset/wirepas_nms_networks_live/ri.foundry.main.dataset.3be92adb-0a36-4cbb-814f-39b71409d645",
				"foundry://wnms/dataset/wirepas_nms_gateways_live/ri.foundry.main.dataset.b7d37225-5d69-492f-81e0-de587babb6bb",
				"foundry://wnms/dataset/wirepas_nms_nodes_live/ri.foundry.main.dataset.33e1c884-a08f-45f3-a942-08c217f66991",
			],
			metadataRefs: [],
			lineageRefs: [
				"products/wirepas-nms/ontology/wirepas-nms.yaml",
				"decisions/ADR-044-device-and-reality-capture-source-platform.md",
			],
			lakehouseRefs: [],
		},
		readiness: {
			classification: "validation-only",
			required: ["products/wirepas-nms/ontology/wirepas-nms.yaml"],
			blockedReasons: ["#696 remains blocked for production-active Wirepas/NMS readiness and project-scoped readback."],
			sourceRefs: [
				"products/wirepas-nms/ontology/wirepas-nms.yaml",
				"products/wirepas-nms/source/wirepas-nms-rest.source-package.json",
			],
			testRefs: ["tests/Wc3.Tests/Product/WirepasNmsProductPackageAuthorityTests.cs"],
		},
		outputs: {
			requiredProjectRoles: ["Owner", "Editor", "Viewer", "Discoverer"],
			sourceBindings: [],
			ontologyObjectTypes: [
				"WirepasNmsDeployment",
				"WirepasProductInstall",
				"WirepasProjectBinding",
				"WirepasNetwork",
				"WirepasGateway",
				"WirepasSink",
				"WirepasNode",
				"WirepasNetworkConfig",
				"WirepasOperation",
				"DeviceIdentity",
			],
			ontologyLinkTypes: [
				"wirepas-project-binding-to-network",
				"wirepas-network-to-gateway",
				"wirepas-network-to-node",
				"wirepas-gateway-to-node",
				"wirepas-gateway-to-sink",
				"wirepas-node-to-device-identity",
			],
			appRoutes: [],
			osdkScopes: ["api:use-ontologies-read"],
			integrationBindings: [
				{
					bindingId: "wirepas-project-network",
					label: "Wirepas project to WNMS network",
					sourceObjectType: "WirepasProjectBinding",
					targetObjectType: "WirepasNetwork",
					linkType: "wirepas-project-binding-to-network",
					classification: "manifest-declared-source-package-binding",
				},
			],
			sourcePackages: [],
			ontology: {
				objectTypes: [
					"WirepasNmsDeployment",
					"WirepasProductInstall",
					"WirepasProjectBinding",
					"WirepasNetwork",
					"WirepasGateway",
					"WirepasSink",
					"WirepasNode",
					"WirepasNetworkConfig",
					"WirepasOperation",
					"DeviceIdentity",
				],
				linkTypes: [
					"wirepas-project-binding-to-network",
					"wirepas-network-to-gateway",
					"wirepas-network-to-node",
					"wirepas-gateway-to-node",
					"wirepas-gateway-to-sink",
					"wirepas-node-to-device-identity",
				],
				actionTypes: [],
				functionTypes: [],
				valueTypes: ["WirepasNetworkAddress"],
				structTypes: [],
				sharedProperties: ["wirepasProjectId"],
				interfaces: [],
			},
			filesystemResources: [],
			metadata: {
				searchableRefs: [],
				provenanceRefs: [
					"products/wirepas-nms/source/wirepas-nms-rest.source-registry.json",
					"decisions/ADR-044-device-and-reality-capture-source-platform.md",
				],
				impactIndexRefs: [],
				readinessRefs: [
					"foundry://wnms/build/ri.foundry.main.build.48a6e60c-013e-43dc-900f-925b8ac4a732",
					"foundry://wnms/dataset/wirepas_nms_gateways_live/ri.foundry.main.dataset.b7d37225-5d69-492f-81e0-de587babb6bb",
					"foundry://wnms/dataset/wirepas_nms_networks_live/ri.foundry.main.dataset.3be92adb-0a36-4cbb-814f-39b71409d645",
					"foundry://wnms/dataset/wirepas_nms_nodes_live/ri.foundry.main.dataset.33e1c884-a08f-45f3-a942-08c217f66991",
					"foundry://wnms/rest-source/ri.magritte..source.be1e8c64-85b6-4020-a409-757521522b4b",
					"tests/Wc3.Tests/Product/WirepasNmsProductPackageAuthorityTests.cs",
				],
			},
			lineage: {
				operationalEventRefs: [],
				readbackRefs: [
					"products/wirepas-nms/ontology/wirepas-nms.yaml",
					"decisions/ADR-044-device-and-reality-capture-source-platform.md",
				],
			},
			lakehouse: {
				tableRefs: [],
				projectionReceiptRefs: [],
				readbackRefs: [],
			},
		},
		_manifestRef: "products/wirepas-nms/manifests/01-wirepas-nms-ontology.product.manifest.json",
	},
	{
		productKey: "wirepas-nms-source",
		displayName: "Wirepas NMS Source Product",
		version: "2026-05-26.v1",
		productType: "source-product",
		ownerEnclaveId: "core",
		dependencies: [
			{
				productKey: "wirepas-nms-ontology",
				versionRange: "2026-05-26.v1",
				required: true,
			},
		],
		linkedProducts: [],
		permissions: {
			publishRoles: ["Admin"],
			installDevRoles: ["Admin", "ProjectController"],
			installTestRoles: ["Admin", "ProjectController"],
			installProdRoles: ["Admin"],
			upgradeRoles: ["Admin", "ProjectController"],
			rollbackRoles: ["Admin"],
			uninstallRoles: ["Admin"],
			bindResourceRoles: ["Admin", "ProjectController"],
			scopeViewerRoles: ["Admin", "ProjectController", "ProjectEngineer"],
		},
		evidence: {
			sourceEnvelopeRefs: [
				"products/wirepas-nms/source/wirepas-nms-rest.source-package.json",
				"products/wirepas-nms/source/wirepas-nms-rest.source-registry.json",
				"decisions/ADR-044-device-and-reality-capture-source-platform.md",
			],
			readModelRefs: [
				"products/wirepas-nms/ontology/wirepas-nms.yaml",
				"decisions/ADR-044-device-and-reality-capture-source-platform.md",
			],
			permissionRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresOpenFgaProjectionBuilder.cs",
				"decisions/ADR-039-wc3-authorization-source-of-truth.md",
			],
			osdkRefs: [
				"products/wirepas-nms/source/wirepas-nms-rest.source-package.json",
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Data/SourceOnboardingPackageInstallService.cs",
				"src/platform/product-control/Wc3.Platform.Applications/Models/Osdk/OsdkApplication.cs",
			],
			appRouteRefs: [],
			rollbackRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
				"src/platform/product-control/Wc3.Platform.Products/Models/Marketplace/Product.cs",
			],
			realDataRefs: [
				"foundry://wnms/rest-source/ri.magritte..source.be1e8c64-85b6-4020-a409-757521522b4b",
				"foundry://wnms/build/ri.foundry.main.build.48a6e60c-013e-43dc-900f-925b8ac4a732",
				"foundry://wnms/dataset/wirepas_nms_networks_live/ri.foundry.main.dataset.3be92adb-0a36-4cbb-814f-39b71409d645",
				"foundry://wnms/dataset/wirepas_nms_gateways_live/ri.foundry.main.dataset.b7d37225-5d69-492f-81e0-de587babb6bb",
				"foundry://wnms/dataset/wirepas_nms_nodes_live/ri.foundry.main.dataset.33e1c884-a08f-45f3-a942-08c217f66991",
			],
			metadataRefs: [],
			lineageRefs: [
				"products/wirepas-nms/ontology/wirepas-nms.yaml",
				"decisions/ADR-044-device-and-reality-capture-source-platform.md",
			],
			lakehouseRefs: [],
		},
		readiness: {
			classification: "validation-only",
			required: ["products/wirepas-nms/source/wirepas-nms-rest.source-package.json"],
			blockedReasons: [
				"#696 remains blocked for production-active Wirepas/NMS credentials, non-prod replay, and project-scoped readback.",
				"#696 blocks production-active readiness until real source data, credentials, and project-scoped readback are proven.",
			],
			sourceRefs: [
				"products/wirepas-nms/source/wirepas-nms-rest.source-package.json",
				"products/wirepas-nms/source/wirepas-nms-rest.source-registry.json",
			],
			testRefs: ["tests/Wc3.Tests/Product/WirepasNmsProductPackageAuthorityTests.cs"],
		},
		outputs: {
			requiredProjectRoles: ["Owner", "Editor", "Viewer", "Discoverer"],
			sourceBindings: ["wirepas-nms-rest"],
			ontologyObjectTypes: [
				"WirepasNmsDeployment",
				"WirepasProductInstall",
				"WirepasProjectBinding",
				"WirepasNetwork",
				"WirepasGateway",
				"WirepasSink",
				"WirepasNode",
				"WirepasNetworkConfig",
				"WirepasOperation",
				"DeviceIdentity",
			],
			ontologyLinkTypes: [
				"wirepas-project-binding-to-network",
				"wirepas-network-to-gateway",
				"wirepas-network-to-node",
				"wirepas-gateway-to-node",
				"wirepas-gateway-to-sink",
				"wirepas-node-to-device-identity",
			],
			appRoutes: [],
			osdkScopes: ["api:use-ontologies-read"],
			integrationBindings: [
				{
					bindingId: "wirepas-project-network",
					label: "Wirepas project to WNMS network",
					sourceObjectType: "WirepasProjectBinding",
					targetObjectType: "WirepasNetwork",
					linkType: "wirepas-project-binding-to-network",
					classification: "manifest-declared-source-package-binding",
					sourceProperties: {
						wirepas_project_binding_id: "$sourceObjectId",
						project_id: "$projectId",
						nms_deployment_id: "wirepas-nms-rest",
						source_network_uuid: "$targetObjectId",
						assignment_status: "active",
						assigned_at: "$appliedAt",
						active: true,
					},
					targetProperties: {
						project_id: "$projectId",
						nms_deployment_id: "wirepas-nms-rest",
						source_network_uuid: "$targetObjectId",
						name: "$targetObjectId",
						status: "project-bound",
					},
					linkProperties: {
						active: true,
						project_id: "$projectId",
						binding_id: "$bindingId",
					},
				},
			],
			sourcePackages: ["wirepas-nms-rest"],
			ontology: {
				objectTypes: [
					"WirepasNmsDeployment",
					"WirepasProductInstall",
					"WirepasProjectBinding",
					"WirepasNetwork",
					"WirepasGateway",
					"WirepasSink",
					"WirepasNode",
					"WirepasNetworkConfig",
					"WirepasOperation",
					"DeviceIdentity",
				],
				linkTypes: [
					"wirepas-project-binding-to-network",
					"wirepas-network-to-gateway",
					"wirepas-network-to-node",
					"wirepas-gateway-to-node",
					"wirepas-gateway-to-sink",
					"wirepas-node-to-device-identity",
				],
				actionTypes: [],
				functionTypes: [],
				valueTypes: [],
				structTypes: [],
				sharedProperties: [],
				interfaces: [],
			},
			filesystemResources: [],
			metadata: {
				searchableRefs: [],
				provenanceRefs: [
					"products/wirepas-nms/source/wirepas-nms-rest.source-package.json",
					"products/wirepas-nms/source/wirepas-nms-rest.source-registry.json",
					"decisions/ADR-044-device-and-reality-capture-source-platform.md",
				],
				impactIndexRefs: [],
				readinessRefs: [
					"foundry://wnms/build/ri.foundry.main.build.48a6e60c-013e-43dc-900f-925b8ac4a732",
					"foundry://wnms/dataset/wirepas_nms_gateways_live/ri.foundry.main.dataset.b7d37225-5d69-492f-81e0-de587babb6bb",
					"foundry://wnms/dataset/wirepas_nms_networks_live/ri.foundry.main.dataset.3be92adb-0a36-4cbb-814f-39b71409d645",
					"foundry://wnms/dataset/wirepas_nms_nodes_live/ri.foundry.main.dataset.33e1c884-a08f-45f3-a942-08c217f66991",
					"foundry://wnms/rest-source/ri.magritte..source.be1e8c64-85b6-4020-a409-757521522b4b",
					"tests/Wc3.Tests/Product/WirepasNmsProductPackageAuthorityTests.cs",
				],
			},
			lineage: {
				operationalEventRefs: [],
				readbackRefs: [
					"products/wirepas-nms/ontology/wirepas-nms.yaml",
					"decisions/ADR-044-device-and-reality-capture-source-platform.md",
				],
			},
			lakehouse: {
				tableRefs: [],
				projectionReceiptRefs: [],
				readbackRefs: [],
			},
		},
		_manifestRef: "products/wirepas-nms/manifests/02-wirepas-nms-source.product.manifest.json",
	},
	{
		productKey: "wirepas-nms",
		displayName: "Wirepas NMS Product",
		version: "2026-05-26.v1",
		productType: "composite-product",
		ownerEnclaveId: "core",
		dependencies: [],
		linkedProducts: [
			{
				productKey: "wirepas-nms-ontology",
				version: "2026-05-26.v1",
				role: "ontology",
				optional: false,
			},
			{
				productKey: "wirepas-nms-source",
				version: "2026-05-26.v1",
				role: "source",
				optional: false,
			},
		],
		permissions: {
			publishRoles: ["Admin"],
			installDevRoles: ["Admin", "ProjectController"],
			installTestRoles: ["Admin", "ProjectController"],
			installProdRoles: ["Admin"],
			upgradeRoles: ["Admin", "ProjectController"],
			rollbackRoles: ["Admin"],
			uninstallRoles: ["Admin"],
			bindResourceRoles: ["Admin", "ProjectController"],
			scopeViewerRoles: ["Admin", "ProjectController", "ProjectEngineer"],
		},
		evidence: {
			sourceEnvelopeRefs: [
				"products/wirepas-nms/source/wirepas-nms-rest.source-package.json",
				"products/wirepas-nms/source/wirepas-nms-rest.source-registry.json",
				"decisions/ADR-044-device-and-reality-capture-source-platform.md",
			],
			readModelRefs: [
				"products/wirepas-nms/ontology/wirepas-nms.yaml",
				"decisions/ADR-044-device-and-reality-capture-source-platform.md",
			],
			permissionRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresOpenFgaProjectionBuilder.cs",
				"decisions/ADR-039-wc3-authorization-source-of-truth.md",
			],
			osdkRefs: [
				"products/wirepas-nms/source/wirepas-nms-rest.source-package.json",
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Data/SourceOnboardingPackageInstallService.cs",
				"src/platform/product-control/Wc3.Platform.Applications/Models/Osdk/OsdkApplication.cs",
			],
			appRouteRefs: [],
			rollbackRefs: [
				"src/platform/infrastructure/Wc3.Platform.Storage.Postgres/Adapters/PostgresProductMarketplaceService.cs",
				"src/platform/product-control/Wc3.Platform.Products/Models/Marketplace/Product.cs",
			],
			realDataRefs: [
				"foundry://wnms/rest-source/ri.magritte..source.be1e8c64-85b6-4020-a409-757521522b4b",
				"foundry://wnms/build/ri.foundry.main.build.48a6e60c-013e-43dc-900f-925b8ac4a732",
				"foundry://wnms/dataset/wirepas_nms_networks_live/ri.foundry.main.dataset.3be92adb-0a36-4cbb-814f-39b71409d645",
				"foundry://wnms/dataset/wirepas_nms_gateways_live/ri.foundry.main.dataset.b7d37225-5d69-492f-81e0-de587babb6bb",
				"foundry://wnms/dataset/wirepas_nms_nodes_live/ri.foundry.main.dataset.33e1c884-a08f-45f3-a942-08c217f66991",
			],
			metadataRefs: [],
			lineageRefs: [
				"products/wirepas-nms/ontology/wirepas-nms.yaml",
				"decisions/ADR-044-device-and-reality-capture-source-platform.md",
			],
			lakehouseRefs: [],
		},
		readiness: {
			classification: "validation-only",
			required: [
				"products/wirepas-nms/manifests/01-wirepas-nms-ontology.product.manifest.json",
				"products/wirepas-nms/manifests/02-wirepas-nms-source.product.manifest.json",
				"products/wirepas-nms/source/wirepas-nms-rest.source-package.json",
			],
			blockedReasons: [
				"#696 remains blocked for production-active Wirepas/NMS readiness and must not be inferred from validation-only evidence.",
				"#696 blocks production-active readiness until real source data, credentials, and project-scoped readback are proven.",
			],
			sourceRefs: [
				"products/wirepas-nms/ontology/wirepas-nms.yaml",
				"products/wirepas-nms/source/wirepas-nms-rest.source-package.json",
			],
			testRefs: ["tests/Wc3.Tests/Product/WirepasNmsProductPackageAuthorityTests.cs"],
		},
		outputs: {
			requiredProjectRoles: ["Owner", "Editor", "Viewer", "Discoverer"],
			sourceBindings: ["wirepas-nms-rest"],
			ontologyObjectTypes: [
				"WirepasNmsDeployment",
				"WirepasProductInstall",
				"WirepasProjectBinding",
				"WirepasNetwork",
				"WirepasGateway",
				"WirepasSink",
				"WirepasNode",
				"WirepasNetworkConfig",
				"WirepasOperation",
				"DeviceIdentity",
			],
			ontologyLinkTypes: [
				"wirepas-project-binding-to-network",
				"wirepas-network-to-gateway",
				"wirepas-network-to-node",
				"wirepas-gateway-to-node",
				"wirepas-gateway-to-sink",
				"wirepas-node-to-device-identity",
			],
			appRoutes: [],
			osdkScopes: ["api:use-ontologies-read"],
			integrationBindings: [
				{
					bindingId: "wirepas-project-network",
					label: "Wirepas project to WNMS network",
					sourceObjectType: "WirepasProjectBinding",
					targetObjectType: "WirepasNetwork",
					linkType: "wirepas-project-binding-to-network",
					classification: "manifest-declared-source-package-binding",
					sourceProperties: {
						wirepas_project_binding_id: "$sourceObjectId",
						project_id: "$projectId",
						nms_deployment_id: "wirepas-nms-rest",
						source_network_uuid: "$targetObjectId",
						assignment_status: "active",
						assigned_at: "$appliedAt",
						active: true,
					},
					targetProperties: {
						project_id: "$projectId",
						nms_deployment_id: "wirepas-nms-rest",
						source_network_uuid: "$targetObjectId",
						name: "$targetObjectId",
						status: "project-bound",
					},
					linkProperties: {
						active: true,
						project_id: "$projectId",
						binding_id: "$bindingId",
					},
				},
			],
			sourcePackages: ["wirepas-nms-rest"],
			ontology: {
				objectTypes: [
					"WirepasNmsDeployment",
					"WirepasProductInstall",
					"WirepasProjectBinding",
					"WirepasNetwork",
					"WirepasGateway",
					"WirepasSink",
					"WirepasNode",
					"WirepasNetworkConfig",
					"WirepasOperation",
					"DeviceIdentity",
				],
				linkTypes: [
					"wirepas-project-binding-to-network",
					"wirepas-network-to-gateway",
					"wirepas-network-to-node",
					"wirepas-gateway-to-node",
					"wirepas-gateway-to-sink",
					"wirepas-node-to-device-identity",
				],
				actionTypes: [],
				functionTypes: [],
				valueTypes: [],
				structTypes: [],
				sharedProperties: [],
				interfaces: [],
			},
			filesystemResources: [],
			metadata: {
				searchableRefs: [],
				provenanceRefs: [
					"products/wirepas-nms/source/wirepas-nms-rest.source-package.json",
					"products/wirepas-nms/source/wirepas-nms-rest.source-registry.json",
					"decisions/ADR-044-device-and-reality-capture-source-platform.md",
				],
				impactIndexRefs: [],
				readinessRefs: [
					"foundry://wnms/build/ri.foundry.main.build.48a6e60c-013e-43dc-900f-925b8ac4a732",
					"foundry://wnms/dataset/wirepas_nms_gateways_live/ri.foundry.main.dataset.b7d37225-5d69-492f-81e0-de587babb6bb",
					"foundry://wnms/dataset/wirepas_nms_networks_live/ri.foundry.main.dataset.3be92adb-0a36-4cbb-814f-39b71409d645",
					"foundry://wnms/dataset/wirepas_nms_nodes_live/ri.foundry.main.dataset.33e1c884-a08f-45f3-a942-08c217f66991",
					"foundry://wnms/rest-source/ri.magritte..source.be1e8c64-85b6-4020-a409-757521522b4b",
					"tests/Wc3.Tests/Product/WirepasNmsProductPackageAuthorityTests.cs",
				],
			},
			lineage: {
				operationalEventRefs: [],
				readbackRefs: [
					"products/wirepas-nms/ontology/wirepas-nms.yaml",
					"decisions/ADR-044-device-and-reality-capture-source-platform.md",
				],
			},
			lakehouse: {
				tableRefs: [],
				projectionReceiptRefs: [],
				readbackRefs: [],
			},
		},
		_manifestRef: "products/wirepas-nms/manifests/03-wirepas-nms.product.manifest.json",
	},
];

/** Install environments, paired with the permission key that gates installing into them. */
export const WC3_PRODUCT_ENVS: {env: string; gateKey: Wc3ProductPermissionKey}[] = [
	{env: "Dev", gateKey: "installDevRoles"},
	{env: "Test", gateKey: "installTestRoles"},
	{env: "Prod", gateKey: "installProdRoles"},
];

/**
 * Bridge from the ontology user groups a persona belongs to, to the WC3 platform roles product
 * manifests declare in {@link Wc3ProductPermissions}. Verbatim from the prototype's
 * GROUP_TO_PLATFORM_ROLES.
 */
export const WC3_GROUP_TO_PLATFORM_ROLES: Record<string, string[]> = {
	"Ontology Admins": ["Admin", "Owner", "Editor", "Viewer", "Discoverer"],
	Schedulers: ["ProjectController", "Editor", "Viewer", "Discoverer"],
	"Site Engineers": ["ProjectEngineer", "Editor", "Viewer", "Discoverer"],
	"Safety Team": ["ProjectEngineer", "Viewer", "Discoverer"],
	Viewers: ["Viewer", "Discoverer"],
};

/* ---------------------------------------------------------------- helpers */

const PRODUCT_BY_KEY = new Map(WC3_PRODUCTS.map((p) => [p.productKey, p]));

/** One product by key, or undefined for an unknown key (the detail route's 404 path). */
export const getProduct = (key: string): Wc3Product | undefined => PRODUCT_BY_KEY.get(key);

/** Every install of a product, applied or not, in fixture order. */
export const installsOf = (key: string): Wc3Install[] => WC3_INSTALLS.filter((i) => i.productKey === key);

/** The applied install of a product, if the workspace currently has one. */
export const activeInstall = (key: string): Wc3Install | undefined =>
	WC3_INSTALLS.find((i) => i.productKey === key && i.status === "applied");

/** Whether a product has an applied install — drives the Installed/Available state everywhere. */
export const isProductInstalled = (key: string): boolean => activeInstall(key) !== undefined;

/** The one-line "N object types · N link types · …" summary the card and detail header render. */
export function productOutputSummary(p: Wc3Product): string {
	const o = p.outputs;
	return [
		`${o.ontologyObjectTypes.length} object types`,
		`${o.ontologyLinkTypes.length} link types`,
		`${o.ontology.actionTypes.length} actions`,
		`${o.osdkScopes.length} OSDK scope${o.osdkScopes.length === 1 ? "" : "s"}`,
		`${o.appRoutes.length} app route${o.appRoutes.length === 1 ? "" : "s"}`,
	].join(" · ");
}

/** Total evidence refs across every evidence category of a product. */
export function evidenceTotal(p: Wc3Product): number {
	return Object.values(p.evidence).reduce((a, refs) => a + (refs?.length ?? 0), 0);
}
