#!/usr/bin/env bash
# Boots the Hub and everything it embeds/links, then you open ONE localhost: http://localhost:4000
#   Hub          → :4000  (the app you open)
#   Studio       → :5001  (embedded)
#   Designer Hub → :5002  (embedded)
#   Storybook    → :6006  (linked from the Storybook page)
#
# Opt-in: WC3=1 also boots the WC3 3D/BIM viewers from the sibling wc3-engineering-viewer clone
# (workspace shell on :5180, embedded; its eight viewers on 5197-5208/5273). They're off by default
# because they're heavy — xeokit and Cesium rebuild their model artifacts on first start.
# Set WC3_DIR to point at that clone if it isn't beside the Wakecore checkout.
# The APS viewer is excluded: it exits immediately without real APS credentials, and its dev:all
# runner tears down every sibling when one child dies. Add WC3_APS=1 once .env.local has them.
#
# Opt-in: TOC=1 boots the upstream That Open reference material from a sibling thatopen/ folder —
# engine_components examples (:5301), engine_ui-components examples (:5302) and the create-bim-app
# starter (:5303). Ports are passed on the command line so the clones stay pristine for `git pull`.
#
# Opt-in: IMG=1 boots the img2threejs viewer (:5401) from the sibling img2threejs-worker Vite app —
# a procedural Three.js model generated from one reference image. Set IMG_DIR to relocate it.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

# Sibling repos usually sit beside the Wakecore checkout; allow one level up too, since some checkouts
# are themselves nested (…/Wakecore/Wakecore). Echoes the first match, or the first candidate as-is.
sibling() {
	for candidate in "$ROOT/../$1" "$ROOT/../../$1"; do
		if [ -d "$candidate" ]; then
			echo "$candidate"
			return
		fi
	done
	echo "$ROOT/../$1"
}

# nvm-aware runner: these repos pin newer Node than Wakecore needs. Never fail the boot over it —
# without nvm the scripts just use whatever node is on PATH.
with_node() {
	local dir="$1"
	shift
	(
		cd "$dir"
		nvm_sh="${NVM_DIR:-$HOME/.nvm}/nvm.sh"
		if [ -s "$nvm_sh" ]; then
			# shellcheck disable=SC1091
			. "$nvm_sh" >/dev/null 2>&1 || true
			nvm use >/dev/null 2>&1 || nvm use 22 >/dev/null 2>&1 || true
		fi
		"$@"
	) &
	pids+=($!)
}

WC3="${WC3:-0}"
WC3_DIR="${WC3_DIR:-$(sibling wc3-engineering-viewer)}"
WC3_SCRIPTS=(dev:guide dev:sdk dev:ifclite dev:xeokit dev:cesium dev:reality dev:configurator dev:shell)
if [ "${WC3_APS:-0}" != "0" ]; then
	WC3_SCRIPTS+=(dev:aps)
fi

TOC="${TOC:-0}"
TOC_DIR="${TOC_DIR:-$(sibling thatopen)}"
# Yarn 3 ships in-repo (.yarn/releases), so there's nothing to install globally.
TOC_YARN=".yarn/releases/yarn-3.2.1.cjs"

IMG="${IMG:-0}"
IMG_DIR="${IMG_DIR:-$(sibling img2threejs-worker)}"

# The 3D stories and Designer Hub use the official WC3 dataset when it is available beside this repo.
# Keep both public/model mounts in sync so a local launch never fails merely because one symlink was
# created for one app but not the other. The unavailable Uptown asset falls back to vd2.frag in code.
DATA_DIR="${DATA_DIR:-$(sibling wc3-example-dataset)}"
DATA_MODELS="$DATA_DIR/processed/models"
if [ -d "$DATA_MODELS" ]; then
	for public_dir in "$ROOT/apps/web/public" "$ROOT/apps/storybook/public"; do
		model_link="$public_dir/models"
		if [ -L "$model_link" ]; then
			ln -sfn "$DATA_MODELS" "$model_link"
		elif [ ! -e "$model_link" ]; then
			ln -s "$DATA_MODELS" "$model_link"
		else
			echo "Keeping existing model directory at $model_link" >&2
		fi
	done
