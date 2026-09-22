import * as AvatarPrimitive from "@radix-ui/react-avatar";
import {cn} from "@core/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

const avatarVariants = cva(
	"wwc:relative wwc:flex wwc:shrink-0 wwc:overflow-hidden",
	{
		variants: {
			size: {
				xs: "wwc:h-6 wwc:w-6",
				sm: "wwc:h-8 wwc:w-8",
				md: "wwc:h-10 wwc:w-10",
				lg: "wwc:h-12 wwc:w-12",
				xl: "wwc:h-16 wwc:w-16",
				"2xl": "wwc:h-20 wwc:w-20",
				"3xl": "wwc:h-24 wwc:w-24",
			},
			shape: {
				circle: "wwc:rounded-full",
				square: "wwc:rounded-md",
				rounded: "wwc:rounded-lg",
			},
		},
		defaultVariants: {
			size: "md",
			shape: "circle",
		},
	},
);

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

export interface AvatarProps
	extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
		VariantProps<typeof avatarVariants> {}

/** An image element with a fallback for representing the user. */
const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, AvatarProps>(
	({className, size, shape, ...props}, ref) => (
		<AvatarPrimitive.Root ref={ref} className={cn(avatarVariants({size, shape, className}))} {...props} />
	),
);
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Image>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({className, ...props}, ref) => (
	<AvatarPrimitive.Image ref={ref} className={cn("wwc:aspect-square wwc:h-full wwc:w-full", className)} {...props} />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const avatarFallbackVariants = cva(
	"wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:bg-muted wwc:font-medium wwc:text-muted-foreground",
	{
		variants: {
			size: {
				xs: "wwc:text-[10px]",
				sm: "wwc:text-xs",
				md: "wwc:text-sm",
				lg: "wwc:text-base",
				xl: "wwc:text-lg",
				"2xl": "wwc:text-xl",
				"3xl": "wwc:text-2xl",
			},
		},
		defaultVariants: {
			size: "md",
		},
	},
);

export interface AvatarFallbackProps
	extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>,
		VariantProps<typeof avatarFallbackVariants> {}

const AvatarFallback = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Fallback>, AvatarFallbackProps>(
	({className, size, ...props}, ref) => (
		<AvatarPrimitive.Fallback ref={ref} className={cn(avatarFallbackVariants({size, className}))} {...props} />
	),
);
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Maximum number of avatars to show before +N indicator */
	max?: number;
	/** Total number of items for overflow calculation */
	total?: number;
}

/** A group of overlapping avatars with optional overflow indicator. */
const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
	({className, max, total, children, ...props}, ref) => {
		const childrenArray = React.Children.toArray(children);
		const visibleChildren = max ? childrenArray.slice(0, max) : childrenArray;
		const remainingCount = total ? total - (max || childrenArray.length) : childrenArray.length - (max || 0);
		const showOverflow = max && remainingCount > 0;

		return (
			<div ref={ref} className={cn("wwc:flex wwc:-space-x-3", className)} {...props}>
				{visibleChildren.map((child, index) =>
					React.isValidElement(child)
						? React.cloneElement(child, {
								key: index,
								className: cn("wwc:border-2 wwc:border-background", child.props.className),
						  } as React.Attributes)
						: child,
				)}
				{showOverflow && (
					<Avatar className="wwc:border-2 wwc:border-background">
						<AvatarFallback>+{remainingCount}</AvatarFallback>
					</Avatar>
				)}
			</div>
		);
	},
);
AvatarGroup.displayName = "AvatarGroup";

/** Wrapper that enables status dot positioning on Avatar */
export interface AvatarWithStatusProps extends AvatarProps {
	children: React.ReactNode;
}

const AvatarWithStatus = React.forwardRef<HTMLDivElement, AvatarWithStatusProps>(
	({className, size, shape, children, ...props}, ref) => (
		<div ref={ref} className={cn("wwc:relative wwc:inline-block", className)} {...props}>
			{React.Children.map(children, (child) => {
				if (React.isValidElement(child) && child.type === Avatar) {
					return React.cloneElement(child, {size, shape} as AvatarProps);
				}
				return child;
			})}
		</div>
	),
);
AvatarWithStatus.displayName = "AvatarWithStatus";

export {Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarWithStatus, avatarVariants};
export type {AvatarGroupProps};
