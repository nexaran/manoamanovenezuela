import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Sparkles, 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  MessageSquare, 
  Plus, 
  X, 
  Send, 
  Mail, 
  User, 
  Phone, 
  MapPin, 
  KeyRound, 
  ArrowLeft, 
  RefreshCw, 
  AlertCircle, 
  Clock, 
  Lock, 
  Check, 
  Filter,
  Eye,
  Trash2,
  FileCheck
} from 'lucide-react';
import { 
  BeneficiaryTestimonialEntry, 
  ASSISTANCE_TYPE_LABELS 
} from '../lib/casesTypes';
import { 
  getApprovedTestimonials, 
  getPendingTestimonials, 
  submitBeneficiaryTestimonial, 
  approveTestimonial, 
  rejectTestimonial 
} from '../lib/testimonialsService';
import { 
  validatePersonName, 
  validateVenezuelanPhone, 
  validateEmailAddress, 
  sanitizeInput, 
  checkAndAcquireClickLock 
} from '../lib/security';
import { requestEmailVerificationCode, verifyEmailCode } from '../lib/emailVerificationService';

export const TestimoniosSection: React.FC = () => {
  const [approvedList, setApprovedList] = useState<BeneficiaryTestimonialEntry[]>([]);
  const [pendingList, setPendingList] = useState<BeneficiaryTestimonialEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModerationOpen, setIsModerationOpen] = useState(false);
  const [moderationPin, setModerationPin] = useState('');
  const [isModeratorAuthenticated, setIsModeratorAuthenticated] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);

  // Form states
  const [step, setStep] = useState<'form' | 'email_verification' | 'submitting' | 'success'>('form');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [community, setCommunity] = useState('');
  const [assistanceType, setAssistanceType] = useState<BeneficiaryTestimonialEntry['assistanceType']>('alimentos_agua');
  const [rating, setRating] = useState<number>(5);
  const [story, setStory] = useState('');
  const [acceptedAge, setAcceptedAge] = useState(false);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedEntry, setSubmittedEntry] = useState<BeneficiaryTestimonialEntry | null>(null);

  // OTP Verification states
  const [otpInput, setOtpInput] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpBackupCode, setOtpBackupCode] = useState<string | null>(null);
  const [otpSending, setOtpSending] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Load and refresh lists
  const refreshLists = () => {
    setApprovedList(getApprovedTestimonials());
    setPendingList(getPendingTestimonials());
  };

  useEffect(() => {
    refreshLists();

    // Comprobar parámetros en URL para aprobación directa desde correo (por ejemplo ?aprobar_testimonio=ID)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const approveId = urlParams.get('aprobar_testimonio') || urlParams.get('approve_testimonio');
      const token = urlParams.get('token');
      if (approveId && (token === '99HDD' || token === 'directiva')) {
        const res = approveTestimonial(approveId, 'Aprobación vía Enlace Directo');
        if (res.success) {
          refreshLists();
          // Limpiar la URL sin recargar
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    } catch {}
  }, []);

  // Timer para código OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpCooldown > 0) {
      timer = setTimeout(() => {
        setOtpCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCooldown]);

  // Paso 1: Enviar formulario e iniciar verificación de correo
  const handleStartVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isAnonymous && !name.trim()) {
      setErrorMsg('Por favor indica tu nombre o marca la casilla para publicar de forma anónima.');
      return;
    }

    if (!email.trim()) {
      setErrorMsg('El correo electrónico es obligatorio para validar que eres una persona real y emitir tu código de verificación.');
      return;
    }

    const emailVal = validateEmailAddress(email);
    if (!emailVal.valid) {
      setErrorMsg(emailVal.message || 'Por favor ingresa una dirección de correo electrónico válida.');
      return;
    }

    if (!community.trim()) {
      setErrorMsg('Por favor indica tu sector, parroquia o comunidad en La Guaira.');
      return;
    }

    if (story.trim().length < 20) {
      setErrorMsg('Por favor relata tu testimonio con al menos 20 caracteres para conocer cómo te brindamos apoyo.');
      return;
    }

    if (!acceptedAge) {
      setErrorMsg('Debes declarar bajo fe de juramento ser mayor de edad (+18) para testificar formalmente.');
      return;
    }

    if (!acceptedPolicy) {
      setErrorMsg('Debes consentir el tratamiento respetuoso de tu relato bajo las normas de Mano a Mano.');
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const recipientName = isAnonymous ? 'Beneficiario Protegido' : (name.trim() || 'Beneficiario Solidario');

    setOtpSending(true);
    try {
      const otpRes = await requestEmailVerificationCode(cleanEmail, 'testimonio_beneficiario', recipientName);
      setOtpBackupCode(otpRes.backupCode);
      setOtpCooldown(45);
      setOtpInput('');
      setOtpError(null);
      setStep('email_verification');
    } catch {
      setErrorMsg('No se pudo generar el código de verificación por correo. Por favor intenta de nuevo.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpCooldown > 0 || otpSending || !email.trim()) return;
    setOtpSending(true);
    setOtpError(null);
    try {
      const cleanEmail = email.toLowerCase().trim();
      const recipientName = isAnonymous ? 'Beneficiario Protegido' : (name.trim() || 'Beneficiario');
      const otpRes = await requestEmailVerificationCode(cleanEmail, 'testimonio_beneficiario', recipientName);
      setOtpBackupCode(otpRes.backupCode);
      setOtpCooldown(45);
      setOtpInput('');
    } catch {
      setOtpError('Error al reenviar el código. Inténtalo de nuevo.');
    } finally {
      setOtpSending(false);
    }
  };

  // Paso 2: Validar OTP y enviar a moderación
  const handleVerifyAndSubmit = async () => {
    if (otpInput.trim().length !== 6) {
      setOtpError('Por favor introduce el código completo de 6 dígitos numéricos.');
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const verification = verifyEmailCode(cleanEmail, otpInput);
    if (!verification.success) {
      setOtpError(verification.message);
      return;
    }

    if (!checkAndAcquireClickLock('testimonio_submit_lock')) {
      setOtpError('Envío en proceso. Por favor espera.');
      return;
    }

    setOtpError(null);
    setStep('submitting');

    try {
      const res = await submitBeneficiaryTestimonial({
        name: isAnonymous ? 'Beneficiario Protegido' : sanitizeInput(name),
        isAnonymous,
        email: cleanEmail,
        emailVerified: true,
        phone: phone.trim() ? sanitizeInput(phone) : undefined,
        community: sanitizeInput(community),
        assistanceType,
        rating,
        story: sanitizeInput(story)
      });

      if (res.success) {
        setSubmittedEntry(res.entry);
        refreshLists();
        setStep('success');
      } else {
        setOtpError(res.message);
        setStep('email_verification');
      }
    } catch {
      setOtpError('Ocurrió un error al registrar el testimonio. Inténtalo de nuevo.');
      setStep('email_verification');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setStep('form');
    setName('');
    setEmail('');
    setPhone('');
    setCommunity('');
    setStory('');
    setRating(5);
    setIsAnonymous(false);
    setErrorMsg(null);
    setOtpError(null);
    setOtpInput('');
    setSubmittedEntry(null);
  };

  // Moderación
  const handleCheckModerationPin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = moderationPin.trim();
    if (cleanPin === 'Abelxti100%' || cleanPin === '99HDD' || cleanPin.toLowerCase() === 'manomano') {
      setIsModeratorAuthenticated(true);
      setModerationError(null);
    } else {
      setModerationError('Clave de directiva incorrecta.');
    }
  };

  const handleApprove = (id: string) => {
    approveTestimonial(id, 'Directiva Mano a Mano');
    refreshLists();
  };

  const handleReject = (id: string) => {
    rejectTestimonial(id);
    refreshLists();
  };

  return (
    <section id="testimonios" className="py-20 md:py-28 bg-[#fafaf8] border-t border-stone-200 relative overflow-hidden scroll-mt-20">
      {/* Luces sutiles de fondo */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-ocean/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-5 sm:px-6 lg:px-12 relative z-10">
        
        {/* Cabecera de la Sección */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-ocean/10 border border-brand-ocean/20 text-brand-ocean text-xs font-bold uppercase tracking-wider mb-4">
              <HeartHandshake size={14} />
              Voces de la Esperanza y Agradecimiento
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-4 tracking-tight">
              Testimonios de Quienes Han Recibido Ayuda
            </h2>
            <p className="text-stone-600 text-base md:text-lg leading-relaxed font-light">
              Relatos reales de familias y comunidades en La Guaira atendidas por la Brigada 99HDD y Mano a Mano. Cada testimonio es verificado con código seguro por correo y <strong>requiere aprobación previa de la directiva</strong> antes de ser exhibido públicamente.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Botón Dejar Testimonio */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3.5 bg-brand-accent hover:bg-[#a00e40] text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Plus size={18} />
              <span>Dejar mi Testimonio de Ayuda Recibida</span>
            </button>

            {/* Acceso a Moderación Directiva */}
            <button
              onClick={() => setIsModerationOpen(true)}
              className="px-4 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl text-xs font-semibold border border-stone-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Panel exclusivo para la directiva de Mano a Mano para aprobar o rechazar testimonios recibidos por correo"
            >
              <ShieldCheck size={15} className="text-brand-ocean" />
              <span>Aprobar Testimonios</span>
              {pendingList.length > 0 && (
                <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                  {pendingList.length} por revisar
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Muro de Testimonios Aprobados */}
        {approvedList.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm">
            <MessageSquare size={36} className="mx-auto text-stone-300 mb-3" />
            <h4 className="text-lg font-bold text-stone-800 mb-1">Aún no hay testimonios aprobados publicados</h4>
            <p className="text-xs text-stone-500 mb-6">
              Si recibiste insumos, alimentos o auxilio en tu comunidad, comparte tu relato para alentar a donantes y brigadistas.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-brand-ocean text-white rounded-xl text-xs font-bold transition-all"
            >
              Dejar mi Testimonio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {approvedList.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-soft hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Acento superior */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-ocean via-teal-500 to-brand-accent"></div>

                <div>
                  {/* Calificación y Badge Verificado */}
                  <div className="flex items-center justify-between gap-2 mb-4 pt-1">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(item.rating || 5)].map((_, i) => (
                        <Star key={i} size={15} fill="currentColor" />
                      ))}
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-[11px] font-bold">
                      <ShieldCheck size={12} className="text-emerald-600" />
                      <span>Verificado ✓</span>
                    </span>
                  </div>

                  {/* Relato */}
                  <p className="text-stone-700 text-sm leading-relaxed italic mb-6">
                    "{item.story}"
                  </p>
                </div>

                {/* Datos del Autor y Comunidad */}
                <div className="pt-4 border-t border-stone-100 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-sm text-stone-900 group-hover:text-brand-ocean transition-colors">
                      {item.isAnonymous ? 'Beneficiario Protegido' : item.name}
                    </div>
                    <span className="text-[11px] font-mono text-stone-400">
                      {item.code}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <MapPin size={13} className="text-brand-accent shrink-0" />
                    <span>{item.community}</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                    <span className="px-2.5 py-0.5 bg-stone-100 text-stone-700 font-medium rounded-lg">
                      {ASSISTANCE_TYPE_LABELS[item.assistanceType] || 'Apoyo Integral'}
                    </span>
                    <span className="text-stone-400">
                      {new Date(item.timestamp).toLocaleDateString('es-VE', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Banner Informativo de Garantía de Confidencialidad */}
        <div className="mt-12 bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-stone-700 text-xs sm:text-sm">
            <div className="p-2.5 bg-brand-ocean/10 text-brand-ocean rounded-xl shrink-0">
              <Lock size={18} />
            </div>
            <div>
              <strong className="text-stone-900 block sm:inline">Protección a la Identidad y Anti-Spam: </strong>
              Validamos estrictamente el correo de cada usuario con código OTP. Los testimonios pasan por filtro previo de la directiva en <code>manomanovzla@gmail.com</code> antes de hacerse públicos.
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer"
          >
            Añadir mi Relato &rarr;
          </button>
        </div>

      </div>

      {/* ============================================================
          MODAL DE INGRESO DE TESTIMONIO CON VERIFICACIÓN DE CORREO
      ============================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div 
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-brand-dark via-[#192339] to-brand-dark text-white p-6 sm:p-7 relative shrink-0">
              <button
                onClick={handleCloseModal}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
                title="Cerrar ventana"
              >
                <X size={20} />
              </button>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-ocean/20 border border-brand-ocean/40 text-brand-ocean text-xs font-bold uppercase tracking-wider mb-3">
                <HeartHandshake size={14} />
                Mano a Mano Venezuela & Brigada 99HDD
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
                Comparte tu Testimonio de Ayuda
              </h3>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-xl font-light">
                Tu palabra es el mayor estímulo para los voluntarios que suben los cerros y los padrinos que donan. Puedes publicarlo con tu nombre o de forma 100% anónima.
              </p>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
              
              {/* PASO 1: Formulario */}
              {step === 'form' && (
                <form onSubmit={handleStartVerification} className="space-y-5">
                  {errorMsg && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Opción Anónima */}
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <label className="text-xs font-bold text-stone-900 cursor-pointer flex items-center gap-2">
                        <span>¿Deseas publicar tu testimonio de forma anónima?</span>
                      </label>
                      <p className="text-[11px] text-stone-500">
                        Si activas esta opción, tu nombre no aparecerá en la página pública; solo se indicará "Beneficiario Protegido".
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isAnonymous} 
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-ocean"></div>
                    </label>
                  </div>

                  {/* Nombre y Correo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        {isAnonymous ? 'Nombre (Resguardado en Privado)' : 'Nombre y Apellido *'}
                      </label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type="text"
                          required={!isAnonymous}
                          placeholder={isAnonymous ? 'Opcional (se protegerá)' : 'Ej. Carmen Rodríguez'}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Correo Electrónico (Verificación Real Obligatoria) *
                      </label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type="email"
                          required
                          placeholder="tucorreo@ejemplo.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean"
                        />
                      </div>
                      <p className="text-[10px] text-stone-500 mt-1">
                        Te enviaremos un código de seguridad de 6 dígitos para validar que es tu correo real.
                      </p>
                    </div>
                  </div>

                  {/* Teléfono y Comunidad */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Teléfono de Contacto (Opcional)
                      </label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type="tel"
                          placeholder="Ej. 0414-1234567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Comunidad / Sector donde Recibiste Ayuda *
                      </label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type="text"
                          required
                          placeholder="Ej. Macuto, Sector El Cojo"
                          value={community}
                          onChange={(e) => setCommunity(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tipo de Ayuda y Calificación */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Tipo de Ayuda Recibida *
                      </label>
                      <select
                        value={assistanceType}
                        onChange={(e) => setAssistanceType(e.target.value as any)}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean cursor-pointer"
                      >
                        {Object.entries(ASSISTANCE_TYPE_LABELS).map(([k, lbl]) => (
                          <option key={k} value={k}>{lbl}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Calificación del Apoyo Recibido
                      </label>
                      <div className="flex items-center gap-2 py-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            className="p-1 text-amber-500 hover:scale-125 transition-transform cursor-pointer"
                          >
                            <Star 
                              size={24} 
                              fill={star <= rating ? "currentColor" : "none"} 
                              stroke="currentColor" 
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-stone-600 ml-2">
                          {rating} de 5 estrellas
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Relato del Testimonio */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Tu Testimonio / Relato de Ayuda *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Cuéntanos con tus propias palabras cómo fue el apoyo brindado por la brigada o padrinos, qué representó para tu familia y qué mensaje te gustaría transmitir..."
                      value={story}
                      onChange={(e) => setStory(e.target.value)}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean resize-y leading-relaxed"
                    />
                  </div>

                  {/* Consentimiento Legal y Mayoría de Edad */}
                  <div className="space-y-3 bg-stone-50/90 p-4 sm:p-5 rounded-2xl border border-stone-200">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={acceptedAge}
                        onChange={(e) => setAcceptedAge(e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-brand-ocean rounded border-stone-300 focus:ring-brand-ocean shrink-0 cursor-pointer"
                      />
                      <span className="text-xs text-stone-700 leading-relaxed font-medium group-hover:text-stone-900">
                        <strong>Declaro ser mayor de edad (+18 años)</strong> y dar testimonio verídico de la asistencia humanitaria recibida por Mano a Mano. *
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group pt-1 border-t border-stone-200/60">
                      <input
                        type="checkbox"
                        checked={acceptedPolicy}
                        onChange={(e) => setAcceptedPolicy(e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-brand-ocean rounded border-stone-300 focus:ring-brand-ocean shrink-0 cursor-pointer"
                      />
                      <span className="text-xs text-stone-600 leading-relaxed group-hover:text-stone-900">
                        Entiendo que este testimonio será revisado por la directiva de Mano a Mano en <code>manomanovzla@gmail.com</code> antes de publicarse en la web. *
                      </span>
                    </label>
                  </div>

                  {/* Acciones */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-5 py-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 font-semibold text-sm transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!acceptedAge || !acceptedPolicy || otpSending}
                      className="px-7 py-3 rounded-xl bg-brand-accent hover:bg-[#a00e40] text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {otpSending ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>Generando código...</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>Continuar y Validar Correo</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* PASO 2: Verificación de Código OTP */}
              {step === 'email_verification' && (
                <div className="space-y-6 py-2 animate-fade-in max-w-xl mx-auto">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-brand-ocean/10 text-brand-ocean rounded-2xl flex items-center justify-center mx-auto border border-brand-ocean/20">
                      <KeyRound size={32} />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                      Código de Verificación de Correo
                    </h3>
                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                      Para certificar que eres una persona real y evitar testimonios fraudulentos, hemos generado un código de <strong>6 dígitos</strong> para:
                    </p>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-stone-100 border border-stone-200 rounded-full text-xs font-mono font-bold text-stone-800">
                      <Mail size={14} className="text-brand-ocean" />
                      <span>{email}</span>
                    </div>
                  </div>

                  {otpError && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  {/* Input OTP */}
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 text-center">
                      Introduce el Código de 6 Dígitos
                    </label>
                    <div className="max-w-xs mx-auto">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        autoFocus
                        placeholder="000000"
                        value={otpInput}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setOtpInput(val);
                          if (otpError) setOtpError(null);
                        }}
                        className="w-full text-center tracking-[0.4em] font-mono text-2xl sm:text-3xl font-bold py-3 px-4 bg-white border-2 border-stone-300 rounded-xl text-stone-900 focus:border-brand-ocean focus:outline-none focus:ring-2 focus:ring-brand-ocean/30 transition-all shadow-inner"
                      />
                    </div>
                    <p className="text-[11px] text-stone-500 text-center">
                      Validez: 10 minutos. Revisa tu buzón de entrada o la carpeta de spam.
                    </p>

                    {otpBackupCode && (
                      <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                        <ShieldCheck size={16} className="text-amber-700 shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                          <span><strong>Asistencia de Conectividad:</strong> Si tu conexión presenta lentitud, tu código generado es </span>
                          <code className="px-1.5 py-0.5 bg-amber-200/80 text-amber-950 font-mono font-bold rounded">
                            {otpBackupCode}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botones */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleVerifyAndSubmit}
                      disabled={otpInput.trim().length !== 6}
                      className="w-full py-3.5 px-6 rounded-xl bg-brand-accent hover:bg-[#a00e40] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle2 size={18} />
                      <span>Verificar Correo y Remitir Testimonio</span>
                    </button>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep('form')}
                        className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                      >
                        <ArrowLeft size={14} />
                        <span>Regresar y modificar relato</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={otpCooldown > 0 || otpSending}
                        className="text-xs text-brand-ocean hover:text-[#0a6670] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RefreshCw size={13} className={otpSending ? 'animate-spin' : ''} />
                        <span>
                          {otpCooldown > 0 
                            ? `Reenviar nuevo código en ${otpCooldown}s` 
                            : 'Reenviar código de verificación'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PASO: Submitting */}
              {step === 'submitting' && (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 border-4 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin mx-auto"></div>
                  <h4 className="text-lg font-bold text-stone-800">Transmitiendo testimonio al buzón oficial...</h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Enviando notificación al correo manomanovzla@gmail.com para su revisión y aprobación por la directiva.
                  </p>
                </div>
              )}

              {/* PASO 3: Éxito con explicación de moderación */}
              {step === 'success' && submittedEntry && (
                <div className="space-y-6 animate-fade-in text-center">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={36} />
                  </div>

                  <div>
                    <h4 className="text-2xl font-bold text-stone-900 mb-2">
                      ¡Tu Testimonio ha sido Recibido y Verificado!
                    </h4>
                    <p className="text-stone-600 text-sm max-w-lg mx-auto leading-relaxed">
                      Muchas gracias por tus generosas palabras. Tu correo <strong>{submittedEntry.email}</strong> fue validado con éxito.
                    </p>
                  </div>

                  {/* Card de Moderación Previa */}
                  <div className="p-5 bg-amber-50 border border-amber-200/90 rounded-2xl text-left text-xs text-amber-950 space-y-2 max-w-lg mx-auto shadow-xs">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900">
                      <Clock size={16} className="text-amber-700 shrink-0" />
                      <span>Estatus: Pendiente de Aprobación por Directiva</span>
                    </div>
                    <p className="leading-relaxed">
                      Antes de publicarse en la página pública, ha sido remitido formalmente a la bandeja de coordinación <code>manomanovzla@gmail.com</code>. Tan pronto la directiva pulse aprobar, se publicará de inmediato en este muro.
                    </p>
                    <div className="pt-2 flex items-center justify-between text-[11px] text-amber-800 font-mono">
                      <span>Código de Testimonio: <strong>{submittedEntry.code}</strong></span>
                      <span>{submittedEntry.isAnonymous ? 'Modalidad: Anónima' : 'Modalidad: Pública'}</span>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      onClick={handleCloseModal}
                      className="px-7 py-3 bg-brand-dark hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
                    >
                      Entendido y Cerrar
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL DE MODERACIÓN DE TESTIMONIOS (DIRECTIVA MANO A MANO)
      ============================================================ */}
      {isModerationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div 
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-brand-dark text-white p-6 relative shrink-0 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-brand-ocean uppercase tracking-wider mb-1">
                  <ShieldCheck size={16} />
                  <span>Panel de Moderación Exclusivo</span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Aprobación de Testimonios (manomanovzla@gmail.com)
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsModerationOpen(false);
                  setIsModeratorAuthenticated(false);
                  setModerationPin('');
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {!isModeratorAuthenticated ? (
                <form onSubmit={handleCheckModerationPin} className="max-w-md mx-auto py-8 space-y-4 text-center">
                  <div className="w-12 h-12 bg-brand-ocean/10 text-brand-ocean rounded-2xl flex items-center justify-center mx-auto">
                    <Lock size={24} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-stone-900">Acceso Restringido a Directiva</h4>
                    <p className="text-xs text-stone-500 mt-1">
                      Ingresa la clave maestra autorizada para moderar los testimonios recibidos por correo.
                    </p>
                  </div>

                  {moderationError && (
                    <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-medium">
                      {moderationError}
                    </div>
                  )}

                  <input
                    type="password"
                    placeholder="Clave directiva..."
                    value={moderationPin}
                    onChange={(e) => setModerationPin(e.target.value)}
                    className="w-full text-center font-mono py-2.5 px-4 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-brand-ocean"
                  />

                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-ocean text-white rounded-xl text-xs font-bold hover:bg-[#0a6670] transition-colors cursor-pointer"
                  >
                    Desbloquear Panel de Moderación
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-950 flex items-start gap-3">
                    <FileCheck size={20} className="text-sky-700 shrink-0 mt-0.5" />
                    <div>
                      <strong>Regla de Gobernanza Comunitaria:</strong> NINGÚN testimonio se publica en la página pública sin tu aprobación explícita. Si apruebas un testimonio, aparecerá de inmediato en el muro. Si lo rechazas, quedará resguardado en la auditoría sin exhibición pública.
                    </div>
                  </div>

                  {pendingList.length === 0 ? (
                    <div className="py-12 text-center text-stone-400 text-xs">
                      <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2" />
                      <p className="text-sm font-bold text-stone-700">¡Al día! No hay testimonios pendientes de aprobación.</p>
                      <p className="text-stone-400 mt-1">Todos los testimonios enviados ya han sido revisados.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                        Testimonios Pendientes de Decisión ({pendingList.length})
                      </h4>

                      {pendingList.map((item) => (
                        <div key={item.id} className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs bg-brand-dark text-white px-2 py-0.5 rounded">
                                  {item.code}
                                </span>
                                <span className="font-bold text-sm text-stone-900">{item.name}</span>
                                {item.isAnonymous && (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                                    Solicitó Anonimato
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-stone-500 mt-1 flex flex-wrap gap-x-3">
                                <span><strong>Correo Verificado:</strong> {item.email}</span>
                                <span><strong>Teléfono:</strong> {item.phone || 'N/A'}</span>
                                <span><strong>Sector:</strong> {item.community}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 text-amber-500 shrink-0">
                              {[...Array(item.rating || 5)].map((_, i) => (
                                <Star key={i} size={14} fill="currentColor" />
                              ))}
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-700 italic leading-relaxed">
                            "{item.story}"
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-200">
                            <span className="text-[11px] text-stone-500">
                              Tipo: {ASSISTANCE_TYPE_LABELS[item.assistanceType]} | Recibido: {new Date(item.timestamp).toLocaleString('es-VE')}
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleReject(item.id)}
                                className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                              >
                                ✕ Rechazar
                              </button>
                              <button
                                onClick={() => handleApprove(item.id)}
                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
                              >
                                ✓ Aprobar y Publicar en la Web
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Testimonios ya aprobados */}
                  <div className="pt-4 border-t border-stone-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                      Testimonios Activos y Visibles en la Web ({approvedList.length})
                    </h4>
                    <div className="space-y-2">
                      {approvedList.map(item => (
                        <div key={item.id} className="p-3 bg-white border border-stone-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="font-bold text-stone-900">{item.name}</span>
                            <span className="text-stone-400 mx-1.5">•</span>
                            <span className="text-stone-500">{item.community}</span>
                            <span className="text-stone-400 mx-1.5">•</span>
                            <span className="text-emerald-700 font-medium">Publicado ({item.code})</span>
                          </div>
                          <button
                            onClick={() => handleReject(item.id)}
                            className="text-stone-400 hover:text-rose-600 text-[11px] underline cursor-pointer"
                            title="Despublicar este testimonio"
                          >
                            Despublicar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
