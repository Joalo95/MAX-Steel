const REVEAL_SELECTORS = [
  'main > .sec > h2',
  'main > .sec > .sub',
  'main > .sec > .row',
  'main > .sec > .steps > li',
  'main > .sec > .cols > div',
  'main > .sec > .scroll',
  'main > .sec > .floor-info',
  '#model-grid > .model-card',
  '.timeline-steps > li',
  '.profile-feature',
  '.material-callout',
  '#modelos > .custom-project',
  '#estructura > .tools',
  '#estructura > .v3d',
  '#estructura > .v3bar'
].join(',');

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initializeScrollEffects() {
  const reduceMotion = prefersReducedMotion();
  const header = document.querySelector('.site-header');
  const hero = document.querySelector('.hero');
  const heroImage = hero?.querySelector('.hero-image');
  const revealElements = [...document.querySelectorAll(REVEAL_SELECTORS)];
  const isMobile = window.matchMedia('(max-width: 600px)');
  let frame = 0;

  const updateScrollEffects = () => {
    frame = 0;
    const scrollY = window.scrollY || window.pageYOffset;
    header?.classList.toggle('is-scrolled', scrollY > 24);

    if (!hero || !heroImage || isMobile.matches || reduceMotion) {
      heroImage?.style.removeProperty('--hero-parallax-y');
      return;
    }

    const bounds = hero.getBoundingClientRect();
    const progress = Math.min(Math.max(-bounds.top, 0), bounds.height);
    heroImage.style.setProperty('--hero-parallax-y', `${-Math.round(progress * .12)}px`);
  };

  const scheduleUpdate = () => {
    if (!frame) frame = window.requestAnimationFrame(updateScrollEffects);
  };

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });

  if ('IntersectionObserver' in window) {
    const observer = new window.IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });

    revealElements.forEach(element => {
      const siblingSelector = element.matches('.row')
        ? ':scope > .row'
        : element.matches('.steps > li')
          ? ':scope > li'
          : element.matches('.cols > div')
            ? ':scope > div'
            : element.matches('.model-card')
              ? ':scope > .model-card'
            : null;
      const siblings = siblingSelector && element.parentElement
        ? [...element.parentElement.querySelectorAll(siblingSelector)]
        : [];
      const siblingIndex = siblings.indexOf(element);
      element.style.setProperty('--reveal-delay', `${Math.min(Math.max(siblingIndex, 0), 5) * 70}ms`);
      if (element.matches('.timeline-steps > li')) {
        element.dataset.revealFrom = siblingIndex % 2 === 0 ? 'left' : 'right';
      } else if (element.matches('.model-card')) {
        element.dataset.revealFrom = 'up';
      }
      element.classList.add('scroll-reveal');
      observer.observe(element);
    });
  }

  scheduleUpdate();
}
