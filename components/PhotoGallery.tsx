import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Maximize2, 
  X, 
  Play, 
  Pause, 
  MapPin, 
  Calendar, 
  Upload, 
  Sparkles,
  RefreshCw,
  Loader2,
  Check,
  Image as ImageIcon,
  AlertCircle,
  Edit3,
  Save,
  CheckCircle2,
  RotateCcw,
  Sliders,
  FileText
} from 'lucide-react';
import { 
  GalleryPhoto, 
  compressImage, 
  isHeicFile,
  isHeicFileFast,
  saveGalleryPhotos, 
  loadGalleryPhotos, 
  clearGalleryStorage 
} from '../lib/galleryStorage';
import { useEditMode } from '../lib/editModeContext';
import { syncCurrentContentToProject } from '../lib/syncService';

export type { GalleryPhoto };

const DEFAULT_PHOTOS: GalleryPhoto[] = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    title: 'Atención directa a nuestra gente de la Guaira.',
    category: 'terreno',
    location: 'Naiguatá, La Guaira',
    date: 'Julio 2026',
    description: 'Jornadas de hidratación, alimentos, insumos médicos, artículos de primera necesidad.'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    title: 'Clasificación de insumos',
    category: 'albergues',
    location: 'Centro de distribución, Caracas',
    date: 'Junio 2026',
    description: 'Voluntarios de la Brigada 99HDD organizando hidratación e insumos a entregar en la Guaira'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    title: 'Atención directa a nuestra gente',
    category: 'albergues',
    location: 'Las Tunitas, Catia La Mar',
    date: 'Julio 2026',
    description: 'Conocemos de primera mano las realidades y casos de mayor necesidad en las comunidades de La Guaira.'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    title: 'Recepción, contról y distribución de sus donaciones',
    category: 'logistica',
    location: 'Almacén principal, Caracas',
    date: 'Agosto 2026',
    description: 'Gracias a sus aportes, ayudamos a los más necesitados en múltiples albergues y refugios de La Guaira.'
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    title: 'Jornadas de hidratación y alimentos preparados.',
    category: 'terreno',
    location: 'Naiguatá, La Guaira',
    date: 'Julio 2026',
    description: 'Contamos con el valioso apoyo de la comunidad para llevar jornadas continuas de alimentación'
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    title: 'Despacho de agua potable.',
    category: 'logistica',
    location: 'Maiquetía, La Guaira',
    date: 'Agosto 2026',
    description: 'Gracias a sus donaciones, hidratamos a nuestra gente de Mano a Mano'
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    title: 'Acompañamiento y soporte emocional',
    category: 'albergues',
    location: 'Caraballeda, La Guaira',
    date: 'Agosto 2026',
    description: 'Espacios de escucha activa a familias afectadas por el doblete sísmico'
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1594708767771-a7502209ff51?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    title: 'Brigadistas en faena nocturna',
    category: 'logistica',
    location: 'La Guaira',
    date: 'Septiembre 2026',
    description: 'Apoyo nocturno con hidratación y snacks a rescatistas, albergues y personas necesitadas'
  },
  {
    id: 9,
    url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    title: 'Reunión de coordinación vecinal',
    category: 'terreno',
    location: 'Catia La Mar',
    date: 'Septiembre 2026',
    description: 'Diagnóstico participativo para censar las necesidades de techado y reconstrucción familiar.'
  },
  {
    id: 10,
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    title: 'Fuerza, fe y hermandad en el terreno',
    category: 'terreno',
    location: 'La Guaira, Venezuela',
    date: 'Septiembre 2026',
    description: 'El corazón de la Brigada 99HDD: voluntarios unidos bajo la promesa de no dejar de apoyar a La Guaira.'
  },
  {
    id: 11,
    url: 'https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    title: 'Entrega de módulos nutricionales',
    category: 'terreno',
    location: 'Macuto, La Guaira',
    date: 'Septiembre 2026',
    description: 'Kits de alimentación balanceada entregados casa por casa a familias vulnerables.'
  },
  {
    id: 12,
    url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    title: 'Censo y triaje comunitario',
    category: 'albergues',
    location: 'Catia La Mar, La Guaira',
    date: 'Septiembre 2026',
    description: 'Levantamiento de necesidades prioritarias en albergues temporales del litoral.'
  },
  {
    id: 13,
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    title: 'Carga y despacho de convoy',
    category: 'logistica',
    location: 'Centro Logístico, Caracas',
    date: 'Septiembre 2026',
    description: 'Organización de camiones con agua potable y herramientas para el eje este.'
  },
  {
    id: 14,
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    title: 'Punto de primeros auxilios',
    category: 'terreno',
    location: 'Tanaguarena, Caraballeda',
    date: 'Septiembre 2026',
    description: 'Atención preventiva, toma de tensión y cura básica a adultos mayores.'
  },
  {
    id: 15,
    url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    title: 'Dotación a familias refugiadas',
    category: 'albergues',
    location: 'Mare Abajo, Carlos Soublette',
    date: 'Septiembre 2026',
    description: 'Entrega de colchonetas, sábanas limpias y kits de higiene personal.'
  },
  {
    id: 16,
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    title: 'Distribución de agua potable',
    category: 'logistica',
    location: 'Maiquetía, La Guaira',
    date: 'Septiembre 2026',
    description: 'Llenado de bidones y entrega directa en sectores con falla de bombeo.'
  },
  {
    id: 17,
    url: 'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    title: 'Olla comunitaria y almuerzo caliente',
    category: 'terreno',
    location: 'Camurí Grande, La Guaira',
    date: 'Septiembre 2026',
    description: 'Preparación de comidas calientes junto a las cocineras de la comunidad.'
  },
  {
    id: 18,
    url: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    title: 'Atención psicosocial y lúdica',
    category: 'albergues',
    location: 'Los Corales, Caraballeda',
    date: 'Septiembre 2026',
    description: 'Dinámicas infantiles y acompañamiento emocional a familias en contingencia.'
  },
  {
    id: 19,
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    title: 'Despacho de materiales ligeros',
    category: 'logistica',
    location: 'Anare, Naiguatá',
    date: 'Septiembre 2026',
    description: 'Suministro de láminas, amarres y herramientas para resguardo de techos.'
  },
  {
    id: 20,
    url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    title: 'Despliegue integral de brigadistas',
    category: 'terreno',
    location: 'Playa Grande, Urimare',
    date: 'Septiembre 2026',
    description: 'Voluntariado comprometido con el acompañamiento constante a nuestro litoral.'
  }
];

