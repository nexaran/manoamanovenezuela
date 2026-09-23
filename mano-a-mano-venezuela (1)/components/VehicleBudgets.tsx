import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Heart,
  AlertCircle,
  HelpCircle,
  MapPin,
  Calendar,
  Gauge,
  UserCheck
} from 'lucide-react';
import { getEffectiveVehiclePhotos } from '../lib/vehiclePhotosService';

interface VehicleBudgetProps {
  onSelectVehicleToDonate: (vehicleName: string, targetAmount?: number) => void;
  currentRaisedTotal?: number;
}

export const VehicleBudgets: React.FC<VehicleBudgetProps> = ({ 
  onSelectVehicleToDonate,
  currentRaisedTotal = 2780 
}) => {
  const [expandedPresupuesto, setExpandedPresupuesto] = useState<string | null>(null);
  const [vehiclePhotos, setVehiclePhotos] = useState<Record<string, string>>(() => getEffectiveVehiclePhotos());

  useEffect(() => {
    // Refresh photos if server updated
    fetch('/api/sync-vehicle-photos')
      .then(res => res.json())
      .then(data => {
        if (data && data.vehiclePhotos) {
          setVehiclePhotos(prev => ({ ...prev, ...data.vehiclePhotos }));
        }
      })
      .catch(() => {});
  }, []);

  const vehicleQuotes = [
    {
      id: 'toyota-hilux-toyoexito',
      title: 'Toyota Hilux Kavak (Año 2008)',
      modality: 'TOYO ÉXITO La Florida',
      location: 'La Florida, Caracas',
      price: 18500,
      image: vehiclePhotos['hilux-azul'] || '/vehicles/hilux-azul-2008.jpg',
      badge: 'Presupuesto 1 • Concesionario',
      badgeColor: 'bg-brand-ocean text-white',
      transmission: 'AUTOMÁTICA 4x2',
      color: 'Azul',
      owners: '7-1 Dueños',
      mileage: '258.000 km',
      highlights: [
        'Transmisión AUTOMÁTICA 4x2 con tracción trasera de alto torque',
        'Jaula antivuelco / Rack tubular reforzado para bidones de agua de 20L',
        'Barra LED frontal de alta penetración y faros auxiliares de techo para rescate',
        'Presupuesto formal emitido a nombre de Jesús Elías Blanco García (Brigada 99HHDD)',
        'Placa A81DD3A - Pick Up Doble Cabina con revisión legal lista'
      ],
      breakdown: [
        { item: 'Precio acordado en cotización del vehículo (TOYO ÉXITO La Florida C.A.)', cost: '$18,500 USD' },
        { item: 'Servicio por venta y formalización en concesionario', cost: '$500 USD' },
        { item: 'Total Presupuesto Escaneado (RIF J-50246668-1)', cost: '$19,000 USD' },
        { item: 'Revisión técnica de fluidos y puesta en marcha para brigada', cost: 'Fase de entrega' }
      ],
      recommendation: 'Plataforma de alta resistencia con transmisión automática, jaula de carga pesada y luces de rescate para el enlace Caracas - La Guaira.'
    },
    {
      id: 'toyota-hilux-blanca-toyoexito',
      title: 'Toyota Hilux Kavak (Año 2008)',
      modality: 'TOYO ÉXITO La Florida',
      location: 'La Florida, Caracas',
      price: 22500,
      image: vehiclePhotos['hilux-blanca'] || '/vehicles/hilux-blanca-2008.jpg',
      badge: 'Presupuesto 2 • Concesionario',
      badgeColor: 'bg-brand-ocean text-white',
      transmission: 'AUTOMÁTICA',
      color: 'Blanco',
      owners: '5-1 Dueños',
      mileage: '110.000 km',
      highlights: [
        'Transmisión AUTOMÁTICA con tracción confiable para ruta Caracas - La Guaira',
        'Bajo kilometraje real certificado: 110.000 km con motor V6 4.0 impecable',
        'Suspensión elevada con neumáticos todo terreno para caminos de difícil acceso',
        'Presupuesto formal emitido a nombre de Jesús Elías Blanco García (Brigada 99HHDD)',
        'Placa A66AV8T - Pick Up Doble Cabina con documentos listos para traspaso'
      ],
      breakdown: [
        { item: 'Precio convenido del vehículo (TOYO ÉXITO La Florida C.A.)', cost: '$22,500 USD' },
        { item: 'Servicio por venta y formalización en concesionario', cost: '$500 USD' },
        { item: 'Total Presupuesto Escaneado (RIF J-50246668-1, 02/09/2026)', cost: '$23,000 USD' },
        { item: 'Revisión técnica de fluidos y puesta en marcha para brigada', cost: 'Fase de entrega' }
      ],
      recommendation: 'Excelente opción con muy bajo kilometraje (110.000 km), suspensión levantada y óptima confiabilidad mecánica para rescate y suministros continuos.'
    },
    {
      id: 'mazda-bt50-mariperez-toyoexito',
      title: 'Mazda BT-50 (Año 2013 / 2012)',
      modality: 'Mariperez / TOYO ÉXITO',
      location: 'Mariperez, Caracas',
      price: 18000,
      image: vehiclePhotos['mazda-bt50'] || '/vehicles/mazda-bt50-gris-2013.jpg',
      badge: 'Presupuesto 3 • Taller / Concesionario',
      badgeColor: 'bg-emerald-600 text-white',
      transmission: 'SINCRÓNICA 4X2',
      color: 'Gris',
      owners: '3 Dueños',
      mileage: '237.718 km',
      highlights: [
        'Transmisión SINCRÓNICA 4X2 de óptimo rendimiento en combustible y bajo mantenimiento',
        '🎁 CAUCHOS NUEVOS recién montados listos para trayectos continuos de carga',
        '✅ FULL AIRE acondicionado enfriando al 100% de operatividad',
        '✅ Motor y caja secos: Sin botes de aceite, unidad no chocada ni recostada',
        'Presupuesto formal emitido a nombre de Jesús Elías Blanco García (Brigada 99HHDD) por $18,000 USD'
      ],
      breakdown: [
        { item: 'Precio oficial de venta cotizado (TOYO ÉXITO La Florida C.A.)', cost: '$18,000 USD' },
        { item: 'Dotación de 4 cauchos nuevos instalados', cost: 'Incluido (🎁)' },
        { item: 'Total Presupuesto Escaneado (RIF J-50246668-1, 02/09/2026)', cost: '$18,000 USD' },
        { item: 'Inspección de mecánica y sistema de refrigeración', cost: 'Aprobado' }
      ],
      recommendation: 'Excelente opción económica y robusta con transmisión manual, cauchos nuevos, mecánica seca y óptimo enfriamiento para operaciones de rescate.'
    }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-stone-200/90 shadow-soft relative overflow-hidden text-stone-900">
      {/* Barra de Acento Superior Mano a Mano */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-ocean via-teal-400 to-brand-accent"></div>

      {/* Banner Superior: ¿Por qué solicitamos este monto? */}
      <div className="border-b border-stone-200/90 pb-7 mb-7">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand-ocean/10 border border-brand-ocean/20 text-brand-ocean text-xs font-bold uppercase tracking-wider rounded-full">
              <Truck size={15} />
              <span>Flota Vehicular de la Brigada &bull; Accesibilidad a La Guaira</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 flex items-center gap-2.5">
              <span>¿Por qué necesitamos este monto para la flota?</span>
            </h3>

            <div className="text-xs sm:text-sm text-stone-600 leading-relaxed space-y-2.5 font-normal">
              <p>
                <strong className="text-stone-900 font-semibold">La realidad del terreno:</strong> Tras el doblete sísmico del 24 de junio de 2026, la vialidad en La Guaira (especialmente hacia comunidades altas, Carayaca, Naiguatá y zonas con deslizamientos) quedó severamente comprometida. Los vehículos convencionales no pueden subir con peso ni ingresar a las trochas habilitadas.
              </p>
              <p>
                <strong className="text-stone-900 font-semibold">Nuestra necesidad operativa:</strong> Atendemos a más de 16 albergues y 13 comunidades vulnerables. Para trasladar diariamente cientos de litros de agua purificada y fría, medicinas, plantas eléctricas, internet y rescatistas, requerimos adquirir al menos una (1) unidad pickup de carga resistente en óptimas condiciones mecánicas.
              </p>
              <p className="text-stone-700 font-medium">
                A continuación presentamos con total transparencia las <strong className="text-brand-ocean font-bold">3 cotizaciones reales de vehículos</strong> que nos han realizado concesionarios y consignatarias en Caracas para evaluar la compra más costo-eficiente para la brigada.
              </p>
            </div>
          </div>

          {/* Bloque Financiero: Monto Recaudado Actual */}
          <div className="bg-gradient-to-br from-teal-50/70 via-white to-stone-50 border border-teal-200/80 rounded-2xl p-5 sm:p-6 lg:w-80 shrink-0 shadow-xs">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Monto recaudado actual:</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Activo
              </span>
            </div>

            <div className="text-3xl sm:text-4xl font-extrabold text-brand-ocean tracking-tight my-1">
              ${currentRaisedTotal.toLocaleString()} <span className="text-xs font-semibold text-stone-500">USD</span>
            </div>

            <p className="text-[11px] text-stone-500 mb-3 leading-tight">
              Fondo solidario destinado al segmento de transporte logístico y rescate.
            </p>

            <div className="space-y-1.5 text-xs border-t border-stone-200/80 pt-3 text-stone-600">
              <div className="flex justify-between items-center">
                <span>Rango de cotizaciones:</span>
                <strong className="text-stone-900 font-semibold">$11.300 – $22.500</strong>
              </div>
              <div className="flex justify-between items-center">
                <span>Faltante para meta base:</span>
                <strong className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  ${Math.max(0, 11300 - currentRaisedTotal).toLocaleString()} USD
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de las 3 Cotizaciones Reales */}
      <div className="mb-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-stone-700 mb-4 flex items-center gap-2">
          <FileText size={16} className="text-brand-ocean" />
          <span>Cotizaciones Reales de Vehículos Recibidas:</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {vehicleQuotes.map((quote) => {
            const isExpanded = expandedPresupuesto === quote.id;
            const percentageMin = Math.min(100, Math.round((currentRaisedTotal / quote.price) * 100));

            return (
              <div 
                key={quote.id}
                className="bg-white rounded-2xl border border-stone-200/90 hover:border-brand-ocean/60 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Foto y Badge */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
                    <img 
                      src={quote.image} 
                      alt={quote.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes('hilux-2008-sr5')) {
                          target.src = '/vehicles/hilux-2008-sr5.jpg';
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none"></div>
                    
                    <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase shadow-xs ${quote.badgeColor}`}>
                      {quote.badge}
                    </span>

                    <div className="absolute bottom-2.5 left-3.5 right-3.5">
                      <span className="text-[10px] text-teal-200 font-medium block uppercase tracking-wider">
                        {quote.modality}
                      </span>
                      <h5 className="text-base font-bold text-white leading-tight">
                        {quote.title}
                      </h5>
                    </div>
                  </div>

                  {/* Ficha Técnica y Precio */}
                  <div className="p-4 sm:p-5 space-y-3.5">
                    <div className="flex items-baseline justify-between border-b border-stone-100 pb-2.5">
                      <span className="text-xs text-stone-500 font-medium">Precio Cotizado:</span>
                      <div className="text-right">
                        <span className="text-xl sm:text-2xl font-extrabold text-stone-900">
                          ${quote.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-stone-500 ml-1 font-semibold">USD</span>
                      </div>
                    </div>

                    {/* Barra de Cobertura con lo recaudado */}
                    <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80 text-xs">
                      <div className="flex justify-between text-[11px] mb-1.5 text-stone-600 font-medium">
                        <span>Aporte actual ({percentageMin}%):</span>
                        <strong className="text-brand-ocean font-bold">${currentRaisedTotal.toLocaleString()} USD</strong>
                      </div>
                      <div className="w-full h-2 bg-stone-200/80 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-brand-ocean to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${percentageMin}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Especificaciones clave */}
                    <div className="space-y-2 text-xs text-stone-600">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-brand-ocean shrink-0" />
                        <span><strong>Ubicación:</strong> {quote.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gauge size={14} className="text-brand-ocean shrink-0" />
                        <span><strong>Transmisión:</strong> {quote.transmission}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-brand-ocean shrink-0" />
                        <span><strong>Kilometraje:</strong> {quote.mileage} &bull; {quote.color}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserCheck size={14} className="text-brand-ocean shrink-0" />
                        <span><strong>Historial:</strong> {quote.owners}</span>
                      </div>
                    </div>

                    {/* Puntos destacados */}
                    <div className="pt-2 border-t border-stone-100 space-y-1.5">
                      {quote.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-stone-600">
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>

                    {/* Botón Ver Desglose */}
                    <button
                      type="button"
                      onClick={() => setExpandedPresupuesto(isExpanded ? null : quote.id)}
                      className="w-full py-2 px-3 bg-stone-50 hover:bg-stone-100 text-[11px] font-semibold text-brand-ocean rounded-xl flex items-center justify-between border border-stone-200/80 transition-colors cursor-pointer"
                    >
                      <span>{isExpanded ? 'Ocultar detalles técnicos' : 'Ver desglose de cotización'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden p-3 bg-stone-50/90 rounded-xl border border-stone-200/70 text-[11px] text-stone-600 space-y-2"
                        >
                          <p className="italic text-stone-500">
                            {quote.recommendation}
                          </p>
                          <div className="border-t border-stone-200/60 pt-2 space-y-1">
                            {quote.breakdown.map((b, bi) => (
                              <div key={bi} className="flex justify-between items-center text-[10px]">
                                <span className="pr-1 text-stone-500">{b.item}</span>
                                <span className="font-bold text-stone-800 shrink-0">{b.cost}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Botón de Donar para este vehículo */}
                <div className="p-4 sm:p-5 pt-0">
                  <button
                    type="button"
                    onClick={() => onSelectVehicleToDonate(quote.title, quote.price)}
                    className="w-full py-3 px-4 rounded-xl bg-brand-ocean hover:bg-[#0a6670] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  >
                    <Heart size={15} fill="currentColor" />
                    <span>Aportar a este vehículo (${quote.price.toLocaleString()} USD)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nota de Auditoría y Transparencia */}
      <div className="mt-7 p-4 sm:p-5 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex items-start gap-3.5 text-xs sm:text-sm text-amber-950">
        <ShieldCheck size={20} className="text-amber-800 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-amber-900 block mb-0.5 font-bold">Protocolo de Adquisición y Transparencia:</strong>
          La compra final del vehículo se realizará bajo estricta inspección mecánica en taller de confianza y peritaje legal ante el INTT. Todos los comprobantes de donación, contratos de compraventa y balances de kilometraje estarán abiertos a revisión pública de los donantes y padrinos de la Brigada 99HDD.
        </div>
      </div>
    </div>
  );
};

