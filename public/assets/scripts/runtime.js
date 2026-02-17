const prefersReducedMotion = false;

function setViewportHeightUnit() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

function revealElement(el, delay = 0) {
  if (!(el instanceof HTMLElement)) return;

  el.style.willChange = 'opacity, transform';
  el.style.transitionProperty = 'opacity, transform';
  el.style.transitionDuration = '520ms, 520ms';
  el.style.transitionTimingFunction = 'cubic-bezier(0.22, 1, 0.36, 1), cubic-bezier(0.22, 1, 0.36, 1)';
  el.style.transitionDelay = `${delay}ms, ${delay}ms`;

  if (!prefersReducedMotion) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  });
}

function setupWordRevealAnimations() {
  const groups = Array.from(document.querySelectorAll('[aria-label]'));

  const runGroup = (group) => {
    if (!(group instanceof HTMLElement)) return;
    if (group.dataset.animReady === '1') return;

    const words = Array.from(group.querySelectorAll('[aria-hidden="true"]')).filter((node) => {
      if (!(node instanceof HTMLElement)) return false;
      const style = (node.getAttribute('style') || '').toLowerCase();
      // Target inline word fragments used in hero/testimonial text reveal markup.
      return style.includes('display:inline-block') || style.includes('white-space:pre');
    });

    if (!words.length) return;

    group.dataset.animReady = '1';

    if (prefersReducedMotion) {
      words.forEach((word) => {
        word.style.opacity = '1';
        word.style.transform = 'none';
      });
      return;
    }

    words.forEach((word, idx) => revealElement(word, idx * 42));
  };

  if (!('IntersectionObserver' in window)) {
    groups.forEach(runGroup);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runGroup(entry.target);
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -10% 0px' },
  );

  groups.forEach((group) => io.observe(group));
}

function setupSectionRevealAnimations() {
  const candidates = Array.from(document.querySelectorAll('[style*="opacity:0"][style*="width:100%"]'));

  const reveal = (el) => {
    if (!(el instanceof HTMLElement)) return;
    if (el.dataset.sectionAnimReady === '1') return;

    el.dataset.sectionAnimReady = '1';
    if (prefersReducedMotion) {
      el.style.opacity = '1';
      return;
    }

    el.style.willChange = 'opacity, transform';
    el.style.transition = 'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1), transform 700ms cubic-bezier(0.22, 1, 0.36, 1)';
    el.style.transform = 'translateY(24px)';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  };

  if (!('IntersectionObserver' in window)) {
    candidates.forEach(reveal);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -5% 0px' },
  );

  candidates.forEach((el) => io.observe(el));
}

function setupAriaControlToggles() {
  const buttons = Array.from(document.querySelectorAll('button[aria-controls]'));

  buttons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;

    const controls = button.getAttribute('aria-controls');
    if (!controls) return;
    if (controls === 'mobile-nav' || button.getAttribute('aria-label') === 'Open menu') return;

    const target = document.getElementById(controls);
    if (!target) return;

    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      const nextExpanded = !expanded;

      button.setAttribute('aria-expanded', String(nextExpanded));
      target.hidden = !nextExpanded;

      if (nextExpanded) {
        target.style.display = '';
      } else {
        target.style.display = 'none';
      }
    });
  });
}

function findDisclosurePanel(button) {
  if (!(button instanceof HTMLButtonElement)) return null;

  const controls = button.getAttribute('aria-controls');
  if (controls) {
    const byId = document.getElementById(controls);
    if (byId) return byId;
  }

  const sibling = button.nextElementSibling;
  if (!(sibling instanceof HTMLElement)) return null;

  const style = (sibling.getAttribute('style') || '').toLowerCase();
  if (style.includes('max-height') || style.includes('opacity:0') || sibling.getAttribute('aria-hidden')) {
    return sibling;
  }

  return null;
}

