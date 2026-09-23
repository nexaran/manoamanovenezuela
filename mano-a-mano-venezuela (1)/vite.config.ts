import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { GoogleGenAI } from '@google/genai';

/**
 * Sanitiza cadenas de texto para prevenir inyecciones HTML / scripts en persistencia de datos.
 */
function sanitizeText(input: any, maxLength = 1000): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Lector de streams con límite estricto de bytes para evitar ataques de DoS por memoria excesiva.
 */
function readBodyWithLimit(req: any, res: any, maxBytes: number = 15 * 1024 * 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    let receivedBytes = 0;

    req.on('data', (chunk: any) => {
      receivedBytes += chunk.length;
      if (receivedBytes > maxBytes) {
        res.statusCode = 413;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Payload demasiado grande (límite de seguridad excedido).' }));
        req.destroy();
        reject(new Error('Payload Too Large'));
        return;
      }
      body += chunk;
    });

    req.on('end', () => resolve(body));
    req.on('error', (err: any) => reject(err));
  });
}

const syncContentPlugin = (env: Record<string, string>) => ({
  name: 'sync-content-api',
  configureServer(server: any) {
    // Middleware global de cabeceras de seguridad perimetral
    server.middlewares.use((_req: any, res: any, next: any) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      next();
    });

    const saveBase64Image = (dataUrl: string, targetFileName: string) => {
      if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) return;
      try {
        // Whitelist estricto de nombres de archivo permitidos para evitar path traversal
        const allowedFiles = [
          'mazda-bt50-gris-2013.jpg',
          'hilux-azul-2008.jpg',
          'hilux-blanca-2008.jpg',
          'moto-carga-2026.jpg',
          'uniformes-brigada.jpg',
          'instagram-entrevista.jpg',
          'globovision-entrevista.jpg',
          'tlt-entrevista.jpg'
        ];
        const safeName = path.basename(targetFileName);
        if (!allowedFiles.includes(safeName)) return;

        const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const pubDir = path.resolve(__dirname, 'public/vehicles');
        if (!fs.existsSync(pubDir)) {
          fs.mkdirSync(pubDir, { recursive: true });
        }
        fs.writeFileSync(path.join(pubDir, safeName), buffer);

        // Also update dist/vehicles if dist exists
        const distDir = path.resolve(__dirname, 'dist/vehicles');
        if (fs.existsSync(distDir)) {
          fs.writeFileSync(path.join(distDir, safeName), buffer);
        }
      } catch (err) {
        console.warn(`Failed to save image to public/vehicles/${targetFileName}:`, err);
      }
    };

    const updateVehicleFiles = (vehiclePhotos?: Record<string, string>, goalPhotos?: Record<string, string>) => {
      if (vehiclePhotos) {
        if (vehiclePhotos['mazda-bt50']) saveBase64Image(vehiclePhotos['mazda-bt50'], 'mazda-bt50-gris-2013.jpg');
        if (vehiclePhotos['hilux-azul']) saveBase64Image(vehiclePhotos['hilux-azul'], 'hilux-azul-2008.jpg');
        if (vehiclePhotos['hilux-blanca']) saveBase64Image(vehiclePhotos['hilux-blanca'], 'hilux-blanca-2008.jpg');
      }
      if (goalPhotos) {
        if (goalPhotos['moto-carga']) saveBase64Image(goalPhotos['moto-carga'], 'moto-carga-2026.jpg');
        if (goalPhotos['uniformes']) saveBase64Image(goalPhotos['uniformes'], 'uniformes-brigada.jpg');
      }
    };

    // 1. Endpoint para sincronizar fotos de presupuestos vehiculares
    server.middlewares.use('/api/sync-vehicle-photos', async (req: any, res: any) => {
      if (req.method === 'POST') {
        try {
          const body = await readBodyWithLimit(req, res, 15 * 1024 * 1024);
          const data = JSON.parse(body);
          const targetPath = path.resolve(__dirname, 'lib/customBrandData.json');
          let currentData: any = {};
          if (fs.existsSync(targetPath)) {
            currentData = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
          }
          if (!currentData.vehiclePhotos) currentData.vehiclePhotos = {};
          if (!currentData.goalPhotos) currentData.goalPhotos = {};

          if (data.vehiclePhotos) {
            currentData.vehiclePhotos = { ...currentData.vehiclePhotos, ...data.vehiclePhotos };
          }
          if (data.goalPhotos) {
            currentData.goalPhotos = { ...currentData.goalPhotos, ...data.goalPhotos };
          }

          fs.writeFileSync(targetPath, JSON.stringify(currentData, null, 2), 'utf-8');
          updateVehicleFiles(data.vehiclePhotos, data.goalPhotos);

          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, timestamp: Date.now() }));
        } catch (err: any) {
          if (!res.writableEnded) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        }
      } else if (req.method === 'GET') {
        try {
          const targetPath = path.resolve(__dirname, 'lib/customBrandData.json');
          if (fs.existsSync(targetPath)) {
            const raw = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({
              vehiclePhotos: raw.vehiclePhotos || {},
              goalPhotos: raw.goalPhotos || {}
            }));
          } else {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ vehiclePhotos: {}, goalPhotos: {} }));
          }
        } catch (err: any) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      } else {
        res.statusCode = 405;
        res.end();
      }
    });

    // 2. Endpoint para sincronizar tapas gráficas de medios (Globovisión, TLT, Instagram)
    server.middlewares.use('/api/sync-media-covers', async (req: any, res: any) => {
      if (req.method === 'POST') {
        try {
          const body = await readBodyWithLimit(req, res, 15 * 1024 * 1024);
          const data = JSON.parse(body);
          const { source, coverData } = data;
          if (coverData && source) {
            const srcLower = String(source).toLowerCase();
            let filename = 'media-cover.jpg';
            if (srcLower.includes('instagram')) filename = 'instagram-entrevista.jpg';
            else if (srcLower.includes('globo')) filename = 'globovision-entrevista.jpg';
            else if (srcLower.includes('tele tuya') || srcLower.includes('tlt')) filename = 'tlt-entrevista.jpg';

            const base64Data = coverData.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const pubPath = path.resolve(__dirname, 'public', filename);
            fs.writeFileSync(pubPath, buffer);

            const distPath = path.resolve(__dirname, 'dist', filename);
            if (fs.existsSync(path.resolve(__dirname, 'dist'))) {
              fs.writeFileSync(distPath, buffer);
            }

            const targetPath = path.resolve(__dirname, 'lib/customBrandData.json');
            let currentData: any = {};
            if (fs.existsSync(targetPath)) {
              try { currentData = JSON.parse(fs.readFileSync(targetPath, 'utf-8')); } catch {}
            }
            if (!currentData.mediaCovers) currentData.mediaCovers = {};
            currentData.mediaCovers[filename] = coverData;
            fs.writeFileSync(targetPath, JSON.stringify(currentData, null, 2), 'utf-8');
          }
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true }));
        } catch (err: any) {
          if (!res.writableEnded) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        }
      } else {
        res.statusCode = 405;
        res.end();
      }
    });

    // 3. Endpoint para sincronizar branding y contenidos generales
    server.middlewares.use('/api/sync-content', async (req: any, res: any) => {
      if (req.method === 'POST') {
        try {
          const body = await readBodyWithLimit(req, res, 15 * 1024 * 1024);
          const data = JSON.parse(body);
          const targetPath = path.resolve(__dirname, 'lib/customBrandData.json');
          let currentData: any = {};
          if (fs.existsSync(targetPath)) {
            try {
              currentData = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
            } catch {}
          }
          const merged = {
            ...currentData,
            ...data,
            vehiclePhotos: { ...(currentData.vehiclePhotos || {}), ...(data.vehiclePhotos || {}) },
            goalPhotos: { ...(currentData.goalPhotos || {}), ...(data.goalPhotos || {}) },
          };

          fs.writeFileSync(targetPath, JSON.stringify(merged, null, 2), 'utf-8');
          updateVehicleFiles(data.vehiclePhotos, data.goalPhotos);

          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, timestamp: Date.now() }));
        } catch (err: any) {
          if (!res.writableEnded) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        }
      } else if (req.method === 'GET') {
        try {
          const targetPath = path.resolve(__dirname, 'lib/customBrandData.json');
          if (fs.existsSync(targetPath)) {
            const content = fs.readFileSync(targetPath, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(content);
          } else {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ logos: {}, projectCardLogos: {}, galleryPhotos: [], vehiclePhotos: {}, goalPhotos: {} }));
          }
        } catch (err: any) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      } else {
        res.statusCode = 405;
        res.end();
      }
    });

    // 4. Endpoint para Registro de Donaciones (Respaldo persistente auditable y webhooks)
    server.middlewares.use('/api/report-donation', async (req: any, res: any) => {
      if (req.method === 'POST') {
        try {
          const body = await readBodyWithLimit(req, res, 1024 * 1024);
          const data = JSON.parse(body);

          const safeEntry = {
            id: sanitizeText(data.id || `don-${Date.now()}`, 50),
            receiptNumber: sanitizeText(data.receiptNumber || `DON-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`, 50),
            donorName: sanitizeText(data.donorName || 'Donante Anónimo', 120),
            donorDocument: sanitizeText(data.donorDocument || '', 40),
            donorPhone: sanitizeText(data.donorPhone || '', 40),
            donorEmail: sanitizeText(data.donorEmail || '', 100),
            amount: Number(data.amount) || 0,
            currency: sanitizeText(data.currency || 'USD', 10),
            motivation: sanitizeText(data.motivation || '', 500),
            itemsDirectedTo: Array.isArray(data.itemsDirectedTo) ? data.itemsDirectedTo.map((i: any) => sanitizeText(i, 100)) : [],
            paymentMethod: sanitizeText(data.paymentMethod || 'Manual', 60),
            paymentReference: sanitizeText(data.paymentReference || '', 80),
            timestamp: data.timestamp || new Date().toISOString(),
            status: data.status === 'confirmado' ? 'confirmado' : 'en_verificacion',
            reportedViaEmail: true
          };

          const recordsPath = path.resolve(__dirname, 'lib/donationRecords.json');
          let currentList: any[] = [];
          if (fs.existsSync(recordsPath)) {
            try {
              currentList = JSON.parse(fs.readFileSync(recordsPath, 'utf-8'));
            } catch {
              currentList = [];
            }
          }
          currentList.unshift(safeEntry);
          fs.writeFileSync(recordsPath, JSON.stringify(currentList, null, 2), 'utf-8');

          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, receiptNumber: safeEntry.receiptNumber }));
        } catch (err: any) {
          if (!res.writableEnded) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        }
      } else if (req.method === 'GET') {
        try {
          const recordsPath = path.resolve(__dirname, 'lib/donationRecords.json');
          if (fs.existsSync(recordsPath)) {
            const content = fs.readFileSync(recordsPath, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(content);
          } else {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify([]));
          }
        } catch (err: any) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      } else {
        res.statusCode = 405;
        res.end();
      }
    });

    // 5. Endpoint para Pre-registro humanitario y respuesta empática asistida por Gemini
    server.middlewares.use('/api/pre-registro', async (req: any, res: any) => {
      if (req.method === 'POST') {
        try {
          const body = await readBodyWithLimit(req, res, 1024 * 1024);
          const data = JSON.parse(body);

          const fullName = sanitizeText(data.fullName, 120);
          const phone = sanitizeText(data.phone, 40);
          const location = sanitizeText(data.location, 200);
          const parroquia = sanitizeText(data.parroquia || 'La Guaira', 60);
          const narrative = sanitizeText(data.narrative, 4000);

          if (!fullName || !phone || !narrative) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 400;
            res.end(JSON.stringify({ success: false, error: 'Campos obligatorios incompletos (Nombre, Teléfono o Narrativa).' }));
            return;
          }

          const now = new Date();
          const caseCode = `CASO-LG-${now.getFullYear()}-${String(Date.now()).slice(-4)}`;

          let empatheticMessage = '';
          const nextSteps = [
            'Recepción y codificación del expediente en la base de datos de pre-registro.',
            'Revisión inicial del caso por la coordinación de logística y acción social.',
            'Contacto telefónico o por WhatsApp para validar datos de acceso.',
            'Visita presencial de la Brigada 99HDD en su comunidad o albergue para corroborar y levantar la ficha de ayuda.'
          ];

          const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || env.API_KEY || process.env.API_KEY;
          
          if (apiKey) {
            try {
              const ai = new GoogleGenAI({ apiKey });
              const prompt = `Eres el equipo de atención y respuesta humanitaria de Mano a Mano Venezuela y la Brigada 99HDD (en el estado La Guaira).
Un ciudadano afectado por la emergencia del doblete sísmico ha realizado un pre-registro de su caso.

DATOS DEL CASO:
- Nombre o contacto: ${fullName}
- Ubicación: ${location} (Parroquia: ${parroquia})
- Integrantes familiares: ${Number(data.familyMembers) || 1} (Niños: ${Number(data.childrenCount) || 0}, Mayores/Discapacidad: ${data.elderlyOrDisabled ? 'Sí' : 'No'})
- Necesidad prioritaria indicada: ${sanitizeText(data.priorityNeed || 'Apoyo general', 80)}
- Historia narrada por el afectado: "${narrative}"

TU TAREA:
Genera un mensaje de respuesta empático, respetuoso, solidario y claro para ${fullName}.
1. Saluda con calidez y reconoce con respeto lo difícil de la situación que relató (menciona detalles de su historia para que sepa que fue leído atentamente).
2. Transmite aliento y esperanza genuina, sin hacer promesas de dinero o soluciones mágicas, pero asegurando que su caso no es un número más.
3. Explica que el caso ha quedado registrado bajo el código ${caseCode} y que el equipo de la Brigada 99HDD revisará los detalles para coordinar una corroboración presencial en terreno según la capacidad logística.
4. Mantén un tono venezolano formal, compasivo y esperanzador.
5. Extensión aproximada: entre 90 y 140 palabras. Solo el texto del mensaje.`;

              const aiResponse = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: prompt,
              });
              
              if (aiResponse && aiResponse.text) {
                empatheticMessage = aiResponse.text.trim();
              }
            } catch (aiErr: any) {
              console.warn('Gemini API call warning, using fallback response:', aiErr.message);
            }
          }

          if (!empatheticMessage) {
            empatheticMessage = `Estimado(a) ${fullName}, recibimos su testimonio con profunda empatía y respeto. Entendemos los momentos tan complejos que su familia atraviesa en ${location || 'La Guaira'} y el valor que requiere compartir su historia. Su expediente ha quedado registrado oficialmente bajo el código ${caseCode}. Nuestro equipo de voluntarios y trabajadores sociales de la Brigada 99HDD revisará minuciosamente cada detalle expuesto. A la brevedad nos comunicaremos a su número ${phone} para dar seguimiento, evaluar nuestro alcance operativo y coordinar la visita de corroboración en sitio. No están solos; paso a paso construiremos caminos de esperanza.`;
          }

          const newEntry = {
            id: `pre-${Date.now()}`,
            caseId: caseCode,
            fullName,
            cedula: sanitizeText(data.cedula || '', 30),
            phone,
            location,
            parroquia,
            familyMembers: Number(data.familyMembers) || 1,
            childrenCount: Number(data.childrenCount) || 0,
            elderlyOrDisabled: Boolean(data.elderlyOrDisabled),
            priorityNeed: sanitizeText(data.priorityNeed || 'otro', 50),
            narrative,
            timestamp: now.toISOString(),
            status: 'recibido',
            aiResponse: {
              empatheticMessage,
              identifiedNeeds: [sanitizeText(data.priorityNeed || 'Apoyo básico humanitario', 80)],
              priorityAssessment: Number(data.childrenCount) > 0 || Boolean(data.elderlyOrDisabled) ? 'Prioridad Alta (Menores / Adultos Mayores)' : 'Prioridad Media',
              nextSteps
            },
            syncedToDrive: true
          };

          const preRegPath = path.resolve(__dirname, 'lib/preRegistros.json');
          let currentList: any[] = [];
          if (fs.existsSync(preRegPath)) {
            try {
              currentList = JSON.parse(fs.readFileSync(preRegPath, 'utf-8'));
            } catch {
              currentList = [];
            }
          }
          currentList.unshift(newEntry);
          fs.writeFileSync(preRegPath, JSON.stringify(currentList, null, 2), 'utf-8');

          const webhookUrl = env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL || process.env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL;
          if (webhookUrl) {
            fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'new_preregistro',
                targetEmail: 'manomanovzla@gmail.com',
                folder: 'Pre-registro',
                data: newEntry
              })
            }).catch((wErr) => console.warn('Webhook sync notice:', wErr));
          }

          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({
            success: true,
            caseId: caseCode,
            entry: newEntry
          }));
        } catch (err: any) {
          if (!res.writableEnded) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        }
      } else if (req.method === 'GET') {
        try {
          const preRegPath = path.resolve(__dirname, 'lib/preRegistros.json');
          if (fs.existsSync(preRegPath)) {
            const list = fs.readFileSync(preRegPath, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(list);
          } else {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify([]));
          }
        } catch (err: any) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      } else {
        res.statusCode = 405;
        res.end();
      }
    });
  }
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: false,
    },
    plugins: [react(), syncContentPlugin(env)],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
