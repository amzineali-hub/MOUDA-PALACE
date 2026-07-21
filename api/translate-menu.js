import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Missing items array" });
    }
    
    const prompt = `Traduisez les noms et descriptions de plats suivants du français vers l'anglais, l'espagnol, l'arabe, l'allemand, le chinois, le coréen et le portugais.
Renvoie un tableau JSON où chaque élément correspond à l'entrée et contient "id", "translations": { "en": { "name": "...", "desc": "..." }, "es": { "name": "...", "desc": "..." }, "ar": { "name": "...", "desc": "..." }, "de": { "name": "...", "desc": "..." }, "zh": { "name": "...", "desc": "..." }, "ko": { "name": "...", "desc": "..." }, "pt": { "name": "...", "desc": "..." } }.

Plats à traduire :
${JSON.stringify(items.map((i) => ({ id: i.id, name: i.name, desc: i.desc })))}

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
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error translating menu:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
