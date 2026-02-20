import { renderMirrorHtml } from '../src/mirror/render-mirror-html.js';

export async function getServerSideProps(context) {
  const { res } = context;

  try {
    const html = renderMirrorHtml();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(html);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown render error';
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(`Failed to render mirrored route: ${message}`);
  }

  return { props: {} };
}

export default function MirrorRoutePage() {
  return null;
}
