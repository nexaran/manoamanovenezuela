import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MapPin, 
  Copy, 
  CheckCircle2, 
  Play, 
  ExternalLink, 
  Menu, 
  X,
  Phone,
  Mail,
  Instagram,
  Users,
  Box,
  Truck,
  HeartHandshake,
  Landmark,
  Wallet,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  FileText,
  Building2,
  Check,
  Camera,
  Clock,
  Navigation,
  Lock,
  HardDrive
} from 'lucide-react';
import { PhotoGallery } from './components/PhotoGallery';
import { DonationModal, PAYMENT_PLATFORMS, PaymentPlatform } from './components/DonationModal';
import { DonationModalExperience } from './components/DonationModalExperience';
import { LogoModal } from './components/LogoModal';
import { loadLogoConfig, LogoConfig } from './lib/logoStorage';
import { EditModeProvider, useEditMode, isDevEnvironment } from './lib/editModeContext';
import { FloatingEditorBar } from './components/FloatingEditorBar';
import { ProjectCardLogos } from './components/ProjectCardLogos';
import { syncCurrentContentToProject } from './lib/syncService';
import { PadrinoModal } from './components/PadrinoModal';
import { PreRegistroModal } from './components/PreRegistroModal';
import { GoogleDriveSyncModal } from './components/GoogleDriveSyncModal';
import { VerifiedCase } from './lib/casesTypes';
import { MediaCard } from './components/MediaCard';
import { CentrosAcopioModal, CENTROS_ACOPIO } from './components/CentrosAcopioModal';
import { FinanciaModal } from './components/FinanciaModal';
import { DonacionInsumosSection } from './components/DonacionInsumosSection';
import { DonationsDashboardModal } from './components/DonationsDashboardModal';
import { getDonationRecords, getVerifiedDonationsTotal } from './lib/donationReportService';

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

interface BrandLogoProps {
  lightText?: boolean;
  className?: string;
  onEditLogo?: () => void;
  variant?: 'primary' | 'footer';
}

const BrandLogo: React.FC<BrandLogoProps> = ({ 
  lightText = false, 
  className = "", 
  onEditLogo,
  variant = 'primary' 
}) => {
  const { isEditMode } = useEditMode();
  const [logoConfig, setLogoConfig] = useState<LogoConfig>({
    primaryUrl: null,
    footerUrl: null,
    emblemUrl: null,
    heightPx: 52
  });
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    loadLogoConfig().then(cfg => setLogoConfig(cfg));

    const handleUpdate = () => {
      loadLogoConfig().then(cfg => setLogoConfig(cfg));
    };

    window.addEventListener('mmv_logo_updated', handleUpdate);
    return () => window.removeEventListener('mmv_logo_updated', handleUpdate);
  }, []);

  const activeUrl = variant === 'footer' 
    ? (logoConfig.footerUrl || logoConfig.primaryUrl)
    : logoConfig.primaryUrl;

  const textColor = lightText ? 'text-white' : 'text-brand-dark';
  const subTextColor = lightText ? 'text-white/90' : 'text-brand-dark';

  return (
    <div className={`relative flex items-center gap-2 sm:gap-3 ${className} group`}>
      {activeUrl ? (
        <img 
          src={activeUrl} 
          alt="Logo Brigada 99HDD" 
          style={{ height: `${logoConfig.heightPx}px` }}
          className="w-auto object-contain transition-transform group-hover:scale-105"
        />
      ) : (
        <>
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex flex-col items-center justify-center transition-colors relative shrink-0">
            <div className={`flex flex-col items-center justify-center ${textColor}`}>
              <svg viewBox="0 0 24 10" className="w-8 sm:w-10 h-3 text-[#310062] overflow-visible mb-[-2px] relative z-0">
                <path d="M2 10L12 0L22 10" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" fill="none" />
                <path d="M5 10L12 3L19 10" stroke="#C1124F" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" fill="none" />
              </svg>
              <HeartHandshake size={28} strokeWidth={2} className="group-hover:scale-105 transition-transform relative z-10 text-[#310062] bg-white rounded-full" />
            </div>
          </div>
          <div className="flex flex-col justify-center leading-none mt-1">
            <span className={`font-black text-[18px] sm:text-xl md:text-[26px] tracking-tighter leading-none transition-colors ${textColor}`} style={{ fontFamily: 'Impact, sans-serif', transform: 'scaleY(1.1)' }}>
              BRIGADA <span className="text-brand-accent">99HDD</span>
            </span>
            <span className={`font-bold text-[10px] sm:text-[11px] md:text-[13px] tracking-wide mt-1.5 transition-colors ${subTextColor}`} style={{ letterSpacing: '0.05em' }}>
              Mano<span className="text-brand-accent">a</span>Mano
            </span>
          </div>
        </>
      )}

      {onEditLogo && isEditMode && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEditLogo();
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-2 -right-2 bg-brand-dark/90 hover:bg-brand-dark text-white p-1 rounded-full shadow text-[10px] flex items-center justify-center cursor-pointer animate-fade-in"
          title="Cambiar logo (Visible en Modo Edición)"
        >
          <Camera size={11} />
        </button>
      )}
    </div>
  );
};

