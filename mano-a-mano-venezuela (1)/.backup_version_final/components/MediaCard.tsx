import React, { useState, useRef, useEffect } from 'react';
import { Play, ExternalLink } from 'lucide-react';

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
}

interface MediaCardProps {
  media: MediaItem;
}

export const MediaCard: React.FC<MediaCardProps> = ({ media }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(media.image);
  const [hasImgError, setHasImgError] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sincronizar imagen si cambian las props
  useEffect(() => {
    setImgSrc(media.image);
    setHasImgError(false);
  }, [media.image]);

  const hasPreview = Boolean(media.youtubeId || media.instagramId);

  const handleMouseEnter = () => {
    if (hasPreview) {
      // Breve retardo para evitar disparos accidentales al pasar el puntero rápidamente
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
      // Intentar fallback 1 (ej. URL directa de internet o Wikimedia)
      setImgSrc(media.fallback);
    } else if (media.youtubeId && imgSrc !== `https://img.youtube.com/vi/${media.youtubeId}/hqdefault.jpg`) {
      // Intentar fallback 2: miniatura oficial de YouTube
      setImgSrc(`https://img.youtube.com/vi/${media.youtubeId}/hqdefault.jpg`);
    } else {
      // Si todos los orígenes fallaron, mostrar fallback visual estilizado
      setHasImgError(true);
    }
  };

  const getActionLabel = () => {
    if (media.instagramId) return 'Abrir en Instagram';
    if (media.youtubeId) return 'Abrir en YouTube';
    return 'Ver Video';
  };

  return (
    <a
      href={media.videoUrl || '#'}
      target={media.videoUrl ? '_blank' : undefined}
      rel={media.videoUrl ? 'noopener noreferrer' : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative block rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-square md:aspect-[4/3] cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 ${media.bg} border border-stone-100 text-left`}
    >
      {/* Background Image Container */}
      <div 
        className={`absolute inset-0 flex items-center justify-center p-6 md:p-10 transition-opacity duration-500 ${
          showPreview ? 'opacity-0' : 'opacity-95 group-hover:opacity-100'
        }`}
      >
        {!hasImgError ? (
          <img 
            src={imgSrc} 
            alt={media.source} 
            referrerPolicy="no-referrer"
            className="w-auto h-auto max-w-[70%] max-h-[55%] object-contain filter drop-shadow-2xl group-hover:scale-110 transition-transform duration-700 ease-out" 
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

      {/* Video Preview on Hover: YouTube */}
      {showPreview && media.youtubeId && (
        <div className="absolute inset-0 z-10 overflow-hidden bg-black transition-opacity duration-500">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${media.youtubeId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${media.youtubeId}&playsinline=1${media.startTime ? `&start=${media.startTime}` : ''}`}
            title={media.title}
            className="w-[150%] h-[150%] -translate-x-[16.6%] -translate-y-[16.6%] object-cover pointer-events-none scale-110"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
          {/* Badge indicador de vista previa activa */}
          <div className="absolute top-3.5 right-3.5 z-30 bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>Vista Previa</span>
          </div>
        </div>
      )}

      {/* Video Preview on Hover: Instagram Reel */}
      {showPreview && media.instagramId && (
        <div className="absolute inset-0 z-10 overflow-hidden bg-black transition-opacity duration-500">
          <iframe
            src={`https://www.instagram.com/reel/${media.instagramId}/embed/`}
            title={media.title}
            className="w-[125%] h-[150%] -translate-x-[12.5%] -translate-y-[15%] object-cover pointer-events-none scale-105"
            allow="encrypted-media"
          />
          {/* Badge indicador de vista previa activa de Instagram */}
          <div className="absolute top-3.5 right-3.5 z-30 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>Vista Previa Reel</span>
          </div>
        </div>
      )}

      {/* Gradient Overlay for Text Readability - softer when preview is active */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-brand-dark/95 via-brand-dark/30 to-transparent transition-opacity duration-500 z-20 pointer-events-none ${
          showPreview ? 'opacity-40' : 'opacity-85 group-hover:opacity-90'
        }`} 
      />

      {/* Big Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className={`flex flex-col items-center gap-2.5 md:gap-3.5 transition-all duration-500 ${
          showPreview ? '-translate-y-5 scale-90 opacity-90' : 'group-hover:-translate-y-3'
        }`}>
          <div className="relative flex items-center justify-center">
            <div className={`absolute inset-0 bg-white rounded-full ${
              showPreview ? 'opacity-0' : 'animate-ping opacity-20 group-hover:opacity-40 duration-1000'
            }`} />
            <div className={`w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 ${
              showPreview ? 'bg-white/85 text-brand-accent' : 'bg-white/95 text-brand-accent'
            } backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-[0_0_35px_rgba(255,255,255,0.3)] group-hover:shadow-[0_0_55px_rgba(255,255,255,0.6)] z-10 pointer-events-auto`}>
              <Play fill="currentColor" size={32} className="ml-1.5 w-6 h-6 md:w-8 md:h-8 lg:w-9 lg:h-9" />
            </div>
          </div>
          <span className="text-white font-bold text-[10px] md:text-xs tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 drop-shadow-md flex items-center gap-1.5 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
            {getActionLabel()}
            <ExternalLink size={12} />
          </span>
        </div>
      </div>

      {/* Text Details at Bottom */}
      <div className={`absolute inset-x-0 bottom-0 flex flex-col items-center justify-end p-4 sm:p-5 md:p-6 text-center pointer-events-none z-20 transition-all duration-500 ${
        showPreview ? 'bg-gradient-to-t from-black/85 via-black/40 to-transparent pt-6 pb-4' : ''
      }`}>
        <span 
          title={media.title}
          className="text-white font-bold text-[15px] sm:text-base md:text-lg lg:text-xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] mb-2 relative z-10 transform transition-transform duration-500 leading-snug max-w-[94%] line-clamp-2 md:line-clamp-3"
        >
          {media.title}
        </span>
        <span className="text-white font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20 relative z-10 shadow-xl">
          {media.source}
        </span>
      </div>
    </a>
  );
};
