      (() => {
        const promoMarker = 'data-hide-promo';
        const runtimeConfig =
          typeof window !== 'undefined' && window.__MIRROR_SITE_CONTENT__ && typeof window.__MIRROR_SITE_CONTENT__ === 'object'
            ? window.__MIRROR_SITE_CONTENT__
            : {};
        const localMediaMap =
          typeof window !== 'undefined' && window.__MIRROR_MEDIA_MAP__ && typeof window.__MIRROR_MEDIA_MAP__ === 'object'
            ? window.__MIRROR_MEDIA_MAP__
            : {};

        const defaultMediaOrigin = 'https://www.gogeviti.com';
        const defaultPromoNeedles = [
          'get your discount',
          'your first step toward better health',
          'because proactive health should be accessible',
          'flash sale',
          '10% off',
          '25% off',
        ];
        const defaultMediaPathPrefixes = [
          '/_next/image?',
          '/api/media/file/',
          '/banner/',
          '/reviews/',
          '/footer/',
          '/faq.webp',
        ];

        const MEDIA_ORIGIN =
          typeof runtimeConfig.mediaOrigin === 'string' && runtimeConfig.mediaOrigin
            ? runtimeConfig.mediaOrigin
            : defaultMediaOrigin;
        const promoNeedles =
          Array.isArray(runtimeConfig.promoNeedles) && runtimeConfig.promoNeedles.length > 0
            ? runtimeConfig.promoNeedles.map((needle) => String(needle || '').toLowerCase())
            : defaultPromoNeedles;

        const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim().toLowerCase();
        const mediaPathPrefixes =
          Array.isArray(runtimeConfig.mediaPathPrefixes) && runtimeConfig.mediaPathPrefixes.length > 0
            ? runtimeConfig.mediaPathPrefixes.map((prefix) => String(prefix || ''))
            : defaultMediaPathPrefixes;

        const BUSINESS_NAME =
          typeof runtimeConfig.businessName === 'string' && runtimeConfig.businessName
            ? runtimeConfig.businessName
            : 'English Plumber';
        const BASE_CITY =
          typeof runtimeConfig.baseCity === 'string' && runtimeConfig.baseCity
            ? runtimeConfig.baseCity
            : 'Medemblik';
        const WHATSAPP_NUMBER =
          typeof runtimeConfig.whatsappNumber === 'string' && runtimeConfig.whatsappNumber
            ? runtimeConfig.whatsappNumber
            : '+31 6 428 699 31';
        const PRIMARY_AREA =
          typeof runtimeConfig.primaryArea === 'string' && runtimeConfig.primaryArea
            ? runtimeConfig.primaryArea
            : 'Hoorn, Heerhugowaard, Purmerend, Alkmaar';
        const HERO_IMAGE_PATH =
          typeof runtimeConfig.heroImagePath === 'string' && runtimeConfig.heroImagePath
            ? runtimeConfig.heroImagePath
            : '/IMG_8233.PNG';
        const footerSectionConfig =
          runtimeConfig.footerSection && typeof runtimeConfig.footerSection === 'object'
            ? runtimeConfig.footerSection
            : {};
        const FOOTER_EMAIL_PLACEHOLDER =
          typeof footerSectionConfig.emailPlaceholder === 'string' && footerSectionConfig.emailPlaceholder.trim()
            ? footerSectionConfig.emailPlaceholder
            : 'Email*';
        const FOOTER_SUBSCRIBE_LABEL =
          typeof footerSectionConfig.subscribeLabel === 'string' && footerSectionConfig.subscribeLabel.trim()
            ? footerSectionConfig.subscribeLabel
            : 'Subscribe';
        const ENABLE_RUNTIME_COPY_REWRITE =
          typeof runtimeConfig.enableRuntimeCopyRewrite === 'boolean'
            ? runtimeConfig.enableRuntimeCopyRewrite
            : false;

        const exactTextReplacementEntries = Array.isArray(runtimeConfig.exactTextReplacements)
          ? runtimeConfig.exactTextReplacements
          : [];
        const exactTextReplacements = new Map(exactTextReplacementEntries);

        const regexTextReplacements = (Array.isArray(runtimeConfig.regexTextReplacements)
          ? runtimeConfig.regexTextReplacements
          : [])
          .map((entry) => {
            if (!entry || typeof entry !== 'object') return null;
            if (typeof entry.pattern !== 'string') return null;
            try {
              const regex = new RegExp(entry.pattern, typeof entry.flags === 'string' ? entry.flags : '');
              return [regex, typeof entry.replacement === 'string' ? entry.replacement : ''];
            } catch {
              return null;
            }
          })
          .filter(Boolean);

        if (exactTextReplacements.size === 0) {
          exactTextReplacements.set(
            'Geviti | Blood Testing & Personalized Longevity Care',
            `${BUSINESS_NAME} | Plumbing & Heating in ${BASE_CITY}`,
          );
        }

        if (regexTextReplacements.length === 0) {
          regexTextReplacements.push([/\bGeviti\b/g, BUSINESS_NAME]);
        }

        const copyAttributeNames = ['title', 'alt', 'aria-label', 'placeholder', 'content'];

        const normalizeTextValue = (value) => (value || '').replace(/\s+/g, ' ').trim();
        const rewriteCopyString = (value) => {
          if (!value) return value;
          const normalized = normalizeTextValue(value);
          if (normalized && exactTextReplacements.has(normalized)) {
            const replacement = exactTextReplacements.get(normalized) || normalized;
            const leading = value.match(/^\s*/)?.[0] || '';
            const trailing = value.match(/\s*$/)?.[0] || '';
            return `${leading}${replacement}${trailing}`;
          }

          let nextValue = value;
          for (const [pattern, replacement] of regexTextReplacements) {
            nextValue = nextValue.replace(pattern, replacement);
          }
          return nextValue;
        };

        const rewriteTextNodeCopy = (node) => {
          if (!(node instanceof Text)) return;
          const parent = node.parentElement;
          if (!parent) return;
          if (parent.closest('script,style,noscript')) return;
          const value = node.nodeValue;
          if (!value || !value.trim()) return;
          const nextValue = rewriteCopyString(value);
          if (nextValue !== value) {
            node.nodeValue = nextValue;
          }
        };

        const rewriteElementCopyAttrs = (element) => {
          if (!(element instanceof Element)) return;
          for (const attrName of copyAttributeNames) {
            const value = element.getAttribute(attrName);
            if (!value) continue;
            const nextValue = rewriteCopyString(value);
            if (nextValue !== value) {
              element.setAttribute(attrName, nextValue);
            }
          }
        };

        const rewriteDocumentMetadata = () => {
          document.title = `${BUSINESS_NAME} | Plumbing & Heating in ${BASE_CITY}`;
          const description = `${BUSINESS_NAME} is a friendly local plumber in ${BASE_CITY}. Boiler servicing, radiator repairs, tap repairs, and general plumbing handyman work. WhatsApp ${WHATSAPP_NUMBER}.`;
          document
            .querySelectorAll(
              'meta[name="description"],meta[property="og:description"],meta[name="twitter:description"]',
            )
            .forEach((meta) => meta.setAttribute('content', description));
          document
            .querySelectorAll('meta[property="og:title"],meta[name="twitter:title"]')
            .forEach((meta) => meta.setAttribute('content', document.title));
        };

        const rewriteCopyInRoot = (root) => {
          if (!(root instanceof Element || root instanceof Document)) return;

          if (root instanceof Element) {
            rewriteElementCopyAttrs(root);
          }

          const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
          let textNode = walker.nextNode();
          while (textNode) {
            rewriteTextNodeCopy(textNode);
            textNode = walker.nextNode();
          }

          root.querySelectorAll('*').forEach((element) => rewriteElementCopyAttrs(element));
          if (root instanceof Document || root === document.documentElement || root === document.body) {
            rewriteDocumentMetadata();
          }
        };

        const decodeHtmlEntities = (input) =>
          String(input || '')
            .replaceAll('&amp;', '&')
            .replaceAll('&quot;', '"')
            .replaceAll('&#x27;', "'")
            .replaceAll('&#39;', "'")
            .replaceAll('&lt;', '<')
            .replaceAll('&gt;', '>');

        const stripQueryAndHash = (input) => {
          const hashIndex = input.indexOf('#');
          const withoutHash = hashIndex === -1 ? input : input.slice(0, hashIndex);
          const queryIndex = withoutHash.indexOf('?');
          return queryIndex === -1 ? withoutHash : withoutHash.slice(0, queryIndex);
        };

        const normalizeLookupMediaPath = (value) => {
          if (!value) return null;
          let candidate = decodeHtmlEntities(value).trim();
          if (!candidate) return null;

          candidate = candidate.replace(/\\\//g, '/').replace(/\\+$/g, '');

          if (candidate.startsWith(`${MEDIA_ORIGIN}/_next/image?`) || candidate.startsWith('/_next/image?')) {
            try {
              const optimizerUrl = new URL(candidate, MEDIA_ORIGIN);
              const sourcePath = optimizerUrl.searchParams.get('url');
              if (sourcePath) {
                candidate = decodeURIComponent(sourcePath);
              }
            } catch {
              return null;
            }
          }

          if (candidate.startsWith('http://') || candidate.startsWith('https://')) {
            try {
              const parsed = new URL(candidate);
              if (parsed.origin !== MEDIA_ORIGIN) {
                return null;
              }
              candidate = `${parsed.pathname}${parsed.search}`;
            } catch {
              return null;
            }
          }

          if (!candidate.startsWith('/')) return null;
          return stripQueryAndHash(candidate);
        };

        const resolveLocalMediaUrl = (value) => {
          const normalizedPath = normalizeLookupMediaPath(value);
          if (!normalizedPath) return null;

          if (typeof localMediaMap[normalizedPath] === 'string') {
            return localMediaMap[normalizedPath];
          }

          const pathWithoutQuery = stripQueryAndHash(normalizedPath);
          if (typeof localMediaMap[pathWithoutQuery] === 'string') {
            return localMediaMap[pathWithoutQuery];
          }

          return null;
        };

        const isApiMediaPath = (value) => {
          const normalizedPath = normalizeLookupMediaPath(value);
          return Boolean(normalizedPath && normalizedPath.startsWith('/api/media/file/'));
        };

        const clampWidth = (value) => {
          if (!Number.isFinite(value) || value <= 0) return 1920;
          return Math.max(96, Math.min(3840, Math.round(value)));
        };

        const getWidthHintFromNode = (node) => {
          if (!(node instanceof Element)) return 1920;
          const widthAttr = Number.parseInt(node.getAttribute('width') || '', 10);
          if (Number.isFinite(widthAttr) && widthAttr > 0) {
            return clampWidth(widthAttr * 2);
          }
          return 1920;
        };

        const toMediaOptimizerUrl = (value, widthHint = 1920) => {
          const localUrl = resolveLocalMediaUrl(value);
          if (localUrl) return localUrl;

          const normalizedPath = normalizeLookupMediaPath(value);
          if (!normalizedPath || !normalizedPath.startsWith('/api/media/file/')) {
            return value;
          }

          const w = clampWidth(widthHint);
          return `${MEDIA_ORIGIN}/_next/image?url=${encodeURIComponent(normalizedPath)}&w=${w}&q=75`;
        };

        const absolutizeMediaUrl = (value) => {
          if (!value) return value;
          const trimmed = decodeHtmlEntities(value).trim();
          if (!trimmed) return trimmed;

          const localUrl = resolveLocalMediaUrl(trimmed);
          if (localUrl) {
            return localUrl;
          }

          if (isApiMediaPath(trimmed)) {
            return toMediaOptimizerUrl(trimmed, 1920);
          }

          const alreadyAbsolute =
            trimmed.startsWith('http://') ||
            trimmed.startsWith('https://') ||
            trimmed.startsWith('data:') ||
            trimmed.startsWith('blob:');
          if (alreadyAbsolute) {
            return trimmed;
          }

          if (mediaPathPrefixes.some((prefix) => trimmed.startsWith(prefix))) {
            return `${MEDIA_ORIGIN}${trimmed}`;
          }

          return trimmed;
        };

        const absolutizeSrcSet = (srcSetValue) => {
          if (!srcSetValue) return srcSetValue;

          return srcSetValue
            .split(',')
            .map((chunk) => {
              const token = chunk.trim();
              if (!token) return token;
              const splitIndex = token.search(/\s/);
              if (splitIndex === -1) {
                return absolutizeMediaUrl(token);
              }

              const urlPart = token.slice(0, splitIndex);
              const descriptor = token.slice(splitIndex);
              return `${absolutizeMediaUrl(urlPart)}${descriptor}`;
            })
            .join(', ');
        };

        const rewriteInlineStyleUrls = (styleValue) => {
          if (!styleValue) return styleValue;
          return styleValue.replace(
            /url\((['"]?)(\/(?:_next\/image\?|api\/media\/file\/|banner\/|reviews\/|footer\/|faq\.webp)[^'")]+)\1\)/gi,
            (_match, quote, path) => {
              return `url(${quote}${absolutizeMediaUrl(path)}${quote})`;
            },
          );
        };

        const rewriteNodeMediaUrls = (node) => {
          if (!(node instanceof Element)) return;

          const src = node.getAttribute('src');
          if (src) {
            const nextSrc = absolutizeMediaUrl(src);
            if (nextSrc !== src) node.setAttribute('src', nextSrc);
          }

          const href = node.getAttribute('href');
          if (href && node.tagName === 'LINK') {
            const nextHref = absolutizeMediaUrl(href);
            if (nextHref !== href) node.setAttribute('href', nextHref);
          }

          const srcSet = node.getAttribute('srcset');
          if (srcSet) {
            const nextSrcSet = absolutizeSrcSet(srcSet);
            if (nextSrcSet !== srcSet) node.setAttribute('srcset', nextSrcSet);
          }

          const imageSrcSet = node.getAttribute('imagesrcset');
          if (imageSrcSet) {
            const nextImageSrcSet = absolutizeSrcSet(imageSrcSet);
            if (nextImageSrcSet !== imageSrcSet) node.setAttribute('imagesrcset', nextImageSrcSet);
          }

          const style = node.getAttribute('style');
          if (style && style.includes('url(')) {
            const nextStyle = rewriteInlineStyleUrls(style);
            if (nextStyle !== style) node.setAttribute('style', nextStyle);
          }
        };

        const rewriteMediaUrlsInRoot = (root) => {
          if (!(root instanceof Element || root instanceof Document)) return;

          if (root instanceof Element) {
            rewriteNodeMediaUrls(root);
          }

          root.querySelectorAll('img,source,link,[style*="url("]').forEach((node) => {
            rewriteNodeMediaUrls(node);
          });
        };

        const enforceHeroImage = (root) => {
          if (!(root instanceof Element || root instanceof Document)) return;
          const heroSections = [];

          if (root instanceof Element && root.classList.contains('safe-h-screen')) {
            heroSections.push(root);
          }

          root
            .querySelectorAll('.safe-h-screen[data-theme="dark"], .safe-h-screen')
            .forEach((section) => heroSections.push(section));

          heroSections.forEach((section) => {
            if (!(section instanceof HTMLElement)) return;
            section.style.backgroundImage = `url('${HERO_IMAGE_PATH}')`;
            section.style.backgroundSize = 'cover';
            section.style.backgroundPosition = 'center center';
            section.style.backgroundRepeat = 'no-repeat';

            Array.from(section.children).forEach((child) => {
              if (!(child instanceof HTMLElement)) return;
              if (child.classList.contains('hero-video-wrapper')) return;

              const className = child.getAttribute('class') || '';
              const styleValue = child.getAttribute('style') || '';
              const isDarkOverlay =
                className.includes('-z-[9]') || styleValue.includes('#14191A') || styleValue.includes('#14191a');

              if (isDarkOverlay) {
                child.setAttribute('data-hide-hero-overlay', 'true');
              }
            });
          });

          const wrappers = [];

          if (root instanceof Element && root.classList.contains('hero-video-wrapper')) {
            wrappers.push(root);
          }

          root.querySelectorAll('.hero-video-wrapper').forEach((wrapper) => wrappers.push(wrapper));

          wrappers.forEach((wrapper) => {
            if (!(wrapper instanceof HTMLElement)) return;

            wrapper.style.backgroundImage = `url('${HERO_IMAGE_PATH}')`;
            wrapper.style.backgroundSize = 'cover';
            wrapper.style.backgroundPosition = 'center center';
            wrapper.style.backgroundRepeat = 'no-repeat';
            wrapper.style.zIndex = '0';
            wrapper.style.overflow = 'hidden';

            wrapper.querySelectorAll('video,iframe,canvas').forEach((media) => {
              if (media instanceof HTMLVideoElement) {
                try {
                  media.pause();
                } catch {}
              }
              media.setAttribute('aria-hidden', 'true');
              media.style.display = 'none';
              media.style.pointerEvents = 'none';
            });

            Array.from(wrapper.children).forEach((child) => {
              if (
                child instanceof HTMLImageElement &&
                child.getAttribute('data-hero-image') === 'english-plumber'
              ) {
                return;
              }
              child.remove();
            });

            let image = wrapper.querySelector('img[data-hero-image="english-plumber"]');
            if (!(image instanceof HTMLImageElement)) {
              image = document.createElement('img');
              image.setAttribute('data-hero-image', 'english-plumber');
              image.setAttribute('alt', 'English Plumber hero image');
              image.setAttribute('loading', 'eager');
              image.setAttribute('decoding', 'async');
              image.setAttribute('fetchpriority', 'high');
              image.setAttribute('aria-hidden', 'true');
              image.className = 'absolute inset-0 w-full h-full object-cover object-center';
              image.style.pointerEvents = 'none';
              image.style.zIndex = '0';
              wrapper.append(image);
            }

            if (image.getAttribute('src') !== HERO_IMAGE_PATH) {
              image.setAttribute('src', HERO_IMAGE_PATH);
            }
          });
        };

        const markHidden = (element, marker = 'flash-sale') => {
          if (element && element instanceof HTMLElement) {
            element.setAttribute(promoMarker, marker);
            element.setAttribute('aria-hidden', 'true');
            element.style.setProperty('display', 'none', 'important');
            element.style.setProperty('visibility', 'hidden', 'important');
            element.style.setProperty('pointer-events', 'none', 'important');
            element.style.setProperty('opacity', '0', 'important');
          }
        };

        const isGiftTriggerButton = (element) => {
          if (!(element instanceof Element) || element.tagName !== 'BUTTON') return false;
          const text = normalize(element.textContent);
          if (text.includes('🎁')) return true;
          if (element.matches('button.fixed.bottom-5.left-5.z-40.hover\\:scale-110.transition-transform')) {
            return true;
          }
          return false;
        };

        const isDiscountDialog = (element) => {
          if (!(element instanceof Element)) return false;
          if (element.getAttribute('role') !== 'dialog') return false;

          const text = normalize(element.textContent);
          if (promoNeedles.some((needle) => text.includes(needle))) return true;

          if (element.querySelector('img[alt*="percent off" i], img[src*="25percentoff"], img[src*="/banner/"]')) {
            return true;
          }

          if (
            element.querySelector('button[type="submit"]') &&
            element.querySelector('input#name') &&
            element.querySelector('input#email')
          ) {
            return true;
          }

          return false;
        };

        const hideNearbyOverlays = (dialog) => {
          if (!(dialog instanceof Element)) return;
          const container = dialog.parentElement || document.body;
          container.querySelectorAll('[data-state="open"]').forEach((candidate) => {
            if (!(candidate instanceof Element)) return;
            if (candidate === dialog) return;
            if (candidate.getAttribute('role') === 'dialog') return;

            const className = (candidate.getAttribute('class') || '').toLowerCase();
            const looksLikeOverlay =
              className.includes('inset-0') ||
              className.includes('backdrop') ||
              className.includes('overlay') ||
              className.includes('bg-black');

            if (looksLikeOverlay) {
              markHidden(candidate, 'overlay');
            }
          });
        };

        const hidePromoInRoot = (root) => {
          if (!(root instanceof Element || root instanceof Document)) return;

          root.querySelectorAll('button').forEach((button) => {
            if (isGiftTriggerButton(button)) {
              markHidden(button);
            }
          });

          root.querySelectorAll('[role="dialog"]').forEach((dialog) => {
            if (isDiscountDialog(dialog)) {
              markHidden(dialog);
              hideNearbyOverlays(dialog);
            }
          });

          if (root instanceof Element) {
            if (isGiftTriggerButton(root)) {
              markHidden(root);
            }
            if (isDiscountDialog(root)) {
              markHidden(root);
              hideNearbyOverlays(root);
            }
          }
        };

        const hasVisibleDialog = () => {
          const candidates = document.querySelectorAll('[role="dialog"], [aria-modal="true"], [data-state="open"]');
          for (const node of candidates) {
            if (!(node instanceof HTMLElement)) continue;
            if (node.getAttribute(promoMarker)) continue;
            const style = window.getComputedStyle(node);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
            if (node.getBoundingClientRect().width <= 0 || node.getBoundingClientRect().height <= 0) continue;
            return true;
          }
          return false;
        };

        const unlockInteractionLocks = () => {
          if (hasVisibleDialog()) return;

          const roots = [document.documentElement, document.body];
          roots.forEach((root) => {
            if (!(root instanceof HTMLElement)) return;

            if (root.style.pointerEvents === 'none') {
              root.style.setProperty('pointer-events', 'auto', 'important');
            }

            if (root.style.overflow === 'hidden') {
              root.style.removeProperty('overflow');
            }

            if (root.style.touchAction === 'none') {
              root.style.removeProperty('touch-action');
            }

            root.removeAttribute('inert');
            root.removeAttribute('data-scroll-locked');
          });

          document.querySelectorAll('#__next[inert], main[inert], [aria-hidden="true"][data-state="open"]').forEach((node) => {
            if (node instanceof HTMLElement) {
              node.removeAttribute('inert');
              if (node.getAttribute(promoMarker)) {
                node.removeAttribute('aria-hidden');
              }
            }
          });
        };

        const rewriteFooterFormInRoot = (root) => {
          if (!(root instanceof Element || root instanceof Document)) return;

          const footers = [];
          if (root instanceof Document) {
            footers.push(...root.querySelectorAll('footer'));
          } else {
            if (root.matches('footer')) {
              footers.push(root);
            }
            footers.push(...root.querySelectorAll('footer'));
          }

          for (const footer of footers) {
            const emailInput = footer.querySelector('input[type="email"]');
            if (emailInput instanceof HTMLInputElement && emailInput.placeholder !== FOOTER_EMAIL_PLACEHOLDER) {
              emailInput.placeholder = FOOTER_EMAIL_PLACEHOLDER;
            }

            const subscribeButton = footer.querySelector('form button');
            if (subscribeButton instanceof HTMLButtonElement) {
              const current = (subscribeButton.textContent || '').replace(/\s+/g, ' ').trim();
              if (current !== FOOTER_SUBSCRIBE_LABEL) {
                subscribeButton.textContent = FOOTER_SUBSCRIBE_LABEL;
              }
            }
          }
        };

        const run = () => {
          rewriteMediaUrlsInRoot(document);
          enforceHeroImage(document);
          hidePromoInRoot(document);
          if (ENABLE_RUNTIME_COPY_REWRITE) {
            rewriteCopyInRoot(document);
          }
          rewriteFooterFormInRoot(document);
          unlockInteractionLocks();
        };

        document.addEventListener(
          'click',
          (event) => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            const button = target.closest('button');
            if (!button) return;
            if (isGiftTriggerButton(button)) {
              event.preventDefault();
              event.stopImmediatePropagation();
              markHidden(button);
            }
          },
          true,
        );

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', run, { once: true });
        } else {
          run();
        }

        window.setTimeout(() => {
          hidePromoInRoot(document);
          if (ENABLE_RUNTIME_COPY_REWRITE) {
            rewriteCopyInRoot(document);
          }
          rewriteFooterFormInRoot(document);
          unlockInteractionLocks();
        }, 1200);

        const interactionWatchdog = window.setInterval(() => {
          hidePromoInRoot(document);
          unlockInteractionLocks();
        }, 400);

        const runWatchdogPass = () => {
          hidePromoInRoot(document);
          unlockInteractionLocks();
        };

        document.addEventListener('visibilitychange', runWatchdogPass);
        window.addEventListener('focus', runWatchdogPass);
        window.addEventListener('pointerdown', runWatchdogPass, true);
        window.addEventListener('beforeunload', () => {
          window.clearInterval(interactionWatchdog);
        });

        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            for (const addedNode of mutation.addedNodes) {
              if (addedNode instanceof Element) {
                rewriteMediaUrlsInRoot(addedNode);
                enforceHeroImage(addedNode);
                hidePromoInRoot(addedNode);
                if (ENABLE_RUNTIME_COPY_REWRITE) {
                  rewriteCopyInRoot(addedNode);
                }
                rewriteFooterFormInRoot(addedNode);
                unlockInteractionLocks();
              }
            }
          }
        });

        observer.observe(document.documentElement, {
          childList: true,
          subtree: true,
        });
      })();
