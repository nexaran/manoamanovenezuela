import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

interface EditModeContextType {
  isEditorUnlocked: boolean;
  isEditMode: boolean;
  unlockEditor: () => void;
  lockAndHideEditor: () => void;
  setEditMode: (enabled: boolean) => void;
  toggleEditMode: () => void;
  openLogoModal: () => void;
  openPhotoModal: (tab?: 'images' | 'texts', photoId?: number) => void;
  openPhotoTextsModal: (photoId?: number) => void;
}

const STORAGE_ACTIVE_KEY = 'mmv_editor_mode_active';
const STORAGE_UNLOCKED_KEY = 'mmv_editor_unlocked';

const dispatchOpenLogo = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mmv_open_logo_modal'));
  }
};

const dispatchOpenPhoto = (tab: 'images' | 'texts' = 'images', photoId?: number) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mmv_open_photo_modal', { detail: { tab, photoId } }));
  }
};

const dispatchOpenPhotoTexts = (photoId?: number) => {
  dispatchOpenPhoto('texts', photoId);
};

const EditModeContext = createContext<EditModeContextType>({
  isEditorUnlocked: false,
  isEditMode: false,
  unlockEditor: () => {},
  lockAndHideEditor: () => {},
  setEditMode: () => {},
  toggleEditMode: () => {},
  openLogoModal: dispatchOpenLogo,
  openPhotoModal: dispatchOpenPhoto,
  openPhotoTextsModal: dispatchOpenPhotoTexts,
});

export function isDevEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  const search = window.location.search;

  // Explicit URL query parameters
  if (search.includes('edit=true') || search.includes('edit=1') || search.includes('admin=1')) {
    return true;
  }
  if (search.includes('edit=false') || search.includes('edit=0') || search.includes('public=true')) {
    return false;
  }

  // The published app is on ais-pre-* or a production domain; must NEVER be treated as dev
  if (host.includes('ais-pre-') || (!host.includes('ais-dev-') && host !== 'localhost' && host !== '127.0.0.1')) {
    return false;
  }

  // Inside AI Studio development environment (ais-dev-* or localhost)
  return true;
}

export const EditModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Determine if the editor interface is unlocked / authorized on this device
  const [isEditorUnlocked, setIsEditorUnlocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('edit') === 'true' || urlParams.get('edit') === '1' || urlParams.get('admin') === '1') {
        return true;
      }
      if (urlParams.get('edit') === 'false' || urlParams.get('edit') === '0' || urlParams.get('public') === 'true') {
        return false;
      }
      
      const isDev = isDevEnvironment();
      if (!isDev) {
        // ON PUBLISHED SITE (ais-pre-* or production):
        // Editor is strictly LOCKED and INVISIBLE by default!
        const savedUnlocked = localStorage.getItem(STORAGE_UNLOCKED_KEY);
        return savedUnlocked === 'true'; // only if admin unlocked with shortcut on this device
      }

      // In dev environment (AI Studio editor preview):
      const savedUnlocked = localStorage.getItem(STORAGE_UNLOCKED_KEY);
      if (savedUnlocked !== null) {
        return savedUnlocked === 'true';
      }
      const prev = localStorage.getItem(STORAGE_ACTIVE_KEY);
      return prev !== null ? prev === 'true' : true;
    } catch {
      return false;
    }
  });

  const [isEditMode, setIsEditMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('edit') === 'true' || urlParams.get('edit') === '1') {
        return true;
      }
      if (urlParams.get('edit') === 'false' || urlParams.get('edit') === '0' || urlParams.get('public') === 'true') {
        return false;
      }
      const isDev = isDevEnvironment();
      if (!isDev) {
        // ON PUBLISHED SITE: ALWAYS false by default
        return false;
      }
      const saved = localStorage.getItem(STORAGE_ACTIVE_KEY);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return false;
    }
  });

  const unlockEditor = useCallback(() => {
    setIsEditorUnlocked(true);
    setIsEditMode(true);
    try {
      localStorage.setItem(STORAGE_UNLOCKED_KEY, 'true');
      localStorage.setItem(STORAGE_ACTIVE_KEY, 'true');
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mmv_edit_mode_changed', { detail: { enabled: true, unlocked: true } }));
    }
  }, []);

  const lockAndHideEditor = useCallback(() => {
    setIsEditorUnlocked(false);
    setIsEditMode(false);
    try {
      localStorage.setItem(STORAGE_UNLOCKED_KEY, 'false');
      localStorage.setItem(STORAGE_ACTIVE_KEY, 'false');
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mmv_edit_mode_changed', { detail: { enabled: false, unlocked: false } }));
    }
  }, []);

  const setEditMode = useCallback((enabled: boolean) => {
    setIsEditMode(enabled);
    try {
      localStorage.setItem(STORAGE_ACTIVE_KEY, enabled ? 'true' : 'false');
      if (enabled) {
        localStorage.setItem(STORAGE_UNLOCKED_KEY, 'true');
        setIsEditorUnlocked(true);
      }
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mmv_edit_mode_changed', { detail: { enabled } }));
    }
  }, []);

  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_ACTIVE_KEY, next ? 'true' : 'false');
        if (next) {
          localStorage.setItem(STORAGE_UNLOCKED_KEY, 'true');
          setIsEditorUnlocked(true);
        }
      } catch {
        // ignore
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mmv_edit_mode_changed', { detail: { enabled: next } }));
      }
      return next;
    });
  }, []);

  // Secret shortcut: Ctrl + Shift + E or Alt + E unlocks and toggles editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'e') || (e.altKey && e.key.toLowerCase() === 'e')) {
        e.preventDefault();
        if (!isEditorUnlocked) {
          unlockEditor();
        } else {
          toggleEditMode();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditorUnlocked, unlockEditor, toggleEditMode]);

  const value = useMemo(() => ({
    isEditorUnlocked,
    isEditMode: isEditorUnlocked && isEditMode,
    unlockEditor,
    lockAndHideEditor,
    setEditMode,
    toggleEditMode,
    openLogoModal: dispatchOpenLogo,
    openPhotoModal: dispatchOpenPhoto,
    openPhotoTextsModal: dispatchOpenPhotoTexts,
  }), [isEditorUnlocked, isEditMode, unlockEditor, lockAndHideEditor, setEditMode, toggleEditMode]);

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
};

export const useEditMode = () => useContext(EditModeContext);
