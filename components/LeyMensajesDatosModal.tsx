import React from 'react';
import { 
  X, 
  Scale, 
  ShieldCheck, 
  FileText, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  BookOpen,
  Mail,
  Printer
} from 'lucide-react';

interface LeyMensajesDatosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptAndClose?: () => void;
}

export const LeyMensajesDatosModal: React.FC<LeyMensajesDatosModalProps> = ({
  isOpen,
  onClose,
  onAcceptAndClose
}) => {
  if (!isOpen) return null;

  const handleAccept = () => {
    if (onAcceptAndClose) {
      onAcceptAndClose();
    } else {
      onClose();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-stone-950/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera Institucional */}
        <div className="bg-gradient-to-r from-brand-dark via-[#1a233a] to-brand-dark text-white p-6 sm:p-7 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Cerrar ventana de lectura legal"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-brand-accent/20 border border-brand-accent/40 text-brand-accent rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Scale size={13} />
              Marco Legal Oficial de la República Bolivariana de Venezuela
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold tracking-tight text-white mb-1.5">
            Ley sobre Mensajes de Datos y Firmas Electrónicas
          </h2>
          <p className="text-white/80 text-xs sm:text-sm font-light">
            Decreto con Fuerza de Ley N° 1.204 • Gaceta Oficial N° 37.076 del 13 de diciembre de 2000
          </p>
          <div className="text-[11px] text-teal-300 font-mono mt-1">
            Mano a Mano Venezuela & Brigada 99HDD • Política de Consentimiento Previo Informado
          </div>
        </div>

        {/* Cuerpo del Documento Legal para Lectura Previa Obligatoria */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-stone-800 text-xs sm:text-sm leading-relaxed space-y-6">
          
          {/* Banner de Aviso de Lectura Previa */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/90 flex items-start gap-3">
            <BookOpen className="text-amber-700 shrink-0 mt-0.5" size={20} />
            <div className="text-xs text-amber-950 leading-relaxed">
              <strong>Lectura Previa Obligatoria antes de Otorgar su Consentimiento:</strong> Conforme al principio de transparencia y buena fe, ponemos a su disposición el contenido y alcance de la normativa que ampara sus datos personales, la Cédula de Identidad suministrada y su relato de asistencia comunitaria.
            </div>
          </div>

          {/* Cláusula 1: Validez y Eficacia Probatoria */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-ocean/15 text-brand-ocean font-mono text-xs flex items-center justify-center font-bold shrink-0">1</span>
              <span>Eficacia y Validez Probatoria de los Mensajes de Datos (Art. 4)</span>
            </h4>
            <div className="pl-8 text-stone-700 text-xs sm:text-sm space-y-1.5">
              <p>
                Los mensajes de datos, formularios y solicitudes transmitidos electrónicamente a través de esta plataforma tendrán la misma eficacia, fuerza probatoria y validez jurídica que la ley otorga a los documentos escritos en papel.
              </p>
              <p className="text-stone-500 text-xs italic">
                "Los Mensajes de Datos tendrán la misma eficacia probatoria que la ley otorga a los documentos escritos, sin perjuicio de lo establecido en la primera parte del artículo 1.357 del Código Civil..." (Art. 4).
              </p>
            </div>
          </div>

          {/* Cláusula 2: Consentimiento Expreso y Finalidad Humanitaria */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-ocean/15 text-brand-ocean font-mono text-xs flex items-center justify-center font-bold shrink-0">2</span>
              <span>Finalidad Exclusiva: Asistencia Humanitaria y Verificación en Terreno</span>
            </h4>
            <div className="pl-8 text-stone-700 text-xs sm:text-sm space-y-1.5">
              <p>
                Al suministrar su nombre, <strong>Cédula de Identidad</strong>, teléfono, dirección y relato de vulnerabilidad, usted autoriza de manera libre, previa, expresa e informada a la directiva de <strong>Mano a Mano Venezuela</strong> y a los brigadistas de la <strong>Brigada 99HDD</strong> a tratar sus datos exclusivamente para los siguientes propósitos:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-stone-600 pl-1">
                <li>Verificación presencial de daños estructurales, insumos médicos o necesidades alimentarias en los albergues y comunidades del estado La Guaira.</li>
                <li>Generación del código oficial de expediente y emisión de credenciales de brigadistas.</li>
                <li>Canalización directa de donaciones de medicamentos, techos de zinc, alimentos y apoyo solidario sin fines políticos ni comerciales.</li>
                <li>Auditoría interna y conciliación bajo la custodia de la cuenta oficial <code>manomanovzla@gmail.com</code>.</li>
              </ul>
            </div>
          </div>

          {/* Cláusula 3: Secreto, Confidencialidad y Prohibición de Traspaso */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-ocean/15 text-brand-ocean font-mono text-xs flex items-center justify-center font-bold shrink-0">3</span>
              <span>Confidencialidad Absoluta y No Divulgación (Art. 7 de la Ley y Art. 28 de la CRBV)</span>
            </h4>
            <div className="pl-8 text-stone-700 text-xs sm:text-sm space-y-1.5">
              <p>
                Mano a Mano Venezuela <strong>NUNCA</strong> venderá, cederá, arrendará ni comercializará su información personal, Cédula de Identidad o datos familiares a empresas de publicidad, agencias de cobranza o terceros no autorizados.
              </p>
              <p>
                Conforme al Artículo 28 de la Constitución de la República Bolivariana de Venezuela (Habeas Data) y la Ley Especial contra los Delitos Informáticos, sus registros están protegidos contra accesos no autorizados mediante controles de seguridad digital.
              </p>
            </div>
          </div>

          {/* Cláusula 4: Protección de Menores y Resguardo de la Dignidad */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-ocean/15 text-brand-ocean font-mono text-xs flex items-center justify-center font-bold shrink-0">4</span>
              <span>Protección Reforzada de Familias y Menores de Edad</span>
            </h4>
            <div className="pl-8 text-stone-700 text-xs sm:text-sm space-y-1.5">
              <p>
                Los expedientes de personas vulnerables, menores de edad y adultos mayores se conservan bajo reserva. Si usted opta por registrar su caso o testimonio de forma <strong>anónima</strong>, su nombre y cédula permanecerán estrictamente resguardados en privado ante la coordinación, mostrándose públicamente únicamente su comunidad y su historia para proteger su dignidad.
              </p>
            </div>
          </div>

          {/* Cláusula 5: Derechos ARCO */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-ocean/15 text-brand-ocean font-mono text-xs flex items-center justify-center font-bold shrink-0">5</span>
              <span>Ejercicio de Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)</span>
            </h4>
            <div className="pl-8 text-stone-700 text-xs sm:text-sm space-y-1.5">
              <p>
                Usted puede en cualquier momento solicitar una copia de los datos archivados en su expediente, corregir cualquier dato desactualizado o solicitar la desincorporación y eliminación de sus registros enviando una comunicación al canal oficial de derechos ARCO:
              </p>
              <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 font-mono text-xs font-bold text-brand-dark inline-block">
                manomanovzla@gmail.com
              </div>
            </div>
          </div>

          {/* Cláusula 6: Declaración de Mayoría de Edad y Fe de Juramento */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-ocean/15 text-brand-ocean font-mono text-xs flex items-center justify-center font-bold shrink-0">6</span>
              <span>Declaración bajo Fe de Juramento y Responsabilidad del Declarante</span>
            </h4>
            <div className="pl-8 text-stone-700 text-xs sm:text-sm space-y-1.5">
              <p>
                Al marcar la casilla correspondiente en los formularios, el remitente declara bajo fe de juramento ser mayor de edad (+18 años) conforme al Código Civil venezolano, ser titular legítimo del documento de identidad aportado y que los hechos narrados corresponden fidedignamente a la realidad.
              </p>
            </div>
          </div>

        </div>

        {/* Pie de Acción del Modal */}
        <div className="p-4 sm:p-6 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-stone-500 text-xs">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 font-medium transition-colors cursor-pointer"
            >
              <Printer size={14} />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <span className="text-stone-300">•</span>
            <span>G.O. 37.076</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cerrar Lectura
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-brand-ocean hover:bg-[#0a6670] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 size={15} />
              <span>✓ He Leído y Comprendido el Texto Legal</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
