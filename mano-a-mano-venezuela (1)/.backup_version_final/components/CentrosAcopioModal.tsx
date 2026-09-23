import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  ExternalLink, 
  CheckCircle2, 
  Building2, 
  Navigation, 
  ShieldCheck, 
  Sparkles,
  Package,
  Layers,
  ChevronRight
} from 'lucide-react';
import { CentroAcopio, CENTROS_ACOPIO } from '../lib/centrosData';
import { CentrosAcopioMapViewer } from './CentrosAcopioMapViewer';

export type { CentroAcopio };
export { CENTROS_ACOPIO };

interface CentrosAcopioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedId?: string | null;
}

export const CentrosAcopioModal: React.FC<CentrosAcopioModalProps> = ({
  isOpen,
  onClose,
  initialSelectedId = null
}) => {
  const [filterCity, setFilterCity] = useState<'all' | 'Caracas' | 'La Guaira'>('all');
  const [selectedCentroId, setSelectedCentroId] = useState<string>(initialSelectedId || 'chacao');

  if (!isOpen) return null;

  const filteredCentros = CENTROS_ACOPIO.filter(c => {
    if (filterCity === 'all') return true;
    return c.city === filterCity;
  });

  const selectedCentro = CENTROS_ACOPIO.find(c => c.id === selectedCentroId) || CENTROS_ACOPIO[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con Estética Mano a Mano */}
        <div className="bg-gradient-to-r from-brand-dark via-[#360965] to-brand-dark text-white p-5 sm:p-6 flex items-start justify-between gap-4 border-b border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-accent via-teal-400 to-brand-ocean"></div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-xs border border-white/20 text-teal-200 text-xs font-bold uppercase tracking-wider rounded-full mb-2">
              <Navigation size={14} />
              <span>Mapa de Centros de Acopio Activos</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Centros de Recepción de Insumos</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-200 mt-1">
              4 puntos estratégicos: <strong className="text-white">3 en Caracas</strong> y <strong className="text-white">1 en La Guaira</strong> para acopio y distribución humanitaria.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Barra de Filtros Rápidos */}
        <div className="bg-stone-50 px-5 py-3 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-stone-500 font-semibold uppercase text-[11px] mr-1 hidden sm:inline">Filtrar:</span>
            <button
              type="button"
              onClick={() => setFilterCity('all')}
              className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                filterCity === 'all'
                  ? 'bg-brand-ocean text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
              }`}
            >
              Todos ({CENTROS_ACOPIO.length} centros)
            </button>
            <button
              type="button"
              onClick={() => setFilterCity('Caracas')}
              className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterCity === 'Caracas'
                  ? 'bg-brand-accent text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-brand-accent"></span>
              <span>Caracas (3)</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterCity('La Guaira')}
              className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterCity === 'La Guaira'
                  ? 'bg-brand-ocean text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-brand-ocean"></span>
              <span>La Guaira (1)</span>
            </button>
          </div>

          <div className="text-[11px] text-stone-600 flex items-center gap-1.5">
            <Clock size={13} className="text-amber-700" />
            <span>Horario general: <strong>Lun a Vie 8:00 a.m. a 5:00 p.m.</strong></span>
          </div>
        </div>

        {/* Contenido Principal: Mapa Interactivo Superior + Detalle de Centros */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-6">
          
          {/* Visual Map Canvas Interactivo con Terreno Real y Google Maps */}
          <CentrosAcopioMapViewer 
            selectedCentroId={selectedCentroId} 
            onSelectCentro={setSelectedCentroId}
            hideModalButton={true}
            compact={false}
          />

          {/* Tarjeta Destacada del Centro Seleccionado (Estética Mano a Mano) */}
          <div className="bg-gradient-to-br from-teal-50/70 via-white to-stone-50 border-2 border-brand-ocean/30 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    selectedCentro.city === 'Caracas'
                      ? 'bg-brand-accent/15 text-brand-accent border border-brand-accent/30'
                      : 'bg-brand-ocean/15 text-brand-ocean border border-brand-ocean/30'
                  }`}>
                    {selectedCentro.city} &bull; {selectedCentro.badge}
                  </span>
                  <span className="text-xs text-stone-500">ID: #{selectedCentro.id.toUpperCase()}</span>
                </div>
                
                <h4 className="text-lg sm:text-xl font-bold text-stone-900 flex items-center gap-2">
                  <MapPin size={18} className={selectedCentro.city === 'Caracas' ? 'text-brand-accent' : 'text-brand-ocean'} />
                  <span>{selectedCentro.name}</span>
                </h4>

                <p className="text-xs sm:text-sm text-stone-700 mt-1 font-medium">
                  {selectedCentro.address}
                </p>
                <p className="text-xs text-stone-500 italic mt-0.5">
                  Ref: {selectedCentro.reference}
                </p>
              </div>

              {/* Botón Abrir en Google Maps */}
              <div className="shrink-0 flex sm:flex-col gap-2">
                <a
                  href={selectedCentro.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-ocean hover:bg-[#0a6670] text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap"
                >
                  <Navigation size={14} />
                  <span>Abrir en Google Maps</span>
                  <ExternalLink size={12} />
                </a>

                <a
                  href={`mailto:${selectedCentro.contactEmail}?subject=Coordinaci%C3%B3n%20de%20Entrega%20en%20Centro%20${encodeURIComponent(selectedCentro.name)}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap"
                >
                  <Mail size={13} className="text-brand-accent" />
                  <span>Acordar entrega</span>
                </a>
              </div>
            </div>

            {/* Desglose de Insumos Prioritarios y Horarios */}
            <div className="mt-4 pt-4 border-t border-stone-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold text-stone-900 block mb-1.5 flex items-center gap-1.5">
                  <Package size={14} className="text-brand-ocean" /> Insumos prioritarios recibidos en este centro:
                </span>
                <ul className="space-y-1 text-stone-700">
                  {selectedCentro.priorityItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 bg-white/80 p-3 rounded-xl border border-stone-200/80">
                <div className="flex items-start gap-2">
                  <Clock size={14} className="text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-800 block">Horario de recepción:</strong>
                    <span className="text-stone-600">{selectedCentro.hours}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-1 border-t border-stone-200/60">
                  <Phone size={14} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-800 block">Contacto de coordinación:</strong>
                    <span className="text-stone-600">{selectedCentro.contactName} ({selectedCentro.contactPhone})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Listado de las 5 Ubicaciones en Grilla */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-stone-700 mb-3 flex items-center gap-2">
              <Layers size={15} className="text-brand-accent" />
              <span>Lista de las 5 Ubicaciones:</span>
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {CENTROS_ACOPIO.map((centro) => {
                const isSelected = selectedCentroId === centro.id;
                const isCaracas = centro.city === 'Caracas';

                return (
                  <div
                    key={centro.id}
                    onClick={() => setSelectedCentroId(centro.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-teal-50/60 border-brand-ocean ring-2 ring-brand-ocean/30 shadow-xs'
                        : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          isCaracas 
                            ? 'bg-brand-accent/10 text-brand-accent' 
                            : 'bg-brand-ocean/15 text-brand-ocean'
                        }`}>
                          {centro.city} &bull; {centro.badge}
                        </span>

                        <span className="text-[11px] text-stone-400">
                          {isSelected ? '● Seleccionado' : 'Click para ver'}
                        </span>
                      </div>

                      <h6 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                        <MapPin size={14} className={isCaracas ? 'text-brand-accent' : 'text-brand-ocean'} />
                        <span>{centro.name}</span>
                      </h6>

                      <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                        {centro.address}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-200/80 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-stone-500 font-medium">
                        {centro.hours.split(' (')[0]}
                      </span>

                      <a
                        href={centro.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-ocean hover:text-[#0a6670]"
                      >
                        <span>Maps</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nota de Protocolo Oficial */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 flex items-start gap-3">
            <ShieldCheck size={18} className="text-amber-800 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="block text-amber-900 font-bold mb-0.5">
                Protocolo de Seguridad y Transparencia:
              </strong>
              Para garantizar que cada insumo llegue directamente a los damnificados de La Guaira sin intermediarios, solicitamos a los donantes coordinar previamente vía correo (<a href="mailto:manomanovzla@gmail.com" className="underline font-semibold">manomanovzla@gmail.com</a>) indicando el volumen aproximado de donación y el centro de acopio elegido.
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-stone-100 p-4 border-t border-stone-200 flex items-center justify-between gap-3 text-xs">
          <span className="text-stone-500">
            Brigada de Apoyo Humanitario 99HDD &bull; La Guaira 2026
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white font-semibold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
