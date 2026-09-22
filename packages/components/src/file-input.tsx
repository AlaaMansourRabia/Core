import {cn} from "@core/core-utils";
import {Upload, X} from "lucide-react";
import * as React from "react";

import {Button} from "./button";
import {IconButton} from "./icon-button";

export interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
	/** Callback when files are selected */
	onChange?: (files: File[]) => void;
	/** Show preview of selected files */
	showPreview?: boolean;
	/** Maximum file size in bytes */
	maxSize?: number;
	/** Custom validator function */
	validator?: (file: File) => boolean | string;
}

/** A file upload input with preview and validation. */
const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
	({className, onChange, showPreview = true, maxSize, validator, accept, multiple, ...props}, ref) => {
		const [files, setFiles] = React.useState<File[]>([]);
		const [errors, setErrors] = React.useState<string[]>([]);
		const inputRef = React.useRef<HTMLInputElement>(null);

		const validateFile = (file: File): string | null => {
			if (maxSize && file.size > maxSize) {
				return `File "${file.name}" is too large. Maximum size is ${formatFileSize(maxSize)}.`;
			}

			if (validator) {
				const result = validator(file);
				if (result === false) return `File "${file.name}" is invalid.`;
				if (typeof result === "string") return result;
			}

			return null;
		};

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const selectedFiles = Array.from(e.target.files || []);
			const validFiles: File[] = [];
			const validationErrors: string[] = [];

			selectedFiles.forEach((file) => {
				const error = validateFile(file);
				if (error) {
					validationErrors.push(error);
				} else {
					validFiles.push(file);
				}
			});

			setFiles(validFiles);
			setErrors(validationErrors);
			onChange?.(validFiles);
		};

		const removeFile = (index: number) => {
			const newFiles = files.filter((_, i) => i !== index);
			setFiles(newFiles);
			onChange?.(newFiles);
		};

		const handleClick = () => {
			inputRef.current?.click();
		};

		return (
			<div className={cn("wwc:space-y-2", className)}>
				<input
					ref={(node) => {
						if (typeof ref === "function") {
							ref(node);
						} else if (ref) {
							ref.current = node;
						}
						// @ts-ignore
						inputRef.current = node;
					}}
					type="file"
					className="wwc:hidden"
					onChange={handleChange}
					accept={accept}
					multiple={multiple}
					{...props}
				/>

				<Button type="button" variant="outline" onClick={handleClick} className="wwc:w-full">
					<Upload className="wwc:mr-2 wwc:h-4 wwc:w-4" />
					{files.length > 0
						? `${files.length} file${files.length !== 1 ? "s" : ""} selected`
						: "Choose file" + (multiple ? "s" : "")}
				</Button>

				{showPreview && files.length > 0 && (
					<div className="wwc:space-y-2">
						{files.map((file, index) => (
							<div
								key={index}
								className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2 wwc:p-2 wwc:rounded-md wwc:border wwc:border-border wwc:bg-muted/50"
							>
								<div className="wwc:flex-1 wwc:min-w-0">
									<p className="wwc:text-sm wwc:font-medium wwc:truncate">{file.name}</p>
									<p className="wwc:text-xs wwc:text-muted-foreground">{formatFileSize(file.size)}</p>
								</div>
								<IconButton variant="ghost" size="sm" onClick={() => removeFile(index)} tooltip="Remove file">
									<X />
								</IconButton>
							</div>
						))}
					</div>
				)}

				{errors.length > 0 && (
					<div className="wwc:space-y-1">
						{errors.map((error, index) => (
							<p key={index} className="wwc:text-sm wwc:text-destructive">
								{error}
							</p>
						))}
					</div>
				)}
			</div>
		);
	},
);
FileInput.displayName = "FileInput";

function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export {FileInput};
