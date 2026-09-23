import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  ShieldCheck, 
  Check, 
  Briefcase, 
  Globe, 
  Truck, 
  Bike, 
  Shirt, 
  Droplets, 
  Fuel, 
  Pill, 
  Utensils, 
  Wrench, 
  Sparkles, 
  ArrowRight, 
  Coins, 
  ChevronRight, 
  ArrowLeft,
  DollarSign,
  FileText,
  Camera,
  CheckCircle2,
  Building2,
  User,
  Phone,
  Calendar,
  Gauge,
  Clock,
  Car,
  Mail,
  Copy,
  Database,
  Send,
  MessageSquare,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { 
  saveDonationToDatabase, 
  generateDonorThankYouMessage, 
  generateAdminEmailReport, 
  MicroDonationRecord,
  OFFICIAL_PAYMENT_METHODS,
  PaymentChannelDetails,
  getVerifiedDonationsTotal
} from '../lib/donationReportService';
import { AntiAbuseGuard } from '../lib/antiAbuseGuard';

interface FinanciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  raisedAmount: number;
  onOpenDonationFlow: (amount: number, destino: string) => void;
  onDonationConfirmed?: (amount: number, donorName: string) => void;
}

// 5 Metas de Infraestructura a Largo Plazo ($25,000)
interface LongTermGoal {
  id: string;
  title: string;
  subtitle: string;
  budget: number;
  budgetRange?: string;
  badge: string;
  badgeColor: string;
  icon: any;
  image?: string;
  description: string;
  breakdown: string[];
  suggestedDonation: number;
}

export interface VehicleOption {
  id: string;
  title: string;
  modelName: string;
  price: number;
  priceFormatted: string;
  year: number;
  transmission: string;
  traction: string;
  vendor: string;
  location: string;
  defaultImage: string;
  highlights: string[];
}

