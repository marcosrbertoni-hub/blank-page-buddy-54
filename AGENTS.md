# Project rules
- Serve the original 3d.city browser bundle locally with its licenses; keep the game engine intact rather than replacing it with a mockup.
- Keep low-cost rendering settings in the active MainGame bundle, including resize handling; CSS canvas scaling alone does not reduce GPU work.
- Load textures before image-derived canvases while allowing independent environment and model requests in parallel; canvas texture assembly shares the texture pool.
- Do not restore destructive predev or prebuild scripts; they can erase the locally integrated game.