import customBrandDataRaw from './customBrandData.json';

export interface SyncedVehicleData {
  vehiclePhotos: Record<string, string>;
  goalPhotos: Record<string, string>;
}

const LOCAL_VEHICLE_KEYS: Record<string, string> = {
  'mazda-bt50': 'mmv_vehicle_photo_mazda-bt50',
  'hilux-azul': 'mmv_vehicle_photo_hilux-azul',
  'hilux-blanca': 'mmv_vehicle_photo_hilux-blanca',
};

const LOCAL_GOAL_KEYS: Record<string, string> = {
  'moto-carga': 'mmv_goal_photo_moto-carga',
  'uniformes': 'mmv_goal_photo_uniformes',
};

/**
 * Returns bundled vehicle photos from customBrandData.json
 */
export function getBundledVehiclePhotos(): Record<string, string> {
  try {
    const raw = customBrandDataRaw as any;
    return raw?.vehiclePhotos || {};
  } catch {
    return {};
  }
}

/**
 * Returns bundled goal photos (moto, uniformes) from customBrandData.json
 */
export function getBundledGoalPhotos(): Record<string, string> {
  try {
    const raw = customBrandDataRaw as any;
    return raw?.goalPhotos || {};
  } catch {
    return {};
  }
}

/**
 * Returns the effective photos for vehicles, merging:
 * 1. localStorage (if device has local overrides)
 * 2. Bundled server data (for mobile devices and public donors)
 */
export function getEffectiveVehiclePhotos(): Record<string, string> {
  const bundled = getBundledVehiclePhotos();
  const local: Record<string, string> = {};

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      for (const [id, key] of Object.entries(LOCAL_VEHICLE_KEYS)) {
        const val = localStorage.getItem(key);
        if (val) {
          local[id] = val;
        }
      }
    } catch {
      // ignore
    }
  }

  return {
    ...bundled,
    ...local,
  };
}

/**
 * Returns the effective photos for macro goals (moto-carga, uniformes), merging:
 * 1. localStorage (if device has local overrides)
 * 2. Bundled server data (for mobile devices and public donors)
 */
export function getEffectiveGoalPhotos(): Record<string, string> {
  const bundled = getBundledGoalPhotos();
  const local: Record<string, string> = {};

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      for (const [id, key] of Object.entries(LOCAL_GOAL_KEYS)) {
        const val = localStorage.getItem(key);
        if (val) {
          local[id] = val;
        }
      }
    } catch {
      // ignore
    }
  }

  return {
    ...bundled,
    ...local,
  };
}

/**
 * Synchronizes vehicle and goal photos to the server so they become permanent
 * across all devices (mobile, tablet, desktop, and public visitors).
 */
export async function syncVehiclePhotosToServer(
  vehiclePhotos: Record<string, string>,
  goalPhotos: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/sync-vehicle-photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehiclePhotos, goalPhotos }),
    });

    if (!response.ok) {
      const err = await response.text();
      return { success: false, error: err };
    }

    const data = await response.json();
    return { success: data.success };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Automatically inspects localStorage on web browser mount. If the web browser
 * has customized vehicle or goal photos stored, it syncs them immediately to the server
 * so that mobile phones and public donors see the exact same images.
 */
export async function autoSyncLocalPhotosToServer(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.localStorage) return false;

  try {
    const localVehicles: Record<string, string> = {};
    let hasLocalVehicles = false;
    for (const [id, key] of Object.entries(LOCAL_VEHICLE_KEYS)) {
      const val = localStorage.getItem(key);
      if (val) {
        localVehicles[id] = val;
        hasLocalVehicles = true;
      }
    }

    const localGoals: Record<string, string> = {};
    let hasLocalGoals = false;
    for (const [id, key] of Object.entries(LOCAL_GOAL_KEYS)) {
      const val = localStorage.getItem(key);
      if (val) {
        localGoals[id] = val;
        hasLocalGoals = true;
      }
    }

    if (hasLocalVehicles || hasLocalGoals) {
      const res = await syncVehiclePhotosToServer(localVehicles, localGoals);
      return res.success;
    }
  } catch (err) {
    console.warn('Auto-sync vehicle photos notice:', err);
  }

  return false;
}
