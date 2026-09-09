// Journal fichier en plus de la console — indispensable dès que le pont tourne en service Windows
// (NSSM) sans fenêtre console visible : c'est le seul moyen de vérifier après coup ce qui s'est
// passé (ticket envoyé, échec, imprimante injoignable...).

const fs = require('node:fs');
const path = require('node:path');

const MAX_LOG_BYTES = 2 * 1024 * 1024; // 2 Mo — au-delà, on fait tourner vers .log.old

const pad2 = (n) => String(n).padStart(2, '0');
const timestamp = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
};

function createLogger(baseDir) {
  const logPath = path.join(baseDir, 'print-bridge.log');

  function rotateIfNeeded() {
    try {
      if (fs.statSync(logPath).size > MAX_LOG_BYTES) {
        fs.renameSync(logPath, `${logPath}.old`);
      }
    } catch {
      // Pas encore de fichier — rien à faire.
    }
  }

  return function log(msg) {
    const line = `[${timestamp()}] ${msg}`;
    console.log(line);
    try {
      rotateIfNeeded();
      fs.appendFileSync(logPath, line + '\n');
    } catch (error) {
      console.error(`[print-bridge] Écriture du journal impossible: ${error.message}`);
    }
  };
}

module.exports = { createLogger };
