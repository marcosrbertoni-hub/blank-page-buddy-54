import { Canvas, useFrame } from "@react-three/fiber";
import { CameraControls, CameraControlsImpl, Sky } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export type Kind =
  | "empty"
  | "road"
  | "residential"
  | "commercial"
  | "industrial"
  | "park"
  | "power"
  | "water"
  | "fire"
  | "police"
  | "clinic"
  | "cemetery"
  | "school"
  | "garbage";

export type CityTile = {
  kind: Kind;
  level: number;
  people: number;
};

export type TaxRates = {
  residential: number;
  commercial: number;
  industrial: number;
};

export const CITY_W = 28;
export const CITY_H = 22;
export const TILE = 4;

export const TOOL_COST: Record<Exclude<Kind, "empty">, number> = {
  road: 80,
  residential: 500,
  commercial: 900,
  industrial: 750,
  park: 350,
  power: 1200,
  water: 1000,
  fire: 2400,
  police: 2600,
  clinic: 3000,
  cemetery: 1800,
  school: 2200,
  garbage: 2000,
};

export const cityLabel: Record<Kind, string> = {
  empty: "Terreno",
  road: "Estrada",
  residential: "Residencial",
  commercial: "Comercial",
  industrial: "Industrial",
  park: "Parque",
  power: "Usina",
  water: "Água/Esgoto",
  fire: "Bombeiros",
  police: "Polícia",
  clinic: "Clínica",
  cemetery: "Cemitério",
  school: "Escola",
  garbage: "Coleta de lixo",
};

const ROAD_ROWS = new Set([4, 10, 16]);
const ROAD_COLS = new Set([5, 13, 21]);

const idx = (x: number, y: number) => y * CITY_W + x;

const ROAD_GEOMETRY = new THREE.BoxGeometry(TILE * 0.88, 0.08, TILE * 0.88);
const ROAD_MATERIAL = new THREE.MeshStandardMaterial({ color: "#30343a", roughness: 0.9 });
const MARK_GEOMETRY = new THREE.BoxGeometry(1, 0.018, 1);
const MARK_MATERIAL = new THREE.MeshStandardMaterial({ color: "#e6c34a", emissive: "#5c4300", emissiveIntensity: 0.15 });
const UNIT_BOX_GEOMETRY = new THREE.BoxGeometry(1, 1, 1);
const ROOF_GEOMETRY = new THREE.BoxGeometry(1, 0.18, 1);
const WINDOW_GEOMETRY = new THREE.BoxGeometry(1, 0.38, 0.04);
const CONE_GEOMETRY = new THREE.ConeGeometry(1, 1, 4);
const PARK_GEOMETRY = new THREE.BoxGeometry(TILE * 0.9, 0.08, TILE * 0.9);
const PARK_MATERIAL = new THREE.MeshStandardMaterial({ color: "#3c9257", roughness: 1 });
const TRUNK_GEOMETRY = new THREE.CylinderGeometry(0.11, 0.16, 1.5, 6);
const TRUNK_MATERIAL = new THREE.MeshStandardMaterial({ color: "#65452f", roughness: 1 });
const CROWN_GEOMETRY = new THREE.IcosahedronGeometry(0.9, 0);
const CROWN_MATERIAL = new THREE.MeshStandardMaterial({ color: "#359454", roughness: 0.9 });

const hash = (x: number, y: number) => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
};

const isRoad = (x: number, y: number) =>
  ROAD_ROWS.has(y) || ROAD_COLS.has(x) || (y === 13 && x > 7 && x < 22);

const nearRoad = (x: number, y: number) =>
  [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].some(
    ([nx, ny]) =>
      nx >= 0 && nx < CITY_W && ny >= 0 && ny < CITY_H && isRoad(nx, ny),
  );

