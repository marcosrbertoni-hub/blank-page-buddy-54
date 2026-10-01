import { Canvas, useFrame } from "@react-three/fiber";
import { CameraControls, Outlines, Sky } from "@react-three/drei";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
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
  | "water";

export type CityTile = {
  kind: Kind;
  level: number;
  people: number;
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
};

const ROAD_ROWS = new Set([4, 10, 16]);
const ROAD_COLS = new Set([5, 13, 21]);

const idx = (x: number, y: number) => y * CITY_W + x;

const hash = (x: number, y: number) => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
};

const isRoad = (x: number, y: number) =>
  ROAD_ROWS.has(y) || ROAD_COLS.has(x) || (y === 13 && x > 7 && x < 22);

const nearRoad = (x: number, y: number) =>
  [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].some(
    ([nx, ny]) =>
      nx >= 0 &&
      nx < CITY_W &&
      ny >= 0 &&
      ny < CITY_H &&
      isRoad(nx, ny),
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
      if (r < 0.12) {
        result.push({ kind: "park", level: 1, people: 0 });
      } else if (r < 0.58) {
        result.push({
          kind: "residential",
          level: 1 + Math.floor(hash(x + 2, y + 4) * 4),
          people: 40 + Math.floor(hash(x + 8, y + 9) * 100),
        });
      } else if (r < 0.82) {
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

  result[idx(2, 2)] = { kind: "power", level: 1, people: 0 };
  result[idx(23, 18)] = { kind: "power", level: 1, people: 0 };
  result[idx(23, 3)] = { kind: "water", level: 1, people: 0 };
  return result;
};

type CitySceneProps = {
  map: CityTile[];
  selected: number | null;
  onTileClick: (index: number) => void;
  paused: boolean;
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

function Road({ x, y }: { x: number; y: number }) {
  const horizontal = ROAD_ROWS.has(y) || (y === 13 && x > 7 && x < 22);
  const vertical = ROAD_COLS.has(x);
  const intersection = horizontal && vertical;

  return (
    <group position={worldPosition(idx(x, y))}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <planeGeometry args={[TILE, TILE]} />
        <meshStandardMaterial color="#34383d" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.045, 0]} receiveShadow>
        <boxGeometry args={[TILE * 0.78, 0.06, TILE * 0.78]} />
        <meshStandardMaterial color="#2a2e33" roughness={0.9} />
      </mesh>

      {!vertical && horizontal && !intersection && (
        <>
          <mesh position={[0, 0.09, 0]}>
            <boxGeometry args={[TILE * 0.07, 0.015, 0.35]} />
            <meshStandardMaterial color="#f3c84b" emissive="#3b2600" emissiveIntensity={0.25} />
          </mesh>
        </>
      )}

      {vertical && !horizontal && !intersection && (
        <mesh position={[0, 0.09, 0]}>
          <boxGeometry args={[0.35, 0.015, TILE * 0.07]} />
          <meshStandardMaterial color="#f3c84b" emissive="#3b2600" emissiveIntensity={0.25} />
        </mesh>
      )}

      {intersection && (
        <mesh position={[0, 0.09, 0]}>
          <boxGeometry args={[0.42, 0.018, 0.42]} />
          <meshStandardMaterial color="#f3c84b" emissive="#3b2600" emissiveIntensity={0.2} />
        </mesh>
      )}
    </group>
  );
}

function Windows({
  width,
  depth,
  height,
  color,
  warm = false,
}: {
  width: number;
  depth: number;
  height: number;
  color: string;
  warm?: boolean;
}) {
  const rows = Math.max(2, Math.floor(height / 1.5));
  const cols = Math.max(2, Math.floor(width / 0.75));
  const nodes = [];

  for (let row = 0; row < rows; row += 1) {
    const yy = 0.7 + row * (height - 1.1) / rows;
    for (let col = 0; col < cols; col += 1) {
      const xx = -width / 2 + 0.45 + col * Math.max(0.5, (width - 0.8) / cols);
      const lit = (row * 7 + col * 11) % 5 !== 0;
      nodes.push(
        <mesh
          key={`${row}-f-${col}`}
          position={[xx, yy, depth / 2 + 0.018]}
        >
          <boxGeometry args={[0.22, 0.34, 0.035]} />
          <meshStandardMaterial
            color={lit ? (warm ? "#f6d98b" : "#b9e6ff") : color}
            emissive={lit ? (warm ? "#ffb52e" : "#5bb8ff") : "#000000"}
            emissiveIntensity={lit ? 0.75 : 0}
            roughness={0.35}
          />
        </mesh>,
      );
    }
  }

  return <>{nodes}</>;
}

