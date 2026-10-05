// Localize only displayed text; simulation identifiers and saved games stay unchanged.
const entries = {
  'New Game': 'Novo jogo', 'Continue...': 'Continuar...', 'Load Map': 'Carregar mapa',
  'About': 'Sobre', 'BUILD': 'Construir', 'SERVICE': 'Serviços', 'PLAY': 'Jogar',
  'GENERATE': 'Gerar', 'DIFFICULTY': 'Dificuldade', 'MAP SIZE': 'Tamanho do mapa',
  'EASY': 'Fácil', 'MEDIUM': 'Médio', 'HARD': 'Difícil', 'SMALL': 'Pequeno', 'LARGE': 'Grande',
  'City Builder': 'Construção de cidades', 'Loading…': 'Carregando…',
  'Generating map…': 'Gerando mapa…', 'Loading Lut ...': 'Carregando cores...',
  'Loading envmap ...': 'Carregando ambiente...', 'Loading texture ...': 'Carregando texturas...',
  'Loading images ...': 'Carregando imagens...', 'Loading 3d models ...': 'Carregando modelos 3D...',
  'Budget': 'Orçamento', 'Eval': 'Avaliação', 'Orders': 'Leis', 'Economy': 'Economia',
  'Awards': 'Conquistas', 'History': 'Histórico', 'Overlay': 'Mapas', 'Overlays': 'Mapas',
  'Disaster': 'Desastres', 'Files': 'Arquivos', 'Save Load': 'Salvar / carregar',
  'Ordinances': 'Leis municipais', 'Date': 'Data', 'Population': 'População',
  'money': 'Dinheiro', 'Score': 'Pontuação', 'happiness': 'Felicidade', 'class': 'Categoria',
  'Village': 'Vila', 'Town': 'Povoado', 'City': 'Cidade', 'Capital': 'Capital',
  'Metropolis': 'Metrópole', 'Metropolos': 'Metrópole', 'Megalopolis': 'Megalópole',
  'Residential': 'Residencial', 'Commercial': 'Comercial', 'Industrial': 'Industrial',
  'Bulldozer': 'Demolir', 'Road': 'Estrada', 'Rail': 'Ferrovia', 'Wire': 'Rede elétrica',
  'Coal': 'Usina a carvão', 'Nuclear': 'Usina nuclear', 'Turbine': 'Turbina',
  'Park': 'Parque', 'Fire': 'Bombeiros', 'Police': 'Polícia', 'Hospital': 'Hospital',
  'School': 'Escola', 'Port': 'Porto', 'Stadium': 'Estádio', 'Airport': 'Aeroporto',
  'Query': 'Consultar', 'Drag view': 'Mover câmera', 'Get info': 'Consultar', 'Rotate view': 'Girar câmera',
  'None': 'Nenhum', 'Monster': 'Monstro', 'Flood': 'Inundação', 'Crash': 'Acidente aéreo',
  'Meltdown': 'Acidente nuclear', 'Tornado': 'Tornado', 'Earthquake': 'Terremoto',
  'Density': 'Densidade', 'Growth': 'Crescimento', 'Land value': 'Valor do terreno',
  'Crime Rate': 'Criminalidade', 'Pollution': 'Poluição', 'Traffic': 'Trânsito', 'Power Grid': 'Rede elétrica',
  'Residential Tax': 'Imposto residencial', 'Commercial Tax': 'Imposto comercial',
  'Industrial Tax': 'Imposto industrial', 'Roads': 'Estradas', 'Water': 'Água', 'Education': 'Educação',
  'Tax Rates': 'Alíquotas', 'Services': 'Serviços', 'Municipal Bonds': 'Empréstimos municipais',
  'Annual receipts:': 'Saldo anual:', 'Taxes collected:': 'Impostos arrecadados:',
  'Outstanding debt:': 'Dívida pendente:', 'Interest / yr:': 'Juros / ano:',
  '(7% annual)': '(7% ao ano)', 'LOCAL SAVE': 'Salvar no PC', 'SAVE': 'Salvar arquivo',
  'LOAD': 'Carregar', 'NEW MAP': 'Novo mapa', '✔ Auto-saved': '✔ Salvo automaticamente',
  'Save current city to localStorage': 'Salvar a cidade neste navegador',
  'Save current city to a JSON file': 'Baixar arquivo da cidade',
  'Load a previously saved city': 'Carregar uma cidade salva',
  'Create a new city on a freshly generated map': 'Criar uma cidade em um novo mapa',
  'Close (Esc)': 'Fechar (Esc)', 'Close window': 'Fechar janela', 'Progress:': 'Progresso:',
  'YES:': 'SIM:', 'NO:': 'NÃO:', 'WORST PROBLEMS': 'PRINCIPAIS PROBLEMAS',
  'CITY STATISTICS': 'ESTATÍSTICAS DA CIDADE', 'CITY WELL-BEING': 'BEM-ESTAR DA CIDADE',
  'COVERAGE & AMENITIES': 'COBERTURA E SERVIÇOS', 'ECONOMY FOCUS': 'PERFIL ECONÔMICO',
  'Crime': 'Criminalidade', 'Health': 'Saúde', 'Unemployment': 'Desemprego',
  'Happiness': 'Felicidade', 'Hospitals': 'Hospitais', 'Schools': 'Escolas',
  'Edu. Fund': 'Verba escolar', 'Parks': 'Parques', 'Mixed': 'Mista',
  'Poor': 'Ruim', 'Basic': 'Básico', 'Good': 'Bom', 'Excellent': 'Excelente',
  'Critical': 'Crítico', 'Fair': 'Regular', 'Public Opinion': 'Opinião pública',
  'Is the mayor doing a good job?': 'O prefeito está fazendo um bom trabalho?',
  'No events recorded yet': 'Nenhum evento registrado ainda',
  'Annual ordinance cost:': 'Custo anual das leis:', 'Cost:': 'Custo:',
  '/ year': '/ ano', 'No annual cost': 'Sem custo anual', '[Active]': '[Ativo]',
  "Choose your city's economic focus. Specializations affect tax yields, pollution, and city growth.": 'Perfil econômico da cidade',
  'Author': 'Autor', '3d with': '3D com', 'Simulation inspired by MicropolisJS': 'Simulação inspirada no MicropolisJS',
  'KEYBOARD SHORTCUTS': 'ATALHOS DO TECLADO', 'Save/Load': 'Salvar/carregar',
  'This panel': 'Sobre', 'Source Code on GitHub ↗': 'Código-fonte no GitHub ↗',
  'Feb': 'Fev', 'Apr': 'Abr', 'May': 'Mai', 'Aug': 'Ago', 'Sep': 'Set', 'Oct': 'Out', 'Dec': 'Dez',
  'Insufficient funds to build that': 'Dinheiro insuficiente para construir',
  'Area must be bulldozed first': 'É preciso demolir a área primeiro',
  'More residential zones needed': 'São necessárias mais zonas residenciais',
  'More commercial zones needed': 'São necessárias mais zonas comerciais',
  'More industrial zones needed': 'São necessárias mais zonas industriais',
  'Build a Power Plant': 'Construa uma usina elétrica',
  'Brownouts, build another Power Plant': 'Energia insuficiente: construa outra usina',
  'Blackouts reported. insufficient power capacity': 'Apagões: capacidade elétrica insuficiente',
  'Inadequate rail system': 'Sistema ferroviário insuficiente', 'More roads required': 'São necessárias mais estradas',
  'Citizens demand a Fire Department': 'Os moradores pedem um quartel de bombeiros',
  'Citizens demand a Police Department': 'Os moradores pedem uma delegacia',
  'Citizens demand a Hospital': 'Os moradores pedem um hospital',
  'Citizens demand more schools': 'Os moradores pedem mais escolas',
  'Commerce requires an Airport': 'O comércio precisa de um aeroporto',
  'Industry requires a Sea Port': 'A indústria precisa de um porto',
  'Residents demand a Stadium': 'Os moradores pedem um estádio',
  'Roads deteriorating, due to lack of funds': 'Estradas deterioradas por falta de verba',
  'Fire departments need funding': 'Os bombeiros precisam de verba',
  'Police departments need funding': 'A polícia precisa de verba',
  'Welcome to 3D City': 'Bem-vindo ao Skyline City', 'Welcome back to your 3D city': 'Bem-vindo de volta à sua cidade',
  'A new season has arrived': 'Uma nova estação chegou',
  'Annual bond interest payment deducted': 'Juros anuais do empréstimo descontados',
  'YOUR CITY HAS GONE BROKE': 'SUA CIDADE FICOU SEM DINHEIRO',
  'Citizens upset. The tax rate is too high': 'Moradores insatisfeitos: impostos muito altos',
  'Crime very high': 'Criminalidade muito alta', 'Pollution very high': 'Poluição muito alta',
  'Heavy Traffic reported': 'Trânsito intenso', 'Frequent traffic jams reported': 'Congestionamentos frequentes',
  'A helicopter crashed': 'Um helicóptero caiu', 'A plane has crashed': 'Um avião caiu',
  'A train crashed': 'Um trem sofreu um acidente', 'Shipwreck reported': 'Naufrágio registrado',
  'Major earthquake reported !!': 'Terremoto forte registrado!', 'Explosion detected': 'Explosão detectada',
  'Flooding reported !': 'Inundação registrada!', 'Fire reported': 'Incêndio registrado',
  'A Monster has been sighted !': 'Um monstro foi avistado!', 'Tornado reported !': 'Tornado registrado!',
  'A Nuclear Meltdown has occurred !!': 'Ocorreu um acidente nuclear!',
  'Heat wave! Increased fire risk': 'Onda de calor! Maior risco de incêndio',
  'Blizzard! Roads deteriorating faster': 'Nevasca! Estradas se deterioram mais rápido',
  'Education levels critically low': 'Nível de educação muito baixo',
  'Warning: high municipal debt burden': 'Atenção: dívida municipal elevada',
  'Population has reached': 'A população chegou a', 'Achievement Unlocked!': 'Conquista desbloqueada!',
  'Very High': 'Muito alto', 'High': 'Alto', 'Low': 'Baixo', 'Medium': 'Médio',
  'Lower Class': 'Classe baixa', 'Middle Class': 'Classe média', 'Upper Class': 'Classe alta',
  'Very Heavy': 'Muito intenso', 'Heavy': 'Intenso', 'Slow Growth': 'Crescimento lento', 'Fast Growth': 'Crescimento rápido',
  'Radioactive Waste': 'Resíduos radioativos', 'Coal Power': 'Usina a carvão',
  'Fire Department': 'Quartel de bombeiros', 'Police Department': 'Delegacia',
  'Nuclear Power': 'Usina nuclear', 'Draw Bridge': 'Ponte móvel', 'Radar Dish': 'Antena de radar',
  'Failed to load saved game.': 'Não foi possível carregar a cidade salva.',
  'Save data is corrupt or unreadable.': 'O arquivo salvo está corrompido ou ilegível.',
  'Simulation worker crashed': 'A simulação parou inesperadamente', 'Simulation error:': 'Erro na simulação:',
};