export const createInitialCity = (): CityTile[] => {
  const result: CityTile[] = [];

  for (let y = 0; y < CITY_H; y += 1) {
    for (let x = 0; x < CITY_W; x += 1) {
      if (x >= CITY_W - 3) {
        result.push({ kind: "water", level: 1, people: 0 });
        continue;
      }

      if (isRoad(x, y)) {
        result.push({ kind: "road", level: 1, people: 0 });
        continue;
      }

      if (!nearRoad(x, y)) {
        result.push({
          kind: hash(x, y) > 0.55 ? "park" : "empty",
          level: 1,
          people: 0,
        });
        continue;
      }

      const r = hash(x + 10, y + 20);
      if (r < 0.14) {
        result.push({ kind: "park", level: 1, people: 0 });
      } else if (r < 0.6) {
        result.push({
          kind: "residential",
          level: 1 + Math.floor(hash(x + 2, y + 4) * 4),
          people: 40 + Math.floor(hash(x + 8, y + 9) * 100),
        });
      } else if (r < 0.84) {
        result.push({
          kind: "commercial",
          level: 1 + Math.floor(hash(x + 3, y + 6) * 5),
          people: 0,
        });
      } else {
        result.push({
          kind: "industrial",
          level: 1 + Math.floor(hash(x + 5, y + 8) * 3),
          people: 0,
        });
      }
    }
  }

  const starterServices: Array<[number, number, Kind]> = [
    [2, 2, "power"],
    [7, 8, "water"],
    [9, 12, "fire"],
    [12, 14, "police"],
    [15, 8, "clinic"],
    [17, 12, "cemetery"],
    [19, 14, "school"],
    [23, 8, "garbage"],
  ];

  starterServices.forEach(([x, y, kind]) => {
    result[idx(x, y)] = { kind, level: 1, people: 0 };
  });

  return result;
};

type CitySceneProps = {
  map: CityTile[];
  selected: number | null;
  onTileClick: (index: number) => void;
  paused: boolean;
  night: boolean;
};

const worldPosition = (index: number): [number, number, number] => {
  const x = index % CITY_W;
  const y = Math.floor(index / CITY_W);
  return [
    (x - (CITY_W - 1) / 2) * TILE,
    0,
    (y - (CITY_H - 1) / 2) * TILE,
  ];
};

const serviceKinds = new Set<Kind>([
  "power",
  "water",
  "fire",
  "police",
  "clinic",
  "cemetery",
  "school",
  "garbage",
]);

const buildingKinds: Array<"residential" | "commercial" | "industrial"> = [
  "residential",
  "commercial",
  "industrial",
];

type BuildingInstance = {
  index: number;
  kind: "residential" | "commercial" | "industrial";
  position: [number, number, number];
  width: number;
  depth: number;
  height: number;
  seed: number;
};

function RoadLayer({ map }: { map: CityTile[] }) {
  const roadRef = useRef<THREE.InstancedMesh>(null);
  const markRef = useRef<THREE.InstancedMesh>(null);
  const matrix = useMemo(() => new THREE.Matrix4(), []);

  const roads = useMemo(
    () =>
      map
        .map((tile, index) => ({ tile, index }))
        .filter(({ tile }) => tile.kind === "road"),
    [map],
  );

  useEffect(() => {
    if (!roadRef.current || !markRef.current) return;

    roads.forEach(({ index }, instance) => {
      const [x, , z] = worldPosition(index);
      matrix.makeScale(1, 1, 1);
      matrix.setPosition(x, 0.035, z);
      roadRef.current!.setMatrixAt(instance, matrix);

      const cx = index % CITY_W;
      const cy = Math.floor(index / CITY_W);
      const horizontal = ROAD_ROWS.has(cy) || (cy === 13 && cx > 7 && cx < 22);
      matrix.makeScale(horizontal ? 0.08 : 0.32, 1, horizontal ? 0.32 : 0.08);
      matrix.setPosition(x, 0.09, z);
      markRef.current!.setMatrixAt(instance, matrix);
    });

    roadRef.current.count = roads.length;
    markRef.current.count = roads.length;
    roadRef.current.instanceMatrix.needsUpdate = true;
    markRef.current.instanceMatrix.needsUpdate = true;
  }, [roads, matrix]);

  return (
    <>
      <instancedMesh ref={roadRef} args={[ROAD_GEOMETRY, ROAD_MATERIAL, Math.max(1, roads.length)]} receiveShadow>

      </instancedMesh>
      <instancedMesh ref={markRef} args={[MARK_GEOMETRY, MARK_MATERIAL, Math.max(1, roads.length)]}>

      </instancedMesh>
    </>
  );
}

