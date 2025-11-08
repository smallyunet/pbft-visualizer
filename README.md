## PBFT Visualizer

Interactive teaching tool for the PBFT (Practical Byzantine Fault Tolerance) protocol phases: Pre‑prepare → Prepare → Commit.

### Features

- Animated SVG messages with Framer Motion.
- Faulty node toggling (marks outgoing non-commit messages as conflicting).
- Automatic phase progression (toggle Auto‑advance).
- Adjustable playback speed and manual stepping.

### Development

```bash
npm install # or npm install
npm dev     # start Vite dev server
```

### Build

```bash
npm build
npm preview
```

### Notes

- Speed control now correctly speeds up simulation time (was inverted).
- Step button advances 600ms inclusive of boundary conditions for phase steps.
- Auto‑advance can be disabled for guided demonstrations.
- Timeline inclusion condition fixed (was excluding events when next == atMs).

Educational use only.# pbft-visualizer

### Performance and architecture

- Store subscriptions now use selective selectors with shallow comparison to avoid unnecessary re‑renders across the app.
- Timeline and logs are pruned in long sessions (30s window, hard caps) to prevent unbounded memory growth during demos.
- App runs under React.StrictMode in development to surface potential side‑effects early.
