import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, ChevronDown, X } from 'lucide-react';
import { audioManager, AudioState } from '../lib/audioManager';

interface BackgroundMusicPlayerProps {
  className?: string;
}

export const BackgroundMusicPlayer: React.FC<BackgroundMusicPlayerProps> = ({ className = '' }) => {
  const [audioState, setAudioState] = useState<AudioState>(() => audioManager.getState());
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to the global singleton audio manager
  useEffect(() => {
    const unsubscribe = audioManager.subscribe((state) => {
      setAudioState(state);
    });
    return unsubscribe;
  }, []);

  // Handle outside click/tap to close volume slider popover
  useEffect(() => {
    if (!showVolumeSlider) return;

    const handlePointerDownOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowVolumeSlider(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDownOutside);
    document.addEventListener('touchstart', handlePointerDownOutside);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside);
      document.removeEventListener('touchstart', handlePointerDownOutside);
    };
  }, [showVolumeSlider]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioManager.togglePlay();
  };

  const handleVolumeChange = (newVol: number) => {
    audioManager.setVolume(newVol);
  };

  const isPlaying = audioState.isPlaying;
  const volume = audioState.volume;

  return (
    <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
      {/* Botón Principal de Música (Estilo cápsula armónica) */}
      <div className="flex items-center bg-stone-100/95 hover:bg-stone-200/90 border border-stone-200/90 rounded-full p-1 sm:p-1.5 transition-all shadow-2xs">
        <button
          type="button"
          onClick={handleToggle}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer select-none active:scale-95 ${
            isPlaying 
              ? 'bg-brand-ocean text-white shadow-xs' 
              : 'text-stone-700 hover:text-brand-dark bg-stone-200/60'
          }`}
          title={isPlaying ? 'Silenciar música de fondo' : 'Reproducir música suave de fondo'}
          aria-label={isPlaying ? 'Silenciar música' : 'Activar música'}
          id="btn-background-music-toggle"
        >
          {isPlaying ? (
            <>
              <Volume2 size={13} className="shrink-0 animate-pulse text-white" />
              <span className="hidden sm:inline text-[11px] font-semibold">Música activa</span>
              <span className="sm:hidden text-[11px] font-semibold">Silenciar</span>
              
              {/* Animación de ondas sonoras / ecualizador sutil */}
              <div className="flex items-end gap-0.5 h-3 ml-0.5" aria-hidden="true">
                <span className="w-0.5 bg-white rounded-full animate-[bounce_1s_infinite_100ms] h-2" />
                <span className="w-0.5 bg-white rounded-full animate-[bounce_1s_infinite_300ms] h-3" />
                <span className="w-0.5 bg-white rounded-full animate-[bounce_1s_infinite_200ms] h-1.5" />
              </div>
            </>
          ) : (
            <>
              <VolumeX size={13} className="shrink-0 text-stone-500" />
              <span className="hidden sm:inline text-[11px] text-stone-600 font-medium">
                Música silenciada
              </span>
              <span className="sm:hidden text-[11px] text-stone-700 font-medium">Activar</span>
            </>
          )}
        </button>

        {/* Desplegable / Botón de volumen rápido */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowVolumeSlider((prev) => !prev);
          }}
          className="px-1 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer p-0.5"
          title="Ajustar volumen"
          aria-label="Ajustar volumen"
          aria-expanded={showVolumeSlider}
        >
          <ChevronDown 
            size={13} 
            className={`transition-transform duration-200 ${showVolumeSlider ? 'rotate-180 text-brand-dark' : ''}`} 
          />
        </button>
      </div>

      {/* Control emergente de volumen con opción de cierre explícito */}
      {showVolumeSlider && (
        <>
          {/* Backdrop invisible en móviles para cerrar al tocar fuera */}
          <div 
            className="fixed inset-0 z-40 bg-black/10 sm:hidden backdrop-blur-2xs" 
            onClick={() => setShowVolumeSlider(false)}
            aria-hidden="true"
          />

          <div className="absolute top-full right-0 mt-2 p-3 bg-white rounded-2xl shadow-xl border border-stone-200/90 z-50 w-52 text-left animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                Volumen de fondo
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-brand-ocean">
                  {Math.round(volume * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setShowVolumeSlider(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 cursor-pointer"
                  aria-label="Cerrar panel de volumen"
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-brand-ocean"
              aria-label="Nivel de volumen"
            />

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 text-[10px] text-stone-500">
              <button
                type="button"
                onClick={() => {
                  if (isPlaying) {
                    audioManager.pause();
                  } else {
                    audioManager.play();
                  }
                }}
                className="font-medium hover:text-brand-dark cursor-pointer text-brand-ocean"
              >
                {isPlaying ? 'Pausar música' : 'Reanudar música'}
              </button>

              <button
                type="button"
                onClick={() => {
                  handleVolumeChange(volume > 0 ? 0 : 0.35);
                }}
                className="font-medium hover:text-brand-accent cursor-pointer underline"
              >
                {volume === 0 ? 'Restablecer' : 'Silenciar'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
