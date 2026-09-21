import {Minimize2} from "lucide-react";

import {Button} from "@/components/ui/button";

interface FullscreenExitButtonProps {
	onExit: () => void;
}

export function FullscreenExitButton({onExit}: FullscreenExitButtonProps) {
	return (
		<Button
			variant="outline"
			size="sm"
			className="wwc:fixed wwc:right-3 wwc:top-3 wwc:z-[60] wwc:shadow-md"
			onClick={onExit}
			aria-label="Exit fullscreen"
		>
			<Minimize2 /> Exit
		</Button>
	);
}
