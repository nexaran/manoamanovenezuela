import heic2any from 'heic2any';
import decodeHeic from 'heic-decode';
import libheif from 'libheif-js/wasm-bundle';
import customBrandDataRaw from './customBrandData.json';

export interface GalleryPhoto {
  id: number;
  url: string;
  title: string;
  category: 'albergues' | 'terreno' | 'logistica';
  location: string;
  date: string;
  description: string;
}

const DB_NAME = 'brigada99_gallery_db';
const STORE_NAME = 'gallery_photos';
const DB_VERSION = 3;
const LOCAL_STORAGE_KEY = 'brigada99_gallery_photos';

function openGalleryDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('gallery_photos')) {
          db.createObjectStore('gallery_photos');
        }
        if (!db.objectStoreNames.contains('brand_logos')) {
          db.createObjectStore('brand_logos');
        }
        if (!db.objectStoreNames.contains('project_logos')) {
          db.createObjectStore('project_logos');
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        // Fallback: Open without version in case DB was created at a different version
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
 * Detects whether a file or blob is in HEIC or HEIF format.
 * Checks file extension, mime type, and magic bytes.
 */
export async function isHeicFile(file: File | Blob, fileName?: string): Promise<boolean> {
  const name = fileName || (file instanceof File ? file.name : '');
  const lowerName = name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  
  if (
    type.includes('heic') ||
    type.includes('heif') ||
    lowerName.endsWith('.heic') ||
    lowerName.endsWith('.heif')
  ) {
    return true;
  }

  // Inspect first 64 bytes for ISO 'ftyp' box and HEIC/HEIF brand identifiers
  try {
    const slice = file.slice(0, 64);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    if (bytes.length >= 12) {
      const ftyp = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);
      if (ftyp === 'ftyp') {
        const brands = ['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'mif1', 'msf1', 'mpx1'];
        const chunk = String.fromCharCode(...bytes.slice(8, Math.min(bytes.length, 32))).toLowerCase();
        if (brands.some(b => chunk.includes(b))) {
          return true;
        }
      }
    }
  } catch {
    // ignore
  }

  return false;
}

/**
 * Synchronous fast-path check for UI feedback (based on name and MIME type).
 */
export function isHeicFileFast(file: File | Blob, fileName?: string): boolean {
  const name = fileName || (file instanceof File ? file.name : '');
  const lowerName = name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  return (
    type.includes('heic') ||
    type.includes('heif') ||
    lowerName.endsWith('.heic') ||
    lowerName.endsWith('.heif')
  );
}

/**
 * Decodes standard browser-readable images (JPG, PNG, WebP, GIF, SVG, BMP)
 * using createImageBitmap first (fast & reliable), with fallback to HTMLImageElement.
 */
export function decodeStandardImageToCanvas(file: File | Blob): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    // Strategy 1: createImageBitmap (native browser multi-threaded decoder)
    if (typeof createImageBitmap === 'function') {
      createImageBitmap(file)
        .then((bitmap) => {
          const canvas = document.createElement('canvas');
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(bitmap, 0, 0);
            if (typeof bitmap.close === 'function') {
              bitmap.close();
            }
            resolve(canvas);
            return;
          }
          throw new Error('Canvas 2D context unavailable');
        })
        .catch(() => {
          // Fall back to Strategy 2
          decodeWithImageElement();
        });
    } else {
      decodeWithImageElement();
    }

    function decodeWithImageElement() {
      let objectUrl: string | null = null;
      try {
        objectUrl = URL.createObjectURL(file);
      } catch {
        // ignore
      }

      const img = new Image();

      const cleanup = () => {
        if (objectUrl) {
          try {
            URL.revokeObjectURL(objectUrl);
          } catch {
            // ignore
          }
        }
      };

      img.onload = () => {
        cleanup();
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo inicializar el procesador de imágenes.'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas);
      };

      img.onerror = () => {
        cleanup();
        // Fallback: FileReader readAsDataURL
        const reader = new FileReader();
        reader.onload = () => {
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = fallbackImg.naturalWidth || fallbackImg.width;
            canvas.height = fallbackImg.naturalHeight || fallbackImg.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('No se pudo inicializar el procesador de imágenes.'));
              return;
            }
            ctx.drawImage(fallbackImg, 0, 0);
            resolve(canvas);
          };
          fallbackImg.onerror = () => {
            reject(new Error('No se pudo decodificar el archivo como imagen estándar.'));
          };
          fallbackImg.src = reader.result as string;
        };
        reader.onerror = () => {
          reject(new Error('No se pudo leer el archivo de imagen seleccionado.'));
        };
        reader.readAsDataURL(file);
      };

      if (objectUrl) {
        img.src = objectUrl;
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          img.src = reader.result as string;
        };
        reader.onerror = () => reject(new Error('Error al leer el archivo.'));
        reader.readAsDataURL(file);
      }
    }
  });
}

