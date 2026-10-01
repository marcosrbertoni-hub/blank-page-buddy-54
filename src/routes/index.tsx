import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  Cross,
  Droplets,
  Factory,
  Flame,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Save,
  Shield,
  Sun,
  Trash2,
  Trees,
  Zap,
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
  type TaxRates,
} from "../components/CityScene";
import {
  SERVICE_CONFIG,
  calculateCityMetrics,
  simulateMonth,
  type ServiceKind,
} from "../components/citySimulation";

type ToolItem = {
  kind: Exclude<Kind, "empty">;
  icon: ReactNode;
  group: "construção" | "serviço";
};

const BUILD_TOOLS: ToolItem[] = [
  { kind: "road", icon: <Landmark size={18} />, group: "construção" },
  { kind: "residential", icon: <Home size={18} />, group: "construção" },
  { kind: "commercial", icon: <Building2 size={18} />, group: "construção" },
  { kind: "industrial", icon: <Factory size={18} />, group: "construção" },
  { kind: "park", icon: <Trees size={18} />, group: "construção" },
  { kind: "power", icon: <Zap size={18} />, group: "serviço" },
  { kind: "water", icon: <Droplets size={18} />, group: "serviço" },
  { kind: "fire", icon: <Flame size={18} />, group: "serviço" },
  { kind: "police", icon: <Shield size={18} />, group: "serviço" },
  { kind: "clinic", icon: <HeartPulse size={18} />, group: "serviço" },
  { kind: "cemetery", icon: <Cross size={18} />, group: "serviço" },
  { kind: "school", icon: <GraduationCap size={18} />, group: "serviço" },
  { kind: "garbage", icon: <Trash2 size={18} />, group: "serviço" },
];

const SERVICE_ORDER: ServiceKind[] = [
  "fire",
  "police",
  "clinic",
  "cemetery",
  "school",
  "garbage",
  "power",
  "water",
];

const isZone = (kind: Kind) =>
  kind === "residential" || kind === "commercial" || kind === "industrial";

