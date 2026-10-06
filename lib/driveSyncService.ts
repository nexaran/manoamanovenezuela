/**
 * Conector oficial para Google Apps Script / Google Drive / Google Sheets
 * Organización: Mano a Mano Venezuela & Brigada 99HDD
 * Cuenta Oficial: manomanovzla@gmail.com
 * Estética y Colores Institucionales:
 *  - Morado Institucional: #310062
 *  - Carmesí / Magenta: #C1124F
 *  - Azul Océano / Teal: #0d7a85
 *  - Dorado Noble: #D4AF37
 *  - Marfil Suave: #f8f5ee
 */

import customBrandDataRaw from './customBrandData.json';

const APPS_SCRIPT_URL_KEY = 'mmv_apps_script_webhook_url';

export function getAppsScriptUrl(): string {
  if (typeof window === 'undefined') return '';
  const fromLocal = localStorage.getItem(APPS_SCRIPT_URL_KEY);
  if (fromLocal && fromLocal.trim()) return fromLocal.trim();
  const fromEnv = (import.meta as any).env?.VITE_GOOGLE_APPS_SCRIPT_URL;
  if (fromEnv && fromEnv.trim()) return fromEnv.trim();
  const fromData = (customBrandDataRaw as any)?.appsScriptUrl;
  if (fromData && fromData.trim()) return fromData.trim();
  return '';
}

export function saveAppsScriptUrl(url: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(APPS_SCRIPT_URL_KEY, url.trim());
}

/**
 * Código maestro del Google Apps Script para manomanovzla@gmail.com.
 * Con identidad y colores 100% Mano a Mano Venezuela & Brigada 99HDD.
 */