export const OFFICIAL_10_TEXTS: Record<number, { title: string; description: string; location: string; category: 'albergues' | 'terreno' | 'logistica'; date: string }> = {
  1: {
    title: 'Atención directa a nuestra gente de la Guaira.',
    location: 'Naiguatá, La Guaira',
    date: 'Julio 2026',
    category: 'terreno',
    description: 'Jornadas de hidratación, alimentos, insumos médicos, artículos de primera necesidad.'
  },
  2: {
    title: 'Clasificación de insumos',
    location: 'Centro de distribución, Caracas',
    date: 'Junio 2026',
    category: 'albergues',
    description: 'Voluntarios de la Brigada 99HDD organizando hidratación e insumos a entregar en la Guaira'
  },
  3: {
    title: 'Atención directa a nuestra gente',
    location: 'Las Tunitas, Catia La Mar',
    date: 'Julio 2026',
    category: 'albergues',
    description: 'Conocemos de primera mano las realidades y casos de mayor necesidad en las comunidades de La Guaira.'
  },
  4: {
    title: 'Recepción, contról y distribución de sus donaciones',
    location: 'Almacén principal, Caracas',
    date: 'Agosto 2026',
    category: 'logistica',
    description: 'Gracias a sus aportes, ayudamos a los más necesitados en múltiples albergues y refugios de La Guaira.'
  },
  5: {
    title: 'Jornadas de hidratación y alimentos preparados.',
    location: 'Naiguatá, La Guaira',
    date: 'Julio 2026',
    category: 'terreno',
    description: 'Contamos con el valioso apoyo de la comunidad para llevar jornadas continuas de alimentación'
  },
  6: {
    title: 'Despacho de agua potable.',
    location: 'Maiquetía, La Guaira',
    date: 'Agosto 2026',
    category: 'logistica',
    description: 'Gracias a sus donaciones, hidratamos a nuestra gente de Mano a Mano'
  },
  7: {
    title: 'Acompañamiento y soporte emocional',
    location: 'Caraballeda, La Guaira',
    date: 'Agosto 2026',
    category: 'albergues',
    description: 'Espacios de escucha activa a familias afectadas por el doblete sísmico'
  },
  8: {
    title: 'Brigadistas en faena nocturna',
    location: 'La Guaira',
    date: 'Septiembre 2026',
    category: 'logistica',
    description: 'Apoyo nocturno con hidratación y snacks a rescatistas, albergues y personas necesitadas'
  },
  9: {
    title: 'Reunión de coordinación vecinal',
    location: 'Catia La Mar',
    date: 'Septiembre 2026',
    category: 'terreno',
    description: 'Diagnóstico participativo para censar las necesidades de techado y reconstrucción familiar.'
  },
  10: {
    title: 'Fuerza, fe y hermandad en el terreno',
    location: 'La Guaira, Venezuela',
    date: 'Septiembre 2026',
    category: 'terreno',
    description: 'El corazón de la Brigada 99HDD: voluntarios unidos bajo la promesa de no dejar de apoyar a La Guaira.'
  }
};