function Building({
  tile,
  position,
  selected,
  onClick,
}: {
  tile: CityTile;
  position: [number, number, number];
  selected: boolean;
  onClick: () => void;
}) {
  const seed = Math.abs(Math.sin(position[0] * 12.7 + position[2] * 7.1));
  const level = Math.max(1, tile.level);
  const baseHeight =
    tile.kind === "residential"
      ? 3.4 + level * 1.5 + seed * 2
      : tile.kind === "commercial"
        ? 5.5 + level * 2.2 + seed * 4
        : 2.8 + level * 1.15 + seed * 1.5;

  const width = tile.kind === "industrial" ? 3.1 : 2.55 + seed * 0.45;
  const depth = tile.kind === "industrial" ? 2.8 : 2.55 + (1 - seed) * 0.35;

  const color =
    tile.kind === "residential"
      ? seed > 0.55
        ? "#d7b78b"
        : "#a9c4d5"
      : tile.kind === "commercial"
        ? seed > 0.5
          ? "#3d647d"
          : "#567f99"
        : "#8c7660";

  const roofColor =
    tile.kind === "residential"
      ? "#7b3f3f"
      : tile.kind === "commercial"
        ? "#182f45"
        : "#4f4b45";

  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <mesh castShadow receiveShadow position={[0, baseHeight / 2, 0]}>
        <boxGeometry args={[width, baseHeight, depth]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.08} />
        {selected && <Outlines thickness={0.09} color="#72d7ff" screenspace />}
      </mesh>

      {tile.kind !== "industrial" && (
        <>
          <Windows width={width} depth={depth} height={baseHeight} color={color} warm={tile.kind === "residential"} />
          <mesh castShadow position={[0, baseHeight + 0.12, 0]}>
            <boxGeometry args={[width * 1.03, 0.18, depth * 1.03]} />
            <meshStandardMaterial color={roofColor} roughness={0.8} />
          </mesh>
          {tile.kind === "residential" && (
            <mesh castShadow position={[0, baseHeight + 0.62, 0]}>
              <coneGeometry args={[width * 0.48, 0.95, 4]} />
              <meshStandardMaterial color="#6f3535" roughness={0.86} />
            </mesh>
          )}
        </>
      )}

      {tile.kind === "industrial" && (
        <>
          <mesh castShadow position={[0, baseHeight + 0.22, 0]}>
            <boxGeometry args={[width * 0.92, 0.35, depth * 0.92]} />
            <meshStandardMaterial color="#5d6267" metalness={0.45} roughness={0.55} />
          </mesh>
          <mesh castShadow position={[width * 0.25, baseHeight + 1.25, -depth * 0.12]}>
            <cylinderGeometry args={[0.22, 0.3, 2.3, 12]} />
            <meshStandardMaterial color="#6b7075" metalness={0.65} roughness={0.4} />
          </mesh>
        </>
      )}

      {tile.people > 0 && (
        <mesh position={[0, baseHeight + 0.12, 0]}>
          <boxGeometry args={[0.55, 0.035, 0.55]} />
          <meshStandardMaterial color="#6ee7b7" emissive="#2b8c68" emissiveIntensity={0.45} />
        </mesh>
      )}
    </group>
  );
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.11, 0.16, 1.5, 8]} />
        <meshStandardMaterial color="#65452f" roughness={1} />
      </mesh>
      <mesh castShadow position={[0, 1.8, 0]}>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial color="#2f8b54" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0.25, 2.25, 0.05]} scale={0.72}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial color="#43a861" roughness={0.88} />
      </mesh>
    </group>
  );
}