export const FinanciaModal: React.FC<FinanciaModalProps> = ({
  isOpen,
  onClose,
  raisedAmount,
  onOpenDonationFlow,
  onDonationConfirmed,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'financiamiento' | 'microdonaciones' | 'donar'>('overview');
  
  // Opciones de vehículos cotizados para el Pilar #3: Flota vehicular (sin etiquetas redundantes)
  const vehicleOptions: VehicleOption[] = [
    {
      id: 'mazda-bt50',
      title: 'Mazda BT-50 2013 Gris',
      modelName: 'Mazda BT-50 Doble Cabina 2.6L Gasolina',
      price: 18000,
      priceFormatted: '$18.000 USD',
      year: 2013,
      transmission: 'Sincrónica 5 vel.',
      traction: '4x2 Doble Cabina',
      vendor: 'Toyo Éxito / Maripérez',
      location: 'Caracas, D.C.',
      defaultImage: '/vehicles/mazda-bt50-gris-2013.jpg',
      highlights: [
        'Cotización de $18.000 USD cerrado',
        'Batea espaciosa para traslado de agua, alimentos y medicinas',
        'Motor 2.6L de alta durabilidad y mantenimiento sencillo',
        'Revisión mecánica realizada por el concesionario'
      ]
    },
    {
      id: 'hilux-azul',
      title: 'Toyota Hilux Kavak 2008 Azul',
      modelName: 'Toyota Hilux Kavak 4.0L V6 Automática',
      price: 19000,
      priceFormatted: '$19.000 USD',
      year: 2008,
      transmission: 'Automática',
      traction: '4x2 Doble Cabina',
      vendor: 'Toyo Éxito La Florida',
      location: 'La Florida, Caracas',
      defaultImage: '/vehicles/hilux-azul-2008.jpg',
      highlights: [
        'Cotización de $19.000 USD cerrado (incluye servicio técnico)',
        'Motor 4.0L V6 1GR-FE con repuestos universales en Venezuela',
        'Caja automática para relevo ágil de conductores brigadistas',
        'Excelente estado mecánico evaluado en taller especialista',
        'Capacidad de arrastre y carga para rutas continuas hacia La Guaira'
      ]
    },
    {
      id: 'hilux-blanca',
      title: 'Toyota Hilux Kavak 2008 Blanca',
      modelName: 'Toyota Hilux Kavak 4.0L V6 4x4 Automática',
      price: 23000,
      priceFormatted: '$23.000 USD',
      year: 2008,
      transmission: 'Automática',
      traction: '4x4 Doble Cabina',
      vendor: 'Toyo Éxito La Florida',
      location: 'La Florida, Caracas',
      defaultImage: '/vehicles/hilux-blanca-2008.jpg',
      highlights: [
        'Cotización de $23.000 USD cerrado (incluye servicio técnico)',
        'Tracción 4x4 con reductora para accesos a cerros y trochas complejas',
        'Equipamiento completo con suspensión reforzada',
        'Menor kilometraje y tapicería original preservada',
        'Garantía técnica de motor y transmisión'
      ]
    }
  ];

  // Estado para la opción de vehículo seleccionada
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('mazda-bt50');

  // Estado para fotos personalizadas de vehículos subidas por el usuario
  const [customVehiclePhotos, setCustomVehiclePhotos] = useState<Record<string, string>>(() => {
    try {
      const p1 = localStorage.getItem('mmv_vehicle_photo_mazda-bt50');
      const p2 = localStorage.getItem('mmv_vehicle_photo_hilux-azul');
      const p3 = localStorage.getItem('mmv_vehicle_photo_hilux-blanca');
      return {
        ...(p1 ? { 'mazda-bt50': p1 } : {}),
        ...(p2 ? { 'hilux-azul': p2 } : {}),
        ...(p3 ? { 'hilux-blanca': p3 } : {}),
      };
    } catch {
      return {};
    }
  });

  const handleUploadVehiclePhoto = (vehicleId: string, file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setCustomVehiclePhotos(prev => ({ ...prev, [vehicleId]: dataUrl }));
        try {
          localStorage.setItem(`mmv_vehicle_photo_${vehicleId}`, dataUrl);
        } catch (err) {
          console.warn('Could not save photo to localStorage:', err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetVehiclePhoto = (vehicleId: string) => {
    setCustomVehiclePhotos(prev => {
      const next = { ...prev };
      delete next[vehicleId];
      return next;
    });
    try {
      localStorage.removeItem(`mmv_vehicle_photo_${vehicleId}`);
    } catch {}
  };

  // Estado para fotos personalizadas de otros pilares (Moto de carga y Uniformes)
  const [customGoalPhotos, setCustomGoalPhotos] = useState<Record<string, string>>(() => {
    try {
      const pMoto = localStorage.getItem('mmv_goal_photo_moto-carga');
      const pUni = localStorage.getItem('mmv_goal_photo_uniformes');
      return {
        ...(pMoto ? { 'moto-carga': pMoto } : {}),
        ...(pUni ? { 'uniformes': pUni } : {}),
      };
    } catch {
      return {};
    }
  });

  const handleUploadGoalPhoto = (goalId: string, file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setCustomGoalPhotos(prev => ({ ...prev, [goalId]: dataUrl }));
        try {
          localStorage.setItem(`mmv_goal_photo_${goalId}`, dataUrl);
        } catch (err) {
          console.warn('Could not save goal photo to localStorage:', err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetGoalPhoto = (goalId: string) => {
    setCustomGoalPhotos(prev => {
      const next = { ...prev };
      delete next[goalId];
      return next;
    });
    try {
      localStorage.removeItem(`mmv_goal_photo_${goalId}`);
    } catch {}
  };

  // Objeto de destino de la donación activa (para unificar todo en el flujo seguro verificado)
  const [donationTarget, setDonationTarget] = useState<{
    id: string;
    title: string;
    subtitle: string;
    suggestedAmount: number;
    isMacro: boolean;
  }>({
    id: 'general',
    title: 'Apoyo Directo a Cuadrillas y Brigadas',
    subtitle: 'Hidratación, alimentos, combustible y primeros auxilios',
    suggestedAmount: 5,
    isMacro: true
  });

  // Estado del flujo unificado de donación:
  // 1. monto -> 2. registro (datos requeridos) -> 3. pago (método elegido oficial) -> 4. agradecimiento
  const [microStep, setMicroStep] = useState<'monto' | 'registro' | 'pago' | 'agradecimiento'>('monto');
  const [selectedMicroAmount, setSelectedMicroAmount] = useState<number>(5);
  const [customMicroAmountInput, setCustomMicroAmountInput] = useState<string>('');
  
  // Datos requeridos del donador
  const [donorName, setDonorName] = useState<string>('');
  const [donorDocument, setDonorDocument] = useState<string>('');
  const [donorPhone, setDonorPhone] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [donorMotivation, setDonorMotivation] = useState<string>('');
  const [donorPaymentMethod, setDonorPaymentMethod] = useState<string>('binance');
  const [donorPaymentRef, setDonorPaymentRef] = useState<string>('');
  const [isSubmittingDonation, setIsSubmittingDonation] = useState<boolean>(false);
  const [submissionSecurityError, setSubmissionSecurityError] = useState<string | null>(null);
  const [completedDonation, setCompletedDonation] = useState<MicroDonationRecord | null>(null);
  const [hasCopiedReceipt, setHasCopiedReceipt] = useState<boolean>(false);
  const [copiedFieldLabel, setCopiedFieldLabel] = useState<string | null>(null);

  if (!isOpen) return null;

  const effectiveRaisedAmount = typeof raisedAmount === 'number' && raisedAmount > 0 
    ? raisedAmount 
    : getVerifiedDonationsTotal(2780);
  const targetAmount = 25000;
  const progressPercent = Math.max(5, Math.min(100, (effectiveRaisedAmount / targetAmount) * 100));

  // Datos para Financiamiento a Largo Plazo ($25,000)
  const longTermGoals: LongTermGoal[] = [
    {
      id: 'juridico',
      title: 'Gastos jurídicos para constitución de la Organización Civil sin Fines de Lucro',
      subtitle: 'Mano a Mano - 99HDD',
      budget: 2200,
      badge: 'En Borrador Legal',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: Briefcase,
      description: 'Formalización legal ante el Registro Público (SAREN) para adquirir personería jurídica oficial, cuenta bancaria corporativa sin fines de lucro y aval institucional.',
      breakdown: [
        'Honorarios legales para redacción y visado de estatutos fundacionales',
        'Aranceles notariales, timbres fiscales y habilitación SAREN',
        'Protocolización, libros contables oficiales y sellado',
        'Publicación en gaceta / diario de circulación nacional y RIF jurídico'
      ],
      suggestedDonation: 50
    },
    {
      id: 'portal-web',
      title: 'Transformación digital, portal web y verificación de expedientes',
      subtitle: 'Trazabilidad y transparencia tecnológica de casos',
      budget: 3000,
      badge: 'Desarrollo en Curso',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      icon: Globe,
      description: 'Plataforma digital para registro de desplazados y afectados por el doble terremoto que azotó a la Guaira. Expedientes confirmados para total transparencia y conexión real con donantes de buen corazón.',
      breakdown: [
        'Servidores de alta disponibilidad, almacenamiento de fotos y base de datos',
        'Desarrollo del módulo de expedientes y panel de control de brigadistas',
        'Sistema de registro de donaciones con reportes auditables públicos',
        'Dominio institucional, CDN y certificados de ciberseguridad SSL'
      ],
      suggestedDonation: 25
    },
    {
      id: 'vehiculo-pickup',
      title: 'Adquisición de flota vehicular',
      subtitle: '3 opciones evaluadas con cotizaciones reales para la Brigada 99HHDD',
      budget: 18000,
      budgetRange: '$18.000 - $23.000 USD',
      badge: 'Cotizaciones Verificadas ($18.000 - $23.000 USD)',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: Truck,
      image: '/vehicles/mazda-bt50-gris-2013.jpg',
      description: 'Adquisición de un vehículo pick-up para traslado masivo de alimentos, agua, brigadistas y medicinas hacia zonas afectadas.',
      breakdown: [
        'Mazda BT-50 2013 Gris Sincrónica 4x2 ($18.000 USD)',
        'Toyota Hilux Kavak 2008 Azul Automática ($19.000 USD con servicio)',
        'Toyota Hilux Kavak 2008 Blanca Automática ($23.000 USD con servicio)'
      ],
      suggestedDonation: 50
    },
    {
      id: 'moto-carga',
      title: 'Moto para logística de entregas',
      subtitle: 'Maniobrabilidad regional en callejones y cerros',
      budget: 3200,
      badge: '',
      badgeColor: '',
      icon: Bike,
      description: 'Motocicleta 250cc nueva de agencia para subir por callejones angostos, escaleras y veredas donde las camionetas no pueden ingresar.',
      breakdown: [
        'Motocicleta 250cc nueva de agencia ($2,400)',
        'Dotación de 2 cascos de seguridad certificados y eslingas de amarre ($250)',
        'Primer kit de mantenimiento preventivo, filtros y bujías de repuesto ($300)',
        'Placas, seguro de circulación y trámites de tránsito ($250)'
      ],
      suggestedDonation: 50
    },
    {
      id: 'uniformes',
      title: 'Uniformes e identificación (stickers, prendas oficiales)',
      subtitle: 'Seguridad institucional para voluntarios en zonas operativas',
      budget: 1800,
      badge: 'Identificación y Protección',
      badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
      icon: Shirt,
      description: 'Equipamiento visual oficial para garantizar la seguridad de los voluntarios en alcabalas, centros de acopio y comunidades vulnerables.',
      breakdown: [
        '50 Chalecos tácticos reflectivos con parches oficiales bordados ($650)',
        '100 Franelas técnicas transpirables con el emblema Mano a Mano - 99HDD ($600)',
        '100 Credenciales plastificadas con código QR de verificación digital ($250)',
        '500 Stickers impermeables y rotulados para acopios, vehículos y cajas ($300)'
      ],
      suggestedDonation: 20
    }
  ];

  // Ítems informativos en los que se redirigen los aportes directos (solo en donaciones de $1 / libres)
  const redirectedSupportItems = [
    {
      icon: Droplets,
      title: 'Hidratación y Agua Potable',
      color: 'text-cyan-300 bg-cyan-500/20 border-cyan-400/50 shadow-cyan-500/20'
    },
    {
      icon: Fuel,
      title: 'Combustible y Movilidad',
      color: 'text-amber-300 bg-amber-500/20 border-amber-400/50 shadow-amber-500/20'
    },
    {
      icon: Pill,
      title: 'Medicinas y Primeros Auxilios',
      color: 'text-emerald-300 bg-emerald-500/20 border-emerald-400/50 shadow-emerald-500/20'
    },
    {
      icon: Utensils,
      title: 'Alimentación de Cuadrillas',
      color: 'text-fuchsia-300 bg-fuchsia-500/20 border-fuchsia-400/50 shadow-fuchsia-500/20'
    },
    {
      icon: Wrench,
      title: 'Herramientas y Seguridad',
      color: 'text-sky-300 bg-sky-500/20 border-sky-400/50 shadow-sky-500/20'
    }
  ];

  const currentVehicle = vehicleOptions.find(v => v.id === selectedVehicleId) || vehicleOptions[0];

  const effectiveMicroAmount = customMicroAmountInput && parseFloat(customMicroAmountInput) > 0
    ? parseFloat(customMicroAmountInput)
    : selectedMicroAmount;

  const selectedChannelObj = OFFICIAL_PAYMENT_METHODS.find(m => m.id === donorPaymentMethod) || OFFICIAL_PAYMENT_METHODS[0];

  // Iniciar flujo de donación para cualquier causa, vehículo o pilar
  const startDonationFlow = (target: {
    id: string;
    title: string;
    subtitle: string;
    suggestedAmount: number;
    isMacro?: boolean;
  }) => {
    setDonationTarget({
      id: target.id,
      title: target.title,
      subtitle: target.subtitle,
      suggestedAmount: target.suggestedAmount,
      isMacro: target.isMacro ?? true
    });
    setSelectedMicroAmount(target.suggestedAmount);
    setCustomMicroAmountInput('');
    setMicroStep('monto');
    setActiveTab('donar');
  };

  // Manejo de envío seguro de la donación
  const handleMicroDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionSecurityError(null);

    // Protección perimetral anti-ataques: verificación de rate limiting y clicks repetidos
    const limitCheck = AntiAbuseGuard.checkLimit('donation_submission', {
      maxRequests: 3,
      windowMs: 60000,
      cooldownMs: 45000
    });

    if (!limitCheck.allowed) {
      setSubmissionSecurityError(limitCheck.message || 'Demasiadas solicitudes simultáneas detectadas. Por favor espera.');
      return;
    }

    // Validación de integridad de referencia
    if (!donorPaymentRef.trim() || !AntiAbuseGuard.isValidReference(donorPaymentRef)) {
      setSubmissionSecurityError('Por favor ingresa un número de referencia o comprobante bancario válido emitido por tu banco/plataforma.');
      return;
    }

    setIsSubmittingDonation(true);

    const record = saveDonationToDatabase({
      donorName: AntiAbuseGuard.sanitizeInput(donorName),
      donorDocument: AntiAbuseGuard.sanitizeInput(donorDocument),
      donorEmail: AntiAbuseGuard.sanitizeInput(donorEmail),
      donorPhone: AntiAbuseGuard.sanitizeInput(donorPhone),
      amount: effectiveMicroAmount,
      currency: 'USD',
      motivation: AntiAbuseGuard.sanitizeInput(donorMotivation || `Aporte asignado a: ${donationTarget.title}`),
      itemsDirectedTo: [donationTarget.title],
      paymentMethod: selectedChannelObj.name,
      paymentReference: AntiAbuseGuard.sanitizeInput(donorPaymentRef),
      status: 'en_verificacion'
    });

    // Notificar reporte de donación registrada (entra en 'en_verificacion', solo se suma al verificar manualmente)
    if (onDonationConfirmed) {
      onDonationConfirmed(effectiveMicroAmount, AntiAbuseGuard.sanitizeInput(donorName));
    }
    window.dispatchEvent(new CustomEvent('mmv_donation_added', {
      detail: { amount: effectiveMicroAmount, donorName: AntiAbuseGuard.sanitizeInput(donorName) }
    }));

    setCompletedDonation(record);
    setIsSubmittingDonation(false);
    setMicroStep('agradecimiento');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl lg:max-w-3xl bg-[#1f053d] border border-purple-400/25 rounded-3xl text-white shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glows de fondo */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#ff2a6d]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#00f0ff]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Fijo */}
        <div className="px-5 sm:px-7 pt-5 sm:pt-6 pb-4 flex items-start justify-between gap-4 border-b border-white/10 shrink-0 relative z-20">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#4a082c] border border-[#ff2a6d]/30 flex items-center justify-center shrink-0 shadow-md">
              <Heart size={24} className="text-[#ff2a6d]" fill="currentColor" />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Fondos Económicos
              </h3>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mt-0.5 font-normal">
                Sustentabilidad y apoyo directo para la reconstrucción de La Guaira.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="relative z-10 overflow-y-auto px-5 sm:px-7 py-5 flex-1">
          {/* Caja Interior FASE AMPLIA con Barra de Progreso Macro ($25,000 USD) */}
          <div className="bg-[#120025]/90 border border-white/10 rounded-2xl p-4 sm:p-5 mb-5 shadow-inner">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#00f0ff] block">
                  META MACRO DE SOSTENIBILIDAD
                </span>
                <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                  Flota vehicular, logística, portal web y formalización jurídica
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  ${effectiveRaisedAmount.toLocaleString('es-VE')}
                </div>
                <div className="text-[11px] sm:text-xs text-stone-400 font-medium">
                  / $25.000 USD
                </div>
              </div>
            </div>

            {/* Barra de Progreso */}
            <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden p-0.5 border border-white/15">
              <div 
                className="bg-gradient-to-r from-[#ff2a6d] via-purple-500 to-[#00f0ff] h-full rounded-full transition-all duration-500 shadow-md"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-300 mt-2 font-medium">
              <span>Recaudado acumulado: ${effectiveRaisedAmount.toLocaleString('es-VE')} USD</span>
              <span className="text-[#00f0ff] font-bold">{progressPercent.toFixed(1)}% completado</span>
            </div>
          </div>

          {/* Menú de pestañas principales: Proyectos | Dona desde 1$ */}
          {activeTab !== 'donar' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {/* Botón 1: Proyectos de Infraestructura */}
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'financiamiento' ? 'overview' : 'financiamiento')}
                className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  activeTab === 'financiamiento'
                    ? 'bg-gradient-to-r from-purple-900/80 to-[#120025] border-[#00f0ff] shadow-lg ring-1 ring-[#00f0ff]/50'
                    : 'bg-[#120025]/60 border-white/15 hover:border-white/30 hover:bg-[#120025]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
                    <Truck size={18} />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-white block">
                      Proyectos y Flota ($25.000)
                    </span>
                    <span className="text-[11px] text-stone-300 block">
                      5 pilares estratégicos y cotizaciones
                    </span>
                  </div>
                </div>
                <ChevronRight 
                  size={18} 
                  className={`text-stone-400 transition-transform ${activeTab === 'financiamiento' ? 'rotate-90 text-[#00f0ff]' : ''}`} 
                />
              </button>

              {/* Botón 2: Dona desde 1$ */}
              <button
                type="button"
                onClick={() => {
                  startDonationFlow({
                    id: 'microdonaciones',
                    title: 'Dona desde 1$ (Apoyo Inmediato)',
                    subtitle: 'Hidratación, alimentos, combustible, medicinas y herramientas',
                    suggestedAmount: 5,
                    isMacro: false // Donación directa / microdonación independiente de las metas de $25.000
                  });
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  activeTab === 'microdonaciones'
                    ? 'bg-gradient-to-r from-[#4a082c] to-[#120025] border-[#ff2a6d] shadow-lg ring-1 ring-[#ff2a6d]/50'
                    : 'bg-[#120025]/60 border-white/15 hover:border-white/30 hover:bg-[#120025]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#ff2a6d]/20 border border-[#ff2a6d]/40 flex items-center justify-center text-[#ff2a6d] shrink-0">
                    <Coins size={18} />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-white block">
                      Dona desde 1$ (Aporte Inmediato)
                    </span>
                    <span className="text-[11px] text-stone-300 block">
                      Hidratación, combustible y medicinas
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-stone-400" />
              </button>
            </div>
          )}

          {/* VISTA: PILARES DE PROYECTOS Y FLOTA VEHICULAR */}
          {activeTab === 'financiamiento' && (
            <div className="mb-6 pt-2 border-t border-purple-400/20 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
                  <span>5 Pilares Estratégicos</span>
                </h4>
                <span className="text-xs text-stone-300">
                  Transparencia y cotizaciones reales
                </span>
              </div>

              <div className="space-y-4">
                {longTermGoals.map((goal, idx) => {
                  const Icon = goal.icon;

                  // RENDER SIMPLIFICADO Y LIMPIO PARA PILAR #3: FLOTA VEHICULAR
                  if (goal.id === 'vehiculo-pickup') {
                    const vehiclePhoto = customVehiclePhotos[currentVehicle.id] || currentVehicle.defaultImage;

                    return (
                      <div 
                        key={goal.id}
                        className="bg-[#13032b] border-2 border-[#00f0ff]/50 rounded-2xl p-4 sm:p-5 transition-all shadow-xl text-left"
                      >
                        {/* Cabecera del Pilar de Flota */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4 border-b border-white/10 pb-3">
                          <div className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00f0ff]/20 to-purple-900/60 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff] shrink-0 mt-0.5 shadow-md">
                              <Truck size={22} />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-white/10 text-stone-300 border border-white/10">
                                  Pilar #{idx + 1}
                                </span>
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                                  Flota Vehicular &bull; 3 Opciones
                                </span>
                              </div>
                              <h5 className="font-extrabold text-base sm:text-lg text-white leading-snug">
                                Adquisición de flota vehicular
                              </h5>
                              <p className="text-xs text-[#00f0ff]/90 font-medium mt-0.5">
                                3 cotizaciones reales evaluadas para la Brigada 99HHDD
                              </p>
                            </div>
                          </div>

                          <div className="sm:text-right shrink-0 bg-white/5 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border sm:border-0 border-white/10 flex sm:flex-col justify-between items-center sm:items-end">
                            <span className="text-[10px] sm:text-[11px] text-stone-400 font-medium">Meta estimada:</span>
                            <span className="text-base sm:text-xl font-extrabold text-[#00f0ff] tracking-tight">
                              $18.000 - $23.000 USD
                            </span>
                          </div>
                        </div>

                        {/* SELECTOR SENCILLO DE LAS 3 OPCIONES COTIZADAS (SIN TÍTULOS REDUNDANTES) */}
                        <div className="mb-4">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-300 block mb-2">
                            Selecciona la opción de vehículo a evaluar:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {vehicleOptions.map((opt) => {
                              const isSelected = selectedVehicleId === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setSelectedVehicleId(opt.id)}
                                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                    isSelected
                                      ? 'bg-[#00f0ff]/15 border-[#00f0ff] ring-1 ring-[#00f0ff]/50'
                                      : 'bg-black/40 border-white/10 hover:border-white/25 hover:bg-black/60'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-mono font-bold text-white">
                                      {opt.priceFormatted}
                                    </span>
                                    <span className="text-[10px] text-stone-400">
                                      {opt.year}
                                    </span>
                                  </div>
                                  <span className="text-xs font-bold text-white block truncate">
                                    {opt.title}
                                  </span>
                                  <span className="text-[10px] text-stone-400 block mt-0.5 truncate">
                                    {opt.traction} &bull; {opt.transmission}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* FICHA TÉCNICA Y FOTO LIMPIA DEL VEHÍCULO SELECCIONADO */}
                        <div className="bg-black/50 border border-white/15 rounded-2xl p-4 mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                            {/* Visualizador de Foto con Altura Vertical Ampliada */}
                            <div className="md:col-span-6">
                              <div className="relative rounded-xl overflow-hidden border border-white/20 h-64 sm:h-72 md:h-80 w-full bg-black/80 group shadow-lg">
                                <img 
                                  src={vehiclePhoto} 
                                  alt={currentVehicle.title}
                                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/vehicles/mazda-bt50-gris-2013.jpg';
                                  }}
                                />
                                <div className="absolute top-2.5 left-2.5">
                                  <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 shadow">
                                    {currentVehicle.modelName}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Resumen de Especificaciones Clave (Sin títulos redundantes) */}
                            <div className="md:col-span-6 space-y-3">
                              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                                    Precio de Cotización:
                                  </span>
                                  <span className="text-xl font-black text-[#00f0ff]">
                                    {currentVehicle.priceFormatted}
                                  </span>
                                </div>
                                <span className="text-xs font-mono font-bold text-stone-300">
                                  {currentVehicle.year} &bull; {currentVehicle.traction}
                                </span>
                              </div>

                              {/* Tags de características */}
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                                  <span className="text-[10px] text-stone-400 block">Transmisión:</span>
                                  <span className="font-bold text-white">{currentVehicle.transmission}</span>
                                </div>
                                <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                                  <span className="text-[10px] text-stone-400 block">Tracción:</span>
                                  <span className="font-bold text-white">{currentVehicle.traction}</span>
                                </div>
                                <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                                  <span className="text-[10px] text-stone-400 block">Año:</span>
                                  <span className="font-bold text-white">{currentVehicle.year}</span>
                                </div>
                                <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                                  <span className="text-[10px] text-stone-400 block">Ubicación / Concesionario:</span>
                                  <span className="font-bold text-white truncate block">{currentVehicle.vendor}</span>
                                </div>
                              </div>

                              {/* Puntos destacados */}
                              <ul className="space-y-1 text-xs text-stone-300">
                                {currentVehicle.highlights.slice(0, 3).map((hl, hIdx) => (
                                  <li key={hIdx} className="flex items-start gap-1.5">
                                    <Check size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                                    <span>{hl}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Botón CTA: "Apóyanos con un Click" */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/10">
                          <span className="text-xs text-stone-300">
                            ¿Deseas apoyar la compra de esta opción de vehículo para la brigada?
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              startDonationFlow({
                                id: currentVehicle.id,
                                title: `Flota Vehicular: ${currentVehicle.title}`,
                                subtitle: `${currentVehicle.priceFormatted} - ${currentVehicle.vendor}`,
                                suggestedAmount: 50,
                                isMacro: true
                              });
                            }}
                            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-purple-600 to-[#00f0ff] hover:from-purple-500 hover:to-[#38f8ff] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
                          >
                            <span>Apóyanos con un Click</span>
                            <ArrowRight size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // RENDER ESTÁNDAR PARA LOS OTROS PILARES
                  return (
                    <div 
                      key={goal.id}
                      className="bg-[#120025]/95 border border-purple-400/20 hover:border-purple-400/40 rounded-2xl p-4 sm:p-5 transition-all shadow-lg"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
                            <Icon size={20} />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-white/10 text-stone-300 border border-white/10">
                                Pilar #{idx + 1}
                              </span>
                              {goal.badge ? (
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${goal.badgeColor}`}>
                                  {goal.badge}
                                </span>
                              ) : null}
                            </div>
                            <h5 className="font-bold text-sm sm:text-base text-white leading-snug">
                              {goal.title}
                            </h5>
                            <p className="text-xs text-purple-200/80 font-medium mt-0.5">
                              {goal.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="sm:text-right shrink-0 bg-white/5 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border sm:border-0 border-white/10 flex sm:flex-col justify-between items-center sm:items-end">
                          <span className="text-[10px] sm:text-[11px] text-stone-400 font-medium">Presupuesto estimado:</span>
                          <span className="text-base sm:text-xl font-extrabold text-[#00f0ff] tracking-tight">
                            ${goal.budget.toLocaleString()} USD
                          </span>
                        </div>
                      </div>

                      {/* Descripción */}
                      <p className="text-xs text-stone-300 leading-relaxed mb-3">
                        {goal.description}
                      </p>

                      {/* Visualización limpia de foto para Moto y Uniformes (sin botones ni distintivos superpuestos) */}
                      {(goal.id === 'moto-carga' || goal.id === 'uniformes') && (customGoalPhotos[goal.id] || (goal as any).image) && (
                        <div className="mb-3">
                          <div className="rounded-xl overflow-hidden border border-white/20 relative group max-h-56 bg-black/60 shadow-md">
                            <img 
                              src={customGoalPhotos[goal.id] || (goal as any).image} 
                              alt={goal.title} 
                              className="w-full h-44 sm:h-52 object-cover object-center group-hover:scale-102 transition-transform duration-300"
                            />
                          </div>
                        </div>
                      )}

                      {/* Desglose de partidas */}
                      <div className="bg-black/40 border border-white/10 rounded-xl p-3 mb-3">
                        <span className="text-[10px] font-bold text-[#00f0ff] uppercase tracking-wider block mb-2">
                          Partidas presupuestarias:
                        </span>
                        <ul className="space-y-1 text-xs text-stone-300">
                          {goal.breakdown.map((item, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-1.5">
                              <span className="text-purple-400 mt-0.5 shrink-0 font-bold">&bull;</span>
                              <span className="leading-tight">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA unificado: "Apóyanos con un Click" */}
                      <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            startDonationFlow({
                              id: goal.id,
                              title: `${goal.title}`,
                              subtitle: `${goal.subtitle} ($${goal.budget.toLocaleString()} USD)`,
                              suggestedAmount: goal.suggestedDonation,
                              isMacro: true
                            });
                          }}
                          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-purple-600 to-[#00f0ff] hover:from-purple-500 hover:to-[#38f8ff] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                        >
                          <span>Apóyanos con un Click</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VISTA UNIFICADA DE DONACIÓN DIRECTA (PARA VEHÍCULOS, PILARES O MONTO LIBRE DESDE 1$) */}
          {activeTab === 'donar' && (
            <div className="mb-6 pt-2 border-t border-[#ff2a6d]/30 animate-fade-in">
              {/* Barra superior con volver y resumen de causa */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab(donationTarget.isMacro ? 'financiamiento' : 'overview')}
                  className="text-xs text-stone-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ArrowLeft size={14} /> Volver a las opciones
                </button>
                <span className="px-3 py-1 rounded-full bg-[#ff2a6d]/20 border border-[#ff2a6d]/40 text-[#ff2a6d] text-xs font-bold truncate max-w-[260px]">
                  {donationTarget.title}
                </span>
              </div>

              {/* PASO 1: SELECCIÓN O REDACCIÓN LIBRE DE MONTO */}
              {microStep === 'monto' && (
                <div>
                  {/* Destino de la donación */}
                  <div className="bg-[#4a082c]/40 border border-[#ff2a6d]/30 rounded-2xl p-4 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff2a6d] block mb-1">
                      Destino de tu aporte:
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-white">
                      {donationTarget.title}
                    </h4>
                    <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                      {donationTarget.subtitle}
                    </p>
                  </div>

                  {/* Ítems en los que se redirigen estos apoyos:
                      SOLAMENTE se muestran en donaciones libres / 1$ que NO dependan de la meta de $25.000 */}
                  {!donationTarget.isMacro && (
                    <div className="mb-4">
                      <span className="text-[10px] font-bold text-stone-300 uppercase tracking-wider block mb-2">
                        Impacto directo de estos apoyos inmediatos:
                      </span>
                      <div className="flex flex-wrap gap-2 sm:grid sm:grid-cols-5 sm:gap-2 sm:items-stretch">
                        {redirectedSupportItems.map((item, idx) => {
                          const Icon = item.icon;
                          return (
                            <div 
                              key={idx} 
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shadow-sm transition-all hover:scale-102 sm:flex sm:flex-col sm:items-center sm:justify-center sm:text-center sm:p-2.5 sm:rounded-xl ${item.color}`}
                            >
                              <div className="flex items-center justify-center shrink-0 sm:w-8 sm:h-8 sm:rounded-lg sm:bg-white/10 sm:mb-1.5">
                                <Icon size={14} className="shrink-0 sm:w-4 sm:h-4" />
                              </div>
                              <span className="text-xs sm:text-[11px] font-bold whitespace-nowrap sm:whitespace-normal sm:leading-tight">
                                {item.title}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Selección de montos rápidos y panel de redacción libre */}
                  <div className="bg-black/40 border border-[#ff2a6d]/30 rounded-2xl p-4 sm:p-5 mb-4">
                    <span className="text-xs font-bold text-stone-200 uppercase tracking-wider block mb-3">
                      Selecciona o escribe el monto de tu aporte:
                    </span>
                    
                    {/* Botones de fácil selección de montos */}
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {[1, 5, 20, 50].map((amt) => {
                        const isSelected = selectedMicroAmount === amt && !customMicroAmountInput;
                        return (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => {
                              setSelectedMicroAmount(amt);
                              setCustomMicroAmountInput('');
                            }}
                            className={`py-3 rounded-xl border text-center font-bold text-sm sm:text-base transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-r from-[#ff2a6d] to-purple-600 text-white border-white shadow-lg scale-[1.02]'
                                : 'bg-white/5 border-white/15 text-stone-300 hover:border-white/30 hover:bg-white/10'
                            }`}
                          >
                            ${amt} <span className="text-[10px] font-normal block text-stone-300">USD</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Panel de redacción libre de monto */}
                    <div className="bg-black/60 border border-white/15 rounded-xl p-2.5 flex items-center gap-2">
                      <span className="text-xs text-stone-300 font-medium whitespace-nowrap pl-1">
                        O escribe un monto libre:
                      </span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">$</span>
                        <input
                          type="number"
                          min="1"
                          max="25000"
                          value={customMicroAmountInput}
                          onChange={(e) => {
                            setCustomMicroAmountInput(e.target.value);
                            const val = parseFloat(e.target.value);
                            if (val > 0) setSelectedMicroAmount(val);
                          }}
                          placeholder="Ej. 10, 25, 100..."
                          className="w-full bg-white/10 border border-white/20 rounded-lg pl-7 pr-3 py-1.5 text-sm text-white font-bold focus:outline-none focus:border-[#ff2a6d]"
                        />
                      </div>
                      <span className="text-xs text-stone-400 font-bold pr-1">USD</span>
                    </div>
                  </div>

                  {/* Botón para pasar al formulario de registro */}
                  <button
                    type="button"
                    onClick={() => setMicroStep('registro')}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#ff2a6d] via-pink-600 to-purple-600 hover:brightness-110 text-white font-extrabold text-sm sm:text-base text-center transition-all cursor-pointer shadow-lg active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Heart size={18} fill="currentColor" />
                    <span>Continuar con mi Aporte de ${effectiveMicroAmount} USD</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* PASO 2: REGISTRO PREVIO DEL DONANTE */}
              {microStep === 'registro' && (
                <div className="bg-black/40 border border-[#ff2a6d]/30 rounded-2xl p-4 sm:p-6 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                    <button
                      type="button"
                      onClick={() => setMicroStep('monto')}
                      className="text-xs text-stone-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ArrowLeft size={14} /> Cambiar monto (${effectiveMicroAmount} USD)
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">
                        Paso 1 de 2
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[#ff2a6d]/20 border border-[#ff2a6d]/40 text-[#ff2a6d] text-xs font-bold">
                        Aporte: ${effectiveMicroAmount} USD
                      </span>
                    </div>
                  </div>

                  {/* Aviso informativo de canales oficiales */}
                  <div className="bg-sky-500/10 border border-sky-400/30 rounded-xl p-3 mb-4 flex items-start gap-2.5">
                    <ShieldCheck size={16} className="text-sky-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-stone-200 leading-relaxed">
                      <strong className="text-sky-300">Canales oficiales de recepción:</strong> Los fondos se reciben únicamente a través de los canales autorizados: <strong>Binance, Zelle, PayPal, ACH y Bizum</strong>.
                    </div>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      setMicroStep('pago');
                    }} 
                    className="space-y-3.5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-stone-200 block mb-1">
                          Nombre completo o Razón Social: <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                          <input
                            type="text"
                            required
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                            placeholder="Nombre del donante o empresa"
                            className="w-full bg-white/10 border border-white/20 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-stone-400 focus:outline-none focus:border-[#ff2a6d]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-stone-200 block mb-1">
                          Cédula de Identidad o RIF: <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <FileText size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                          <input
                            type="text"
                            required
                            value={donorDocument}
                            onChange={(e) => setDonorDocument(e.target.value)}
                            placeholder="V-12345678 / J-12345678-0"
                            className="w-full bg-white/10 border border-white/20 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-stone-400 focus:outline-none focus:border-[#ff2a6d]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-stone-200 block mb-1">
                          Teléfono de contacto: <span className="text-rose-400">* (Obligatorio)</span>
                        </label>
                        <div className="relative">
                          <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                          <input
                            type="tel"
                            required
                            value={donorPhone}
                            onChange={(e) => setDonorPhone(e.target.value)}
                            placeholder="+58 412 1234567 / +1 ..."
                            className="w-full bg-white/10 border border-white/20 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-stone-400 focus:outline-none focus:border-[#ff2a6d]"
                          />
                        </div>
                        <span className="text-[10px] text-stone-400 mt-0.5 block">
                          Requerido para verificación y reporte de constancia.
                        </span>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-stone-200 block mb-1">
                          Correo electrónico: <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                          <input
                            type="email"
                            required
                            value={donorEmail}
                            onChange={(e) => setDonorEmail(e.target.value)}
                            placeholder="tucorreo@ejemplo.com"
                            className="w-full bg-white/10 border border-white/20 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-stone-400 focus:outline-none focus:border-[#ff2a6d]"
                          />
                        </div>
                        <span className="text-[10px] text-stone-400 mt-0.5 block">
                          Para recibir tu constancia de aporte auditada.
                        </span>
                      </div>
                    </div>

                    {/* Método donde desea realizar la donación */}
                    <div>
                      <label className="text-xs font-bold text-stone-200 block mb-1">
                        ¿A través de qué método deseas transferir tu aporte? <span className="text-rose-400">*</span>
                      </label>
                      <select
                        required
                        value={donorPaymentMethod}
                        onChange={(e) => setDonorPaymentMethod(e.target.value)}
                        className="w-full bg-[#1b002c] border border-[#ff2a6d]/40 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-[#ff2a6d]"
                      >
                        {OFFICIAL_PAYMENT_METHODS.map((channel) => (
                          <option key={channel.id} value={channel.id} className="bg-[#1b002c] text-white py-1">
                            {channel.name} ({channel.badge})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#ff2a6d] to-purple-600 hover:brightness-110 text-white font-extrabold text-sm sm:text-base text-center transition-all cursor-pointer shadow-lg active:scale-98 flex items-center justify-center gap-2"
                      >
                        <span>Continuar a Datos de Transferencia</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* PASO 3: COORDENADAS OFICIALES Y FORMULARIO DE CONFIRMACIÓN */}
              {microStep === 'pago' && (
                <div className="bg-black/40 border border-[#00f0ff]/30 rounded-2xl p-4 sm:p-6 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                    <button
                      type="button"
                      onClick={() => setMicroStep('registro')}
                      className="text-xs text-stone-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ArrowLeft size={14} /> Modificar datos
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">
                        Paso 2 de 2
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[#00f0ff]/20 border border-[#00f0ff]/40 text-[#00f0ff] text-xs font-bold">
                        ${effectiveMicroAmount} USD
                      </span>
                    </div>
                  </div>

                  {/* Ficha oficial de coordenadas de pago */}
                  <div className="bg-gradient-to-br from-[#120025] to-[#250838] border-2 border-[#00f0ff]/40 rounded-2xl p-4 sm:p-5 mb-5 shadow-xl">
                    <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-white/10">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded border border-[#00f0ff]/30">
                          {selectedChannelObj.badge}
                        </span>
                        <h4 className="text-base sm:text-lg font-black text-white mt-1">
                          {selectedChannelObj.name}
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-stone-400 block">Monto a transferir:</span>
                        <span className="text-lg sm:text-xl font-black text-[#00f0ff]">
                          ${effectiveMicroAmount} USD
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-300 mb-3.5 leading-relaxed">
                      {selectedChannelObj.instructions}
                    </p>

                    {/* Tabla de campos para copiar fácilmente */}
                    <div className="space-y-2 mb-2">
                      {selectedChannelObj.fields.map((f, idx) => (
                        <div 
                          key={idx} 
                          className="bg-black/50 border border-white/10 rounded-xl p-2.5 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <span className="text-[10px] text-stone-400 uppercase font-bold block">
                              {f.label}:
                            </span>
                            <span className="text-xs sm:text-sm font-mono font-bold text-white break-all">
                              {f.value}
                            </span>
                          </div>

                          {f.canCopy && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(f.value);
                                setCopiedFieldLabel(f.label);
                                setTimeout(() => setCopiedFieldLabel(null), 2500);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-stone-200 hover:text-white shrink-0 flex items-center gap-1 transition-all cursor-pointer"
                              title="Copiar dato"
                            >
                              {copiedFieldLabel === f.label ? (
                                <>
                                  <Check size={13} className="text-emerald-400" />
                                  <span className="text-emerald-300 text-[11px]">Copiado</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={13} />
                                  <span className="text-[11px]">Copiar</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Formulario de confirmación: N° de Referencia de la operación realizada */}
                  <form onSubmit={handleMicroDonationSubmit} className="space-y-4">
                    <div className="bg-black/60 border border-white/15 rounded-xl p-4">
                      <label className="text-xs font-bold text-white block mb-1.5">
                        Número de Referencia / Comprobante de la Operación: <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={donorPaymentRef}
                          onChange={(e) => setDonorPaymentRef(e.target.value)}
                          placeholder="Ej. TxID de Binance, N° de Confirmación Zelle, Ref PayPal..."
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-400 focus:outline-none focus:border-[#00f0ff] font-mono"
                        />
                      </div>
                      <span className="text-[10px] text-stone-400 mt-1 block">
                        Ingresa el código o número de confirmación emitido por tu banco/plataforma para conciliar tu donativo.
                      </span>
                    </div>

                    {/* Alerta de seguridad anti-abusos / error de validación */}
                    {submissionSecurityError && (
                      <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl flex items-start gap-2.5 text-xs text-red-200 animate-fade-in">
                        <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
                        <span>{submissionSecurityError}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-stone-400 px-1">
                      <span className="flex items-center gap-1">
                        <ShieldCheck size={13} className="text-emerald-400" />
                        Validación y conciliación manual de fondos
                      </span>
                      <span className="text-stone-400">Protección anti-spam activa</span>
                    </div>

                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={isSubmittingDonation}
                        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-[#00f0ff] hover:brightness-110 text-white font-extrabold text-sm sm:text-base text-center transition-all cursor-pointer shadow-lg active:scale-98 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={18} />
                        <span>
                          {isSubmittingDonation ? 'Verificando y Conciliando...' : `Enviar para Verificación ($${effectiveMicroAmount} USD)`}
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* PASO 4: MENSAJE DE AGRADECIMIENTO Y CONSTANCIA */}
              {microStep === 'agradecimiento' && completedDonation && (
                <div className="bg-[#240838] border border-emerald-400/40 rounded-2xl p-4 sm:p-6 animate-fade-in">
                  <div className="flex flex-col items-center text-center pb-4 mb-4 border-b border-white/10">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mb-3 shadow-lg">
                      <CheckCircle2 size={32} />
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-white">
                      ¡Muchas Gracias, {completedDonation.donorName}!
                    </h4>
                    <p className="text-xs text-emerald-300 font-semibold mt-0.5">
                      Tu donación ha sido registrada con éxito. Se sumará al monto total recaudado una vez que la transferencia sea comprobada manualmente por nuestro equipo.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
                        <Clock size={12} className="animate-spin text-amber-300" /> Status: En Verificación Manual
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium">
                        <Database size={12} /> Guardado en Base de Datos
                      </span>
                    </div>
                  </div>

                  {/* Recibo de Aporte */}
                  <div className="bg-black/60 border border-white/15 rounded-xl p-3.5 mb-4 text-xs font-mono space-y-1.5 text-stone-300">
                    <div className="flex justify-between border-b border-white/10 pb-1">
                      <span className="text-stone-400">N° Constancia:</span>
                      <span className="font-bold text-[#00f0ff]">{completedDonation.receiptNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Monto Aportado:</span>
                      <span className="font-bold text-emerald-400">${completedDonation.amount} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Canal Utilizado:</span>
                      <span className="font-bold text-white">{completedDonation.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Referencia:</span>
                      <span className="font-bold text-white break-all">{completedDonation.paymentReference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Asignación:</span>
                      <span className="font-bold text-stone-200 truncate">{donationTarget.title}</span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        const constanciaText = `================================================
BRIGADA 99HHDD & MANO A MANO VENEZUELA
CONSTANCIA OFICIAL DE DONACIÓN
================================================
N° Constancia: ${completedDonation.receiptNumber}
Fecha: ${new Date(completedDonation.timestamp).toLocaleString('es-VE')}
Donante: ${completedDonation.donorName}
Monto Donado: $${completedDonation.amount} USD
Causa / Asignación: ${donationTarget.title}
Canal de Pago: ${completedDonation.paymentMethod}
Referencia Bancaria: ${completedDonation.paymentReference || 'En verificación'}
Cédula / RIF: ${completedDonation.donorDocument || 'N/A'}
Teléfono: ${completedDonation.donorPhone || 'N/A'}
Correo: ${completedDonation.donorEmail || 'N/A'}
Estado: Registrado en Base de Datos Oficial (En Verificación Manual)

"Donde Dios reúne a dos o más, suceden cosas maravillosas"
Auditoría y Transparencia Operación Humanitaria La Guaira 2026
================================================`;
                        navigator.clipboard?.writeText(constanciaText);
                        setHasCopiedReceipt(true);
                        setTimeout(() => setHasCopiedReceipt(false), 3000);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      {hasCopiedReceipt ? (
                        <>
                          <Check size={14} className="text-emerald-400" />
                          <span>¡Constancia Copiada!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copiar Constancia</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`mailto:manomanovzla@gmail.com?subject=${encodeURIComponent(
                        `Reporte de Donación - $${completedDonation.amount} USD - ${completedDonation.donorName} - Ref: ${completedDonation.paymentReference || 'Comprobante'}`
                      )}&body=${encodeURIComponent(
`Hola equipo de Mano a Mano Venezuela / Brigada 99HHDD,

Deseo reportar y notificar el donativo que acabo de realizar a través de la plataforma:

DATOS DEL APORTE:
• Donante: ${completedDonation.donorName}
• Monto Donado: $${completedDonation.amount} USD
• Causa / Asignación: ${donationTarget.title}
• Método / Canal de Pago: ${completedDonation.paymentMethod}
• Número de Referencia: ${completedDonation.paymentReference || 'Adjunto comprobante'}
• N° de Constancia Oficial: ${completedDonation.receiptNumber}
• Cédula / RIF: ${completedDonation.donorDocument || 'N/A'}
• Teléfono de Contacto: ${completedDonation.donorPhone || 'N/A'}
• Correo Electrónico: ${completedDonation.donorEmail || 'N/A'}
• Fecha y Hora: ${new Date(completedDonation.timestamp).toLocaleString('es-VE')}
${completedDonation.motivation ? `• Motivo / Mensaje: "${completedDonation.motivation}"\n` : ''}
Adjunto el comprobante de pago en este correo para su debida verificación contable y registro en el balance de gestión.

Atentamente,
${completedDonation.donorName}`
                      )}`}
                      className="px-4 py-2.5 rounded-xl bg-brand-ocean hover:bg-[#0a6670] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Mail size={14} />
                      <span>Notificar vía Email</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
