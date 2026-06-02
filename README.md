# Run Locally

**Prerequisites:**  Node.js

## Running with Bun
The project is a standard React + Vite + TypeScript app with no Bun-specific configuration, but it's fully compatible with Bun.
Commands
### Install dependencies (use one)
```bash 
bun install
```
or keep npm/pnpm-installed node_modules

### Run scripts (equivalent to npm run)
```bash
bun run dev                    # starts Vite dev server on port 3000
bun run build                  # builds for production
bun run preview                # previews production build
bun run lint                   # runs tsc --noEmit
```
#### Notes
- `bun run dev` is the correct form. bun dev would try to run a file called dev — it won't trigger the dev script in package.json.
- Faster installs: `bun install` is significantly faster than npm/pnpm for this dependency list.
- Compatibility: All dependencies (React 19, Vite 6, Tailwind v4, Express, @google/genai, motion) work fine under Bun's runtime and package manager.
- Vite runtime: `bun run dev` will execute Vite under Node by default. If you want Vite itself to run on Bun's runtime, use `bun --bun run dev` (faster startup, but occasionally hits edge cases with Vite's HMR — usually fine).

#### Recommendation
Start with bun install && bun run dev. If you want maximum speed, try `bun --bun run dev`.
