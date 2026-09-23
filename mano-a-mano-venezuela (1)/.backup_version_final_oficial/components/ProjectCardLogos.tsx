import React, { useState, useEffect } from 'react';
import { Camera, Plus, Edit2 } from 'lucide-react';
import { ProjectLogo, loadProjectLogos } from '../lib/projectLogosStorage';
import { useEditMode } from '../lib/editModeContext';
import { ProjectLogosModal } from './ProjectLogosModal';

interface ProjectCardLogosProps {
  cardId: 'card1' | 'card2';
  cardTitle: string;
  isDarkCard?: boolean;
}

export const ProjectCardLogos: React.FC<ProjectCardLogosProps> = ({
  cardId,
  cardTitle,
  isDarkCard = false
}) => {
  const { isEditMode } = useEditMode();
  const [logos, setLogos] = useState<ProjectLogo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadProjectLogos(cardId).then(setLogos);

    const handleUpdate = (e: any) => {
      if (e.detail?.cardId === cardId && e.detail?.logos) {
        setLogos(e.detail.logos);
      } else {
        loadProjectLogos(cardId).then(setLogos);
      }
    };

    window.addEventListener('mmv_project_logos_updated', handleUpdate);
    return () => window.removeEventListener('mmv_project_logos_updated', handleUpdate);
  }, [cardId]);

  return (
    <div className="mb-5 md:mb-6 flex flex-wrap items-center justify-between gap-3">
      {/* Logos Container */}
      <div className="flex items-center gap-3 flex-wrap">
        {logos.map((logo, idx) => (
          <div
            key={logo.id || idx}
            className={`relative group/logo transition-transform duration-300 hover:scale-105 ${
              isDarkCard 
                ? 'bg-white/10 border border-white/15 p-2 rounded-2xl backdrop-blur-sm' 
                : 'bg-brand-dark/5 border border-stone-200/80 p-2 rounded-2xl'
            }`}
            style={{ minHeight: '52px', minWidth: '52px' }}
          >
            <img
              src={logo.url}
              alt={logo.name || `${cardTitle} Logo ${idx + 1}`}
              className="h-10 md:h-12 w-auto max-w-[130px] object-contain block"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Edit Mode Trigger Button: Visible ONLY in Edit Mode */}
      {isEditMode && (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer animate-fade-in ${
            isDarkCard
              ? 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300/80 hover:text-brand-accent'
          }`}
          title={`Administrar logos para ${cardTitle}`}
        >
          <Camera size={13} className={isDarkCard ? 'text-brand-ocean' : 'text-brand-accent'} />
          <span>Cambiar / Añadir logos</span>
        </button>
      )}

      {/* Modal for managing this card's logos */}
      <ProjectLogosModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cardId={cardId}
        cardTitle={cardTitle}
      />
    </div>
  );
};
