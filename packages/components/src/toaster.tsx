import {Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport} from "./toast";
import {useToast} from "./use-toast";

/** Toast notification system powered by Sonner. */
export function Toaster() {
	const {toasts} = useToast();

	return (
		<ToastProvider>
			{toasts.map(({id, title, description, action, ...props}) => (
				<Toast key={id} {...props}>
					<div className="wwc:grid wwc:gap-1">
						{title && <ToastTitle>{title}</ToastTitle>}
						{description && <ToastDescription>{description}</ToastDescription>}
					</div>
					{action}
					<ToastClose />
				</Toast>
			))}
			<ToastViewport />
		</ToastProvider>
	);
}
