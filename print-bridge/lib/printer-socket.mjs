// Envoi brut d'un buffer d'octets vers une imprimante réseau (protocole RAW/JetDirect, port TCP
// 9100 — quasi universel sur les imprimantes thermiques Ethernet). Un timeout explicite est
// indispensable : une imprimante éteinte, une IP fausse, ou un bourrage papier ne doivent jamais
// bloquer indéfiniment la caisse qui attend la réponse.

import net from 'node:net';

export function sendToPrinter(buffer, { host, port, connectTimeoutMs = 4000 }) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const settle = (fn, arg) => {
      if (settled) return;
      settled = true;
      fn(arg);
    };

    const socket = new net.Socket();
    socket.setTimeout(connectTimeoutMs);

    socket.once('timeout', () => {
      socket.destroy();
      settle(reject, new Error(`Connexion à l'imprimante (${host}:${port}) expirée après ${connectTimeoutMs}ms`));
    });

    socket.once('error', (err) => settle(reject, err));

    socket.once('close', () => settle(resolve, undefined));

    socket.connect(port, host, () => {
      socket.write(buffer, (err) => {
        if (err) {
          settle(reject, err);
          return;
        }
        socket.end();
      });
    });
  });
}
