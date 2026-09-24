# Core Design System

A comprehensive design system for building consistent, high-quality user interfaces.

## Packages

| Package | Description | Install |
|---------|-------------|---------|
| `@corensystem/coren-tokens` | Design tokens (colors, typography, spacing) | `pnpm add @corensystem/coren-tokens` |
| `@corensystem/coren-utils` | Utility functions | `pnpm add @corensystem/coren-utils` |
| `@corensystem/coren-ui` | React components | `pnpm add @corensystem/coren-ui` |

## Quick Start

```bash
# Install the component library
pnpm add @corensystem/coren-ui

# Import styles in your app
import "@corensystem/coren-ui/styles.css";

# Use components
import { Button } from "@corensystem/coren-ui/button";
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
