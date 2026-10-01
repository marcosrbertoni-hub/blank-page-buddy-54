import type { CityTile, Kind, TaxRates } from "./CityScene";

export type ServiceKind =
  | "fire"
  | "police"
  | "clinic"
  | "cemetery"
  | "school"
  | "garbage"
  | "power"
  | "water";

export const SERVICE_CONFIG: Record<ServiceKind, {
  label: string;
  capacity: number;
  upkeep: number;
  coverage: number;
}> = {
  fire: { label: "Bombeiros", capacity: 220, upkeep: 95, coverage: 5 },
  police: { label: "Polícia", capacity: 260, upkeep: 90, coverage: 5 },
  clinic: { label: "Saúde", capacity: 420, upkeep: 105, coverage: 4 },
  cemetery: { label: "Cemitério", capacity: 900, upkeep: 45, coverage: 4 },
  school: { label: "Escola", capacity: 180, upkeep: 55, coverage: 4 },
  garbage: { label: "Coleta", capacity: 700, upkeep: 70, coverage: 5 },
  power: { label: "Energia", capacity: 900, upkeep: 120, coverage: 7 },
  water: { label: "Água/Esgoto", capacity: 1100, upkeep: 80, coverage: 7 },
};

export type CityMetrics = {
  population: number;
  jobs: number;
  households: number;
  employmentRate: number;
  electricityCapacity: number;
  waterCapacity: number;
  sewageCapacity: number;
  powerCoverage: number;
  waterCoverage: number;
  fireCoverage: number;
  policeCoverage: number;
  healthCoverage: number;
  deathcareCoverage: number;
  educationCoverage: number;
  garbageCoverage: number;
  serviceScore: number;
  taxRevenue: number;
  serviceUpkeep: number;
  roadUpkeep: number;
  netIncome: number;
  demandResidential: number;
  demandCommercial: number;
  demandIndustrial: number;
  averageTax: number;
  crime: number;
  fireRisk: number;
  health: number;
  education: number;
  garbage: number;
  sewage: number;
};

const countKind = (map: CityTile[], kind: Kind | ServiceKind) =>
  map.reduce((total, tile) => total + (tile.kind === kind ? 1 : 0), 0);

const pct = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const serviceCoverage = (map: CityTile[], kind: ServiceKind, population: number) => {
  const count = countKind(map, kind);
  if (population <= 0) return count > 0 ? 100 : 0;
  return pct((count * SERVICE_CONFIG[kind].capacity / population) * 100);
};

export function calculateCityMetrics(map: CityTile[], taxes: TaxRates): CityMetrics {
  const residential = countKind(map, "residential");
  const commercial = countKind(map, "commercial");
  const industrial = countKind(map, "industrial");
  const roads = countKind(map, "road");
  const parks = countKind(map, "park");

  const population = map.reduce((sum, tile) => sum + tile.people, 0);
  const households = residential * 42;
  const jobs = commercial * 18 + industrial * 24;
  const employmentRate = population === 0 ? 100 : pct((Math.min(population, jobs) / population) * 100);

  const fireCoverage = serviceCoverage(map, "fire", population);
  const policeCoverage = serviceCoverage(map, "police", population);
  const healthCoverage = serviceCoverage(map, "clinic", population);
  const deathcareCoverage = serviceCoverage(map, "cemetery", population);
  const educationCoverage = serviceCoverage(map, "school", Math.max(1, Math.round(population * 0.22)));
  const garbageCoverage = serviceCoverage(map, "garbage", population);

  const electricityCapacity = countKind(map, "power") * SERVICE_CONFIG.power.capacity;
  const waterCapacity = countKind(map, "water") * SERVICE_CONFIG.water.capacity;
  const waterNeed = Math.round(population * 0.95 + jobs * 0.22);
  const powerNeed = Math.round(population * 0.65 + jobs * 0.5);
  const sewageNeed = Math.round(waterNeed * 0.9);
  const powerCoverage = powerNeed === 0 ? 100 : pct((electricityCapacity / powerNeed) * 100);
  const waterCoverage = waterNeed === 0 ? 100 : pct((waterCapacity / waterNeed) * 100);
  const sewageCapacity = countKind(map, "water") * 850;
  const sewage = sewageNeed === 0 ? 100 : pct((sewageCapacity / sewageNeed) * 100);

  const taxRevenue = Math.round(
    population * (taxes.residential / 100) * 1.55 +
    jobs * ((taxes.commercial + taxes.industrial) / 200) * 2.35,
  );

  const serviceUpkeep =
    (Object.keys(SERVICE_CONFIG) as ServiceKind[]).reduce(
      (sum, kind) => sum + countKind(map, kind) * SERVICE_CONFIG[kind].upkeep,
      0,
    );

  const roadUpkeep = roads * 5;
  const netIncome = taxRevenue - serviceUpkeep - roadUpkeep;

  const averageTax = (taxes.residential + taxes.commercial + taxes.industrial) / 3;
  const serviceScore =
    fireCoverage * 0.13 +
    policeCoverage * 0.13 +
    healthCoverage * 0.14 +
    deathcareCoverage * 0.08 +
    educationCoverage * 0.1 +
    garbageCoverage * 0.1 +
    powerCoverage * 0.1 +
    waterCoverage * 0.12 +
    sewage * 0.05 +
    Math.min(100, parks * 2.5) * 0.05;

  const crime = pct(82 - policeCoverage * 0.68 - educationCoverage * 0.08);
  const fireRisk = pct(78 - fireCoverage * 0.72 + industrial * 0.35);
  const health = pct(48 + healthCoverage * 0.36 + waterCoverage * 0.08 + sewage * 0.08 - garbageCoverage * 0.16);
  const education = pct(educationCoverage * 0.72 + Math.min(100, educationCoverage + 10) * 0.28);
  const garbage = garbageCoverage;
  const demandPenalty = Math.max(0, averageTax - 9) * 2.2;
  const demandResidential = pct(45 + employmentRate * 0.3 + serviceScore * 0.28 - demandPenalty - population / 1500);
  const demandCommercial = pct(35 + employmentRate * 0.24 + education * 0.12 - demandPenalty * 0.8);
  const demandIndustrial = pct(40 + Math.max(0, 100 - education) * 0.08 + (100 - averageTax) * 0.9);

  return {
    population,
    jobs,
    households,
    employmentRate,
    electricityCapacity,
    waterCapacity,
    sewageCapacity,
    powerCoverage,
    waterCoverage,
    fireCoverage,
    policeCoverage,
    healthCoverage,
    deathcareCoverage,
    educationCoverage,
    garbageCoverage,
    serviceScore: pct(serviceScore),
    taxRevenue,
    serviceUpkeep,
    roadUpkeep,
    netIncome,
    demandResidential,
    demandCommercial,
    demandIndustrial,
    averageTax: Number(averageTax.toFixed(1)),
    crime,
    fireRisk,
    health,
    education,
    garbage,
    sewage,
  };
}