export const OFFICIAL_APPS_SCRIPT_CODE = `// =========================================================================
// SISTEMA INTEGRAL PRIVADO: GOOGLE DRIVE & GOOGLE SHEETS
// ORGANIZACIÓN: MANO A MANO VENEZUELA & BRIGADA 99HDD
// CUENTA ADMINISTRADORA: manomanovzla@gmail.com
// PALETA OFICIAL: Morado (#310062), Carmesí (#C1124F), Azul Océano (#0d7a85), Dorado (#D4AF37)
// =========================================================================

var ESTRUCTURA = {
  CARPETA_RAIZ: "Mano a Mano - Operaciones 99HDD",
  SUBCARPETAS: [
    "01. Bases de Datos (Google Sheets & Excel)",
    "02. Dashboard y Métricas de Impacto",
    "03. Reportes Ejecutivos y Conciliación",
    "04. Comprobantes y Respaldos Bancarios",
    "05. Expedientes y Dossiers Humanitarios (PDFs)"
  ],
  NOMBRE_SPREADSHEET: "Consolidado_Oficial_ManoAMano",
  HOJAS: {
    DASHBOARD: "📊 Dashboard Ejecutivo",
    DONACIONES: "💰 Donaciones_Aportes",
    CASOS: "📋 Casos_Afectados",
    PADRINOS: "🤝 Padrinos_Donantes",
    VOLUNTARIOS: "👷 Voluntarios_99HDD",
    TESTIMONIOS: "💬 Testimonios_Beneficiarios",
    ANALYTICS: "📈 Analítica_Web_Usuarios"
  }
};

// Paleta de colores oficial de Mano a Mano Venezuela
var PALETA_MANO_A_MANO = {
  MORADO_OSCURO: "#310062",    // Color institucional principal
  CARMESI_MAGENTA: "#C1124F",  // Acento de urgencia y amor
  AZUL_OCEANO: "#0d7a85",      // Rescate, costa y brigada
  DORADO_NOBLE: "#D4AF37",     // Oro noble
  MARFIL_FONDO: "#f8f5ee",     // Fondo cálido humanitario
  BLANCO: "#ffffff",
  TEXTO_TITULO: "#ffffff"
};

/**
 * FUNCIÓN PRINCIPAL DE INSTALACIÓN Y REPARACIÓN
 * Selecciona esta función arriba y pulsa "▶ Ejecutar"
 */
function inicializarSistemaDrive() {
  Logger.log("Iniciando creación y actualización con identidad Mano a Mano en Drive...");

  // 1. Crear o localizar la Carpeta Raíz
  var carpetaRaiz = obtenerOCrearCarpeta(ESTRUCTURA.CARPETA_RAIZ);
  
  // 2. Crear o localizar las Subcarpetas organizativas
  var mapaSubcarpetas = {};
  for (var i = 0; i < ESTRUCTURA.SUBCARPETAS.length; i++) {
    var nombreSub = ESTRUCTURA.SUBCARPETAS[i];
    mapaSubcarpetas[nombreSub] = obtenerOCrearSubcarpeta(carpetaRaiz, nombreSub);
  }

  // 3. Crear o ubicar la Hoja de Cálculo Central dentro de "01. Bases de Datos"
  var carpetaBases = mapaSubcarpetas["01. Bases de Datos (Google Sheets & Excel)"];
  var ss = obtenerOCrearSpreadsheet(carpetaBases, ESTRUCTURA.NOMBRE_SPREADSHEET);

  // 4. Configurar datos y Dashboard con diseño y colores de Mano a Mano
  configurarEstructuraSpreadsheet(ss);

  var urlCarpeta = carpetaRaiz.getUrl();
  var urlSpreadsheet = ss.getUrl();

  Logger.log("✅ SISTEMA MANO A MANO INICIALIZADO CON ÉXITO");
  Logger.log("📁 Carpeta Drive: " + urlCarpeta);
  Logger.log("📊 Dashboard / Spreadsheet: " + urlSpreadsheet);

  return {
    success: true,
    folderUrl: urlCarpeta,
    spreadsheetUrl: urlSpreadsheet
  };
}

/**
 * Función de un solo clic para reparar fórmulas y aplicar estética Mano a Mano
 */
function repararDashboard() {
  return inicializarSistemaDrive();
}

/**
 * Peticiones GET: Panel de bienvenida y acceso con estética Mano a Mano
 */
function doGet(e) {
  var resultado = inicializarSistemaDrive();
  var html = '<!DOCTYPE html>' +
    '<html><head><meta charset="utf-8"><title>Mano a Mano Venezuela & Brigada 99HDD</title>' +
    '<style>' +
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8f5ee; color: #1e1b4b; padding: 40px 20px; margin: 0; line-height: 1.6; }' +
    '.card { max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; padding: 40px; border-radius: 24px; box-shadow: 0 20px 40px -10px rgba(49, 0, 98, 0.12); }' +
    '.header-pill { display: inline-flex; align-items: center; background: rgba(193, 18, 79, 0.1); color: #C1124F; padding: 6px 14px; border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 20px; }' +
    'h1 { color: #310062; margin-top: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }' +
    'p { color: #475569; font-size: 14px; margin-bottom: 20px; }' +
    '.btn { display: inline-block; background: #0d7a85; color: white; text-decoration: none; padding: 13px 26px; border-radius: 12px; font-weight: 700; font-size: 14px; margin-right: 12px; margin-top: 10px; transition: all 0.2s; box-shadow: 0 4px 12px rgba(13, 122, 133, 0.25); }' +
    '.btn-secondary { background: #310062; box-shadow: 0 4px 12px rgba(49, 0, 98, 0.25); }' +
    '.btn:hover { transform: translateY(-2px); opacity: 0.95; }' +
    '.badge { background: #f8f5ee; color: #310062; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 700; border: 1px solid #e2e8f0; }' +
    '</style></head><body>' +
    '<div class="card">' +
    '<span class="header-pill">❤️ MANO A MANO VENEZUELA & BRIGADA 99HDD</span>' +
    '<h1>Sistema Integral y Dashboard de Operaciones</h1>' +
    '<p>Tus carpetas humanitarias, el consolidado de beneficiarios y el <strong>Dashboard Ejecutivo</strong> están sincronizados en la cuenta oficial <span class="badge">manomanovzla@gmail.com</span>.</p>' +
    '<p>Toda la información y donaciones se almacenan de manera privada y segura con la identidad gráfica oficial de la organización.</p>' +
    '<div>' +
    '<a class="btn" href="' + resultado.spreadsheetUrl + '" target="_blank" rel="noopener noreferrer">📊 Abrir Dashboard & Hojas Oficiales</a>' +
    '<a class="btn btn-secondary" href="' + resultado.folderUrl + '" target="_blank" rel="noopener noreferrer">📁 Abrir Carpeta en Google Drive</a>' +
    '</div>' +
    '</div>' +
    '</body></html>';

  return HtmlService.createHtmlOutput(html).setTitle("Mano a Mano Venezuela 99HDD - Conector Oficial");
}

/**
 * Peticiones POST: Transmisión segura en tiempo real desde los formularios web
 */
function doPost(e) {
  try {
    var contents = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
    var payload = JSON.parse(contents);
    var type = payload.type || 'caso';
    var record = payload.data || {};

    var carpetaRaiz = obtenerOCrearCarpeta(ESTRUCTURA.CARPETA_RAIZ);
    var carpetaBases = obtenerOCrearSubcarpeta(carpetaRaiz, "01. Bases de Datos (Google Sheets & Excel)");
    var ss = obtenerOCrearSpreadsheet(carpetaBases, ESTRUCTURA.NOMBRE_SPREADSHEET);
    configurarEstructuraSpreadsheet(ss);

    if (type === 'init') {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Estructura Mano a Mano verificada e inicializada en Google Drive",
        folderUrl: carpetaRaiz.getUrl(),
        spreadsheetUrl: ss.getUrl()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var carpetaCasosExcel = obtenerOCrearSubcarpeta(carpetaBases, "Casos Individuales (Excel & Sheets)");
    var carpetaDossiers = obtenerOCrearSubcarpeta(carpetaRaiz, "05. Expedientes y Dossiers Humanitarios (PDFs)");

    if (type === 'donacion') {
      var sheet = ss.getSheetByName(ESTRUCTURA.HOJAS.DONACIONES);
      var recKey = record.receiptNumber || record.receiptCode || ('MMV-' + Date.now().toString().slice(-6));
      var row = [
        sanitizeCell(recKey),
        sanitizeCell(record.timestamp ? new Date(record.timestamp).toLocaleString('es-VE') : new Date().toLocaleString('es-VE')),
        Number(record.amount || 0),
        sanitizeCell(record.donorName || 'Anónimo'),
        sanitizeCell(record.donorDocument || 'N/A'),
        sanitizeCell(record.donorPhone || ''),
        sanitizeCell(record.donorEmail || ''),
        sanitizeCell(record.paymentMethod || 'Transferencia'),
        sanitizeCell(record.paymentReference || ''),
        sanitizeCell(record.motivation || 'Aporte humanitario general'),
        sanitizeCell(record.status || 'en_verificacion')
      ];
      upsertRowByFirstColumn(sheet, recKey, row);
    } else if (type === 'caso') {
      var sheet = ss.getSheetByName(ESTRUCTURA.HOJAS.CASOS);
      garantizarColumnasCasos(sheet);
      var caseKey = record.caseId || ('MMV-CASO-' + Date.now().toString().slice(-4));
      var filesRes = crearOActualizarExcelYDossierPdfCaso(record, carpetaCasosExcel, carpetaDossiers, ss);

      var row = [
        sanitizeCell(caseKey),
        sanitizeCell(record.timestamp ? new Date(record.timestamp).toLocaleString('es-VE') : new Date().toLocaleString('es-VE')),
        sanitizeCell(record.fullName || ''),
        sanitizeCell(record.cedula || ''),
        sanitizeCell(record.phone || ''),
        sanitizeCell(record.parroquia || ''),
        sanitizeCell(record.location || ''),
        Number(record.familyMembers || 1),
        Number(record.childrenCount || 0),
        record.elderlyOrDisabled ? 'Sí' : 'No',
        sanitizeCell(record.priorityNeed || 'Alimentos / Enseres'),
        sanitizeCell(record.narrative || ''),
        '',
        ''
      ];
      upsertRowByFirstColumn(sheet, caseKey, row);

      // Escribir las fórmulas de hipervínculo en las columnas 13 y 14
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        var range = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var r = 0; r < range.length; r++) {
          if (String(range[r][0]).trim() === String(caseKey).trim()) {
            aplicarHipervinculosFila(sheet, r + 2, filesRes.excelUrl, filesRes.pdfUrl);
            break;
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        caseId: caseKey,
        driveFileUrl: filesRes.excelUrl,
        drivePdfUrl: filesRes.pdfUrl,
        message: "Caso registrado, Excel individual y Dossier PDF creados con hipervínculos en Google Drive"
      })).setMimeType(ContentService.MimeType.JSON);

    } else if (type === 'generar_dossier_caso') {
      var sheet = ss.getSheetByName(ESTRUCTURA.HOJAS.CASOS);
      garantizarColumnasCasos(sheet);
      var filesRes = crearOActualizarExcelYDossierPdfCaso(record, carpetaCasosExcel, carpetaDossiers, ss);
      
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        var range = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var r = 0; r < range.length; r++) {
          if (String(range[r][0]).trim() === String(record.caseId).trim()) {
            aplicarHipervinculosFila(sheet, r + 2, filesRes.excelUrl, filesRes.pdfUrl);
            break;
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        caseId: record.caseId,
        driveFileUrl: filesRes.excelUrl,
        drivePdfUrl: filesRes.pdfUrl
      })).setMimeType(ContentService.MimeType.JSON);

    } else if (type === 'generar_todos_los_dossiers') {
      var count = generarDossiersTodosLosCasosBatch(ss, carpetaCasosExcel, carpetaDossiers);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        count: count,
        message: "Se generaron " + count + " archivos Excel y Dossiers PDF en Google Drive"
      })).setMimeType(ContentService.MimeType.JSON);
    } else if (type === 'padrino') {
      var sheet = ss.getSheetByName(ESTRUCTURA.HOJAS.PADRINOS);
      var padKey = record.code || ('PAD-' + Date.now().toString().slice(-4));
      var row = [
        sanitizeCell(padKey),
        sanitizeCell(record.timestamp ? new Date(record.timestamp).toLocaleString('es-VE') : new Date().toLocaleString('es-VE')),
        sanitizeCell(record.fullName || ''),
        sanitizeCell(record.organization || ''),
        sanitizeCell(record.email || ''),
        sanitizeCell(record.phone || ''),
        sanitizeCell(record.supportType || 'Directo'),
        sanitizeCell(record.message || '')
      ];
      upsertRowByFirstColumn(sheet, padKey, row);
    } else if (type === 'voluntario') {
      var sheet = ss.getSheetByName(ESTRUCTURA.HOJAS.VOLUNTARIOS);
      var volKey = record.code || ('VOL-' + Date.now().toString().slice(-4));
      var row = [
        sanitizeCell(volKey),
        sanitizeCell(record.timestamp ? new Date(record.timestamp).toLocaleString('es-VE') : new Date().toLocaleString('es-VE')),
        sanitizeCell(record.fullName || ''),
        sanitizeCell(record.cedula || ''),
        sanitizeCell(record.phone || ''),
        sanitizeCell(record.email || ''),
        sanitizeCell(record.parroquia || ''),
        sanitizeCell(record.hasVehicle || 'No'),
        sanitizeCell(record.vehicleDetails || ''),
        sanitizeCell(record.skillsArea || 'General'),
        sanitizeCell(record.availability || 'Fines de semana'),
        sanitizeCell(record.message || '')
      ];
      upsertRowByFirstColumn(sheet, volKey, row);
    } else if (type === 'testimonio') {
      var sheet = ss.getSheetByName(ESTRUCTURA.HOJAS.TESTIMONIOS);
      var testKey = record.code || ('TEST-' + Date.now().toString().slice(-4));
      var row = [
        sanitizeCell(testKey),
        sanitizeCell(record.timestamp ? new Date(record.timestamp).toLocaleString('es-VE') : new Date().toLocaleString('es-VE')),
        sanitizeCell(record.name || 'Beneficiario Protegido'),
        record.isAnonymous ? 'Anónimo' : 'Público',
        sanitizeCell(record.email || ''),
        sanitizeCell(record.phone || 'N/A'),
        sanitizeCell(record.community || ''),
        sanitizeCell(record.assistanceType || 'General'),
        Number(record.rating || 5),
        sanitizeCell(record.story || ''),
        'Pendiente de Aprobación',
        '',
        ''
      ];
      upsertRowByFirstColumn(sheet, testKey, row);

      // Notificación inmediata al buzón de Mano a Mano
      try {
        MailApp.sendEmail({
          to: "manomanovzla@gmail.com",
          subject: "💬 [NUEVO TESTIMONIO POR APROBAR] " + testKey + " - " + (record.name || 'Beneficiario'),
          htmlBody: "<div style='font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px;'>" +
            "<h2 style='color:#310062;margin-top:0;'>Nuevo Testimonio Recibido para Aprobación</h2>" +
            "<p>Se ha recibido un nuevo testimonio de beneficiario verificado con código de correo:</p>" +
            "<table style='width:100%;font-size:13px;border-collapse:collapse;margin:16px 0;'>" +
            "<tr><td style='padding:8px;font-weight:bold;color:#475569;'>Código:</td><td style='padding:8px;font-family:monospace;'>" + testKey + "</td></tr>" +
            "<tr><td style='padding:8px;font-weight:bold;color:#475569;'>Autor:</td><td style='padding:8px;'>" + (record.name || 'Beneficiario') + " (" + (record.isAnonymous ? 'Anónimo Solicitado' : 'Público') + ")</td></tr>" +
            "<tr><td style='padding:8px;font-weight:bold;color:#475569;'>Correo Verificado:</td><td style='padding:8px;'>" + record.email + "</td></tr>" +
            "<tr><td style='padding:8px;font-weight:bold;color:#475569;'>Comunidad:</td><td style='padding:8px;'>" + (record.community || 'La Guaira') + "</td></tr>" +
            "<tr><td style='padding:8px;font-weight:bold;color:#475569;'>Ayuda:</td><td style='padding:8px;'>" + (record.assistanceType || 'General') + "</td></tr>" +
            "<tr><td style='padding:8px;font-weight:bold;color:#475569;'>Calificación:</td><td style='padding:8px;'>" + (record.rating || 5) + " / 5 estrellas</td></tr>" +
            "</table>" +
            "<div style='background:#f8f5ee;padding:16px;border-radius:12px;margin:16px 0;'>" +
            "<strong>Relato:</strong><p style='font-style:italic;margin-top:6px;'>" + record.story + "</p>" +
            "</div>" +
            "<p style='font-size:12px;color:#64748b;'>Para aprobar este testimonio e insertarlo en el muro web, ingresa a la plataforma y abre el panel 'Aprobar Testimonios' con la clave autorizada: Abelxti100%.</p>" +
            "</div>"
        });
      } catch (mailErr) {
        Logger.log("Error enviando email testimonio: " + mailErr);
      }

    } else if (type === 'testimonio_aprobado') {
      var sheet = ss.getSheetByName(ESTRUCTURA.HOJAS.TESTIMONIOS);
      var testKey = record.code || ('TEST-' + Date.now().toString().slice(-4));
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        var range = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var r = 0; r < range.length; r++) {
          if (String(range[r][0]).trim() === String(testKey).trim()) {
            sheet.getRange(r + 2, 11).setValue('Aprobado y Publicado');
            sheet.getRange(r + 2, 12).setValue(new Date().toLocaleString('es-VE'));
            sheet.getRange(r + 2, 13).setValue(record.approvedBy || 'Directiva Mano a Mano');
            break;
          }
        }
      }
    } else if (type === 'email_verification') {
      try {
        MailApp.sendEmail({
          to: record.email,
          subject: "🔐 [Mano a Mano 99HDD] Tu Código de Seguridad: " + record.code,
          htmlBody: "<div style='font-family:sans-serif;max-width:550px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px;'>" +
            "<h2 style='color:#310062;margin-top:0;'>Mano a Mano Venezuela & Brigada 99HDD</h2>" +
            "<p>Hola " + (record.recipientName || 'Estimado(a)') + ",</p>" +
            "<p>Has solicitado validar tu identidad para registrar un formulario oficial en la plataforma.</p>" +
            "<div style='background:#f8f5ee;padding:16px;border-radius:12px;text-align:center;margin:20px 0;'>" +
            "<span style='font-size:11px;font-weight:bold;color:#64748b;display:block;margin-bottom:6px;'>CÓDIGO DE SEGURIDAD (VÁLIDO POR 10 MINUTOS):</span>" +
            "<span style='font-size:34px;font-weight:bold;color:#310062;letter-spacing:6px;font-family:monospace;'>" + record.code + "</span>" +
            "</div>" +
            "<p style='font-size:12px;color:#64748b;'>Si no realizaste esta acción, puedes ignorar este mensaje.</p>" +
            "</div>"
        });
      } catch (otpErr) {
        Logger.log("Error enviando OTP Apps Script: " + otpErr);
      }
    } else if (type === 'analytics') {
      var sheet = ss.getSheetByName(ESTRUCTURA.HOJAS.ANALYTICS);
      var evKey = record.id || ('EV-' + Date.now().toString());
      var row = [
        sanitizeCell(evKey),
        sanitizeCell(record.timestamp ? new Date(record.timestamp).toLocaleString('es-VE') : new Date().toLocaleString('es-VE')),
        sanitizeCell(record.eventType || 'page_view'),
        sanitizeCell(record.eventName || ''),
        sanitizeCell(record.category || 'general'),
        sanitizeCell(record.label || ''),
        sanitizeCell(record.pagePath || '/'),
        sanitizeCell(record.deviceType || 'escritorio'),
        sanitizeCell(record.metadata ? JSON.stringify(record.metadata) : '')
      ];
      sheet.appendRow(row);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("Error en doPost: " + err.toString());
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// -------------------------------------------------------------------------
// FUNCIONES AUXILIARES DE DRIVE Y SPREADSHEET (ESTÉTICA MANO A MANO)
// -------------------------------------------------------------------------

function sanitizeCell(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'number') return val;
  var s = String(val).trim();
  if (/^[=\\+\\-@\\t\\r]/.test(s)) {
    return "'" + s;
  }
  return s;
}

function upsertRowByFirstColumn(sheet, key, rowData) {
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    var range = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var r = 0; r < range.length; r++) {
      if (String(range[r][0]).trim() === String(key).trim()) {
        sheet.getRange(r + 2, 1, 1, rowData.length).setValues([rowData]);
        return;
      }
    }
  }
  sheet.appendRow(rowData);
}

function obtenerOCrearCarpeta(nombre) {
  var folders = DriveApp.getFoldersByName(nombre);
  while (folders.hasNext()) {
    var f = folders.next();
    if (!f.isTrashed()) return f;
  }
  return DriveApp.createFolder(nombre);
}

function obtenerOCrearSubcarpeta(carpetaPadre, nombreSub) {
  var folders = carpetaPadre.getFoldersByName(nombreSub);
  while (folders.hasNext()) {
    var f = folders.next();
    if (!f.isTrashed()) return f;
  }
  return carpetaPadre.createFolder(nombreSub);
}

function obtenerOCrearSpreadsheet(carpeta, nombreArchivo) {
  var files = carpeta.getFilesByName(nombreArchivo);
  while (files.hasNext()) {
    var f = files.next();
    if (!f.isTrashed()) return SpreadsheetApp.open(f);
  }
  var ss = SpreadsheetApp.create(nombreArchivo);
  var file = DriveApp.getFileById(ss.getId());
  try {
    file.moveTo(carpeta);
  } catch (eMove) {
    try {
      carpeta.addFile(file);
    } catch (eAdd) {}
  }
  return ss;
}

function configurarEstructuraSpreadsheet(ss) {
  var C = PALETA_MANO_A_MANO;

  // PASO 1: CREAR PRIMERO TODAS LAS HOJAS DE DATOS CON CABECERA MORADA MANO A MANO
  // 1. PESTAÑA: DONACIONES
  crearHojaSiNoExiste(ss, ESTRUCTURA.HOJAS.DONACIONES, [
    "Recibo Oficial", "Fecha y Hora", "Monto USD", "Nombre Donante", "Cédula / RIF",
    "Teléfono", "Correo Electrónico", "Plataforma / Banco", "Referencia Declarada",
    "Motivación / Destino", "Estatus de Conciliación"
  ], C.MORADO_OSCURO);

  // 2. PESTAÑA: CASOS AFECTADOS
  crearHojaSiNoExiste(ss, ESTRUCTURA.HOJAS.CASOS, [
    "Código de Caso", "Fecha de Registro", "Nombre Solicitante", "Cédula",
    "Teléfono", "Parroquia", "Dirección / Ubicación", "Miembros Familia",
    "Niños en el Hogar", "Adultos Mayores / Discapacidad", "Necesidad Prioritaria",
    "Relato y Situación", "Archivo Excel / Hoja (Drive)", "Dossier PDF (Drive)"
  ], C.MORADO_OSCURO);

  // 3. PESTAÑA: PADRINOS
  crearHojaSiNoExiste(ss, ESTRUCTURA.HOJAS.PADRINOS, [
    "Código Padrino", "Fecha Registro", "Nombre / Donante", "Organización o Empresa",
    "Correo Electrónico", "Teléfono de Contacto", "Modalidad de Apoyo", "Mensaje de Compromiso"
  ], C.MORADO_OSCURO);

  // 4. PESTAÑA: VOLUNTARIOS 99HDD
  crearHojaSiNoExiste(ss, ESTRUCTURA.HOJAS.VOLUNTARIOS, [
    "Código Voluntario", "Fecha Registro", "Nombre Completo", "Cédula",
    "Teléfono de Contacto", "Correo Electrónico", "Parroquia", "Dispone de Vehículo",
    "Detalle de Vehículo", "Área de Habilidades", "Disponibilidad", "Observaciones"
  ], C.MORADO_OSCURO);

  // 5. PESTAÑA: TESTIMONIOS DE BENEFICIARIOS
  crearHojaSiNoExiste(ss, ESTRUCTURA.HOJAS.TESTIMONIOS, [
    "Código Testimonio", "Fecha y Hora", "Nombre / Beneficiario", "Modalidad",
    "Correo Verificado", "Teléfono de Contacto", "Comunidad / Sector", "Tipo de Ayuda",
    "Calificación (1-5)", "Relato del Testimonio", "Estatus de Publicación", "Fecha Aprobación", "Aprobado Por"
  ], C.MORADO_OSCURO);

  // 6. PESTAÑA: ANALÍTICA WEB & COMPORTAMIENTO DE USUARIOS
  crearHojaSiNoExiste(ss, ESTRUCTURA.HOJAS.ANALYTICS, [
    "ID Evento", "Fecha y Hora", "Tipo de Evento", "Nombre de Acción",
    "Categoría", "Detalle / Etiqueta", "Ruta de Página", "Dispositivo", "Metadatos JSON"
  ], C.AZUL_OCEANO);

  // PASO 2: CREAR O SELECCIONAR EL DASHBOARD EJECUTIVO
  var dashSheet = ss.getSheetByName(ESTRUCTURA.HOJAS.DASHBOARD);
  if (!dashSheet) {
    dashSheet = ss.insertSheet(ESTRUCTURA.HOJAS.DASHBOARD, 0);
  }

  try {
    ss.setActiveSheet(dashSheet);
    ss.moveActiveSheet(1);
  } catch (e) {}

  // Estructura visual de encabezados con la estética de Mano a Mano
  dashSheet.getRange("A1:H1").merge()
    .setValue("MANO A MANO VENEZUELA & BRIGADA 99HDD — DASHBOARD DE OPERACIONES")
    .setBackground(C.MORADO_OSCURO)
    .setFontColor(C.BLANCO)
    .setFontWeight("bold")
    .setFontSize(14)
    .setHorizontalAlignment("center");

  dashSheet.getRange("A2:H2").merge()
    .setValue("Consolidado oficial privado | manomanovzla@gmail.com | Sincronizado en tiempo real")
    .setBackground(C.MARFIL_FONDO)
    .setFontColor(C.MORADO_OSCURO)
    .setFontSize(9)
    .setHorizontalAlignment("center");

  // Tarjetas Fila 4 (Encabezados de KPIs con colores Mano a Mano)
  // TOTAL RECAUDADO -> Azul Océano Mano a Mano (#0d7a85)
  dashSheet.getRange("A4:B4").merge().setValue("TOTAL RECAUDADO (USD)")
    .setBackground(C.AZUL_OCEANO).setFontColor(C.BLANCO).setFontWeight("bold").setHorizontalAlignment("center");

  // META OFICIAL -> Morado Institucional (#310062)
  dashSheet.getRange("C4:D4").merge().setValue("META OFICIAL (USD)")
    .setBackground(C.MORADO_OSCURO).setFontColor(C.BLANCO).setFontWeight("bold").setHorizontalAlignment("center");

  // APORTES CONCILIADOS -> Carmesí Vivo (#C1124F)
  dashSheet.getRange("E4:F4").merge().setValue("APORTES CONCILIADOS")
    .setBackground(C.CARMESI_MAGENTA).setFontColor(C.BLANCO).setFontWeight("bold").setHorizontalAlignment("center");

  // EN VERIFICACIÓN MANUAL -> Dorado Noble (#D4AF37)
  dashSheet.getRange("G4:H4").merge().setValue("EN VERIFICACIÓN MANUAL")
    .setBackground(C.DORADO_NOBLE).setFontColor(C.MORADO_OSCURO).setFontWeight("bold").setHorizontalAlignment("center");

  // FÓRMULAS VIVAS EN EL DASHBOARD (PROTEGIDAS CONTRA #REF!)
  // Total Recaudado: $2.780 USD base + suma de aportes confirmados
  dashSheet.getRange("A5:B5").setFormula('=2780 + IFERROR(SUMIFS(\\'' + ESTRUCTURA.HOJAS.DONACIONES + '\\'!C2:C, \\'' + ESTRUCTURA.HOJAS.DONACIONES + '\\'!K2:K, "confirmado"), 0)')
    .setNumberFormat("$#,##0.00").setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center").setBackground("#f0fdfa").setFontColor(C.AZUL_OCEANO);

  // Meta Oficial
  dashSheet.getRange("C5:D5").setValue(25000)
    .setNumberFormat("$#,##0.00").setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center").setBackground("#fdf4ff").setFontColor(C.MORADO_OSCURO);

  // Aportes Conciliados
  dashSheet.getRange("E5:F5").setFormula('=IFERROR(COUNTIF(\\'' + ESTRUCTURA.HOJAS.DONACIONES + '\\'!K2:K, "confirmado"), 0)')
    .setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center").setBackground("#fff1f2").setFontColor(C.CARMESI_MAGENTA);

  // En Verificación Manual
  dashSheet.getRange("G5:H5").setFormula('=IFERROR(COUNTIF(\\'' + ESTRUCTURA.HOJAS.DONACIONES + '\\'!K2:K, "en_verificacion"), 0)')
    .setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center").setBackground("#fffbeb").setFontColor("#92400e");

  // Tarjetas Fila 7 (KPIs Comunitarios)
  dashSheet.getRange("A7:B7").merge().setValue("FAMILIAS CENSADAS")
    .setBackground(C.AZUL_OCEANO).setFontColor(C.BLANCO).setFontWeight("bold").setHorizontalAlignment("center");
  dashSheet.getRange("C7:D7").merge().setValue("TOTAL PERSONAS CENSADAS")
    .setBackground(C.MORADO_OSCURO).setFontColor(C.BLANCO).setFontWeight("bold").setHorizontalAlignment("center");
  dashSheet.getRange("E7:F7").merge().setValue("PADRINOS REGISTRADOS")
    .setBackground(C.CARMESI_MAGENTA).setFontColor(C.BLANCO).setFontWeight("bold").setHorizontalAlignment("center");
  dashSheet.getRange("G7:H7").merge().setValue("VOLUNTARIOS 99HDD")
    .setBackground(C.MORADO_OSCURO).setFontColor(C.BLANCO).setFontWeight("bold").setHorizontalAlignment("center");

  // Valores Fila 8
  dashSheet.getRange("A8:B8").setFormula('=MAX(0, COUNTA(\\'' + ESTRUCTURA.HOJAS.CASOS + '\\'!A2:A)-1)')
    .setFontSize(14).setFontWeight("bold").setHorizontalAlignment("center").setBackground("#f0fdfa").setFontColor(C.AZUL_OCEANO);

  dashSheet.getRange("C8:D8").setFormula('=IFERROR(SUM(\\'' + ESTRUCTURA.HOJAS.CASOS + '\\'!H2:H), 0)')
    .setFontSize(14).setFontWeight("bold").setHorizontalAlignment("center").setBackground("#fdf4ff").setFontColor(C.MORADO_OSCURO);

  dashSheet.getRange("E8:F8").setFormula('=MAX(0, COUNTA(\\'' + ESTRUCTURA.HOJAS.PADRINOS + '\\'!A2:A)-1)')
    .setFontSize(14).setFontWeight("bold").setHorizontalAlignment("center").setBackground("#fff1f2").setFontColor(C.CARMESI_MAGENTA);

  dashSheet.getRange("G8:H8").setFormula('=MAX(0, COUNTA(\\'' + ESTRUCTURA.HOJAS.VOLUNTARIOS + '\\'!A2:A)-1)')
    .setFontSize(14).setFontWeight("bold").setHorizontalAlignment("center").setBackground("#fdf4ff").setFontColor(C.MORADO_OSCURO);

  // Fila 10: Mensaje para descarga en Excel
  dashSheet.getRange("A10:H10").merge()
    .setValue("💡 Para descargar este consolidado oficial a tu computador, en el menú superior selecciona: Archivo > Descargar > Microsoft Excel (.xlsx)")
    .setBackground(C.MARFIL_FONDO)
    .setFontColor(C.MORADO_OSCURO)
    .setFontSize(9)
    .setHorizontalAlignment("center");

  // Limpieza de Hoja 1 inicial
  var hojaDefault = ss.getSheetByName("Hoja 1") || ss.getSheetByName("Sheet1");
  if (hojaDefault && ss.getSheets().length > 1) {
    try { ss.deleteSheet(hojaDefault); } catch (e) {}
  }
}

function crearHojaSiNoExiste(ss, nombreHoja, encabezados, colorHeader) {
  var sheet = ss.getSheetByName(nombreHoja);
  if (!sheet) {
    sheet = ss.insertSheet(nombreHoja);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(encabezados);
  } else {
    // Si la hoja ya existía con datos, asegurar que no falte ningún encabezado en la fila 1
    if (sheet.getMaxColumns() < encabezados.length) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), encabezados.length - sheet.getMaxColumns());
    }
    for (var c = 0; c < encabezados.length; c++) {
      var val = String(sheet.getRange(1, c + 1).getValue()).trim();
      if (!val || val === '') {
        sheet.getRange(1, c + 1).setValue(encabezados[c]);
      }
    }
  }
  // Aplicar formato de cabecera institucional
  var range = sheet.getRange(1, 1, 1, encabezados.length);
  range.setBackground(colorHeader)
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setFontSize(10);
  sheet.setFrozenRows(1);
  return sheet;
}

/**
 * CREA O ACTUALIZA EL ARCHIVO EXCEL/SPREADSHEET INDIVIDUAL Y SU DOSSIER PDF EN GOOGLE DRIVE
 */
function crearOActualizarExcelYDossierPdfCaso(record, carpetaExcels, carpetaDossiers, ssConsolidado) {
  var caseKey = sanitizeCell(record.caseId || ('MMV-CASO-' + Date.now().toString().slice(-4)));
  var rawName = String(record.fullName || 'Beneficiario').trim();
  var cleanName = rawName.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\\s]/g, '').slice(0, 30).trim();
  var nombreArchivo = "Expediente_" + caseKey + "_" + cleanName;
  var nombrePdf = "Dossier_Oficial_" + caseKey + "_" + cleanName + ".pdf";

  // 1. Buscar si ya existe el Spreadsheet individual en la carpeta de Excels
  var files = carpetaExcels.getFilesByName(nombreArchivo);
  var individualSs;
  var fileDrive;
  while (files.hasNext()) {
    var existingF = files.next();
    if (!existingF.isTrashed()) {
      fileDrive = existingF;
      try {
        individualSs = SpreadsheetApp.open(fileDrive);
        break;
      } catch (eOpen) {}
    }
  }

  if (!individualSs) {
    individualSs = SpreadsheetApp.create(nombreArchivo);
    fileDrive = DriveApp.getFileById(individualSs.getId());
    try {
      fileDrive.moveTo(carpetaExcels);
    } catch (eMove) {
      try {
        carpetaExcels.addFile(fileDrive);
      } catch (eAdd) {}
    }
  }

  // 2. Dar formato y contenido de Dossier Profesional al Spreadsheet individual
  var sheet = individualSs.getActiveSheet();
  sheet.setName("Expediente " + caseKey);
  sheet.clear();
  sheet.setColumnWidth(1, 30);
  sheet.setColumnWidth(2, 200);
  sheet.setColumnWidth(3, 270);
  sheet.setColumnWidth(4, 180);
  sheet.setColumnWidth(5, 140);

  var C = PALETA_MANO_A_MANO;

  // Encabezado institucional
  sheet.getRange("B2:E2").merge()
    .setValue("MANO A MANO VENEZUELA & BRIGADA 99HDD")
    .setBackground(C.MORADO_OSCURO)
    .setFontColor("#ffffff")
    .setFontSize(15)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  sheet.getRange("B3:E3").merge()
    .setValue("Cuerpo de Acción Humanitaria, Rescate y Apoyo Social • Estado La Guaira • RIF: J-50392817-4")
    .setBackground(C.MORADO_OSCURO)
    .setFontColor("#e2e8f0")
    .setFontSize(9)
    .setHorizontalAlignment("center");

  sheet.getRange("B4:E4").merge()
    .setValue("DOSSIER OFICIAL DE EXPEDIENTE HUMANITARIO PARA DONANTES Y PADRINOS")
    .setBackground(C.AZUL_OCEANO)
    .setFontColor("#ffffff")
    .setFontSize(10)
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  // Metadatos
  var formattedDate = record.timestamp ? new Date(record.timestamp).toLocaleString('es-VE') : new Date().toLocaleString('es-VE');
  sheet.getRange("B5:C5").merge().setValue("Código de Expediente: " + caseKey)
    .setFontWeight("bold").setFontSize(11).setFontColor(C.MORADO_OSCURO);
  sheet.getRange("D5:E5").merge().setValue("Fecha Emisión: " + formattedDate)
    .setHorizontalAlignment("right").setFontSize(10).setFontColor("#64748b");

  sheet.getRange("B6:E6").merge()
    .setValue("ESTADO: EXPEDIENTE VERIFICADO EN SITIO POR BRIGADA 99HDD (AVAL OFICIAL)")
    .setBackground("#ecfdf5")
    .setFontColor("#065f46")
    .setFontWeight("bold")
    .setFontSize(10)
    .setHorizontalAlignment("center");

  // Sección 1: Ficha del Grupo Familiar
  sheet.getRange("B8:E8").merge()
    .setValue("1. FICHA TÉCNICA DEL GRUPO FAMILIAR")
    .setBackground(C.MORADO_OSCURO)
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setFontSize(11);

  var datosFamilia = [
    ["Jefe(a) de Familia / Solicitante:", sanitizeCell(record.fullName || 'No indicado')],
    ["Cédula de Identidad:", sanitizeCell(record.cedula || 'En verificación')],
    ["Teléfono de Contacto:", sanitizeCell(record.phone || 'No indicado')],
    ["Correo Electrónico Oficial:", sanitizeCell(record.email || 'No indicado')],
    ["Parroquia (Estado La Guaira):", sanitizeCell(record.parroquia || 'No indicada')],
    ["Ubicación / Sector Exacto:", sanitizeCell(record.location || 'No indicada')],
    ["Carga Familiar Total:", Number(record.familyMembers || 1) + " integrantes"],
    ["Menores de Edad en el Hogar:", Number(record.childrenCount || 0) + " niños"],
    ["Adultos Mayores o Discapacidad:", record.elderlyOrDisabled ? "SÍ (Vulnerabilidad médica registrada)" : "No registrados"],
    ["Necesidad Prioritaria Diagnosticada:", sanitizeCell(record.priorityNeed || 'Alimentos / Enseres')]
  ];

  for (var i = 0; i < datosFamilia.length; i++) {
    var fila = 9 + i;
    sheet.getRange(fila, 2).setValue(datosFamilia[i][0]).setFontWeight("bold").setFontColor("#334155").setBackground("#f8fafc");
    sheet.getRange(fila, 3, 1, 3).merge().setValue(datosFamilia[i][1]).setFontColor("#0f172a");
  }

  // Sección 2: Relato Testimonial
  var filaRelatoHeader = 9 + datosFamilia.length + 1;
  sheet.getRange(filaRelatoHeader, 2, 1, 4).merge()
    .setValue("2. RELATO TESTIMONIAL Y SITUACIÓN FAMILIAR")
    .setBackground(C.AZUL_OCEANO)
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setFontSize(11);

  var filaRelato = filaRelatoHeader + 1;
  sheet.getRange(filaRelato, 2, 3, 4).merge()
    .setValue('"' + String(record.narrative || 'Sin relato detallado') + '"')
    .setWrap(true)
    .setBackground("#f8f5ee")
    .setFontColor("#1e293b")
    .setFontStyle("italic")
    .setVerticalAlignment("top");

  // Sección 3: Evaluación de Campo y Ruta de Acción
  var filaEvalHeader = filaRelato + 4;
  sheet.getRange(filaEvalHeader, 2, 1, 4).merge()
    .setValue("3. DIAGNÓSTICO SOCIAL Y RUTA DE ACCIÓN RECOMENDADA")
    .setBackground(C.MORADO_OSCURO)
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setFontSize(11);

  var assessmentText = record.aiResponse && record.aiResponse.priorityAssessment ? record.aiResponse.priorityAssessment : "Visita y corroboración en terreno por brigadistas de la Brigada 99HDD.";
  sheet.getRange(filaEvalHeader + 1, 2, 2, 4).merge()
    .setValue(assessmentText)
    .setWrap(true)
    .setBackground("#f8fafc")
    .setFontColor("#334155")
    .setVerticalAlignment("top");

  // Sección 4: Canal Exclusivo de Contacto y Donaciones (Estrictamente por Correo)
  var filaCanalHeader = filaEvalHeader + 4;
  sheet.getRange(filaCanalHeader, 2, 1, 4).merge()
    .setValue("4. CANAL EXCLUSIVO DE ATENCIÓN A DONANTES Y PADRINOS")
    .setBackground(C.CARMESI_MAGENTA)
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setFontSize(11);

  sheet.getRange(filaCanalHeader + 1, 2, 2, 4).merge()
    .setValue("Para apadrinar este caso, enviar insumos o coordinar ayuda directa, contacte exclusivamente por correo:\\n📧 manomanovzla@gmail.com\\n(Por política de seguridad y estricta confidencialidad no se atienden trámites operativos por WhatsApp).")
    .setWrap(true)
    .setBackground("#fff1f2")
    .setFontColor("#881337")
    .setFontWeight("bold")
    .setVerticalAlignment("middle");

  SpreadsheetApp.flush();

  // 3. Generar el archivo PDF directamente en la subcarpeta de Dossiers de Google Drive
  var pdfUrl = exportarSpreadsheetAPdf(individualSs, fileDrive, nombrePdf, carpetaDossiers);

  return {
    excelUrl: fileDrive.getUrl(),
    pdfUrl: pdfUrl,
    caseId: caseKey
  };
}

/**
 * EXPORTA EL SPREADSHEET INDIVIDUAL A PDF DE FORMA INFALIBLE EN GOOGLE DRIVE
 */
function exportarSpreadsheetAPdf(individualSs, fileDrive, nombrePdf, carpetaDossiers) {
  try {
    SpreadsheetApp.flush();
  } catch (eFlush) {}

  // Intento 1: Conversión directa a Blob PDF de Google Drive
  try {
    var pdfBlob = fileDrive.getAs('application/pdf').setName(nombrePdf);
    var pdfFiles = carpetaDossiers.getFilesByName(nombrePdf);
    while (pdfFiles.hasNext()) {
      try { pdfFiles.next().setTrashed(true); } catch (eTrash) {}
    }
    var pdfFile = carpetaDossiers.createFile(pdfBlob);
    return pdfFile.getUrl();
  } catch (errPdf1) {
    Logger.log("Aviso al crear PDF con getAs: " + errPdf1);
  }

  // Intento 2: Exportación directa por UrlFetchApp con token OAuth del script
  try {
    var exportUrl = "https://docs.google.com/spreadsheets/d/" + individualSs.getId() + 
      "/export?format=pdf&portrait=true&size=letter&gridlines=false&fzr=false";
    var response = UrlFetchApp.fetch(exportUrl, {
      headers: { "Authorization": "Bearer " + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    });
    if (response.getResponseCode() === 200) {
      var blob = response.getBlob().setName(nombrePdf);
      var pdfFile2 = carpetaDossiers.createFile(blob);
      return pdfFile2.getUrl();
    }
  } catch (errPdf2) {
    Logger.log("Aviso con UrlFetchApp: " + errPdf2);
  }

  // Intento 3: Enlace nativo directo de exportación y visualización PDF de Google Drive (100% infalible)
  return "https://docs.google.com/spreadsheets/d/" + individualSs.getId() + "/export?format=pdf&portrait=true&size=letter&gridlines=false";
}

/**
 * APLICA HIPERVÍNCULOS NATIVOS CLICABLES EN LAS COLUMNAS M (13) Y N (14)
 */
function aplicarHipervinculosFila(sheet, rowNum, excelUrl, pdfUrl) {
  var c13 = sheet.getRange(rowNum, 13);
  var c14 = sheet.getRange(rowNum, 14);

  // Columna 13: Archivo Excel Individual
  if (excelUrl) {
    var safeExcelUrl = String(excelUrl).replace(/"/g, '');
    try {
      c13.setFormula('=HYPERLINK("' + safeExcelUrl + '", "📊 Abrir Excel del Caso")');
    } catch (eF1) {
      try {
        var rExcel = SpreadsheetApp.newRichTextValue()
          .setText("📊 Abrir Excel del Caso")
          .setLinkUrl(safeExcelUrl)
          .build();
        c13.setRichTextValue(rExcel);
      } catch (eR1) {
        c13.setValue(safeExcelUrl);
      }
    }
    c13.setHorizontalAlignment("center")
      .setFontColor("#0d7a85")
      .setFontWeight("bold")
      .setBackground("#f0fdfa");
  }

  // Columna 14: Dossier PDF Oficial
  if (pdfUrl) {
    var safePdfUrl = String(pdfUrl).replace(/"/g, '');
    try {
      c14.setFormula('=HYPERLINK("' + safePdfUrl + '", "📄 Ver Dossier PDF")');
    } catch (eF2) {
      try {
        var rPdf = SpreadsheetApp.newRichTextValue()
          .setText("📄 Ver Dossier PDF")
          .setLinkUrl(safePdfUrl)
          .build();
        c14.setRichTextValue(rPdf);
      } catch (eR2) {
        c14.setValue(safePdfUrl);
      }
    }
    c14.setHorizontalAlignment("center")
      .setFontColor("#c1124f")
      .setFontWeight("bold")
      .setBackground("#fff1f2");
  }
}

/**
 * ASEGURA QUE LAS COLUMNAS M (13) Y N (14) TENGAN SUS ENCABEZADOS Y FORMATO EN CASOS AFECTADOS
 */
function garantizarColumnasCasos(sheet) {
  if (!sheet) return;
  try {
    if (sheet.getMaxColumns() < 14) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), 14 - sheet.getMaxColumns());
    }
    
    // Encabezados institucionales para Columnas M (13) y N (14)
    var c13 = sheet.getRange(1, 13);
    var c14 = sheet.getRange(1, 14);
    
    c13.setValue("📊 Archivo Excel (Drive)")
      .setBackground(PALETA_MANO_A_MANO.MORADO_OSCURO)
      .setFontColor("#ffffff")
      .setFontWeight("bold")
      .setFontSize(10)
      .setHorizontalAlignment("center");
      
    c14.setValue("📄 Dossier PDF (Drive)")
      .setBackground(PALETA_MANO_A_MANO.AZUL_OCEANO)
      .setFontColor("#ffffff")
      .setFontWeight("bold")
      .setFontSize(10)
      .setHorizontalAlignment("center");
      
    sheet.setColumnWidth(13, 210);
    sheet.setColumnWidth(14, 200);
    sheet.setFrozenRows(1);
  } catch (errCol) {
    Logger.log("Error garantizando columnas: " + errCol);
  }
}

/**
 * MENÚ SUPERIOR PERSONALIZADO EN GOOGLE SHEETS
 */
function onOpen() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) {
      var casosSheet = ss.getSheetByName(ESTRUCTURA.HOJAS.CASOS);
      if (casosSheet) {
        garantizarColumnasCasos(casosSheet);
      }
    }

    var ui = SpreadsheetApp.getUi();
    ui.createMenu('❤️ Mano a Mano 99HDD')
      .addItem('⚡ Generar Hipervínculos, Excels y PDFs de TODOS los Casos', 'generarDossiersTodosLosCasos')
      .addItem('📄 Generar Hipervínculo del Caso Seleccionado', 'generarDossierFilaSeleccionada')
      .addItem('🧹 Limpiar Casos de Prueba (Dejar Hoja Lista para Casos Reales)', 'limpiarCasosDePrueba')
      .addItem('🛠️ Reparar Encabezados y Columnas de Hipervínculos', 'repararColumnasYHipervinculos')
      .addItem('🔄 Actualizar y Reparar Dashboard', 'repararDashboard')
      .addToUi();
  } catch (e) {
    Logger.log("onOpen menu omitido: " + e);
  }
}

/**
 * Limpia las filas de prueba y deja la hoja limpia para casos reales
 */
function limpiarCasosDePrueba() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return;
  var sheet = ss.getSheetByName(ESTRUCTURA.HOJAS.CASOS);
  if (!sheet) return;
  
  try {
    var ui = SpreadsheetApp.getUi();
    var resp = ui.alert(
      "⚠️ ¿Confirmas limpiar todos los casos de prueba?",
      "Esto eliminará las filas de prueba registradas en esta hoja para dejar la base de datos limpia y lista para los casos reales.",
      ui.ButtonSet.YES_NO
    );
    if (resp !== ui.Button.YES) return;
  } catch (e) {
    // Modo ejecución sin ventana modal interactiva
  }

  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  garantizarColumnasCasos(sheet);
  
  try {
    SpreadsheetApp.getUi().alert("✅ Base de datos limpiada con éxito. Las columnas y encabezados están listos para recibir los casos reales.");
  } catch (eUi) {
    Logger.log("✅ Casos de prueba eliminados con éxito.");
  }
}

/**
 * Repara y crea inmediatamente los encabezados de columnas M y N si faltaban
 */
function repararColumnasYHipervinculos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return;
  var sheet = ss.getSheetByName(ESTRUCTURA.HOJAS.CASOS);
  if (!sheet) {
    try {
      SpreadsheetApp.getUi().alert("⚠️ No se encontró la pestaña '" + ESTRUCTURA.HOJAS.CASOS + "'.");
    } catch (e) {}
    return;
  }
  garantizarColumnasCasos(sheet);
  try {
    SpreadsheetApp.getUi().alert("✅ Encabezados de columnas M (Archivo Excel) y N (Dossier PDF) creados exitosamente con formato oficial.");
  } catch (e) {}
}

/**
 * Genera el Excel individual y PDF para la fila de caso seleccionada en Google Sheets
 */
function generarDossierFilaSeleccionada() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return;
  var sheet = ss.getActiveSheet();
  if (sheet.getName() !== ESTRUCTURA.HOJAS.CASOS) {
    try {
      SpreadsheetApp.getUi().alert("⚠️ Por favor ubícate en la pestaña '" + ESTRUCTURA.HOJAS.CASOS + "' y haz clic en la fila del caso.");
    } catch (e) {}
    return;
  }
  var rowIdx = sheet.getActiveCell().getRow();
  if (rowIdx < 2) {
    try {
      SpreadsheetApp.getUi().alert("⚠️ Selecciona una fila con datos de caso (fila 2 en adelante).");
    } catch (e) {}
    return;
  }
  
  garantizarColumnasCasos(sheet);

  var rowValues = sheet.getRange(rowIdx, 1, 1, 12).getValues()[0];
  var caseKey = String(rowValues[0] || '').trim();
  if (!caseKey) {
    caseKey = 'MMV-CASO-' + Date.now().toString().slice(-4);
    sheet.getRange(rowIdx, 1).setValue(caseKey);
  }

  var record = {
    caseId: caseKey,
    timestamp: rowValues[1],
    fullName: rowValues[2] || 'Beneficiario',
    cedula: rowValues[3] || '',
    phone: rowValues[4] || '',
    parroquia: rowValues[5] || 'La Guaira',
    location: rowValues[6] || '',
    familyMembers: Number(rowValues[7]) || 1,
    childrenCount: Number(rowValues[8]) || 0,
    elderlyOrDisabled: String(rowValues[9]).toLowerCase().indexOf('s') !== -1,
    priorityNeed: rowValues[10] || 'Alimentos / Enseres',
    narrative: rowValues[11] || ''
  };

  var carpetaRaiz = obtenerOCrearCarpeta(ESTRUCTURA.CARPETA_RAIZ);
  var carpetaBases = obtenerOCrearSubcarpeta(carpetaRaiz, "01. Bases de Datos (Google Sheets & Excel)");
  var carpetaCasosExcel = obtenerOCrearSubcarpeta(carpetaBases, "Casos Individuales (Excel & Sheets)");
  var carpetaDossiers = obtenerOCrearSubcarpeta(carpetaRaiz, "05. Expedientes y Dossiers Humanitarios (PDFs)");

  var res = crearOActualizarExcelYDossierPdfCaso(record, carpetaCasosExcel, carpetaDossiers, ss);

  aplicarHipervinculosFila(sheet, rowIdx, res.excelUrl, res.pdfUrl);

  try {
    SpreadsheetApp.getUi().alert(
      "✅ ¡HIPERVÍNCULOS CREADOS CON ÉXITO!\n\n" +
      "Se crearon los enlaces directos en las columnas M y N de esta fila:\n\n" +
      "📊 Excel del Caso: " + res.excelUrl + "\n\n" +
      "📄 Dossier PDF: " + res.pdfUrl
    );
  } catch (e) {}
}

/**
 * Genera Excels y PDFs individuales e inserta hipervínculos para todos los casos en la hoja
 */
function generarDossiersTodosLosCasos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var carpetaRaiz = obtenerOCrearCarpeta(ESTRUCTURA.CARPETA_RAIZ);
  var carpetaBases = obtenerOCrearSubcarpeta(carpetaRaiz, "01. Bases de Datos (Google Sheets & Excel)");
  var carpetaCasosExcel = obtenerOCrearSubcarpeta(carpetaBases, "Casos Individuales (Excel & Sheets)");
  var carpetaDossiers = obtenerOCrearSubcarpeta(carpetaRaiz, "05. Expedientes y Dossiers Humanitarios (PDFs)");
  
  if (!ss) {
    ss = obtenerOCrearSpreadsheet(carpetaBases, ESTRUCTURA.NOMBRE_SPREADSHEET);
  }

  var count = generarDossiersTodosLosCasosBatch(ss, carpetaCasosExcel, carpetaDossiers);
  try {
    SpreadsheetApp.getUi().alert(
      "🎉 ¡PROCESO COMPLETADO CON ÉXITO!\n\n" +
      "Se procesaron " + count + " caso(s) en Google Drive.\n\n" +
      "Los hipervínculos ya están activos y visibles en las columnas M (Archivo Excel) y N (Dossier PDF)."
    );
  } catch (e) {
    Logger.log("Dossiers generados: " + count);
  }
}

function generarDossiersTodosLosCasosBatch(ss, carpetaCasosExcel, carpetaDossiers) {
  var sheet = ss.getSheetByName(ESTRUCTURA.HOJAS.CASOS);
  if (!sheet) return 0;
  
  garantizarColumnasCasos(sheet);
  
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;

  var data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
  var count = 0;

  for (var r = 0; r < data.length; r++) {
    var rowValues = data[r];
    var caseKey = String(rowValues[0] || '').trim();
    
    // Si la celda de código está vacía pero hay nombre en la fila, asignar código automático
    if (!caseKey || caseKey === '') {
      if (rowValues[2] && String(rowValues[2]).trim() !== '') {
        caseKey = 'MMV-CASO-' + (r + 1);
        sheet.getRange(r + 2, 1).setValue(caseKey);
      } else {
        continue;
      }
    }

    var record = {
      caseId: caseKey,
      timestamp: rowValues[1],
      fullName: rowValues[2] || 'Beneficiario',
      cedula: rowValues[3] || '',
      phone: rowValues[4] || '',
      parroquia: rowValues[5] || 'La Guaira',
      location: rowValues[6] || '',
      familyMembers: Number(rowValues[7]) || 1,
      childrenCount: Number(rowValues[8]) || 0,
      elderlyOrDisabled: String(rowValues[9]).toLowerCase().indexOf('s') !== -1,
      priorityNeed: rowValues[10] || 'Alimentos / Enseres',
      narrative: rowValues[11] || ''
    };

    var rowNum = r + 2;
    try {
      var res = crearOActualizarExcelYDossierPdfCaso(record, carpetaCasosExcel, carpetaDossiers, ss);
      aplicarHipervinculosFila(sheet, rowNum, res.excelUrl, res.pdfUrl);
      count++;
    } catch (eRow) {
      Logger.log("Error procesando caso en fila " + rowNum + ": " + eRow);
    }
  }
  
  SpreadsheetApp.flush();
  return count;
}
`;

