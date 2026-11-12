import { initializeTechnicalAssistant } from './components/technical-assistant.js';
import { initializeScrollEffects } from './components/scroll-effects.js';
import { initializeStudioUI } from './components/studio-ui.js';

initializeTechnicalAssistant();
initializeScrollEffects();

let viewer;
let requestedStudioMode = 'architecture';
const studioUI = document.getElementById('v3d')
  ? initializeStudioUI(mode => {
    requestedStudioMode = mode;
    viewer?.setViewMode(mode);
  })
  : null;

if (studioUI) {
  const modelScripts = [
    'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js'
  ];

  const message = document.getElementById('v3msg');
  let viewerPromise;
  let requestedModel = studioUI.getSelectedModel();

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

  async function loadViewer() {
    if (!viewerPromise) {
      message.textContent = 'Preparando el visualizador 3D…';
      viewerPromise = (async () => {
        for (const src of modelScripts) await loadScript(src);
        const { createViewer } = await import('./components/three-viewer.js');
        const instance = createViewer();
        if (!instance) throw new Error('No se pudo iniciar el visualizador 3D.');
        instance.setViewMode(requestedStudioMode);
        document.querySelector('[data-studio-components-empty]')?.remove();
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
    try {
      viewer = await loadViewer();
      viewer.openModel(requestedModel);
    } catch (error) {
      console.error(error);
      message.replaceChildren(
        document.createTextNode('No se pudo iniciar el visor. Comprueba tu conexión e inténtalo de nuevo.')
      );
      const retryButton = document.createElement('button');
      retryButton.type = 'button';
      retryButton.className = 'studio-primary-button';
      retryButton.dataset.openViewer = '';
      retryButton.textContent = 'Intentar de nuevo';
      message.append(retryButton);
      message.style.display = 'grid';
    }
  }

  document.addEventListener('click', event => {
    const cta = event.target.closest('[data-open-viewer]');
    if (cta) {
      void requestModel(studioUI.getSelectedModel());
      return;
    }

    const modelButton = event.target.closest('.v3m');
    if (modelButton) void requestModel(modelButton.dataset.m);
  });

  const params = new URLSearchParams(location.search);
  if (params.get('load') === '1') void requestModel(studioUI.getSelectedModel());
}
