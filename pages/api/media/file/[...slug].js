import fs from 'node:fs';
import path from 'node:path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const LOCAL_MEDIA_DIR = path.join(PUBLIC_DIR, 'api', 'media', 'file');
const MEDIA_MANIFEST_PATH = path.join(process.cwd(), 'src', 'generated', 'media-manifest.json');
const DEFAULT_IMAGE_FALLBACK = '/mirror_media/Metabolic-Health-837fa0eb3f.png';

const CONTENT_TYPES = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

let cachedManifestMtimeMs = -1;
let cachedManifestMap = {};

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeRelativePath(value) {
  return String(value || '')
    .replace(/^\/+/, '')
    .replace(/\\/g, '/');
}

function resolvePublicFile(relativePath) {
  const normalized = normalizeRelativePath(relativePath);
  if (!normalized) return null;

  const fullPath = path.normalize(path.join(PUBLIC_DIR, normalized));
  if (!fullPath.startsWith(`${PUBLIC_DIR}${path.sep}`)) return null;
  if (!fs.existsSync(fullPath)) return null;
  if (!fs.statSync(fullPath).isFile()) return null;
  return fullPath;
}

function resolveLocalMediaFile(fileName) {
  const normalized = normalizeRelativePath(fileName);
  if (!normalized) return null;

  const fullPath = path.normalize(path.join(LOCAL_MEDIA_DIR, normalized));
  if (!fullPath.startsWith(`${LOCAL_MEDIA_DIR}${path.sep}`)) return null;
  if (!fs.existsSync(fullPath)) return null;
  if (!fs.statSync(fullPath).isFile()) return null;
  return fullPath;
}

function loadManifestMap() {
  if (!fs.existsSync(MEDIA_MANIFEST_PATH)) return {};

  const stats = fs.statSync(MEDIA_MANIFEST_PATH);
  if (stats.mtimeMs === cachedManifestMtimeMs) {
    return cachedManifestMap;
  }

  cachedManifestMtimeMs = stats.mtimeMs;
  try {
    const parsed = JSON.parse(fs.readFileSync(MEDIA_MANIFEST_PATH, 'utf-8'));
    cachedManifestMap =
      parsed && typeof parsed === 'object' && parsed.media && typeof parsed.media === 'object'
        ? parsed.media
        : {};
  } catch {
    cachedManifestMap = {};
  }

  return cachedManifestMap;
}

function buildManifestKeyVariants(rawFilePath) {
  const raw = String(rawFilePath || '').replace(/^\/+/, '');
  if (!raw) return [];

  const decoded = safeDecode(raw).replace(/\+/g, ' ');
  const encoded = encodeURIComponent(decoded).replaceAll('%2F', '/');
  const plusVariant = decoded.replaceAll(' ', '+');

  const prefixed = [raw, decoded, encoded, plusVariant].map((value) => `/api/media/file/${value}`);
  return [...new Set(prefixed)];
}

function getContentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return CONTENT_TYPES[extension] || 'application/octet-stream';
}

function sendFile(res, filePath) {
  const contentType = getContentType(filePath);
  const data = fs.readFileSync(filePath);
  res.statusCode = 200;
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.end(data);
}

function tryResolveFromManifest(rawFilePath) {
  const manifestMap = loadManifestMap();
  for (const key of buildManifestKeyVariants(rawFilePath)) {
    const mapped = manifestMap[key];
    if (typeof mapped !== 'string' || !mapped.startsWith('/')) continue;
    const resolved = resolvePublicFile(mapped);
    if (resolved) return resolved;
  }
  return null;
}

export default function handler(req, res) {
  const slug = req.query.slug;
  const slugParts = Array.isArray(slug) ? slug : typeof slug === 'string' ? [slug] : [];

  if (slugParts.length === 0) {
    res.statusCode = 404;
    res.end('Not Found');
    return;
  }

  const rawName = slugParts.join('/');
  const candidates = [
    rawName,
    rawName.replaceAll('+', ' '),
    safeDecode(rawName),
    safeDecode(rawName).replaceAll('+', ' '),
  ];

  for (const candidate of [...new Set(candidates)]) {
    const directFile = resolveLocalMediaFile(candidate);
    if (directFile) {
      sendFile(res, directFile);
      return;
    }
  }

  for (const candidate of [...new Set(candidates)]) {
    const mappedFile = tryResolveFromManifest(candidate);
    if (mappedFile) {
      sendFile(res, mappedFile);
      return;
    }
  }

  // JSON animation requests can still recover with an empty payload.
  if (rawName.toLowerCase().endsWith('.json')) {
    res.statusCode = 200;
    res.setHeader('Content-Type', CONTENT_TYPES['.json']);
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.end('{}');
    return;
  }

  const fallbackImage = resolvePublicFile(DEFAULT_IMAGE_FALLBACK);
  if (fallbackImage) {
    sendFile(res, fallbackImage);
    return;
  }

  res.statusCode = 404;
  res.end('Not Found');
}
