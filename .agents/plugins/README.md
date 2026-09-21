# Core team marketplace

The canonical marketplace manifest is `.agents/plugins/marketplace.json`, and its Core plugin
source is `plugins/core`. This is both the repository marketplace layout Codex discovers locally
and the content published by the Core production build.

## Host the marketplace

`scripts/assemble-hub-dist.mjs` copies the manifest and plugin archive into the web output. Deploy the
normal Core Vercel build, then verify these public resources return `200` without redirects or
authentication:

```text
https://core.core.com/.agents/plugins/marketplace.json
https://core.core.com/plugins/core/.codex-plugin/plugin.json
https://core.core.com/plugins/core/.mcp.json
https://core.core.com/plugins/core/skills/core-ui/SKILL.md
```

For another Core host, preserve the same paths so the marketplace URL is:

```text
https://<core-host>/.agents/plugins/marketplace.json
```

The host must serve JSON, Markdown, YAML, and SVG files as static content and must preserve dot-paths
such as `.agents` and `.codex-plugin`. Do not protect the marketplace or plugin archive with browser
session authentication; MCP authentication is configured separately.

## Install in Codex Desktop

Open the plugin directory and add a Git marketplace with these values:

```text
Source: https://github.com/core/Core.git
Git ref: main
Sparse paths:
  .agents/plugins
  plugins/core
```

Select **Core Team Plugins**, install **Core**, restart the desktop app, and begin testing in
a new task. The direct hosted `marketplace.json` URL is a deployment artifact, not a Git source, and
must not be pasted into Codex's **Add plugin marketplace** source field. Workspace policy must allow
GitHub and plugin installation. For a local checkout, use `codex plugin marketplace add .` from the
repository root and then `codex plugin add core@core`.

## Release and rollback

Run the validation commands in the plugin README before deployment. A release changes the plugin
manifest cachebuster/version, commits the plugin and marketplace together, and deploys the standard
Core build. Verify all public URLs above before asking users to refresh and reinstall. Roll back
by redeploying the prior commit; never place secrets in a marketplace release.
