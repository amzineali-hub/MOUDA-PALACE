// Envoi brut d'un buffer d'octets vers une imprimante réseau (protocole RAW/JetDirect, port TCP
// 9100 — quasi universel sur les imprimantes thermiques Ethernet). Un timeout explicite est
// indispensable : une imprimante éteinte, une IP fausse, ou un bourrage papier ne doivent jamais
// bloquer indéfiniment la caisse qui attend la réponse.

const net = require('node:net');

function sendToPrinter(buffer, { host, port, connectTimeoutMs = 4000 }) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const settle = (fn, arg) => {
      if (settled) return;
      settled = true;
      fn(arg);
    };

    const socket = new net.Socket();
    socket.setTimeout(connectTimeoutMs);

    // `dataSent` distingue un échec avant écriture (imprimante pas encore prête, réseau —
    // sans risque à réessayer) d'un échec après écriture (le ticket est peut-être déjà parti
    // vers l'imprimante — réessayer risquerait de l'imprimer deux fois). Voir `sendWithRetry`
    // dans index.js, qui ne réessaie que si `error.retryable` est vrai.
    let dataSent = false;

    socket.once('timeout', () => {
      socket.destroy();
      const error = new Error(`Connexion à l'imprimante (${host}:${port}) expirée après ${connectTimeoutMs}ms`);
      error.retryable = !dataSent;
      settle(reject, error);
    });

    socket.once('error', (err) => {
      err.retryable = !dataSent;
      settle(reject, err);
    });

    socket.once('close', () => settle(resolve, undefined));

    socket.connect(port, host, () => {
      socket.write(buffer, (err) => {
        dataSent = true;
        if (err) {
          err.retryable = false;
          settle(reject, err);
          return;
        }
        socket.end();
      });
    });
  });
}

module.exports = { sendToPrinter };
