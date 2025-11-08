## PBFT Visualizer

Interactive teaching tool for the PBFT (Practical Byzantine Fault Tolerance) protocol phases: Pre‑prepare → Prepare → Commit.

### Features

* Animated SVG messages with Framer Motion.
* Faulty node toggling (marks outgoing non-commit messages as conflicting).
* Automatic phase progression (toggle Auto‑advance).
* Adjustable playback speed and manual stepping.

### Development

```bash
pnpm install # or npm install
pnpm dev     # start Vite dev server
```

### Build

```bash
pnpm build
pnpm preview
```

### Notes

* Speed control now correctly speeds up simulation time (was inverted).
* Step button advances 600ms inclusive of boundary conditions for phase steps.
* Auto‑advance can be disabled for guided demonstrations.
* Timeline inclusion condition fixed (was excluding events when next == atMs).

Educational use only.# pbft-visualizer
