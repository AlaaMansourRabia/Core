import * as React from "react";

/** Safely read a persisted value (private mode / SSR fall back to null). */
function read<T>(key: string, initial: T): T {
	try {
		const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
		return raw != null ? (JSON.parse(raw) as T) : initial;
	} catch {
		return initial;
	}
}

/**
 * `useState` that persists to `localStorage` under `key` — so a value survives a page reload. Use it for
 * UI state a user expects to stick: the open tab, the selected project, theme, sidebar collapse, etc.
 * Falls back to `initial` when storage is unavailable.
 */
export function usePersistentState<T>(key: string, initial: T): [T, (value: T) => void] {
	const [value, setValue] = React.useState<T>(() => read(key, initial));
	const set = React.useCallback(
		(next: T) => {
			setValue(next);
			try {
				window.localStorage.setItem(key, JSON.stringify(next));
			} catch {
				// ignore — storage may be unavailable (private mode / quota)
			}
		},
		[key],
	);
	return [value, set];
}
