import React, { useState } from 'react';
import { 
  Package, 
  MapPin, 
  Clock, 
  ExternalLink, 
  Navigation, 
  CheckCircle2,
  FileText
} from 'lucide-react';

interface DonacionInsumosSectionProps {
  onOpenCentrosModal?: (centroId?: string) => void;
}

export const DonacionInsumosSection: React.FC<DonacionInsumosSectionProps> = () => {
  const [selectedLocationId, setSelectedLocationId] = useState<string>('macuto');

  const puntos = [
    {
      id: 'macuto',
      name: 'Sector Macuto',
      city: 'La Guaira',
      shortZone: 'Cerca del Club Canarias, Macuto',
      badge: 'Sede Central La Guaira',
      isCentral: true,
      mapUrl: 'https://maps.google.com/maps?q=Club+Social+Canarias+Macuto+La+Guaira+Venezuela&t=&z=16&ie=UTF8&iwloc=&output=embed',
      googleSearchUrl: 'https://www.google.com/maps/search/?api=1&query=Club+Social+Canarias+Macuto+La+Guaira+Venezuela'
    },
    {
      id: 'chacao',
      name: 'Sector Chacao',
      city: 'Caracas',
      shortZone: 'Chacao',
      badge: 'Centro de Acopio Caracas',
      isCentral: false,
      mapUrl: 'https://maps.google.com/maps?q=Sector+Chacao+Caracas+Venezuela&t=&z=14&ie=UTF8&iwloc=&output=embed',
      googleSearchUrl: 'https://www.google.com/maps/search/?api=1&query=Sector+Chacao+Caracas+Venezuela'
    },
    {
      id: 'los-naranjos',
      name: 'Sector Los Naranjos',
      city: 'Caracas',
      shortZone: 'Los Naranjos',
      badge: 'Centro de Acopio Caracas',
      isCentral: false,
      mapUrl: 'https://maps.google.com/maps?q=Sector+Los+Naranjos+Caracas+Venezuela&t=&z=14&ie=UTF8&iwloc=&output=embed',
      googleSearchUrl: 'https://www.google.com/maps/search/?api=1&query=Sector+Los+Naranjos+Caracas+Venezuela'
    },
    {
      id: 'chuao',
      name: 'Sector Chuao',
      city: 'Caracas',
      shortZone: 'Chuao',
      badge: 'Centro de Acopio Caracas',
      isCentral: false,
      mapUrl: 'https://maps.google.com/maps?q=Sector+Chuao+Caracas+Venezuela&t=&z=14&ie=UTF8&iwloc=&output=embed',
      googleSearchUrl: 'https://www.google.com/maps/search/?api=1&query=Sector+Chuao+Caracas+Venezuela'
    }
  ];

  const currentPoint = puntos.find(p => p.id === selectedLocationId) || puntos[0];

  return (
    <section id="insumos" className="py-12 md:py-16 bg-stone-50 border-t border-stone-200 scroll-mt-20">
      <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
        
        {/* Encabezado: Descripción, Horarios y Aviso de Activación de Dirección */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-ocean/10 text-brand-ocean text-xs font-bold uppercase tracking-wider mb-3">
            <Package size={14} />
            <span>Puntos de Acopio</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-dark mb-3">
            Donación de Insumos
          </h2>

          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Recepción de <strong>alimentos no perecederos, comida fresca, hidratación y chucherías en buen estado</strong>.
          </p>

          {/* Horario Requerido */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-stone-200 shadow-2xs text-xs sm:text-sm text-stone-700">
            <Clock size={16} className="text-brand-ocean shrink-0" />
            <span><strong>Horario:</strong> Lunes a Viernes de 8:00 a.m. a 5:00 p.m. <span className="text-stone-500">(Previa coordinación)</span></span>
          </div>

          {/* Nota de Activación de Dirección */}
          <p className="mt-3 text-xs sm:text-sm text-stone-500 font-medium">
            (Se activa la dirección exacta tras completar el formulario de contacto según cercanía).
          </p>
        </div>

        {/* Selector de Zonas: Sector Macuto, Sector Chacao, Sector Los Naranjos, Sector Chuao */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {puntos.map((punto) => {
            const isSelected = selectedLocationId === punto.id;
            return (
              <button
                key={punto.id}
                type="button"
                onClick={() => setSelectedLocationId(punto.id)}
                className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-brand-dark text-white border-brand-dark shadow-md'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-brand-ocean hover:bg-stone-50'
                }`}
                id={`btn-zona-${punto.id}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      isSelected
                        ? punto.isCentral ? 'bg-teal-500 text-brand-dark' : 'bg-white/20 text-white'
                        : punto.isCentral ? 'bg-teal-100 text-teal-800' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {punto.badge}
                    </span>
                    {isSelected && <CheckCircle2 size={14} className="text-teal-400" />}
                  </div>
                  <h4 className="font-bold text-sm mb-1">{punto.name}</h4>
                  <p className={`text-xs leading-snug ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                    {punto.city} &bull; {punto.shortZone}
                  </p>
                </div>

                <div className={`mt-3 pt-2 border-t text-[11px] font-medium flex items-center gap-1 ${
                  isSelected ? 'border-white/15 text-teal-300' : 'border-stone-100 text-brand-ocean'
                }`}>
                  <Navigation size={12} />
                  <span>Ver zona en mapa</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Visualizador de Google Maps por Zonas */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-soft overflow-hidden">
          {/* Barra Superior del Mapa */}
          <div className="bg-stone-100 px-4 py-3 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-brand-ocean" />
              <span className="font-bold text-stone-800 text-sm">{currentPoint.name}</span>
              <span className="text-stone-500 hidden sm:inline">&bull; Zona: {currentPoint.shortZone} ({currentPoint.city})</span>
            </div>

            <a
              href={currentPoint.googleSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-ocean hover:bg-[#0a6670] text-white font-semibold rounded-lg transition-colors cursor-pointer text-xs"
              id="btn-abrir-gmaps"
            >
              <span>Abrir zona en Google Maps</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Iframe Interactivo de Google Maps centrado en la zona */}
          <div className="w-full h-72 sm:h-80 md:h-96 relative bg-stone-100">
            <iframe
              title={`Google Maps - ${currentPoint.name}`}
              src={currentPoint.mapUrl}
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
            />
          </div>

          {/* Pie informativo con recordatorio y acceso al formulario */}
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-600">
            <p className="leading-relaxed">
              📍 <strong>Zona mostrada:</strong> {currentPoint.name} ({currentPoint.city}).
              <br />
              <span className="text-stone-500">
                (Se activa la dirección exacta tras completar el formulario de contacto según cercanía).
              </span>
            </p>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href="#contacto"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-ocean hover:bg-[#0a6670] text-white font-semibold rounded-xl transition-all shadow-2xs"
              >
                <FileText size={14} />
                <span>Formulario de Contacto</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
