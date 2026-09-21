import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";
import * as React from "react";

/** Displays content within a desired aspect ratio. */
const AspectRatio = React.forwardRef<
	React.ElementRef<typeof AspectRatioPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root>
>((props, ref) => <AspectRatioPrimitive.Root ref={ref} {...props} />);
AspectRatio.displayName = "AspectRatio";

export {AspectRatio};
