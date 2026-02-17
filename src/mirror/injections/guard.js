      (() => {
        const originalAppendChild = Element.prototype.appendChild;
        const originalInsertBefore = Element.prototype.insertBefore;

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
