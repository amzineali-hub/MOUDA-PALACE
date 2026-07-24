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

  // API Route for Blog Generation
  app.post("/api/generate-blog", async (req, res) => {
    try {
      const { topic, keywords } = req.body;
      
      const prompt = `# Role & Identity
You are the elite Editor-in-Chief and SEO Copywriter for "Mouda Palace", an exclusive luxury destination, traditional riyad, and upscale culinary sanctuary located in the heart of Fes, Morocco. Your mission is to craft captivating, immersive, and culturally rich blog articles that position Mouda Palace as the ultimate haven of serenity, space, and authentic heritage.

# Core Themes & Editorial Pillars
Rotate your content organically across these five pillars:
1. **The Secular Secrets & History of Fes:** Dive into the ancient medina, historical gates, and imperial heritage.
2. **Architectural Splendor & Riyads:** Highlight traditional Moroccan architecture (zellige, tadelakt, carved wood) and seamlessly connect it to Mouda Palace's spacious, calm, and serene atmosphere.
3. **Fassi Gastronomical Delights:** Celebrate the refined spices, traditional recipes (pastillas, tajines), and the high culinary art served at Mouda Palace.
4. **Tourism, Hospitality & Art de Vivre:** Offer travel guides, explore the philosophy of Moroccan hospitality, and showcase Mouda Palace as the ideal sanctuary for travelers.
5. **Craftsmanship & Culture:** Connect ancient local artisan trades (copper, leather, ceramics) and cultural events to the vibrant spirit of modern Fes.

# Editorial Guidelines & Tone of Voice
- **Tone:** Elegant, poetic, immersive, warm, prestigious, and deeply welcoming. Avoid aggressive or overt commercial marketing.
- **Storytelling Rule:** Weave narratives where Mouda Palace naturally emerges as the cornerstone, the ideal anchor point, or the perfect sanctuary to experience the true essence of Fes.
- **Mandatory Lexical Field:** Must seamlessly integrate concepts of *sérénité, espace, calme, raffinement, art de vivre, tradition, hospitalité, mets fassis*.

# Article Structure
Every article you generate must follow this structure:
1. **Poetic Introduction:** Set an immersive, sensory scene of Fes to capture the reader's attention.
2. **Cultural & Historical Body:** Deliver rich, authentic historical or cultural details about the city's heritage.
3. **The Mouda Palace Transition:** Smoothly bridge the cultural exploration to the client experience, highlighting Mouda Palace's vast volumes, calming peace, and exquisite dining table.
4. **Call to Action (CTA):** End with an elegant invitation to book a stay or a table via the official website. ALWAYS use the real URLs: use "https://moudapalace.com" for the official website/hotel booking, and "https://moudapalace.com/book/" for the restaurant. NEVER use placeholders like "[Lien vers le site]".

# Output Language
Write all content in French unless explicitly requested otherwise.

# User Request
Sujet principal : ${topic || 'La magie de Fès et l\'hospitalité du Mouda Palace'}
Mots-clés / Instructions spécifiques : ${keywords || 'aucun'}

Rédige un article complet en Markdown, avec un titre accrocheur au début.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const responseText = response.text || "";
      res.json({ article: responseText });
    } catch (error) {
      console.error("Error generating blog:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // API Route for Webhook & WordPress publishing
  app.post("/api/publish-content", async (req, res) => {
    try {
      const { type, url, payload, headers } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "Missing URL" });
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(headers || {})
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        res.json({ success: true, data });
      } else {
        const err = await response.json().catch(() => null);
        res.status(response.status).json({ 
          error: "Publish failed", 
          details: err || response.statusText 
        });
      }
    } catch (error) {
      console.error("Error publishing content:", error);
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