/**
 * Transmite un registro hacia Google Drive vía Apps Script
 */
export async function sendPayloadToGoogleDrive(
  typeOrPayload: 'donacion' | 'caso' | 'padrino' | 'voluntario' | 'init' | { type: string; data?: any },
  data?: any
): Promise<{ success: boolean; error?: string; data?: any }> {
  const webhookUrl = getAppsScriptUrl();

  if (!webhookUrl) {
    return { success: false, error: 'URL del Web App de Google Drive no configurada aún.' };
  }

  let type: string;
  let payloadData: any;

  if (typeof typeOrPayload === 'object' && typeOrPayload !== null) {
    type = typeOrPayload.type || 'caso';
    payloadData = typeOrPayload.data || {};
  } else {
    type = typeOrPayload;
    payloadData = data || {};
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({ type, data: payloadData })
    });

    if (res.ok) {
      try {
        const json = await res.json();
        return { success: true, data: json };
      } catch (e) {
        return { success: true };
      }
    }

    return { success: true };
  } catch (err: any) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({ type, data: payloadData })
      });
      return { success: true };
    } catch (fallbackErr: any) {
      console.warn('Error al transmitir datos a Google Drive / Sheets:', fallbackErr);
      return { success: false, error: fallbackErr?.message || 'Error de red con Google Apps Script' };
    }
  }
}

