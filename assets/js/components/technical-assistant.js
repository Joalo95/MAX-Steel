const KNOWLEDGE_URL = new URL('../../data/technical-knowledge.txt', import.meta.url);
const STOP_WORDS = new Set([
  'a', 'al', 'algo', 'algun', 'alguna', 'algunas', 'algunos', 'como', 'con', 'cual',
  'cuale', 'cuales', 'cuando', 'cuanto', 'cuantos', 'de', 'del', 'desde', 'donde', 'el', 'ella', 'ellas', 'ellos', 'en',
  'es', 'esa', 'ese', 'eso', 'esta', 'este', 'esto', 'hay', 'la', 'las', 'lo',
  'los', 'mas', 'me', 'mi', 'mis', 'mucho', 'para', 'pero', 'por', 'que', 'se',
  'segun', 'si', 'sin', 'sobre', 'su', 'sus', 'te', 'tiene', 'tienen', 'un',
  'una', 'unas', 'uno', 'unos', 'y', 'yo', 'puede', 'pueden', 'quiero', 'saber',
  'decir', 'indicar', 'explicar', 'informacion', 'usa', 'usan', 'usar', 'uso',
  'utiliza', 'utilizan', 'utilizar', 'van', 'mide', 'miden',
  'tipo', 'son', 'seria', 'm', 'mm', 'cm', 'm2'
]);
const SYNONYM_GROUPS = [
  ['steel', 'framing', 'acero', 'steel framing'],
  ['montante', 'montantes', 'perfil', 'perfiles', 'pgc'],
  ['solera', 'soleras', 'pgu'],
  ['muro', 'muros', 'pared', 'paredes'],
  ['aislacion', 'aislante', 'aislamiento', 'lana'],
  ['entrepiso', 'forjado', 'piso', 'entreplanta'],
  ['platea', 'base', 'fundacion', 'cimentacion'],
  ['anclaje', 'anclajes', 'fijacion', 'fijaciones'],
  ['osb', 'fenolico', 'tablero'],
  ['techo', 'cubierta'],
  ['montaje', 'armado', 'montar', 'armar'],
  ['tornillo', 'tornilleria'],
  ['ceramico', 'ceramica'],
  ['medida', 'dimension', 'tamano', 'medir'],
  ['peso', 'pesa', 'pesado', 'pesar', 'kilogramo', 'kg'],
  ['modelo', 'vivienda', 'casa', 'modulo'],
  ['distancia', 'separacion', 'intereje', 'espaciamiento']
];
const MODELS = [
  {
    key: 'mono',
    name: 'Monoambiente de 25 m²',
    area: 25,
    length: 7.66,
    width: 3.26,
    rooms: [
      { label: 'ambiente principal (cocina-estar-dormitorio)', names: ['cocina-estar-dormitorio', 'ambiente principal', 'estar', 'dormitorio', 'habitacion'], length: 5.83, width: 2.98 },
      { label: 'baño', names: ['bano', 'baño'], length: 1.44, width: 2.98 }
    ]
  },
  {
    key: 'd1',
    name: 'Modelo de 1 dormitorio y 45 m²',
    area: 45,
    length: 10.45,
    width: 4.46,
    rooms: [
      { label: 'cocina-estar-comedor', names: ['cocina-estar-comedor', 'estar-comedor', 'cocina', 'estar', 'comedor'], length: 5.83, width: 3.84 },
      { label: 'dormitorio', names: ['dormitorio', 'habitacion'], length: 4.23, width: 2.64 },
      { label: 'baño', names: ['bano', 'baño'], length: 3.02, width: 1.42 }
    ]
  },
  {
    key: 'd2',
    name: 'Modelo de 2 dormitorios y 65 m²',
    area: 65,
    length: 12.06,
    width: 6.06,
    rooms: [
      { label: 'cocina-comedor-estar', names: ['cocina-comedor-estar', 'estar-comedor', 'cocina', 'estar', 'comedor'], length: 6.31, width: 5.08 },
      { label: 'dormitorio 1', names: ['dormitorio 1', 'habitacion 1', 'primer dormitorio', 'primera habitacion'], length: 3.85, width: 2.68 },
      { label: 'dormitorio 2', names: ['dormitorio 2', 'habitacion 2', 'segundo dormitorio', 'segunda habitacion'], length: 3.85, width: 2.65 },
      { label: 'dormitorio 1', names: ['dormitorio', 'habitacion'], length: 3.85, width: 2.68 },
      { label: 'baño', names: ['bano', 'baño'], length: 1.48, width: 2.68 }
    ]
  }
];
const ASSEMBLY_WEIGHTS = [
  { names: ['muro defs piedra', 'muro defs con piedra'], weight: 61, label: 'muro DEFS con piedra' },
  { names: ['muro eifs piedra', 'muro eifs con piedra'], weight: 50, label: 'muro EIFS con piedra' },
  { names: ['muro defs', 'muro cementicio'], weight: 42, label: 'muro DEFS cementicio' },
  { names: ['muro siding', 'siding'], weight: 35, label: 'muro con siding de fibrocemento' },
  { names: ['muro eifs', 'eifs'], weight: 31, label: 'muro EIFS cementicio' },
  { names: ['entrepiso humedo', 'entrepiso húmedo'], weight: 69, label: 'entrepiso húmedo' },
  { names: ['entrepiso ceramico', 'entrepiso cerámico', 'piso ceramico', 'piso cerámico'], weight: 51, label: 'entrepiso seco con terminación cerámica (sin contar el cerámico)' },
  { names: ['entrepiso madera', 'piso madera'], weight: 39, label: 'entrepiso seco con terminación de madera (sin contar el piso)' },
  { names: ['techo chapa', 'chapa acanalada'], weight: 35, label: 'techo inclinado con chapa BC35' },
  { names: ['techo teja', 'teja asfaltica', 'teja asfáltica'], weight: 27, label: 'techo inclinado con teja asfáltica' },
  { names: ['techo plano', 'membrana asfaltica', 'membrana asfáltica'], weight: 36, label: 'techo plano con membrana asfáltica' },
  { names: ['techo humedo', 'techo húmedo'], weight: 70, label: 'techo húmedo con membrana asfáltica' }
];
const SYNONYMS = new Map();
const DIMENSION_INTENT = /\b(medidas?|dimensiones?|mide|miden|ancho|largo|superficie|area|metros cuadrados|m2)\b/;

