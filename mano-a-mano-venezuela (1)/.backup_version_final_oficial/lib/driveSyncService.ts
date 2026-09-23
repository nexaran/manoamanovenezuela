/**
 * Conector oficial para Google Apps Script / Google Drive / Google Sheets
 * Cuenta: manomanovzla@gmail.com
 * Permite enlazar la aplicación web con la estructura interna y privada de Google Drive.
 */

const APPS_SCRIPT_URL_KEY = 'mmv_apps_script_webhook_url';

export function getAppsScriptUrl(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(APPS_SCRIPT_URL_KEY) || '';
}

export function saveAppsScriptUrl(url: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(APPS_SCRIPT_URL_KEY, url.trim());
}

/**
 * Código maestro del Google Apps Script para manomanovzla@gmail.com.
 * Este script vive exclusivamente dentro de tu cuenta Google.
 * Crea las carpetas en Google Drive y el archivo Google Sheets con el Dashboard Ejecutivo integrado.
 */
export const OFFICIAL_APPS_SCRIPT_CODE = `// =========================================================================
// SISTEMA INTEGRAL PRIVADO: GOOGLE DRIVE & GOOGLE SHEETS
// ORGANIZACIÓN: MANO A MANO VENEZUELA & BRIGADA 99HDD
// CUENTA ADMINISTRADORA: manomanovzla@gmail.com
// =========================================================================
// Este script vive ÚNICAMENTE en tu Google Drive. 
// Genera las carpetas, la base de datos y el Dashboard Ejecutivo con fórmulas en vivo.
// Protegido contra inyecciones y duplicados.
// =========================================================================

var ESTRUCTURA = {
  CARPETA_RAIZ: "Mano a Mano - Operaciones 99HDD",
  SUBCARPETAS: [
    "01. Bases de Datos (Google Sheets & Excel)",
    "02. Dashboard y Métricas de Impacto",
    "03. Reportes Ejecutivos y Conciliación",
    "04. Comprobantes y Respaldos Bancarios"
  ],
  NOMBRE_SPREADSHEET: "Consolidado_Oficial_ManoAMano",
  HOJAS: {
    DASHBOARD: "📊 Dashboard Ejecutivo",
    DONACIONES: "💰 Donaciones_Aportes",
    CASOS: "📋 Casos_Afectados",
    PADRINOS: "🤝 Padrinos_Donantes",
    VOLUNTARIOS: "👷 Voluntarios_99HDD"
  }
};

/**
 * FUNCIÓN PRINCIPAL DE INSTALACIÓN
 * En script.google.com, selecciona esta función arriba y pulsa "▶ Ejecutar"
 * para crear las carpetas y el dashboard en tu Google Drive inmediatamente.
 */
function inicializarSistemaDrive() {
  Logger.log("Iniciando creación de estructura en Google Drive...");

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

  // 4. Configurar las 5 pestañas con formatos, encabezados y el Dashboard Ejecutivo
  configurarEstructuraSpreadsheet(ss);

  var urlCarpeta = carpetaRaiz.getUrl();
  var urlSpreadsheet = ss.getUrl();

  Logger.log("✅ SISTEMA INICIALIZADO CON ÉXITO");
  Logger.log("📁 Carpeta Drive: " + urlCarpeta);
  Logger.log("📊 Dashboard / Spreadsheet: " + urlSpreadsheet);

  return {
    success: true,
    folderUrl: urlCarpeta,
    spreadsheetUrl: urlSpreadsheet
  };
}

/**
 * Función auxiliar para recibir los links directos por correo en 2 segundos
 */
function enviarmeEnlacePorCorreo() {
  var res = inicializarSistemaDrive();
  var miCorreo = Session.getActiveUser().getEmail() || "manomanovzla@gmail.com";
  MailApp.sendEmail(
    miCorreo,
    "📁 Enlaces directos a tu Carpeta y Dashboard Mano a Mano",
    "¡Hola! Aquí tienes los enlaces directos a tu Drive:\\n\\n" +
    "📁 Carpeta Principal en Google Drive:\\n" + res.folderUrl + "\\n\\n" +
    "📊 Hoja de Cálculo & Dashboard:\\n" + res.spreadsheetUrl + "\\n\\n" +
    "Guarda este correo para acceder siempre con un clic."
  );
  Logger.log("Correo enviado a: " + miCorreo);
  return "Correo enviado a: " + miCorreo;
}

/**
 * Peticiones GET: Si abres la URL del Web App en tu navegador,
 * inicializa el sistema y te muestra un panel interactivo con los enlaces directos a tu Drive.
 */
function doGet(e) {
  var resultado = inicializarSistemaDrive();
  var html = '<!DOCTYPE html>' +
    '<html><head><meta charset="utf-8"><title>Mano a Mano 99HDD - Google Drive</title>' +
    '<style>' +
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0a0e1c; color: #ffffff; padding: 40px; margin: 0; line-height: 1.6; }' +
    '.card { max-width: 680px; margin: 0 auto; background: #131a2e; border: 1px solid #1e293b; padding: 36px; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }' +
    'h1 { color: #00f0ff; margin-top: 0; font-size: 24px; }' +
    'p { color: #94a3b8; font-size: 14px; }' +
    '.btn { display: inline-block; background: #0e7490; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; margin-right: 12px; margin-top: 15px; }' +
    '.btn-secondary { background: #334155; }' +
    '.btn:hover { opacity: 0.9; }' +
    '.pill { display: inline-block; background: rgba(74, 93, 35, 0.4); color: #86efac; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: bold; border: 1px solid rgba(74, 93, 35, 0.8); margin-bottom: 16px; }' +
    '.badge { background: #1e293b; color: #00f0ff; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-family: monospace; }' +
    '</style></head><body>' +
    '<div class="card">' +
    '<span class="pill">✓ CONEXIÓN ACTIVA & BLINDADA</span>' +
    '<h1>Sistema Integral en Google Drive Operativo</h1>' +
    '<p>Tus carpetas de operaciones, el consolidado de datos y el <strong>Dashboard Ejecutivo</strong> están sincronizados en la cuenta <span class="badge">manomanovzla@gmail.com</span>.</p>' +
    '<p>Toda la información y los libros Excel están protegidos privadamente en tu Drive y no se exponen al público en la web.</p>' +
    '<div>' +
    '<a class="btn" href="' + resultado.spreadsheetUrl + '" target="_blank">📊 Abrir Hoja de Cálculo & Dashboard</a>' +
    '<a class="btn btn-secondary" href="' + resultado.folderUrl + '" target="_blank">📁 Ver Carpetas en Drive</a>' +
    '</div>' +
    '</div>' +
    '</body></html>';

  return HtmlService.createHtmlOutput(html).setTitle("Mano a Mano 99HDD - Conector Google Drive");
}

/**
 * Peticiones POST: Recibe datos enviados en tiempo real desde la web
 * (donaciones, pre-registros, padrinos, voluntarios o sincronización masiva).
 */
function doPost(e) {
  try {
    var contents = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
    var payload = JSON.parse(contents);
    var type = payload.type || 'caso';
    var record = payload.data || {};

    // Asegurar que la estructura exista
    var carpetaRaiz = obtenerOCrearCarpeta(ESTRUCTURA.CARPETA_RAIZ);
    var carpetaBases = obtenerOCrearSubcarpeta(carpetaRaiz, "01. Bases de Datos (Google Sheets & Excel)");
    var ss = obtenerOCrearSpreadsheet(carpetaBases, ESTRUCTURA.NOMBRE_SPREADSHEET);
    configurarEstructuraSpreadsheet(ss);

    if (type === 'init') {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Estructura verificada e inicializada en Google Drive",
        folderUrl: carpetaRaiz.getUrl(),
        spreadsheetUrl: ss.getUrl()
      })).setMimeType(ContentService.MimeType.JSON);
    }

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
      var caseKey = record.caseId || ('MMV-CASO-' + Date.now().toString().slice(-4));
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
        sanitizeCell(record.narrative || '')
      ];
      upsertRowByFirstColumn(sheet, caseKey, row);
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
// FUNCIONES AUXILIARES DE DRIVE Y SPREADSHEET
// -------------------------------------------------------------------------

function sanitizeCell(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'number') return val;
  var s = String(val).trim();
  // Blindaje contra inyección de fórmulas de Excel/Sheets (=, +, -, @)
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
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(nombre);
}

function obtenerOCrearSubcarpeta(carpetaPadre, nombreSub) {
  var folders = carpetaPadre.getFoldersByName(nombreSub);
  if (folders.hasNext()) {
    return folders.next();
  }
  return carpetaPadre.createFolder(nombreSub);
}

function obtenerOCrearSpreadsheet(carpeta, nombreArchivo) {
  var files = carpeta.getFilesByName(nombreArchivo);
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }
  var ss = SpreadsheetApp.create(nombreArchivo);
  var file = DriveApp.getFileById(ss.getId());
  carpeta.addFile(file);
  DriveApp.getRootFolder().removeFile(file);
  return ss;
}

function configurarEstructuraSpreadsheet(ss) {
  var colorNavy = "#0a0e1c";
  var colorMilGreen = "#4a5d23";
  var colorCyan = "#0e7490";

  // 1. PESTAÑA: DASHBOARD EJECUTIVO
  var dashSheet = ss.getSheetByName(ESTRUCTURA.HOJAS.DASHBOARD);
  if (!dashSheet) {
    dashSheet = ss.insertSheet(ESTRUCTURA.HOJAS.DASHBOARD, 0);
  }

  if (dashSheet.getLastRow() === 0) {
    dashSheet.getRange("A1:H1").merge()
      .setValue("MANO A MANO VENEZUELA & BRIGADA 99HDD — DASHBOARD GENERAL DE OPERACIONES")
      .setBackground(colorNavy)
      .setFontColor("#00f0ff")
      .setFontWeight("bold")
      .setFontSize(14)
      .setHorizontalAlignment("center");

    dashSheet.getRange("A2:H2").merge()
      .setValue("Panel ejecutivo privado en Google Drive | manomanovzla@gmail.com | Se actualiza en tiempo real con cada registro")
      .setBackground("#131a2e")
      .setFontColor("#94a3b8")
      .setFontSize(9)
      .setHorizontalAlignment("center");

    // Tarjetas KPI Fila 4-5
    dashSheet.getRange("A4:B4").merge().setValue("TOTAL RECAUDADO (USD)").setBackground(colorMilGreen).setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");
    dashSheet.getRange("A5:B5").merge().setFormula('=2780 + IFERROR(SUMIFS(\\'' + ESTRUCTURA.HOJAS.DONACIONES + '\\'!C2:C, \\'' + ESTRUCTURA.HOJAS.DONACIONES + '\\'!K2:K, "confirmado"), 0)').setNumberFormat("$#,##0.00").setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center").setBackground("#f0fdf4");

    dashSheet.getRange("C4:D4").merge().setValue("META OFICIAL (USD)").setBackground(colorNavy).setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");
    dashSheet.getRange("C5:D5").merge().setValue(25000).setNumberFormat("$#,##0.00").setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center").setBackground("#f8fafc");

    dashSheet.getRange("E4:F4").merge().setValue("APORTES CONCILIADOS").setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");
    dashSheet.getRange("E5:F5").merge().setFormula('=COUNTIF(\\'' + ESTRUCTURA.HOJAS.DONACIONES + '\\'!K2:K, "confirmado")').setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center").setBackground("#f8fafc");

    dashSheet.getRange("G4:H4").merge().setValue("EN VERIFICACIÓN MANUAL").setBackground("#b45309").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");
    dashSheet.getRange("G5:H5").merge().setFormula('=COUNTIF(\\'' + ESTRUCTURA.HOJAS.DONACIONES + '\\'!K2:K, "en_verificacion")').setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center").setBackground("#fffbeb");

    // Tarjetas KPI Secundarias (Fila 7-8)
    dashSheet.getRange("A7:B7").merge().setValue("FAMILIAS CENSADAS").setBackground(colorCyan).setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");
    dashSheet.getRange("A8:B8").merge().setFormula('=MAX(0, COUNTA(\\'' + ESTRUCTURA.HOJAS.CASOS + '\\'!A2:A)-1)').setFontSize(14).setFontWeight("bold").setHorizontalAlignment("center");

    dashSheet.getRange("C7:D7").merge().setValue("TOTAL PERSONAS CENSADAS").setBackground("#334155").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");
    dashSheet.getRange("C8:D8").merge().setFormula('=IFERROR(SUM(\\'' + ESTRUCTURA.HOJAS.CASOS + '\\'!H2:H), 0)').setFontSize(14).setFontWeight("bold").setHorizontalAlignment("center");

    dashSheet.getRange("E7:F7").merge().setValue("PADRINOS REGISTRADOS").setBackground("#334155").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");
    dashSheet.getRange("E8:F8").merge().setFormula('=MAX(0, COUNTA(\\'' + ESTRUCTURA.HOJAS.PADRINOS + '\\'!A2:A)-1)').setFontSize(14).setFontWeight("bold").setHorizontalAlignment("center");

    dashSheet.getRange("G7:H7").merge().setValue("VOLUNTARIOS 99HDD").setBackground("#334155").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");
    dashSheet.getRange("G8:H8").merge().setFormula('=MAX(0, COUNTA(\\'' + ESTRUCTURA.HOJAS.VOLUNTARIOS + '\\'!A2:A)-1)').setFontSize(14).setFontWeight("bold").setHorizontalAlignment("center");

    // Descarga Excel (Fila 10)
    dashSheet.getRange("A10:H10").merge()
      .setValue("💡 Para descargar este consolidado oficial a tu computador, en el menú superior selecciona: Archivo > Descargar > Microsoft Excel (.xlsx)")
      .setBackground("#e2e8f0")
      .setFontColor("#334155")
      .setFontSize(9)
      .setHorizontalAlignment("center");
  }

  // 2. PESTAÑA: DONACIONES
  crearHojaSiNoExiste(ss, ESTRUCTURA.HOJAS.DONACIONES, [
    "Recibo Oficial", "Fecha y Hora", "Monto USD", "Nombre Donante", "Cédula / RIF",
    "Teléfono", "Correo Electrónico", "Plataforma / Banco", "Referencia Declarada",
    "Motivación / Destino", "Estatus de Conciliación"
  ], colorNavy);

  // 3. PESTAÑA: CASOS AFECTADOS
  crearHojaSiNoExiste(ss, ESTRUCTURA.HOJAS.CASOS, [
    "Código de Caso", "Fecha de Registro", "Nombre Solicitante", "Cédula",
    "Teléfono", "Parroquia", "Dirección / Ubicación", "Miembros Familia",
    "Niños en el Hogar", "Adultos Mayores / Discapacidad", "Necesidad Prioritaria",
    "Relato y Situación"
  ], colorNavy);

  // 4. PESTAÑA: PADRINOS
  crearHojaSiNoExiste(ss, ESTRUCTURA.HOJAS.PADRINOS, [
    "Código Padrino", "Fecha Registro", "Nombre / Donante", "Organización o Empresa",
    "Correo Electrónico", "Teléfono WhatsApp", "Modalidad de Apoyo", "Mensaje de Compromiso"
  ], colorNavy);

  // 5. PESTAÑA: VOLUNTARIOS 99HDD
  crearHojaSiNoExiste(ss, ESTRUCTURA.HOJAS.VOLUNTARIOS, [
    "Código Voluntario", "Fecha Registro", "Nombre Completo", "Cédula",
    "Teléfono", "Correo Electrónico", "Parroquia", "Dispone de Vehículo",
    "Detalle de Vehículo", "Área de Habilidades", "Disponibilidad", "Observaciones"
  ], colorNavy);

  // Eliminar Hoja 1 por defecto si existe
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
    var range = sheet.getRange(1, 1, 1, encabezados.length);
    range.setBackground(colorHeader)
      .setFontColor("#ffffff")
      .setFontWeight("bold")
      .setFontSize(10);
    sheet.setFrozenRows(1);
  }
  return sheet;
}
`;

/**
 * Envía un payload puntual a Google Drive vía Apps Script
 * Soporta ambas firmas: sendPayloadToGoogleDrive('caso', data) o sendPayloadToGoogleDrive({ type: 'caso', data })
 */
export async function sendPayloadToGoogleDrive(
  typeOrPayload: 'donacion' | 'caso' | 'padrino' | 'voluntario' | 'init' | { type: string; data?: any },
  data?: any
): Promise<{ success: boolean; error?: string }> {
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
    // Usamos text/plain para evitar solicitudes previas OPTIONS (CORS preflight) hacia Google Apps Script
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({ type, data: payloadData })
    });

    return { success: true };
  } catch (err: any) {
    try {
      // Fallback a modo no-cors en caso de restricciones de redirección del navegador
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
 * Solicita a Google Apps Script que verifique y cree la estructura de carpetas y dashboard en Drive
 */
export async function triggerDriveInitialization(): Promise<{ success: boolean; error?: string }> {
  return sendPayloadToGoogleDrive('init', {});
}
