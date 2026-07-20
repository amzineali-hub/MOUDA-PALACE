const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetPrompt = `      const prompt = \`Traduisez les noms et descriptions de plats suivants du français vers l'anglais, l'espagnol et l'arabe.
Renvoie un tableau JSON où chaque élément correspond à l'entrée et contient "id", "translations": { "en": { "name": "...", "desc": "..." }, "es": { "name": "...", "desc": "..." }, "ar": { "name": "...", "desc": "..." } }.
Plats à traduire :
\${JSON.stringify(items.map((i: any) => ({ id: i.id, name: i.name, desc: i.desc })))}

Format de réponse attendu:
[
  {
    "id": 1,
    "translations": {
      "en": { "name": "...", "desc": "..." },
      "es": { "name": "...", "desc": "..." },
      "ar": { "name": "...", "desc": "..." }
    }
  }
]
Ne renvoie QUE le tableau JSON valide. Ne rajoute pas de texte avant ou après.\`;`;

const replacementPrompt = `      const prompt = \`Traduisez les noms et descriptions de plats suivants du français vers l'anglais, l'espagnol, l'arabe, l'allemand, le chinois, le coréen et le portugais.
Renvoie un tableau JSON où chaque élément correspond à l'entrée et contient "id", "translations": { "en": { "name": "...", "desc": "..." }, "es": { "name": "...", "desc": "..." }, "ar": { "name": "...", "desc": "..." }, "de": { "name": "...", "desc": "..." }, "zh": { "name": "...", "desc": "..." }, "ko": { "name": "...", "desc": "..." }, "pt": { "name": "...", "desc": "..." } }.
Plats à traduire :
\${JSON.stringify(items.map((i: any) => ({ id: i.id, name: i.name, desc: i.desc })))}

Format de réponse attendu:
[
  {
    "id": 1,
    "translations": {
      "en": { "name": "...", "desc": "..." },
      "es": { "name": "...", "desc": "..." },
      "ar": { "name": "...", "desc": "..." },
      "de": { "name": "...", "desc": "..." },
      "zh": { "name": "...", "desc": "..." },
      "ko": { "name": "...", "desc": "..." },
      "pt": { "name": "...", "desc": "..." }
    }
  }
]
Ne renvoie QUE le tableau JSON valide. Ne rajoute pas de texte avant ou après.\`;`;

content = content.replace(targetPrompt, replacementPrompt);
fs.writeFileSync('server.ts', content);