const isService = (kind: Kind): kind is ServiceKind =>
  SERVICE_ORDER.includes(kind as ServiceKind);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Skyline City Web — City Simulator 3D" },
      {
        name: "description",
        content: "Simulador de cidade 3D com economia, impostos, serviços públicos e crescimento urbano.",
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
  const [notice, setNotice] = useState("Terreno vazio. Construa uma estrada para iniciar a cidade.");
  const [taxes, setTaxes] = useState<TaxRates>({
    residential: 9,
    commercial: 9,
    industrial: 9,
  });

  const metrics = useMemo(() => calculateCityMetrics(map, taxes), [map, taxes]);

  useEffect(() => {
    if (paused || !map.some((tile) => tile.kind !== "empty" && tile.kind !== "water")) return;

    const timer = window.setInterval(() => {
      setMap((current) => {
        const result = simulateMonth(current, taxes);
        setMonth((value) => value + 1);
        setMoney((value) => Math.max(0, value + result.cashflow));
        setHappiness(result.happiness);
        setNotice(
          result.event +
            (result.growth > 0 ? ` +${result.growth} habitantes.` : "") +
            (result.deaths > 0 ? ` ${result.deaths} perdas.` : ""),
        );
        return result.map;
      });
    }, 4500 / speed);

    return () => window.clearInterval(timer);
  }, [paused, speed, taxes, map]);

  const onTileClick = (index: number) => {
    const current = map[index];
    if (!current) return;

    if (current.kind !== "empty") {
      setSelected(index);
      setNotice(`${cityLabel[current.kind]} selecionado. Use Demolir para remover.`);
      return;
    }

    if (money < TOOL_COST[tool]) {
      setNotice("Orçamento insuficiente para essa construção.");
      return;
    }

    const x = index % CITY_W;
    const y = Math.floor(index / CITY_W);
    const roadNearby = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].some(
      ([nx, ny]) =>
        nx >= 0 &&
        nx < CITY_W &&
        ny >= 0 &&
        ny < CITY_H &&
        map[ny * CITY_W + nx]?.kind === "road",
    );

    if (tool !== "road" && tool !== "park" && !roadNearby) {
      setNotice("Conecte essa área a uma estrada antes de construir aqui.");
      return;
    }

    setMoney((value) => value - TOOL_COST[tool]);
    setMap((currentMap) =>
      currentMap.map((tile, i) =>
        i === index ? { kind: tool, level: 1, people: 0 } : tile,
      ),
    );
    setSelected(index);
    setNotice(`${cityLabel[tool]} construído por $${TOOL_COST[tool].toLocaleString("pt-BR")}.`);
  };

  const demolish = () => {
    if (selected === null) {
      setNotice("Selecione uma construção primeiro.");
      return;
    }

    const current = map[selected];
    if (!current || current.kind === "empty" || current.kind === "water") return;

    const refund = Math.floor((TOOL_COST[current.kind] ?? 0) * 0.25);

    setMap((currentMap) =>
      currentMap.map((tile, i) =>
        i === selected ? { kind: "empty", level: 0, people: 0 } : tile,
      ),
    );
    setMoney((value) => value + refund);
    setNotice(`${cityLabel[current.kind]} demolido. Reembolso: $${refund.toLocaleString("pt-BR")}.`);
    setSelected(null);
  };

  const reset = () => {
    setMap(createInitialCity());
    setMoney(125000);
    setHappiness(78);
    setMonth(1);
    setSelected(null);
    localStorage.removeItem("skyline-city-save-v1");
    setPaused(false);
    setTaxes({ residential: 9, commercial: 9, industrial: 9 });
    setNotice("Nova cidade criada. Construa uma estrada para começar.");
  };

  const saveCity = () => {
    localStorage.setItem(
      "skyline-city-save-v1",
      JSON.stringify({ map, money, happiness, month, taxes }),
    );
    setNotice("Cidade salva neste navegador.");
  };

  const loadCity = () => {
    const raw = localStorage.getItem("skyline-city-save-v1");
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
        taxes: TaxRates;
      };
      if (!Array.isArray(saved.map) || saved.map.length !== CITY_W * CITY_H) {
        throw new Error("save inválido");
      }
      setMap(saved.map);
      setMoney(saved.money);
      setHappiness(saved.happiness);
      setMonth(saved.month);
      setTaxes(saved.taxes ?? { residential: 9, commercial: 9, industrial: 9 });
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
            <strong>SKYLINE CITY</strong>
            <span>3D CITY SIMULATOR</span>
          </div>
        </div>

        <div className="skyline-stats">
          <Stat label="CAIXA" value={"$" + money.toLocaleString("pt-BR")} />
          <Stat label="POPULAÇÃO" value={metrics.population.toLocaleString("pt-BR")} />
          <Stat label="FELICIDADE" value={happiness + "%"} />
          <Stat label="RENDA / MÊS" value={"$" + metrics.netIncome.toLocaleString("pt-BR")} />
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
          <button className="top-action danger" onClick={reset} title="Nova cidade — começa do zero">
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

          <div className="tool-section-label">INFRAESTRUTURA E ZONAS</div>
          <div className="tool-list">
            {BUILD_TOOLS.filter((toolItem) => toolItem.group === "construção").map(({ kind, icon }) => (
              <ToolButton key={kind} kind={kind} icon={icon} active={tool === kind} onClick={() => setTool(kind)} />
            ))}
          </div>

          <div className="tool-section-label service-heading">SERVIÇOS PÚBLICOS</div>
          <div className="tool-list">
            {BUILD_TOOLS.filter((toolItem) => toolItem.group === "serviço").map(({ kind, icon }) => (
              <ToolButton key={kind} kind={kind} icon={icon} active={tool === kind} onClick={() => setTool(kind)} />
            ))}
          </div>

          <button className="demolish-button" onClick={demolish}>
            <Trash2 size={18} />
            <span>Demolir selecionado</span>
          </button>

          <div className="management-panel">
            <div className="panel-title">
              <span>IMPOSTOS</span>
              <small>5–20%</small>
            </div>
            <TaxRow
              label="Residencial"
              value={taxes.residential}
              onChange={(value) => setTaxes((current) => ({ ...current, residential: value }))}
            />
            <TaxRow
              label="Comercial"
              value={taxes.commercial}
              onChange={(value) => setTaxes((current) => ({ ...current, commercial: value }))}
            />
            <TaxRow
              label="Industrial"
              value={taxes.industrial}
              onChange={(value) => setTaxes((current) => ({ ...current, industrial: value }))}
            />
          </div>

          <div className="management-panel">
            <div className="panel-title">
              <span>SERVIÇOS</span>
              <small>COBERTURA</small>
            </div>
            {SERVICE_ORDER.map((kind) => {
              const key: "powerCoverage" | "waterCoverage" | "fireCoverage" | "policeCoverage" | "healthCoverage" | "deathcareCoverage" | "educationCoverage" | "garbageCoverage" = kind === "power" ? "powerCoverage" :
                kind === "water" ? "waterCoverage" :
                kind === "fire" ? "fireCoverage" :
                kind === "police" ? "policeCoverage" :
                kind === "clinic" ? "healthCoverage" :
                kind === "cemetery" ? "deathcareCoverage" :
                kind === "school" ? "educationCoverage" :
                "garbageCoverage";
              const value = metrics[key];
              return (
                <ServiceMeter
                  key={kind}
                  label={SERVICE_CONFIG[kind].label}
                  value={value}
                />
              );
            })}
          </div>

          <div className="city-overview">
            <div className="panel-title">
              <span>INDICADORES</span>
              <small>{paused ? "PAUSADA" : "AO VIVO"}</small>
            </div>
            <OverviewRow label="Emprego" value={metrics.employmentRate} suffix="%" />
            <OverviewRow label="Saúde" value={metrics.health} suffix="%" />
            <OverviewRow label="Educação" value={metrics.education} suffix="%" />
            <OverviewRow label="Criminalidade" value={metrics.crime} suffix="%" />
            <OverviewRow label="Risco de incêndio" value={metrics.fireRisk} suffix="%" />
            <OverviewRow label="Lixo coletado" value={metrics.garbage} suffix="%" />
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
                {map[selected].people > 0 && <span>Habitantes <b>{map[selected].people}</b></span>}
                {isService(map[selected].kind) && (
                  <span>Manutenção <b>{"$" + SERVICE_CONFIG[map[selected].kind].upkeep}</b>/mês</span>
                )}
              </div>
              <button onClick={demolish}><Trash2 size={16} /></button>
            </div>
          )}

          <div className="scene-brand">SKYLINE CITY WEB <span>•</span> 3D</div>

          <div className="world-demand">
            <div><Home size={13} /> R <b>{metrics.demandResidential}</b></div>
            <div><Building2 size={13} /> C <b>{metrics.demandCommercial}</b></div>
            <div><Factory size={13} /> I <b>{metrics.demandIndustrial}</b></div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ToolButton({
  kind,
  icon,
  active,
  onClick,
}: {
  kind: Exclude<Kind, "empty">;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button className={active ? "build-tool active" : "build-tool"} onClick={onClick}>
      <span className="tool-icon">{icon}</span>
      <span className="tool-copy">
        <b>{cityLabel[kind]}</b>
        <small>{isZone(kind) ? "Zona urbana" : kind === "road" ? "Infraestrutura" : "Serviço público"}</small>
      </span>
      <strong>{"$" + TOOL_COST[kind].toLocaleString("pt-BR")}</strong>
    </button>
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

function TaxRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="tax-row">
      <span>{label}</span>
      <input
        type="range"
        min="5"
        max="20"
        step="1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <b>{value}%</b>
    </label>
  );
}

function ServiceMeter({ label, value }: { label: string; value: number }) {
  return (
    <div className="service-meter">
      <div>
        <span>{label}</span>
        <b>{value}%</b>
      </div>
      <div className="meter-track">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function OverviewRow({
  label,
  value,
  suffix = "",
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="overview-row">
      <span>{label}</span>
      <b>{value.toLocaleString("pt-BR")}{suffix}</b>
    </div>
  );
}