/**
 * Direct decoder using libheif-js wasm bundle on the main thread.
 */
function decodeWithLibheifDirect(uint8Array: Uint8Array): HTMLCanvasElement {
  const decoder = new (libheif as any).HeifDecoder();
  const data = decoder.decode(uint8Array);
  if (!data || !data.length) {
    throw new Error('No se encontraron fotogramas de imagen en el archivo HEIF.');
  }
  const image = data[0];
  const width = image.get_width();
  const height = image.get_height();
  const clampedData = new Uint8ClampedArray(width * height * 4);
  
  image.display({ data: clampedData, width, height }, (displayData: any) => {
    if (!displayData) {
      throw new Error('Error al decodificar la imagen HEIF.');
    }
  });

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No se pudo inicializar el lienzo para la imagen.');
  }

  const imgData = new ImageData(clampedData, width, height);
  ctx.putImageData(imgData, 0, 0);

  // Free memory
  for (const item of data) {
    try { item.free(); } catch {}
  }
  try {
    if (decoder.decoder && typeof decoder.decoder.delete === 'function') {
      decoder.decoder.delete();
    }
  } catch {}

  return canvas;
}

/**
 * Decodes a HEIC / HEIF image file into an HTMLCanvasElement using:
 * 1. heic-decode (libheif-js WASM wrapper with Uint8Array)
 * 2. libheif-js direct decoder
 * 3. heic2any fallback
 * 4. Native browser decode (Safari / iOS)
 */
export async function decodeHeicToCanvas(file: File | Blob): Promise<HTMLCanvasElement> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Strategy 1: heic-decode with Uint8Array
  try {
    const result = await decodeHeic({ buffer: uint8Array });
    if (result && result.width > 0 && result.height > 0 && result.data) {
      const clampedData = result.data instanceof Uint8ClampedArray 
        ? result.data 
        : new Uint8ClampedArray(result.data);
      const imgData = new ImageData(clampedData, result.width, result.height);
      const canvas = document.createElement('canvas');
      canvas.width = result.width;
      canvas.height = result.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.putImageData(imgData, 0, 0);
        return canvas;
      }
    }
  } catch (err) {
    console.warn('heic-decode primary parser error, attempting libheif direct:', err);
  }

  // Strategy 2: Direct libheif-js HeifDecoder
  try {
    return decodeWithLibheifDirect(uint8Array);
  } catch (err) {
    console.warn('libheif direct decoder error, attempting heic2any:', err);
  }

  // Strategy 3: heic2any worker-based fallback
  try {
    const converted = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
      multiple: false,
    });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    return await decodeStandardImageToCanvas(blob);
  } catch (err) {
    console.warn('heic2any fallback error, checking native browser decode:', err);
  }

  // Strategy 4: Native browser decode (Safari / Apple devices natively support HEIC)
  try {
    return await decodeStandardImageToCanvas(file);
  } catch (err) {
    console.warn('Native browser HEIC decode failed:', err);
  }

  throw new Error('No se pudo decodificar el archivo HEIC. Verifica que la foto sea válida o expórtala como JPG antes de subirla.');
}

/**
 * Compresses an uploaded image file (supports JPG, PNG, WebP and HEIC/HEIF)
 * using an offscreen canvas and converts to optimized JPEG to prevent
 * memory issues and storage quota exhaustion.
 */
