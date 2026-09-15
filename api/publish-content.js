// Relais de publication pour le générateur de blog (BlogWriterAI.tsx) : le navigateur ne peut pas
// poster directement vers l'API REST WordPress avec une authentification Basic sans déclencher un
// blocage CORS/mixed-content, donc ce endpoint sert d'intermédiaire côté serveur. Accepte trois
// formes (`type`) :
// - "wordpress"       : POST JSON vers `${site}/wp-json/wp/v2/posts`.
// - "wordpress-media" : upload d'une image vers `${site}/wp-json/wp/v2/media` (pour l'image mise
//   en avant d'un article) — payload = { filename, contentType, dataBase64 } où dataBase64 est
//   l'image encodée en base64 (sans le préfixe "data:...;base64,").
// - "webhook"         : POST vers l'URL Make/Zapier configurée, en relai simple.
// Dans tous les cas, l'en-tête Authorization (Basic, construit à partir du mot de passe
// d'application WordPress saisi dans les Paramètres du module Blog) vient du client et n'est
// jamais stocké ni journalisé ici.
const isPrivateHost = (hostname) => ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(hostname)
  || hostname.endsWith('.local')
  || /^(10\.|172\.(1[6-9]|2\d|3[0-1])\.|192\.168\.|169\.254\.)/.test(hostname);

const parseTargetUrl = (url) => {
  if (!url || typeof url !== 'string') throw { status: 400, message: "URL de destination manquante" };
  let target;
  try {
    target = new URL(url);
  } catch {
    throw { status: 400, message: "URL de destination invalide" };
  }
  if (target.protocol !== 'https:') throw { status: 400, message: "Seules les URL https sont autorisées" };
  if (isPrivateHost(target.hostname.toLowerCase())) throw { status: 400, message: "Cette destination n'est pas autorisée" };
  return target;
};

const readUpstream = async (upstream) => {
  const contentType = upstream.headers.get('content-type') || '';
  const raw = await upstream.text();
  let details = raw;
  if (contentType.includes('application/json')) {
    try { details = JSON.parse(raw); } catch { /* garde le texte brut */ }
  }
  return details;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { type, url, headers, payload } = req.body || {};

    if (type !== 'wordpress' && type !== 'webhook' && type !== 'wordpress-media') {
      return res.status(400).json({ error: "Type invalide (attendu: wordpress, wordpress-media ou webhook)" });
    }

    let target;
    try {
      target = parseTargetUrl(url);
    } catch (e) {
      return res.status(e.status || 400).json({ error: e.message });
    }

    const authHeader = headers && typeof headers === 'object' && typeof headers.Authorization === 'string'
      ? headers.Authorization
      : undefined;

    let upstream;
    if (type === 'wordpress-media') {
      const { filename, contentType: mediaContentType, dataBase64 } = payload || {};
      if (!filename || !mediaContentType || !dataBase64) {
        return res.status(400).json({ error: "Image incomplète (filename, contentType et dataBase64 requis)" });
      }
      const buffer = Buffer.from(dataBase64, 'base64');
      upstream = await fetch(target.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': mediaContentType,
          'Content-Disposition': `attachment; filename="${filename.replace(/[^\w.\-]/g, '_')}"`,
          ...(authHeader ? { Authorization: authHeader } : {})
        },
        body: buffer
      });
    } else {
      upstream = await fetch(target.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {})
        },
        body: JSON.stringify(payload || {})
      });
    }

    const details = await readUpstream(upstream);

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'Publication échouée', details });
    }

    res.status(200).json({ ok: true, details });
  } catch (error) {
    console.error("Publish proxy error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
