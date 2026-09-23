import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle2, 
  Copy, 
  Heart, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Download, 
  Printer, 
  Share2, 
  Sparkles,
  FileText,
  Clock,
  Landmark,
  Wallet,
  Phone,
  Send,
  Building2,
  Check,
  ShieldAlert,
  Mail
} from 'lucide-react';
import { AntiAbuseGuard } from '../lib/antiAbuseGuard';
import { saveDonationToDatabase } from '../lib/donationReportService';

export interface PaymentPlatform {
  id: string;
  name: string;
  category: 'Cripto / Dólares' | 'Banca Internacional' | 'Europa' | string;
  icon: any;
  color: string;
  badge?: string;
  details: {
    label: string;
    value: string;
    copyable?: boolean;
  }[];
  instructions: string;
}

export const PAYMENT_PLATFORMS: PaymentPlatform[] = [
  {
    id: 'binance',
    name: 'Binance',
    category: 'Cripto / Dólares',
    icon: Wallet,
    color: 'bg-[#F3BA2F]/10 text-[#F3BA2F] border-[#F3BA2F]/30',
    badge: 'Binance Pay / USDT',
    details: [
      { label: 'Binance Pay ID', value: '128853309', copyable: true },
      { label: 'Correo asociado', value: 'Disfuncionalcuentas@gmail.com', copyable: true },
      { label: 'Criptomonedas aceptadas', value: 'USDT (Tron/TRC20, BSC), BTC, ETH', copyable: false }
    ],
    instructions: 'Envío instantáneo sin comisiones mediante Binance Pay ID o correo directo.'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    category: 'Banca Internacional',
    icon: Wallet,
    color: 'bg-[#003087]/10 text-[#0079C1] border-[#0079C1]/30',
    badge: 'Tarjetas Internacionales',
    details: [
      { label: 'Correo PayPal', value: 'elandinito.laguaira@gmail.com', copyable: true },
      { label: 'Destinatario', value: 'Villadoral Blanco Family', copyable: true }
    ],
    instructions: 'Acepta donaciones con tarjeta de crédito o saldo PayPal desde cualquier país.'
  },
  {
    id: 'bizum',
    name: 'Bizum',
    category: 'Europa',
    icon: Phone,
    color: 'bg-[#00AAAD]/10 text-[#00AAAD] border-[#00AAAD]/30',
    badge: 'España / Europa',
    details: [
      { label: 'Modalidad', value: 'Coordinación directa vía Email', copyable: false },
      { label: 'Correo de Contacto', value: 'manomanovzla@gmail.com', copyable: true }
    ],
    instructions: 'Se coordina directamente por correo electrónico (manomanovzla@gmail.com) para brindar los datos de Bizum.'
  },
  {
    id: 'zelle',
    name: 'Zelle',
    category: 'Banca Internacional',
    icon: Landmark,
    color: 'bg-[#7414CA]/10 text-[#7414CA] border-[#7414CA]/30',
    badge: 'Inmediato (USD)',
    details: [
      { label: 'Correo Electrónico', value: 'dfblanco2026@gmail.com', copyable: true },
      { label: 'Titular de la cuenta', value: 'Daniel Blanco', copyable: true },
      { label: 'Entidad Bancaria', value: 'Regions Bank (EE.UU.)', copyable: false }
    ],
    instructions: 'Por favor añade en el concepto/memo de Zelle tu nombre o las siglas "Brigada 99HDD".'
  },
  {
    id: 'swift',
    name: 'Transferencia Internacional / ACH',
    category: 'Banca Internacional',
    icon: Building2,
    color: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    badge: 'ACH / SWIFT',
    details: [
      { label: 'Banco', value: 'Regions Bank', copyable: true },
      { label: 'Número de Cuenta', value: '0378775353', copyable: true },
      { label: 'Código ABA / Routing', value: '063104668', copyable: true },
      { label: 'Código SWIFT', value: 'UPNBUS44', copyable: true },
      { label: 'Beneficiario', value: 'Daniel Blanco / Mano a Mano', copyable: true }
    ],
    instructions: 'Para donaciones empresariales o institucionales de mayor escala por transferencia bancaria internacional.'
  }
];

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlatform: PaymentPlatform | null;
  onSelectPlatform: (platform: PaymentPlatform) => void;
  preselectedDestino?: string;
  preselectedAmount?: number;
  onDonationConfirmed: (amount: number, donorName: string) => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  selectedPlatform,
  onSelectPlatform,
  preselectedDestino = 'Fase Amplia / Albergues y Logística',
  preselectedAmount,
  onDonationConfirmed
}) => {
  // Steps: 1: Donor Info -> 2: Payment Details -> 3: Register Reference -> 4: Certificate Receipt
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [donorName, setDonorName] = useState('');
  const [donorContact, setDonorContact] = useState('');
  const [donationAmount, setDonationAmount] = useState(preselectedAmount ? String(preselectedAmount) : '1');
  const [destination, setDestination] = useState(preselectedDestino);
  const [referralSource, setReferralSource] = useState('');
  
  // Reference State
  const [referenceNumber, setReferenceNumber] = useState('');
  const [dedicationNote, setDedicationNote] = useState('');

  // Receipt tracking code
  const [receiptCode, setReceiptCode] = useState('');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);

  // Reset when opening with a new platform or closing
  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      if (preselectedAmount) {
        setDonationAmount(String(preselectedAmount));
      }
      if (preselectedDestino) {
        setDestination(preselectedDestino);
      }
    }
  }, [isOpen, selectedPlatform, preselectedDestino, preselectedAmount]);

  if (!isOpen || !selectedPlatform) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim()) return;
    setStep(2);
  };

  const handleFinishDonation = () => {
    setSecurityError(null);

    const limitCheck = AntiAbuseGuard.checkLimit('general_donation', {
      maxRequests: 3,
      windowMs: 60000,
      cooldownMs: 45000
    });

    if (!limitCheck.allowed) {
      setSecurityError(limitCheck.message || 'Demasiadas solicitudes continuas detectadas. Por favor espera.');
      return;
    }

    if (!referenceNumber.trim() || !AntiAbuseGuard.isValidReference(referenceNumber)) {
      setSecurityError('Por favor introduce un número de comprobante o referencia bancaria válido emitido por tu banco/plataforma.');
      return;
    }

    const parsedAmount = parseFloat(donationAmount) || 1;
    const sanitizedDonorName = AntiAbuseGuard.sanitizeInput(donorName || 'Donante Solidario');
    const sanitizedContact = AntiAbuseGuard.sanitizeInput(donorContact || 'N/A');
    const sanitizedRef = AntiAbuseGuard.sanitizeInput(referenceNumber);
    const sanitizedNote = AntiAbuseGuard.sanitizeInput(dedicationNote || destination || 'Aporte General');

    // Registrar en Base de Datos y despachar a Google Drive
    const savedEntry = saveDonationToDatabase({
      donorName: sanitizedDonorName,
      donorDocument: 'N/A',
      donorPhone: sanitizedContact,
      donorEmail: sanitizedContact.includes('@') ? sanitizedContact : 'donante@manoamanovzla.org',
      amount: parsedAmount,
      currency: 'USD',
      motivation: sanitizedNote,
      itemsDirectedTo: [destination || 'Aporte General Humanitario'],
      paymentMethod: selectedPlatform.name,
      paymentReference: sanitizedRef,
      status: 'en_verificacion'
    });

    setReceiptCode(savedEntry.receiptNumber);
    setStep(4);
    
    // Notify parent to increment raised amount
    onDonationConfirmed(parsedAmount, sanitizedDonorName);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-brand-dark text-white rounded-3xl border border-white/20 shadow-2xl overflow-hidden my-6"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between p-5 md:p-6 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${selectedPlatform.color}`}>
                <selectedPlatform.icon size={22} />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  Donación vía {selectedPlatform.name}
                  {selectedPlatform.badge && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-brand-accent text-white">
                      {selectedPlatform.badge}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-stone-300">
                  Paso {step} de 4: {
                    step === 1 ? 'Tus Datos de Donante' : 
                    step === 2 ? 'Información para Transferir' : 
                    step === 3 ? 'Registrar Número de Referencia' : 'Certificado Oficial de Agradecimiento'
                  }
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="w-full bg-stone-800 h-1.5 flex">
            <div 
              className="bg-brand-accent h-full transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>

          {/* STEP 1: Donor Details Form */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="p-6 md:p-8 space-y-5">
              <div className="bg-brand-ocean/10 border border-brand-ocean/30 rounded-2xl p-4 text-xs text-stone-200 flex items-start gap-3">
                <ShieldCheck size={18} className="text-brand-ocean shrink-0 mt-0.5" />
                <p>
                  Por transparencia e integridad en la auditoría de la Brigada 99HDD, solicitamos estos breves datos para emitir tu constancia de donación personalizada y rastrear el destino del fondo.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                  Nombre Completo o Razón Social (Empresa) *
                </label>
                <input 
                  type="text" 
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Ej. Familia Rodríguez / Juan Pérez / Inversiones C.A."
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                    Correo Electrónico de Contacto
                  </label>
                  <input 
                    type="text" 
                    value={donorContact}
                    onChange={(e) => setDonorContact(e.target.value)}
                    placeholder="Para enviarte tu recibo digital"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                    Monto Estimado a Donar (USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                    <input 
                      type="number" 
                      min="1"
                      required
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      placeholder="25"
                      className="w-full bg-white/5 border border-white/15 rounded-xl pl-8 pr-4 py-3 text-sm text-white font-bold placeholder-stone-500 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Select Amounts */}
              <div>
                <span className="text-[11px] text-stone-400 mb-1.5 block">Sugerencias rápidas:</span>
                <div className="flex flex-wrap gap-2">
                  {['1', '5', '15', '25', '50', '100', '250', '500'].map(amt => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setDonationAmount(amt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        donationAmount === amt 
                          ? 'bg-brand-accent text-white border-brand-accent' 
                          : 'bg-white/5 hover:bg-white/15 text-stone-300 border-white/10'
                      }`}
                    >
                      ${amt} USD
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                  ¿A dónde deseas destinar tu aporte? *
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean transition-all cursor-pointer"
                >
                  <option value="Fase Amplia / Albergues y Logística" className="bg-stone-900 text-white">Fondo General (Gastos jurídicos, logística y transporte diario)</option>
                  <option value="Camioneta Pickup 4x4 Doble Cabina" className="bg-stone-900 text-white">Segmento Flota: Camioneta Pickup 4x4 (Presupuesto #VZ-4X4-019)</option>
                  <option value="Flotilla Motos 200cc" className="bg-stone-900 text-white">Segmento Flota: 2 Motocicletas Utilitarias (Presupuesto #MOTO-LOG-042)</option>
                  <option value="Jornadas de Alimentación e Hidratación" className="bg-stone-900 text-white">Jornadas Específicas: Alimentos, Ollas Comunitarias y Agua Potable</option>
                  <option value="Medicinas y Asistencia Pediátrica" className="bg-stone-900 text-white">Salud: Medicamentos para niños y adultos mayores en albergues</option>
                </select>
              </div>

              {/* Referral */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                  ¿Cómo te enteraste de Mano a Mano / Brigada 99HDD?
                </label>
                <select
                  value={referralSource}
                  onChange={(e) => setReferralSource(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean transition-all cursor-pointer"
                >
                  <option value="" className="bg-stone-900 text-stone-400">Seleccionar opción (opcional)...</option>
                  <option value="Redes Sociales (Instagram / X)" className="bg-stone-900 text-white">Redes Sociales (Instagram / X)</option>
                  <option value="Entrevista en Globovisión (El Solidario)" className="bg-stone-900 text-white">Entrevista en Globovisión (El Solidario)</option>
                  <option value="La Tele Tuya (El Show del Mediodía)" className="bg-stone-900 text-white">La Tele Tuya (El Show del Mediodía)</option>
                  <option value="Recomendación de un amigo o familiar" className="bg-stone-900 text-white">Recomendación de un amigo o familiar</option>
                  <option value="Directamente por un voluntario en terreno" className="bg-stone-900 text-white">Directamente por un voluntario en terreno</option>
                </select>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 bg-brand-accent hover:bg-[#a00e40] text-white rounded-xl font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/20 transition-all hover:scale-[1.01]"
                >
                  <span>Continuar y Ver Datos para Transferir</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Payment Details with 1-click Copy */}
          {step === 2 && (
            <div className="p-6 md:p-8 space-y-6">
              <div className="bg-brand-cream/10 border border-white/10 rounded-2xl p-4 flex justify-between items-center text-xs">
                <div>
                  <span className="text-stone-400 block">Donante:</span>
                  <span className="font-bold text-white text-sm">{donorName}</span>
                </div>
                <div className="text-right">
                  <span className="text-stone-400 block">Monto indicado:</span>
                  <span className="font-bold text-brand-ocean text-base">${donationAmount} USD</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold tracking-wider text-stone-300">
                  Copia los datos de cuenta correspondientes:
                </h4>

                {selectedPlatform.details.map((item, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] text-stone-400 block uppercase">{item.label}</span>
                      <span className="text-sm md:text-base font-semibold text-white truncate block select-all font-mono">
                        {item.value}
                      </span>
                    </div>

                    {item.copyable && (
                      <button
                        onClick={() => handleCopy(item.value, item.label)}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-brand-accent text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                      >
                        {copiedItem === item.label ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        <span>{copiedItem === item.label ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 text-xs text-stone-300 space-y-1">
                <p className="font-semibold text-white">Indicaciones de Transferencia:</p>
                <p className="leading-relaxed">{selectedPlatform.instructions}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowLeft size={16} /> Volver
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full flex-1 py-3.5 px-6 bg-brand-accent hover:bg-[#a00e40] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/20 transition-all"
                >
                  <span>Ya realicé el aporte / Registrar Referencia</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Register Reference / Receipt Hash */}
          {step === 3 && (
            <div className="p-6 md:p-8 space-y-5">
              <div className="text-center max-w-md mx-auto">
                <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart fill="currentColor" size={24} />
                </div>
                <h4 className="text-lg font-bold text-white">
                  ¡Gracias por sumarte a la causa!
                </h4>
                <p className="text-xs text-stone-300 mt-1">
                  Registra el número o código de comprobante para generar tu constancia digital oficial de donación.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                  Número de Referencia / Comprobante de Pago *
                </label>
                <input 
                  type="text" 
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Ej. #0984128 / TxID / ID de Confirmación"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-stone-500 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                  Dedicatoria o Mensaje Especial (Opcional)
                </label>
                <textarea 
                  rows={2}
                  value={dedicationNote}
                  onChange={(e) => setDedicationNote(e.target.value)}
                  placeholder="Ej. 'Con amor para los niños de Naiguatá' o 'Aporte en memoria de nuestra familia'"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean transition-all resize-none"
                />
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-xs text-stone-300 flex items-center justify-between">
                <div>
                  <span className="block text-stone-400">Total a certificar:</span>
                  <span className="font-bold text-white text-base">${donationAmount} USD</span>
                </div>
                <div className="text-right">
                  <span className="block text-stone-400">Destino:</span>
                  <span className="font-medium text-brand-ocean">{destination}</span>
                </div>
              </div>

              {/* Alerta de seguridad anti-abusos */}
              {securityError && (
                <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl flex items-start gap-2.5 text-xs text-red-200 animate-fade-in">
                  <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <span>{securityError}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-stone-400 px-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  Estatus asignado: En Verificación Manual
                </span>
                <span className="text-stone-400">Protección anti-ataque perimetral</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowLeft size={16} /> Volver a datos
                </button>
                <button
                  type="button"
                  onClick={handleFinishDonation}
                  className="w-full flex-1 py-3.5 px-6 bg-brand-accent hover:bg-[#a00e40] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/20 transition-all cursor-pointer"
                >
                  <span>Enviar para Verificación Manual</span>
                  <CheckCircle2 size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Official Certificate Receipt */}
          {step === 4 && (
            <div className="p-6 md:p-8 space-y-6">
              {/* Printable Card Area */}
              <div 
                id="receipt-print-area"
                className="bg-stone-50 text-stone-900 rounded-2xl p-6 md:p-8 border-2 border-dashed border-stone-300 shadow-inner relative overflow-hidden"
              >
                {/* Watermark */}
                <div className="absolute top-2 right-2 opacity-5 pointer-events-none">
                  <Heart size={200} />
                </div>

                {/* Header of Receipt */}
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
                    <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Código de Auditoría:</span>
                    <span className="font-mono font-bold text-xs md:text-sm text-stone-900 bg-stone-200 px-2 py-0.5 rounded">
                      {receiptCode}
                    </span>
                  </div>
                </div>

                {/* Body details */}
                <div className="my-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-stone-500 block uppercase font-semibold text-[10px]">Donante:</span>
                    <span className="text-sm font-bold text-stone-900">{donorName}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block uppercase font-semibold text-[10px]">Monto Aportado:</span>
                    <span className="text-lg font-black text-[#C1124F]">${donationAmount} USD</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block uppercase font-semibold text-[10px]">Vía / Plataforma:</span>
                    <span className="font-medium text-stone-800">{selectedPlatform.name}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block uppercase font-semibold text-[10px]">Destino del Aporte:</span>
                    <span className="font-medium text-stone-800">{destination}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block uppercase font-semibold text-[10px]">Fecha y Hora:</span>
                    <span className="font-mono text-stone-700">{new Date().toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block uppercase font-semibold text-[10px]">Referencia Declarada:</span>
                    <span className="font-mono text-stone-700">{referenceNumber || 'Confirmación en proceso'}</span>
                  </div>
                  <div className="col-span-1 sm:col-span-2 bg-amber-50 border border-amber-200 p-2 rounded-lg flex items-center justify-between">
                    <span className="text-[10px] text-amber-800 font-bold uppercase">Estado de la Transferencia:</span>
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-black text-[10px] uppercase tracking-wider">
                      En Verificación Manual
                    </span>
                  </div>
                </div>

                {dedicationNote && (
                  <div className="mb-4 p-3 bg-white rounded-xl border border-stone-200 text-xs italic text-stone-600">
                    "{dedicationNote}"
                  </div>
                )}

                {/* Message of Gratitude */}
                <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <p className="text-[11px] text-stone-500 leading-relaxed max-w-sm">
                    "Donde Dios reúne a dos o más, suceden cosas maravillosas". Gracias por ser la mano solidaria que reconstruye familias en La Guaira.
                  </p>
                  <div className="text-left sm:text-right text-[10px] text-stone-400 font-mono">
                    Registrado en Base de Datos &bull; Validez Contable y Fiscal
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const constanciaText = `================================================
BRIGADA 99HHDD & MANO A MANO VENEZUELA
CONSTANCIA OFICIAL DE DONACIÓN
================================================
N° Constancia: ${receiptCode}
Fecha: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
Donante: ${donorName || 'Anónimo'}
Monto Donado: $${donationAmount} USD
Causa / Asignación: ${destination}
Canal de Pago: ${selectedPlatform.name}
Referencia Bancaria: ${referenceNumber || 'En verificación'}
Contacto: ${donorContact || 'N/A'}
${dedicationNote ? `Dedicatoria: "${dedicationNote}"\n` : ''}
Estado: Registrado en Base de Datos Oficial (En Verificación Manual)

"Donde Dios reúne a dos o más, suceden cosas maravillosas"
Auditoría y Transparencia Operación Humanitaria La Guaira 2026
================================================`;
                      navigator.clipboard?.writeText(constanciaText);
                      setCopiedReceipt(true);
                      setTimeout(() => setCopiedReceipt(false), 3000);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    {copiedReceipt ? (
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
                      `Reporte de Donación - $${donationAmount} USD - ${donorName || 'Donante Solidario'} - Ref: ${referenceNumber || 'Comprobante'}`
                    )}&body=${encodeURIComponent(
`Hola equipo de Mano a Mano Venezuela / Brigada 99HHDD,

Deseo reportar y notificar formalmente el donativo que acabo de realizar:

DATOS DEL APORTE:
• Donante: ${donorName || 'Anónimo'}
• Monto Donado: $${donationAmount} USD
• Causa / Asignación: ${destination}
• Método / Canal de Pago: ${selectedPlatform.name}
• Número de Referencia: ${referenceNumber || 'Adjunto comprobante'}
• N° de Constancia Oficial: ${receiptCode}
• Contacto: ${donorContact || 'N/A'}
• Fecha: ${new Date().toLocaleString('es-VE')}
${dedicationNote ? `• Dedicatoria: "${dedicationNote}"\n` : ''}
Adjunto el comprobante de pago en este correo para su debida verificación contable y registro en el balance de gestión.

Atentamente,
${donorName || 'Donante Solidario'}`
                    )}`}
                    className="px-4 py-2.5 rounded-xl bg-brand-ocean hover:bg-[#0a6670] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <Mail size={14} />
                    <span>Notificar vía Email</span>
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Printer size={14} />
                    <span>Imprimir</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl bg-brand-accent hover:bg-[#a00e40] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    Finalizar y Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
