# Core Design System

A comprehensive design system for building consistent, high-quality user interfaces.

## Packages

| Package | Description | Install |
|---------|-------------|---------|
| `@corensystem/core-tokens` | Design tokens (colors, typography, spacing) | `pnpm add @corensystem/core-tokens` |
| `@corensystem/core-utils` | Utility functions | `pnpm add @corensystem/core-utils` |
| `@corensystem/core-ui` | React components | `pnpm add @corensystem/core-ui` |

## Quick Start

```bash
# Install the component library
pnpm add @corensystem/core-ui

# Import styles in your app
import "@corensystem/core-ui/styles.css";

# Use components
import { Button } from "@corensystem/core-ui/button";
```

## Development

```bash
# Install dependencies
pnpm install

# Start Storybook
pnpm storybook

# Run tests
pnpm test

# Build packages
pnpm build
```

## Documentation

- [Storybook](https://6ab0e44f834e7fce57af1b62-dbsdsmfmna.chromatic.com/) - Component documentation and examples

## License

MIT