function Park({ position, seed }: { position: [number, number, number]; seed: number }) {
  return (
    <group position={position}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <planeGeometry args={[TILE * 0.92, TILE * 0.92]} />
        <meshStandardMaterial color="#3c9257" roughness={1} />
      </mesh>
      <mesh receiveShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[1.25, 0.08, 2.7]} />
        <meshStandardMaterial color="#cdbf92" roughness={1} />
      </mesh>
      <Tree position={[-1.15, 0, -0.85]} scale={0.68 + seed * 0.2} />
      <Tree position={[1.05, 0, 0.9]} scale={0.6 + seed * 0.22} />
      <Tree position={[0.95, 0, -0.95]} scale={0.5 + seed * 0.2} />
    </group>
  );
}

function WaterTile({ position, x, y }: { position: [number, number, number]; x: number; y: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = 0.045 + Math.sin(clock.elapsedTime * 0.9 + x * 0.8 + y) * 0.025;
    }
  });

  return (
    <group position={position}>
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[TILE, TILE, 2, 2]} />
        <meshStandardMaterial
          color="#287ca4"
          metalness={0.35}
          roughness={0.12}
          transparent
          opacity={0.92}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.09, 0]}>
        <planeGeometry args={[TILE * 0.8, 0.08]} />
        <meshStandardMaterial color="#a6e7f7" emissive="#4ba9c5" emissiveIntensity={0.35} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

function Landmark({ position, type }: { position: [number, number, number]; type: "power" | "water" }) {
  if (type === "water") {
    return (
      <group position={position}>
        <mesh castShadow position={[0, 2.4, 0]}>
          <cylinderGeometry args={[1.05, 1.25, 4.8, 24]} />
          <meshStandardMaterial color="#d6e1e6" roughness={0.38} metalness={0.3} />
        </mesh>
        <mesh castShadow position={[0, 4.9, 0]}>
          <cylinderGeometry args={[1.25, 0.95, 0.45, 24]} />
          <meshStandardMaterial color="#78aabf" roughness={0.45} metalness={0.2} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={position}>
      <mesh castShadow position={[0, 2, 0]}>
        <boxGeometry args={[2.7, 4, 2.7]} />
        <meshStandardMaterial color="#696b72" roughness={0.62} metalness={0.25} />
      </mesh>
      <mesh castShadow position={[0, 4.65, 0]}>
        <cylinderGeometry args={[0.85, 0.55, 1.3, 18]} />
        <meshStandardMaterial color="#c3c5c8" roughness={0.5} metalness={0.35} />
      </mesh>
      <mesh position={[0, 5.38, 0]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#ffbf47" emissive="#ff8a00" emissiveIntensity={3} />
      </mesh>
    </group>
  );
}

function Cars({ paused }: { paused: boolean }) {
  const cars = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        lane: i % 3,
        offset: i * 8.7,
        speed: 2.1 + (i % 4) * 0.38,
        vertical: i % 2 === 0,
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
  lane,
  offset,
  speed,
  vertical,
  paused,
}: {
  lane: number;
  offset: number;
  speed: number;
  vertical: boolean;
  paused: boolean;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!ref.current || paused) return;
    const t = (offset + performance.now() * 0.001 * speed * 5) % 96;
    if (vertical) {
      const x = [-16, 16, 48][lane] ?? -16;
      ref.current.position.set(x, 0.23, -44 + t);
      ref.current.rotation.y = Math.PI / 2;
    } else {
      const z = [-20, 4, 28][lane] ?? -20;
      ref.current.position.set(-54 + t, 0.23, z);
      ref.current.rotation.y = 0;
    }
    ref.current.position.y += delta * 0;
  });

  return (
    <group ref={ref}>
      <mesh castShadow>
        <boxGeometry args={[0.72, 0.34, 1.35]} />
        <meshStandardMaterial color={["#e85d5d", "#4e9eea", "#f2c84b", "#f1f1f1"][lane % 4]} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.11, 0.12]}>
        <boxGeometry args={[0.48, 0.15, 0.5]} />
        <meshStandardMaterial color="#9ed7e7" metalness={0.25} roughness={0.18} />
      </mesh>
      <mesh position={[0, 0.02, 0.68]}>
        <boxGeometry args={[0.42, 0.05, 0.035]} />
        <meshStandardMaterial color="#f8e6a4" emissive="#ffca54" emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

