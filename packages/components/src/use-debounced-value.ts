import * as React from "react";

/**
 * `value`, held back until it has stopped changing for `delay` ms. Returns `value` unchanged when
 * `delay` is `0`, so a caller can opt out without branching on the hook.
 *
 * The reason a searchable control needs this: a server-backed option list should not fire a request
 * per keystroke. Debounce the term, fetch on the settled value.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
	const [debounced, setDebounced] = React.useState(value);

	React.useEffect(() => {
		if (delay <= 0) {
			setDebounced(value);
			return;
		}
		const id = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(id);
	}, [value, delay]);

	return delay <= 0 ? value : debounced;
}
