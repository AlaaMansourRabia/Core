import {cn} from "@wakecap/core-utils";

/** A placeholder animation shown while content is loading. */
function Skeleton({className, ...props}: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn("wwc:animate-pulse wwc:rounded-md wwc:bg-primary/10", className)} {...props} />;
}

export {Skeleton};
