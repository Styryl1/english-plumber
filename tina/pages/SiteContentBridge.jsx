import { useEffect } from 'react';
import { tinaField, useTina } from 'tinacms/dist/react';

const OMIT_KEYS = new Set(['__typename', '_sys', 'id']);
const MANAGED_ATTR = 'data-managed-tina-field';
const MANAGED_VALUE = 'site-copy';

const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const buildFieldMap = (node, prefix = '') => {
  if (!isRecord(node)) return {};

  return Object.entries(node).reduce((acc, [key, value]) => {
    if (OMIT_KEYS.has(key) || key.startsWith('_')) return acc;

    const pathKey = prefix ? `${prefix}.${key}` : key;
    const fieldId = tinaField(node, key);
    if (fieldId) {
      acc[pathKey] = fieldId;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const indexKey = `${pathKey}.${index}`;
        const itemFieldId = tinaField(node, key, index);
        if (itemFieldId) {
          acc[indexKey] = itemFieldId;
        }

        if (isRecord(item)) {
          const objectFieldId = tinaField(item);
          if (objectFieldId) {
            acc[indexKey] = objectFieldId;
          }
          Object.assign(acc, buildFieldMap(item, indexKey));
        }
      });

      return acc;
    }

    if (isRecord(value)) {
      const objectFieldId = tinaField(value);
      if (objectFieldId) {
        acc[pathKey] = objectFieldId;
      }
      Object.assign(acc, buildFieldMap(value, pathKey));
    }

    return acc;
  }, {});
};

const isInIframe = () => {
  try {
    return window.self !== window.top;
  } catch {
    return false;
  }
};

const clearManagedFields = () => {
  document.querySelectorAll(`[${MANAGED_ATTR}="${MANAGED_VALUE}"]`).forEach((element) => {
    element.removeAttribute('data-tina-field');
    element.removeAttribute(MANAGED_ATTR);
  });
};

const applyInlineFieldBindings = (fieldMap) => {
  if (!isInIframe()) return;

  clearManagedFields();

  document.querySelectorAll('[data-site-field]').forEach((element) => {
    const fieldName = element.getAttribute('data-site-field');
    if (!fieldName) return;
    const fieldId = fieldMap[fieldName];
    if (!fieldId) return;
    element.setAttribute('data-tina-field', fieldId);
    element.setAttribute(MANAGED_ATTR, MANAGED_VALUE);
  });
};

const SiteContentBridge = (props) => {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });

  const site = data?.site || {};

  useEffect(() => {
    const fieldMap = buildFieldMap(site);

    window.__SITE_CONTENT__ = site;
    window.__SITE_TINA_FIELDS__ = fieldMap;
    applyInlineFieldBindings(fieldMap);
  }, [site]);

  return null;
};

export default SiteContentBridge;
