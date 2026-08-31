// Faux serveur TCP pour tester le pont d'impression sans imprimante réelle : écoute sur le port
// 9100 (comme une vraie imprimante RAW/JetDirect) et affiche les octets reçus en hexadécimal +
// texte, puis ferme la connexion. Lancer AVANT `node index.mjs`, avec config.json pointant
// `kitchenPrinterHost` sur `127.0.0.1` et `kitchenPrinterPort` sur `9100`.
//
// Usage : node test/mock-printer.mjs

import net from 'node:net';

const PORT = 9100;

const server = net.createServer((socket) => {
  console.log(`\n--- Connexion reçue de ${socket.remoteAddress} ---`);
  const chunks = [];
  socket.on('data', (chunk) => chunks.push(chunk));
  socket.on('end', () => {
    const buffer = Buffer.concat(chunks);
    console.log(`Reçu ${buffer.length} octets :`);
    console.log(buffer.toString('hex').match(/.{1,32}/g)?.join('\n') || '(vide)');
    console.log('--- Aperçu texte (peut contenir des caractères de contrôle) ---');
    console.log(buffer.toString('latin1'));
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Fausse imprimante à l'écoute sur 127.0.0.1:${PORT}`);
});