function BuildingLayer({
  map,
  kind,
  selected,
  onTileClick,
}: {
  map: CityTile[];
  kind: "residential" | "commercial" | "industrial";
  selected: number | null;
  onTileClick: (index: number) => void;
}) {
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const roofRef = useRef<THREE.InstancedMesh>(null);
  const windowRef = useRef<THREE.InstancedMesh>(null);
  const coneRef = useRef<THREE.InstancedMesh>(null);
  const matrix = useMemo(() => new THREE.Matrix4(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const bodyMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.72, metalness: 0.08, vertexColors: true }),
    [],
  );
  const roofMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: kind === "residential" ? "#7b3f3f" : kind === "commercial" ? "#182f45" : "#4f4b45",
      roughness: 0.82,
    }),
    [kind],
  );
  const windowMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      emissive: "#3d9cc4",
      emissiveIntensity: 0.55,
      roughness: 0.32,
      vertexColors: true,
    }),
    [],
  );
  const coneMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#6f3535", roughness: 0.86 }),
    [],
  );

  const items = useMemo<BuildingInstance[]>(() => {
    return map.flatMap((tile, index) => {
      if (tile.kind !== kind) return [];
      const [x, , z] = worldPosition(index);
      const seed = Math.abs(Math.sin(x * 12.7 + z * 7.1));
      const height =
        kind === "residential"
          ? 3.4 + tile.level * 1.5 + seed * 2
          : kind === "commercial"
            ? 5.5 + tile.level * 2.2 + seed * 4
            : 2.8 + tile.level * 1.15 + seed * 1.5;

      return [{
        index,
        kind,
        position: [x, 0, z],
        width: kind === "industrial" ? 3.15 : 2.55 + seed * 0.45,
        depth: kind === "industrial" ? 2.8 : 2.55 + (1 - seed) * 0.35,
        height,
        seed,
      }];
    });
  }, [map, kind]);

  useEffect(() => {
    if (!bodyRef.current || !roofRef.current || !windowRef.current || !coneRef.current) return;

    items.forEach((item, instance) => {
      const { position, width, depth, height } = item;
      matrix.makeScale(width, height, depth);
      matrix.setPosition(position[0], height / 2, position[2]);
      bodyRef.current!.setMatrixAt(instance, matrix);

      const selectedNow = selected === item.index;
      if (kind === "residential") color.set(selectedNow ? "#f0c4a0" : item.seed > 0.55 ? "#d7b78b" : "#a9c4d5");
      if (kind === "commercial") color.set(selectedNow ? "#75b5d9" : item.seed > 0.5 ? "#3d647d" : "#567f99");
      if (kind === "industrial") color.set(selectedNow ? "#b29d80" : "#8c7660");
      bodyRef.current!.setColorAt(instance, color);

      matrix.makeScale(width * 1.03, 1, depth * 1.03);
      matrix.setPosition(position[0], height + 0.12, position[2]);
      roofRef.current!.setMatrixAt(instance, matrix);

      if (kind === "residential" || kind === "commercial") {
        const rows = 2;
        for (let row = 0; row < rows; row += 1) {
          const windowInstance = instance * 2 + row;
          matrix.makeScale(Math.max(0.8, width - 0.55), 1, 1);
          matrix.setPosition(
            position[0],
            1.05 + row * Math.max(1.4, height * 0.42),
            position[2] + depth / 2 + 0.035,
          );
          windowRef.current!.setMatrixAt(windowInstance, matrix);
          color.set(
            selectedNow
              ? "#dff7ff"
              : kind === "residential"
                ? row === 0 ? "#f0d48f" : "#9ed9ef"
                : "#9ed9ef",
          );
          windowRef.current!.setColorAt(windowInstance, color);
        }
      }

      if (kind === "residential") {
        matrix.makeScale(width * 0.48, 0.95, width * 0.48);
        matrix.setPosition(position[0], height + 0.62, position[2]);
        coneRef.current!.setMatrixAt(instance, matrix);
      }
    });

    bodyRef.current.count = items.length;
    roofRef.current.count = items.length;
    windowRef.current.count = (kind === "industrial" ? 0 : items.length * 2);
    coneRef.current.count = kind === "residential" ? items.length : 0;

    bodyRef.current.instanceMatrix.needsUpdate = true;
    roofRef.current.instanceMatrix.needsUpdate = true;
    windowRef.current.instanceMatrix.needsUpdate = true;
    coneRef.current.instanceMatrix.needsUpdate = true;
    if (bodyRef.current.instanceColor) bodyRef.current.instanceColor.needsUpdate = true;
    if (windowRef.current.instanceColor) windowRef.current.instanceColor.needsUpdate = true;
  }, [items, selected, kind, matrix, color]);

  const handleClick = (event: any) => {
    event.stopPropagation();
    const id = event.instanceId;
    if (typeof id === "number" && items[id]) onTileClick(items[id].index);
  };

  return (
    <>
      <instancedMesh
        ref={bodyRef}
        args={[UNIT_BOX_GEOMETRY, bodyMaterial, Math.max(1, items.length)]}
        castShadow
        receiveShadow
        onClick={handleClick}
      >

      </instancedMesh>

      <instancedMesh ref={roofRef} args={[ROOF_GEOMETRY, roofMaterial, Math.max(1, items.length)]} castShadow>

      </instancedMesh>

      <instancedMesh
        ref={windowRef}
        args={[WINDOW_GEOMETRY, windowMaterial, Math.max(1, items.length * 2)]}
      >

      </instancedMesh>

      <instancedMesh
        ref={coneRef}
        args={[CONE_GEOMETRY, coneMaterial, Math.max(1, items.length)]}
        castShadow
      >

      </instancedMesh>
    </>
  );
}

