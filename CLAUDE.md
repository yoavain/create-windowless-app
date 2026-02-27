# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`create-windowless-app` is a CLI scaffolding tool (like `create-react-app`) that generates Windows applications running as background processes with no console window. It bundles Node.js with the app into a single `.exe` using Node SEA (Single Executable Applications) and compiles a C# launcher that hides the console window.

## Commands

### Development
```bash
npm start                   # Run CLI via ts-node
npm run start:help          # Show CLI help
```

### Testing
```bash
npm test                    # Full: eslint + type-check + jest (with coverage)
npm run jest                # Unit + integration tests
npm run jest:unit           # Unit tests only (./test/)
npm run jest:integration    # Integration tests only (./integration_test/)
```

### Linting & Formatting
```bash
npm run eslint              # Lint src/, test/, integration_test/, templates/
npm run eslint:fix          # Auto-fix lint issues
npm run prettier            # Format JSON files and templates
npm run type-check          # TypeScript type checking (no emit)
```

### Building
```bash
npm run build               # Full build: tests + compile + shebang + pack
npm run build:no-test       # Skip tests: compile + shebang + pack
npm run tsc                 # Compile src/ → dist/ (cleans first)
```

## Architecture

The tool has two distinct roles: the **CLI tool itself** (in `src/`) and the **templates it generates** (in `templates/`).

### CLI Source (`src/`)

- **`index.ts`** — Entry point; calls `checkNodeVersion` then `createWindowlessApp`
- **`cliParser.ts`** — Uses Node's built-in `util.parseArgs()`; handles `--interactive`, `--typescript`, `--icon`, `--verbose` flags
- **`createWindowlessApp.ts`** — Main orchestration: validates name → creates dirs → generates `package.json` → copies templates → installs deps → compiles C# launcher
- **`files/fileManager.ts`** — Copies template files to the generated project; selects TypeScript or JavaScript variant
- **`packageJson/packageJsonBuilder.ts`** — Generates `package.json` for the target project with webpack + SEA build scripts
- **`dependencies/dependenciesManager.ts`** — Installs npm packages in generated project
- **`launcherCompiler.ts`** — Invokes MSBuild to compile the C# launcher; checks for MSBuild and signtool in PATH
- **`validation.ts`** — Project name validation using `validate-npm-package-name`

### Templates (`templates/`)

| Directory | Purpose |
|-----------|---------|
| `templates/typescript/` | TypeScript project scaffold (index.ts, webpack.config.ts, tsconfigs, etc.) |
| `templates/javascript/` | JavaScript project scaffold (same structure, .js files) |
| `templates/common/` | Shared files like `sea-config.json` |
| `templates/launcher/` | C# launcher source (`launcher.cs`, `.csproj`, `.ico`) |

### Generated Project Structure

Generated projects include:
- `src/index.ts|js` — App entry with winston logger and Windows notifications (node-notifier)
- `launcher/` — C# launcher that hides the console window
- `resources/bin/` — Compiled `launcher.exe`
- `webpack.config.ts|js` — Bundles Node.js app to single file
- `sea-config.json` — Node SEA config for embedding blob into exe
- `dist/[name].exe` — Final bundled executable
- `dist/[name]-launcher.exe` — Windowless launcher

### Key Design Decisions

- **Node SEA** is used (Node 20+) to bundle Node.js with the app into a single `.exe`
- **Webpack** bundles the app code before SEA injection
- **C# launcher** compiled via MSBuild creates a windowless process that starts the SEA executable
- Both TypeScript and JavaScript project variants are supported
- Windows-only tool (requires MSBuild, signtool for signing)

## Engine Requirements

- Node.js >= 20.0.0
- npm >= 9.0.0
- Windows (MSBuild required for C# launcher compilation)
