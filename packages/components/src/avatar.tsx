import * as AvatarPrimitive from "@radix-ui/react-avatar";
import {cn} from "@wakecap/core-utils";
import * as React from "react";

/** An image element with a fallback for representing the user. */
const Avatar = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({className, ...props}, ref) => (
	<AvatarPrimitive.Root
		ref={ref}
		className={cn(
			"wwc:relative wwc:flex wwc:h-10 wwc:w-10 wwc:shrink-0 wwc:overflow-hidden wwc:rounded-full",
			className,
		)}
		{...props}
	/>
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Image>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({className, ...props}, ref) => (
	<AvatarPrimitive.Image ref={ref} className={cn("wwc:aspect-square wwc:h-full wwc:w-full", className)} {...props} />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Fallback>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({className, ...props}, ref) => (
	<AvatarPrimitive.Fallback
		ref={ref}
		className={cn(
			"wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-muted",
			className,
		)}
		{...props}
	/>
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export {Avatar, AvatarImage, AvatarFallback};
