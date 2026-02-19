(() => {
  if (typeof window === 'undefined') return;
  if (window.__MIRROR_LOCAL_HEADER_INIT__) return;
  window.__MIRROR_LOCAL_HEADER_INIT__ = true;

  const runtimeConfig =
    window.__MIRROR_SITE_CONTENT__ && typeof window.__MIRROR_SITE_CONTENT__ === 'object'
      ? window.__MIRROR_SITE_CONTENT__
      : {};
  const headerConfig =
    runtimeConfig.header && typeof runtimeConfig.header === 'object' ? runtimeConfig.header : {};

  const defaultNavItems = [
    { label: 'Boiler\nServicing', href: '#boiler-servicing' },
    { label: 'Radiator\nServices', href: '#radiator-services' },
    { label: 'Tap\nRepairs', href: '#tap-repairs' },
    { label: 'Plumbing\nHandyman', href: '#plumbing-handyman' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Service\nArea', href: '#service-area' },
    { label: 'WhatsApp', href: '#whatsapp' },
  ];

  const navItems = Array.isArray(headerConfig.navItems) && headerConfig.navItems.length > 0
    ? headerConfig.navItems
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          return {
            label: typeof item.label === 'string' ? item.label : '',
            href: typeof item.href === 'string' ? item.href : '#',
          };
        })
        .filter((item) => item && item.label)
    : defaultNavItems;

  const resolveWhatsAppHref = () => {
    if (typeof headerConfig.whatsAppHref === 'string' && headerConfig.whatsAppHref) {
      return headerConfig.whatsAppHref;
    }
    const sourceNumber =
      typeof runtimeConfig.whatsappNumber === 'string' && runtimeConfig.whatsappNumber
        ? runtimeConfig.whatsappNumber
        : '+31 6 428 699 31';
    const digits = sourceNumber.replace(/\D/g, '');
    return digits ? `https://wa.me/${digits}` : '#';
  };

  const desktopPrimaryCta = {
    label:
      typeof headerConfig.primaryCtaLabel === 'string' && headerConfig.primaryCtaLabel
        ? headerConfig.primaryCtaLabel
        : 'WhatsApp',
    href: resolveWhatsAppHref(),
    newTab: true,
  };

  const desktopSecondaryCta = {
    label:
      typeof headerConfig.secondaryCtaLabel === 'string' && headerConfig.secondaryCtaLabel
        ? headerConfig.secondaryCtaLabel
        : 'Free Quote',
    href:
      typeof headerConfig.secondaryCtaHref === 'string' && headerConfig.secondaryCtaHref
        ? headerConfig.secondaryCtaHref
        : '#free-quote',
    newTab: false,
  };

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setLinkTarget = (anchor, href, newTab) => {
    if (!(anchor instanceof HTMLAnchorElement)) return;
    anchor.setAttribute('href', href || '#');
    if (newTab) {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    } else {
      anchor.removeAttribute('target');
      anchor.removeAttribute('rel');
    }
  };

  const setAnchorLabel = (anchor, label, multiline = true) => {
    if (!(anchor instanceof HTMLAnchorElement)) return;
    const textContainer = anchor.querySelector('span') || anchor;
    textContainer.textContent = label;
    if (textContainer instanceof HTMLElement) {
      textContainer.style.whiteSpace = multiline ? 'pre-line' : 'normal';
      textContainer.style.lineHeight = multiline ? '1.1' : '';
      textContainer.style.textAlign = multiline ? 'center' : '';
    }
  };

  const createMobileMenu = (menuButton) => {
    const existingPanel = document.getElementById('mobile-nav');
    const existingBackdrop = document.getElementById('mobile-nav-backdrop');
    if (existingPanel instanceof HTMLElement && existingBackdrop instanceof HTMLElement) {
      return { panel: existingPanel, backdrop: existingBackdrop };
    }

    const panel = document.createElement('div');
    panel.id = 'mobile-nav';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Mobile navigation');
    panel.setAttribute('data-local-mobile-nav', 'true');
    panel.hidden = true;
    panel.style.position = 'fixed';
    panel.style.left = '1rem';
    panel.style.right = '1rem';
    panel.style.top = '5.5rem';
    panel.style.zIndex = '52';
    panel.style.borderRadius = '24px';
    panel.style.border = '1px solid rgba(255,255,255,0.22)';
    panel.style.background = 'rgba(255,255,255,0.96)';
    panel.style.backdropFilter = 'blur(18px)';
    panel.style.webkitBackdropFilter = 'blur(18px)';
    panel.style.boxShadow = '0 16px 44px rgba(0,15,31,0.2)';
    panel.style.padding = '18px 16px';
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(-8px)';
    panel.style.transition = prefersReducedMotion() ? 'none' : 'opacity 220ms ease, transform 220ms ease';

    const list = document.createElement('ul');
    list.style.listStyle = 'none';
    list.style.margin = '0';
    list.style.padding = '0';
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.style.gap = '0.25rem';

    navItems.forEach((item) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'font-aspekta';
      link.style.display = 'block';
      link.style.padding = '10px 12px';
      link.style.borderRadius = '12px';
      link.style.color = '#264a6e';
      link.style.fontSize = '15px';
      link.style.fontWeight = '500';
      link.style.textDecoration = 'none';
      link.style.transition = prefersReducedMotion() ? 'none' : 'background-color 160ms ease';
      setLinkTarget(link, item.href, false);
      setAnchorLabel(link, item.label.replace(/\n/g, ' '), false);
      link.addEventListener('mouseenter', () => {
        link.style.backgroundColor = '#eef7ff';
      });
      link.addEventListener('mouseleave', () => {
        link.style.backgroundColor = 'transparent';
      });
      li.append(link);
      list.append(li);
    });

    const ctaWrap = document.createElement('div');
    ctaWrap.style.display = 'grid';
    ctaWrap.style.gridTemplateColumns = '1fr';
    ctaWrap.style.gap = '10px';
    ctaWrap.style.marginTop = '14px';

    const waButton = document.createElement('a');
    waButton.className = 'font-aspekta';
    waButton.style.display = 'inline-flex';
    waButton.style.alignItems = 'center';
    waButton.style.justifyContent = 'center';
    waButton.style.height = '51px';
    waButton.style.borderRadius = '9999px';
    waButton.style.textDecoration = 'none';
    waButton.style.fontWeight = '600';
    waButton.style.fontSize = '17px';
    waButton.style.background = '#d5efff';
    waButton.style.color = '#113965';
    waButton.style.border = '1px solid rgba(47,145,202,0.26)';
    waButton.style.transition = prefersReducedMotion() ? 'none' : 'transform 180ms ease, background-color 180ms ease';
    setLinkTarget(waButton, desktopPrimaryCta.href, true);
    setAnchorLabel(waButton, desktopPrimaryCta.label, false);

    const quoteButton = document.createElement('a');
    quoteButton.className = 'font-aspekta';
    quoteButton.style.display = 'inline-flex';
    quoteButton.style.alignItems = 'center';
    quoteButton.style.justifyContent = 'center';
    quoteButton.style.height = '51px';
    quoteButton.style.borderRadius = '9999px';
    quoteButton.style.textDecoration = 'none';
    quoteButton.style.fontWeight = '600';
    quoteButton.style.fontSize = '17px';
    quoteButton.style.background = '#0d335e';
    quoteButton.style.color = '#8cd0ff';
    quoteButton.style.border = '1px solid rgba(255,255,255,0.2)';
    quoteButton.style.transition = prefersReducedMotion() ? 'none' : 'transform 180ms ease, background-color 180ms ease';
    setLinkTarget(quoteButton, desktopSecondaryCta.href, false);
    setAnchorLabel(quoteButton, desktopSecondaryCta.label, false);

    [waButton, quoteButton].forEach((button) => {
      button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-1px)';
      });
      button.addEventListener('mouseleave', () => {
        button.style.transform = '';
      });
      button.addEventListener('click', () => {
        if (!(menuButton instanceof HTMLButtonElement)) return;
        menuButton.click();
      });
    });

    ctaWrap.append(waButton, quoteButton);
    panel.append(list, ctaWrap);

    const backdrop = document.createElement('button');
    backdrop.id = 'mobile-nav-backdrop';
    backdrop.type = 'button';
    backdrop.setAttribute('aria-label', 'Close mobile navigation');
    backdrop.hidden = true;
    backdrop.style.position = 'fixed';
    backdrop.style.inset = '0';
    backdrop.style.zIndex = '51';
    backdrop.style.border = '0';
    backdrop.style.background = 'rgba(0, 16, 31, 0.36)';
    backdrop.style.opacity = '0';
    backdrop.style.transition = prefersReducedMotion() ? 'none' : 'opacity 220ms ease';

    document.body.append(backdrop, panel);
    return { panel, backdrop };
  };

  const hideLegacyHeaderOverlay = () => {
    const selector = [
      '[id^="radix-"][role="dialog"]',
      '[id^="radix-"][data-state="open"]',
      '[data-state="open"][role="dialog"]',
      '[data-state="open"].fixed.inset-0',
    ].join(',');

    document.querySelectorAll(selector).forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      if (node.id === 'mobile-nav' || node.id === 'mobile-nav-backdrop') return;
      if (node.getAttribute('data-local-mobile-nav') === 'true') return;

      node.style.setProperty('display', 'none', 'important');
      node.style.setProperty('visibility', 'hidden', 'important');
      node.style.setProperty('opacity', '0', 'important');
      node.style.setProperty('pointer-events', 'none', 'important');
      node.setAttribute('aria-hidden', 'true');
      node.setAttribute('data-hide-promo', 'header-overlay');
    });
  };

  const setMenuBarsState = (menuButton, open) => {
    if (!(menuButton instanceof HTMLButtonElement)) return;
    const bars = menuButton.querySelectorAll('span');
    if (bars.length < 3) return;

    bars.forEach((bar) => {
      if (bar instanceof HTMLElement) {
        bar.style.transition = prefersReducedMotion() ? 'none' : 'transform 220ms ease, opacity 180ms ease';
        bar.style.transformOrigin = 'center';
      }
    });

    const [topBar, middleBar, bottomBar] = bars;
    if (topBar instanceof HTMLElement) {
      topBar.style.transform = open ? 'translateY(0px) rotate(45deg)' : 'translateY(-6px)';
    }
    if (middleBar instanceof HTMLElement) {
      middleBar.style.opacity = open ? '0' : '1';
    }
    if (bottomBar instanceof HTMLElement) {
      bottomBar.style.transform = open ? 'translateY(0px) rotate(-45deg)' : 'translateY(6px)';
    }
  };

  const applyHeaderState = (header, scrolled) => {
    if (!(header instanceof HTMLElement)) return;
    const shell = header.querySelector('.relative.rounded-full.transition-all.duration-300.ease-in-out');
    if (!(shell instanceof HTMLElement)) return;

    const desktopLinks = header.querySelectorAll('ul.hidden.lg\\:flex li a');
    const menuBars = header.querySelectorAll('button[aria-controls="mobile-nav"] span');

    shell.style.backdropFilter = 'blur(25px)';
    shell.style.webkitBackdropFilter = 'blur(25px)';
    shell.style.background = scrolled ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.1)';
    shell.style.borderColor = scrolled ? 'rgba(223,228,234,0.9)' : 'rgba(255,255,255,0.15)';
    shell.style.boxShadow = scrolled ? '0 14px 34px rgba(0, 15, 31, 0.14)' : 'none';

    desktopLinks.forEach((link) => {
      if (link instanceof HTMLElement) {
        link.style.color = scrolled ? '#adb3b8' : '#ffffff';
      }
    });

    menuBars.forEach((bar) => {
      if (bar instanceof HTMLElement) {
        bar.style.background = scrolled ? '#113965' : '#7ec8ff';
      }
    });
  };

  const wireHeader = () => {
    const header = document.querySelector('header.w-full.top-0.left-0.right-0.z-30.fixed');
    if (!(header instanceof HTMLElement)) return;

    const logo = header.querySelector('a[href="/"] img');
    if (logo instanceof HTMLElement) {
      logo.classList.remove('brightness-0', 'invert');
      logo.style.filter = 'none';
    }

    const desktopLinks = header.querySelectorAll('ul.hidden.lg\\:flex li a');
    desktopLinks.forEach((link, index) => {
      if (!(link instanceof HTMLAnchorElement)) return;
      const item = navItems[index];
      if (!item) return;
      setLinkTarget(link, item.href, false);
      setAnchorLabel(link, item.label, true);
    });

    const desktopCtas = header.querySelectorAll('div.max-lg\\:hidden a');
    if (desktopCtas[0] instanceof HTMLAnchorElement) {
      setLinkTarget(desktopCtas[0], desktopPrimaryCta.href, desktopPrimaryCta.newTab);
      setAnchorLabel(desktopCtas[0], desktopPrimaryCta.label, false);
    }
    if (desktopCtas[1] instanceof HTMLAnchorElement) {
      setLinkTarget(desktopCtas[1], desktopSecondaryCta.href, desktopSecondaryCta.newTab);
      setAnchorLabel(desktopCtas[1], desktopSecondaryCta.label, false);
    }

    let menuButton = header.querySelector('button[aria-controls="mobile-nav"]');
    if (!(menuButton instanceof HTMLButtonElement)) {
      applyHeaderState(header, window.scrollY > 12);
      return;
    }

    if (header.dataset.localMenuButtonCloned !== 'true' && menuButton.parentElement) {
      const freshButton = menuButton.cloneNode(true);
      menuButton.parentElement.replaceChild(freshButton, menuButton);
      if (freshButton instanceof HTMLButtonElement) {
        menuButton = freshButton;
      }
      header.dataset.localMenuButtonCloned = 'true';
    }

    if (header.dataset.localHeaderWired === 'true') {
      applyHeaderState(header, window.scrollY > 12);
      return;
    }

    header.dataset.localHeaderWired = 'true';
    menuButton.setAttribute('aria-controls', 'mobile-nav');
    menuButton.setAttribute('aria-label', 'Open menu');
    menuButton.setAttribute('aria-expanded', 'false');

    const { panel, backdrop } = createMobileMenu(menuButton);
    hideLegacyHeaderOverlay();
    let menuOpen = false;
    let closeTimer = null;

    const closeMenu = () => {
      if (!menuOpen) return;
      menuOpen = false;
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open menu');
      setMenuBarsState(menuButton, false);
      backdrop.style.opacity = '0';
      panel.style.opacity = '0';
      panel.style.transform = 'translateY(-8px)';
      if (closeTimer) window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(() => {
        backdrop.hidden = true;
        panel.hidden = true;
        document.body.style.removeProperty('overflow');
        hideLegacyHeaderOverlay();
      }, prefersReducedMotion() ? 0 : 220);
    };

    const openMenu = () => {
      if (menuOpen) return;
      menuOpen = true;
      menuButton.setAttribute('aria-expanded', 'true');
      menuButton.setAttribute('aria-label', 'Close menu');
      setMenuBarsState(menuButton, true);
      backdrop.hidden = false;
      panel.hidden = false;
      document.body.style.overflow = 'hidden';
      window.requestAnimationFrame(() => {
        backdrop.style.opacity = '1';
        panel.style.opacity = '1';
        panel.style.transform = 'translateY(0px)';
      });
      hideLegacyHeaderOverlay();
    };

    menuButton.addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === 'function') {
          event.stopImmediatePropagation();
        }
        if (menuOpen) closeMenu();
        else openMenu();
      },
      true,
    );

    panel.querySelectorAll('a').forEach((anchor) => {
      anchor.addEventListener('click', () => {
        closeMenu();
      });
    });

    backdrop.addEventListener('click', () => {
      closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) {
        closeMenu();
      }
      applyHeaderState(header, window.scrollY > 12);
    });

    window.addEventListener(
      'scroll',
      () => {
        applyHeaderState(header, window.scrollY > 12);
      },
      { passive: true },
    );

    applyHeaderState(header, window.scrollY > 12);
    setMenuBarsState(menuButton, false);
  };

  const boot = () => {
    wireHeader();

    let frameRequest = null;
    const scheduleWireHeader = () => {
      if (frameRequest !== null) return;
      frameRequest = window.requestAnimationFrame(() => {
        frameRequest = null;
        wireHeader();
      });
    };

    // Hydration from mirrored bundles can briefly restore original labels/links.
    // Re-apply configured header content on relevant DOM mutations to prevent flicker.
    const headerMutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const target = mutation.target;
        if (!(target instanceof Node)) continue;

        const targetElement =
          target instanceof Element ? target : target.parentElement;
        if (!targetElement) continue;

        const inHeader = targetElement.closest('header.w-full.top-0.left-0.right-0.z-30.fixed');
        if (inHeader) {
          scheduleWireHeader();
          return;
        }

        if (targetElement.matches('header.w-full.top-0.left-0.right-0.z-30.fixed')) {
          scheduleWireHeader();
          return;
        }
      }
    });

    headerMutationObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['href', 'class', 'style', 'aria-expanded', 'aria-label'],
    });

    // Keep a short stabilization window after boot for aggressive hydration churn.
    const stabilizationUntil = Date.now() + 4500;
    const stabilizationInterval = window.setInterval(() => {
      wireHeader();
      if (Date.now() >= stabilizationUntil) {
        window.clearInterval(stabilizationInterval);
      }
    }, 120);

    const overlayCleanupInterval = window.setInterval(hideLegacyHeaderOverlay, 800);
    window.addEventListener('beforeunload', () => {
      if (frameRequest !== null) {
        window.cancelAnimationFrame(frameRequest);
      }
      headerMutationObserver.disconnect();
      window.clearInterval(stabilizationInterval);
      window.clearInterval(overlayCleanupInterval);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
