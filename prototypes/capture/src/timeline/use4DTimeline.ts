// The 4D playback engine: loads the schedule, resolves its IFC GUIDs to model geometry once the
// viewer is ready, runs the day clock (play/pause/seek/speed), and repaints the scene as days
// advance so the building assembles itself. Returns {state, controls} for the presentational
// TimelineOverlay. All BIM work is delegated to scene-painter.ts.

import type {ObjectState, Schedule, TimelineControls, TimelineState} from "./types";

import {useFragmentViewer} from "@corensystem/coren-ui/fragment-viewer";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";

import {paintDay, resolveScene, restoreScene, type ResolvedScene} from "./scene-painter";
import {tradeForActivity} from "./trades";
import {dayToDate, objectStateAt} from "./types";
import {VILLA_SCHEDULE} from "./villa-schedule";

const DEFAULT_SPEED = 7; // days per second

export function use4DTimeline(enabled: boolean): {state: TimelineState; controls: TimelineControls} {
	const {state: viewer, api} = useFragmentViewer();

	// The real villa schedule is bundled (no fetch): it's the single source, adapted from the P6 export.
	const [schedule] = useState<Schedule | null>(VILLA_SCHEDULE);
	const [error] = useState<string | null>(null);
	const [resolved, setResolved] = useState(false);
	// objectId → number of IFC elements whose GUIDs actually resolved to model geometry. Progress is
	// measured against these (not the nominal schedule counts) so an object whose GUIDs fail to resolve
	// — and therefore never hides or builds on screen — can't silently inflate the percentage.
	const [resolvedCounts, setResolvedCounts] = useState<Map<string, number> | null>(null);
	const [currentDay, setCurrentDay] = useState(0);
	const [playing, setPlaying] = useState(false);
	const [speed, setSpeed] = useState(DEFAULT_SPEED);
	const [autoRotate, setAutoRotate] = useState(true);
	const autoRotateRef = useRef(autoRotate);
	autoRotateRef.current = autoRotate;

	const sceneRef = useRef<ResolvedScene | null>(null);
	const stateMapRef = useRef<Map<string, ObjectState>>(new Map());
	const paintingRef = useRef(false);
	const wantDayRef = useRef(0);
	const lastPaintedRef = useRef(-1);
	const currentDayRef = useRef(0);
	currentDayRef.current = currentDay;

	const totalDays = schedule?.meta.totalDays ?? 0;

	// Coalesced, non-overlapping paint of a target day (handles rapid seeks/playback).
	const doPaint = useCallback(
		async (day: number) => {
			const components = api.viewport()?.components;
			const scene = sceneRef.current;
			if (!components || !scene || !schedule) return;
			wantDayRef.current = day;
			if (paintingRef.current) return;
			paintingRef.current = true;
			try {
				let rounded = Math.round(wantDayRef.current);
				for (;;) {
					stateMapRef.current = await paintDay(components, scene, schedule.objects, rounded, stateMapRef.current);
					const latest = Math.round(wantDayRef.current);
					if (latest === rounded) break;
					rounded = latest;
				}
			} finally {
				paintingRef.current = false;
			}
		},
		[api, schedule],
	);

	// Resolve geometry when the viewer is ready + timeline enabled; (re)paint the current day.
	useEffect(() => {
		if (!enabled || !schedule || viewer.status !== "ready") return;
		const components = api.viewport()?.components;
		if (!components) return;
		let cancelled = false;
		const ensure = async () => {
			if (!sceneRef.current) {
				const sc = await resolveScene(components, schedule.objects);
				if (cancelled || !sc) return;
				sceneRef.current = sc;
				const counts = new Map<string, number>();
				for (const [id, ids] of sc.byObject) counts.set(id, ids.length);
				setResolvedCounts(counts);
				const got = sc.allWorked.length;
				if (got !== schedule.meta.elementCount) {
					console.warn(`[4D] resolved ${got}/${schedule.meta.elementCount} IFC elements from the model.`);
				}
			}
			if (cancelled) return;
			stateMapRef.current = new Map(); // repaint from scratch
			lastPaintedRef.current = Math.round(currentDayRef.current);
			setResolved(true);
			await doPaint(currentDayRef.current);
		};
		void ensure();
		return () => {
			cancelled = true;
		};
	}, [enabled, schedule, viewer.status, api, doPaint]);

	// Restore the normal model whenever the timeline is switched off (and on unmount).
	useEffect(() => {
		if (enabled) return;
		const components = api.viewport()?.components;
		if (components && sceneRef.current) {
			stateMapRef.current = new Map();
			void restoreScene(components, sceneRef.current);
		}
	}, [enabled, api]);
	useEffect(
		() => () => {
			const components = api.viewport()?.components;
			if (components) void restoreScene(components, sceneRef.current);
		},
		[api],
	);

	// Repaint whenever the rounded day changes.
	useEffect(() => {
		if (!enabled || !resolved) return;
		const r = Math.round(currentDay);
		if (r === lastPaintedRef.current) return;
		lastPaintedRef.current = r;
		void doPaint(currentDay);
	}, [currentDay, enabled, resolved, doPaint]);

	// The day clock. While playing (and only while playing — never while scrubbing), the camera
	// orbits so that a full 0→totalDays playback sweeps exactly TOTAL_ROTATION_DEG. Rotation is
	// proportional to the day actually advanced each frame, so it's framerate- and speed-independent.
	useEffect(() => {
		if (!playing || !enabled || totalDays === 0) return;
		const TOTAL_ROTATION_RAD = (90 * Math.PI) / 180;
		let raf = 0;
		let last = performance.now();
		const tick = (t: number) => {
			const dt = (t - last) / 1000;
			last = t;
			const prev = currentDayRef.current;
			const nd = Math.min(prev + speed * dt, totalDays);
			const advanced = nd - prev;
			if (advanced > 0 && autoRotateRef.current) {
				const controls = api.viewport()?.world.camera.controls;
				controls?.rotate(TOTAL_ROTATION_RAD * (advanced / totalDays), 0, false);
			}
			currentDayRef.current = nd;
			setCurrentDay(nd);
			if (nd >= totalDays) {
				setPlaying(false);
				return;
			}
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [playing, speed, enabled, totalDays, api]);

	const controls = useMemo<TimelineControls>(() => {
		const clamp = (d: number) => Math.min(Math.max(d, 0), totalDays);
		return {
			play: () => setPlaying(true),
			pause: () => setPlaying(false),
			toggle: () => setPlaying((p) => !p),
			seek: (day) => {
				setPlaying(false); // grabbing the scrubber pauses playback so the clock can't fight the drag
				setCurrentDay(clamp(day));
			},
			stepDays: (delta) => {
				setPlaying(false);
				setCurrentDay((d) => clamp(d + delta));
			},
			setSpeed: (s) => setSpeed(s),
			reset: () => {
				setPlaying(false);
				setCurrentDay(0);
			},
			jumpToEnd: () => {
				setPlaying(false);
				setCurrentDay(totalDays);
			},
			setAutoRotate: (on) => setAutoRotate(on),
			toggleAutoRotate: () => setAutoRotate((r) => !r),
		};
	}, [totalDays]);

	const derived = useMemo(() => {
		if (!schedule) {
			return {
				progress: 0,
				builtElements: 0,
				totalElements: 0,
				activeObjects: [] as TimelineState["activeObjects"],
				activeTasks: [] as TimelineState["activeTasks"],
				activePhases: [] as string[],
				activeTrades: [] as string[],
				lastMilestone: null,
				nextMilestone: null,
				floors: [] as TimelineState["floors"],
			};
		}
		const round = Math.round(currentDay);
		// Count against resolved geometry once available, else the nominal schedule total.
		const totalElements = resolvedCounts
			? [...resolvedCounts.values()].reduce((a, b) => a + b, 0)
			: schedule.meta.elementCount;
		let builtElements = 0;
		const activeObjects = schedule.objects.filter((o) => {
			const st = objectStateAt(o, round);
			if (st === "built" && o.count > 0) builtElements += resolvedCounts?.get(o.id) ?? o.count;
			return st === "active";
		});
		const activeTasks = schedule.tasks.filter((t) => t.startDay <= round && round < t.startDay + t.duration);
		const activePhases = [...new Set(activeObjects.map((o) => o.phase))];
		const activeTrades = [...new Set(activeObjects.map((o) => tradeForActivity(o.activity).key))];

		// Per-floor progress: aggregate geometry objects by storey. Built objects count fully; objects
		// under construction contribute their time-fraction so each floor bar climbs smoothly.
		const fmap = new Map<
			string,
			{elevation: number; total: number; built: number; weighted: number; active: number; trades: Set<string>}
		>();
		for (const o of schedule.objects) {
			if (o.storey === "Site") continue; // site-wide prelims/commissioning, not a floor
			const st = objectStateAt(o, round);
			const f =
				fmap.get(o.storey) ??
				{elevation: o.elevation, total: 0, built: 0, weighted: 0, active: 0, trades: new Set<string>()};
			if (o.count > 0) {
				const cnt = resolvedCounts?.get(o.id) ?? o.count;
				f.total += cnt;
				if (st === "built") {
					f.built += cnt;
					f.weighted += cnt;
				} else if (st === "active") {
					const span = Math.max(o.endDay - o.startDay, 1);
					const frac = Math.min(Math.max((currentDay - o.startDay) / span, 0), 1);
					f.weighted += cnt * frac;
					f.active += 1;
					f.trades.add(tradeForActivity(o.activity).key);
				}
			} else if (st === "active") {
				// no-geometry work on a real floor (car-park MEP / deck coating) — show its trade dot
				f.trades.add(tradeForActivity(o.activity).key);
			}
			fmap.set(o.storey, f);
		}
		const floors = [...fmap.entries()]
			.map(([storey, f]) => {
				const progress = f.total ? f.weighted / f.total : 0;
				const state: "pending" | "active" | "built" =
					progress >= 0.999 ? "built" : f.built > 0 || f.active > 0 ? "active" : "pending";
				return {
					storey,
					elevation: f.elevation,
					totalElements: f.total,
					builtElements: f.built,
					progress,
					state,
					activeObjectCount: f.active,
					activeTrades: [...f.trades],
				};
			})
			.sort((a, b) => b.elevation - a.elevation); // top floor first

		const passed = schedule.milestones.filter((m) => m.day <= round);
		const upcoming = schedule.milestones.filter((m) => m.day > round);
		return {
			progress: totalElements ? builtElements / totalElements : 0,
			builtElements,
			totalElements,
			activeObjects,
			activeTasks,
			activePhases,
			activeTrades,
			lastMilestone: passed.length ? passed[passed.length - 1] : null,
			nextMilestone: upcoming.length ? upcoming[0] : null,
			floors,
		};
	}, [schedule, currentDay, resolvedCounts]);

	const state: TimelineState = {
		ready: resolved,
		loading: !!schedule && !resolved && enabled,
		error,
		schedule,
		currentDay,
		totalDays,
		currentDate: schedule ? dayToDate(schedule.meta.projectStart, currentDay) : "2026-01-01",
		playing,
		speed,
		autoRotate,
		...derived,
	};

	return {state, controls};
}
