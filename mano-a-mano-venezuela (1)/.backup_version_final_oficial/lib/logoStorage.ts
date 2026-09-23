import { isHeicFile, decodeHeicToCanvas, decodeStandardImageToCanvas } from './galleryStorage';
import customBrandDataRaw from './customBrandData.json';

const DB_NAME = 'brigada99_gallery_db';
const STORE_NAME = 'brand_logos';
const DB_VERSION = 3;

const LS_PRIMARY_KEY = 'mmv_custom_logo_primary';
const LS_FOOTER_KEY = 'mmv_custom_logo_footer';
const LS_EMBLEM_KEY = 'mmv_custom_emblem_logo';
const LS_HEIGHT_KEY = 'mmv_custom_logo_height';

export interface LogoConfig {
  primaryUrl: string | null;
  footerUrl: string | null;
  emblemUrl?: string | null;
  heightPx: number;
}

function openLogoDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
        if (!db.objectStoreNames.contains('gallery_photos')) {
          db.createObjectStore('gallery_photos');
        }
        if (!db.objectStoreNames.contains('project_logos')) {
          db.createObjectStore('project_logos');
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        try {
          const fallbackReq = indexedDB.open(DB_NAME);
          fallbackReq.onsuccess = () => resolve(fallbackReq.result);
          fallbackReq.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
        } catch {
          reject(request.error || new Error('Failed to open IndexedDB'));
        }
      };
    } catch {
      try {
        const fallbackReq = indexedDB.open(DB_NAME);
        fallbackReq.onsuccess = () => resolve(fallbackReq.result);
        fallbackReq.onerror = () => reject(new Error('Failed to open IndexedDB'));
      } catch (err) {
        reject(err);
      }
    }
  });
}

/**
 * Loads current logo settings from IndexedDB / localStorage.
 */
export async function loadLogoConfig(): Promise<LogoConfig> {
  let primaryUrl: string | null = null;
  let footerUrl: string | null = null;
  let emblemUrl: string | null = null;
  let heightPx = 52; // Default height in pixels

  try {
    const savedHeight = localStorage.getItem(LS_HEIGHT_KEY);
    if (savedHeight) {
      const parsed = parseInt(savedHeight, 10);
      if (!isNaN(parsed) && parsed >= 28 && parsed <= 120) {
        heightPx = parsed;
      }
    }

    primaryUrl = localStorage.getItem(LS_PRIMARY_KEY);
    footerUrl = localStorage.getItem(LS_FOOTER_KEY);
    emblemUrl = localStorage.getItem(LS_EMBLEM_KEY);
  } catch {
    // ignore
  }

  // Also try IndexedDB for larger image payloads
  try {
    const db = await openLogoDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    const pReq = store.get('primary_logo');
    const fReq = store.get('footer_logo');
    const eReq = store.get('emblem_logo');

    await new Promise<void>((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });

    if (pReq.result) primaryUrl = pReq.result;
    if (fReq.result) footerUrl = fReq.result;
    if (eReq.result) emblemUrl = eReq.result;
  } catch {
    // fallback to localStorage
  }

  // Check bundled logos in customBrandData.json (for published production site)
  try {
    const bundled = (customBrandDataRaw as any)?.logos;
    if (!primaryUrl && bundled?.primaryUrl) {
      primaryUrl = bundled.primaryUrl;
    }
    if (!footerUrl && bundled?.footerUrl) {
      footerUrl = bundled.footerUrl;
    }
    if (!emblemUrl && bundled?.emblemUrl) {
      emblemUrl = bundled.emblemUrl;
    }
    if (bundled?.heightPx && typeof bundled.heightPx === 'number') {
      heightPx = bundled.heightPx;
    }
  } catch {
    // fallback
  }

  return { primaryUrl, footerUrl, emblemUrl, heightPx };
}

/**
 * Saves a custom emblem and notifies the application.
 */
export async function saveCustomEmblemLogo(dataUrl: string): Promise<void> {
  try {
    localStorage.setItem(LS_EMBLEM_KEY, dataUrl);
  } catch (err) {
    console.warn('LocalStorage quota warning for emblem:', err);
  }

  try {
    const db = await openLogoDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(dataUrl, 'emblem_logo');
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB write error for emblem:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mmv_emblem_updated', { detail: { dataUrl } }));
    window.dispatchEvent(new CustomEvent('mmv_logo_updated', { detail: { type: 'emblem', dataUrl } }));
  }
}

/**
 * Saves a custom logo and notifies the application.
 */
export async function saveCustomLogo(type: 'primary' | 'footer', dataUrl: string): Promise<void> {
  const lsKey = type === 'primary' ? LS_PRIMARY_KEY : LS_FOOTER_KEY;
  const idbKey = type === 'primary' ? 'primary_logo' : 'footer_logo';

  try {
    localStorage.setItem(lsKey, dataUrl);
  } catch (err) {
    console.warn('LocalStorage quota warning for logo:', err);
  }

  try {
    const db = await openLogoDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(dataUrl, idbKey);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB write error for logo:', err);
  }

  // Dispatch custom event for real-time app update
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mmv_logo_updated', { detail: { type, dataUrl } }));
  }
}

/**
 * Saves custom display height for the logos in pixels.
 */
export function saveLogoHeight(heightPx: number): void {
  try {
    localStorage.setItem(LS_HEIGHT_KEY, heightPx.toString());
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mmv_logo_updated', { detail: { type: 'height', heightPx } }));
  }
}

/**
 * Resets both logos to original defaults.
 */
export async function resetCustomLogos(): Promise<void> {
  try {
    localStorage.removeItem(LS_PRIMARY_KEY);
    localStorage.removeItem(LS_FOOTER_KEY);
    localStorage.removeItem(LS_EMBLEM_KEY);
    localStorage.removeItem(LS_HEIGHT_KEY);
  } catch {
    // ignore
  }

  try {
    const db = await openLogoDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete('primary_logo');
    store.delete('footer_logo');
    store.delete('emblem_logo');
    await new Promise<void>((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // ignore
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mmv_logo_updated', { detail: { type: 'reset' } }));
  }
}

/**
 * Processes an uploaded logo file preserving PNG/SVG transparency and sharpness.
 * Converts HEIC/large images to high-quality PNG.
 */
export async function processLogoFile(file: File): Promise<string> {
  const isSvg = file.type.includes('svg') || file.name.toLowerCase().endsWith('.svg');
  if (isSvg) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Error al leer el archivo SVG.'));
      reader.readAsDataURL(file);
    });
  }

  let canvas: HTMLCanvasElement;
  const isHeic = await isHeicFile(file);

  if (isHeic) {
    canvas = await decodeHeicToCanvas(file);
  } else {
    canvas = await decodeStandardImageToCanvas(file);
  }

  const maxW = 1000;
  const maxH = 500;
  let targetW = canvas.width;
  let targetH = canvas.height;

  if (targetW > maxW || targetH > maxH) {
    const ratio = Math.min(maxW / targetW, maxH / targetH);
    targetW = Math.round(targetW * ratio);
    targetH = Math.round(targetH * ratio);

    const outCanvas = document.createElement('canvas');
    outCanvas.width = targetW;
    outCanvas.height = targetH;
    const ctx = outCanvas.getContext('2d');
    if (ctx) {
      // Clear transparently
      ctx.clearRect(0, 0, targetW, targetH);
      ctx.drawImage(canvas, 0, 0, targetW, targetH);
      return outCanvas.toDataURL('image/png');
    }
  }

  // Preserve alpha channel with PNG
  return canvas.toDataURL('image/png');
}