function CityWorld({
  map,
  selected,
  onTileClick,
  paused,
}: CitySceneProps) {
  const tiles = useMemo(() => {
    return map.map((tile, i) => {
      const x = i % CITY_W;
      const y = Math.floor(i / CITY_W);
      const position = worldPosition(i);
      const seed = hash(x, y);
      return { tile, i, x, y, position, seed };
    });
  }, [map]);

  return (
    <>
      <Sky distance={450000} sunPosition={[80, 55, 45]} turbidity={7} rayleigh={1.3} mieCoefficient={0.006} mieDirectionalG={0.8} />
      <ambientLight intensity={0.65} />
      <hemisphereLight args={["#c7e6ff", "#34513a", 0.9]} />
      <directionalLight
        castShadow
        position={[35, 60, 20]}
        intensity={3.4}
        color="#fff4dc"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
        shadow-bias={-0.00035}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.03, 0]}>
        <planeGeometry args={[CITY_W * TILE + 18, CITY_H * TILE + 18]} />
        <meshStandardMaterial color="#6a875f" roughness={1} />
      </mesh>

      <group>
        {tiles.map(({ tile, i, x, y, position, seed }) => (
          <group key={i}>
            {tile.kind === "road" && <Road x={x} y={y} />}
            {tile.kind === "residential" && (
              <Building tile={tile} position={position} selected={selected === i} onClick={() => onTileClick(i)} />
            )}
            {tile.kind === "commercial" && (
              <Building tile={tile} position={position} selected={selected === i} onClick={() => onTileClick(i)} />
            )}
            {tile.kind === "industrial" && (
              <Building tile={tile} position={position} selected={selected === i} onClick={() => onTileClick(i)} />
            )}
            {tile.kind === "park" && <Park position={position} seed={seed} />}
            {tile.kind === "power" && <Landmark position={position} type="power" />}
            {tile.kind === "water" && <WaterTile position={position} x={x} y={y} />}

            {tile.kind === "empty" && seed > 0.83 && (
              <Tree position={[position[0] + (seed - 0.5) * 1.2, 0, position[2] + (seed - 0.5) * 1.2]} scale={0.52 + seed * 0.22} />
            )}

            <mesh
              position={[position[0], 0.025, position[2]]}
              rotation={[-Math.PI / 2, 0, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onTileClick(i);
              }}
            >
              <planeGeometry args={[TILE * 0.96, TILE * 0.96]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          </group>
        ))}
      </group>

      <Cars paused={paused} />
    </>
  );
}

export function CityScene(props: CitySceneProps) {
  const controls = useRef<CameraControlsImpl | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      controls.current?.setLookAt(64, 54, 64, 0, 0, 0, true);
    }, 40);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [64, 54, 64], fov: 48, near: 0.1, far: 700 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <CameraControls
        ref={controls}
        makeDefault
        smoothTime={0.18}
        draggingSmoothTime={0.12}
        minDistance={24}
        maxDistance={155}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.15}
      />

      <CityWorld {...props} />

      <EffectComposer multisampling={4}>
        <Bloom luminanceThreshold={0.72} luminanceSmoothing={0.35} intensity={0.45} mipmapBlur />
        <Noise opacity={0.018} />
        <Vignette eskil={false} offset={0.16} darkness={0.72} />
      </EffectComposer>
    </Canvas>
  );
}

export const cityLabel: Record<Kind, string> = {
  empty: "Terreno",
  road: "Estrada",
  residential: "Residencial",
  commercial: "Comercial",
  industrial: "Industrial",
  park: "Parque",
  power: "Usina",
  water: "Água",
};
