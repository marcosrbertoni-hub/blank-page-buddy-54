
import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  Factory,
  Home,
  Landmark,
  Pause,
  Play,
  RotateCcw,
  Save,
  Trash2,
  Trees,
  Droplets,
  Sun,
  Moon,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CityScene,
  CITY_H,
  CITY_W,
  TOOL_COST,
  cityLabel,
  createInitialCity,
  type CityTile,
  type Kind,
} from "../components/CityScene";

const BUILD_TOOLS: Array<{ kind: Exclude<Kind, "empty">; icon: ReactNode }> = [
  { kind: "road", icon: <Landmark size={18} /> },
  { kind: "residential", icon: <Home size={18} /> },
  { kind: "commercial", icon: <Building2 size={18} /> },
  { kind: "industrial", icon: <Factory size={18} /> },
  { kind: "park", icon: <Trees size={18} /> },
  { kind: "power", icon: <Sun size={18} /> },
  { kind: "water", icon: <Droplets size={18} /> },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Egregoria Web — 3D City Builder" },
      {
        name: "description",
        content: "City builder 3D inspirado em grandes simuladores urbanos, rodando no navegador.",
      },
    ],
  }),
  component: CityGame,
});

function CityGame() {
  const [map, setMap] = useState<CityTile[]>(createInitialCity);
  const [tool, setTool] = useState<Kind>("residential");
  const [money, setMoney] = useState(125000);
  const [happiness, setHappiness] = useState(78);
  const [month, setMonth] = useState(1);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [night, setNight] = useState(false);
  const [notice, setNotice] = useState("Sua cidade está pronta para crescer.");

  const stats = useMemo(() => {
    const count = (kind: Kind) => map.filter((tile) => tile.kind === kind).length;
    const population = map.reduce((sum, tile) => sum + tile.people, 0);
    return {
      roads: count("road"),
      residential: count("residential"),
      commercial: count("commercial"),
      industrial: count("industrial"),
      parks: count("park"),
      power: count("power"),
      water: count("water"),
      population,
      jobs: count("commercial") * 16 + count("industrial") * 22,
    };
  }, [map]);

  useEffect(() => {
    if (paused) return;

    const timer = window.setInterval(() => {
      setMonth((value) => value + 1);
      setMap((current) => {
        const next = current.map((tile) => ({ ...tile }));
        let gained = 0;

        next.forEach((tile, index) => {
          if (tile.kind !== "residential") return;

          const x = index % CITY_W;
          const y = Math.floor(index / CITY_W);
          const roadNearby = [
            [x - 1, y],
            [x + 1, y],
            [x, y - 1],
            [x, y + 1],
          ].some(
            ([nx, ny]) =>
              nx >= 0 &&
              nx < CITY_W &&
              ny >= 0 &&
              ny < CITY_H &&
              next[ny * CITY_W + nx]?.kind === "road",
          );

          if (roadNearby && stats.jobs > 0 && tile.people < 180) {
            const growth = Math.min(12, 2 + Math.floor(tile.level * 1.5));
            tile.people += growth;
            tile.level = Math.min(6, tile.level + (tile.people > tile.level * 55 ? 1 : 0));
            gained += growth;
          }
        });

        if (gained > 0) {
          setNotice("A cidade cresceu +" + gained + " habitantes neste mês.");
        }

        const revenue =
          stats.commercial * 48 +
          stats.industrial * 62 +
          stats.residential * 12;
        const upkeep =
          stats.roads * 3 +
          stats.parks * 7 +
          stats.power * 28 +
          stats.water * 18;

        setMoney((value) => Math.max(0, value + revenue - upkeep));
        setHappiness((value) =>
          Math.max(
            25,
            Math.min(
              98,
              Math.round(
                value * 0.86 +
                  (58 + stats.parks * 2.4 + stats.water * 1.2 - stats.industrial * 0.12) * 0.14,
              ),
            ),
          ),
        );

        return next;
      });
    }, 4500 / speed);

    return () => window.clearInterval(timer);
  }, [paused, speed, stats]);

  const onTileClick = (index: number) => {
    const current = map[index];
    if (!current) return;

    if (tool === "empty") return;

    if (current.kind !== "empty") {
      setSelected(index);
      setNotice(cityLabel[current.kind] + " selecionado. Use Demolir para remover.");
      return;
    }

    const cost = TOOL_COST[tool];
    if (!cost) return;

    if (money < cost) {
      setNotice("Orçamento insuficiente para essa construção.");
      return;
    }

    setMoney((value) => value - cost);
    setMap((currentMap) =>
      currentMap.map((tile, i) =>
        i === index ? { kind: tool, level: 1, people: 0 } : tile,
      ),
    );
    setSelected(index);
    setNotice(cityLabel[tool] + " construído.");
  };

  const demolish = () => {
    if (selected === null) {
      setNotice("Selecione uma construção primeiro.");
      return;
    }

    const current = map[selected];
    if (!current || current.kind === "empty") return;

    const refund =
      current.kind === "water"
        ? 0
        : Math.floor((TOOL_COST[current.kind] ?? 0) * 0.25);

    setMap((currentMap) =>
      currentMap.map((tile, i) =>
        i === selected ? { kind: "empty", level: 0, people: 0 } : tile,
      ),
    );
    setMoney((value) => value + refund);
    setNotice(
      cityLabel[current.kind] +
        " demolido. Reembolso: $" +
        refund.toLocaleString("pt-BR") +
        ".",
    );
    setSelected(null);
  };

  const reset = () => {
    setMap(createInitialCity());
    setMoney(125000);
    setHappiness(78);
    setMonth(1);
    setSelected(null);
    setPaused(false);
    setNotice("Nova cidade criada.");
  };

  const saveCity = () => {
    localStorage.setItem(
      "egregoria-web-city-v2",
      JSON.stringify({ map, money, happiness, month }),
    );
    setNotice("Cidade salva neste navegador.");
  };

  const loadCity = () => {
    const raw = localStorage.getItem("egregoria-web-city-v2");
    if (!raw) {
      setNotice("Nenhuma cidade salva encontrada.");
      return;
    }

    try {
      const saved = JSON.parse(raw) as {
        map: CityTile[];
        money: number;
        happiness: number;
        month: number;
      };
      if (!Array.isArray(saved.map) || saved.map.length !== CITY_W * CITY_H) {
        throw new Error("save inválido");
      }
      setMap(saved.map);
      setMoney(saved.money);
      setHappiness(saved.happiness);
      setMonth(saved.month);
      setNotice("Cidade carregada.");
    } catch {
      setNotice("O salvamento está inválido.");
    }
  };

  return (
    <main className="skyline-game">
      <header className="skyline-topbar">
        <div className="skyline-brand">
          <div className="skyline-logo">🏙️</div>
          <div>
            <strong>EGREGORIA</strong>
            <span>3D CITY SIMULATOR</span>
          </div>
        </div>

        <div className="skyline-stats">
          <Stat label="ORÇAMENTO" value={"$" + money.toLocaleString("pt-BR")} />
          <Stat label="POPULAÇÃO" value={stats.population.toLocaleString("pt-BR")} />
          <Stat label="FELICIDADE" value={happiness + "%"} />
          <Stat label="EMPREGOS" value={stats.jobs.toLocaleString("pt-BR")} />
          <Stat label="MÊS" value={String(month)} />
        </div>

        <div className="skyline-actions">
          <button className={night ? "top-action active" : "top-action"} onClick={() => setNight((value) => !value)} title="Dia/noite">
            {night ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <button className="top-action" onClick={saveCity} title="Salvar">
            <Save size={17} />
          </button>
          <button className="top-action" onClick={loadCity} title="Carregar">
            <RotateCcw size={17} />
          </button>
          <button className="top-action" onClick={() => setPaused((value) => !value)} title="Pausar">
            {paused ? <Play size={17} /> : <Pause size={17} />}
          </button>
          <button className="speed-button" onClick={() => setSpeed((value) => (value === 3 ? 1 : value + 1))}>
            x{speed}
          </button>
          <button className="top-action danger" onClick={reset} title="Nova cidade">
            <RotateCcw size={17} />
          </button>
        </div>
      </header>

      <section className="skyline-stage">
        <aside className="skyline-sidebar">
          <div className="panel-title">
            <span>CONSTRUIR</span>
            <small>3D</small>
          </div>

          <div className="tool-list">
            {BUILD_TOOLS.map(({ kind, icon }) => (
              <button
                key={kind}
                className={tool === kind ? "build-tool active" : "build-tool"}
                onClick={() => setTool(kind)}
              >
                <span className="tool-icon">{icon}</span>
                <span className="tool-copy">
                  <b>{cityLabel[kind]}</b>
                  <small>
                    {kind === "road"
                      ? "Infraestrutura"
                      : kind === "park"
                        ? "Qualidade de vida"
                        : "Zona urbana"}
                  </small>
                </span>
                <strong>{"$" + TOOL_COST[kind].toLocaleString("pt-BR")}</strong>
              </button>
            ))}
          </div>

          <button className="demolish-button" onClick={demolish}>
            <Trash2 size={18} />
            <span>Demolir selecionado</span>
          </button>

          <div className="city-overview">
            <div className="panel-title">
              <span>VISÃO DA CIDADE</span>
              <small>{paused ? "PAUSADA" : "AO VIVO"}</small>
            </div>
            <OverviewRow label="Estradas" value={stats.roads} />
            <OverviewRow label="Residencial" value={stats.residential} />
            <OverviewRow label="Comercial" value={stats.commercial} />
            <OverviewRow label="Industrial" value={stats.industrial} />
            <OverviewRow label="Parques" value={stats.parks} />
            <OverviewRow label="Água" value={stats.water} />
            <OverviewRow label="Energia" value={stats.power} />
          </div>

          <div className="city-tip">
            <span className="tip-dot" />
            <p>{notice}</p>
          </div>
        </aside>

        <div className={night ? "skyline-world night" : "skyline-world"}>
          <CityScene
            map={map}
            selected={selected}
            onTileClick={onTileClick}
            paused={paused}
            night={night}
          />

          <div className="scene-hud top-left">
            <span className="live-dot" />
            {paused ? "SIMULAÇÃO PAUSADA" : "SIMULAÇÃO ATIVA"}
          </div>

          <div className="scene-hud bottom-left">
            <span>☝ Clique para construir</span>
            <span>🖱 Arraste para orbitar</span>
            <span>↕ Scroll para zoom</span>
          </div>

          {selected !== null && map[selected] && (
            <div className="selected-card">
              <div>
                <small>ÁREA SELECIONADA</small>
                <strong>{cityLabel[map[selected].kind]}</strong>
              </div>
              <div className="selected-metrics">
                <span>Nível <b>{map[selected].level}</b></span>
                {map[selected].people > 0 && (
                  <span>Habitantes <b>{map[selected].people}</b></span>
                )}
              </div>
              <button onClick={demolish}><Trash2 size={16} /></button>
            </div>
          )}

          <div className="scene-brand">EGREGORIA WEB <span>•</span> 3D</div>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="skyline-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function OverviewRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="overview-row">
      <span>{label}</span>
      <b>{value.toLocaleString("pt-BR")}</b>
    </div>
  );
}