export async function compressImage(
  file: File,
  maxWidth = 1280,
  maxHeight = 960,
  quality = 0.82
): Promise<string> {
  let sourceCanvas: HTMLCanvasElement;

  const isHeic = await isHeicFile(file);

  if (isHeic) {
    try {
      sourceCanvas = await decodeHeicToCanvas(file);
    } catch (heicErr) {
      console.warn('HEIC decode failed, trying standard decoder fallback:', heicErr);
      sourceCanvas = await decodeStandardImageToCanvas(file);
    }
  } else {
    try {
      sourceCanvas = await decodeStandardImageToCanvas(file);
    } catch (stdErr) {
      console.warn('Standard decode failed, attempting HEIC decoder fallback:', stdErr);
      // If standard decode failed, file might be HEIC under a generic or .jpg extension
      sourceCanvas = await decodeHeicToCanvas(file);
    }
  }

  const srcWidth = sourceCanvas.width;
  const srcHeight = sourceCanvas.height;

  if (!srcWidth || !srcHeight) {
    throw new Error('La imagen no tiene dimensiones válidas.');
  }

  let targetWidth = srcWidth;
  let targetHeight = srcHeight;

  if (targetWidth > maxWidth || targetHeight > maxHeight) {
    if (targetWidth / targetHeight > maxWidth / maxHeight) {
      targetHeight = Math.round((targetHeight * maxWidth) / targetWidth);
      targetWidth = maxWidth;
    } else {
      targetWidth = Math.round((targetWidth * maxHeight) / targetHeight);
      targetHeight = maxHeight;
    }
  }

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = targetWidth;
  outputCanvas.height = targetHeight;
  const outputCtx = outputCanvas.getContext('2d');
  if (!outputCtx) {
    return sourceCanvas.toDataURL('image/jpeg', quality);
  }

  outputCtx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
  return outputCanvas.toDataURL('image/jpeg', quality);
}

/**
 * Persists gallery photos safely to IndexedDB with a fallback to localStorage.
 * Catches any QuotaExceededError so the UI never crashes.
 */
export async function saveGalleryPhotos(photos: GalleryPhoto[]): Promise<void> {
  // 1. Try saving to IndexedDB (virtually unlimited quota for images)
  let savedToIndexedDB = false;
  try {
    const db = await openGalleryDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(photos, 'photos_list');

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    savedToIndexedDB = true;
  } catch (idbErr) {
    console.warn('IndexedDB write warning:', idbErr);
  }

  // 2. Safely attempt localStorage backup, suppressing QuotaExceededError
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(photos));
  } catch (quotaErr) {
    // If quota exceeded, clean up stale oversized key so it doesn't lock localStorage
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // ignore
    }
    if (!savedToIndexedDB) {
      console.warn('Storage quota reached; changes kept in active session memory.', quotaErr);
    }
  }
}

/**
 * Loads photos from IndexedDB or localStorage safely.
 */
export async function loadGalleryPhotos(): Promise<GalleryPhoto[] | null> {
  // Try IndexedDB first
  try {
    const db = await openGalleryDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get('photos_list');

    const result = await new Promise<GalleryPhoto[] | null>((resolve) => {
      req.onsuccess = () => {
        if (req.result && Array.isArray(req.result) && req.result.length > 0) {
          resolve(req.result);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });

    if (result) {
      return result;
    }
  } catch (err) {
    console.warn('IndexedDB read warning:', err);
  }

  // Fallback to localStorage
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('LocalStorage read error:', err);
  }

  // Fallback to bundled photos in customBrandData.json (for published site)
  try {
    const bundled = (customBrandDataRaw as any)?.galleryPhotos;
    if (Array.isArray(bundled) && bundled.length > 0) {
      return bundled;
    }
  } catch {
    // fallback
  }

  return null;
}

/**
 * Clears saved custom gallery photos from both IndexedDB and localStorage.
 */
export async function clearGalleryStorage(): Promise<void> {
  try {
    const db = await openGalleryDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete('photos_list');
  } catch (err) {
    console.warn('IndexedDB delete warning:', err);
  }

  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // ignore
  }
}