function setupDisclosureToggles() {
  const buttons = Array.from(document.querySelectorAll('button[aria-expanded]'));

  buttons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;
    if (button.getAttribute('aria-label') === 'Open menu') return;

    const panel = findDisclosurePanel(button);
    if (!(panel instanceof HTMLElement)) return;

    if (!button.dataset.disclosureInit) {
      button.dataset.disclosureInit = '1';
      button.addEventListener('click', () => {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        const next = !isExpanded;

        button.setAttribute('aria-expanded', String(next));
        panel.setAttribute('aria-hidden', String(!next));

        panel.style.overflow = 'hidden';
        panel.style.transitionProperty = 'max-height, opacity';
        panel.style.transitionDuration = '420ms, 300ms';
        panel.style.transitionTimingFunction = 'cubic-bezier(0.4, 0, 0.2, 1), ease';
        panel.style.maxHeight = next ? `${panel.scrollHeight + 24}px` : '0px';
        panel.style.opacity = next ? '1' : '0';

        // Rotate the plus icon container if present.
        const iconRoot = button.querySelector('[style*="transition-property:transform"]');
        if (iconRoot instanceof HTMLElement) {
          iconRoot.style.transform = next ? 'rotate(45deg)' : 'matrix(1, 0, 0, 1, 0, 0)';
        }

        // Hide horizontal stroke for minus visual when expanded.
        const paths = button.querySelectorAll('path');
        if (paths.length >= 2) {
          const horizontal = paths[1];
          if (horizontal instanceof SVGElement) {
            horizontal.style.opacity = next ? '0' : '1';
          }
        }
      });
    }
  });
}

