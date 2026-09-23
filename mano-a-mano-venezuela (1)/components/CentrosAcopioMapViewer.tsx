import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  ExternalLink, 
  Navigation, 
  Compass, 
  Layers, 
  Info, 
  CheckCircle2, 
  Clock, 
  Phone,
  Maximize2
} from 'lucide-react';
import { CENTROS_ACOPIO, CentroAcopio } from '../lib/centrosData';

interface CentrosAcopioMapViewerProps {
  onOpenDetailsModal?: (centroId?: string) => void;
  selectedCentroId?: string;
  onSelectCentro?: (centroId: string) => void;
  compact?: boolean;
  hideModalButton?: boolean;
}

export const CentrosAcopioMapViewer: React.FC<CentrosAcopioMapViewerProps> = ({
  onOpenDetailsModal,
  selectedCentroId,
  onSelectCentro,
  compact = false,
  hideModalButton = false
}) => {
  const [activeTab, setActiveTab] = useState<'terrain' | 'osm'>('terrain');
  const [internalPinId, setInternalPinId] = useState<string>(selectedCentroId || 'chacao');

  useEffect(() => {
    if (selectedCentroId) {
      setInternalPinId(selectedCentroId);
    }
  }, [selectedCentroId]);

  const activePinId = selectedCentroId || internalPinId;
  const activeCentro = CENTROS_ACOPIO.find(c => c.id === activePinId) || CENTROS_ACOPIO[0];

  const handleSelectPin = (centroId: string) => {
    setInternalPinId(centroId);
    if (onSelectCentro) {
      onSelectCentro(centroId);
    }
  };

  const handleOpenGoogleMaps = (url: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const allRouteGoogleMapsUrl = 'https://www.google.com/maps/dir/SushiDelivery+Chacao/Disfuncional+Studios+Chuao/Terrazas+de+Los+Naranjos/Club+Social+Canarias+Macuto';

  return (
    <div className="w-full rounded-2xl border-2 border-brand-ocean/40 hover:border-brand-ocean transition-all overflow-hidden bg-[#240348] shadow-md">
      {/* Top Action & Mode Bar */}
      <div className="bg-[#2d0757] border-b border-white/10 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-ocean/20 border border-brand-ocean/40 text-teal-200 text-xs font-bold rounded-lg">
            <Compass size={14} className="text-teal-300" />
            <span>{CENTROS_ACOPIO.length} Puntos Georreferenciados</span>
          </div>
          <span className="text-[11px] text-stone-300 hidden sm:inline">
            Costa La Guaira &bull; Cordillera Ávila &bull; Valle Caracas
          </span>
        </div>

        {/* View Switcher & Master Google Maps Button */}
        <div className="flex items-center gap-2">
          {/* Switcher de Vista */}
          <div className="inline-flex rounded-lg bg-black/40 p-0.5 border border-white/15 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('terrain')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'terrain'
                  ? 'bg-brand-ocean text-white font-bold shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
              title="Vista topográfica: Costa Caribe, Cordillera del Ávila y Valle de Caracas"
            >
              <Layers size={12} />
              <span>Relieve / Terreno</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('osm')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'osm'
                  ? 'bg-brand-ocean text-white font-bold shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
              title="Mapa satelital y de calles interactivo OpenStreetMap"
            >
              <Navigation size={12} />
              <span>Mapa en Vivo</span>
            </button>
          </div>

          {/* Master Google Maps button */}
          <a
            href={allRouteGoogleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-accent hover:bg-[#a00e40] text-white text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer whitespace-nowrap"
            title="Abrir la ruta con las 5 ubicaciones en Google Maps"
          >
            <Navigation size={12} />
            <span className="hidden md:inline">Ver ruta en Google Maps</span>
            <span className="md:hidden">Maps</span>
            <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* Main Map Stage */}
      <div className={`relative w-full ${compact ? 'h-72 sm:h-80' : 'h-80 sm:h-96'} overflow-hidden select-none bg-[#1d013b]`}>
        {activeTab === 'osm' ? (
          /* Live OpenStreetMap iframe of Caracas & La Guaira corridor */
          <div className="w-full h-full relative">
            <iframe
              title="Mapa Geográfico Real Caracas y La Guaira"
              className="w-full h-full border-0 filter contrast-105"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-67.04%2C10.42%2C-66.75%2C10.63&layer=mapnik&marker=10.6095%2C-66.8830"
              loading="lazy"
            />
            {/* Quick Helper Floating Bar */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <span className="px-2.5 py-1 bg-black/85 backdrop-blur-xs border border-white/20 text-white text-[11px] font-bold rounded-lg shadow-md">
                🌊 La Guaira (Norte) &bull; ⛰️ Cordillera Ávila (Centro) &bull; 🏙️ Caracas (Sur)
              </span>
              <a
                href={allRouteGoogleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto px-2.5 py-1 bg-brand-accent hover:bg-[#a00e40] text-white text-[11px] font-bold rounded-lg shadow-md flex items-center gap-1"
              >
                <span>Google Maps</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ) : (
          /* Topographical Terrain Representation matching the Real Geography of Venezuela */
          <div className="w-full h-full relative bg-radial from-[#2a0650] to-[#15012b] flex flex-col justify-between overflow-hidden">
            
            {/* 1. SECTOR NORTE: Mar Caribe & Litoral Guaireño (y: 0% - 33%) */}
            <div className="h-[34%] w-full relative bg-gradient-to-b from-[#083a52] via-[#0b5375] to-[#0d7a85] border-b border-brand-ocean/50 overflow-hidden">
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              <div className="absolute top-2 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 border border-brand-ocean/40 text-[10px] sm:text-[11px] font-bold text-teal-200">
                <span>🌊 MAR CARIBE</span>
                <span className="text-white/40">&bull;</span>
                <span>Litoral de La Guaira (Zona Costera Afectada)</span>
              </div>

              {/* Línea Costera y Autopista Av. La Playa */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-amber-200/25 to-transparent flex items-center justify-center">
                <span className="text-[9px] font-mono text-teal-200/90 tracking-wider">
                  〰 LÍNEA COSTERA &bull; AV. LA PLAYA / PASEO MACUTO 〰
                </span>
              </div>
            </div>

            {/* 2. SECTOR CENTRAL: Cordillera de la Costa / Parque Nacional Waraira Repano (El Ávila) (y: 34% - 66%) */}
            <div className="h-[33%] w-full relative bg-gradient-to-b from-[#184632] via-[#215a40] to-[#163e2c] border-b border-emerald-500/30 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#4ade80_1px,transparent_1px)] [background-size:12px_12px]"></div>
              
              {/* Silueta de picos */}
              <div className="absolute inset-0 flex items-center justify-around opacity-20 pointer-events-none">
                <span className="text-4xl text-emerald-300">▲</span>
                <span className="text-6xl text-emerald-300">▲</span>
                <span className="text-5xl text-emerald-300">▲</span>
              </div>

              {/* Rótulo Geográfico Central */}
              <div className="z-0 px-3 py-1 rounded-lg bg-black/70 border border-emerald-500/40 text-center backdrop-blur-xs">
                <div className="text-[10px] sm:text-xs font-bold text-emerald-300 tracking-wider uppercase flex items-center justify-center gap-1.5">
                  <span>⛰️ Cordillera de la Costa</span>
                  <span className="text-white/40">&bull;</span>
                  <span>Parque Nacional El Ávila (Waraira Repano)</span>
                </div>
                <div className="text-[9px] font-mono text-emerald-200/80 mt-0.5">
                  Pico Naiguatá 2,765 m &bull; Barrera orográfica Costa La Guaira ⇄ Valle Caracas
                </div>
              </div>

              {/* Corredor de comunicación Autopista CCS-La Guaira */}
              <div className="absolute inset-y-0 left-[22%] w-1.5 bg-gradient-to-b from-brand-ocean via-amber-400 to-brand-accent opacity-70 border-l border-r border-black" title="Autopista Caracas - La Guaira / Túneles Boquerón"></div>
              <span className="absolute top-1/2 left-[25%] -translate-y-1/2 text-[8px] font-mono text-amber-200 bg-black/70 px-1 rounded pointer-events-none rotate-90 sm:rotate-0">
                Autopista CCS - La Guaira
              </span>
            </div>

            {/* 3. SECTOR SUR: Valle de Caracas (y: 67% - 100%) */}
            <div className="h-[33%] w-full relative bg-gradient-to-b from-[#2b0c48] via-[#331154] to-[#1f033d] overflow-hidden">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:10px_10px]"></div>
              
              <div className="absolute bottom-2 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 border border-amber-500/30 text-[10px] sm:text-[11px] font-bold text-amber-200">
                <span>🏙️ VALLE DE CARACAS</span>
                <span className="text-white/40">&bull;</span>
                <span>Centros de Acopio, Almacenaje y Logística Metropolitana</span>
              </div>

              {/* Eje vial Francisco Fajardo / Fco de Miranda */}
              <div className="absolute top-3 left-0 right-0 h-1 bg-amber-400/20"></div>
            </div>

            {/* MARCADORES GEORREFERENCIADOS CON BOTÓN DIRECTO DE GOOGLE MAPS */}
            {CENTROS_ACOPIO.map((centro) => {
              const isSelected = activePinId === centro.id;
              const isCaracas = centro.city === 'Caracas';

              return (
                <div
                  key={centro.id}
                  style={{ left: `${centro.coordinates.x}%`, top: `${centro.coordinates.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
                >
                  {/* Pin Interactivo */}
                  <button
                    type="button"
                    onClick={() => handleSelectPin(centro.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border shadow-lg ${
                      isSelected
                        ? isCaracas
                          ? 'bg-brand-accent text-white border-white ring-4 ring-brand-accent/50 scale-110 z-30'
                          : 'bg-brand-ocean text-white border-white ring-4 ring-brand-ocean/50 scale-110 z-30 font-black'
                        : isCaracas
                          ? 'bg-[#7a0d33] hover:bg-brand-accent text-white border-white/60 hover:scale-105'
                          : 'bg-[#084b52] hover:bg-brand-ocean text-teal-100 border-teal-300/60 hover:scale-105'
                    }`}
                  >
                    <MapPin size={13} className={isSelected ? 'animate-bounce' : ''} />
                    <span className="whitespace-nowrap">{centro.name.split(' (')[0]}</span>
                  </button>

                  {/* Tooltip / Mini-Card Flotante con Botón Abrir en Google Maps */}
                  {isSelected && (
                    <div 
                      className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-[#26034b]/95 text-white p-3 rounded-xl border border-white/20 shadow-2xl z-40 backdrop-blur-md text-left"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          isCaracas ? 'bg-brand-accent text-white' : 'bg-brand-ocean text-white font-bold'
                        }`}>
                          {centro.city} &bull; {centro.badge}
                        </span>
                      </div>

                      <div className="font-bold text-xs text-white leading-tight mb-1">
                        {centro.name}
                      </div>

                      <div className="text-[11px] text-stone-300 line-clamp-2 mb-2 font-normal leading-relaxed">
                        {centro.address}
                      </div>

                      {/* Botones de Acción: Abrir en Google Maps + Ver Ficha */}
                      <div className="flex items-center gap-1.5 pt-1.5 border-t border-white/10">
                        <button
                          type="button"
                          onClick={(e) => handleOpenGoogleMaps(centro.googleMapsUrl, e)}
                          className="flex-1 py-1.5 px-2 bg-brand-ocean hover:bg-[#0a6670] text-white font-bold rounded-lg text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                          title="Abrir esta dirección en Google Maps"
                        >
                          <Navigation size={12} />
                          <span>Google Maps</span>
                          <ExternalLink size={10} />
                        </button>

                        {!hideModalButton && onOpenDetailsModal && (
                          <button
                            type="button"
                            onClick={() => onOpenDetailsModal(centro.id)}
                            className="py-1.5 px-2 bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
                            title="Ver insumos requeridos y contactos"
                          >
                            <span>Ficha</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tarjeta Inferior de Acción y Ubicaciones Rápidas */}
      <div className="bg-[#240348] border-t border-white/10 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs text-stone-300 flex items-center gap-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <MapPin size={14} className={activeCentro.city === 'Caracas' ? 'text-brand-accent' : 'text-teal-300'} />
                {activeCentro.name}
              </span>
              <span className="text-[10px] text-stone-400">({activeCentro.badge})</span>
            </div>
            <div className="text-[11px] text-stone-300/80 truncate max-w-md mt-0.5">
              {activeCentro.address}
            </div>
          </div>

          {/* Botones de acción directa */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={(e) => handleOpenGoogleMaps(activeCentro.googleMapsUrl, e)}
              className="px-3.5 py-1.5 bg-brand-ocean hover:bg-[#0a6670] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <Navigation size={13} />
              <span>Abrir en Google Maps</span>
              <ExternalLink size={12} />
            </button>

            {!hideModalButton && onOpenDetailsModal && (
              <button
                type="button"
                onClick={() => onOpenDetailsModal(activeCentro.id)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-stone-200 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                Ver todos los detalles
              </button>
            )}
          </div>
        </div>

        {/* Chips de Selección Rápida para los 5 Puntos */}
        <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] text-stone-300 font-semibold mr-1">Seleccionar punto:</span>
          {CENTROS_ACOPIO.map((centro) => {
            const isSelected = activePinId === centro.id;
            return (
              <div key={centro.id} className="inline-flex items-center">
                <button
                  type="button"
                  onClick={() => handleSelectPin(centro.id)}
                  className={`px-2.5 py-1 rounded-l-lg text-[11px] font-medium transition-all cursor-pointer border ${
                    isSelected
                      ? centro.city === 'Caracas'
                        ? 'bg-brand-accent text-white border-brand-accent font-bold'
                        : 'bg-brand-ocean text-white border-brand-ocean font-bold'
                      : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                  }`}
                >
                  {centro.name.split(' (')[0]}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleOpenGoogleMaps(centro.googleMapsUrl, e)}
                  title={`Abrir ${centro.name} en Google Maps`}
                  className={`px-1.5 py-1 rounded-r-lg text-[11px] border border-l-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brand-accent hover:bg-[#a00e40] text-white border-brand-accent'
                      : 'bg-white/5 border-white/10 text-stone-400 hover:text-brand-accent hover:bg-white/10'
                  }`}
                >
                  <ExternalLink size={10} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
