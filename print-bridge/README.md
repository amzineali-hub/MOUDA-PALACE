# print-bridge

Petit pont local d'impression réseau pour le POS Mouda Palace. Un navigateur ne peut pas ouvrir
de connexion réseau brute vers l'imprimante Ethernet de la cuisine — ce programme tourne en local
sur **chaque poste caisse** (Patio et Rooftop, chacun sa propre instance) et fait ce saut réseau à
sa place.

Distribué comme un **exécutable Windows autonome** (`print-bridge.exe`) — aucune installation de
Node.js n'est nécessaire sur les postes caisse, il embarque tout ce qu'il lui faut.

## Installation (à faire sur CHAQUE poste caisse)

1. Copier deux fichiers dans un dossier sur le poste caisse (ex. `C:\MoudaPalace\print-bridge\`) :
   - `dist/print-bridge.exe`
   - `config.example.json` (renommé en `config.json`, voir ci-dessous)
2. Ouvrir `config.json` avec le Bloc-notes et renseigner l'IP réelle de l'imprimante cuisine
   (**la même adresse sur les 2 postes** — c'est la même imprimante physique) :
   ```json
   {
     "port": 4321,
     "kitchenPrinterHost": "192.168.1.50",
     "kitchenPrinterPort": 9100,
     "connectTimeoutMs": 4000,
     "codepage": "cp860",
     "escposTableNumber": 3
   }
   ```
3. Double-cliquer `print-bridge.exe` pour démarrer le pont (une fenêtre noire (console) s'ouvre et
   doit rester ouverte — elle sert aussi de journal : chaque ticket envoyé y affiche succès/échec).
4. Pour un démarrage automatique à l'ouverture de session Windows : `Win+R` → taper
   `shell:startup` → déposer un raccourci vers `print-bridge.exe` dans le dossier qui s'ouvre.

## Vérifier que ça marche

- `http://127.0.0.1:4321/health` dans un navigateur doit répondre `{"ok":true, "printer": {...}}`.
- Sans imprimante réelle sous la main : lancer `npm run mock-printer` (nécessite le code source +
  Node.js, voir section Développement) dans un second terminal — simule l'imprimante en local —,
  pointer `kitchenPrinterHost` sur `127.0.0.1` dans `config.json`, puis tester avec :
  ```
  curl -X POST http://127.0.0.1:4321/print-kitchen -H "Content-Type: application/json" -d "{\"tableLabel\":\"Table 4\",\"waveLabel\":\"Commande\",\"time\":\"12:30\",\"items\":[{\"name\":\"Tajine\",\"qty\":2,\"modifiers\":{\"cooking\":\"bien cuit\"}}]}"
  ```
  Le terminal du mock-printer affiche les octets reçus.

## À vérifier une fois l'imprimante cuisine réelle connue

- Le numéro de table de codepage ESC/POS (`escposTableNumber`) et le codepage d'encodage
  (`codepage`) dans `config.json` doivent correspondre au modèle réel — sinon les accents
  (é, à, ç...) peuvent s'imprimer déformés. Valeur par défaut : CP860 (français), table `3`.
- La commande de coupe papier (`CUT_COMMAND` dans `lib/escpos.js`) est réglée sur une coupe
  partielle standard — certains modèles attendent une autre séquence, à ajuster si le papier ne se
  coupe pas (nécessite de reconstruire l'exécutable, voir Développement).

## Ce que ce pont ne fait PAS

- Il ne lit aucune configuration depuis Firestore/Internet — volontairement, pour que l'impression
  cuisine continue de fonctionner même si la connexion Internet du restaurant est coupée. La page
  Configuration de l'application peut afficher l'IP de l'imprimante à titre indicatif, mais c'est
  `config.json` sur chaque poste qui fait foi.
- Il ne gère pas les tickets clients ni le tiroir-caisse (imprimantes USB, gérées directement par
  le pilote Windows + `window.print()` côté application — voir POSTactile.tsx).

## Développement (reconstruire l'exécutable)

Le code source (`index.js`, `lib/`) est en CommonJS, choisi spécifiquement pour être empaqueté de
façon fiable en `.exe` autonome.

1. `npm install` (installe `iconv-lite` + l'outil d'empaquetage `@yao-pkg/pkg`).
2. `npm start` — lance le pont directement depuis le code source (utile pour tester une
   modification sans reconstruire l'exe à chaque fois).
3. `npm run build-exe` — reconstruit `dist/print-bridge.exe`. À refaire à chaque modification de
   `index.js`/`lib/*.js` (par exemple après avoir ajusté la commande de coupe papier ou le
   codepage pour un modèle d'imprimante précis).

`dist/` et `node_modules/` ne sont pas versionnés (voir `.gitignore` à la racine du dépôt) — c'est
un artefact de build, à régénérer localement.
