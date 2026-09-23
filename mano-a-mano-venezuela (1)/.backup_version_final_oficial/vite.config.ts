import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { GoogleGenAI } from '@google/genai';

const syncContentPlugin = (env: Record<string, string>) => ({
  name: 'sync-content-api',
  configureServer(server: any) {
    server.middlewares.use('/api/sync-content', (req: any, res: any) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const targetPath = path.resolve(__dirname, 'lib/customBrandData.json');
            fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, timestamp: Date.now() }));
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
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
            res.end(JSON.stringify({ logos: {}, projectCardLogos: {}, galleryPhotos: [] }));
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

    // Endpoint for Pre-registro and Gemini empathetic response
    server.middlewares.use('/api/pre-registro', async (req: any, res: any) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk;
        });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const now = new Date();
            const caseCode = `CASO-LG-${now.getFullYear()}-${String(Date.now()).slice(-4)}`;

            // Empathetic response generation with Gemini
            let empatheticMessage = '';
            let nextSteps = [
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
- Nombre o contacto: ${data.fullName}
- Ubicación: ${data.location} (Parroquia: ${data.parroquia || 'La Guaira'})
- Integrantes familiares: ${data.familyMembers || 1} (Niños: ${data.childrenCount || 0}, Mayores/Discapacidad: ${data.elderlyOrDisabled ? 'Sí' : 'No'})
- Necesidad prioritaria indicada: ${data.priorityNeed || 'Apoyo general'}
- Historia narrada por el afectado: "${data.narrative}"

TU TAREA:
Genera un mensaje de respuesta empático, respetuoso, solidario y claro para ${data.fullName}.
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

            // High-quality, personalized compassionate fallback if AI was unavailable
            if (!empatheticMessage) {
              empatheticMessage = `Estimado(a) ${data.fullName}, recibimos su testimonio con profunda empatía y respeto. Entendemos los momentos tan complejos que su familia atraviesa en ${data.location || 'La Guaira'} y el valor que requiere compartir su historia. Su expediente ha quedado registrado oficialmente bajo el código ${caseCode}. Nuestro equipo de voluntarios y trabajadores sociales de la Brigada 99HDD revisará minuciosamente cada detalle expuesto. A la brevedad nos comunicaremos a su número ${data.phone} para dar seguimiento, evaluar nuestro alcance operativo y coordinar la visita de corroboración en sitio. No están solos; paso a paso construiremos caminos de esperanza.`;
            }

            const newEntry = {
              id: `pre-${Date.now()}`,
              caseId: caseCode,
              fullName: data.fullName,
              cedula: data.cedula || '',
              phone: data.phone,
              location: data.location,
              parroquia: data.parroquia || 'La Guaira',
              familyMembers: Number(data.familyMembers) || 1,
              childrenCount: Number(data.childrenCount) || 0,
              elderlyOrDisabled: Boolean(data.elderlyOrDisabled),
              priorityNeed: data.priorityNeed || 'otro',
              narrative: data.narrative,
              timestamp: now.toISOString(),
              status: 'recibido',
              aiResponse: {
                empatheticMessage,
                identifiedNeeds: [data.priorityNeed || 'Apoyo básico humanitario'],
                priorityAssessment: data.childrenCount > 0 || data.elderlyOrDisabled ? 'Prioridad Alta (Menores / Adultos Mayores)' : 'Prioridad Media',
                nextSteps
              },
              syncedToDrive: true
            };

            // Save to persistent lib/preRegistros.json
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

            // Webhook to Google Apps Script / Drive (if user configured URL)
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
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
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