export const PhotoGallery = () => {
  const { isEditMode } = useEditMode();
  const [photos, setPhotos] = useState<GalleryPhoto[]>(DEFAULT_PHOTOS);
  const [isUploadingPhotoId, setIsUploadingPhotoId] = useState<number | null>(null);
  const [isConvertingHeic, setIsConvertingHeic] = useState(false);
  const [uploadSuccessPhotoId, setUploadSuccessPhotoId] = useState<number | null>(null);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(null);

  // Editor modal state & active tab
  const [modalTab, setModalTab] = useState<'images' | 'texts'>('images');
  const [editingPhotoId, setEditingPhotoId] = useState<number>(1);
  const [editViewMode, setEditViewMode] = useState<'single' | 'all'>('single');
  const [textFilterRange, setTextFilterRange] = useState<'all' | '1-10' | '11-20'>('all');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [textSaveSuccessId, setTextSaveSuccessId] = useState<number | null>(null);
  const [textSearchQuery, setTextSearchQuery] = useState<string>('');

  // Form fields for editing selected photo
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editCategory, setEditCategory] = useState<'albergues' | 'terreno' | 'logistica'>('terreno');
  const [editDate, setEditDate] = useState('');

  // Keep form fields synced when selecting a different photo to edit
  useEffect(() => {
    const target = photos.find(p => p.id === editingPhotoId) || photos[0];
    if (target) {
      setEditTitle(target.title);
      setEditDescription(target.description);
      setEditLocation(target.location);
      setEditCategory(target.category);
      setEditDate(target.date);
    }
  }, [editingPhotoId]);

  // Listen for open photo modal custom event (triggered by FloatingEditorBar)
  useEffect(() => {
    const handleOpenEvent = (e: any) => {
      const tab = e?.detail?.tab || 'images';
      const photoId = e?.detail?.photoId;
      setModalTab(tab);
      if (typeof photoId === 'number') {
        setEditingPhotoId(photoId);
      }
      setIsUploadModalOpen(true);
    };
    window.addEventListener('mmv_open_photo_modal', handleOpenEvent);
    return () => window.removeEventListener('mmv_open_photo_modal', handleOpenEvent);
  }, []);

  // Load custom photos safely from IndexedDB / Storage and ensure the 10 official texts of La Guaira are applied
  useEffect(() => {
    let isMounted = true;
    const MIGRATION_KEY = 'mmv_gallery_texts_v5_synced';

    loadGalleryPhotos().then((persisted) => {
      if (!isMounted) return;

      let baseList: GalleryPhoto[] = DEFAULT_PHOTOS;
      const alreadySynced = localStorage.getItem(MIGRATION_KEY) === 'true';

      if (persisted && persisted.length > 0) {
        // If not yet marked as v5 synced, OR if photo #1 title doesn't match the updated La Guaira title,
        // force apply the 10 official texts, PRESERVING any custom user-uploaded images!
        const photo1 = persisted.find(p => p.id === 1);
        const needsTextUpgrade = !alreadySynced || (photo1 && !photo1.title.includes('nuestra gente de la Guaira'));

        if (needsTextUpgrade) {
          const upgraded = persisted.map(p => {
            if (p.id >= 1 && p.id <= 10 && OFFICIAL_10_TEXTS[p.id]) {
              const off = OFFICIAL_10_TEXTS[p.id];
              return {
                ...p,
                title: off.title,
                description: off.description,
                location: off.location,
                category: off.category,
                date: off.date
              };
            }
            return p;
          });

          const persistedIds = new Set(upgraded.map(p => p.id));
          const missingDefaults = DEFAULT_PHOTOS.filter(d => !persistedIds.has(d.id));
          baseList = [...upgraded, ...missingDefaults].sort((a, b) => a.id - b.id);
          localStorage.setItem(MIGRATION_KEY, 'true');
        } else {
          const persistedIds = new Set(persisted.map(p => p.id));
          const missingDefaults = DEFAULT_PHOTOS.filter(d => !persistedIds.has(d.id));
          baseList = [...persisted, ...missingDefaults].sort((a, b) => a.id - b.id);
        }
      } else {
        localStorage.setItem(MIGRATION_KEY, 'true');
      }

      setPhotos(baseList);
      saveGalleryPhotos(baseList);
      syncCurrentContentToProject(baseList).catch(() => {});
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<'all' | 'albergues' | 'terreno' | 'logistica'>('all');
  const [isPlaying, setIsPlaying] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedPhotoToEdit, setSelectedPhotoToEdit] = useState<number | null>(null);

  const filteredPhotos = activeCategory === 'all' 
    ? photos 
    : photos.filter(p => p.category === activeCategory);

  // Keep index within bounds
  const currentPhoto = filteredPhotos[currentIndex] || filteredPhotos[0] || photos[0];

  useEffect(() => {
    if (!isPlaying || lightboxOpen || isUploadModalOpen || filteredPhotos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredPhotos.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isPlaying, lightboxOpen, isUploadModalOpen, filteredPhotos.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredPhotos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredPhotos.length) % filteredPhotos.length);
  };

  // Keyboard navigation & escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
        setIsUploadModalOpen(false);
      } else if (lightboxOpen) {
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, filteredPhotos.length]);

  // Clean body scroll lock when lightbox or modal is open
  useEffect(() => {
    if (lightboxOpen || isUploadModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, isUploadModalOpen]);

  // Main showcase touch handlers (swipe left/right for photos, allow vertical scroll)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Only switch photos if horizontal swipe is clearly dominant (> 45px X, and at least 1.5x of Y)
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      setIsPlaying(false);
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    // If vertical movement deltaY is dominant, allow normal page scroll down/up without interception!
  };

  // Lightbox touch handlers (swipe down to dismiss, swipe left/right to navigate)
  const lightboxTouchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleLightboxTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      lightboxTouchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
  };

  const handleLightboxTouchEnd = (e: React.TouchEvent) => {
    if (!lightboxTouchStartRef.current) return;
    const deltaX = e.changedTouches[0].clientX - lightboxTouchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - lightboxTouchStartRef.current.y;
    lightboxTouchStartRef.current = null;

    // Swipe down > 60px dismisses the lightbox and returns user directly to the page
    if (deltaY > 60 && Math.abs(deltaY) > Math.abs(deltaX)) {
      setLightboxOpen(false);
    } else if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // Atomic real-time updater for the currently active photo
  const handleUpdateCurrentPhoto = (fields: Partial<GalleryPhoto>) => {
    setPhotos(prev => {
      const updated = prev.map(p => p.id === editingPhotoId ? { ...p, ...fields } : p);
      saveGalleryPhotos(updated);
      syncCurrentContentToProject(updated).catch(() => {});
      return updated;
    });
    setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  // Atomic real-time updater by photo ID
  const handleQuickUpdateField = (photoId: number, field: keyof GalleryPhoto, value: string) => {
    setPhotos(prev => {
      const updated = prev.map(p => p.id === photoId ? { ...p, [field]: value } : p);
      saveGalleryPhotos(updated);
      syncCurrentContentToProject(updated).catch(() => {});
      return updated;
    });
    setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const handleSwitchPhoto = (nextId: number) => {
    setEditingPhotoId(nextId);
  };

  const handleCloseModal = () => {
    setIsUploadModalOpen(false);
  };

  // Restore the 10 official customized texts of La Guaira while keeping custom images intact
  const handleApplyOfficial10Texts = async () => {
    const updated = photos.map(p => {
      const off = OFFICIAL_10_TEXTS[p.id];
      if (off && p.id <= 10) {
        return {
          ...p,
          title: off.title,
          description: off.description,
          location: off.location,
          category: off.category,
          date: off.date
        };
      }
      return p;
    });

    setPhotos(updated);
    await saveGalleryPhotos(updated);
    await syncCurrentContentToProject(updated).catch(() => {});

    // Update active form fields if current is 1..10
    const current = updated.find(p => p.id === editingPhotoId);
    if (current) {
      setEditTitle(current.title);
      setEditDescription(current.description);
      setEditLocation(current.location);
      setEditCategory(current.category);
      setEditDate(current.date);
    }

    setTextSaveSuccessId(-999);
    setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setTimeout(() => {
      setTextSaveSuccessId(null);
    }, 3500);
  };

  // Explicit save action with instant visual confirmation
  const handleSavePhotoText = async (photoId: number) => {
    try {
      const updated = photos.map(p => {
        if (p.id === photoId) {
          return {
            ...p,
            title: editTitle.trim() || p.title,
            description: editDescription.trim() || p.description,
            location: editLocation.trim() || p.location,
            category: editCategory,
            date: editDate.trim() || p.date
          };
        }
        return p;
      });

      setPhotos(updated);
      await saveGalleryPhotos(updated);
      await syncCurrentContentToProject(updated).catch(() => {});
      setTextSaveSuccessId(photoId);
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setTimeout(() => {
        setTextSaveSuccessId(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error al guardar el texto de la foto:', err);
    }
  };

  const handleResetPhotoText = async (photoId: number) => {
    const original = DEFAULT_PHOTOS.find(d => d.id === photoId);
    if (original) {
      setEditTitle(original.title);
      setEditDescription(original.description);
      setEditLocation(original.location);
      setEditCategory(original.category);
      setEditDate(original.date);

      const updated = photos.map(p => p.id === photoId ? {
        ...p,
        title: original.title,
        description: original.description,
        location: original.location,
        category: original.category,
        date: original.date
      } : p);
      setPhotos(updated);
      await saveGalleryPhotos(updated);
      await syncCurrentContentToProject(updated).catch(() => {});
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  };

  const handleCustomUpload = async (e: React.ChangeEvent<HTMLInputElement>, photoId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadErrorMessage(null);
      setIsUploadingPhotoId(photoId);
      if (isHeicFileFast(file)) {
        setIsConvertingHeic(true);
      } else {
        isHeicFile(file).then(isHeic => {
          if (isHeic) setIsConvertingHeic(true);
        }).catch(() => {});
      }
      
      // Automatically convert HEIC (if iPhone/camera photo) and compress to web-safe dimensions
      const compressedUrl = await compressImage(file, 1280, 960, 0.78);

      const updated = photos.map(p => {
        if (p.id === photoId) {
          return { ...p, url: compressedUrl };
        }
        return p;
      });

      setPhotos(updated);
      await saveGalleryPhotos(updated);
      syncCurrentContentToProject().catch(() => {});
      setUploadSuccessPhotoId(photoId);
      setTimeout(() => {
        setUploadSuccessPhotoId(null);
      }, 2500);
    } catch (err: any) {
      console.error('Error al procesar y guardar la imagen:', err);
      const message = err?.message || 'No se pudo decodificar el archivo de imagen. Por favor asegúrate de que sea una foto JPG, PNG, WEBP o HEIC válida.';
      setUploadErrorMessage(message);
    } finally {
      setIsUploadingPhotoId(null);
      setIsConvertingHeic(false);
      // Reset input value
      e.target.value = '';
    }
  };

  const handleResetDefaults = async () => {
    setPhotos(DEFAULT_PHOTOS);
    await clearGalleryStorage();
    syncCurrentContentToProject().catch(() => {});
    setIsUploadModalOpen(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-14 md:mt-20">
      {/* Header bar of the gallery */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-ocean animate-ping"></span>
            <span className="text-brand-ocean text-xs md:text-sm font-semibold tracking-wider uppercase">
              GALERÍA FOTOGRÁFICA
            </span>
          </div>
          <h3 className="text-white text-xl md:text-2xl font-bold tracking-tight">
            La Esperanza en Acción: La Guaira 2026
          </h3>
        </div>

        {/* Action buttons & Upload custom photos trigger */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-sm transition-colors"
            title={isPlaying ? 'Pausar diapositivas' : 'Reanudar diapositivas'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span className="hidden xs:inline">{isPlaying ? 'Pausar' : 'Auto'}</span>
          </button>

          {isEditMode && (
            <div className="flex items-center gap-1.5 animate-fade-in">
              <button
                onClick={() => {
                  setModalTab('images');
                  setIsUploadModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-accent hover:bg-[#a00e40] text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer"
                title="Sustituir o subir fotos personalizadas (Visible en Modo Edición)"
              >
                <Upload size={13} />
                <span>Subir Fotos</span>
              </button>
              <button
                onClick={() => {
                  setEditingPhotoId(currentPhoto.id);
                  setModalTab('texts');
                  setIsUploadModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-ocean hover:bg-[#0b656e] text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer border border-brand-ocean/40"
                title="Modificar títulos, reflexiones y mensajes de las fotos"
              >
                <Edit3 size={13} />
                <span>Editar Textos</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none text-xs">
        {[
          { id: 'all', label: `Todas las Fotos (${photos.length})` },
          { id: 'terreno', label: `Operativos en Terreno (${photos.filter(p => p.category === 'terreno').length})` },
          { id: 'albergues', label: `Albergues y Familias (${photos.filter(p => p.category === 'albergues').length})` },
          { id: 'logistica', label: `Logística y Caravanas (${photos.filter(p => p.category === 'logistica').length})` }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id as any);
              setCurrentIndex(0);
            }}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all font-medium ${
              activeCategory === cat.id
                ? 'bg-white text-brand-dark shadow-md font-bold'
                : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Feature Showcase Container */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative rounded-3xl overflow-hidden bg-black/40 border border-white/15 shadow-2xl backdrop-blur-md aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/10] max-h-[520px] group touch-pan-y select-none"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhoto.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <img 
              src={currentPhoto.url} 
              alt={currentPhoto.title}
              className="w-full h-full object-cover"
            />
            {/* Dark gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/95 via-brand-dark/40 to-transparent"></div>
          </motion.div>
        </AnimatePresence>

        {/* Top Badges: Ubicación Única y Pantalla Completa */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-semibold border border-white/20 flex items-center gap-1.5 shadow-md">
              <MapPin size={13} className="text-brand-ocean" />
              {currentPhoto.location}
            </span>
          </div>

          <button
            onClick={() => setLightboxOpen(true)}
            className="pointer-events-auto p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 transition-all hover:scale-105 shadow-md"
            title="Ver en pantalla completa"
          >
            <Maximize2 size={16} />
          </button>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 hover:bg-brand-accent text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-110"
          aria-label="Foto anterior"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 hover:bg-brand-accent text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-110"
          aria-label="Siguiente foto"
        >
          <ChevronRight size={24} />
        </button>

        {/* Bottom Info Banner */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-8 flex flex-col justify-end text-left bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <div className="w-full pr-8 md:pr-12">
            {isEditMode && (
              <div className="mb-2.5 flex flex-wrap items-center gap-2 animate-fade-in">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingPhotoId(currentPhoto.id);
                    setModalTab('texts');
                    setIsUploadModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-ocean hover:bg-[#0b656e] text-white text-xs font-bold shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer border border-brand-ocean/40 backdrop-blur-md"
                  title="Modificar directamente el título y mensaje de esta fotografía"
                >
                  <Edit3 size={12} />
                  <span>Modificar título y mensaje</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalTab('images');
                    setIsUploadModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium backdrop-blur-md transition-all cursor-pointer border border-white/20"
                  title="Cambiar la imagen de esta foto"
                >
                  <Upload size={12} />
                  <span>Cambiar foto</span>
                </button>
              </div>
            )}
            <div className="mb-1">
              <span className="text-[11px] sm:text-xs font-bold text-teal-300 tracking-wider uppercase drop-shadow">
                {currentPhoto.category === 'terreno' ? 'Operativo en Terreno' : currentPhoto.category === 'albergues' ? 'Albergues y Familias' : 'Logística y Caravanas'}
              </span>
            </div>
            <h4 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white tracking-tight leading-snug drop-shadow-md">
              {currentPhoto.title}
            </h4>
            <p className="text-white/95 text-xs sm:text-sm md:text-base mt-1 font-light drop-shadow leading-relaxed line-clamp-3 md:line-clamp-none max-w-3xl block">
              {currentPhoto.description}
            </p>
          </div>
        </div>
      </div>

      {/* Filmstrip Thumbnail Row */}
      <div className="mt-4 grid grid-cols-5 sm:grid-cols-10 gap-2 touch-pan-y">
        {filteredPhotos.map((photo, idx) => {
          const isSelected = photo.id === currentPhoto.id;
          return (
            <button
              key={photo.id}
              onClick={() => {
                setCurrentIndex(idx);
                setIsPlaying(false);
              }}
              title={`${photo.title} (${photo.location})`}
              className={`relative rounded-xl overflow-hidden aspect-[4/3] border-2 transition-all duration-300 touch-pan-y active:scale-95 ${
                isSelected 
                  ? 'border-brand-accent scale-105 shadow-lg shadow-brand-accent/30 ring-2 ring-brand-accent/50' 
                  : 'border-white/10 opacity-60 hover:opacity-100 hover:scale-100'
              }`}
            >
              <img 
                src={photo.url} 
                alt={photo.title} 
                className="w-full h-full object-cover"
              />
            </button>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setLightboxOpen(false);
            }}
            onTouchStart={handleLightboxTouchStart}
            onTouchEnd={handleLightboxTouchEnd}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-3 sm:p-4 md:p-8 touch-pan-y overflow-y-auto"
          >
            {/* Top Lightbox Bar */}
            <div className="w-full flex items-center justify-between text-white pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 max-w-[75%]">
                <span className="text-xs sm:text-base font-medium truncate">
                  {currentPhoto.title}
                </span>
                <span className="text-[10px] sm:text-xs text-brand-ocean bg-brand-ocean/20 px-2 py-0.5 rounded-full shrink-0">
                  {currentIndex + 1}/{filteredPhotos.length}
                </span>
              </div>
              <button
                onClick={() => setLightboxOpen(false)}
                className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 text-white transition-colors flex items-center gap-1 text-xs font-semibold"
                aria-label="Cerrar visor"
              >
                <span className="hidden xs:inline">Cerrar</span>
                <X size={20} />
              </button>
            </div>

            {/* Main Lightbox Image */}
            <div 
              onClick={(e) => {
                if (e.target === e.currentTarget) setLightboxOpen(false);
              }}
              className="relative flex-1 w-full max-w-6xl my-2 sm:my-4 flex items-center justify-center"
            >
              <img 
                src={currentPhoto.url} 
                alt={currentPhoto.title}
                className="max-h-[68vh] sm:max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-1 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-brand-accent text-white transition-all backdrop-blur-sm"
                aria-label="Foto anterior"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-1 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-brand-accent text-white transition-all backdrop-blur-sm"
                aria-label="Siguiente foto"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Bottom Caption & Dismiss Controls in Lightbox */}
            <div className="w-full max-w-3xl text-center text-white/90 pb-2 flex flex-col items-center">
              <p className="text-xs sm:text-sm md:text-base font-light mb-1 px-4">{currentPhoto.description}</p>
              <span className="text-xs text-brand-ocean font-medium">{currentPhoto.location}</span>
              
              <button
                onClick={() => setLightboxOpen(false)}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg"
              >
                <ChevronDown size={16} />
                <span>Cerrar visor y continuar navegando</span>
              </button>
              <span className="text-[10px] text-white/50 mt-1 sm:hidden">
                (Desliza hacia abajo o toca el fondo para cerrar)
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload/Replace Custom 20 Photos and Text Editing Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6"
          >
            <div className="bg-[#1b0134] text-white rounded-3xl p-5 sm:p-7 md:p-8 max-w-4xl w-full max-h-[92vh] flex flex-col border border-brand-ocean/30 shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-white/10 shrink-0">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-white">
                    <Sparkles className="text-brand-ocean shrink-0" size={20} />
                    Gestión de Galería Fotográfica ({photos.length} Fotos)
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-300 mt-1">
                    Administra las fotografías y personaliza los textos, reflexiones y ubicaciones directamente.
                  </p>
                </div>
                <button 
                  onClick={handleCloseModal}
                  className="p-2 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors ml-2 cursor-pointer"
                  title="Guardar y cerrar modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Tab Selector */}
              <div className="flex items-center gap-2 my-4 p-1.5 bg-white/5 rounded-2xl border border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalTab('images')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    modalTab === 'images'
                      ? 'bg-brand-accent text-white shadow-lg'
                      : 'text-stone-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ImageIcon size={15} />
                  <span>Subir / Sustituir Fotos ({photos.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('texts')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    modalTab === 'texts'
                      ? 'bg-brand-ocean text-white shadow-lg border border-brand-ocean/40'
                      : 'text-stone-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Edit3 size={15} />
                  <span>Modificar Textos y Mensajes ({photos.length})</span>
                </button>
              </div>

              {/* Error notification banner if an upload fails */}
              {uploadErrorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 flex items-start gap-3 text-xs leading-relaxed shrink-0">
                  <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-100">Error al procesar la imagen</p>
                    <p className="mt-0.5 text-red-200/90">{uploadErrorMessage}</p>
                  </div>
                  <button
                    onClick={() => setUploadErrorMessage(null)}
                    className="p-1 rounded hover:bg-red-800/40 text-red-300 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* TAB 1: SUBIR / SUSTITUIR IMÁGENES */}
              {modalTab === 'images' && (
                <div className="flex-1 overflow-y-auto pr-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <span className="text-xs text-stone-300">
                      Reemplaza cualquiera de las {photos.length} imágenes con fotos tomadas en terreno.
                    </span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-brand-ocean/20 text-teal-200 font-semibold border border-brand-ocean/40">
                      JPG, PNG, WEBP y HEIC (iPhone)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
                    {photos.map((photo, idx) => (
                      <div key={photo.id} className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center gap-3 hover:border-brand-ocean/40 transition-colors">
                        <img 
                          src={photo.url} 
                          alt={photo.title} 
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/20"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">Foto #{photo.id}: {photo.title}</p>
                          <p className="text-[11px] text-teal-300 truncate">{photo.location}</p>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <label className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                              isUploadingPhotoId === photo.id
                                ? 'bg-brand-ocean/40 text-white cursor-wait'
                                : uploadSuccessPhotoId === photo.id
                                ? 'bg-green-600/40 text-green-200 border border-green-500/50'
                                : 'bg-white/10 hover:bg-brand-accent text-white'
                            }`}>
                              {isUploadingPhotoId === photo.id ? (
                                <>
                                  <Loader2 size={12} className="animate-spin text-teal-300" />
                                  <span>{isConvertingHeic ? 'HEIC...' : 'Optimizando...'}</span>
                                </>
                              ) : uploadSuccessPhotoId === photo.id ? (
                                <>
                                  <Check size={12} className="text-green-300" />
                                  <span>¡Guardada!</span>
                                </>
                              ) : (
                                <>
                                  <Upload size={12} />
                                  <span>Subir Foto #{photo.id}</span>
                                </>
                              )}
                              <input 
                                type="file" 
                                accept="image/*,.heic,.heif,.HEIC,.HEIF" 
                                className="hidden" 
                                disabled={isUploadingPhotoId !== null}
                                onChange={(e) => handleCustomUpload(e, photo.id)}
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => {
                                handleSwitchPhoto(photo.id);
                                setModalTab('texts');
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-brand-ocean/20 hover:bg-brand-ocean/40 text-teal-200 border border-brand-ocean/40 text-[11px] font-medium transition-colors cursor-pointer"
                              title="Modificar textos de esta foto"
                            >
                              <Edit3 size={11} />
                              <span>Textos</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: EDITAR TEXTOS Y MENSAJES (MÓDULO SOLICITADO) */}
              {modalTab === 'texts' && (
                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
                  {/* Status & Quick Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#26034b] border border-brand-ocean/40 rounded-2xl text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-brand-ocean shrink-0" />
                      <div>
                        <span className="font-bold text-white">10 Textos Oficiales de La Guaira: </span>
                        <span className="text-stone-300">
                          {textSaveSuccessId === -999 ? '¡Restablecidos y sincronizados con éxito!' : 'Configurados y activos en el carrusel.'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyOfficial10Texts}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-accent hover:bg-[#a00e40] text-white rounded-xl font-bold text-xs border border-brand-accent/40 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow"
                      title="Aplica los 10 textos editados oficiales manteniendo tus fotos subidas intactas"
                    >
                      <RotateCcw size={13} />
                      <span>Restablecer los 10 textos editados</span>
                    </button>
                  </div>

                  {/* Sub-bar: View mode switcher, group filter and real-time save indicator */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-white/10">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10 text-xs">
                        <button
                          type="button"
                          onClick={() => setEditViewMode('single')}
                          className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                            editViewMode === 'single'
                              ? 'bg-brand-ocean text-white shadow'
                              : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          Modo Detallado (Foto #{editingPhotoId})
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditViewMode('all')}
                          className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                            editViewMode === 'all'
                              ? 'bg-brand-ocean text-white shadow'
                              : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          Lista Rápida (Todas las 20)
                        </button>
                      </div>

                      {/* Group filter: 1-10 vs 11-20 */}
                      <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/10 text-xs">
                        <button
                          type="button"
                          onClick={() => setTextFilterRange('all')}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                            textFilterRange === 'all'
                              ? 'bg-white/20 text-white font-bold'
                              : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          Todas (20)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTextFilterRange('1-10');
                            if (editingPhotoId > 10) setEditingPhotoId(1);
                          }}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                            textFilterRange === '1-10'
                              ? 'bg-brand-ocean/40 text-teal-200 font-bold border border-brand-ocean/50'
                              : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          Fotos 1–10 (Oficiales)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTextFilterRange('11-20');
                            if (editingPhotoId < 11) setEditingPhotoId(11);
                          }}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                            textFilterRange === '11-20'
                              ? 'bg-amber-500/30 text-amber-200 font-bold border border-amber-400/50 ring-1 ring-amber-400/40'
                              : 'text-amber-300/80 hover:text-amber-200'
                          }`}
                        >
                          Fotos 11–20 (Nuevas)
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-950/70 border border-teal-500/40 text-teal-300 text-[11px] font-medium shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                        <span>Guardado automático activo {lastSavedTime ? `• ${lastSavedTime}` : ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* VISTA 1: MODO DETALLADO FOTO POR FOTO */}
                  {editViewMode === 'single' && (
                    <div className="flex flex-col gap-4">
                      {/* Carrusel de selección de las fotos según filtro */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-semibold text-stone-300">
                            {textFilterRange === '11-20' ? 'Fotos Nuevas (11 a 20):' : textFilterRange === '1-10' ? 'Fotos Oficiales (1 a 10):' : 'Selecciona la foto a modificar:'}
                          </span>
                          <span className="text-teal-300 font-mono">Foto #{editingPhotoId} de {photos.length}</span>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20">
                          {photos
                            .filter(p => textFilterRange === '1-10' ? p.id <= 10 : textFilterRange === '11-20' ? p.id >= 11 : true)
                            .map((p) => {
                            const isCurrent = p.id === editingPhotoId;
                            const isNewGroup = p.id >= 11;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => handleSwitchPhoto(p.id)}
                                className={`group shrink-0 flex items-center gap-2 p-1.5 rounded-xl border transition-all text-left cursor-pointer ${
                                  isCurrent
                                    ? isNewGroup
                                      ? 'bg-amber-950/70 border-amber-400 shadow-md ring-2 ring-amber-500/40'
                                      : 'bg-[#240348] border-brand-ocean shadow-md ring-2 ring-brand-ocean/40'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                }`}
                              >
                                <img
                                  src={p.url}
                                  alt={p.title}
                                  className="w-10 h-10 rounded-lg object-cover border border-white/20"
                                />
                                <div className="pr-1">
                                  <div className="flex items-center gap-1">
                                    <span className={`text-xs font-bold ${isCurrent ? (isNewGroup ? 'text-amber-300' : 'text-teal-200') : 'text-white'}`}>
                                      #{p.id}
                                    </span>
                                    {isNewGroup && (
                                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        Nueva
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-stone-400 max-w-[85px] truncate">
                                    {p.title}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Tarjeta de edición de la foto seleccionada */}
                      {(() => {
                        const targetPhoto = photos.find(p => p.id === editingPhotoId) || photos[0];
                        const isSaved = textSaveSuccessId === targetPhoto.id;
                        const isNewPhoto = targetPhoto.id >= 11;

                        return (
                          <div className={`p-4 sm:p-6 rounded-2xl border shadow-xl space-y-4 ${
                            isNewPhoto 
                              ? 'bg-[#1e0338] border-amber-500/40 shadow-amber-950/30' 
                              : 'bg-[#240348] border-brand-ocean/30'
                          }`}>
                            {/* Card Header with photo preview & prev/next */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                              <div className="flex items-center gap-3">
                                <img
                                  src={targetPhoto.url}
                                  alt={targetPhoto.title}
                                  className={`w-14 h-14 rounded-xl object-cover border-2 shadow ${
                                    isNewPhoto ? 'border-amber-400/60' : 'border-brand-ocean/40'
                                  }`}
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${
                                      isNewPhoto
                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                        : 'bg-brand-ocean/20 text-teal-200 border-brand-ocean/40'
                                    }`}>
                                      Foto #{targetPhoto.id} {isNewPhoto ? '(Nueva)' : '(Oficial)'}
                                    </span>
                                    <span className="text-xs text-stone-400">
                                      {targetPhoto.category === 'terreno' ? 'Terreno' : targetPhoto.category === 'albergues' ? 'Albergues' : 'Logística'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-stone-300 mt-1 truncate max-w-xs sm:max-w-md font-medium">
                                    {targetPhoto.title}
                                  </p>
                                </div>
                              </div>

                              {/* Navigation Arrows between photos */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const minId = textFilterRange === '11-20' ? 11 : 1;
                                    const maxId = textFilterRange === '1-10' ? 10 : photos.length;
                                    const prevId = targetPhoto.id === minId ? maxId : targetPhoto.id - 1;
                                    handleSwitchPhoto(prevId);
                                  }}
                                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Foto anterior"
                                >
                                  <ChevronLeft size={16} />
                                  <span className="hidden sm:inline">Anterior</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const minId = textFilterRange === '11-20' ? 11 : 1;
                                    const maxId = textFilterRange === '1-10' ? 10 : photos.length;
                                    const nextId = targetPhoto.id === maxId ? minId : targetPhoto.id + 1;
                                    handleSwitchPhoto(nextId);
                                  }}
                                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Foto siguiente"
                                >
                                  <span className="hidden sm:inline">Siguiente</span>
                                  <ChevronRight size={16} />
                                </button>
                              </div>
                            </div>

                            {/* Campo 1: Título de la Foto */}
                            <div>
                              <label className="block text-xs font-bold text-teal-200 mb-1.5">
                                Título Principal de la Foto #{targetPhoto.id}
                              </label>
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditTitle(val);
                                  handleUpdateCurrentPhoto({ title: val });
                                }}
                                placeholder="Ej: Atención directa a nuestra gente de la Guaira."
                                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white text-sm focus:border-brand-ocean focus:outline-none focus:ring-1 focus:ring-brand-ocean transition-colors"
                              />
                              <p className="text-[11px] text-stone-400 mt-1">
                                Aparece como encabezado sobre la fotografía en la galería. Se guarda en tiempo real.
                              </p>
                            </div>

                            {/* Campo 2: Mensaje Reflexivo / Descripción */}
                            <div>
                              <label className="block text-xs font-bold text-teal-200 mb-1.5">
                                Mensaje Reflexivo y Labor Realizada
                              </label>
                              <textarea
                                rows={3}
                                value={editDescription}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditDescription(val);
                                  handleUpdateCurrentPhoto({ description: val });
                                }}
                                placeholder="Ej: Jornadas de hidratación, alimentos, insumos médicos y acompañamiento continuo a las familias."
                                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white text-sm focus:border-brand-ocean focus:outline-none focus:ring-1 focus:ring-brand-ocean transition-colors resize-none leading-relaxed"
                              />
                              <p className="text-[11px] text-stone-400 mt-1">
                                Este texto acompaña la foto en el carrusel y en el visor de pantalla completa. Se guarda en tiempo real.
                              </p>
                            </div>

                            {/* Fila con Ubicación, Categoría y Fecha */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                              <div>
                                <label className="block text-xs font-semibold text-stone-300 mb-1">
                                  Ubicación en La Guaira
                                </label>
                                <input
                                  type="text"
                                  value={editLocation}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditLocation(val);
                                    handleUpdateCurrentPhoto({ location: val });
                                  }}
                                  placeholder="Ej: Naiguatá, La Guaira"
                                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-white text-xs focus:border-brand-ocean focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-stone-300 mb-1">
                                  Frente de Acción
                                </label>
                                <select
                                  value={editCategory}
                                  onChange={(e) => {
                                    const val = e.target.value as any;
                                    setEditCategory(val);
                                    handleUpdateCurrentPhoto({ category: val });
                                  }}
                                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-white text-xs focus:border-brand-ocean focus:outline-none cursor-pointer"
                                >
                                  <option value="terreno" className="bg-[#240348] text-white">Operativos en Terreno</option>
                                  <option value="albergues" className="bg-[#240348] text-white">Albergues y Familias</option>
                                  <option value="logistica" className="bg-[#240348] text-white">Logística y Caravanas</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-stone-300 mb-1">
                                  Fecha / Período
                                </label>
                                <input
                                  type="text"
                                  value={editDate}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditDate(val);
                                    handleUpdateCurrentPhoto({ date: val });
                                  }}
                                  placeholder="Ej: Septiembre 2026"
                                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-white text-xs focus:border-brand-ocean focus:outline-none"
                                />
                              </div>
                            </div>

                            {/* Botones de acción para la foto seleccionada */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                              <button
                                type="button"
                                onClick={() => handleResetPhotoText(targetPhoto.id)}
                                className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition-colors cursor-pointer"
                                title="Revertir título y mensaje a los originales de esta foto"
                              >
                                <RotateCcw size={13} />
                                <span>Restaurar texto de Foto #{targetPhoto.id}</span>
                              </button>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSavePhotoText(targetPhoto.id)}
                                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg cursor-pointer ${
                                    isSaved
                                      ? 'bg-green-600 text-white border border-green-400'
                                      : 'bg-brand-accent hover:bg-[#a00e40] text-white border border-brand-accent/40 hover:scale-105 active:scale-95'
                                  }`}
                                >
                                  {isSaved ? (
                                    <>
                                      <CheckCircle2 size={16} />
                                      <span>¡Texto Guardado en Foto #{targetPhoto.id}!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Save size={16} />
                                      <span>Guardar Cambios de Texto</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* VISTA 2: LISTA RÁPIDA DE TODAS LAS 20 FOTOS */}
                  {editViewMode === 'all' && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white/5 rounded-xl border border-white/10 text-xs">
                        <span className="text-stone-300">
                          {textFilterRange === '11-20' ? (
                            <strong className="text-amber-300">Mostrando exclusivamente las 10 Fotos Nuevas (11 a 20)</strong>
                          ) : textFilterRange === '1-10' ? (
                            <strong className="text-teal-200">Mostrando las 10 Fotos Oficiales de La Guaira (1 a 10)</strong>
                          ) : (
                            <span>Edita y personaliza el título, ubicación y mensaje de cualquiera de las 20 fotos directamente en cada tarjeta:</span>
                          )}
                        </span>
                        {textFilterRange !== '11-20' && (
                          <button
                            type="button"
                            onClick={() => setTextFilterRange('11-20')}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors font-medium cursor-pointer text-xs"
                          >
                            Ir directo a Fotos 11 a 20 →
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {photos
                          .filter(p => textFilterRange === '1-10' ? p.id <= 10 : textFilterRange === '11-20' ? p.id >= 11 : true)
                          .map((photo) => {
                            const isNew = photo.id >= 11;
                            return (
                              <div
                                key={photo.id}
                                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                                  isNew 
                                    ? 'bg-[#1e0338] border-amber-500/30 hover:border-amber-400/60 shadow-md shadow-amber-950/20' 
                                    : 'bg-[#240348] border-white/10 hover:border-brand-ocean/40'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <img
                                    src={photo.url}
                                    alt={photo.title}
                                    className={`w-12 h-12 rounded-xl object-cover border shrink-0 ${
                                      isNew ? 'border-amber-400/50' : 'border-white/20'
                                    }`}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                                        isNew 
                                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                                          : 'bg-brand-ocean/20 text-teal-200 border-brand-ocean/40'
                                      }`}>
                                        Foto #{photo.id} {isNew ? '(Nueva)' : ''}
                                      </span>
                                      <span className="text-xs text-stone-400 truncate">{photo.location}</span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleSwitchPhoto(photo.id);
                                      setEditViewMode('single');
                                    }}
                                    className="text-xs text-teal-200 hover:text-teal-100 underline font-medium cursor-pointer"
                                  >
                                    Abrir en grande
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                                      Título
                                    </label>
                                    <input
                                      type="text"
                                      value={photo.title}
                                      onChange={(e) => handleQuickUpdateField(photo.id, 'title', e.target.value)}
                                      placeholder="Título de la fotografía"
                                      className="w-full px-3 py-1.5 bg-black/40 border border-white/20 rounded-lg text-white text-xs focus:border-brand-ocean focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                                      Ubicación
                                    </label>
                                    <input
                                      type="text"
                                      value={photo.location}
                                      onChange={(e) => handleQuickUpdateField(photo.id, 'location', e.target.value)}
                                      placeholder="Ej: Macuto, La Guaira"
                                      className="w-full px-3 py-1.5 bg-black/40 border border-white/20 rounded-lg text-white text-xs focus:border-brand-ocean focus:outline-none"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                  <div>
                                    <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                                      Mensaje reflexivo / descripción
                                    </label>
                                    <textarea
                                      rows={2}
                                      value={photo.description}
                                      onChange={(e) => handleQuickUpdateField(photo.id, 'description', e.target.value)}
                                      placeholder="Mensaje sobre la labor realizada o testimonio comunitario"
                                      className="w-full px-3 py-1.5 bg-black/40 border border-white/20 rounded-lg text-white text-xs focus:border-brand-ocean focus:outline-none resize-none leading-relaxed"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/10 shrink-0">
                <button
                  onClick={handleResetDefaults}
                  className="flex items-center gap-2 text-xs text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                  <RefreshCw size={14} /> Restaurar las 20 fotos y textos originales
                </button>
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2 bg-brand-accent hover:bg-[#a00e40] text-white rounded-xl text-sm font-semibold transition-colors shadow-lg cursor-pointer hover:scale-105 active:scale-95"
                >
                  Listo
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
