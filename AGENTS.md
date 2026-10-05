# Project rules
- Serve the original 3d.city browser bundle locally with its licenses; keep the game engine intact rather than replacing it with a mockup.
- Keep low-cost rendering settings in the active MainGame bundle, including resize handling; CSS canvas scaling alone does not reduce GPU work.
- Load textures before image-derived canvases while allowing independent environment and model requests in parallel; canvas texture assembly shares the texture pool.
- Do not restore destructive predev or prebuild scripts; they can erase the locally integrated game.
- Render scale lives in `public/3dcity/build/MainGame.module.js` as `Math.min(.5,800/Math.max(this.vsize.x,this.vsize.y))`, in two places (renderer init and resize handler). Change both together.
- UI text is localized at runtime by `public/3dcity/pt-BR.js` (`localizeGame()`, called from `public/3dcity/index.html`); add new strings to its `entries` map.