function setupHeaderBehavior() {
  const header = document.querySelector('header');
  if (!(header instanceof HTMLElement)) return;

  const nav = header.querySelector('nav');
  const shell = header.querySelector(':scope > div > div');
  if (!(nav instanceof HTMLElement) || !(shell instanceof HTMLElement)) return;

  const navList = nav.querySelector('ul');
  const ctaWrap = nav.querySelector('ul + div');
  const menuButton = nav.querySelector('button[aria-label="Open menu"]');
  const menuWrap = menuButton instanceof HTMLElement ? menuButton.parentElement : null;
  const logo = header.querySelector('img[alt="Logo"]');

  const loginOuter =
    ctaWrap instanceof HTMLElement ? ctaWrap.querySelector(':scope > div:first-child') : null;
  const loginInner = loginOuter instanceof HTMLElement ? loginOuter.querySelector(':scope > div') : null;
  const loginOverlay =
    loginInner instanceof HTMLElement ? loginInner.querySelector(':scope > div') : null;
  const loginLink = loginInner instanceof HTMLElement ? loginInner.querySelector('a') : null;

  const tryOuter =
    ctaWrap instanceof HTMLElement ? ctaWrap.querySelector(':scope > div:last-child') : null;
  const tryLink = tryOuter instanceof HTMLElement ? tryOuter.querySelector('a') : null;

  const shellChildren = Array.from(shell.children).filter((node) => node instanceof HTMLElement);
  const topGradientLayer = shellChildren[0];
  const topGlossLayer = shellChildren[1];
  if (topGradientLayer instanceof HTMLElement) topGradientLayer.style.display = 'none';
  if (topGlossLayer instanceof HTMLElement) topGlossLayer.style.display = 'none';

  const LOGIN_BG_DEFAULT = 'rgb(213, 239, 255)';
  const LOGIN_BG_HOVER = 'rgb(192, 231, 255)';
  const LOGIN_BG_ACTIVE = 'rgb(175, 224, 255)';
  const TRY_BG_DEFAULT = 'rgb(6, 40, 75)';
  const TRY_BG_HOVER = 'rgba(6, 40, 75, 0.9)';

  const setLoginButtonBackground = (color) => {
    if (loginOuter instanceof HTMLElement) {
      loginOuter.style.backgroundColor = color;
      loginOuter.style.transition = 'background-color 200ms ease';
    }
    if (loginInner instanceof HTMLElement) {
      loginInner.style.backgroundImage = `linear-gradient(${color}, ${color}), linear-gradient(rgba(47, 145, 202, 0) 0%, rgba(47, 145, 202, 0.66) 49%, rgba(47, 145, 202, 0) 100%)`;
      loginInner.style.transition = 'background-image 200ms ease';
    }
    if (loginOverlay instanceof HTMLElement) {
      loginOverlay.style.backgroundImage = `linear-gradient(${color}, ${color}), linear-gradient(rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 49%, rgba(255, 255, 255, 0.52) 100%)`;
      loginOverlay.style.transition = 'background-image 200ms ease';
    }
  };

  const setTryButtonBackground = (color) => {
    if (tryLink instanceof HTMLElement) {
      tryLink.style.backgroundColor = color;
      tryLink.style.transition = 'background-color 150ms ease';
    }
  };

  const bindButtonPointerStates = (el, handlers) => {
    if (!(el instanceof HTMLElement)) return;
    el.addEventListener('pointerenter', handlers.enter);
    el.addEventListener('pointerleave', handlers.leave);
    el.addEventListener('pointercancel', handlers.leave);
    el.addEventListener('pointerdown', handlers.down);
    el.addEventListener('pointerup', handlers.up);
    el.addEventListener('blur', handlers.leave);
  };

  setLoginButtonBackground(LOGIN_BG_DEFAULT);
  setTryButtonBackground(TRY_BG_DEFAULT);

  if (loginLink instanceof HTMLElement) {
    bindButtonPointerStates(loginLink, {
      enter: () => setLoginButtonBackground(LOGIN_BG_HOVER),
      leave: () => setLoginButtonBackground(LOGIN_BG_DEFAULT),
      down: () => setLoginButtonBackground(LOGIN_BG_ACTIVE),
      up: () => setLoginButtonBackground(LOGIN_BG_HOVER),
    });
  } else {
    bindButtonPointerStates(loginOuter, {
      enter: () => setLoginButtonBackground(LOGIN_BG_HOVER),
      leave: () => setLoginButtonBackground(LOGIN_BG_DEFAULT),
      down: () => setLoginButtonBackground(LOGIN_BG_ACTIVE),
      up: () => setLoginButtonBackground(LOGIN_BG_HOVER),
    });
  }

  bindButtonPointerStates(tryLink, {
    enter: () => setTryButtonBackground(TRY_BG_HOVER),
    leave: () => setTryButtonBackground(TRY_BG_DEFAULT),
    down: () => setTryButtonBackground(TRY_BG_DEFAULT),
    up: () => setTryButtonBackground(TRY_BG_HOVER),
  });

  let mobilePanel = document.getElementById('mobile-nav');
  if (!(mobilePanel instanceof HTMLElement)) {
    mobilePanel = document.createElement('div');
    mobilePanel.id = 'mobile-nav';
    mobilePanel.style.display = 'none';
    mobilePanel.style.position = 'absolute';
    mobilePanel.style.left = '0';
    mobilePanel.style.right = '0';
    mobilePanel.style.top = 'calc(100% + 12px)';
    mobilePanel.style.padding = '12px';
    mobilePanel.style.borderRadius = '20px';
    mobilePanel.style.background = 'rgb(246, 247, 249)';
    mobilePanel.style.boxShadow = '0 16px 32px rgba(2, 6, 23, 0.16)';
    mobilePanel.style.zIndex = '60';
    mobilePanel.style.overflow = 'hidden';
    nav.style.position = 'relative';
    nav.appendChild(mobilePanel);
  }

  const applyHamburgerState = (open) => {
    if (!(menuButton instanceof HTMLElement)) return;
    const lines = Array.from(menuButton.querySelectorAll('span[aria-hidden="true"]'));
    if (lines.length < 3) return;

    const [top, middle, bottom] = lines;
    [top, middle, bottom].forEach((line) => {
      if (!(line instanceof HTMLElement)) return;
      line.style.transition = 'transform 220ms cubic-bezier(0.4, 0, 0.2, 1), opacity 170ms ease';
    });

    if (top instanceof HTMLElement) top.style.transform = open ? 'translateY(0) rotate(45deg)' : 'translateY(-6px)';
    if (middle instanceof HTMLElement) middle.style.opacity = open ? '0' : '1';
    if (bottom instanceof HTMLElement) {
      bottom.style.transform = open ? 'translateY(0) rotate(-45deg)' : 'translateY(6px)';
    }
  };

  const buildMobilePanel = () => {
    if (!(mobilePanel instanceof HTMLElement)) return;
    if (mobilePanel.dataset.built === '1') return;
    if (!(navList instanceof HTMLElement)) return;

    const listClone = navList.cloneNode(true);
    if (listClone instanceof HTMLElement) {
      listClone.removeAttribute('id');
      listClone.style.display = 'flex';
      listClone.style.flexDirection = 'column';
      listClone.style.gap = '8px';
      listClone.style.alignItems = 'stretch';
      listClone.style.margin = '0';
      listClone.style.padding = '0';
      listClone.style.listStyle = 'none';
      listClone.querySelectorAll('a').forEach((link) => {
        if (!(link instanceof HTMLElement)) return;
        link.style.color = 'rgb(6, 40, 75)';
        link.style.justifyContent = 'flex-start';
        link.style.padding = '8px 12px';
        link.style.borderRadius = '12px';
      });
      mobilePanel.appendChild(listClone);
    }

    if (ctaWrap instanceof HTMLElement) {
      const ctaClone = ctaWrap.cloneNode(true);
      if (ctaClone instanceof HTMLElement) {
        ctaClone.removeAttribute('id');
        ctaClone.style.display = 'flex';
        ctaClone.style.flexDirection = 'column';
        ctaClone.style.gap = '12px';
        ctaClone.style.marginTop = '12px';
        ctaClone.querySelectorAll('a').forEach((link) => {
          if (!(link instanceof HTMLElement)) return;
          link.style.width = '100%';
          link.style.justifyContent = 'center';
        });
        mobilePanel.appendChild(ctaClone);
      }
    }

    mobilePanel.dataset.built = '1';
  };

  const closeMobilePanel = () => {
    if (!(menuButton instanceof HTMLElement)) return;
    menuButton.setAttribute('aria-expanded', 'false');
    if (mobilePanel instanceof HTMLElement) {
      mobilePanel.style.display = 'none';
      mobilePanel.hidden = true;
    }
    applyHamburgerState(false);
  };

  const openMobilePanel = () => {
    if (!(menuButton instanceof HTMLElement)) return;
    buildMobilePanel();
    menuButton.setAttribute('aria-expanded', 'true');
    if (mobilePanel instanceof HTMLElement) {
      mobilePanel.hidden = false;
      mobilePanel.style.display = 'block';
    }
    applyHamburgerState(true);
  };

  const toggleMobilePanel = () => {
    if (!(menuButton instanceof HTMLElement)) return;
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      closeMobilePanel();
    } else {
      openMobilePanel();
    }
  };

  const applyHeaderVisualState = () => {
    const mobile = window.innerWidth < 1024;
    const scrolled = window.scrollY > 20;

    header.style.paddingTop = mobile ? '20px' : '36px';
    header.style.transition = 'padding-top 300ms cubic-bezier(0.4, 0, 0.2, 1)';

    shell.style.transition =
      'background-color 300ms cubic-bezier(0.4, 0, 0.2, 1), border-color 300ms cubic-bezier(0.4, 0, 0.2, 1), backdrop-filter 300ms cubic-bezier(0.4, 0, 0.2, 1)';

    if (scrolled) {
      shell.style.backgroundColor = 'rgb(239, 239, 239)';
      shell.style.border = '1px solid rgba(239, 239, 239, 0)';
      shell.style.backdropFilter = 'none';
    } else {
      shell.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      shell.style.border = '1px solid rgba(255, 255, 255, 0.15)';
      shell.style.backdropFilter = 'blur(25px)';
    }

    if (logo instanceof HTMLElement) {
      logo.style.transition = 'filter 300ms cubic-bezier(0.4, 0, 0.2, 1)';
      logo.style.filter = scrolled ? 'none' : 'brightness(0) invert(1)';
    }

    const navColor = scrolled ? 'rgb(6, 40, 75)' : 'rgb(255, 255, 255)';
    if (navList instanceof HTMLElement) {
      navList.querySelectorAll('a').forEach((anchor) => {
        if (!(anchor instanceof HTMLElement)) return;
        anchor.style.color = navColor;
        anchor.querySelectorAll('span').forEach((span) => {
          if (span instanceof HTMLElement) span.style.color = navColor;
        });
      });
    }

    if (menuButton instanceof HTMLElement) {
      menuButton.style.border = 'none';
      menuButton.style.backgroundColor = 'transparent';
      const lines = menuButton.querySelectorAll('span[aria-hidden="true"]');
      lines.forEach((line) => {
        if (line instanceof HTMLElement) {
          line.style.backgroundColor = 'rgb(23, 157, 255)';
        }
      });
    }

    if (mobile) {
      if (menuWrap instanceof HTMLElement) menuWrap.style.display = 'block';
      if (navList instanceof HTMLElement) navList.style.display = 'none';
      if (ctaWrap instanceof HTMLElement) ctaWrap.style.display = 'none';
    } else {
      if (menuWrap instanceof HTMLElement) menuWrap.style.display = 'none';
      if (navList instanceof HTMLElement) navList.style.display = 'flex';
      if (ctaWrap instanceof HTMLElement) ctaWrap.style.display = 'flex';
      closeMobilePanel();
    }
  };

  if (menuButton instanceof HTMLButtonElement) {
    menuButton.addEventListener('click', (event) => {
      if (window.innerWidth >= 1024) return;
      event.preventDefault();
      event.stopPropagation();
      toggleMobilePanel();
    });
  }

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Node)) return;
    if (!(menuButton instanceof HTMLButtonElement)) return;
    if (menuButton.getAttribute('aria-expanded') !== 'true') return;
    if (!nav.contains(event.target)) {
      closeMobilePanel();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMobilePanel();
    }
  });

  window.addEventListener('scroll', applyHeaderVisualState, { passive: true });
  window.addEventListener('resize', applyHeaderVisualState, { passive: true });

  applyHamburgerState(false);
  applyHeaderVisualState();
}

