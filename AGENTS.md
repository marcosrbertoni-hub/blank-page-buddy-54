# Agents
- The game is the vendored Fable Cities engine (MIT, commit aea8b10) in src/fable, booted client-only from src/routes/index.tsx; keep it vanilla JS and edit in place rather than rewriting in React.
- Game assets live in public/assets and are referenced by absolute /assets paths.
- Never re-add sync/prebuild scripts that overwrite src or public.
