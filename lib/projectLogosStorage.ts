import { processLogoFile } from './logoStorage';
import customBrandDataRaw from './customBrandData.json';

export interface ProjectLogo {
  id: string;
  url: string;
  name?: string;
}

const STORAGE_KEY_PREFIX = 'mmv_project_logos_';
const DB_NAME = 'brigada99_gallery_db';
const STORE_NAME = 'project_logos';
const DB_VERSION = 3;

// SVG Data URIs that never fail or 404
const MMV_SVG_LOGO = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" fill="none"><rect width="200" height="60" rx="12" fill="%23ffffff"/><path d="M24 38c-5-5-5-13 0-18s13-5 18 0l2 2 2-2c5-5 13-5 18 0s5 13 0 18l-20 20L24 38z" fill="%23C1124F" opacity="0.15"/><path d="M36 22a4 4 0 0 1 5.6 0l2.4 2.4 2.4-2.4a4 4 0 1 1 5.6 5.6l-8 8-8-8a4 4 0 0 1 0-5.6z" fill="%23C1124F"/><text x="64" y="28" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="14" fill="%23310062" letter-spacing="-0.5">MANO A MANO</text><text x="64" y="44" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="11" fill="%23C1124F" letter-spacing="1">VENEZUELA</text></svg>`;

const B99_SVG_LOGO = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" fill="none"><rect width="200" height="60" rx="12" fill="%23ffffff"/><path d="M20 18l12-10 12 10" stroke="%23310062" stroke-width="3" stroke-linecap="square"/><path d="M24 20l8-6 8 6" stroke="%23C1124F" stroke-width="2" stroke-linecap="square"/><text x="56" y="32" font-family="Impact, system-ui, sans-serif" font-size="18" fill="%23310062" letter-spacing="0.5">BRIGADA <tspan fill="%23C1124F">99HDD</tspan></text><text x="56" y="46" font-family="system-ui, sans-serif" font-weight="700" font-size="9" fill="%23666666" letter-spacing="1.5">RESCATE Y AYUDA</text></svg>`;

// Default initial logos for Card 1 (Mano a Mano Venezuela) and Card 2 (La Brigada 99HDD)
export const DEFAULT_CARD_LOGOS: Record<'card1' | 'card2', ProjectLogo[]> = {
  card1: [
    {
      id: 'default-mmv',
      url: MMV_SVG_LOGO,
      name: 'Mano a Mano Venezuela'
    }
  ],
  card2: [
    {
      id: 'default-99hdd',
      url: B99_SVG_LOGO,
      name: 'Brigada 99HDD'
    }
  ]
};

function openProjectLogosDB(): Promise<IDBDatabase> {
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
        if (!db.objectStoreNames.contains('brand_logos')) {
          db.createObjectStore('brand_logos');
        }
        if (!db.objectStoreNames.contains('gallery_photos')) {
          db.createObjectStore('gallery_photos');
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
 * Loads logos for a specific project card ('card1' or 'card2').
 */
export async function loadProjectLogos(cardId: 'card1' | 'card2'): Promise<ProjectLogo[]> {
  // First check localStorage for speed
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${cardId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  // Then check IndexedDB
  try {
    const db = await openProjectLogosDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(cardId);

    const result = await new Promise<ProjectLogo[] | null>((resolve) => {
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });

    if (result && Array.isArray(result) && result.length > 0) {
      return result;
    }
  } catch {
    // fallback
  }

  // Check bundled projectCardLogos in customBrandData.json (for published site)
  try {
    const bundled = (customBrandDataRaw as any)?.projectCardLogos?.[cardId];
    if (Array.isArray(bundled) && bundled.length > 0) {
      return bundled;
    }
  } catch {
    // fallback
  }

  return DEFAULT_CARD_LOGOS[cardId];
}

/**
 * Saves logos list for a specific project card.
 */
export async function saveProjectLogos(cardId: 'card1' | 'card2', logos: ProjectLogo[]): Promise<void> {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${cardId}`, JSON.stringify(logos));
  } catch (err) {
    console.warn('LocalStorage save failed for project logos:', err);
  }

  try {
    const db = await openProjectLogosDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(logos, cardId);

    await new Promise<void>((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (err) {
    console.warn('IndexedDB save failed for project logos:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mmv_project_logos_updated', { detail: { cardId, logos } }));
  }
}

/**
 * Adds a new logo from a file to a project card.
 */
export async function addLogoToProjectCard(cardId: 'card1' | 'card2', file: File, name?: string): Promise<ProjectLogo[]> {
  const processedDataUrl = await processLogoFile(file);
  const current = await loadProjectLogos(cardId);
  
  const newLogo: ProjectLogo = {
    id: `logo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    url: processedDataUrl,
    name: name || file.name.replace(/\.[^/.]+$/, "")
  };

  const updated = [...current, newLogo];
  await saveProjectLogos(cardId, updated);
  return updated;
}

/**
 * Replaces a logo in a project card.
 */
export async function replaceLogoInProjectCard(cardId: 'card1' | 'card2', logoId: string, file: File): Promise<ProjectLogo[]> {
  const processedDataUrl = await processLogoFile(file);
  const current = await loadProjectLogos(cardId);

  const updated = current.map(item => {
    if (item.id === logoId) {
      return { ...item, url: processedDataUrl };
    }
    return item;
  });

  await saveProjectLogos(cardId, updated);
  return updated;
}

/**
 * Removes a logo from a project card.
 */
export async function removeLogoFromProjectCard(cardId: 'card1' | 'card2', logoId: string): Promise<ProjectLogo[]> {
  const current = await loadProjectLogos(cardId);
  const updated = current.filter(l => l.id !== logoId);
  
  // If all removed, keep default fallback
  const final = updated.length > 0 ? updated : DEFAULT_CARD_LOGOS[cardId];
  await saveProjectLogos(cardId, final);
  return final;
}

/**
 * Resets a project card to its default logos.
 */
export async function resetProjectCardLogos(cardId: 'card1' | 'card2'): Promise<ProjectLogo[]> {
  const defaults = DEFAULT_CARD_LOGOS[cardId];
  await saveProjectLogos(cardId, defaults);
  return defaults;
}
