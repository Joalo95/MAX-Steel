const MODELS = {
  mono: {
    name: 'Monoambiente',
    dimensions: '7,66 × 3,26 m',
    area: '25',
    rooms: 'Ambiente principal · baño',
    roof: 'Chapa BC35 · techo inclinado · cota máx. 3,35 m',
    summary: 'Un espacio abierto para vivir, trabajar y descansar, con baño independiente.',
    price: 'US$ 6.133',
    windows: 'US$ 2.410 + IVA',
    payment: '36 cuotas de US$ 170 + IVA'
  },
  d1: {
    name: '1 dormitorio',
    dimensions: '10,45 × 4,46 m',
    area: '45',
    rooms: 'Estar-comedor · 1 dormitorio · baño',
    roof: 'Hormigón alivianado · pendiente 1,5 %',
    summary: 'Diseño funcional con ambientes definidos para vivir y compartir.',
    price: 'US$ 9.432',
    windows: 'US$ 5.953 + IVA',
    payment: '36 cuotas de US$ 262 + IVA'
  },
  d2: {
    name: '2 dormitorios',
    dimensions: '12,06 × 6,06 m',
    area: '65',
    rooms: 'Estar-comedor · 2 dormitorios · baño',
    roof: 'Techo plano · dos puntos de bajada · cota 3,30 m',
    summary: 'Más espacio para compartir, con dos dormitorios y un área social integrada.',
    price: 'US$ 14.387',
    windows: 'US$ 6.187 + IVA',
    payment: '36 cuotas de US$ 400 + IVA'
  }
};

const VIEWS = {
  architecture: 'Volumen y terminaciones',
  structure: 'Estructura portante',
  composition: 'Capas constructivas'
};

export function initializeStudioUI(onViewModeChange) {
  const app = document.querySelector('[data-studio-mode]');
  if (!app) return null;

  let selectedView = app?.dataset.studioMode || 'architecture';
  let selectedModel = new URLSearchParams(location.search).get('model');
  if (!MODELS[selectedModel]) selectedModel = 'd1';

  const updateModel = key => {
    const model = MODELS[key];
    if (!model) return;
    selectedModel = key;

    document.querySelectorAll('.v3m').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.m === key));
    });

    const modelLabel = document.querySelector('[data-studio-model-label]');
    if (modelLabel) modelLabel.textContent = `${model.name} · ${model.area} m²`;
    Object.entries(model).forEach(([property, value]) => {
      document.querySelectorAll(`[data-studio-property="${property}"]`).forEach(element => {
        element.textContent = value;
      });
    });

    const quote = document.querySelector('[data-studio-quote]');
    if (quote) quote.href = `mailto:contacto@maxsteel.com.uy?subject=${encodeURIComponent(`Cotización MAX-Steel · ${model.name}`)}`;
  };

  const updateView = mode => {
    if (!VIEWS[mode]) return;
    selectedView = mode;
    if (app) app.dataset.studioMode = mode;
    document.querySelectorAll('[data-studio-view]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.studioView === mode));
    });
    const note = document.querySelector('[data-studio-view-note]');
    if (note) note.textContent = VIEWS[mode];
    onViewModeChange(mode);
  };

  document.addEventListener('click', event => {
    const viewButton = event.target.closest('[data-studio-view]');
    if (viewButton) {
      updateView(viewButton.dataset.studioView);
      return;
    }

    const modelButton = event.target.closest('.v3m');
    const viewerButton = event.target.closest('[data-open-viewer]');
    if (modelButton) updateModel(modelButton.dataset.m);
    else if (viewerButton) updateModel(viewerButton.dataset.k);

    const panelTab = event.target.closest('[data-studio-panel-tab]');
    if (panelTab) {
      const panel = panelTab.dataset.studioPanelTab;
      document.querySelectorAll('[data-studio-panel]').forEach(section => {
        section.hidden = section.dataset.studioPanel !== panel;
      });
      document.querySelectorAll('[role="tab"][data-studio-panel-tab]').forEach(tab => {
        tab.setAttribute('aria-selected', String(tab.dataset.studioPanelTab === panel));
      });
    }

    const summaryTab = event.target.closest('[data-studio-summary-tab]');
    if (summaryTab) {
      const panel = summaryTab.dataset.studioSummaryTab;
      document.querySelectorAll('[data-summary-panel]').forEach(section => {
        section.hidden = section.dataset.summaryPanel !== panel;
      });
      document.querySelectorAll('[data-studio-summary-tab]').forEach(tab => {
        tab.setAttribute('aria-selected', String(tab.dataset.studioSummaryTab === panel));
      });
    }
  });

  updateModel(selectedModel);
  updateView(selectedView);

  return {
    getViewMode: () => selectedView,
    getSelectedModel: () => selectedModel
  };
}
