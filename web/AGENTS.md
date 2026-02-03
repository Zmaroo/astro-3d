AGENTS.md

Purpose
- Guidance for agentic coding tools working in this repo.
- Prefer reading existing files and matching local patterns before introducing new ones.
- Keep changes minimal, scoped, and consistent with the project style.

Repository Overview
- Framework: Next.js (App Router) with React 19 and TypeScript.
- 3D stack: Three.js, @react-three/fiber, @react-three/drei, postprocessing.
- Styling: Tailwind CSS (utility classes in JSX and globals in CSS).

Project Layout
- src/app: Next.js routes, layouts, and pages.
- src/components: UI and scene components.
- src/components/scene: Three.js scene primitives and effects.
- src/lib: math/ephemeris/time and configuration helpers.
- public: textures and static assets.

Path Aliases
- Use @/* for imports from src (configured in tsconfig.json).
- Prefer aliases for app-level modules over long relative paths.

Commands (npm)
- Dev server: `npm run dev`
- Production build: `npm run build`
- Start production server: `npm run start`
- Lint: `npm run lint`
- Tests: no test runner configured.
- Single test: not applicable until a test runner is added.

If Tests Are Introduced Later
- Add a `test` script in package.json and document it here.
- Include a way to run a single test file or test name.
- Prefer fast local execution (e.g., watch mode or targeted runs).

ESLint and TypeScript
- ESLint config: eslint-config-next core-web-vitals + TypeScript.
- TypeScript is strict: do not introduce implicit any or unsafe casts.
- Do not bypass lint rules unless a file already uses that pattern.

Formatting
- Use double quotes for strings and semicolons for statements.
- Keep JSX readable with line breaks for long props or className lists.
- Indentation varies across files; match the local file style.
- Do not reformat unrelated sections.

Imports
- Order imports: external libraries, then internal alias (@/*), then relative.
- Keep imports grouped and remove unused imports.
- Prefer named imports over default when the library style supports it.
- Use type-only imports when it clarifies intent.

Naming Conventions
- Components, types, and interfaces: PascalCase.
- Variables, functions, hooks: camelCase.
- Constants: UPPER_SNAKE_CASE for exported constants or config keys.
- File names: match existing patterns (e.g., ComponentName.tsx).

TypeScript Usage
- Prefer explicit types for public functions and exported objects.
- Use union types for constrained values (e.g., PlanetName).
- Avoid any; use unknown + narrowing if needed.
- Use interfaces for object shapes that are shared across modules.

React and Next.js
- Client components must include "use client" at the top of the file.
- Follow hooks rules (no conditional hooks, top-level only).
- Keep server/client boundaries clear; do not import client-only code into server files.
- Use Next App Router conventions for pages and layouts.

Tailwind and CSS
- Prefer Tailwind utility classes for component styling.
- Keep className strings readable and consistent with adjacent code.
- For global styles, edit src/app/globals.css conservatively.

Three.js / R3F Conventions
- Scene components are colocated under src/components/scene.
- Use useFrame for per-frame updates and memoize heavy calculations.
- Reuse helper math utilities instead of duplicating logic when feasible.
- Avoid unnecessary allocations inside animation loops.

Error Handling
- Fail fast in hooks and context access (e.g., throw when context is missing).
- Validate assumptions near boundaries (user input, time parsing, config).
- Prefer explicit, descriptive errors over silent failures.

Performance Notes
- Use useMemo and useRef to avoid recalculations and rerenders in hot paths.
- Keep texture loading and 3D assets centralized to avoid repeated loads.

Documentation Updates
- Update this file if you add a test runner or new tooling.
- Keep commands and conventions accurate and concise.

Cursor / Copilot Rules
- No Cursor rules found (.cursor/rules/ or .cursorrules).
- No Copilot instructions found (.github/copilot-instructions.md).
