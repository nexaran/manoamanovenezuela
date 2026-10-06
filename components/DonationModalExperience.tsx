import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Heart, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Copy, 
  Check, 
  CheckCircle2, 
  Sparkles,
  Truck,
  Utensils,
  Home,
  Mail,
  HelpCircle,
  FileText,
  Printer,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Gauge,
  AlertCircle
} from 'lucide-react';
import { PAYMENT_PLATFORMS, PaymentPlatform } from './DonationModal';

export interface DonationModalExperienceProps {
  isOpen: boolean;
  onClose: () => void;
  initialDestino?: string;
  initialAmount?: number;
  onDonationConfirmed: (amount: number, donorName: string) => void;
}

// 3 Metas Claras y Humanas
export const DONATION_CAUSES = [
  {
    id: 'albergues',
    title: 'Alimentación y Salud en Albergues',
    subtitle: 'Comidas calientes, agua purificada, fórmulas pediátricas y medicinas en 16 albergues.',
    icon: Utensils,
    color: 'from-amber-500 to-rose-500',
    borderColor: 'border-amber-400/40',
    bgBadge: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
    tag: 'Mayor Urgencia',
    suggestedAmounts: [
      { amt: 1, label: '$1 USD', impact: '1 ración de agua purificada o alimento básico' },
      { amt: 5, label: '$5 USD', impact: '3 raciones calientes de comida' },
      { amt: 15, label: '$15 USD', impact: 'Kit de primeros auxilios y medicinas' },
      { amt: 35, label: '$35 USD', impact: 'Agua potable y comida para 1 familia x 1 semana' },
      { amt: 75, label: '$75 USD', impact: 'Olla comunitaria para 45 personas en albergue' }
    ]
  },
  {
    id: 'flota',
    title: 'Flota vehicular de la brigada',
    subtitle: 'Combustible diario, repuestos y adquisición de motos y rústicos 4x4 para rutas altas.',
    icon: Truck,
    color: 'from-brand-ocean to-teal-600',
    borderColor: 'border-brand-ocean/40',
    bgBadge: 'bg-brand-ocean/20 text-teal-200 border-brand-ocean/30',
    tag: 'Accesibilidad a La Guaira',
    currentRaised: 2780,
    suggestedAmounts: [
      { amt: 1, label: '$1 USD', impact: 'Aporte solidario para logística y movilización' },
      { amt: 10, label: '$10 USD', impact: 'Combustible para 1 ruta de reparto en comunidades' },
      { amt: 25, label: '$25 USD', impact: 'Mantenimiento de filtros y frenos para rústico' },
      { amt: 60, label: '$60 USD', impact: 'Fondo de neumáticos y repuestos de tracción 4x4' },
      { amt: 150, label: '$150 USD', impact: 'Aporte a la flotilla utilitaria de motos 200cc' }
    ]
  },
  {
    id: 'general',
    title: 'Fondo General de Emergencia',
    subtitle: 'Canalizado inmediatamente a donde surja la mayor necesidad operativa del día.',
    icon: Home,
    color: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-400/40',
    bgBadge: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
    tag: 'Flexibilidad Total',
    suggestedAmounts: [
      { amt: 1, label: '$1 USD', impact: 'Aporte solidario de emergencia inmediata' },
      { amt: 5, label: '$5 USD', impact: 'Aporte solidario para insumos prioritarios' },
      { amt: 20, label: '$20 USD', impact: 'Respaldo logístico continuo para brigadistas' },
      { amt: 50, label: '$50 USD', impact: 'Apoyo para traslados y emergencias médicas' },
      { amt: 100, label: '$100 USD', impact: 'Fondo institucional de ayuda humanitaria' }
    ]
  }
];

export interface VehicleCotizacion {
  id: string;
  title: string;
  modality: string;
  marca: string;
  modelo: string;
  ano: string;
  transmision: string;
  color: string;
  duenos: string;
  kilometraje: string;
  ubicacion: string;
  precio: number;
  regalos?: string;
  nota?: string;
  detalles: string[];
}

