import React, { useState, useRef, useEffect } from 'react';
import { Play, ExternalLink, Camera } from 'lucide-react';
import { useEditMode } from '../lib/editModeContext';
import customBrandDataRaw from '../lib/customBrandData.json';

export interface MediaItem {
  title: string;
  source: string;
  image: string;
  bg: string;
  fallback: string;
  videoUrl?: string;
  youtubeId?: string;
  instagramId?: string;
  startTime?: number;
  isFullCover?: boolean;
}

interface MediaCardProps {
  media: MediaItem;
}

export const MediaCard: React.FC<MediaCardProps> = ({ media }) => {
  const { isEditMode } = useEditMode();
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [imgSrc, setImgSrc] = useState<string>(() => {
    const key = media.source.toLowerCase().replace(/\s+/g, '-');
    try {
      const saved = localStorage.getItem(`mmv_media_cover_${key}`);
      if (saved && (saved.startsWith('data:image/') || saved.startsWith('blob:'))) return saved;
    } catch {}
    try {
      const covers = (customBrandDataRaw as any)?.mediaCovers || {};
      let filename = '';
      if (key.includes('instagram')) filename = 'instagram-entrevista.jpg';
      else if (key.includes('globo')) filename = 'globovision-entrevista.jpg';
      else if (key.includes('tele') || key.includes('tlt')) filename = 'tlt-entrevista.jpg';
      if (filename && covers[filename]) {
        return covers[filename];
      }
    } catch {}
    return media.image;
  });
  const [hasImgError, setHasImgError] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const processUploadedFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = ev.target?.result as string;
      if (res) {
        setImgSrc(res);
        setHasImgError(false);

        const key = media.source.toLowerCase().replace(/\s+/g, '-');
        try {
          localStorage.setItem(`mmv_media_cover_${key}`, res);
        } catch {}
        try {
          fetch('/api/sync-media-covers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              source: media.source,
              coverData: res
            })
          });
        } catch {}
      }
    };
    reader.readAsDataURL(file);
  };

  // Sincronizar imagen si cambian las props
  useEffect(() => {
    const key = media.source.toLowerCase().replace(/\s+/g, '-');
    try {
      const saved = localStorage.getItem(`mmv_media_cover_${key}`);
      if (saved && (saved.startsWith('data:image/') || saved.startsWith('blob:'))) {
        setImgSrc(saved);
        return;
      }
    } catch {}
    setImgSrc(media.image);
    setHasImgError(false);
  }, [media.image, media.source]);

  const hasPreview = Boolean(media.youtubeId || media.instagramId);

  const handleMouseEnter = () => {
    if (hasPreview) {
      hoverTimeoutRef.current = setTimeout(() => {
        setShowPreview(true);
      }, 150);
    }
  };

  const handleMouseLeave = () => {
    setShowPreview(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleImageError = () => {
    if (imgSrc === media.image && media.fallback && media.fallback !== media.image) {
      setImgSrc(media.fallback);
    } else if (media.youtubeId && imgSrc !== `https://img.youtube.com/vi/${media.youtubeId}/hqdefault.jpg`) {
      setImgSrc(`https://img.youtube.com/vi/${media.youtubeId}/hqdefault.jpg`);
    } else {
      setHasImgError(true);
    }
  };

  const triggerFileSelector = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const getActionLabel = () => {
    if (media.instagramId) return 'Abrir en Instagram';
    if (media.youtubeId) return 'Abrir en YouTube';
    return 'Ver Video';
  };

  const isActualCover = Boolean(
    media.isFullCover &&
    !hasImgError &&
    imgSrc &&
    !imgSrc.includes('logo') &&
    imgSrc !== media.fallback
  );

  return (
    <a
      href={media.videoUrl || '#'}
      target={media.videoUrl ? '_blank' : undefined}
      rel={media.videoUrl ? 'noopener noreferrer' : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative block rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-square md:aspect-[4/3] cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 ${media.bg} border border-stone-100 text-left`}
    >
      {/* Hidden File Input for Admin / Edit Mode */}
      {isEditMode && (
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processUploadedFile(file);
          }} 
        />
      )}

      {/* Background Image / Graphic Cover Container */}
      <div 
        className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
          isActualCover ? 'p-0' : 'p-6 md:p-10'
        } ${showPreview ? 'opacity-0' : 'opacity-95 group-hover:opacity-100'}`}
      >
        {!hasImgError ? (
          <img 
            src={imgSrc} 
            alt={media.source} 
            referrerPolicy="no-referrer"
            className={
              isActualCover
                ? "w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                : "w-auto h-auto max-w-[70%] max-h-[50%] object-contain filter drop-shadow-2xl group-hover:scale-110 transition-transform duration-700 ease-out"
            }
            onError={handleImageError}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-white/90">
            <span className="text-3xl font-black tracking-widest uppercase drop-shadow-md">
              {media.source}
            </span>
          </div>
        )}
      </div>

      {/* Control para cambiar foto: ÚNICAMENTE visible cuando está activo el Modo Edición */}
      {isEditMode && (
        <div 
          className="absolute top-3.5 left-3.5 z-30 pointer-events-auto"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <button 
            type="button"
            onClick={triggerFileSelector}
            className="px-2.5 py-1.5 rounded-lg bg-black/85 hover:bg-black text-white text-[11px] font-semibold border border-white/30 shadow-lg backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 hover:border-[#00f0ff]"
            title="Cambiar foto de portada"
          >
            <Camera size={13} className="text-[#00f0ff]" />
            <span className="hidden sm:inline">Cambiar foto</span>
          </button>
        </div>
      )}

      {/* Video Preview on Hover: YouTube */}
      {showPreview && media.youtubeId && (
        <div className="absolute inset-0 z-10 overflow-hidden bg-black transition-opacity duration-500 pointer-events-none">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${media.youtubeId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${media.youtubeId}&playsinline=1${media.startTime ? `&start=${media.startTime}` : ''}`}
            title={media.title}
            className="w-[150%] h-[150%] -translate-x-[16.6%] -translate-y-[16.6%] object-cover pointer-events-none scale-110"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )}

      {/* Video Preview on Hover: Instagram Reel */}
      {showPreview && media.instagramId && (
        <div className="absolute inset-0 z-10 overflow-hidden bg-black transition-opacity duration-500 pointer-events-none">
          <iframe
            src={`https://www.instagram.com/reel/${media.instagramId}/embed/captioned/`}
            title={media.title}
            className="w-full h-full border-0 pointer-events-none scale-105"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          />
        </div>
      )}

      {/* Overlay Oscuro Gradual para legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent transition-opacity duration-300 pointer-events-none"></div>

      {/* Badge de Medio / Canal */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-none">
        <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-semibold tracking-wider uppercase border border-white/20 shadow-md">
          {media.source}
        </span>
        {media.videoUrl && (
          <span className="p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white/80 group-hover:text-white border border-white/20 shadow-md transition-colors">
            <ExternalLink size={12} />
          </span>
        )}
      </div>

      {/* Botón Central Play / Indicador de Video */}
      <div className={`absolute inset-0 flex items-center justify-center z-20 transition-transform duration-300 pointer-events-none ${showPreview ? 'opacity-0 scale-75' : 'group-hover:scale-110'}`}>
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/95 text-brand-ocean flex items-center justify-center shadow-xl group-hover:bg-[#00f0ff] group-hover:text-[#0a0e1c] transition-colors duration-300">
          <Play size={24} className="ml-1 fill-current" />
        </div>
      </div>

      {/* Pie de Tarjeta: Título y Llamado a la Acción */}
      <div className="absolute bottom-0 inset-x-0 p-5 z-20 text-white pointer-events-none">
        <h4 className="font-bold text-base md:text-lg leading-snug drop-shadow-md line-clamp-2 mb-2 group-hover:text-cyan-200 transition-colors">
          {media.title}
        </h4>
        <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>{showPreview ? 'Previsualización activa' : getActionLabel()}</span>
        </div>
      </div>
    </a>
  );
};
