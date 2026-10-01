import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Skyline City — 3D City Builder" },
      { name: "description", content: "Skyline City: construa estradas, zoneie e veja sua cidade 3D crescer no navegador." },
      { property: "og:title", content: "Skyline City — 3D City Builder" },
      { property: "og:description", content: "City builder 3D no navegador com tráfego, economia, serviços e prédios procedurais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Game,
});

let booted = false;

function Game() {
  useEffect(() => {
    if (booted) return;
    booted = true;
    // @ts-ignore vanilla JS engine
    import("../fable/main.js").catch((err) => console.error("[skyline] boot failed", err));
  }, []);

  return (
    <>
      <canvas id="game" tabIndex={0} />
      <div id="ui-root" />
      <div id="loading">
        <h1>Skyline City</h1>
        <div className="bar"><i id="loading-bar" /></div>
        <div className="status" id="loading-status">Initialising</div>
      </div>
    </>
  );
}