function looksLikeAnimatedButton(el) {
  if (!(el instanceof HTMLElement)) return false;

  const tag = el.tagName.toLowerCase();
  const style = (el.getAttribute('style') || '').toLowerCase();

  if (tag === 'button') {
    return style.includes('border-radius:9999px') || style.includes('transition-property:transform');
  }

  if (tag === 'a') {
    const hasDisplay =
      style.includes('display:inline-flex') ||
      style.includes('display: inline-flex') ||
      style.includes('display:flex') ||
      style.includes('display: flex');

    return hasDisplay && style.includes('border-radius:9999px');
  }

  return false;
}

function findButtonMotionTarget(control) {
  if (!(control instanceof HTMLElement)) return null;

  let current = control;
  for (let i = 0; i < 3 && current; i += 1) {
    const style = (current.getAttribute('style') || '').toLowerCase();
    if (
      style.includes('border-radius:9999px') &&
      (style.includes('width:fit-content') || style.includes('position:relative'))
    ) {
      return current;
    }
    if (!(current.parentElement instanceof HTMLElement)) break;
    current = current.parentElement;
  }

  return control;
}

function rememberMotionDefaults(target) {
  if (!(target instanceof HTMLElement)) return;
  if (target.dataset.motionDefaults === '1') return;

  target.dataset.motionDefaults = '1';
  target.dataset.motionTranslate = target.style.translate || '';
  target.dataset.motionScale = target.style.scale || '';
  target.dataset.motionFilter = target.style.filter || '';

  const existingTransition = target.style.transition;
  const motionTransition =
    'translate 180ms cubic-bezier(0.22, 1, 0.36, 1), scale 180ms cubic-bezier(0.22, 1, 0.36, 1), filter 220ms ease';

  target.style.transition = existingTransition ? `${existingTransition}, ${motionTransition}` : motionTransition;
  target.style.willChange = target.style.willChange
    ? `${target.style.willChange}, translate, scale, filter`
    : 'translate, scale, filter';
}

