# print-bridge

Petit pont local d'impression réseau pour le POS Mouda Palace. Un navigateur ne peut pas ouvrir
de connexion réseau brute vers l'imprimante Ethernet de la cuisine — ce script tourne en local sur
**chaque poste caisse** (Patio et Rooftop, chacun sa propre instance) et fait ce saut réseau à sa
place.

Ce dossier est **autonome** : il n'est pas construit ni déployé avec le reste de l'application
(Vite/Vercel). Il se copie et se lance indépendamment sur chaque poste caisse.

## Installation (à faire sur CHAQUE poste caisse)

1. Installer [Node.js LTS](https://nodejs.org/).
2. Copier ce dossier `print-bridge/` sur la machine (pas besoin du reste du dépôt).
3. Ouvrir un terminal dans ce dossier puis : `npm install`
4. Copier `config.example.json` en `config.json`, et renseigner l'IP réelle de l'imprimante
   cuisine (**la même adresse sur les 2 postes** — c'est la même imprimante physique) :
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
5. Double-cliquer `start-bridge.bat` pour démarrer le pont (laisser la fenêtre ouverte — elle sert
   aussi de journal : chaque ticket envoyé y affiche succès/échec).
6. Pour un démarrage automatique à l'ouverture de session Windows : `Win+R` → taper
   `shell:startup` → déposer un raccourci vers `start-bridge.bat` dans le dossier qui s'ouvre.

## Vérifier que ça marche

- `http://127.0.0.1:4321/health` dans un navigateur doit répondre `{"ok":true, "printer": {...}}`.
- Sans imprimante réelle sous la main : lancer `npm run mock-printer` dans un second terminal
  (simule l'imprimante en local), pointer `kitchenPrinterHost` sur `127.0.0.1` dans `config.json`,
  puis tester avec :
  ```
  curl -X POST http://127.0.0.1:4321/print-kitchen -H "Content-Type: application/json" -d "{\"tableLabel\":\"Table 4\",\"waveLabel\":\"Commande\",\"time\":\"12:30\",\"items\":[{\"name\":\"Tajine\",\"qty\":2,\"modifiers\":{\"cooking\":\"bien cuit\"}}]}"
  ```
  Le terminal du mock-printer affiche les octets reçus.

## À vérifier une fois l'imprimante cuisine réelle connue

- Le numéro de table de codepage ESC/POS (`escposTableNumber`) et le codepage d'encodage
  (`codepage`) dans `config.json` doivent correspondre au modèle réel — sinon les accents
  (é, à, ç...) peuvent s'imprimer déformés. Valeur par défaut : CP860 (français), table `3`.
- La commande de coupe papier (`CUT_COMMAND` dans `lib/escpos.mjs`) est réglée sur une coupe
  partielle standard — certains modèles attendent une autre séquence, à ajuster si le papier ne se
  coupe pas.

## Ce que ce pont ne fait PAS

- Il ne lit aucune configuration depuis Firestore/Internet — volontairement, pour que l'impression
  cuisine continue de fonctionner même si la connexion Internet du restaurant est coupée. La page
  Configuration de l'application peut afficher l'IP de l'imprimante à titre indicatif, mais c'est
  `config.json` sur chaque poste qui fait foi.
- Il ne gère pas les tickets clients ni le tiroir-caisse (imprimantes USB, gérées directement par
  le pilote Windows + `window.print()` côté application — voir POSTactile.tsx).
