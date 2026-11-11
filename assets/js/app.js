import { initializeTechnicalAssistant } from './components/technical-assistant.js';
import { initializeScrollEffects } from './components/scroll-effects.js';

initializeTechnicalAssistant();
initializeScrollEffects();

const modelScripts = [
  'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js'
];

const message = document.getElementById('v3msg');
const visualizer = document.getElementById('estructura');
let viewerPromise;
let viewer;
let requestedModel = 'd1';

function loadScript(src) {
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing?.dataset.loaded === 'true') return Promise.resolve();
  if (existing?.dataset.loading === 'true') {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
    });
  }

  const script = existing || document.createElement('script');
  script.src = src;
  script.async = false;
  script.dataset.loading = 'true';
  return new Promise((resolve, reject) => {
    script.addEventListener('load', () => {
      script.dataset.loading = 'false';
      script.dataset.loaded = 'true';
      resolve();
    }, { once: true });
    script.addEventListener('error', () => {
      script.remove();
      reject(new Error(`No se pudo cargar la dependencia del visor: ${src}`));
    }, { once: true });
    if (!existing) document.head.appendChild(script);
  });
}

function scrollToVisualizer() {
  visualizer.scrollIntoView({
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  });
  history.replaceState(null, '', '#estructura');
}

async function loadViewer() {
  if (!viewerPromise) {
    message.textContent = 'Preparando el visualizador 3D…';
    viewerPromise = (async () => {
      for (const src of modelScripts) await loadScript(src);
      const { createViewer } = await import('./components/three-viewer.js');
      const instance = createViewer();
      if (!instance) throw new Error('No se pudo iniciar el visualizador 3D.');
      return instance;
    })().catch(error => {
      viewerPromise = undefined;
      throw error;
    });
  }
  return viewerPromise;
}

async function requestModel(model) {
  requestedModel = model;
  scrollToVisualizer();
  try {
    viewer = await loadViewer();
    viewer.openModel(requestedModel);
  } catch (error) {
    console.error(error);
    message.textContent = 'No se pudo iniciar el visor. Comprueba tu conexión e inténtalo de nuevo.';
    message.style.display = 'grid';
  }
}

document.addEventListener('click', event => {
  const cta = event.target.closest('[data-open-viewer]');
  if (cta) {
    event.preventDefault();
    void requestModel(cta.dataset.k || 'd1');
    return;
  }

  const modelButton = event.target.closest('.v3m');
  if (modelButton && !viewer) {
    event.preventDefault();
    void requestModel(modelButton.dataset.m);
  }
});
