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
    "Relato y Situación"
  ], C.MORADO_OSCURO);

  // 3. PESTAÑA: PADRINOS
  crearHojaSiNoExiste(ss, ESTRUCTURA.HOJAS.PADRINOS, [
    "Código Padrino", "Fecha Registro", "Nombre / Donante", "Organización o Empresa",
    "Correo Electrónico", "Teléfono WhatsApp", "Modalidad de Apoyo", "Mensaje de Compromiso"
  ], C.MORADO_OSCURO);

  // 4. PESTAÑA: VOLUNTARIOS 99HDD
  crearHojaSiNoExiste(ss, ESTRUCTURA.HOJAS.VOLUNTARIOS, [
    "Código Voluntario", "Fecha Registro", "Nombre Completo", "Cédula",
    "Teléfono", "Correo Electrónico", "Parroquia", "Dispone de Vehículo",
    "Detalle de Vehículo", "Área de Habilidades", "Disponibilidad", "Observaciones"
  ], C.MORADO_OSCURO);

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
`;

/**
 * Transmite un registro hacia Google Drive vía Apps Script
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
 * Solicita a Google Apps Script que inicialice la estructura y aplique los estilos oficiales de Mano a Mano
 */
export async function triggerDriveInitialization(): Promise<{ success: boolean; error?: string }> {
  return sendPayloadToGoogleDrive('init', {});
}
