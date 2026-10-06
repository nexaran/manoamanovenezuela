import { loadLogoConfig, LogoConfig } from './logoStorage';
import { loadProjectLogos, ProjectLogo } from './projectLogosStorage';
import { loadGalleryPhotos, GalleryPhoto } from './galleryStorage';
import { getEffectiveVehiclePhotos, getEffectiveGoalPhotos } from './vehiclePhotosService';
import customBrandDataRaw from './customBrandData.json';

export interface SyncedBrandData {
  logos: LogoConfig;
  projectCardLogos: {
    card1: ProjectLogo[];
    card2: ProjectLogo[];
  };
  galleryPhotos: GalleryPhoto[];
  vehiclePhotos?: Record<string, string>;
  goalPhotos?: Record<string, string>;
}

export const getBundledBrandData = (): SyncedBrandData => {
  return customBrandDataRaw as unknown as SyncedBrandData;
};

/**
 * Reads all currently active logos (primary, footer, height), project card logos,
 * gallery photos, and vehicle/goal photos from browser storage and syncs
 * them directly to the project files via `/api/sync-content` so they become permanent
 * and are bundled for mobile phones and public donors.
 */
export async function syncCurrentContentToProject(customGalleryPhotos?: GalleryPhoto[]): Promise<{ success: boolean; error?: string }> {
  try {
    const logos = await loadLogoConfig();
    const card1Logos = await loadProjectLogos('card1');
    const card2Logos = await loadProjectLogos('card2');
    const galleryPhotos = customGalleryPhotos || (await loadGalleryPhotos());
    const vehiclePhotos = getEffectiveVehiclePhotos();
    const goalPhotos = getEffectiveGoalPhotos();

    const payload: SyncedBrandData = {
      logos: {
        primaryUrl: logos.primaryUrl,
        footerUrl: logos.footerUrl,
        emblemUrl: logos.emblemUrl || null,
        heightPx: logos.heightPx || 52
      },
      projectCardLogos: {
        card1: card1Logos || [],
        card2: card2Logos || []
      },
      galleryPhotos: galleryPhotos || [],
      vehiclePhotos: vehiclePhotos || {},
      goalPhotos: goalPhotos || {}
    };

    const response = await fetch('/api/sync-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: `Servidor respondió con código ${response.status}: ${errText}` };
    }

    const resData = await response.json();
    return { success: resData.success };
  } catch (err: any) {
    console.warn('Sync to project API warning:', err);
    return { success: false, error: err.message };
  }
}