export const VEHICLE_COTIZACIONES: VehicleCotizacion[] = [
  {
    id: 'toyota-hilux-toyoexito',
    title: 'Toyota Hilux Kavak (Año 2008) - Presupuesto 1',
    modality: 'TOYO ÉXITO LA FLORIDA C.A.',
    marca: 'TOYOTA',
    modelo: 'HILUX (KAVAK)',
    ano: '2008',
    transmision: 'AUTOMÁTICA 4x2',
    color: 'Azul',
    duenos: '7-1 Dueños',
    kilometraje: '258.000 km',
    ubicacion: 'La Florida, Caracas',
    precio: 18500,
    regalos: '📄 Cotización Oficial ($19.000 c/servicio)',
    nota: 'Presupuesto formal emitido a nombre de Jesús Elías Blanco García (Brigada 99HHDD) por Toyo Éxito La Florida C.A. (RIF J-50246668-1). Placa A81DD3A.',
    detalles: [
      'Transmisión Automática 4x2 con tracción trasera de alto torque',
      'Jaula antivuelco / Rack tubular reforzado para bidones de agua',
      'Barra LED frontal de alta penetración y faros auxiliares de techo',
      'Revisada y lista en concesionario Toyo Éxito La Florida'
    ]
  },
  {
    id: 'toyota-hilux-presupuesto-2',
    title: 'Toyota Hilux Kavak (Año 2008) - Presupuesto 2',
    modality: 'TOYO ÉXITO LA FLORIDA C.A.',
    marca: 'Toyota',
    modelo: 'Hilux (Kavak)',
    ano: '2008',
    transmision: 'Automático',
    color: 'Blanco',
    duenos: '5-1 Dueños',
    kilometraje: '110.000 km',
    ubicacion: 'La Florida, Caracas',
    precio: 22500,
    regalos: '📄 Cotización Oficial ($23.000 c/servicio)',
    nota: 'Presupuesto formal emitido a nombre de Jesús Elías Blanco García (Brigada 99HHDD) por Toyo Éxito La Florida C.A. (RIF J-50246668-1). Placa A66AV8T.',
    detalles: [
      'Transmisión Automática suave con motor 4.0L V6',
      'Bajo kilometraje real certificado: 110.000 km',
      'Suspensión elevada con neumáticos todoterreno',
      'Batea bedliner para carga pesada y placa A66AV8T lista para traspaso'
    ]
  },
  {
    id: 'mazda-bt50-presupuesto-3',
    title: 'Mazda BT-50 (Año 2013 / 2012) - Presupuesto 3',
    modality: 'MARIPEREZ / TOYO ÉXITO LA FLORIDA C.A.',
    marca: 'MAZDA',
    modelo: 'BT-50 (Doble Cabina)',
    ano: '2013',
    transmision: 'SINCRÓNICA 4X2',
    color: 'Gris',
    duenos: '3 Dueños',
    kilometraje: '237.718 km',
    ubicacion: 'Mariperez, Caracas',
    precio: 18000,
    regalos: '🎁 Cauchos Nuevos + Full Aire',
    nota: 'Presupuesto formal emitido a nombre de Jesús Elías Blanco García (Brigada 99HHDD) por Toyo Éxito La Florida C.A. (RIF J-50246668-1). Total $18,000 USD.',
    detalles: [
      'Transmisión SINCRÓNICA 4X2 robusta y económica en combustible',
      '🎁 Cauchos nuevos recién instalados para faenas de carga pesada',
      '✅ Full Aire acondicionado enfriando con máxima potencia',
      '✅ Motor y caja secos: sin botes de aceite, no chocada ni recostada'
    ]
  }
];

