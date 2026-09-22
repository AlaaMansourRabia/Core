import {cn} from "@corensystem/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

const thumbnailVariants = cva(
	"wwc:relative wwc:overflow-hidden wwc:bg-muted wwc:flex wwc:items-center wwc:justify-center",
	{
		variants: {
			size: {
				sm: "wwc:h-16 wwc:w-16",
				md: "wwc:h-24 wwc:w-24",
				lg: "wwc:h-32 wwc:w-32",
				xl: "wwc:h-48 wwc:w-48",
			},
			rounded: {
				none: "wwc:rounded-none",
				sm: "wwc:rounded-sm",
				md: "wwc:rounded-md",
				lg: "wwc:rounded-lg",
				full: "wwc:rounded-full",
			},
		},
		defaultVariants: {
			size: "md",
			rounded: "md",
		},
	},
);

export interface ThumbnailProps
	extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src">, VariantProps<typeof thumbnailVariants> {
	/** Image source URL */
	src?: string;
	/** Fallback content when image fails to load or is not provided */
	fallback?: React.ReactNode;
	/** Alt text for the image */
	alt: string;
}

/** An image preview component with loading and error states. */
const Thumbnail = React.forwardRef<HTMLDivElement, ThumbnailProps>(
	({className, size, rounded, src, fallback, alt, ...props}, ref) => {
		const [error, setError] = React.useState(false);
		const [loading, setLoading] = React.useState(!!src);

		React.useEffect(() => {
			if (src) {
				setLoading(true);
				setError(false);
			}
		}, [src]);

		const handleLoad = () => {
			setLoading(false);
		};

		const handleError = () => {
			setLoading(false);
			setError(true);
		};

		const showFallback = !src || error;

		return (
			<div ref={ref} className={cn(thumbnailVariants({size, rounded, className}))}>
				{!showFallback && (
					<img
						src={src}
						alt={alt}
						onLoad={handleLoad}
						onError={handleError}
						className={cn(
							"wwc:h-full wwc:w-full wwc:object-cover wwc:transition-opacity",
							loading ? "wwc:opacity-0" : "wwc:opacity-100",
						)}
						{...props}
					/>
				)}
				{showFallback && (
					<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:text-muted-foreground">
						{fallback || (
							<svg
								className="wwc:h-1/2 wwc:w-1/2 wwc:opacity-50"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						)}
					</div>
				)}
			</div>
		);
	},
);
Thumbnail.displayName = "Thumbnail";

export {Thumbnail, thumbnailVariants};