const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const dictionary = new Map(Object.entries(entries).map(([key, value]) => [key.toLowerCase(), value]));
const pattern = new RegExp(`(?<![\\p{L}])(?:${Object.keys(entries).sort((a, b) => b.length - a.length).map(escape).join('|')})(?![\\p{L}])`, 'giu');
export const translate = value => value.replace(pattern, match => dictionary.get(match.toLowerCase()) ?? match)
  .replace(/% of /g, '% de ').replace(/Issue \$([\d,]+) bond \(7% interest\/yr\)/g, 'Empréstimo de $$ $1 (7% de juros/ano)');

export function localizeGame() {
  const hub = document.getElementById('hub');
  if (!hub) return;
  const update = node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const before = node.nodeValue ?? '';
      const after = translate(before);
      if (after !== before) node.nodeValue = after;
      return;
    }
    if (!(node instanceof Element)) return;
    for (const attribute of ['title', 'aria-label', 'placeholder']) {
      const value = node.getAttribute(attribute);
      if (value) {
        const translated = translate(value);
        if (value !== translated) node.setAttribute(attribute, translated);
      }
    }
    node.childNodes.forEach(update);
  };
  update(hub);
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'childList') record.addedNodes.forEach(update);
      else update(record.target);
    }
  }).observe(hub, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['title', 'aria-label', 'placeholder'] });
}