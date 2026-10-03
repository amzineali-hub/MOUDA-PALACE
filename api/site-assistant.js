import { GoogleGenAI } from "@google/genai";

// Appelé en cross-origin depuis moudapalace.com (widget de chat public, voir
// public/mouda-assistant.js) — contrairement aux autres fonctions api/*.js, toutes appelées
// depuis l'ERP lui-même (même origine), celle-ci a donc besoin d'en-têtes CORS explicites.
const ALLOWED_ORIGINS = ['https://moudapalace.com', 'https://www.moudapalace.com'];

const RESTAURANT_CONTEXT = `Tu es l'assistant virtuel du site web de Mouda Palace, un riad-restaurant-lounge-rooftop de charme dans la médina de Fès, au Maroc.

Informations factuelles — ne jamais inventer au-delà de ce qui suit :
- Adresse : 7 Derb Agoual Sefli, Talaa Sghira, Médina de Fès, 30000, Maroc.
- Téléphone / accueil : +212 661-357191. Réservations : +212 661-860193.
- Email : moudapalace@gmail.com.
- Concept : une ancienne demeure (ex-résidence officielle) transformée en riad à plusieurs espaces à thème : Kebba, Almas, Riad, Hippy, Chams Terrasse, Mouda Rooftop, Layali — du salon intimiste à la terrasse rooftop avec vue sur Fès.
- Cuisine : gastronomie marocaine raffinée (tagines, couscous, pâtisseries) et saveurs du monde, cocktails et mocktails, chicha.
- Pages utiles : réservation sur https://moudapalace.com/book/, carte complète sur https://moudapalace.com/menu/, galerie sur https://moudapalace.com/gallery/.
- Très bien noté sur TripAdvisor (Travelers' Choice).

Consignes :
- Réponds TOUJOURS dans la langue du visiteur (français, anglais, arabe, espagnol...).
- Reste chaleureux et concis (3 à 4 phrases maximum, sauf si on te demande plus de détails) ; évoque l'ambiance du lieu sans être trop commercial.
- N'invente JAMAIS d'horaires d'ouverture, de prix précis ou de disponibilité de table — pour toute question sur les horaires exacts, les prix ou pour réserver, oriente vers la page de réservation ou les numéros de téléphone ci-dessus.
- Si la question sort totalement du cadre du restaurant, ramène poliment la conversation vers Mouda Palace.`;

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "API key not found" });
    }

    const { message, history } = req.body || {};
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: "Missing message" });
    }

    // Historique formaté en texte brut plutôt qu'en tableau de `contents` multi-tours : plus
    // simple à faire tenir dans le même style que les autres fonctions api/*.js de ce dépôt
    // (un seul prompt texte), sans dépendre d'un format de SDK non utilisé ailleurs ici.
    const historyText = Array.isArray(history)
      ? history
          .slice(-10)
          .filter(turn => turn && (turn.role === 'user' || turn.role === 'assistant') && typeof turn.text === 'string' && turn.text.trim())
          .map(turn => `${turn.role === 'assistant' ? 'Toi' : 'Visiteur'}: ${turn.text.slice(0, 2000)}`)
          .join('\n')
      : '';

    const prompt = `${RESTAURANT_CONTEXT}

${historyText ? `Historique de la conversation :\n${historyText}\n` : ''}
Visiteur: ${message.trim().slice(0, 2000)}
Toi:`;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        // Plan Vercel Hobby = 10s max ; voir generate-blog.js pour le même garde-fou.
        thinkingConfig: { thinkingLevel: 'MINIMAL' },
        maxOutputTokens: 400,
      },
    });

    const reply = (response.text || "").trim() || "Désolé, je n'ai pas pu répondre — vous pouvez nous joindre directement au +212 661-357191.";
    res.status(200).json({ reply });
  } catch (error) {
    console.error("Error in site-assistant:", error);
    const detail = error?.message || String(error);
    res.status(500).json({ error: detail || "Internal Server Error" });
  }
}