export function simulateMonth(map: CityTile[], taxes: TaxRates) {
  const before = calculateCityMetrics(map, taxes);
  const next = map.map((tile) => ({ ...tile }));
  let growth = 0;
  let deaths = 0;

  next.forEach((tile, index) => {
    if (tile.kind !== "residential") return;

    const x = index % 28;
    const y = Math.floor(index / 28);
    const roadNearby = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].some(
      ([nx, ny]) =>
        nx >= 0 && nx < 28 && ny >= 0 && ny < 22 &&
        next[ny * 28 + nx]?.kind === "road",
    );

    if (!roadNearby) return;

    const localScore =
      before.demandResidential +
      before.health * 0.12 +
      before.education * 0.08 +
      before.serviceScore * 0.18 -
      before.crime * 0.1 -
      before.fireRisk * 0.08;

    if (localScore > 60 && before.powerCoverage >= 70 && before.waterCoverage >= 70 && tile.people < 240) {
      const added = Math.min(16, Math.max(2, Math.floor(localScore / 20)));
      tile.people += added;
      tile.level = Math.min(6, tile.level + (tile.people > tile.level * 55 ? 1 : 0));
      growth += added;
    }

    if ((before.health < 45 || before.garbage < 35 || before.waterCoverage < 55) && tile.people > 10) {
      const lost = Math.min(5, Math.max(1, Math.floor((55 - Math.min(before.health, before.garbage)) / 18)));
      tile.people = Math.max(0, tile.people - lost);
      deaths += lost;
    }
  });

  const after = calculateCityMetrics(next, taxes);
  const event =
    before.powerCoverage < 70 ? "⚡ Falta de energia está reduzindo o crescimento." :
    before.waterCoverage < 70 ? "💧 A cidade precisa de mais água e esgoto." :
    before.fireCoverage < 50 ? "🚒 O risco de incêndio está alto: construa um quartel." :
    before.policeCoverage < 50 ? "🚓 A cobertura policial está baixa." :
    before.healthCoverage < 50 ? "🏥 A saúde precisa de mais atendimento." :
    before.deathcareCoverage < 50 && before.population > 500 ? "⚰️ O cemitério está sem capacidade suficiente." :
    before.garbageCoverage < 50 ? "🗑️ O lixo está acumulando: amplie a coleta." :
    growth > 0 ? "🏙️ A cidade está crescendo." :
    "📊 A cidade passou mais um mês em equilíbrio.";

  return {
    map: next,
    cashflow: after.netIncome,
    happiness: pct(
      after.serviceScore * 0.52 +
      after.health * 0.18 +
      after.education * 0.1 +
      after.employmentRate * 0.1 +
      (100 - after.averageTax * 4) * 0.1,
    ),
    growth,
    deaths,
    event,
  };
}