function ParkLayer({ map }: { map: CityTile[] }) {
  const parkRef = useRef<THREE.InstancedMesh>(null);
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const crownRef = useRef<THREE.InstancedMesh>(null);
  const matrix = useMemo(() => new THREE.Matrix4(), []);

  const parks = useMemo(
    () => map.map((tile, index) => ({ tile, index })).filter(({ tile }) => tile.kind === "park"),
    [map],
  );

  useEffect(() => {
    if (!parkRef.current || !trunkRef.current || !crownRef.current) return;

    parks.forEach(({ index }, i) => {
      const [x, , z] = worldPosition(index);
      matrix.makeScale(1, 1, 1);
      matrix.setPosition(x, 0.045, z);
      parkRef.current!.setMatrixAt(i, matrix);

      const offsets = [[-1.15, -0.85], [1.05, 0.9], [0.95, -0.95]];
      offsets.forEach(([ox, oz], treeIndex) => {
        const instance = i * 3 + treeIndex;
        const s = 0.55 + hash(index + treeIndex, index) * 0.3;
        matrix.makeScale(s, s, s);
        matrix.setPosition(x + ox, 0.78 * s, z + oz);
        trunkRef.current!.setMatrixAt(instance, matrix);
        matrix.makeScale(s * 0.95, s * 1.25, s * 0.95);
        matrix.setPosition(x + ox, 1.8 * s, z + oz);
        crownRef.current!.setMatrixAt(instance, matrix);
      });
    });

    parkRef.current.count = parks.length;
    trunkRef.current.count = parks.length * 3;
    crownRef.current.count = parks.length * 3;
    parkRef.current.instanceMatrix.needsUpdate = true;
    trunkRef.current.instanceMatrix.needsUpdate = true;
    crownRef.current.instanceMatrix.needsUpdate = true;
  }, [parks, matrix]);

  return (
    <>
      <instancedMesh ref={parkRef} args={[PARK_GEOMETRY, PARK_MATERIAL, Math.max(1, parks.length)]} receiveShadow>

      </instancedMesh>
      <instancedMesh ref={trunkRef} args={[TRUNK_GEOMETRY, TRUNK_MATERIAL, Math.max(1, parks.length * 3)]} castShadow>

      </instancedMesh>
      <instancedMesh ref={crownRef} args={[CROWN_GEOMETRY, CROWN_MATERIAL, Math.max(1, parks.length * 3)]} castShadow>

      </instancedMesh>
    </>
  );
}

