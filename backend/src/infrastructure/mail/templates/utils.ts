// src/infrastructure/mail/templates/utils.ts
import { readFile } from 'fs/promises';

/** Mini moteur de template: remplace {{clé}} par data[clé] (string). */
export function tinyRender(tpl: string, data: Record<string, string | number | boolean | undefined>) {
  return tpl.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, k) => {
    const v = data[k];
    return v === undefined || v === null ? '' : String(v);
  });
}

/** Lit un fichier template (utf-8) situé dans CE dossier (même répertoire que utils.ts). */
export async function readLocalTemplate(fileName: string) {
  const url = new URL(`./${fileName}`, import.meta.url);
  return readFile(url, 'utf-8');
}

/** Rend un template HTML (ex: "activation.html") avec le layout "layout.html". */
export async function renderTemplate(
  viewFile: string,
  data: Record<string, string | number | boolean | undefined> = {}
) {
  const [layout, view] = await Promise.all([
    readLocalTemplate('layout.html'),
    readLocalTemplate(viewFile),
  ]);

  const content = tinyRender(view, data);
  // Le layout doit contenir {{content}} pour injecter la vue
  const html = tinyRender(layout, { ...data, content });
  return html;
}

/** Charge un asset (ex: SVG) et le renvoie en data URI (inline base64 ou texte brut). */
export async function loadAssetAsDataUri(relativePathFromHere: string, mime: string) {
  const url = new URL(relativePathFromHere, import.meta.url);
  const buf = await readFile(url);
  // SVG: mieux en UTF-8 + URI-encode (pas besoin de base64)
  if (mime === 'image/svg+xml') {
    const svg = buf.toString('utf-8');
    const encoded = encodeURIComponent(svg)
      .replace(/'/g, '%27')
      .replace(/"/g, '%22');
    return `data:image/svg+xml;charset=utf-8,${encoded}`;
  }
  // Par défaut, base64
  const b64 = buf.toString('base64');
  return `data:${mime};base64,${b64}`;
}