const Navbar = ({ 
  onOpenLogoModal,
  onOpenPreRegistro,
  onOpenPadrinoModal,
  onOpenFinanciaModal
}: { 
  onOpenLogoModal: () => void;
  onOpenPreRegistro?: () => void;
  onOpenPadrinoModal?: () => void;
  onOpenFinanciaModal?: () => void;
}) => {
  const { isEditMode } = useEditMode();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [projectsDropdownOpen, setProjectsDropdownOpen] = useState(false);
  const [mobileProjectsOpen, setMobileProjectsOpen] = useState(false);
  const [apadrinaDropdownOpen, setApadrinaDropdownOpen] = useState(false);
  const [mobileApadrinaOpen, setMobileApadrinaOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 bg-white shadow-sm ${scrolled ? 'py-3' : 'py-5'}`}>
      <div className="container mx-auto px-6 lg:px-12 flex justify-between items-center">
        
        {/* Brand Logo & Direct Upload Option (shown when in Edit Mode) */}
        <div className="flex items-center gap-2 sm:gap-2.5 z-50">
          <a href="#inicio" className="group flex items-center">
            <BrandLogo onEditLogo={onOpenLogoModal} />
          </a>
          {isEditMode && (
            <button
              onClick={onOpenLogoModal}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-600 hover:text-brand-accent bg-stone-100 hover:bg-stone-200/90 px-2.5 py-1 rounded-full border border-stone-200/90 transition-all shadow-2xs group cursor-pointer animate-fade-in"
              title="Subir o cambiar los logos oficiales de la brigada (Visible en Modo Edición)"
            >
              <Camera size={12} className="text-brand-ocean group-hover:text-brand-accent transition-colors" />
              <span className="hidden sm:inline">Subir logo</span>
            </button>
          )}
        </div>

        {/* Desktop Links & Buttons: Inicio | Proyectos v | Prensa | Apadrina v | Contacto | Financia nuestro proyecto */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2 font-medium text-stone-600 transition-colors">
          <a 
            href="#inicio" 
            className="px-3 py-1.5 lg:px-3.5 lg:py-2 rounded-full text-xs lg:text-sm font-medium tracking-normal text-stone-600 hover:text-brand-accent hover:bg-stone-100/80 transition-all duration-200 whitespace-nowrap"
          >
            Inicio
          </a>

          {/* Menú Desplegable: Proyectos (- Brigada 99HDD, - Mano a Mano) */}
          <div 
            className="relative"
            onMouseEnter={() => setProjectsDropdownOpen(true)}
            onMouseLeave={() => setProjectsDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => setProjectsDropdownOpen((prev) => !prev)}
              className={`px-3 py-1.5 lg:px-3.5 lg:py-2 rounded-full text-xs lg:text-sm font-medium tracking-normal transition-all duration-200 whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer ${
                projectsDropdownOpen ? 'text-brand-accent bg-stone-100' : 'text-stone-600 hover:text-brand-accent hover:bg-stone-100/80'
              }`}
              aria-expanded={projectsDropdownOpen}
              id="nav-btn-proyectos"
            >
              <span>Proyectos</span>
              <ChevronDown 
                size={14} 
                className={`transition-transform duration-200 ${projectsDropdownOpen ? 'rotate-180 text-brand-accent' : 'text-stone-400'}`} 
              />
            </button>

            <AnimatePresence>
              {projectsDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-1 w-60 bg-white rounded-2xl shadow-xl border border-stone-200/80 p-2 z-50 text-left"
                >
                  <div className="px-3 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Proyectos
                  </div>

                  {/* Opción 1: Brigada 99HDD */}
                  <a
                    href="#proyecto-brigada-99hdd"
                    onClick={() => setProjectsDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-brand-cream/80 text-stone-800 hover:text-brand-accent transition-colors group"
                    id="btn-nav-brigada-99hdd"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-accent/10 text-brand-accent flex items-center justify-center shrink-0 transition-colors">
                      <Truck size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-xs lg:text-sm block text-stone-900 group-hover:text-brand-accent">
                        Brigada 99HDD
                      </span>
                      <span className="text-[11px] text-stone-500 block truncate">
                        16 albergues y comunidades
                      </span>
                    </div>
                  </a>

                  {/* Opción 2: Mano a Mano */}
                  <a
                    href="#proyecto-mano-a-mano"
                    onClick={() => setProjectsDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-brand-cream/80 text-stone-800 hover:text-brand-accent transition-colors group mt-0.5"
                    id="btn-nav-mano-a-mano"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-ocean/10 text-brand-ocean flex items-center justify-center shrink-0 group-hover:bg-brand-accent/10 group-hover:text-brand-accent transition-colors">
                      <HeartHandshake size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-xs lg:text-sm block text-stone-900 group-hover:text-brand-accent">
                        Mano a Mano
                      </span>
                      <span className="text-[11px] text-stone-500 block truncate">
                        Censo y sinopsis familiar
                      </span>
                    </div>
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Enlace Prensa */}
          <a 
            href="#prensa" 
            className="px-3 py-1.5 lg:px-3.5 lg:py-2 rounded-full text-xs lg:text-sm font-medium tracking-normal text-stone-600 hover:text-brand-accent hover:bg-stone-100/80 transition-all duration-200 whitespace-nowrap"
          >
            Prensa
          </a>

          {/* Enlace Donación de Insumos */}
          <a 
            href="#insumos" 
            className="px-3 py-1.5 lg:px-3.5 lg:py-2 rounded-full text-xs lg:text-sm font-medium tracking-normal text-stone-600 hover:text-brand-accent hover:bg-stone-100/80 transition-all duration-200 whitespace-nowrap"
          >
            Insumos
          </a>

          {/* Menú Desplegable: Apadrina (- ¿Cómo apadrinar?, - Acceso al expediente Mano a Mano) */}
          <div 
            className="relative"
            onMouseEnter={() => setApadrinaDropdownOpen(true)}
            onMouseLeave={() => setApadrinaDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => setApadrinaDropdownOpen((prev) => !prev)}
              className={`px-3 py-1.5 lg:px-3.5 lg:py-2 rounded-full text-xs lg:text-sm font-medium tracking-normal transition-all duration-200 whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer ${
                apadrinaDropdownOpen ? 'text-brand-accent bg-stone-100' : 'text-stone-600 hover:text-brand-accent hover:bg-stone-100/80'
              }`}
              aria-expanded={apadrinaDropdownOpen}
              id="nav-btn-apadrina"
            >
              <span>Apadrina</span>
              <ChevronDown 
                size={14} 
                className={`transition-transform duration-200 ${apadrinaDropdownOpen ? 'rotate-180 text-brand-accent' : 'text-stone-400'}`} 
              />
            </button>

            <AnimatePresence>
              {apadrinaDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-stone-200/80 p-2 z-50 text-left"
                >
                  <div className="px-3 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Modalidades de Apadrinamiento
                  </div>

                  {/* Opción 1: ¿Cómo apadrinar? */}
                  <button
                    type="button"
                    onClick={() => {
                      setApadrinaDropdownOpen(false);
                      if (onOpenPadrinoModal) {
                        onOpenPadrinoModal();
                      }
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-brand-cream/80 text-stone-800 hover:text-brand-accent transition-colors group text-left cursor-pointer"
                    id="btn-nav-como-apadrinar"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-accent/10 text-brand-accent flex items-center justify-center shrink-0">
                      <Heart size={16} fill="currentColor" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-xs lg:text-sm block text-stone-900 group-hover:text-brand-accent">
                        ¿Cómo apadrinar?
                      </span>
                      <span className="text-[11px] text-stone-500 block truncate">
                        Conoce la metodología y vías
                      </span>
                    </div>
                  </button>

                  {/* Opción 2: Acceso al expediente Mano a Mano */}
                  <button
                    type="button"
                    onClick={() => {
                      setApadrinaDropdownOpen(false);
                      if (onOpenPadrinoModal) {
                        onOpenPadrinoModal();
                      } else {
                        const el = document.getElementById('btn-ficha-padrino');
                        if (el) el.click();
                      }
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-brand-cream/80 text-stone-800 hover:text-brand-accent transition-colors group mt-0.5 text-left cursor-pointer"
                    id="btn-nav-acceso-expediente"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-ocean/10 text-brand-ocean flex items-center justify-center shrink-0 group-hover:bg-brand-accent/10 group-hover:text-brand-accent transition-colors">
                      <FileText size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-xs lg:text-sm block text-stone-900 group-hover:text-brand-accent">
                        Acceso al expediente Mano a Mano
                      </span>
                      <span className="text-[11px] text-stone-500 block truncate">
                        Solicitud de dossier confidencial
                      </span>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Enlace Contacto */}
          <a 
            href="#contacto" 
            className="px-3 py-1.5 lg:px-3.5 lg:py-2 rounded-full text-xs lg:text-sm font-medium tracking-normal text-stone-600 hover:text-brand-accent hover:bg-stone-100/80 transition-all duration-200 whitespace-nowrap"
          >
            Contacto
          </a>

          <div className="h-5 w-px bg-stone-200/80 mx-1.5 hidden lg:block" aria-hidden="true" />
          <button 
            type="button"
            onClick={() => {
              if (onOpenFinanciaModal) {
                onOpenFinanciaModal();
              } else {
                const el = document.getElementById('fondos-solidarios');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="ml-1 inline-flex items-center gap-2 px-4 py-2 lg:px-5 lg:py-2 bg-brand-accent hover:bg-[#a00e40] text-white rounded-full text-xs lg:text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap cursor-pointer"
            id="btn-nav-financia-proyecto"
          >
            <span>Financia nuestro proyecto</span>
            <Heart size={15} fill="currentColor" className="opacity-95" />
          </button>
        </div>

        {/* Mobile Header Right: Menu Toggle */}
        <div className="flex items-center md:hidden z-50">
          <button 
            className="text-brand-dark transition-colors p-1" 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center gap-3.5 animate-fade-in p-6 text-center overflow-y-auto">
            <a 
              href="#inicio" 
              className="text-lg font-semibold text-stone-800 hover:text-brand-accent py-1 px-4 rounded-xl hover:bg-stone-50 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Inicio
            </a>

            {/* Mobile Menu Links */}
            <div className="w-full max-w-xs flex flex-col items-center">
              <button
                type="button"
                onClick={() => setMobileProjectsOpen(!mobileProjectsOpen)}
                className="text-lg font-semibold text-stone-800 hover:text-brand-accent py-1 px-4 rounded-xl hover:bg-stone-50 transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Proyectos</span>
                <ChevronDown 
                  size={18} 
                  className={`transition-transform duration-200 ${mobileProjectsOpen ? 'rotate-180 text-brand-accent' : 'text-stone-400'}`} 
                />
              </button>

              {mobileProjectsOpen && (
                <div className="w-full mt-2 flex flex-col gap-2 p-2 bg-stone-50 rounded-2xl border border-stone-200/60 animate-fade-in">
                  <a
                    href="#proyecto-brigada-99hdd"
                    onClick={() => { setMenuOpen(false); setMobileProjectsOpen(false); }}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white text-stone-800 hover:text-brand-accent shadow-2xs text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-accent/10 text-brand-accent flex items-center justify-center shrink-0">
                      <Truck size={16} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Brigada 99HDD</div>
                      <div className="text-[11px] text-stone-500">16 albergues y comunidades</div>
                    </div>
                  </a>

                  <a
                    href="#proyecto-mano-a-mano"
                    onClick={() => { setMenuOpen(false); setMobileProjectsOpen(false); }}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white text-stone-800 hover:text-brand-accent shadow-2xs text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-ocean/10 text-brand-ocean flex items-center justify-center shrink-0">
                      <HeartHandshake size={16} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Mano a Mano</div>
                      <div className="text-[11px] text-stone-500">Censo y expedientes de familias</div>
                    </div>
                  </a>
                </div>
              )}
            </div>

            {/* Enlace Móvil Prensa */}
            <a 
              href="#prensa" 
              className="text-lg font-semibold text-stone-800 hover:text-brand-accent py-1 px-4 rounded-xl hover:bg-stone-50 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Prensa
            </a>

            {/* Enlace Móvil Insumos */}
            <a 
              href="#insumos" 
              className="text-lg font-semibold text-stone-800 hover:text-brand-accent py-1 px-4 rounded-xl hover:bg-stone-50 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Insumos
            </a>

            {/* Apadrina Acordeón Móvil */}
            <div className="w-full max-w-xs flex flex-col items-center">
              <button
                type="button"
                onClick={() => setMobileApadrinaOpen(!mobileApadrinaOpen)}
                className="text-lg font-semibold text-stone-800 hover:text-brand-accent py-1 px-4 rounded-xl hover:bg-stone-50 transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Apadrina</span>
                <ChevronDown 
                  size={18} 
                  className={`transition-transform duration-200 ${mobileApadrinaOpen ? 'rotate-180 text-brand-accent' : 'text-stone-400'}`} 
                />
              </button>

              {mobileApadrinaOpen && (
                <div className="w-full mt-2 flex flex-col gap-2 p-2 bg-stone-50 rounded-2xl border border-stone-200/60 animate-fade-in">
                  <button
                    type="button"
                    onClick={() => { 
                      setMenuOpen(false); 
                      setMobileApadrinaOpen(false); 
                      if (onOpenPadrinoModal) {
                        onOpenPadrinoModal();
                      }
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white text-stone-800 hover:text-brand-accent shadow-2xs text-left w-full cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-accent/10 text-brand-accent flex items-center justify-center shrink-0">
                      <Heart size={16} fill="currentColor" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">¿Cómo apadrinar?</div>
                      <div className="text-[11px] text-stone-500">Conoce la metodología</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setMobileApadrinaOpen(false);
                      if (onOpenPadrinoModal) {
                        onOpenPadrinoModal();
                      } else {
                        const el = document.getElementById('btn-ficha-padrino');
                        if (el) el.click();
                      }
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white text-stone-800 hover:text-brand-accent shadow-2xs text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-ocean/10 text-brand-ocean flex items-center justify-center shrink-0">
                      <FileText size={16} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Acceso al expediente</div>
                      <div className="text-[11px] text-stone-500">Solicitud de dossier confidencial</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Enlace Móvil Contacto */}
            <a 
              href="#contacto" 
              className="text-lg font-semibold text-stone-800 hover:text-brand-accent py-1 px-4 rounded-xl hover:bg-stone-50 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Contacto
            </a>

            {onOpenPreRegistro && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenPreRegistro();
                }}
                className="hidden items-center gap-2 px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-full text-base font-semibold border border-stone-200 transition-colors"
              >
                <FileText size={18} className="text-brand-ocean" />
                <span>Cuéntanos tu caso</span>
              </button>
            )}

            <button 
              type="button"
              onClick={() => { 
                setMenuOpen(false); 
                if (onOpenFinanciaModal) {
                  onOpenFinanciaModal();
                } else {
                  const el = document.getElementById('fondos-solidarios');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }} 
              className="px-8 py-3 bg-brand-accent text-white rounded-full shadow-soft flex items-center gap-2 text-base font-semibold mt-1 hover:bg-[#a00e40] transition-colors cursor-pointer"
            >
              <span>Financia nuestro proyecto</span>
              <Heart size={18} fill="currentColor" />
            </button>

            {isEditMode && (
              <button 
                onClick={() => { setMenuOpen(false); onOpenLogoModal(); }} 
                className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-brand-accent py-2 px-4 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors mt-2"
              >
                <Camera size={14} className="text-brand-ocean" />
                <span>Subir o Cambiar Logo</span>
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

function MainContent() {
  const { isEditMode } = useEditMode();
  const OFFICIAL_BASE_RAISED = 2780;
  const OFFICIAL_TARGET_AMOUNT = 25000;

  const [raisedAmount, setRaisedAmount] = useState<number>(() => {
    // Restaurar estrictamente a los $2.780 USD recaudados comprobados
    return 2780;
  });
  const targetAmount = OFFICIAL_TARGET_AMOUNT;
  const percentage = Math.min(100, Math.max(0, (raisedAmount / targetAmount) * 100));

  // Restaurar y sincronizar estrictamente la base recaudada a $2.780 USD en la sesión del navegador
  useEffect(() => {
    try {
      const baselineVersion = localStorage.getItem('mmv_raised_baseline_version');
      if (baselineVersion !== '2780_official_baseline_v4') {
        localStorage.setItem('mmv_raised_baseline_version', '2780_official_baseline_v4');
        localStorage.setItem('mmv_raised_amount', '2780');
        // Asegurar que registros de prueba previos queden como 'en_verificacion'
        const raw = localStorage.getItem('mmv_micro_donations_database');
        if (raw) {
          const list = JSON.parse(raw);
          const sanitized = list.map((item: any) => ({
            ...item,
            status: 'en_verificacion'
          }));
          localStorage.setItem('mmv_micro_donations_database', JSON.stringify(sanitized));
        }
      }
    } catch {}
    const verified = getVerifiedDonationsTotal(OFFICIAL_BASE_RAISED);
    setRaisedAmount(verified);
    try {
      localStorage.setItem('mmv_raised_amount', String(verified));
    } catch {}
  }, []);

  // Logo Customization Modal State
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  // Emblema Oficial Circular State
  const [customEmblem, setCustomEmblem] = useState<string | null>(null);

  useEffect(() => {
    loadLogoConfig().then(cfg => {
      if (cfg.emblemUrl) setCustomEmblem(cfg.emblemUrl);
    });

    const handleEmblemUpdate = (e: any) => {
      if (e.detail?.dataUrl) {
        setCustomEmblem(e.detail.dataUrl);
      } else {
        loadLogoConfig().then(cfg => setCustomEmblem(cfg.emblemUrl));
      }
    };

    window.addEventListener('mmv_emblem_updated', handleEmblemUpdate);
    window.addEventListener('mmv_logo_updated', handleEmblemUpdate);
    return () => {
      window.removeEventListener('mmv_emblem_updated', handleEmblemUpdate);
      window.removeEventListener('mmv_logo_updated', handleEmblemUpdate);
    };
  }, []);

  // Listen for open logo modal custom event (triggered by FloatingEditorBar)
  useEffect(() => {
    const handleOpenLogo = () => setIsLogoModalOpen(true);
    window.addEventListener('mmv_open_logo_modal', handleOpenLogo);
    return () => window.removeEventListener('mmv_open_logo_modal', handleOpenLogo);
  }, []);

  // Auto-sync current photos and logos to project files in dev environment
  useEffect(() => {
    if (isDevEnvironment()) {
      const timer = setTimeout(() => {
        syncCurrentContentToProject().catch(() => {});
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Pre-registro, Padrinos & Voluntarios Modals State
  const [isPreRegistroModalOpen, setIsPreRegistroModalOpen] = useState(false);
  const [isPadrinoModalOpen, setIsPadrinoModalOpen] = useState(false);
  const [isDriveSyncModalOpen, setIsDriveSyncModalOpen] = useState(false);
  const [isCentrosAcopioModalOpen, setIsCentrosAcopioModalOpen] = useState(false);
  const [selectedCentroIdForModal, setSelectedCentroIdForModal] = useState<string | null>(null);

  const handleOpenCentrosModal = (centroId?: string) => {
    if (centroId) {
      setSelectedCentroIdForModal(centroId);
    } else {
      setSelectedCentroIdForModal(null);
    }
    setIsCentrosAcopioModalOpen(true);
  };

  // Donation Modal State
  const [isFinanciaModalOpen, setIsFinanciaModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isDonationsDashboardOpen, setIsDonationsDashboardOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PaymentPlatform | null>(null);
  const [modalPreselectedDestino, setModalPreselectedDestino] = useState<string>('Fase Amplia / Albergues y Logística');
  const [modalPreselectedAmount, setModalPreselectedAmount] = useState<number | undefined>(undefined);
  const [celebrationToast, setCelebrationToast] = useState<{ amount: number; donor: string } | null>(null);

  // Tabs within Fondos Económicos
  const [donationTab, setDonationTab] = useState<'jornadas' | 'vehiculos'>('jornadas');

  const handleApadrinarCase = (caseItem: VerifiedCase) => {
    setModalPreselectedDestino(`Apadrinar Caso: ${caseItem.familyName} (${caseItem.code})`);
    setModalPreselectedAmount(Math.min(50, Math.max(25, caseItem.targetAmount - caseItem.raisedAmount)));
    setSelectedPlatform(PAYMENT_PLATFORMS[0]);
    setIsDonationModalOpen(true);
  };

  const handleOpenPlatformModal = (platform: PaymentPlatform, amount?: number, destino?: string) => {
    setSelectedPlatform(platform);
    if (amount) setModalPreselectedAmount(amount);
    if (destino) setModalPreselectedDestino(destino);
    setIsDonationModalOpen(true);
  };

  const handleSelectVehicleToDonate = (vehicleTitle: string, targetPrice?: number) => {
    setModalPreselectedDestino(`Segmento Flota: ${vehicleTitle}`);
    setModalPreselectedAmount(50);
    setSelectedPlatform(PAYMENT_PLATFORMS[0]); // Zelle as default
    setIsDonationModalOpen(true);
  };

  const handleQuickJornadaDonate = (amount: number, label: string) => {
    setModalPreselectedAmount(amount);
    setModalPreselectedDestino(`Jornadas: ${label}`);
    setSelectedPlatform(PAYMENT_PLATFORMS[0]);
    setIsDonationModalOpen(true);
  };

  // Secret access to Auditoría & Corrector (Ctrl + Alt + E / Cmd + Alt + E)
  const [showAuditButton, setShowAuditButton] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('mmv_audit_btn_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl + Alt + E or Cmd + Option + E
      const isModifier = (e.ctrlKey || e.metaKey) && e.altKey;
      if (isModifier && (e.key === 'e' || e.key === 'E' || e.code === 'KeyE')) {
        e.preventDefault();
        setShowAuditButton(true);
        try {
          sessionStorage.setItem('mmv_audit_btn_unlocked', 'true');
        } catch {}
        setIsDonationsDashboardOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const recalculateRaisedAmount = () => {
    try {
      // ÚNICAMENTE sumamos a la meta macro las donaciones comprobadas manualmente (status: 'confirmado')
      const verifiedTotal = getVerifiedDonationsTotal(OFFICIAL_BASE_RAISED);
      setRaisedAmount(verifiedTotal);
      localStorage.setItem('mmv_raised_amount', String(verifiedTotal));
    } catch {
      // fallback
    }
  };

  const handleOpenFinanciaModal = () => {
    recalculateRaisedAmount();
    setIsFinanciaModalOpen(true);
  };

  const handleDonationConfirmed = (amount: number, donorName: string) => {
    // Al registrarse un reporte entra en estado 'en_verificacion'.
    // No se suma a la barra de recaudación hasta que sea comprobada manualmente en la auditoría.
    recalculateRaisedAmount();
    setCelebrationToast({ amount, donor: donorName });
    setTimeout(() => {
      setCelebrationToast(null);
    }, 7000);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-brand-accent/20 selection:text-brand-dark relative">
      <Navbar 
        onOpenLogoModal={() => setIsLogoModalOpen(true)} 
        onOpenPreRegistro={() => setIsPreRegistroModalOpen(true)}
        onOpenPadrinoModal={() => setIsPadrinoModalOpen(true)}
        onOpenFinanciaModal={handleOpenFinanciaModal}
      />

      {/* Hero Section */}
      <section id="inicio" className="relative pt-36 md:pt-48 lg:pt-56 pb-16 lg:pb-32 overflow-hidden bg-brand-dark">
        {/* Abstract Brand Identity Background */}
        <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[80%] md:w-[60%] h-[80%] rounded-full bg-brand-accent/20 blur-[100px] md:blur-[120px] animate-float"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[70%] md:w-[50%] h-[70%] rounded-full bg-brand-ocean/10 blur-[100px] md:blur-[120px] animate-float-delayed"></div>
          
          {/* Subtle watermark of the logo concept */}
          <HeartHandshake size={400} className="text-white/[0.03] absolute -right-10 bottom-0 md:-right-20 md:bottom-10 -rotate-12 md:w-[600px] md:h-[600px] w-[400px] h-[400px] animate-pulse-slow" />
          <div className="absolute top-20 right-[10%] md:right-[15%] w-20 h-20 md:w-32 md:h-32 border-[6px] md:border-[8px] border-white/[0.02] transform rotate-45 animate-float"></div>
        </div>

        <div className="container mx-auto px-5 sm:px-6 lg:px-12 relative z-10 text-center">
          <FadeIn delay={0.1}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-serif font-medium text-white/95 max-w-5xl mx-auto leading-tight md:leading-tight mb-5 md:mb-8 tracking-tight drop-shadow-2xl">
              "Donde Dios reúne a dos o más, <br className="hidden md:block"/> <span className="bg-gradient-to-r from-brand-ocean via-teal-200 to-brand-ocean bg-clip-text text-transparent italic font-normal">suceden cosas maravillosas</span>"
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-[15px] sm:text-base md:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto mb-8 md:mb-12 font-light leading-relaxed px-4 drop-shadow-md">
              Reconstruyamos a las familias venezolanas víctimas del doblete sísmico el 24 de junio del 2026. Tu ayuda se convierte en esperanza directa.
            </p>
          </FadeIn>

          {/* Dos Fichas de Acción Directa: Víctimas & Donantes Mano a Mano */}
          <FadeIn delay={0.3}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto w-full items-stretch my-2">
              
              {/* Bloque 1: Víctimas del doblete sísmico */}
              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/15 flex flex-col justify-between text-center gap-4 shadow-xl hover:border-brand-accent/50 transition-all">
                <p className="text-xs sm:text-sm md:text-[15px] font-medium text-white/90 leading-snug">
                  ¿Fuiste victima del doblete sísmico del 24 de Junio?
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => setIsPreRegistroModalOpen(true)}
                    className="w-full py-3.5 px-6 bg-brand-accent hover:bg-[#a00e40] text-white rounded-full text-xs sm:text-sm md:text-base font-semibold transition-all shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 transform cursor-pointer flex items-center justify-center gap-2"
                    id="btn-hero-registra-expediente"
                  >
                    <FileText size={17} />
                    <span>Registra tu expediente aquí</span>
                  </button>
                </div>
              </div>

              {/* Bloque 2: Donantes Mano a Mano */}
              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/15 flex flex-col justify-between text-center gap-4 shadow-xl hover:border-emerald-400/50 transition-all">
                <p className="text-xs sm:text-sm md:text-[15px] font-medium text-white/90 leading-snug">
                  ¿Quieres donar Mano a Mano a las victimas del doblete sísmico del 24 de Junio?
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => setIsPadrinoModalOpen(true)}
                    className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs sm:text-sm md:text-base font-semibold border-2 border-emerald-400 hover:border-emerald-300 transition-all shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transform cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                    id="btn-hero-acceder-expediente"
                  >
                    <Heart size={17} className="text-white" fill="currentColor" />
                    <span>Acceder al expediente</span>
                  </button>
                </div>
              </div>

            </div>
          </FadeIn>

          {/* Galería Fotográfica Interactiva Oficial (10 Fotos) */}
          <FadeIn delay={0.4}>
            <PhotoGallery />
          </FadeIn>
        </div>
      </section>

      {/* Proyectos */}
      <section id="proyectos" className="py-16 md:py-24 bg-brand-cream">
        <div className="container mx-auto px-6 lg:px-12">
          <FadeIn>
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-dark mb-3 md:mb-4">Nuestros Proyectos</h2>
              <p className="text-stone-600 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">Iniciativas diseñadas para brindar apoyo estructurado, transparente y directo a quienes más lo necesitan en el estado La Guaira.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <FadeIn delay={0.1} className="h-full">
              <div id="proyecto-mano-a-mano" className="scroll-mt-28 bg-white p-6 md:p-10 lg:p-12 rounded-3xl shadow-soft border border-stone-100 h-full flex flex-col">
                {/* Customizable Logos: Mano a Mano Venezuela */}
                <ProjectCardLogos 
                  cardId="card1" 
                  cardTitle="Mano a Mano Venezuela" 
                />
                <h3 className="text-xl md:text-2xl font-bold text-stone-900 mb-3 md:mb-4">Mano a Mano Venezuela</h3>
                <p className="text-stone-600 mb-6 text-sm md:text-base flex-1 leading-relaxed">
                  Un proyecto tecnológico integral para clasificar y organizar los expedientes de las familias desplazadas. Nuestro objetivo principal es conectar directamente al afectado con los donantes de forma transparente.
                </p>
                <div className="bg-brand-cream rounded-2xl p-5 md:p-6 mb-6 md:mb-8 space-y-4 border border-stone-100">
                  <h4 className="font-semibold text-stone-900 text-xs md:text-sm uppercase tracking-wider mb-2">Fases del Proyecto</h4>
                  <div className="flex gap-3 md:gap-4 items-start">
                    <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-brand-ocean text-white flex items-center justify-center shrink-0 text-[10px] md:text-xs font-bold mt-0.5">1</span>
                    <p className="text-xs md:text-sm text-stone-700 leading-relaxed">Levantamiento de datos y sinopsis familiar.</p>
                  </div>
                  <div className="flex gap-3 md:gap-4 items-start">
                    <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-brand-ocean text-white flex items-center justify-center shrink-0 text-[10px] md:text-xs font-bold mt-0.5">2</span>
                    <p className="text-xs md:text-sm text-stone-700 leading-relaxed">Elaboración de reporte detallado de daños y necesidades.</p>
                  </div>
                  <div className="flex gap-3 md:gap-4 items-start">
                    <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-brand-ocean text-white flex items-center justify-center shrink-0 text-[10px] md:text-xs font-bold mt-0.5">3</span>
                    <p className="text-xs md:text-sm text-stone-700 leading-relaxed">Presentación de proyecto de solución propuesto por el afectado.</p>
                  </div>
                </div>
                <a href="https://canva.link/e1olo0wkoyw0rzz" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-5 py-3 md:px-6 md:py-4 bg-brand-dark text-white rounded-xl hover:bg-stone-800 transition-colors font-medium text-sm md:text-base">
                  Conoce el proyecto <ExternalLink size={16} />
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.2} className="h-full">
              <div id="proyecto-brigada-99hdd" className="scroll-mt-28 bg-brand-dark p-6 md:p-10 lg:p-12 rounded-3xl shadow-soft h-full flex flex-col text-white">
                {/* Customizable Logos: La Brigada 99HDD */}
                <ProjectCardLogos 
                  cardId="card2" 
                  cardTitle="La Brigada 99HDD" 
                  isDarkCard={true} 
                />
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">La Brigada 99HDD</h3>
                <p className="text-stone-300 mb-6 text-sm md:text-base flex-1 leading-relaxed">
                  Nacida el 25 de junio en medio de la búsqueda solidaria, rinde tributo a "99 Hijos de Dios". Hoy en día atiende ininterrumpidamente a más de 16 albergues y 13 comunidades en el estado La Guaira.
                </p>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 mb-6 md:mb-8">
                  <h4 className="font-semibold text-brand-ocean text-xs md:text-sm uppercase tracking-wider mb-3 md:mb-4 flex items-center gap-2">
                    <Truck size={14} className="md:w-4 md:h-4" /> Reto Logístico Actual
                  </h4>
                  <p className="text-xs md:text-sm text-stone-300 mb-4 md:mb-5 leading-relaxed">
                    Mantener la asistencia desde Naiguatá hasta Las Tunitas representa un desafío logístico diario. Requerimientos activos:
                  </p>
                  <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-stone-200">
                    <li className="flex items-center gap-2.5 md:gap-3"><CheckCircle2 size={16} className="text-brand-accent shrink-0 md:w-[18px] md:h-[18px]" /> Apoyo para combustible y transporte</li>
                    <li className="flex items-center gap-2.5 md:gap-3"><CheckCircle2 size={16} className="text-brand-accent shrink-0 md:w-[18px] md:h-[18px]" /> Alimentos no perecederos</li>
                    <li className="flex items-center gap-2.5 md:gap-3"><CheckCircle2 size={16} className="text-brand-accent shrink-0 md:w-[18px] md:h-[18px]" /> Agua potable e hidratación</li>
                    <li className="flex items-center gap-2.5 md:gap-3"><CheckCircle2 size={16} className="text-brand-accent shrink-0 md:w-[18px] md:h-[18px]" /> Snacks para voluntarios y niños</li>
                  </ul>
                </div>
                <button 
                  type="button"
                  onClick={handleOpenFinanciaModal}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 md:px-6 md:py-4 bg-brand-accent text-white rounded-xl hover:bg-[#a00e40] transition-colors font-medium text-sm md:text-base cursor-pointer shadow-md hover:shadow-lg active:scale-95"
                  id="btn-brigada-financia-proyecto"
                >
                  <span>Financia nuestro proyecto</span>
                  <Heart size={16} fill="currentColor" />
                </button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Prensa y Galería */}
      <section id="prensa" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <FadeIn>
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-dark mb-3 md:mb-4">Prensa y Registros</h2>
              <p className="text-stone-600 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">Sigue de cerca nuestro impacto a través de las coberturas mediáticas y registros de nuestra labor en terreno.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            {[
              { 
                title: "Entrevista a Jesús Blanco García en El Solidario", 
                source: "Globovisión", 
                image: "/globovision-logo.png",
                bg: "bg-gradient-to-br from-[#004b87] via-[#00386b] to-[#002447]",
                fallback: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Logo-Globovisi%C3%B3n.png",
                videoUrl: "https://www.youtube.com/watch?v=rjWcdHiT3Fk",
                youtubeId: "rjWcdHiT3Fk"
              },
              { 
                title: "Entrevista a Jesús Blanco García en El Show de Mediodía", 
                source: "La Tele Tuya", 
                image: "/tlt-logo.png",
                bg: "bg-gradient-to-br from-[#3b1560] via-[#240e3b] to-[#140624]",
                fallback: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Tele_Tuya_Logo_%282026%29.png",
                videoUrl: "https://www.youtube.com/watch?v=qpgKn--dGYM&t=350s",
                youtubeId: "qpgKn--dGYM",
                startTime: 350
              },
              { 
                title: "Entrevista a Jesús Blanco García con Franzis Torrealba", 
                source: "Instagram Reel", 
                image: "/instagram-logo.svg",
                bg: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]",
                fallback: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg",
                videoUrl: "https://www.instagram.com/reel/Dc68btKRP-p/?hl=es",
                instagramId: "Dc68btKRP-p"
              }
            ].map((media, idx) => (
              <FadeIn key={idx} delay={idx * 0.1}>
                <MediaCard media={media} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Donación de Insumos (Centros de Acopio y Sede Central La Guaira) */}
      <DonacionInsumosSection onOpenCentrosModal={handleOpenCentrosModal} />

      {/* Footer / Contacto Reorganizado Armónicamente */}
      <footer id="contacto" className="bg-white text-stone-600 pt-16 pb-8 md:pt-24 md:pb-12 border-t border-stone-200">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 mb-12 md:mb-16 items-start">
            
            {/* Columna 1: Identidad & Contacto Directo */}
            <div className="lg:col-span-4 flex flex-col justify-between h-full space-y-6">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <a href="#inicio" className="inline-block">
                    <BrandLogo variant="footer" onEditLogo={() => setIsLogoModalOpen(true)} />
                  </a>
                  {isEditMode && (
                    <button
                      onClick={() => setIsLogoModalOpen(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500 hover:text-brand-accent bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-full border border-stone-200 transition-all cursor-pointer animate-fade-in"
                      title="Cambiar logos oficiales (Visible en Modo Edición)"
                    >
                      <Camera size={12} className="text-brand-ocean" />
                      <span>Cambiar</span>
                    </button>
                  )}
                </div>
                <p className="text-stone-500 text-sm leading-relaxed mb-6">
                  Red de voluntariado y asistencia logística operando ininterrumpidamente desde el 25 de junio de 2026 en el estado La Guaira.
                </p>
              </div>

              {/* Canales de Contacto Directo Integrados */}
              <div className="pt-4 border-t border-stone-200/80">
                <h4 className="text-brand-dark font-bold text-sm tracking-wide mb-3 flex items-center gap-2">
                  <Mail size={15} className="text-brand-ocean" />
                  <span>Contacto Directo</span>
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm">
                  <li>
                    <a 
                      href="mailto:manomanovzla@gmail.com" 
                      className="flex items-center gap-3 text-stone-700 hover:text-brand-ocean transition-colors break-all group"
                    >
                      <span className="w-8 h-8 rounded-xl bg-stone-100 group-hover:bg-brand-ocean/10 text-stone-600 group-hover:text-brand-ocean flex items-center justify-center shrink-0 transition-colors">
                        <Mail size={15} />
                      </span>
                      <span className="font-medium">manomanovzla@gmail.com</span>
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://instagram.com/jesusblancogarcia_" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center gap-3 text-stone-700 hover:text-brand-ocean transition-colors group"
                    >
                      <span className="w-8 h-8 rounded-xl bg-stone-100 group-hover:bg-brand-ocean/10 text-stone-600 group-hover:text-brand-ocean flex items-center justify-center shrink-0 transition-colors">
                        <Instagram size={15} />
                      </span>
                      <span className="font-medium">@jesusblancogarcia_</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Columna 2: Emblema Oficial Circular */}
            <div className="lg:col-span-3 flex flex-col items-center justify-center self-center py-2">
              <div className="w-48 h-48 sm:w-52 sm:h-52 md:w-56 md:h-56 rounded-full p-2 bg-white shadow-soft hover:shadow-md border border-stone-200/90 transition-all duration-300 group overflow-hidden flex items-center justify-center">
                <img 
                  src={customEmblem || "/ORGANIZACIÓN SIN FINES DE LUCRO-01.png"} 
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.tried1) {
                      target.dataset.tried1 = 'true';
                      target.src = '/ORGANIZACION SIN FINES DE LUCRO-01.png';
                    } else if (!target.dataset.tried2) {
                      target.dataset.tried2 = 'true';
                      target.src = '/organizacion-sin-fines-de-lucro.png';
                    } else if (!target.dataset.tried3) {
                      target.dataset.tried3 = 'true';
                      target.src = '/organizacion-sin-fines-de-lucro.svg';
                    }
                  }}
                  alt="Emblema Oficial - Organización Sin Fines de Lucro - De Guaireños para Guaireños (M 18:20)" 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Columna 3: Únete o Solicita Información */}
            <div className="lg:col-span-5 md:col-span-2">
              <h4 className="text-brand-dark font-semibold mb-6">Únete o Solicita Información</h4>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <input type="text" placeholder="Nombre completo" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 md:py-3.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean transition-all" />
                  <input type="email" placeholder="Correo electrónico" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 md:py-3.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean transition-all" />
                </div>
                <div className="relative">
                  <select className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 md:py-3.5 text-sm text-stone-800 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean transition-all appearance-none cursor-pointer">
                    <option value="" className="text-stone-400">¿Cómo deseas participar?</option>
                    <option value="insumos">Donación de Insumos</option>
                    <option value="financiero">Aporte Financiero / Financiamiento</option>
                    <option value="prensa">Contacto de Prensa</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-stone-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                  </div>
                </div>
                <textarea placeholder="Tu mensaje..." rows={3} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean transition-all resize-none"></textarea>
                <button type="submit" className="px-6 py-3 md:px-8 md:py-3.5 bg-brand-ocean text-white rounded-xl font-semibold hover:bg-[#0a6670] transition-colors w-full sm:w-auto shadow-md text-sm md:text-base cursor-pointer">
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>

          <div className="pt-8 border-t border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-stone-500">
            <p>&copy; 2026 Mano a Mano Venezuela & Brigada 99HDD. Todos los derechos reservados.</p>
            
            <div className="flex flex-wrap items-center gap-3">
              {showAuditButton && (
                <button
                  type="button"
                  onClick={() => setIsDonationsDashboardOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 rounded-none text-xs font-mono font-semibold border border-stone-300 transition-colors cursor-pointer animate-fade-in"
                  title="Auditoría y Corrector de Donaciones"
                >
                  <Lock size={12} className="text-stone-600" />
                  <span>Auditoría & Corrector</span>
                </button>
              )}

              <p>
                Plataforma impulsada por{' '}
                <a 
                  href="https://disfuncionalestudio.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-medium text-stone-700 hover:text-brand-ocean underline decoration-stone-300 hover:decoration-brand-ocean transition-all"
                >
                  Disfuncional Studio
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Notification when a donation is made */}
      <AnimatePresence>
        {celebrationToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-brand-dark text-white border-2 border-brand-accent rounded-2xl p-4 shadow-2xl max-w-sm flex items-start gap-3 backdrop-blur-xl"
          >
            <div className="w-10 h-10 rounded-full bg-brand-accent/20 text-brand-accent flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-sm text-white">¡Aporte Registrado para Verificación!</h5>
              <p className="text-xs text-stone-300 mt-0.5">
                Gracias a <strong>{celebrationToast.donor}</strong> por su reporte de <strong>${celebrationToast.amount} USD</strong>. Se sumará al monto total una vez comprobada la transferencia por el equipo.
              </p>
            </div>
            <button
              onClick={() => setCelebrationToast(null)}
              className="text-stone-400 hover:text-white p-1 rounded-lg"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Financia Nuestro Proyecto Modal (Fondos Económicos & Donaciones desde 1$) */}
      <FinanciaModal
        isOpen={isFinanciaModalOpen}
        onClose={() => setIsFinanciaModalOpen(false)}
        raisedAmount={raisedAmount}
        onDonationConfirmed={handleDonationConfirmed}
        onOpenDonationFlow={(amt, destino) => {
          setModalPreselectedAmount(amt);
          setModalPreselectedDestino(destino);
          setIsDonationModalOpen(true);
        }}
      />

      {/* Multi-step Warm & Guided Donation Experience Modal */}
      <DonationModalExperience 
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        initialDestino={modalPreselectedDestino}
        initialAmount={modalPreselectedAmount}
        onDonationConfirmed={handleDonationConfirmed}
      />

      {/* Custom Brand Logo Modal */}
      <LogoModal 
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
      />

      {/* Pre-registro de Familias Afectadas con IA Empática */}
      <PreRegistroModal
        isOpen={isPreRegistroModalOpen}
        onClose={() => setIsPreRegistroModalOpen(false)}
        onOpenGoogleDriveSetup={() => {
          setIsPreRegistroModalOpen(false);
          setIsDriveSyncModalOpen(true);
        }}
      />

      {/* Sincronización Google Drive / Bandeja manomanovzla@gmail.com */}
      <GoogleDriveSyncModal
        isOpen={isDriveSyncModalOpen}
        onClose={() => setIsDriveSyncModalOpen(false)}
      />

      {/* Modal para Apadrinamiento Confidencial (Padrinos / Donantes) */}
      <PadrinoModal
        isOpen={isPadrinoModalOpen}
        onClose={() => setIsPadrinoModalOpen(false)}
      />

      {/* Modal Interactivo de Centros de Acopio (3 Caracas & 2 La Guaira) */}
      <CentrosAcopioModal
        isOpen={isCentrosAcopioModalOpen}
        onClose={() => setIsCentrosAcopioModalOpen(false)}
        initialSelectedId={selectedCentroIdForModal}
      />

      {/* Modal Dashboard Interno de Donaciones y Auditoría */}
      <DonationsDashboardModal
        isOpen={isDonationsDashboardOpen}
        onClose={() => setIsDonationsDashboardOpen(false)}
        onRecordsUpdated={recalculateRaisedAmount}
      />

      {/* Floating Editor Mode Dock / Bar */}
      <FloatingEditorBar 
        onOpenDriveSync={() => setIsDriveSyncModalOpen(true)} 
        onOpenDonationsDashboard={() => setIsDonationsDashboardOpen(true)}
      />

    </div>
  );
}

export default function App() {
  return (
    <EditModeProvider>
      <MainContent />
    </EditModeProvider>
  );
}
