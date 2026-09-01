// Construit un ticket cuisine en octets ESC/POS bruts, à partir de la même forme de données que
// l'ancien `buildKitchenTicketHtml` de POSTactile.tsx : { tableLabel, waveLabel, time, items }.
// Volontairement autonome (aucun import depuis src/lib) pour que print-bridge/ reste un dossier
// copiable tel quel sur un poste caisse, indépendant du reste du dépôt.

const iconv = require('iconv-lite');

const ESC = 0x1b;
const GS = 0x1d;

const INIT = Buffer.from([ESC, 0x40]);
const BOLD_ON = Buffer.from([ESC, 0x45, 0x01]);
const BOLD_OFF = Buffer.from([ESC, 0x45, 0x00]);
const DOUBLE_SIZE = Buffer.from([GS, 0x21, 0x11]);
const NORMAL_SIZE = Buffer.from([GS, 0x21, 0x00]);
const FEED_LINES = (n) => Buffer.from([ESC, 0x64, n]);
// Coupe partielle — à vérifier/ajuster une fois la marque/modèle de l'imprimante cuisine connu
// (certains modèles attendent `GS V 66 0` pour une coupe totale au lieu de cette forme courte).
const CUT_COMMAND = Buffer.from([GS, 0x56, 0x01]);
const selectCodepage = (tableNumber) => Buffer.from([ESC, 0x74, tableNumber]);

function text(str, codepage) {
  return iconv.encode(str, codepage);
}

function itemLine(item, codepage) {
  const qty = Number(item.qty ?? item.quantity) > 0 ? Number(item.qty ?? item.quantity) : 1;
  const name = item.name || 'Article';
  const parts = [BOLD_ON, text(`${qty}x ${name}\n`, codepage), BOLD_OFF];

  const modifiers = item.modifiers;
  if (modifiers && (modifiers.cooking || modifiers.extra || modifiers.note)) {
    const modText = [modifiers.cooking, modifiers.extra, modifiers.note].filter(Boolean).join(' · ');
    parts.push(text(`  ${modText}\n`, codepage));
  }
  return Buffer.concat(parts);
}

function buildKitchenTicketEscPos(data, { codepage = 'cp860', escposTableNumber = 3 } = {}) {
  const separator = '-'.repeat(32) + '\n';
  const chunks = [
    INIT,
    selectCodepage(escposTableNumber),
    BOLD_ON,
    DOUBLE_SIZE,
    text('CUISINE\n', codepage),
    NORMAL_SIZE,
    BOLD_OFF,
    BOLD_ON,
    text(`${data.tableLabel}\n`, codepage),
    BOLD_OFF,
    text(`${data.waveLabel} - ${data.time}\n`, codepage),
    text(separator, codepage),
    ...(data.items || []).map((item) => itemLine(item, codepage)),
    text(separator, codepage),
    FEED_LINES(3),
    CUT_COMMAND
  ];
  return Buffer.concat(chunks);
}

module.exports = { buildKitchenTicketEscPos };
