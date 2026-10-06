import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Scale, 
  Lock, 
  Cookie, 
  HelpCircle, 
  Building2, 
  Printer, 
  CheckCircle2, 
  Mail, 
  ExternalLink,
  AlertCircle
} from 'lucide-react';

export type LegalTabType = 'terminos' | 'privacidad' | 'cookies' | 'garantia' | 'sede';

interface LegalDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTabType;
}

export const LegalDocumentsModal: React.FC<LegalDocumentsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terminos'
}) => {
  const [activeTab, setActiveTab] = useState<LegalTabType>(initialTab);

  // Sincronizar si cambia initialTab
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-brand-dark via-[#1a233a] to-brand-dark text-white p-6 sm:p-7 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Cerrar modal de gobernanza legal"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-brand-accent/20 border border-brand-accent/40 text-brand-accent rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Scale size={13} />
              Marco Legal y Regulatorio Venezolano
            </span>
            <span className="px-2.5 py-0.5 bg-white/10 text-white/80 rounded-full text-[11px] font-medium hidden sm:inline-block">
              SENIAT • BCV • Privacidad ARCO
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">
            Gobernanza Legal y Normativas Oficiales
          </h2>
          <p className="text-white/80 text-xs sm:text-sm font-light">
            Mano a Mano Venezuela & Brigada 99HDD — Conforme a la legislación de la República Bolivariana de Venezuela.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-stone-100 border-b border-stone-200 px-4 sm:px-6 pt-3 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('terminos')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'terminos'
                ? 'border-brand-accent text-brand-dark bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-t-xl'
            }`}
          >
            <FileText size={15} className={activeTab === 'terminos' ? 'text-brand-accent' : 'text-stone-400'} />
            <span>Términos y Condiciones</span>
          </button>

          <button
            onClick={() => setActiveTab('privacidad')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'privacidad'
                ? 'border-brand-accent text-brand-dark bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-t-xl'
            }`}
          >
            <Lock size={15} className={activeTab === 'privacidad' ? 'text-brand-accent' : 'text-stone-400'} />
            <span>Privacidad & ARCO</span>
          </button>

          <button
            onClick={() => setActiveTab('cookies')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'cookies'
                ? 'border-brand-accent text-brand-dark bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-t-xl'
            }`}
          >
            <Cookie size={15} className={activeTab === 'cookies' ? 'text-brand-accent' : 'text-stone-400'} />
            <span>Cookies Técnicas</span>
          </button>

          <button
            onClick={() => setActiveTab('garantia')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'garantia'
                ? 'border-brand-accent text-brand-dark bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-t-xl'
            }`}
          >
            <ShieldCheck size={15} className={activeTab === 'garantia' ? 'text-brand-accent' : 'text-stone-400'} />
            <span>Garantías & Devoluciones</span>
          </button>

          <button
            onClick={() => setActiveTab('sede')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'sede'
                ? 'border-brand-accent text-brand-dark bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-t-xl'
            }`}
          >
            <Building2 size={15} className={activeTab === 'sede' ? 'text-brand-accent' : 'text-stone-400'} />
            <span>Sede Fiscal & Desuscripción</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-stone-800 text-sm leading-relaxed space-y-6">
          
          {/* TAB 1: TÉRMINOS Y CONDICIONES GENERALES */}
          {activeTab === 'terminos' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-stone-200 pb-4">
                <span className="text-xs font-mono font-bold text-brand-ocean uppercase tracking-wider block mb-1">
                  Documento Legal Nro. MMV-TC-2026
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-stone-900">
                  Términos y Condiciones Generales de Operatividad Comercial
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Última actualización: Septiembre de 2026 • Vigencia en todo el territorio de la República Bolivariana de Venezuela.
                </p>
              </div>

              {/* Cláusula 1: Ámbito */}
              <div className="space-y-2">
                <h4 className="font-bold text-stone-900 text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-ocean/15 text-brand-ocean font-mono text-xs flex items-center justify-center font-bold">1</span>
                  Ámbito de Aplicación y Objeto de la Plataforma
                </h4>
                <p className="text-stone-700 text-xs sm:text-sm pl-8">
                  La plataforma digital <strong>"Mano a Mano Venezuela"</strong> y el cuerpo operativo de la <strong>Brigada 99HDD</strong> operan como un ecosistema cívico-social y comercial articulado para la recepción de donaciones, intermediación de insumos médicos y humanitarios, y articulación comunitaria en el Estado La Guaira y Distrito Capital. Toda persona natural o jurídica que interactúe, se registre, apadrine o gestione aportes consiente en someterse a las presentes disposiciones contractuales vinculantes.
                </p>
              </div>

              {/* Cláusula 2: SENIAT y Tasa Oficial BCV */}
              <div className="space-y-2 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <h4 className="font-bold text-stone-900 text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-ocean/15 text-brand-ocean font-mono text-xs flex items-center justify-center font-bold">2</span>
                  Facturación Fiscal y Liquidación a Tasa Oficial del Banco Central de Venezuela (BCV)
                </h4>
                <div className="text-stone-700 text-xs sm:text-sm pl-8 space-y-2">
                  <p>
                    Conforme al ordenamiento cambiario y tributario venezolano, todas las valoraciones, presupuestos o contraprestaciones expresadas referencialmente en divisas extranjeras (USD) se liquidan y facturan estrictamente a la <strong>Tasa Oficial del Banco Central de Venezuela (BCV)</strong> publicada al cierre del día hábil bancario anterior a la fecha efectiva de pago o conciliación.
                  </p>
                  <p>
                    Se da estricto cumplimiento a las providencias administrativas emitidas por el <strong>SENIAT (Servicio Nacional Integrado de Administración Aduanera y Tributaria)</strong> en materia de facturación, emisión de comprobantes digitales, retenciones de Impuesto al Valor Agregado (IVA) aplicables a Contribuyentes Especiales y recaudación del Impuesto a las Grandes Transacciones Financieras (IGTF) cuando corresponda según la ley.
                  </p>
                </div>
              </div>

              {/* Cláusula 3: Entrega, flete y retiros */}
              <div className="space-y-2">
                <h4 className="font-bold text-stone-900 text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-ocean/15 text-brand-ocean font-mono text-xs flex items-center justify-center font-bold">3</span>
                  Condiciones de Entrega, Flete, Depósitos y Conciliación Bancaria
                </h4>
                <p className="text-stone-700 text-xs sm:text-sm pl-8">
                  La entrega de insumos se canaliza a través de nuestros 5 centros de acopio autorizados (3 en Caracas y 2 en La Guaira). Los despachos a zonas de difícil acceso son coordinados exclusivamente por las unidades tácticas de la Brigada 99HDD. En transferencias vía Pago Móvil, transferencias bancarias nacionales o pagos internacionales, toda orden o aporte quedará en estado <em>"Pendiente de Conciliación"</em> hasta la verificación contable del soporte bancario dentro de un lapso no mayor a 24 horas hábiles.
                </p>
              </div>

              {/* Cláusula 4: Capacidad y veracidad */}
              <div className="space-y-2">
                <h4 className="font-bold text-stone-900 text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-ocean/15 text-brand-ocean font-mono text-xs flex items-center justify-center font-bold">4</span>
                  Capacidad Jurídica y Responsabilidad de las Declaraciones
                </h4>
                <p className="text-stone-700 text-xs sm:text-sm pl-8">
                  El usuario garantiza bajo fe de juramento la veracidad, exactitud y autenticidad de los datos suministrados en los formularios de registro (RIF, cédula, dirección y teléfono). Toda tentativa de suplantación de identidad, uso de documentos falsos o inyección de información maliciosa activará el bloqueo preventivo del sistema y la remisión de los registros a las autoridades competentes.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACIDAD Y DERECHOS ARCO */}
          {activeTab === 'privacidad' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-stone-200 pb-4">
                <span className="text-xs font-mono font-bold text-brand-ocean uppercase tracking-wider block mb-1">
                  Política de Privacidad y Resguardo Digital
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-stone-900">
                  Protección de Datos Personales y Ejercicio de Derechos ARCO
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Amparo bajo la Ley sobre Mensajes de Datos y Firmas Electrónicas de la República Bolivariana de Venezuela.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/90 flex items-start gap-3">
                <ShieldCheck className="text-emerald-700 shrink-0 mt-0.5" size={20} />
                <div className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                  <strong>Compromiso de Confidencialidad Estricta:</strong> Mano a Mano Venezuela <strong>NUNCA</strong> vende, cede, arrienda ni transfiere datos personales o comerciales a redes publicitarias, intermediarios no autorizados ni empresas de telemarketing.
                </div>
              </div>

              {/* Marco Legal Nacional e Internacional */}
              <div className="space-y-3">
                <h4 className="font-bold text-stone-900 text-base">
                  1. Marco Regulatorio Aplicable (Venezuela e Internacional)
                </h4>
                <p className="text-stone-700 text-xs sm:text-sm">
                  El tratamiento de datos dentro de nuestra infraestructura tecnológica se rige por:
                </p>
                <div className="space-y-2 text-xs text-stone-700">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <strong className="text-stone-900 block mb-0.5">🇻🇪 Marco Nacional Venezolano:</strong>
                    Constitución de la República Bolivariana de Venezuela (Artículo 28, Habeas Data); <strong>Ley sobre Mensajes de Datos y Firmas Electrónicas</strong> (G.O. N° 37.076); <strong>Ley Especial contra los Delitos Informáticos</strong> (G.O. N° 37.313) sobre protección de sistemas y confidencialidad; y <strong>Ley de Infogobierno</strong>.
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <strong className="text-stone-900 block mb-0.5">🌐 Estándares Internacionales:</strong>
                    Principios de <em>Privacidad por Diseño</em> (Privacy by Design), Principios de Minimización de Datos del Reglamento General de Protección de Datos (RGPD/GDPR Arts. 5, 6 y 17 - Derecho al Olvido), y directrices de seguridad de aplicaciones web <strong>OWASP Top 10</strong> (prevención de inyecciones, XSS, autenticación rota y almacenamiento seguro de credenciales con SHA-256).
                  </div>
                </div>
              </div>

              {/* Derechos ARCO */}
              <div className="space-y-3">
                <h4 className="font-bold text-stone-900 text-base">
                  2. Ejercicio de los Derechos ARCO
                </h4>
                <p className="text-stone-700 text-xs sm:text-sm">
                  Cualquier ciudadano, padrino o titular de datos registrados tiene garantizado el ejercicio gratuito de los derechos fundamentales ARCO:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                    <span className="font-bold text-brand-dark block mb-1">🔍 Acceso (A):</span>
                    Derecho a conocer qué datos personales constan en el expediente de la brigada y para qué fines específicos han sido tratados.
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                    <span className="font-bold text-brand-dark block mb-1">✏️ Rectificación (R):</span>
                    Derecho a corregir errores, actualizar números telefónicos, direcciones o modificar la razón social registrada.
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                    <span className="font-bold text-brand-dark block mb-1">🗑️ Cancelación (C):</span>
                    Derecho a solicitar la baja y supresión definitiva de los datos de contacto una vez culminada la atención comunitaria.
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                    <span className="font-bold text-brand-dark block mb-1">⛔ Oposición (O):</span>
                    Derecho a oponerse al envío de avisos informativos o actualizaciones comunitarias de la brigada.
                  </div>
                </div>
              </div>

              {/* Canal de Contacto ARCO */}
              <div className="p-4 bg-brand-ocean/5 rounded-2xl border border-brand-ocean/20 text-xs sm:text-sm space-y-2">
                <div className="font-bold text-brand-ocean flex items-center gap-1.5">
                  <Mail size={16} />
                  <span>Canal Oficial para Solicitudes ARCO:</span>
                </div>
                <p className="text-stone-700">
                  Para ejercer cualquiera de estos derechos, remita una comunicación formal con copia de su documento de identidad fiscal a:
                </p>
                <div className="font-mono font-bold text-brand-dark bg-white p-2.5 rounded-xl border border-brand-ocean/20 inline-block">
                  manomanovzla@gmail.com
                </div>
                <p className="text-stone-500 text-xs">
                  Tiempo máximo de respuesta y procesamiento técnico: <strong>48 horas hábiles</strong>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: COOKIES TÉCNICAS */}
          {activeTab === 'cookies' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-stone-200 pb-4">
                <span className="text-xs font-mono font-bold text-brand-ocean uppercase tracking-wider block mb-1">
                  Política Técnica y Almacenamiento Local
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-stone-900">
                  Política de Cookies No Invasiva (Cero Rastreo Publicitario)
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Transparencia técnica total sobre el uso de almacenamiento del navegador (localStorage y sessionStorage).
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-stone-900 text-base">
                  1. Finalidad Exclusivamente Técnica
                </h4>
                <p className="text-stone-700 text-xs sm:text-sm">
                  Esta plataforma web no utiliza cookies de terceros para elaborar perfiles de consumo, ni integra píxeles invasivos de seguimiento comercial de Facebook, Google AdSense o redes publicitarias externas. Solo utilizamos cookies técnicas y almacenamiento local estrictamente necesarios:
                </p>
                <div className="space-y-2.5 pt-2">
                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-900 text-xs sm:text-sm block">Cookies Técnicas de Sesión Segura</span>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Mantienen la autenticación del usuario abierta durante <strong>2 horas de inactividad</strong> máxima, destruyéndose automáticamente una vez vencido el plazo o al cerrar sesión.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-900 text-xs sm:text-sm block">Persistencia de Borradores y Formularios</span>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Almacena temporalmente en su navegador el progreso de su orden de donación o pre-registro para evitar pérdidas de información en caso de fluctuaciones de conectividad eléctrica o de internet.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-900 text-xs sm:text-sm block">Tokens de Idempotencia Anti-Doble Clic</span>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Protegen contra cargos duplicados o envíos accidentales repetidos por conexiones lentas (bloqueo en memoria de 4 segundos).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-stone-900 text-base">
                  2. Control y Eliminación por el Usuario
                </h4>
                <p className="text-stone-700 text-xs sm:text-sm">
                  Usted puede revocar o vaciar estas cookies en cualquier momento limpiando los datos de navegación de su navegador web (Chrome, Firefox, Safari o Edge) o haciendo clic en "Cerrar Sesión" en el panel de usuario seguro.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: GARANTÍAS Y DEVOLUCIONES */}
          {activeTab === 'garantia' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-stone-200 pb-4">
                <span className="text-xs font-mono font-bold text-brand-ocean uppercase tracking-wider block mb-1">
                  Normativa de Transparencia y Entrega
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-stone-900">
                  Política de Garantía, Aportes y Devoluciones
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Mecanismos de mediación comercial, revisión de insumos y conciliación de aportes.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-stone-900 text-base">
                  1. Plazos para Notificación y Reclamo de Insumos
                </h4>
                <p className="text-stone-700 text-xs sm:text-sm">
                  En el caso de donaciones corporativas de insumos materiales (herramientas, materiales de construcción, equipamiento médico o repuestos mecánicos para vehículos 4x4 de la brigada), el plazo oficial para reportar discrepancias, defectos de fábrica o discordancias respecto al inventario acordado es de <strong>48 a 72 horas continuas</strong> posteriores a la firma del acta de recepción en depósito.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-stone-900 text-base">
                  2. Aportes Financieros y Errores de Transferencia
                </h4>
                <p className="text-stone-700 text-xs sm:text-sm">
                  Si un aportante comete un error en el monto transferido vía Pago Móvil o transferencia bancaria nacional, podrá solicitar la restitución del excedente dentro de las <strong>48 horas hábiles</strong> siguientes al envío del comprobante, adjuntando la constancia emitida por su entidad bancaria para la debida conciliación con el banco emisor y receptor.
                </p>
              </div>

              <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <h4 className="font-bold text-stone-900 text-base">
                  3. Canales Formales de Mediación Comercial
                </h4>
                <p className="text-stone-700 text-xs sm:text-sm">
                  Cualquier eventual controversia será resuelta de buena fe mediante el canal de mediación directa a través de nuestro equipo administrativo:
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-stone-200 flex-1">
                    <span className="font-bold text-stone-800 block mb-0.5">Correo de Mediación:</span>
                    <span className="font-mono text-brand-ocean">manomanovzla@gmail.com</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-stone-200 flex-1">
                    <span className="font-bold text-stone-800 block mb-0.5">Atención Telefónica Oficial:</span>
                    <span className="font-mono text-stone-700">+58 412-321-9900</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SEDE FISCAL Y DESUSCRIPCIÓN */}
          {activeTab === 'sede' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-stone-200 pb-4">
                <span className="text-xs font-mono font-bold text-brand-ocean uppercase tracking-wider block mb-1">
                  Transparencia Institucional y Cumplimiento Anti-Spam
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-stone-900">
                  Sede Fiscal Oficial y Cláusula de Desuscripción
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Identificación jurídica y mecanismos de revocación conforme a normativas de correo comercial ético.
                </p>
              </div>

              {/* Ficha Institucional Visible */}
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-4">
                <h4 className="font-bold text-stone-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Building2 size={16} className="text-brand-ocean" />
                  Identificación del Responsable y Sede en Venezuela
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-stone-500 block">Razón Social Institucional:</span>
                    <span className="font-bold text-stone-800 text-sm">Brigada 99HDD & Mano a Mano Venezuela</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Registro de Información Fiscal (RIF):</span>
                    <span className="font-mono font-bold text-stone-900 text-sm bg-white px-2 py-0.5 rounded border border-stone-300 inline-block">
                      J-50392817-4
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Depósito / Base Operativa Principal:</span>
                    <span className="font-medium text-stone-800">
                      Sector Los Corales, Parroquia Caraballeda, Estado La Guaira, Venezuela.
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Oficina de Coordinación Caracas:</span>
                    <span className="font-medium text-stone-800">
                      Urbanización Los Palos Grandes, Municipio Chacao, Distrito Capital.
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Teléfono de Enlace Corporativo:</span>
                    <span className="font-mono font-bold text-stone-800">
                      (0412) 321-9900 / (0212) 285-9900
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Correo Oficial Centralizado:</span>
                    <span className="font-mono font-bold text-brand-ocean">
                      manomanovzla@gmail.com
                    </span>
                  </div>
                </div>
              </div>

              {/* Cláusula de Desuscripción Anti-Spam (Opt-Out) */}
              <div className="space-y-3">
                <h4 className="font-bold text-stone-900 text-base flex items-center gap-2">
                  <Mail size={16} className="text-brand-accent" />
                  Cláusula Obligatoria de Desuscripción (Opt-Out) Anti-Spam
                </h4>
                <div className="p-4 bg-amber-50/70 border border-amber-200/90 rounded-2xl text-xs sm:text-sm text-stone-700 space-y-2">
                  <p>
                    Todos los correos de confirmación, actualizaciones sobre la brigada y recibos digitales enviados por la plataforma cuentan con un <strong>enlace de desuscripción de un solo clic</strong> al pie del mensaje.
                  </p>
                  <p>
                    Usted puede desuscribirse en cualquier momento enviando un correo a <span className="font-mono font-bold text-stone-900">manomanovzla@gmail.com</span> con el asunto: <strong>"DESUSCRIPCIÓN [Su Correo / RIF]"</strong>. Su dirección será removida de nuestra lista de despachos informativos dentro de las 24 horas siguientes.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-stone-500 flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
            <span>Documentos redactados bajo la normativa jurídica de la República Bolivariana de Venezuela.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              type="button"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-stone-200/80 hover:bg-stone-300 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Printer size={14} />
              <span>Imprimir / Guardar PDF</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="flex-1 sm:flex-none px-5 py-2 bg-brand-dark hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Entendido y Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