function ServiceBuilding({
  kind,
  position,
  selected,
  onClick,
}: {
  kind: Kind;
  position: [number, number, number];
  selected: boolean;
  onClick: () => void;
}) {
  const palette: Record<string, string> = {
    power: "#666a73",
    water: "#d4e2e8",
    fire: "#b84b42",
    police: "#456eaa",
    clinic: "#e6e8eb",
    cemetery: "#766a80",
    school: "#c8a15a",
    garbage: "#6d765f",
  };
  const roof: Record<string, string> = {
    power: "#c3c5c8",
    water: "#78aabf",
    fire: "#7e2524",
    police: "#263e69",
    clinic: "#b5c1cb",
    cemetery: "#3e3949",
    school: "#805f3a",
    garbage: "#444c3e",
  };

  const height = kind === "power" ? 4.5 : kind === "water" ? 4 : 2.5;
  const width = kind === "power" ? 2.8 : 2.65;

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <mesh castShadow receiveShadow position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, 2.35]} />
        <meshStandardMaterial
          color={selected ? "#f0c85b" : palette[kind] ?? "#88909a"}
          roughness={0.58}
          metalness={kind === "power" ? 0.28 : 0.05}
        />
      </mesh>
      <mesh castShadow position={[0, height + 0.18, 0]}>
        <boxGeometry args={[width * 1.04, 0.32, 2.45]} />
        <meshStandardMaterial color={roof[kind] ?? "#555"} roughness={0.72} />
      </mesh>
      {kind === "fire" && (
        <mesh castShadow position={[0, height + 1.1, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 2, 10]} />
          <meshStandardMaterial color="#d8d8d8" metalness={0.35} roughness={0.45} />
        </mesh>
      )}
      {kind === "police" && (
        <mesh position={[0, height + 0.48, 0]}>
          <boxGeometry args={[0.6, 0.12, 0.18]} />
          <meshStandardMaterial color="#5db9ff" emissive="#1878c9" emissiveIntensity={2} />
        </mesh>
      )}
      {kind === "clinic" && (
        <mesh position={[0, height + 0.5, 0]}>
          <boxGeometry args={[0.7, 0.16, 0.16]} />
          <meshStandardMaterial color="#e34c4c" emissive="#a51f1f" emissiveIntensity={1.2} />
        </mesh>
      )}
      {kind === "cemetery" && (
        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[1.6, 0.12, 1.6]} />
          <meshStandardMaterial color="#b9b0a1" roughness={1} />
        </mesh>
      )}
    </group>
  );
}

function ServiceLayer({
  map,
  selected,
  onTileClick,
}: {
  map: CityTile[];
  selected: number | null;
  onTileClick: (index: number) => void;
}) {
  return (
    <>
      {map.map((tile, index) => {
        if (!serviceKinds.has(tile.kind)) return null;
        return (
          <ServiceBuilding
            key={index}
            kind={tile.kind}
            position={worldPosition(index)}
            selected={selected === index}
            onClick={() => onTileClick(index)}
          />
        );
      })}
    </>
  );
}

function Water({ onTileClick }: { onTileClick: (index: number) => void }) {
  const waterX = (CITY_W - 1 - 1) * TILE / 2;
  return (
    <mesh
      position={[waterX, 0.025, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      onClick={(e) => {
        e.stopPropagation();
        const x = Math.max(0, Math.min(CITY_W - 1, Math.floor((e.point.x + ((CITY_W - 1) * TILE) / 2) / TILE)));
        const y = Math.max(0, Math.min(CITY_H - 1, Math.floor((e.point.z + ((CITY_H - 1) * TILE) / 2) / TILE)));
        onTileClick(y * CITY_W + x);
      }}
    >
      <planeGeometry args={[TILE * 3, CITY_H * TILE + 18]} />
      <meshStandardMaterial color="#287ca4" metalness={0.28} roughness={0.16} transparent opacity={0.94} />
    </mesh>
  );
}

function Cars({ paused }: { paused: boolean }) {
  const cars = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        offset: i * 7.3,
        speed: 1.8 + (i % 4) * 0.34,
        vertical: i % 2 === 0,
        lane: i % 3,
      })),
    [],
  );

  return (
    <>
      {cars.map((car, i) => (
        <MovingCar key={i} {...car} paused={paused} />
      ))}
    </>
  );
}

