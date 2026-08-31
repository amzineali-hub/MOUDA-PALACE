// Pont d'impression local — tourne sur CHAQUE poste caisse (Patio, Rooftop), écoute en local
// (127.0.0.1) et relaie les tickets cuisine vers l'imprimante Ethernet de la cuisine en TCP brut.
// Voir README.md pour l'installation. Ne fait AUCUN appel réseau externe/Firestore : doit
// continuer à fonctionner même si Internet est coupé, tant que le réseau local (LAN) tient.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildKitchenTicketEscPos } from './lib/escpos.mjs';
import { sendToPrinter } from './lib/printer-socket.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadConfig() {
  const configPath = path.join(__dirname, 'config.json');
  const examplePath = path.join(__dirname, 'config.example.json');
  if (!fs.existsSync(configPath)) {
    console.warn(`[print-bridge] AUCUN config.json trouvé — copiez config.example.json vers config.json et renseignez l'IP réelle de l'imprimante cuisine.`);
    return JSON.parse(fs.readFileSync(examplePath, 'utf-8'));
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

const config = loadConfig();
const log = (msg) => console.log(`[${new Date().toLocaleTimeString('fr-FR')}] ${msg}`);

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
  log(`Pont d'impression prêt sur http://127.0.0.1:${config.port} — imprimante cuisine cible : ${config.kitchenPrinterHost}:${config.kitchenPrinterPort}`);
});
