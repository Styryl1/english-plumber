      (() => {
        const originalAppendChild = Element.prototype.appendChild;
        const originalInsertBefore = Element.prototype.insertBefore;
        const LEGACY_NEXT_STATIC_PREFIX = '/_next/static/';
        const MIRROR_NEXT_STATIC_PREFIX = '/mirror_next/static/';
        const CHUNK_PREFIX = `${LEGACY_NEXT_STATIC_PREFIX}chunks/`;
        const MIRROR_CHUNK_PREFIX = `${MIRROR_NEXT_STATIC_PREFIX}chunks/`;
        const DYNAMIC_CHUNK_FALLBACKS = new Set([
          '5831.c37a45104c7088c5.js',
          'eef9e134.c908f66ddec4a448.js',
        ]);

        const rewriteMirrorStaticUrl = (value) => {
          if (!value || typeof value !== 'string') return value;
          const trimmed = value.trim();
          if (!trimmed) return trimmed;

          try {
            const parsed = new URL(trimmed, window.location.href);
            const sameOrigin = parsed.origin === window.location.origin;
            if (!sameOrigin) return trimmed;
            if (
              parsed.pathname.startsWith(CHUNK_PREFIX) ||
              parsed.pathname.startsWith(MIRROR_CHUNK_PREFIX)
            ) {
              const chunkPrefix = parsed.pathname.startsWith(MIRROR_CHUNK_PREFIX)
                ? MIRROR_CHUNK_PREFIX
                : CHUNK_PREFIX;
              const fileName = parsed.pathname.slice(chunkPrefix.length).split('/').pop() || '';
              if (DYNAMIC_CHUNK_FALLBACKS.has(fileName)) {
                return `/mirror_dynamic_chunks/${fileName}${parsed.search}${parsed.hash}`;
              }
            }
            if (!parsed.pathname.startsWith(LEGACY_NEXT_STATIC_PREFIX)) return trimmed;
            const rewrittenPathname = `${MIRROR_NEXT_STATIC_PREFIX}${parsed.pathname.slice(
              LEGACY_NEXT_STATIC_PREFIX.length,
            )}`;
            return `${rewrittenPathname}${parsed.search}${parsed.hash}`;
          } catch {
            if (!trimmed.startsWith(LEGACY_NEXT_STATIC_PREFIX)) return trimmed;
            return `${MIRROR_NEXT_STATIC_PREFIX}${trimmed.slice(LEGACY_NEXT_STATIC_PREFIX.length)}`;
          }
        };

        const rewriteNodeAssetPath = (node) => {
          if (node instanceof HTMLScriptElement) {
            const rawSrc = node.getAttribute('src') || node.src || '';
            const rewrittenSrc = rewriteMirrorStaticUrl(rawSrc);
            if (rewrittenSrc && rewrittenSrc !== rawSrc) {
              node.setAttribute('src', rewrittenSrc);
            }
            return;
          }

          if (node instanceof HTMLLinkElement) {
            const rawHref = node.getAttribute('href') || node.href || '';
            const rewrittenHref = rewriteMirrorStaticUrl(rawHref);
            if (rewrittenHref && rewrittenHref !== rawHref) {
              node.setAttribute('href', rewrittenHref);
            }
          }
        };

        const shouldBlockRemoteScript = (node) => {
          if (!(node instanceof HTMLScriptElement)) return false;

          const rawSrc = (node.getAttribute('src') || node.src || '').trim();
          if (!rawSrc) return false;
          if (rawSrc.startsWith('/')) return false;

          try {
            const parsed = new URL(rawSrc, window.location.href);
            const isRemote = parsed.origin !== window.location.origin;
            if (!isRemote) return false;
            return true;
          } catch {
            return false;
          }
        };

        const guardInsertion = (node) => {
          rewriteNodeAssetPath(node);
          if (shouldBlockRemoteScript(node)) {
            return false;
          }
          return true;
        };

        Element.prototype.appendChild = function appendChildGuard(node) {
          if (!guardInsertion(node)) return node;
          return originalAppendChild.call(this, node);
        };

        Element.prototype.insertBefore = function insertBeforeGuard(node, child) {
          if (!guardInsertion(node)) return node;
          return originalInsertBefore.call(this, node, child);
        };
      })();