export const DonationModalExperience: React.FC<DonationModalExperienceProps> = ({
  isOpen,
  onClose,
  initialDestino = 'Alimentación y Salud en Albergues',
  initialAmount = 1,
  onDonationConfirmed
}) => {
  // Pasos: 
  // 1: Causa & Monto
  // 2: Datos del Donante
  // 3: Método de Pago (Copiar datos con 1-clic)
  // 4: Registro de comprobante y constancia oficial
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Estados
  const [selectedCauseId, setSelectedCauseId] = useState<string>('albergues');
  const [amount, setAmount] = useState<string>(String(initialAmount || 1));
  const [customAmountActive, setCustomAmountActive] = useState<boolean>(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PaymentPlatform>(PAYMENT_PLATFORMS[0]); // Zelle por defecto
  const [expandedVehicleQuote, setExpandedVehicleQuote] = useState<string | null>(null);
  const [selectedVehicleSpecific, setSelectedVehicleSpecific] = useState<string | null>(null);
  
  // Datos del donante
  const [donorName, setDonorName] = useState<string>('');
  const [donorContact, setDonorContact] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [dedicationNote, setDedicationNote] = useState<string>('');
  
  // Feedback
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState<boolean>(false);
  const [receiptCode, setReceiptCode] = useState<string>('');

  // Sincronizar props iniciales
  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      if (initialAmount) setAmount(String(initialAmount));
      if (initialDestino) {
        if (initialDestino.toLowerCase().includes('flota') || initialDestino.toLowerCase().includes('vehic')) {
          setSelectedCauseId('flota');
        } else if (initialDestino.toLowerCase().includes('general')) {
          setSelectedCauseId('general');
        } else {
          setSelectedCauseId('albergues');
        }
      }
    }
  }, [isOpen, initialDestino, initialAmount]);

  if (!isOpen) return null;

  const currentCause = DONATION_CAUSES.find(c => c.id === selectedCauseId) || DONATION_CAUSES[0];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleFinish = () => {
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const code = `MMV-99HDD-${new Date().getFullYear()}-${randomSuffix}`;
    setReceiptCode(code);
    setStep(4);
    
    const parsedAmount = parseFloat(amount) || 25;
    onDonationConfirmed(parsedAmount, donorName || 'Donante Solidario');
  };

  const getImpactDescription = () => {
    const val = parseFloat(amount) || 0;
    const match = currentCause.suggestedAmounts.find(s => s.amt === val);
    if (match) return match.impact;
    if (val > 0) return `Tu aporte de $${val} USD fortalece directamente la labor de ${currentCause.title}.`;
    return 'Cada aporte brinda alivio y esperanza en La Guaira.';
  };

  // Notificación vía correo electrónico predeterminado
  const emailNotificationUrl = `mailto:manomanovzla@gmail.com?subject=${encodeURIComponent(
    `Reporte de Donación - $${amount} USD - ${donorName || 'Donante Solidario'} - Ref: ${referenceNumber || 'Comprobante'}`
  )}&body=${encodeURIComponent(
`Hola equipo de Mano a Mano Venezuela / Brigada 99HHDD,

Deseo reportar y notificar formalmente el donativo realizado:

DATOS DEL APORTE:
• Donante: ${donorName || 'Anónimo'}
• Monto Donado: $${amount} USD
• Destino / Causa: ${currentCause.title}
• Método / Plataforma de Pago: ${selectedPlatform.name}
• N° de Referencia / Comprobante: ${referenceNumber || 'Adjunto comprobante'}
• N° de Constancia: ${receiptCode}
• Contacto: ${donorContact || 'N/A'}
• Fecha: ${new Date().toLocaleString('es-VE')}
${dedicationNote ? `• Dedicatoria: "${dedicationNote}"\n` : ''}
Adjunto el comprobante de pago en este correo para su verificación contable y auditoría.

