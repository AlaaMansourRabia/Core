import {Toaster as Sonner} from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/** Toast notification system powered by Sonner. */
const Toaster = ({...props}: ToasterProps) => {
	return (
		<Sonner
			className="toaster wwc:group"
			toastOptions={{
				classNames: {
					toast:
						"wwc:group toast wwc:group-[.toaster]:bg-background wwc:group-[.toaster]:text-foreground wwc:group-[.toaster]:border-border wwc:group-[.toaster]:shadow-lg",
					description: "wwc:group-[.toast]:text-muted-foreground",
					actionButton: "wwc:group-[.toast]:bg-primary wwc:group-[.toast]:text-primary-foreground",
					cancelButton: "wwc:group-[.toast]:bg-muted wwc:group-[.toast]:text-muted-foreground",
				},
			}}
			{...props}
		/>
	);
};

export {toast} from "sonner";
export {Toaster};
