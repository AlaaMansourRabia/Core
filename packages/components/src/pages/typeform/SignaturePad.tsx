import {cn} from "@corensystem/core-utils";
// Fill-time signature capture. An HTML <canvas> drawn on with pointer events (mouse + touch), a
// "Clear" button, and round-tripping through a data-URL string so it can be persisted like any other
// answer. Standalone + frozen prop contract so the RJSF widget can wrap it.
import {Eraser} from "lucide-react";
import {useEffect, useRef, useState} from "react";

import {Button} from "../../button";

export interface SignaturePadProps {
	/** Current signature as a PNG data URL (or undefined for a blank pad). */
	value?: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	id?: string;
}

export function SignaturePad({value, onChange, disabled, id}: SignaturePadProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const drawingRef = useRef(false);
	// The data URL we last emitted — lets us ignore our own value echo when re-hydrating the canvas.
	const lastEmittedRef = useRef<string | undefined>(undefined);
	const [hasInk, setHasInk] = useState<boolean>(Boolean(value));

	// Size the backing store to the element's box exactly once (a canvas's pixel dims are separate
	// from its CSS box), then paint any incoming value.
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		canvas.width = rect.width || 600;
		canvas.height = rect.height || 160;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Re-hydrate the canvas whenever the value changes from the outside (not from our own stroke).
	useEffect(() => {
		if (value === lastEmittedRef.current) return;
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		if (!canvas || !ctx) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		if (value) {
			const img = new Image();
			img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			img.src = value;
			setHasInk(true);
		} else {
			setHasInk(false);
		}
	}, [value]);

	function pointFromEvent(e: React.PointerEvent<HTMLCanvasElement>) {
		const canvas = canvasRef.current!;
		const rect = canvas.getBoundingClientRect();
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;
		return {x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY};
	}

	function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
		if (disabled) return;
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		if (!canvas || !ctx) return;
		drawingRef.current = true;
		canvas.setPointerCapture(e.pointerId);
		const {x, y} = pointFromEvent(e);
		ctx.lineWidth = 2;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		ctx.strokeStyle = "currentColor";
		ctx.beginPath();
		ctx.moveTo(x, y);
	}

	function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
		if (!drawingRef.current || disabled) return;
		const ctx = canvasRef.current?.getContext("2d");
		if (!ctx) return;
		const {x, y} = pointFromEvent(e);
		ctx.lineTo(x, y);
		ctx.stroke();
		setHasInk(true);
	}

	function endStroke() {
		if (!drawingRef.current) return;
		drawingRef.current = false;
		const canvas = canvasRef.current;
		if (!canvas) return;
		const data = canvas.toDataURL();
		lastEmittedRef.current = data;
		onChange(data);
	}

	function clear() {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		if (!canvas || !ctx) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		setHasInk(false);
		lastEmittedRef.current = "";
		onChange("");
	}

	return (
		<div className={cn("wwc:flex wwc:flex-col wwc:gap-2", disabled && "wwc:opacity-60")}>
			<canvas
				id={id}
				ref={canvasRef}
				className={cn(
					"wwc:h-40 wwc:w-full wwc:rounded-md wwc:border wwc:border-border wwc:bg-card wwc:text-foreground wwc:touch-none",
					disabled ? "wwc:cursor-not-allowed" : "wwc:cursor-crosshair",
				)}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={endStroke}
				onPointerLeave={endStroke}
				onPointerCancel={endStroke}
			/>
			<div className="wwc:flex wwc:justify-end">
				<Button type="button" variant="outline" size="sm" disabled={disabled || !hasInk} onClick={clear}>
					<Eraser />
					Clear
				</Button>
			</div>
		</div>
	);
}