Atentamente,
${donorName || 'Donante Solidario'}`
  )}`;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex flex-col justify-start sm:justify-center items-center p-2 sm:p-4 md:p-6 overscroll-contain"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-brand-dark text-white rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl overflow-hidden my-auto sm:my-6 flex flex-col max-h-[96vh] sm:max-h-[92vh]"
        >
          {/* Sticky Header Bar con botón de volver a la principal y cerrar */}
          <div className="sticky top-0 z-20 shrink-0 flex items-center justify-between p-3.5 sm:p-5 md:p-6 border-b border-white/10 bg-[#25004a]/95 backdrop-blur-md">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={onClose}
                className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                title="Volver a la página principal"
                id="btn-modal-back-nav"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Volver a la principal</span>
                <span className="sm:hidden">Volver</span>
              </button>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-lg md:text-xl font-bold text-white truncate flex items-center gap-1.5">
                  <span>Quiero Donar</span>
                  <span className="text-stone-400 font-normal hidden sm:inline">&bull; Mano a Mano</span>
                </h3>
                <p className="text-[10px] sm:text-xs text-stone-300 truncate">
                  {step === 1 && 'Paso 1 de 3: Elige causa y monto'}
                  {step === 2 && 'Paso 2 de 3: Tus datos de donante'}
                  {step === 3 && 'Paso 3 de 3: Cuentas y transferencia'}
                  {step === 4 && 'Constancia oficial de donación'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs shrink-0 ml-2"
              aria-label="Cerrar modal y volver a la principal"
              id="btn-modal-close-icon"
            >
              <X size={18} />
              <span className="hidden sm:inline font-medium">Cerrar</span>
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="shrink-0 w-full bg-stone-800 h-1.5 flex">
            <div 
              className="bg-brand-accent h-full transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>

          {/* Contenido Scrollable */}
          <div className="overflow-y-auto flex-1 overscroll-contain">
            {/* ============================================================ */}
            {/* PASO 1: ELECCIÓN DE CAUSA Y MONTO (CONEXIÓN HUMANA) */}
            {/* ============================================================ */}
            {step === 1 && (
              <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
                <div>
                  <span className="text-[11px] font-bold text-brand-ocean uppercase tracking-wider block mb-1">
                    1. ¿A qué meta deseas que vaya tu donación?
                  </span>
                  <p className="text-xs text-stone-300 leading-relaxed mb-3 sm:mb-4">
                    Selecciona la causa que más resuene en tu corazón. Garantizamos total auditoría del destino de cada fondo.
                  </p>

                  {/* Grid de 3 Causas adaptable y legible en móvil */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    {DONATION_CAUSES.map((cause) => {
                      const IconComp = cause.icon;
                      const isSelected = selectedCauseId === cause.id;
                      return (
                        <button
                          type="button"
                          key={cause.id}
                          onClick={() => setSelectedCauseId(cause.id)}
                          className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative group ${
                            isSelected
                              ? 'bg-white/15 border-brand-accent shadow-lg shadow-brand-accent/10 ring-2 ring-brand-accent/50'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                            <div className={`p-1.5 sm:p-2 rounded-xl bg-gradient-to-br ${cause.color} text-white`}>
                              <IconComp size={16} className="sm:w-[18px] sm:h-[18px]" />
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cause.bgBadge}`}>
                              {cause.tag}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-white leading-snug mb-0.5 sm:mb-1">
                              {cause.title}
                            </h4>
                            <p className="text-[10px] sm:text-[11px] text-stone-300 line-clamp-2 leading-relaxed font-light">
                              {cause.subtitle}
                            </p>
                            {cause.currentRaised && (
                              <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-teal-200 font-semibold bg-brand-ocean/20 border border-brand-ocean/40 px-2 py-0.5 rounded-md">
                                <span>Recaudado:</span>
                                <strong className="text-white">${cause.currentRaised.toLocaleString()} USD</strong>
                              </div>
                            )}
                          </div>

                          <div className="mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-white/5 flex items-center justify-between text-[10px] sm:text-[11px]">
                            <span className={isSelected ? 'text-brand-accent font-bold' : 'text-stone-400'}>
                              {isSelected ? 'Seleccionada' : 'Elegir causa'}
                            </span>
                            {isSelected && <Check size={14} className="text-brand-accent" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bloque Específico para Flota Vehicular: ¿Por qué solicitamos este monto? & Cotizaciones Reales */}
                {selectedCauseId === 'flota' && (
                  <div className="p-4 sm:p-5 bg-[#240348] border-2 border-brand-ocean/40 rounded-2xl text-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-brand-ocean/20 pb-3">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-brand-ocean/30 text-teal-200 border border-brand-ocean/50 rounded-full font-bold text-[10px] uppercase tracking-wider mb-1">
                          <Truck size={13} />
                          <span>Accesibilidad a La Guaira &bull; Brigada 99HDD</span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                          <span>¿Por qué necesitamos este monto para la flota?</span>
                        </h4>
                      </div>
                      
                      <div className="bg-black/60 border border-brand-ocean/30 px-3 py-1.5 rounded-xl self-start sm:self-auto text-right">
                        <span className="text-[10px] text-stone-400 block">Recaudado hasta el momento:</span>
                        <strong className="text-sm font-mono text-teal-200 font-extrabold">$2,780 USD</strong>
                      </div>
                    </div>

                    <div className="text-stone-300 text-[11px] sm:text-xs leading-relaxed space-y-1.5">
                      <p>
                        <strong className="text-white">Situación en terreno:</strong> Tras el doblete sísmico del 24 de junio de 2026, la vialidad en La Guaira (rutas altas, Carayaca, Naiguatá y pasos con fallas de borde) quedó gravemente dañada. Atendemos a más de 16 albergues y 13 comunidades donde los vehículos convencionales no pueden subir con peso.
                      </p>
                      <p>
                        <strong className="text-white">Objetivo del fondo:</strong> Requerimos adquirir una unidad pickup de carga resistente en óptimas condiciones mecánicas para transportar diariamente agua potable, comida caliente en ollas comunitarias, plantas eléctricas y brigadistas.
                      </p>
                      <p className="text-teal-100">
                        Evaluamos con total transparencia las <strong className="text-white">3 cotizaciones reales de vehículos</strong> recibidas en Caracas:
                      </p>
                    </div>

                    {/* Acordeón / Tarjetas de las 3 Cotizaciones */}
                    <div className="space-y-2.5 pt-1">
                      {VEHICLE_COTIZACIONES.map((quote) => {
                        const isExpanded = expandedVehicleQuote === quote.id;
                        const isChosen = selectedVehicleSpecific === quote.id;

                        return (
                          <div 
                            key={quote.id}
                            className={`border rounded-xl transition-all overflow-hidden ${
                              isChosen 
                                ? 'bg-brand-ocean/20 border-brand-ocean ring-1 ring-brand-ocean/40' 
                                : 'bg-black/40 border-white/10 hover:border-white/20'
                            }`}
                          >
                            <div 
                              className="p-3 flex items-center justify-between gap-3 cursor-pointer"
                              onClick={() => setExpandedVehicleQuote(isExpanded ? null : quote.id)}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-teal-300 font-mono font-semibold">
                                    {quote.modality}
                                  </span>
                                  {quote.regalos && (
                                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                                      {quote.regalos}
                                    </span>
                                  )}
                                </div>
                                <h5 className="font-bold text-xs sm:text-sm text-white truncate mt-0.5">
                                  {quote.title}
                                </h5>
                                <span className="text-[10px] text-stone-400">
                                  {quote.transmision} &bull; {quote.color} &bull; {quote.kilometraje} &bull; {quote.ubicacion}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <div className="text-right">
                                  <span className="text-[10px] text-stone-400 block">Cotizado:</span>
                                  <span className="font-mono font-extrabold text-sm text-white">${quote.precio.toLocaleString()} USD</span>
                                </div>
                                <div className="p-1 rounded bg-white/5 text-stone-400">
                                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </div>
                              </div>
                            </div>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="border-t border-white/10 p-3 bg-black/60 space-y-2 text-[11px]"
                                >
                                  {quote.nota && (
                                    <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-200 rounded-lg text-[10px] leading-relaxed">
                                      {quote.nota}
                                    </div>
                                  )}

                                  <div className="grid grid-cols-2 gap-2 text-stone-300 text-[10px] sm:text-[11px]">
                                    <div><strong>Marca y Modelo:</strong> {quote.marca} {quote.modelo} ({quote.ano})</div>
                                    <div><strong>Dueños:</strong> {quote.duenos}</div>
                                    <div><strong>Transmisión:</strong> {quote.transmision}</div>
                                    <div><strong>Ubicación:</strong> {quote.ubicacion}</div>
                                  </div>

                                  <div className="space-y-1 pt-1 border-t border-white/10">
                                    <span className="font-semibold text-stone-300 block text-[10px]">Detalles de la cotización:</span>
                                    {quote.detalles.map((d, di) => (
                                      <div key={di} className="flex items-start gap-1.5 text-stone-300 text-[10px]">
                                        <CheckCircle2 size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                                        <span>{d}</span>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="pt-2 flex items-center justify-between">
                                    <span className="text-[10px] text-stone-400">
                                      {isChosen ? 'Seleccionado como vehículo prioritario' : '¿Deseas destinar tu aporte a esta cotización?'}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedVehicleSpecific(quote.id);
                                        setAmount(String(Math.min(50, quote.precio)));
                                      }}
                                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                                        isChosen 
                                          ? 'bg-brand-ocean text-white' 
                                          : 'bg-white/10 hover:bg-white/20 text-teal-200'
                                      }`}
                                    >
                                      {isChosen ? 'Cotización Seleccionada' : 'Aportar a este vehículo'}
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Selección de Monto con Impacto Tangible */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-brand-ocean uppercase tracking-wider">
                      2. Selecciona el monto a aportar
                    </span>
                    <span className="text-xs font-semibold text-emerald-400">
                      Aceptamos desde $1 USD
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5 mb-3">
                    {currentCause.suggestedAmounts.map((sug, idx) => {
                      const isSelected = !customAmountActive && parseFloat(amount) === sug.amt;
                      const isLastOdd = idx === currentCause.suggestedAmounts.length - 1 && currentCause.suggestedAmounts.length % 2 !== 0;
                      return (
                        <button
                          type="button"
                          key={sug.amt}
                          onClick={() => {
                            setAmount(String(sug.amt));
                            setCustomAmountActive(false);
                          }}
                          className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            isLastOdd ? 'col-span-2 sm:col-span-1' : ''
                          } ${
                            isSelected
                              ? 'bg-brand-accent text-white border-brand-accent shadow-md scale-102 font-bold ring-2 ring-brand-accent/40'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 text-stone-200'
                          }`}
                        >
                          <span className="block text-sm sm:text-base font-extrabold">{sug.label}</span>
                          <span className="block text-[9px] sm:text-[10px] text-stone-300/80 truncate mt-0.5" title={sug.impact}>
                            {sug.impact}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Input de Monto Personalizado */}
                  <div className="relative">
                    <span className="text-[11px] text-stone-400 mb-1 block">¿Deseas ingresar otro monto diferente?</span>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        placeholder="Ej. 10, 25, 50..."
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value);
                          setCustomAmountActive(true);
                        }}
                        className="w-full bg-white/5 border border-white/15 rounded-xl pl-8 pr-16 py-2.5 text-sm text-white font-bold placeholder-stone-500 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-bold">USD</span>
                    </div>
                  </div>

                  {/* Banner de Impacto Inmediato */}
                  <div className="mt-3.5 p-3 sm:p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 sm:gap-3 text-xs text-emerald-200">
                    <Sparkles size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-emerald-300 block mb-0.5">Impacto de tu aporte:</span>
                      <span>{getImpactDescription()}</span>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción de Paso 1: Volver a la principal y Continuar */}
                <div className="pt-3 flex flex-col sm:flex-row gap-2.5 border-t border-white/10">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer order-2 sm:order-1"
                    id="btn-step1-cancel"
                  >
                    <ArrowLeft size={16} />
                    <span>Volver a la página principal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!amount || parseFloat(amount) <= 0}
                    className="w-full flex-1 py-3.5 px-6 bg-brand-accent hover:bg-[#a00e40] text-white rounded-xl font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/20 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                    id="btn-step1-continue"
                  >
                    <span>Continuar &bull; Donar ${amount || 0} USD</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* PASO 2: DATOS DEL DONANTE (TRANSPARENCIA Y CERTIFICACIÓN) */}
            {/* ============================================================ */}
            {step === 2 && (
              <div className="p-4 sm:p-6 md:p-8 space-y-5">
                <div className="bg-brand-ocean/10 border border-brand-ocean/30 rounded-2xl p-3.5 sm:p-4 text-xs text-stone-200 flex items-start gap-3">
                  <ShieldCheck size={18} className="text-brand-ocean shrink-0 mt-0.5" />
                  <p>
                    Para garantizar la transparencia en los informes de gestión y emitir tu constancia personalizada, indícanos a nombre de quién se registra el donativo (o si deseas que sea anónimo).
                  </p>
                </div>

                {/* Resumen Superior */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-400 block">Causa elegida:</span>
                    <span className="font-bold text-white text-sm">
                      {selectedVehicleSpecific 
                        ? `${currentCause.title} - ${VEHICLE_COTIZACIONES.find(v => v.id === selectedVehicleSpecific)?.title}`
                        : currentCause.title}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-stone-400 block">Monto total:</span>
                    <span className="font-extrabold text-brand-ocean text-base">${amount} USD</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                    Nombre Completo, Familia o Empresa *
                  </label>
                  <input 
                    type="text" 
                    required
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Ej. Familia Pérez / María González / Anónimo"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                    Correo Electrónico de Contacto (Opcional)
                  </label>
                  <input 
                    type="text" 
                    value={donorContact}
                    onChange={(e) => setDonorContact(e.target.value)}
                    placeholder="Para enviarte el balance de impacto y agradecimiento"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean transition-all"
                  />
                </div>

                {/* Selección del Método de Pago */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-2">
                    ¿Por cuál método deseas transferir? *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {PAYMENT_PLATFORMS.map((platform) => {
                      const IconC = platform.icon;
                      const isSelected = selectedPlatform.id === platform.id;
                      return (
                        <button
                          type="button"
                          key={platform.id}
                          onClick={() => setSelectedPlatform(platform)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-brand-ocean/20 border-brand-ocean text-white font-bold ring-1 ring-brand-ocean'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 text-stone-300'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg border ${platform.color} shrink-0`}>
                            <IconC size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="block text-xs truncate font-bold text-white">{platform.name}</span>
                            <span className="block text-[10px] text-stone-400 truncate">{platform.category}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Botones de navegación */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 sm:flex-none px-3.5 py-3 rounded-xl bg-white/5 hover:bg-white/15 text-stone-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="Cerrar y volver a la página principal"
                    >
                      <X size={15} /> <span>Salir</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowLeft size={16} /> <span>Atrás</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="w-full flex-1 py-3.5 px-6 bg-brand-accent hover:bg-[#a00e40] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/20 transition-all cursor-pointer"
                  >
                    <span>Ver Cuentas y Transferir (${amount} USD)</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* PASO 3: DETALLES DE CUENTA Y REGISTRO DE COMPROBANTE */}
            {/* ============================================================ */}
            {step === 3 && (
              <div className="p-4 sm:p-6 md:p-8 space-y-6">
                {/* Header de Plataforma Elegida */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl border ${selectedPlatform.color}`}>
                      <selectedPlatform.icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">
                        {selectedPlatform.name}
                      </h4>
                      <span className="text-xs text-stone-400">
                        Monto a transferir: <strong className="text-brand-ocean font-bold">${amount} USD</strong>
                      </span>
                    </div>
                  </div>

                  {/* Selector rápido para cambiar si prefiere otro método */}
                  <select
                    value={selectedPlatform.id}
                    onChange={(e) => {
                      const found = PAYMENT_PLATFORMS.find(p => p.id === e.target.value);
                      if (found) setSelectedPlatform(found);
                    }}
                    className="bg-white/10 border border-white/15 text-xs text-white rounded-xl px-2.5 py-1.5 cursor-pointer focus:outline-none"
                  >
                    {PAYMENT_PLATFORMS.map(p => (
                      <option key={p.id} value={p.id} className="bg-stone-900 text-white">
                        Cambiar a {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lista de Datos Copiables con 1 solo clic */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                    Copia los datos con un solo clic:
                  </span>

                  {selectedPlatform.details.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-stone-400 block uppercase font-semibold">{item.label}</span>
                        <span className="text-sm sm:text-base font-semibold text-white truncate block select-all font-mono">
                          {item.value}
                        </span>
                      </div>

                      {item.copyable && (
                        <button
                          type="button"
                          onClick={() => handleCopy(item.value, item.label)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                            copiedItem === item.label
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white/10 hover:bg-brand-accent text-white'
                          }`}
                        >
                          {copiedItem === item.label ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copiedItem === item.label ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Indicaciones breves */}
                <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 text-xs text-stone-300">
                  <span className="font-bold text-white block mb-0.5">Indicación:</span>
                  <p className="leading-relaxed">{selectedPlatform.instructions}</p>
                </div>

                {/* Campo para ingresar el comprobante */}
                <div className="pt-2 border-t border-white/10">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                    Número de Referencia o Comprobante de Pago *
                  </label>
                  <input 
                    type="text" 
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="Ej. #098124 / TxID / ID de Confirmación"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-stone-500 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean"
                  />
                </div>

                {/* Dedicatoria opcional */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                    Dedicatoria o Mensaje Solidario (Opcional)
                  </label>
                  <input 
                    type="text" 
                    value={dedicationNote}
                    onChange={(e) => setDedicationNote(e.target.value)}
                    placeholder="Ej. 'Con amor para los niños de Naiguatá'"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-brand-ocean"
                  />
                </div>

                {/* Botones de navegación final */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 sm:flex-none px-3.5 py-3 rounded-xl bg-white/5 hover:bg-white/15 text-stone-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="Cerrar y volver a la página principal"
                    >
                      <X size={15} /> <span>Salir</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowLeft size={16} /> <span>Atrás</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="w-full flex-1 py-3.5 px-6 bg-brand-accent hover:bg-[#a00e40] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/20 transition-all cursor-pointer"
                  >
                    <span>Generar Constancia Oficial</span>
                    <CheckCircle2 size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* PASO 4: CONSTANCIA OFICIAL DE DONACIÓN */}
            {/* ============================================================ */}
            {step === 4 && (
              <div className="p-4 sm:p-6 md:p-8 space-y-6">
                <div className="bg-stone-50 text-stone-900 rounded-3xl p-5 sm:p-6 md:p-8 border-2 border-dashed border-stone-300 shadow-inner relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-stone-200">
                    <div>
                      <h5 className="font-black text-lg md:text-xl text-[#310062] tracking-tight">
                        MANO A MANO VENEZUELA
                      </h5>
                      <span className="text-[11px] font-bold text-brand-accent tracking-widest uppercase">
                        Brigada 99HDD &bull; Constancia Oficial de Donación
                      </span>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-stone-500 block uppercase font-mono">Código de Verificación:</span>
                      <span className="text-xs font-extrabold text-stone-900 font-mono bg-stone-200/70 px-2 py-0.5 rounded">
                        {receiptCode}
                      </span>
                    </div>
                  </div>

                  <div className="my-5 sm:my-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Heart fill="currentColor" size={24} />
                      </div>
                      <div>
                        <span className="text-xs text-stone-500 block">Certificamos el aporte de:</span>
                        <h4 className="text-xl font-black text-stone-900">
                          {donorName || 'Donante Solidario'}
                        </h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 sm:p-4 bg-white rounded-2xl border border-stone-200 text-xs">
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase">Monto Certificado:</span>
                        <span className="font-extrabold text-stone-900 text-base">${amount} USD</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase">Causa Destino:</span>
                        <span className="font-bold text-brand-ocean truncate block">
                          {selectedVehicleSpecific 
                            ? `${currentCause.title} (${VEHICLE_COTIZACIONES.find(v => v.id === selectedVehicleSpecific)?.title})`
                            : currentCause.title}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase">Plataforma:</span>
                        <span className="font-semibold text-stone-700">{selectedPlatform.name}</span>
                      </div>
                    </div>

                    {dedicationNote && (
                      <div className="p-3 bg-stone-100 rounded-xl text-xs italic text-stone-700 border-l-4 border-brand-accent">
                        "{dedicationNote}"
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs text-stone-500">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={16} className="text-emerald-600" />
                      <span>Registro auditado en el balance de ayuda humanitaria 2026</span>
                    </span>
                    <span className="font-mono text-[11px]">
                      {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Botones de Finalización: Copiar Constancia y Notificar vía Email */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      const constanciaText = `================================================
BRIGADA 99HDD & MANO A MANO VENEZUELA
CONSTANCIA OFICIAL DE DONACIÓN
================================================
N° Constancia: ${receiptCode}
Fecha: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
Donante: ${donorName || 'Anónimo'}
Monto Aportado: $${amount} USD
Destino del Fondo: ${currentCause.title}
Plataforma: ${selectedPlatform.name}
N° de Referencia: ${referenceNumber || 'Confirmación en proceso'}
Contacto: ${donorContact || 'N/A'}
${dedicationNote ? `Dedicatoria: "${dedicationNote}"\n` : ''}
Estado: Registrado y Auditado en Balance Humanitario 2026
"Donde Dios reúne a dos o más, suceden cosas maravillosas"
================================================`;
                      navigator.clipboard?.writeText(constanciaText);
                      setCopiedReceipt(true);
                      setTimeout(() => setCopiedReceipt(false), 3000);
                    }}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer order-2 sm:order-1"
                  >
                    {copiedReceipt ? (
                      <>
                        <Check size={16} className="text-emerald-400" />
                        <span>¡Constancia Copiada!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>Copiar Constancia</span>
                      </>
                    )}
                  </button>

                  <a
                    href={emailNotificationUrl}
                    className="w-full sm:flex-1 px-4 py-3 rounded-xl bg-brand-ocean hover:bg-[#0a6670] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors order-1 sm:order-2 shadow-md cursor-pointer"
                  >
                    <Mail size={16} />
                    <span>Notificar vía Email</span>
                  </a>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-brand-accent hover:bg-[#a00e40] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer order-3 sm:order-3 shadow-md"
                    id="btn-modal-final-back"
                  >
                    <ArrowLeft size={16} />
                    <span>Volver a la página principal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer order-4 sm:order-4"
                  >
                    <Printer size={16} />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
