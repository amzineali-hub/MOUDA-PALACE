import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
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
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error analyzing review:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
