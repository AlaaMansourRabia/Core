// Fill-time renderer for `data_source_select`: looks up a named mock data source and offers its
// records as a Core Select (or SearchableSelect when the list is long). The stored value is the
// selected record id. Standalone + frozen prop contract so the RJSF widget can wrap it.
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SearchableSelect} from "../../select";
import {dataSourceByKey} from "./dataSources";

export interface DataSourceSelectProps {
	/** The data source key (e.g. "companies"); resolved via dataSourceByKey. */
	source?: string;
	/** The selected record id. */
	value?: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	id?: string;
}

/** Above this many records we switch to the searchable variant. */
const SEARCHABLE_THRESHOLD = 8;

export function DataSourceSelect({source, value, onChange, disabled, id}: DataSourceSelectProps) {
	const dataSource = dataSourceByKey(source);
	const records = dataSource?.records ?? [];

	if (records.length > SEARCHABLE_THRESHOLD) {
		return (
			<SearchableSelect
				options={records.map((r) => ({value: r.id, label: r.label}))}
				value={value}
				onValueChange={onChange}
				disabled={disabled}
				placeholder={dataSource ? `Select ${dataSource.label.toLowerCase()}` : "Select…"}
			/>
		);
	}

	return (
		<Select value={value ?? ""} onValueChange={onChange} disabled={disabled}>
			<SelectTrigger id={id}>
				<SelectValue placeholder={dataSource ? `Select ${dataSource.label.toLowerCase()}` : "Select…"} />
			</SelectTrigger>
			<SelectContent>
				{records.map((record) => (
					<SelectItem key={record.id} value={record.id}>
						{record.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
