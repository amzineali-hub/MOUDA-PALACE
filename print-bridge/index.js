// Pont d'impression local — tourne sur CHAQUE poste caisse (Patio, Rooftop), écoute en local
// (127.0.0.1) et relaie les tickets cuisine vers l'imprimante Ethernet de la cuisine en TCP brut.
// Voir README.md pour l'installation. Ne fait AUCUN appel réseau externe/Firestore : doit
// continuer à fonctionner même si Internet est coupé, tant que le réseau local (LAN) tient.
//
// CommonJS (pas ESM) volontairement : c'est le format le plus fiable pour être empaqueté en
// .exe autonome via `pkg` (voir package.json, script "build-exe").

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { buildKitchenTicketEscPos } = require('./lib/escpos');
const { sendToPrinter } = require('./lib/printer-socket');

// Quand empaqueté en .exe (pkg), __dirname pointe vers une image virtuelle en lecture seule
// embarquée dans l'exécutable — il faut lire config.json à côté du vrai .exe sur le disque pour
// que chaque poste caisse puisse éditer son IP d'imprimante sans reconstruire l'exécutable.
const baseDir = process.pkg ? path.dirname(process.execPath) : __dirname;

const DEFAULT_CONFIG = {
  port: 4321,
  kitchenPrinterHost: null,
  kitchenPrinterPort: 9100,
  connectTimeoutMs: 4000,
  codepage: 'cp860',
  escposTableNumber: 3
};

function loadConfig() {
  const configPath = path.join(baseDir, 'config.json');
  if (!fs.existsSync(configPath)) {
    console.warn(`[print-bridge] AUCUN config.json trouvé à côté de ce programme (${baseDir}).`);
    console.warn(`[print-bridge] Copiez config.example.json en config.json et renseignez l'IP réelle de l'imprimante cuisine.`);
    return { ...DEFAULT_CONFIG };
  }
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(configPath, 'utf-8')) };
  } catch (error) {
    console.error(`[print-bridge] config.json illisible (JSON invalide) : ${error.message}`);
    return { ...DEFAULT_CONFIG };
  }
}

const config = loadConfig();
// Horodatage manuel (pas toLocaleTimeString) : l'exécutable empaqueté (pkg) n'embarque pas les
// données ICU complètes, ce qui rend le formatage localisé imprévisible/illisible.
const pad2 = (n) => String(n).padStart(2, '0');
const timestamp = () => {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
};
const log = (msg) => console.log(`[${timestamp()}] ${msg}`);

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, printer: { host: config.kitchenPrinterHost, port: config.kitchenPrinterPort } }));
    return;
  }

  if (req.method === 'POST' && req.url === '/print-kitchen') {
    try {
      if (!config.kitchenPrinterHost) {
        throw new Error("config.json absent ou incomplet (kitchenPrinterHost non renseigné)");
      }
      const raw = await readBody(req);
      const data = JSON.parse(raw);
      const buffer = buildKitchenTicketEscPos(data, config);
      await sendToPrinter(buffer, {
        host: config.kitchenPrinterHost,
        port: config.kitchenPrinterPort,
        connectTimeoutMs: config.connectTimeoutMs
      });
      log(`print-kitchen OK (${data.tableLabel || '?'})`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch (error) {
      log(`print-kitchen FAILED: ${error.message || error}`);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: String(error.message || error) }));
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, error: 'Route inconnue' }));
});

server.listen(config.port, '127.0.0.1', () => {
  log(`Pont d'impression prêt sur http://127.0.0.1:${config.port} — imprimante cuisine cible : ${config.kitchenPrinterHost || '(non configurée)'}:${config.kitchenPrinterPort}`);
});