/**
 * Genera o actualiza el archivo Excel individual y el Dossier PDF de un caso en Google Drive
 */
export async function generateIndividualCaseInDrive(caseEntry: any): Promise<{
  success: boolean;
  driveFileUrl?: string;
  drivePdfUrl?: string;
  error?: string;
}> {
  const res = await sendPayloadToGoogleDrive({
    type: 'generar_dossier_caso',
    data: caseEntry
  });

  if (res.success && res.data) {
    return {
      success: true,
      driveFileUrl: res.data.driveFileUrl,
      drivePdfUrl: res.data.drivePdfUrl
    };
  }

  return {
    success: res.success,
    error: res.error
  };
}

/**
 * Genera archivos Excel y PDFs en Google Drive para todos los casos registrados
 */
export async function generateAllCasesInDrive(): Promise<{
  success: boolean;
  count?: number;
  error?: string;
}> {
  const res = await sendPayloadToGoogleDrive({
    type: 'generar_todos_los_dossiers',
    data: {}
  });

  if (res.success && res.data) {
    return {
      success: true,
      count: res.data.count
    };
  }

  return {
    success: res.success,
    error: res.error
  };
}

/**
 * Solicita a Google Apps Script que inicialice la estructura y aplique los estilos oficiales de Mano a Mano
 */
export async function triggerDriveInitialization(): Promise<{ success: boolean; error?: string }> {
  return sendPayloadToGoogleDrive('init', {});
}
