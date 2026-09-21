#!/usr/bin/env bash
# WakeCore Studio — one command to launch the third WakeCore product locally.
# Studio IS the WakeCore-guided Open Design: it wires WakeCore into an Open Design instance (MCP +
# skill + templates gallery + branding), starts the WakeCore renderer, and boots the editor. The
# default engine is your local Claude CLI (your own subscription — no Anthropic API key).
#
# Env overrides: OD_DIR (Open Design checkout, default /tmp/open-design), OD_DATA_DIR (runtime state).
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OD_DIR="${OD_DIR:-/tmp/open-design}"
OD_DATA_DIR="${OD_DATA_DIR:-/tmp/od-data}"
RLOG=/tmp/wakecore-studio-renderer.log
OLOG=/tmp/wakecore-studio-od.log

echo "▶ WakeCore Studio — WakeCore-guided Open Design"

command -v claude >/dev/null 2>&1 || echo "⚠ 'claude' CLI not on PATH — Studio's default engine uses your Claude subscription via the CLI."
[ -d "$OD_DIR" ] || { echo "✗ Open Design not found at $OD_DIR (set OD_DIR, or clone github.com/nexu-io/open-design)."; exit 1; }

# 1) wire WakeCore into Open Design (MCP server + skill + templates gallery + od-studio.patch) — idempotent
node "$HERE/plugin/install.mjs" || true

# 2) WakeCore renderer (:8787) — renders every template from its real @wakecap/core-ui component
if curl -sf http://localhost:8787/health >/dev/null 2>&1; then
	echo "✓ renderer already running (:8787)"
else
	( node "$HERE/renderer/serve.mjs" >"$RLOG" 2>&1 & )
	echo "✓ renderer → http://localhost:8787"
fi

# 3) reuse a live Studio if one is already up
url="$(grep -oE 'http://127\.0\.0\.1:[0-9]+' "$OLOG" 2>/dev/null | head -1)"
if [ -n "$url" ] && curl -sf "$url" >/dev/null 2>&1; then
	echo "✓ WakeCore Studio already running → $url"
else
	export OD_DATA_DIR
	# Open Design requires Node ~24; use nvm's copy if present.
	[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh" && nvm use 24 >/dev/null 2>&1
	( cd "$OD_DIR" && OD_DATA_DIR="$OD_DATA_DIR" pnpm tools-dev run web >"$OLOG" 2>&1 & )
	printf "Starting WakeCore Studio"
	for _ in $(seq 1 90); do
		url="$(grep -oE 'http://127\.0\.0\.1:[0-9]+' "$OLOG" 2>/dev/null | head -1)"
		if [ -n "$url" ] && curl -sf "$url" >/dev/null 2>&1; then break; fi
		printf "."; sleep 1
	done
	printf "\n"
	if [ -n "${url:-}" ]; then echo "✓ WakeCore Studio → $url"; else echo "⚠ Studio didn't come up in time — see $OLOG"; exit 1; fi
fi

echo
echo "  Open the URL → choose 'Local coding agent' → type a prompt OR pick a WakeCore template."
echo "  Compare: Storybook (pnpm --filter apps-storybook dev) · Designer Hub (pnpm --filter apps-web dev)"