else
	echo "WC3 model dataset not found at $DATA_MODELS; 3D previews will show their model fallback state." >&2
fi

if [ "$WC3" != "0" ] && [ ! -d "$WC3_DIR" ]; then
	echo "WC3=1 but no viewer clone at $WC3_DIR" >&2
	echo "  git clone git@github.com:wakecap/wc3-example-dataset.git" >&2
	echo "  git clone git@github.com:wakecap/wc3-engineering-viewer.git" >&2
	echo "  cd wc3-engineering-viewer && npm ci && npm run data:link -- ../wc3-example-dataset" >&2
	echo "(or set WC3_DIR to an existing clone)" >&2
	exit 1
fi

if [ "$TOC" != "0" ] && [ ! -d "$TOC_DIR/engine_components" ]; then
	echo "TOC=1 but no That Open clones at $TOC_DIR" >&2
	echo "  mkdir thatopen && cd thatopen" >&2
	echo "  git clone https://github.com/ThatOpen/engine_components.git" >&2
	echo "  git clone https://github.com/ThatOpen/engine_ui-components.git" >&2
	echo "  git clone https://github.com/ThatOpen/engine_templates.git" >&2
	echo "(see apps/hub/README.md for the install steps, or set TOC_DIR)" >&2
	exit 1
fi

if [ "$IMG" != "0" ] && [ ! -d "$IMG_DIR" ]; then
	echo "IMG=1 but no img2threejs viewer at $IMG_DIR" >&2
	echo "(generate one with the img2threejs skill, or set IMG_DIR to an existing viewer)" >&2
	exit 1
fi

pids=()
cleanup() {
	echo ""
	echo "Shutting down…"
	for pid in "${pids[@]}"; do
		kill "$pid" 2>/dev/null || true
	done
}
trap cleanup EXIT INT TERM

# Free the ports first so a stale server from an earlier run doesn't cause a collision.
ports=(4000 5001 5002 6006)
if [ "$WC3" != "0" ]; then
	ports+=(5180 5197 5198 5199 5205 5206 5207 5208 5273 8972)
fi
if [ "$TOC" != "0" ]; then
	ports+=(5301 5302 5303)
fi
if [ "$IMG" != "0" ]; then
	ports+=(5401)
fi
for port in "${ports[@]}"; do
	lsof -ti tcp:"$port" 2>/dev/null | xargs kill 2>/dev/null || true
done

echo "Starting Studio (:5001), Designer Hub (:5002), Storybook (:6006), Hub (:4000)…"
pnpm --filter apps-studio dev &      pids+=($!)
pnpm --filter apps-web dev &         pids+=($!)
pnpm --filter apps-storybook dev &   pids+=($!)
pnpm --filter apps-hub dev &         pids+=($!)

if [ "$WC3" != "0" ]; then
	echo "Starting WC3 viewers from $WC3_DIR (shell on :5180)…"
	# Each script is its own child so one viewer failing doesn't take the others down (which is what
	# the repo's own `npm run dev:all` does).
	for script in "${WC3_SCRIPTS[@]}"; do
		with_node "$WC3_DIR" npm run "$script"
	done
fi

if [ "$TOC" != "0" ]; then
	echo "Starting That Open reference from $TOC_DIR (:5301 examples, :5302 UI, :5303 app)…"
	with_node "$TOC_DIR/engine_components" node "$TOC_YARN" dev --port 5301 --strictPort
	with_node "$TOC_DIR/engine_ui-components" node "$TOC_YARN" dev --port 5302 --strictPort
	with_node "$TOC_DIR/bim-app" npx vite --host --port 5303 --strictPort
fi

if [ "$IMG" != "0" ]; then
	echo "Starting img2threejs viewer from $IMG_DIR (:5401)…"
	with_node "$IMG_DIR" npx vite --host --port 5401 --strictPort
fi

echo ""
echo "▸ Open the Hub:  http://localhost:4000"
echo "  (Storybook takes ~20s to compile the first time.)"
if [ "$WC3" != "0" ]; then
	echo "  (WC3 viewers take ~1min the first time — xeokit and Cesium build model artifacts.)"
fi
wait
