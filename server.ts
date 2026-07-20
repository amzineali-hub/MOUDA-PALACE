import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini analysis
  app.post("/api/analyze-review", async (req, res) => {
    try {
      const { reviewText } = req.body;
      if (!reviewText) {
        return res.status(400).json({ error: "Missing reviewText" });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Tu es un assistant IA pour un restaurant gastronomique marocain "Mouda Palace". Analyse cet avis client et extrais:
1. Le sentiment général (positif, neutre, négatif)
2. Les points forts
3. Les points à améliorer
4. Une suggestion de réponse courte et polie.

Avis: "${reviewText}"
Réponds au format JSON:
{
  "sentiment": "positif/neutre/négatif",
  "pointsForts": ["..."],
  "pointsFaibles": ["..."],
  "reponseSuggeree": "..."
}`
      });

      const responseText = response.text || "";
      // Strip markdown code block if present
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const result = JSON.parse(cleanJson);
      
      res.json(result);
    } catch (error) {
      console.error("Error analyzing review:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // API Route for Menu Translation
  app.post("/api/translate-menu", async (req, res) => {
    try {
      const { items } = req.body;
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: "Missing items array" });
      }

      const prompt = `Traduisez les noms et descriptions de plats suivants du français vers l'anglais, l'espagnol, l'arabe, l'allemand, le chinois, le coréen et le portugais.
Renvoie un tableau JSON où chaque élément correspond à l'entrée et contient "id", "translations": { "en": { "name": "...", "desc": "..." }, "es": { "name": "...", "desc": "..." }, "ar": { "name": "...", "desc": "..." }, "de": { "name": "...", "desc": "..." }, "zh": { "name": "...", "desc": "..." }, "ko": { "name": "...", "desc": "..." }, "pt": { "name": "...", "desc": "..." } }.
Plats à traduire :
${JSON.stringify(items.map((i: any) => ({ id: i.id, name: i.name, desc: i.desc })))}

Format de réponse attendu:
[
  {
    "id": 1,
    "translations": {
      "en": { "name": "...", "desc": "..." },
      "es": { "name": "...", "desc": "..." },
      "ar": { "name": "...", "desc": "..." },
      "de": { "name": "...", "desc": "..." },
      "zh": { "name": "...", "desc": "..." },
      "ko": { "name": "...", "desc": "..." },
      "pt": { "name": "...", "desc": "..." }
    }
  }
]
Ne renvoie QUE le tableau JSON valide. Ne rajoute pas de texte avant ou après.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const responseText = response.text || "";
      // Strip markdown code block if present
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const result = JSON.parse(cleanJson);
      
      res.json(result);
    } catch (error) {
      console.error("Error translating menu:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
