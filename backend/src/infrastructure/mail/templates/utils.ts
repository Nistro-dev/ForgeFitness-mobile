import { readFile } from 'fs/promises';

export function tinyRender(tpl: string, data: Record<string, string | number | boolean | undefined>) {
  return tpl.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, k) => {
    const v = data[k];
    return v === undefined || v === null ? '' : String(v);
  });
}

export async function readLocalTemplate(fileName: string) {
  const url = new URL(`./${fileName}`, import.meta.url);
  return readFile(url, 'utf-8');
}

export async function renderTemplate(
  viewFile: string,
  data: Record<string, string | number | boolean | undefined> = {}
) {
  const [layout, view] = await Promise.all([
    readLocalTemplate('layout.html'),
    readLocalTemplate(viewFile),
  ]);

  const content = tinyRender(view, data);
  const html = tinyRender(layout, { ...data, content });
  return html;
}

export async function loadAssetAsDataUri(relativePathFromHere: string, mime: string) {
  const url = new URL(relativePathFromHere, import.meta.url);
  const buf = await readFile(url);
  if (mime === 'image/svg+xml') {
    const svg = buf.toString('utf-8');
    const encoded = encodeURIComponent(svg)
      .replace(/'/g, '%27')
      .replace(/"/g, '%22');
    return `data:image/svg+xml;charset=utf-8,${encoded}`;
  }
  const b64 = buf.toString('base64');
  return `data:${mime};base64,${b64}`;
}