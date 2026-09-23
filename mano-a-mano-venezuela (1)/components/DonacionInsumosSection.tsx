import React, { useState } from 'react';
import { 
  Package, 
  MapPin, 
  Clock, 
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
                  <CheckCircle2 size={12} />
                  <span>{isSelected ? 'Punto seleccionado' : 'Seleccionar punto'}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detalle y Coordinación del Punto Seleccionado (Sin Mapa) */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-soft p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-brand-ocean/10 text-brand-ocean flex items-center justify-center shrink-0">
              <MapPin size={22} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h4 className="font-bold text-stone-900 text-base">{currentPoint.name}</h4>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200">
                  {currentPoint.city}
                </span>
                <span className="text-xs text-stone-500">
                  Referencia: {currentPoint.shortZone}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Por motivos de seguridad y organización logística, la dirección física exacta se activa tras completar el formulario de contacto para coordinar la entrega con el equipo de recepción de la Brigada 99HDD.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto">
            <a
              href="#contacto"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-ocean hover:bg-[#0a6670] text-white font-bold rounded-xl transition-all shadow-sm text-xs sm:text-sm cursor-pointer"
              id="btn-coordinar-entrega"
            >
              <FileText size={16} />
              <span>Coordinar Entrega</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
