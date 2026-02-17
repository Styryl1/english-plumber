import fs from 'node:fs';
import path from 'node:path';

const SOURCE_PATH = path.join(process.cwd(), 'src/mirror/live-index.html');
const INJECTION_DIR = path.join(process.cwd(), 'src/mirror/injections');
const SITE_CONTENT_PATH = path.join(process.cwd(), 'content/site/mirror-content.json');
const MEDIA_MANIFEST_PATH = path.join(process.cwd(), 'src/generated/media-manifest.json');
const LEGACY_NEXT_PREFIX = '/_next/static/';
const LOCAL_MIRROR_NEXT_PREFIX = '/mirror_next/static/';

function decodeEntities(input) {
  return input
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function escapeAttr(input) {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function extractOpenTag(sourceHtml, tagName) {
  const match = sourceHtml.match(new RegExp(`<${tagName}\\b[^>]*>`, 'i'));
  return match ? match[0] : '';
}

function extractInner(sourceHtml, tagName) {
  const match = sourceHtml.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return match ? match[1] : '';
}

function parseAttrs(openTag, tagName) {
  const attrs = {};
  if (!openTag) return attrs;

  const tagOnlyPattern = new RegExp(`^<${tagName}\\b|>$`, 'gi');
  const attrSource = openTag.replace(tagOnlyPattern, '');
  const attrPattern = /([:@A-Za-z0-9_-]+)(?:="([^"]*)")?/g;

  for (const match of attrSource.matchAll(attrPattern)) {
    const key = match[1];
    if (!key) continue;
    const value = match[2] ? decodeEntities(match[2]) : '';
    attrs[key] = value;
  }

  return attrs;
}

function attrsToString(attrs) {
  return Object.entries(attrs)
    .map(([name, value]) => {
      if (value === '') return name;
      return `${name}="${escapeAttr(value)}"`;
    })
    .join(' ');
}

function loadInjection(fileName) {
  const fullPath = path.join(INJECTION_DIR, fileName);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing injection file: ${path.relative(process.cwd(), fullPath)}`);
  }
  return fs.readFileSync(fullPath, 'utf-8').trim();
}

function loadJson(filePath, fallbackValue) {
  if (!fs.existsSync(filePath)) return fallbackValue;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return fallbackValue;
  }
}

function stringifyForInlineScript(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

function attrSection(value) {
  return value ? ` ${value}` : '';
}

export function renderMirrorHtml() {
  if (!fs.existsSync(SOURCE_PATH)) {
    throw new Error('Missing src/mirror/live-index.html. Run: npm run clone:live');
  }

  const sourceHtml = fs.readFileSync(SOURCE_PATH, 'utf-8');

  const htmlAttrs = parseAttrs(extractOpenTag(sourceHtml, 'html'), 'html');
  const bodyAttrs = parseAttrs(extractOpenTag(sourceHtml, 'body'), 'body');

  const htmlLang = htmlAttrs.lang || 'en';
  const htmlClass = htmlAttrs.class || '';
  const bodyClass = bodyAttrs.class || '';

  delete htmlAttrs.lang;
  delete htmlAttrs.class;
  delete bodyAttrs.class;

  let headInner = extractInner(sourceHtml, 'head');
  let bodyInner = extractInner(sourceHtml, 'body');

  // Avoid Next.js reserved /_next conflicts by remapping mirrored bundle assets.
  headInner = headInner.replaceAll(LEGACY_NEXT_PREFIX, LOCAL_MIRROR_NEXT_PREFIX);
  bodyInner = bodyInner.replaceAll(LEGACY_NEXT_PREFIX, LOCAL_MIRROR_NEXT_PREFIX);

  const htmlAttrString = attrsToString(htmlAttrs);
  const bodyAttrString = attrsToString(bodyAttrs);

  const guardScript = loadInjection('guard.js');
  const overridesCss = loadInjection('overrides.css');
  const runtimeScript = loadInjection('runtime.js');
  const siteContent = loadJson(SITE_CONTENT_PATH, {});
  const siteRuntimeContent =
    siteContent && typeof siteContent === 'object' && siteContent.site && typeof siteContent.site === 'object'
      ? siteContent.site
      : {};
  const mediaManifest = loadJson(MEDIA_MANIFEST_PATH, {});
  const mediaMap =
    mediaManifest && typeof mediaManifest === 'object' && mediaManifest.media && typeof mediaManifest.media === 'object'
      ? mediaManifest.media
      : {};
  const siteContentScript = `window.__MIRROR_SITE_CONTENT__=${stringifyForInlineScript(siteRuntimeContent)};`;
  const mediaMapScript = `window.__MIRROR_MEDIA_MAP__=${stringifyForInlineScript(mediaMap)};`;

  const langAttr = ` lang="${escapeAttr(htmlLang)}"`;
  const htmlClassAttr = htmlClass ? ` class="${escapeAttr(htmlClass)}"` : '';
  const bodyClassAttr = bodyClass ? ` class="${escapeAttr(bodyClass)}"` : '';

  return `<!DOCTYPE html><html${langAttr}${htmlClassAttr}${attrSection(htmlAttrString)}><head><script>${guardScript}</script>${headInner}<style>${overridesCss}</style><script>${siteContentScript}${mediaMapScript}</script><script>${runtimeScript}</script></head><body${bodyClassAttr}${attrSection(bodyAttrString)}>${bodyInner}</body></html>`;
}
