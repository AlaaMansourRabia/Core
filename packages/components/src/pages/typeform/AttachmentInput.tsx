// Fill-time file picker (prototype). Stores only the selected file NAME — no upload — behind a
// styled Button that proxies a hidden native <input type="file">. Standalone + frozen prop contract
// so the RJSF widget can wrap it.
import {Paperclip, X} from "lucide-react";
import {useRef} from "react";

import {Button} from "../../button";

export interface AttachmentInputProps {
	/** The selected file name, or "" / undefined when nothing is chosen. */
	value?: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	id?: string;
}

export function AttachmentInput({value, onChange, disabled, id}: AttachmentInputProps) {
	const inputRef = useRef<HTMLInputElement | null>(null);

	function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file) onChange(file.name);
	}

	function remove() {
		if (inputRef.current) inputRef.current.value = "";
		onChange("");
	}

	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2">
			<input ref={inputRef} id={id} type="file" className="wwc:hidden" disabled={disabled} onChange={handleSelect} />
			<Button type="button" variant="outline" disabled={disabled} onClick={() => inputRef.current?.click()}>
				<Paperclip />
				Choose file
			</Button>
			{value ? (
				<div className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:rounded-md wwc:border wwc:border-border wwc:bg-muted wwc:px-2.5 wwc:py-1 wwc:text-sm wwc:text-foreground">
					<span className="wwc:max-w-56 wwc:truncate">{value}</span>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						icon
						disabled={disabled}
						aria-label="Remove file"
						onClick={remove}
					>
						<X />
					</Button>
				</div>
			) : (
				<span className="wwc:text-sm wwc:text-muted-foreground">No file chosen</span>
			)}
		</div>
	);
}