function MovingCar({
  offset,
  speed,
  vertical,
  lane,
  paused,
}: {
  offset: number;
  speed: number;
  vertical: boolean;
  lane: number;
  paused: boolean;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current || paused) return;
    const t = (offset + clock.elapsedTime * speed * 5) % 112;
    if (vertical) {
      const x = [-32, 0, 28][lane] ?? -32;
      ref.current.position.set(x, 0.24, -42 + t);
      ref.current.rotation.y = Math.PI / 2;
    } else {
      const z = [-24, 0, 24][lane] ?? -24;
      ref.current.position.set(-56 + t, 0.24, z);
      ref.current.rotation.y = 0;
    }
  });

  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.72, 0.34, 1.35]} />
        <meshStandardMaterial color={["#e85d5d", "#4e9eea", "#f2c84b", "#f1f1f1"][lane % 4]} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.11, 0.12]}>
        <boxGeometry args={[0.48, 0.15, 0.5]} />
        <meshStandardMaterial color="#9ed7e7" roughness={0.18} />
      </mesh>
    </group>
  );
}

function CityWorld({ map, selected, onTileClick, paused, night }: CitySceneProps) {
  const handleGroundClick = (event: any) => {
    event.stopPropagation();
    const x = Math.max(0, Math.min(CITY_W - 1, Math.floor((event.point.x + ((CITY_W - 1) * TILE) / 2) / TILE)));
    const y = Math.max(0, Math.min(CITY_H - 1, Math.floor((event.point.z + ((CITY_H - 1) * TILE) / 2) / TILE)));
    onTileClick(y * CITY_W + x);
  };

  return (
    <>
      {night ? (
        <color attach="background" args={["#06101e"]} />
      ) : (
        <Sky distance={450000} sunPosition={[80, 55, 45]} turbidity={7} rayleigh={1.1} mieCoefficient={0.006} mieDirectionalG={0.8} />
      )}

      <fog attach="fog" args={[night ? "#06101e" : "#a9c3d4", 95, 260]} />
      <ambientLight intensity={night ? 0.24 : 0.72} />
      <hemisphereLight args={night ? ["#1d3155", "#10160f", 0.28] : ["#c7e6ff", "#34513a", 0.85]} />
      <directionalLight
        castShadow
        position={[35, 60, 20]}
        intensity={night ? 0.38 : 2.8}
        color="#fff2d6"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-72}
        shadow-camera-right={72}
        shadow-camera-top={72}
        shadow-camera-bottom={-72}
        shadow-bias={-0.00025}
      />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.04, 0]}
        receiveShadow
        onClick={handleGroundClick}
      >
        <planeGeometry args={[CITY_W * TILE + 20, CITY_H * TILE + 20]} />
        <meshStandardMaterial color="#66825e" roughness={1} />
      </mesh>

      <RoadLayer map={map} />
      <ParkLayer map={map} />

      {buildingKinds.map((kind) => (
        <BuildingLayer
          key={kind}
          map={map}
          kind={kind}
          selected={selected}
          onTileClick={onTileClick}
        />
      ))}

      <ServiceLayer map={map} selected={selected} onTileClick={onTileClick} />
      <Water onTileClick={onTileClick} />
      <Cars paused={paused} />
    </>
  );
}

export function CityScene(props: CitySceneProps) {
  const controls = useRef<CameraControlsImpl | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      controls.current?.setLookAt(64, 56, 64, 0, 0, 0, true);
    }, 40);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <Canvas
      shadows
      dpr={[1, 1.35]}
      camera={{ position: [64, 56, 64], fov: 48, near: 0.1, far: 520 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <CameraControls
        ref={controls}
        makeDefault
        smoothTime={0.16}
        draggingSmoothTime={0.1}
        minDistance={24}
        maxDistance={155}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.18}
      />
      <CityWorld {...props} />
    </Canvas>
  );
}
