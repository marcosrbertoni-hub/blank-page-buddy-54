import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Building2, Factory, Home, MapPin, Pause, Play, RotateCcw, Trash2, Trees, Waves, Zap } from "lucide-react";

type Kind="empty"|"road"|"residential"|"commercial"|"industrial"|"park"|"power"|"water";
type Tile={kind:Kind;level:number;people:number};
const W=24,H=16,COST={road:80,residential:500,commercial:900,industrial:750,park:350,power:1200,water:1000};
const NAME:Record<Kind,string>={empty:"Terreno",road:"Rua",residential:"Residencial",commercial:"Comercial",industrial:"Industrial",park:"Parque",power:"Energia",water:"Água"};
const ICON:Record<Kind,string>={empty:"",road:"🛣️",residential:"🏠",commercial:"🏪",industrial:"🏭",park:"🌳",power:"⚡",water:"💧"};
const blank=()=>Array.from({length:W*H},()=>({kind:"empty" as Kind,level:0,people:0}));
const start=()=>{const a=blank();for(let y=7;y<9;y++)for(let x=2;x<W-2;x++)a[y*W+x]={kind:"road",level:1,people:0};return a};

export const Route=createFileRoute("/")({head:()=>({meta:[{title:"Egregoria Web City"},{name:"description",content:"City builder jogável no navegador"}]}),component:Game});

function Game(){
 const [map,setMap]=useState(start),[tool,setTool]=useState<Kind>("road"),[money,setMoney]=useState(50000),[pop,setPop]=useState(0),[happy,setHappy]=useState(65),[month,setMonth]=useState(1),[pause,setPause]=useState(false),[speed,setSpeed]=useState(1),[selected,setSelected]=useState<number|null>(null);
 const stats=useMemo(()=>{const n=(k:Kind)=>map.filter(t=>t.kind===k).length;return{road:n("road"),res:n("residential"),com:n("commercial"),ind:n("industrial"),park:n("park"),power:n("power"),water:n("water")}},[map]);
 useEffect(()=>{if(pause)return;const id=setInterval(()=>{setMonth(m=>m+1);setMap(old=>{const a=old.map(x=>({...x}));let grow=0;a.forEach((t,i)=>{const x=i%W,y=Math.floor(i/W);const near=[[x-1,y],[x+1,y],[x,y-1],[x,y+1]].some(([nx,ny])=>nx>=0&&nx<W&&ny>=0&&ny<H&&a[ny*W+nx].kind==="road");if(t.kind==="residential"&&near&&(stats.com+stats.ind)>0){const g=Math.min(8,2+t.level*2);t.people=Math.min(120,t.people+g);t.level=Math.min(4,t.level+(t.people>60?1:0));grow+=g}});if(grow)setPop(p=>p+grow);setMoney(m=>m+stats.res*18+stats.com*35+stats.ind*42-stats.road*2-stats.park*5-stats.power*18-stats.water*12);setHappy(h=>Math.max(25,Math.min(95,Math.round(h*.8+(55+stats.park*3+stats.water*2-stats.ind)*.2))));return a})},4000/speed);return()=>clearInterval(id)},[pause,speed,stats]);
 const build=(i:number)=>{setSelected(i);if(tool==="empty")return;if(map[i].kind!=="empty")return;const c=COST[tool as keyof typeof COST];if(money<c)return;setMoney(m=>m-c);setMap(a=>a.map((t,n)=>n===i?{kind:tool,level:1,people:0}:t))};
 const demolish=()=>{if(selected===null||map[selected].kind==="empty")return;const k=map[selected].kind;setMap(a=>a.map((t,n)=>n===selected?{kind:"empty",level:0,people:0}:t));setMoney(m=>m+Math.floor((COST[k as keyof typeof COST]||0)/4))};
 const reset=()=>{setMap(start());setMoney(50000);setPop(0);setHappy(65);setMonth(1);setSelected(null);setPause(false)};
 const button=(k:Kind,icon:ReactNode)=><button className={tool===k?"tool active":"tool"} onClick={()=>setTool(k)}>{icon}<span>{NAME[k]}</span>{k!=="empty"&&<b>${COST[k as keyof typeof COST]}</b>}</button>;
 return <main className="city-game">
  <header className="topbar"><div className="brand"><div className="brand-mark">🏙️</div><div><strong>EGREGORIA WEB</strong><small>City Builder</small></div></div>
   <div className="stats"><div><small>ORÇAMENTO</small><strong>${money.toLocaleString("pt-BR")}</strong></div><div><small>POPULAÇÃO</small><strong>{pop.toLocaleString("pt-BR")}</strong></div><div><small>FELICIDADE</small><strong>{happy}%</strong></div><div><small>MÊS</small><strong>{month}</strong></div></div>
   <div className="controls"><button onClick={()=>setPause(x=>!x)}>{pause?<Play size={18}/>:<Pause size={18}/>}</button><button onClick={()=>setSpeed(x=>x===3?1:x+1)}>x{speed}</button><button onClick={reset}><RotateCcw size={18}/></button></div>
  </header>
  <section className="game-layout"><aside className="sidebar"><h3>CONSTRUIR</h3>{button("road",<MapPin size={18}/>)}{button("residential",<Home size={18}/>)}{button("commercial",<Building2 size={18}/>)}{button("industrial",<Factory size={18}/>)}{button("park",<Trees size={18}/>)}{button("power",<Zap size={18}/>)}{button("water",<Waves size={18}/>)}
   <button className="tool danger" onClick={demolish}><Trash2 size={18}/><span>Demolir</span></button><div className="city-panel"><h3>CIDADE</h3>{Object.entries({Ruas:stats.road,Residências:stats.res,Comércio:stats.com,Indústrias:stats.ind,Parques:stats.park,Energia:stats.power,Água:stats.water}).map(([k,v])=><p key={k}><span>{k}</span><b>{v}</b></p>)}</div><p className="hint">Construa ruas, zonas e serviços. Zonas residenciais crescem quando têm acesso às ruas e empregos.</p>
  </aside><div className="world-wrap"><div className="world"><div className="terrain">{map.map((t,i)=><button key={i} onClick={()=>build(i)} className={`tile ${t.kind} ${selected===i?"selected":""}`}><span>{ICON[t.kind]}</span>{t.people>0&&<em>{t.people}</em>}</button>)}</div><div className="world-caption"><span>Ferramenta: <b>{NAME[tool]}</b></span><span>{pause?"⏸ PAUSADO":"● SIMULAÇÃO ATIVA"}</span></div></div>{selected!==null&&<div className="inspect"><b>{NAME[map[selected].kind]}</b><span>Nível {map[selected].level}</span>{map[selected].people>0&&<span>{map[selected].people} habitantes</span>}<button onClick={demolish}>Demolir</button></div>}</div></section>
 </main>;
}