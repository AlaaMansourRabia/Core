# WakeCore team marketplace

The canonical marketplace manifest is `.agents/plugins/marketplace.json`, and its WakeCore plugin
source is `plugins/wakecore`. This is both the repository marketplace layout Codex discovers locally
and the content published by the WakeCore production build.

## Host the marketplace

`scripts/assemble-hub-dist.mjs` copies the manifest and plugin archive into the web output. Deploy the
normal WakeCore Vercel build, then verify these public resources return `200` without redirects or
authentication:

```text
https://core.wakecap.com/.agents/plugins/marketplace.json
https://core.wakecap.com/plugins/wakecore/.codex-plugin/plugin.json
https://core.wakecap.com/plugins/wakecore/.mcp.json
https://core.wakecap.com/plugins/wakecore/skills/wakecore-ui/SKILL.md
```

For another WakeCore host, preserve the same paths so the marketplace URL is:

```text
https://<wakecore-host>/.agents/plugins/marketplace.json
```

The host must serve JSON, Markdown, YAML, and SVG files as static content and must preserve dot-paths
such as `.agents` and `.codex-plugin`. Do not protect the marketplace or plugin archive with browser
session authentication; MCP authentication is configured separately.

## Install in Codex Desktop

Open the plugin directory and add a Git marketplace with these values:

```text
Source: https://github.com/wakecap/Wakecore.git
Git ref: main
Sparse paths:
  .agents/plugins
  plugins/wakecore
```

Select **WakeCore Team Plugins**, install **WakeCore**, restart the desktop app, and begin testing in
a new task. The direct hosted `marketplace.json` URL is a deployment artifact, not a Git source, and
must not be pasted into Codex's **Add plugin marketplace** source field. Workspace policy must allow
GitHub and plugin installation. For a local checkout, use `codex plugin marketplace add .` from the
repository root and then `codex plugin add wakecore@wakecore`.

## Release and rollback

Run the validation commands in the plugin README before deployment. A release changes the plugin
manifest cachebuster/version, commits the plugin and marketplace together, and deploys the standard
WakeCore build. Verify all public URLs above before asking users to refresh and reinstall. Roll back
by redeploying the prior commit; never place secrets in a marketplace release.