for (const group of SYNONYM_GROUPS) {
  const normalized = group.map(normalizeWord);
  for (const word of normalized) SYNONYMS.set(word, normalized);
}

function normalizeWord(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function termsIn(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .match(/[a-z0-9]+/g)
    ?.map(normalizeWord)
    .map(term => term.length > 5 && term.endsWith('es')
      ? term.slice(0, -2)
      : term.length > 3 && term.endsWith('s') ? term.slice(0, -1) : term)
    .filter(term => term.length > 1 && !STOP_WORDS.has(term)) || [];
}

export function parseTechnicalKnowledge(text) {
  return text.trim().split(/\r?\n(?=## )/).map(section => {
    const lines = section.split(/\r?\n/);
    const title = lines[0].replace(/^##\s*/, '').trim();
    const sourceIndex = lines.findIndex(line => line.startsWith('Fuente:'));
    if (!title || sourceIndex < 0) return null;
    return {
      title,
      source: lines[sourceIndex].replace(/^Fuente:\s*/, '').trim(),
      content: lines.slice(sourceIndex + 1).join(' ').trim()
    };
  }).filter(Boolean);
}

export function searchTechnicalKnowledge(question, entries) {
  const queryTerms = [...new Set(termsIn(question))];
  if (!queryTerms.length) return null;

  const ranked = entries.map(entry => {
    const titleTerms = new Set(termsIn(entry.title));
    const contentTerms = new Set(termsIn(entry.content));
    let score = 0;
    let matched = 0;

    for (const term of queryTerms) {
      const equivalents = SYNONYMS.get(term) || [term];
      if (equivalents.some(equivalent => titleTerms.has(equivalent))) {
        score += 3;
        matched += 1;
      } else if (equivalents.some(equivalent => contentTerms.has(equivalent))) {
        score += 1;
        matched += 1;
      }
    }

    return { entry, score, matched };
  }).sort((a, b) => b.score - a.score || b.matched - a.matched);

  const best = ranked[0];
  const requiredMatches = queryTerms.length > 2 ? 2 : 1;
  if (!best || best.matched < requiredMatches || best.score < 1) return null;
  return best.entry;
}

function normalizeText(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/²/g, '2')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function formatNumber(value) {
  return new Intl.NumberFormat('es-UY', { maximumFractionDigits: 2 }).format(value);
}

function findModel(question) {
  const text = normalizeText(question);
  if (/\b(monoambiente|mono)\b/.test(text)) return MODELS[0];
  if (/\b(2|dos)\s*(dormitorio|habitacion)|\b65\b/.test(text)) return MODELS[2];
  if (/\b(1|un|una)\s*(dormitorio|habitacion)|\b45\b/.test(text)) return MODELS[1];
  return null;
}

function findRoom(question, model) {
  const text = normalizeText(question).replace(
    /\b(?:modelo|casa|vivienda|modulo)\s+(?:de\s+)?(?:1|un|una|2|dos)\s+(?:dormitorio|habitacion)s?\b/g,
    ''
  );
  const roomQuery = /\b(bano|habitacion|dormitorio|cocina|estar|comedor|ambiente)\b/.test(text);
  if (!roomQuery) return [];
  const namedRooms = model.rooms.filter(room => room.names.some(name => text.includes(normalizeText(name))));
  if (model.key === 'd2' && namedRooms.some(room => room.names.includes('dormitorio 2') || room.names.includes('habitacion 2'))) {
    return [model.rooms[2]];
  }
  if (namedRooms.length) return namedRooms;
  return model.rooms.filter(room => room.names.includes('dormitorio') || room.names.includes('habitacion'));
}

function roomDimensions(room) {
  return `${formatNumber(room.length)} × ${formatNumber(room.width)} m`;
}

function roomArea(room) {
  return room.length * room.width;
}

function calculateRoomAnswer(question, model) {
  const text = normalizeText(question);
  const isDimensionQuestion = DIMENSION_INTENT.test(text);
  if (!isDimensionQuestion) return null;

  const rooms = findRoom(question, model);
  const asksArea = /\b(area|superficie|metros cuadrados|m2)\b/.test(text);
  if (rooms.length) {
    const details = rooms.map(room => {
      const label = room.label;
      const area = `${formatNumber(roomArea(room))} m²`;
      return asksArea
        ? `${label}: ${area} (${roomDimensions(room)})`
        : `${label}: ${roomDimensions(room)}; superficie aproximada ${area}`;
    });
    return {
      text: `${model.name} — ${details.join('; ')}. La superficie se calcula como largo × ancho.`,
      source: 'Fichas de modelos publicadas en modular-steel.html.'
    };
  }

  const footprint = model.length * model.width;
  return {
    text: `${model.name}: dimensiones generales ${roomDimensions({ length: model.length, width: model.width })}; superficie publicada ${model.area} m² (huella geométrica aproximada: ${formatNumber(footprint)} m²). La huella es el producto de las dimensiones exteriores; puede no coincidir con la superficie útil publicada porque son medidas con criterios distintos.`,
    source: 'Fichas de modelos publicadas en modular-steel.html.'
  };
}

function requestedArea(question) {
  const match = normalizeText(question).match(/(\d+(?:[.,]\d+)?)\s*(?:m2|metros?\s+cuadrados?)/);
  return match ? Number(match[1].replace(',', '.')) : null;
}

function calculateWeightAnswer(question, model) {
  const text = normalizeText(question);
  if (!/\b(peso|pesa|pesan|pesar|kg|kilogramo|kilogramos)\b/.test(text)) return null;

  const assembly = ASSEMBLY_WEIGHTS.find(item => item.names.some(name => text.includes(normalizeText(name))));
  const area = requestedArea(question);
  if (assembly && area && area > 0) {
    const weight = area * assembly.weight;
    return {
      text: `Estimación para ${formatNumber(area)} m² de ${assembly.label}: ${formatNumber(area)} × ${assembly.weight} kg/m² = aproximadamente ${formatNumber(weight)} kg. Es el peso superficial publicado del ensamblaje; no incluye elementos que la ficha excluye ni sustituye un cálculo del proyecto.`,
      source: 'Manual Tipos de muros, páginas 2–18; valores de referencia de ensamblajes.'
    };
  }
  if (assembly) {
    return {
      text: `El valor publicado para ${assembly.label} es ${assembly.weight} kg/m². Indícame la superficie en m² y calculo el peso estimado de ese ensamblaje.`,
      source: 'Manual Tipos de muros, páginas 2–18.'
    };
  }
  if (/\b(perfil|pgc)\b/.test(text)) {
    const length = normalizeText(question).match(/(\d+(?:[.,]\d+)?)\s*(?:m|metro|metros)\b/);
    if (length) {
      const meters = Number(length[1].replace(',', '.'));
      return {
        text: `Con el peso lineal publicado de 1,33 kg/m, ${formatNumber(meters)} m de perfil equivalen a aproximadamente ${formatNumber(meters * 1.33)} kg. El peso real depende del perfil especificado.`,
        source: 'Sección El perfil de modular-steel.html.'
      };
    }
  }
  if (model || /\b(modulo|vivienda|casa|monoambiente)\b/.test(text)) {
    return {
      text: 'La documentación disponible no especifica el peso total de la vivienda completa. Sí puedo estimar componentes si me das su superficie y tipo, por ejemplo: “¿cuánto pesan 20 m² de muro siding?” o “15 m² de entrepiso cerámico”. Los valores kg/m² son de ensamblajes específicos y no deben sumarse como si fueran el peso total de la casa.',
      source: 'Manuales técnicos y datos publicados en el sitio.'
    };
  }
  return null;
}

export function calculateFromTechnicalData(question) {
  const model = findModel(question);
  const text = normalizeText(question);
  const weightAnswer = calculateWeightAnswer(question, model);
  if (weightAnswer) return weightAnswer;
  if (model) return calculateRoomAnswer(question, model);
  if (DIMENSION_INTENT.test(text)
    && /\b(bano|habitacion|dormitorio|cocina|estar|comedor|ambiente)\b/.test(text)) {
    return {
      text: 'Las dimensiones de cada ambiente dependen del modelo. Indícame cuál te interesa: monoambiente de 25 m², 1 dormitorio de 45 m² o 2 dormitorios de 65 m².',
      source: 'Fichas de modelos publicadas en modular-steel.html.'
    };
  }
  if (/\b(peso|pesa|pesan|pesar|kg|kilogramo|kilogramos)\b/.test(text)) {
    const assembly = ASSEMBLY_WEIGHTS.find(item => item.names.some(name => text.includes(normalizeText(name))));
    if (assembly) return calculateWeightAnswer(question, null);
  }
  return null;
}

export function initializeTechnicalAssistant() {
  const toggle = document.getElementById('assistant-toggle');
  const additionalToggles = [...document.querySelectorAll('[data-assistant-open]')];
  const panel = document.getElementById('technical-assistant');
  const close = document.getElementById('assistant-close');
  const form = document.getElementById('assistant-form');
  const submitButton = form?.querySelector('button[type="submit"]');
  const input = document.getElementById('assistant-question');
  const messages = document.getElementById('assistant-messages');
  if (!toggle || !panel || !close || !form || !submitButton || !input || !messages) return;

  let knowledgePromise;
  let activeToggle = toggle;
  const setOpen = open => {
    panel.hidden = !open;
    [toggle, ...additionalToggles].forEach(button => button.setAttribute('aria-expanded', String(open)));
    if (open) input.focus();
    else {
      const visibleToggle = [activeToggle, ...additionalToggles, toggle]
        .find(button => button.getClientRects().length > 0);
      visibleToggle?.focus();
    }
  };
  const addMessage = (text, kind, source) => {
    const message = document.createElement('p');
    message.className = `assistant-message assistant-message--${kind}`;
    message.textContent = text;
    if (source) {
      const citation = document.createElement('span');
      citation.className = 'assistant-source';
      citation.textContent = `Fuente: ${source}`;
      message.appendChild(citation);
    }
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
    return message;
  };
  const askQuestion = question => {
    input.value = question;
    form.requestSubmit();
  };
  const loadKnowledge = () => {
    if (!knowledgePromise) {
      knowledgePromise = fetch(KNOWLEDGE_URL).then(response => {
        if (!response.ok) throw new Error(`Error HTTP ${response.status} al cargar la base técnica.`);
        return response.text();
      }).then(parseTechnicalKnowledge).catch(error => {
        knowledgePromise = undefined;
        throw error;
      });
    }
    return knowledgePromise;
  };

  [toggle, ...additionalToggles].forEach(button => {
    button.addEventListener('click', () => {
      activeToggle = button;
      setOpen(panel.hidden);
    });
  });
  close.addEventListener('click', () => setOpen(false));
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') setOpen(false);
  });
  panel.addEventListener('click', event => {
    const suggestion = event.target.closest('[data-assistant-question]');
    if (suggestion) askQuestion(suggestion.dataset.assistantQuestion);
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const question = input.value.trim().slice(0, 500);
    if (!question) return;

    addMessage(question, 'question');
    messages.querySelector('.assistant-suggestions')?.remove();
    input.value = '';
    input.disabled = true;
    submitButton.disabled = true;
    form.setAttribute('aria-busy', 'true');
    const pending = addMessage('Buscando en la información técnica…', 'answer');
    try {
      const answer = calculateFromTechnicalData(question);
      const result = answer || searchTechnicalKnowledge(question, await loadKnowledge());
      if (answer) {
        pending.textContent = answer.text;
        const citation = document.createElement('span');
        citation.className = 'assistant-source';
        citation.textContent = `Fuente: ${answer.source}`;
        pending.appendChild(citation);
      } else if (result) {
        pending.textContent = result.content;
        const citation = document.createElement('span');
        citation.className = 'assistant-source';
        citation.textContent = `Fuente: ${result.source}`;
        pending.appendChild(citation);
      } else {
        pending.textContent = 'Solo puedo responder consultas técnicas que estén cubiertas por la información publicada del sitio. Prueba preguntando sobre perfiles, montaje, muros, entrepisos, techos o los modelos.';
      }
    } catch (error) {
      console.error('No se pudo cargar la base técnica del asistente:', error);
      pending.textContent = 'No pude cargar la información técnica. Comprueba tu conexión e inténtalo otra vez.';
    } finally {
      messages.scrollTop = messages.scrollHeight;
      input.disabled = false;
      submitButton.disabled = false;
      form.removeAttribute('aria-busy');
      input.focus();
    }
  });
}