function applyButtonMotionState(target, state) {
  if (!(target instanceof HTMLElement)) return;

  if (state === 'hover') {
    target.style.translate = '0 -1px';
    target.style.scale = '1.01';
    target.style.filter = 'saturate(1.06)';
    return;
  }

  if (state === 'press') {
    target.style.translate = '0 0';
    target.style.scale = '0.985';
    target.style.filter = 'saturate(1.08)';
    return;
  }

  target.style.translate = target.dataset.motionTranslate || '';
  target.style.scale = target.dataset.motionScale || '';
  target.style.filter = target.dataset.motionFilter || '';
}

function setupButtonAnimations() {
  const controls = Array.from(document.querySelectorAll('button, a')).filter(looksLikeAnimatedButton);

  controls.forEach((control) => {
    if (!(control instanceof HTMLElement)) return;
    if (control.dataset.buttonMotionInit === '1') return;

    control.dataset.buttonMotionInit = '1';

    const target = findButtonMotionTarget(control);
    if (!(target instanceof HTMLElement)) return;
    rememberMotionDefaults(target);

    control.addEventListener('pointerenter', () => applyButtonMotionState(target, 'hover'));
    control.addEventListener('pointerleave', () => applyButtonMotionState(target, 'rest'));
    control.addEventListener('pointercancel', () => applyButtonMotionState(target, 'rest'));
    control.addEventListener('pointerdown', () => applyButtonMotionState(target, 'press'));
    control.addEventListener('pointerup', () => applyButtonMotionState(target, 'hover'));
    control.addEventListener('blur', () => applyButtonMotionState(target, 'rest'));
  });
}

function runInitStep(label, fn) {
  try {
    fn();
  } catch (err) {
    console.warn(`[runtime] ${label} failed`, err);
  }
}

function init() {
  try {
    document.documentElement.style.opacity = '1';
    document.documentElement.setAttribute('data-runtime-ready', '1');
    runInitStep('setViewportHeightUnit', setViewportHeightUnit);
    runInitStep('setupWordRevealAnimations', setupWordRevealAnimations);
    runInitStep('setupSectionRevealAnimations', setupSectionRevealAnimations);
    runInitStep('setupButtonAnimations', setupButtonAnimations);
    runInitStep('setupAriaControlToggles', setupAriaControlToggles);
    runInitStep('setupDisclosureToggles', setupDisclosureToggles);
    runInitStep('setupHeaderBehavior', setupHeaderBehavior);
  } catch (err) {
    // Keep page usable even if one enhancement fails.
    console.error('[runtime] init failed', err);
  }
}

window.addEventListener('resize', setViewportHeightUnit, { passive: true });
window.addEventListener('orientationchange', setViewportHeightUnit, { passive: true });

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
