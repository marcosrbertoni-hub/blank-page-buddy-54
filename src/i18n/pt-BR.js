/**
 * Portuguese (Brazil) UI translation layer.
 * Translates dynamically-created HUD/menu text without touching simulation logic.
 */
const REPLACEMENTS = [
  ['A city builder in your browser','Construtor de cidades no navegador'],
  ['Draw one road across empty land, and a city grows along it — traffic, districts, skyline and all.','Desenhe uma estrada pelo terreno vazio e a cidade crescerá ao redor dela — trânsito, bairros, skyline e tudo mais.'],
  ['Controls','Controles'],
  ['Everything you need','Tudo o que você precisa'],
  ['Pan across the map','Mover pelo mapa'],
  ['Rotate and tilt the camera','Girar e inclinar a câmera'],
  ['Zoom in and out','Aumentar e diminuir o zoom'],
  ['Roads · Zoning · Services · Bulldoze','Estradas · Zoneamento · Serviços · Demolição'],
  ['Cancel the current tool','Cancelar a ferramenta atual'],
  ['Start here','Comece aqui'],
  ['Pick the road tool, click a start and an end point on the ground — then zone beside it. Nothing else can be built until a road exists.','Escolha a ferramenta de estrada, clique no ponto inicial e final no terreno — depois faça o zoneamento ao lado. Nada mais pode ser construído antes de existir uma estrada.'],
  ['Start a world','Começar um mundo'],
  ['Step 1 of 1','Etapa 1 de 1'],
  ['City name','Nome da cidade'],
  ['Map seed','Semente do mapa'],
  ['Roll a new seed','Sortear uma nova semente'],
  ['Roll a new map seed','Sortear uma nova semente do mapa'],
  ['Graphics quality','Qualidade gráfica'],
  ['Fastest. No ambient occlusion, no reflections.','Mais rápido. Sem oclusão de ambiente e sem reflexos.'],
  ['For laptops and integrated graphics.','Para notebooks e gráficos integrados.'],
  ['Recommended. Soft shadows, AO, water reflections.','Recomendado. Sombras suaves, AO e reflexos na água.'],
  ['4K shadows and the longest draw distance.','Sombras 4K e maior distância de renderização.'],
  ['New city','Nova cidade'],
  ['Empty land generated from your seed. You lay the first road.','Terreno vazio gerado pela sua semente. Você constrói a primeira estrada.'],
  ['Grown city','Cidade pronta'],
  ['Load demo city','Carregar cidade de demonstração'],
  ['Thousands of residents, live traffic and services. Good for a look around.','Milhares de habitantes, trânsito ativo e serviços. Ideal para conhecer o jogo.'],
  ['Building your world','Construindo seu mundo'],
  ['Preparing','Preparando'],
  ['Applying quality…','Aplicando qualidade…'],
  ['Ready','Pronto'],
  ['Loading roads','Carregando estradas'],
  ['Loading terrain','Carregando terreno'],
  ['Loading environment','Carregando ambiente'],
  ['Loading zoning','Carregando zoneamento'],
  ['Loading buildings','Carregando edifícios'],
  ['Loading props','Carregando objetos urbanos'],
  ['Loading traffic','Carregando trânsito'],
  ['Loading effects','Carregando efeitos'],
  ['Loading simulation','Carregando simulação'],
  ['Loading tools','Carregando ferramentas'],
  ['Loading ui','Carregando interface'],
  ['Loading audio','Carregando áudio'],
  ['Building city','Construindo cidade'],
  ['Waking the city','Ativando a cidade'],
  ['Shaping the land','Preparando o terreno'],
  ['Demo city','Cidade de demonstração'],
  ['Empty map','Mapa vazio'],
  ['Residential demand','Demanda residencial'],
  ['Commercial demand','Demanda comercial'],
  ['Industrial demand','Demanda industrial'],
  ['Office demand','Demanda de escritórios'],
  ['People want to move in — zone more housing.','As pessoas querem morar aqui — faça mais zoneamento residencial.'],
  ['Shops wanted — zone commercial near homes.','Há demanda por comércio — faça zoneamento comercial perto das casas.'],
  ['Factories wanted — jobs for uneducated workers.','Há demanda por indústrias — elas geram empregos.'],
  ['Offices wanted — jobs for educated citizens.','Há demanda por escritórios — eles geram empregos qualificados.'],
  ['Roads','Estradas'],
  ['Zoning','Zoneamento'],
  ['Services','Serviços'],
  ['Bulldoze','Demolição'],
  ['Info Views','Informações'],
  ['Two-lane roads, avenues, highways and paths.','Estradas de duas faixas, avenidas, rodovias e caminhos.'],
  ['Paint zones next to roads. Buildings grow where there is demand.','Marque zonas ao lado das estradas. Os edifícios crescem onde há demanda.'],
  ['Power, water, safety, health and education buildings.','Energia, água, segurança, saúde e educação.'],
  ['Demolish roads, buildings and zoning. Refunds 50 % of build cost.','Demolir estradas, edifícios e zonas. Devolve 50% do custo de construção.'],
  ['Overlay city data: traffic, land value, pollution, happiness…','Exibir dados da cidade: trânsito, valor do terreno, poluição, felicidade…'],
  ['Two-Lane Road','Estrada de duas faixas'],
  ['Four-Lane Avenue','Avenida de quatro faixas'],
  ['Highway','Rodovia'],
  ['Pedestrian Path','Caminho para pedestres'],
  ['Low Density Residential','Residencial de baixa densidade'],
  ['High Density Residential','Residencial de alta densidade'],
  ['Low Density Commercial','Comercial de baixa densidade'],
  ['High Density Commercial','Comercial de alta densidade'],
  ['Industrial','Industrial'],
  ['Office','Escritórios'],
  ['Coal Power Plant','Usina termelétrica'],
  ['Water Tower','Torre de água'],
  ['Sewage Treatment','Tratamento de esgoto'],
  ['Landfill','Aterro sanitário'],
  ['Police','Polícia'],
  ['Fire','Bombeiros'],
  ['Medical Clinic','Clínica médica'],
  ['Elementary School','Escola fundamental'],
  ['Traffic Flow','Fluxo de trânsito'],
  ['Land Value','Valor do terreno'],
  ['Pollution','Poluição'],
  ['Happiness','Felicidade'],
  ['Electricity','Eletricidade'],
  ['Water & Sewage','Água e esgoto'],
  ['Low','Baixo'],
  ['High','Alto'],
  ['Clean','Limpo'],
  ['Toxic','Tóxico'],
  ['Unhappy','Infeliz'],
  ['Delighted','Muito feliz'],
  ['No power','Sem energia'],
  ['Powered','Com energia'],
  ['Dry','Seco'],
  ['Served','Atendido'],
  ['Free','Grátis'],
  ['Overlay','Sobreposição'],
  ['Active tool','Ferramenta ativa'],
  ['Click (or press Esc) to return to the selection tool.','Clique (ou pressione Esc) para voltar à ferramenta de seleção.'],
  ['Pan','Mover'],
  ['Zoom','Zoom'],
  ['Pause','Pausar'],
  ['All shortcuts','Todos os atalhos'],
  ['Camera','Câmera'],
  ['Tools','Ferramentas'],
  ['Simulation','Simulação'],
  ['Interface','Interface'],
  ['Rotate left / right','Girar para esquerda / direita'],
  ['Tilt up / down','Inclinar para cima / baixo'],
  ['Zoom towards the cursor','Zoom em direção ao cursor'],
  ['Orbit','Orbitar'],
  ['Grab-the-ground pan','Mover segurando o terreno'],
  ['Reset the view','Restaurar a visão'],
  ['Cancel tool / close panel','Cancelar ferramenta / fechar painel'],
  ['Cycle items in the open sub-menu','Alternar itens do submenu aberto'],
  ['Pause / resume','Pausar / continuar'],
  ['Faster / slower','Mais rápido / mais lento'],
  ['Speed steps 1 · 2 · 3','Velocidades 1 · 2 · 3'],
  ['Hide / show the HUD (cinematic)','Ocultar / mostrar HUD (cinemático)'],
  ['Settings','Configurações'],
  ['Notifications','Notificações'],
  ['This shortcut list','Lista de atalhos'],
  ['Upkeep','Manutenção'],
  ['Capacity','Capacidade'],
  ['Pedestrians only','Somente pedestres'],
  ['Refunds 50 %','Devolve 50%'],
  ['50 % refund','Devolução de 50%'],
  ['Next','Próximo'],
  ['Demand','Demanda'],
  ['People want to move in','As pessoas querem morar aqui'],
  ['jobs for educated citizens','empregos para cidadãos qualificados'],
  ['Quiet streets, families with cars.','Ruas tranquilas, famílias com carros.'],
  ['Apartment blocks. Dense housing, needs good transit and services.','Prédios residenciais. Moradia densa, exige bom transporte e serviços.'],
  ['Corner shops, cafés and small stores serving the neighbourhood.','Lojas, cafés e pequenos comércios que atendem o bairro.'],
  ['Malls, hotels and downtown retail. Big traffic, big tax income.','Shoppings, hotéis e comércio central. Muito trânsito e arrecadação de impostos.'],
  ['Factories and warehouses. Jobs for uneducated workers; pollutes.','Fábricas e armazéns. Geram empregos, mas causam poluição.'],
  ['Clean high-tech jobs for educated citizens. No pollution.','Empregos de alta tecnologia para cidadãos qualificados. Sem poluição.'],
  ['new city','nova cidade'],
  ['New Skyline','Nova Skyline'],
];
const ORDERED = [...REPLACEMENTS].sort((a,b)=>b[0].length-a[0].length);

function translate(value) {
  let out = String(value);
  for (const [from,to] of ORDERED) out = out.split(from).join(to);
  return out;
}

function translateNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const next = translate(node.nodeValue);
    if (next !== node.nodeValue) node.nodeValue = next;
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  for (const attr of ['aria-label','title','placeholder','alt']) {
    if (node.hasAttribute(attr)) {
      const next = translate(node.getAttribute(attr));
      if (next !== node.getAttribute(attr)) node.setAttribute(attr,next);
    }
  }
  if (node.matches('script,style')) return;
  for (const child of node.childNodes) translateNode(child);
}

export function installPortuguese() {
  document.documentElement.lang = 'pt-BR';
  translateNode(document.body);
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'characterData') translateNode(m.target);
      else for (const n of m.addedNodes) translateNode(n);
    }
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  return () => observer.disconnect();
}
