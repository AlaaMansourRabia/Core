// Compiles our internal FormSchema (the builder's output) into a JSON Schema + uiSchema for RJSF.
// This is what makes the RJSF preview possible: a form builder naturally produces a JSON Schema, and
// RJSF renders exactly that. Property keys = question ids, so submitted formData is keyed the same
// way the RHF filler keys its values (both feed the shared FillerEnding).
import type {RJSFSchema, UiSchema} from "@rjsf/utils";

import type {FormSchema} from "./model";

export function schemaToJsonSchema(form: FormSchema): {schema: RJSFSchema; uiSchema: UiSchema} {
	const properties: Record<string, RJSFSchema> = {};
	const required: string[] = [];
	const uiSchema: UiSchema = {};

	for (const q of form.questions) {
		const key = q.id;
		const prop: RJSFSchema = {title: q.label};
		if (q.description) prop.description = q.description;
		const ui: Record<string, unknown> = {};

		switch (q.type) {
			case "short_text":
				prop.type = "string";
				break;
			case "long_text":
				prop.type = "string";
				ui["ui:widget"] = "textarea";
				break;
			case "email":
				prop.type = "string";
				prop.format = "email";
				break;
			case "date":
				prop.type = "string";
				prop.format = "date";
				break;
			case "rating":
				prop.type = "integer";
				prop.minimum = q.min ?? 1;
				prop.maximum = q.max ?? 5;
				// Render with the custom star widget (registered in FillerRJSF) instead of a number input.
				ui["ui:widget"] = "rating";
				break;
			case "multiple_choice": {
				const opts = (q.options ?? []).map((o) => ({const: o.value, title: o.label}));
				if (q.allowMultiple) {
					prop.type = "array";
					prop.uniqueItems = true;
					prop.items = {type: "string", oneOf: opts};
					ui["ui:widget"] = "checkboxes";
				} else {
					prop.type = "string";
					prop.oneOf = opts;
				}
				break;
			}
			// ── Rich types rendered as RJSF custom FIELDS (they own object/opaque values that ajv
			// can't sensibly validate), so they're intentionally left out of `required[]` below. ──
			case "signature":
				prop.type = "string";
				ui["ui:field"] = "signature";
				break;
			case "attachment":
				prop.type = "string";
				ui["ui:field"] = "attachment";
				break;
			case "data_source_select":
				prop.type = "string";
				ui["ui:field"] = "dataSourceSelect";
				ui["ui:options"] = {...(ui["ui:options"] as object), dataSource: q.dataSource};
				break;
			case "derived_count": {
				prop.type = ["number", "null"];
				const countSource = form.questions.find((x) => x.id === q.dependsOn)?.dataSource;
				ui["ui:field"] = "derivedCount";
				ui["ui:options"] = {...(ui["ui:options"] as object), countSource};
				break;
			}
			case "matrix":
				prop.type = "object";
				prop.additionalProperties = true;
				ui["ui:field"] = "matrix";
				ui["ui:options"] = {
					...(ui["ui:options"] as object),
					rows: q.tableRows ?? [],
					columns: q.tableColumns ?? [],
					cellType: q.cellType,
				};
				break;
			case "gas_test_table":
				prop.type = "object";
				prop.additionalProperties = true;
				ui["ui:field"] = "gasTable";
				ui["ui:options"] = {
					...(ui["ui:options"] as object),
					rows: q.tableRows ?? [],
					columns: q.tableColumns ?? [],
				};
				break;
		}

		// The six custom-field types are omitted from `required` (ajv can't validate their values).
		const isCustomField =
			q.type === "signature" ||
			q.type === "attachment" ||
			q.type === "data_source_select" ||
			q.type === "derived_count" ||
			q.type === "matrix" ||
			q.type === "gas_test_table";

		if (q.placeholder) ui["ui:placeholder"] = q.placeholder;
		if (Object.keys(ui).length > 0) uiSchema[key] = ui;
		properties[key] = prop;
		if (q.required && !isCustomField) required.push(key);
	}

	const schema: RJSFSchema = {type: "object", properties};
	if (required.length > 0) schema.required = required;
	// Preserve the authored order.
	uiSchema["ui:order"] = form.questions.map((q) => q.id);

	return {schema, uiSchema};
}
