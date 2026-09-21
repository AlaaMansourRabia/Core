#!/usr/bin/env bash
# Remove ONLY the generated flows from the target app — restores its src/ from the flow safe-point.
# Leaves the scenario-forge/ tool and the ~/.claude/skills/scenario-forge skill untouched.
#   bash scenario-forge/restore-flows.sh        (run from the app root, or anywhere — it cd's itself)
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"   # app root (parent of scenario-forge/)
cd "$here"
sp="scenario-forge/.flow-safepoint.tgz"
[ -f "$sp" ] || { echo "No flow safe-point ($sp) — nothing to restore."; exit 1; }
echo "Removing generated flows: restoring src/ from the flow safe-point…"
rm -rf src
tar xzf "$sp"
# also drop the connect-overlay leftovers if any
rm -f src/__scenario_mount__.tsx src/main.tsx.sf-bak 2>/dev/null || true
rm -rf "public/__scenarios__" 2>/dev/null || true
echo "Flows removed. The scenario-forge tool and the skill are untouched — re-run to build new flows."
