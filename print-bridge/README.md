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
     "escposTableNumber": 3,
     "printRetries": 2,
     "printRetryDelayMs": 500
   }
   ```
   `printRetries`/`printRetryDelayMs` : nombre de nouvelles tentatives (et délai entre elles) si
   l'imprimante n'est pas joignable — utile pour un blocage réseau ou une imprimante qui redémarre.
   Un échec survenu APRÈS l'envoi des octets n'est jamais réessayé (pour ne pas imprimer deux fois
   le même ticket).
3. Double-cliquer `print-bridge.exe` pour démarrer le pont (une fenêtre noire (console) s'ouvre et
   doit rester ouverte — chaque ticket envoyé y affiche succès/échec ; le même journal est aussi
   écrit dans `print-bridge.log` à côté de l'exécutable, utile si la fenêtre est fermée par erreur
   ou si le pont tourne en service Windows sans fenêtre visible, voir section Windows 7 ci-dessous).
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

## Poste Windows 7 32-bit

`print-bridge.exe` est empaqueté pour `node18-win-x64` — **ça ne tournera pas** sur un poste
Windows 7, pour deux raisons cumulées :
- Node.js 18+ exige Windows 10 ou plus récent (V8 utilise des API absentes de Windows 7).
- Windows 7 32-bit exclut de toute façon les builds `x64`.

Reconstruire l'exe en ciblant un Node plus ancien compatible 32-bit (`node14-win-x86` etc.) ne
marche pas non plus ici : `pkg` n'a pas de binaire de base tout prêt pour ces cibles anciennes et
tente de recompiler Node depuis les sources, ce qui demande une installation complète de Visual
Studio (`vcbuild.bat`).

**Solution retenue pour ce poste : installer un vrai Node.js 32-bit et lancer le pont depuis les
sources** (pas de `.exe`), habillé en service Windows pour la fiabilité :

1. **Installer Node.js 32-bit compatible Windows 7** — télécharger le `.msi` "Windows Installer
   (.msi) 32-bit" depuis `nodejs.org/dist/`. Essayer dans cet ordre (le premier qui installe et
   répond à `node -v` dans une invite de commandes convient) :
   - `v12.22.12` (dernière version LTS documentée comme compatible Windows 7) — le choix le plus
     sûr, à essayer en premier.
   - `v14.21.3` en repli si besoin d'API JS plus récentes.
   - Windows 7 SP1 doit être installé, avec la mise à jour du Universal C Runtime (KB2999226) si
     elle n'est pas déjà présente — sinon Node échoue au lancement avec une erreur de DLL
     manquante (`api-ms-win-crt-*.dll`).
2. Copier le dossier `print-bridge/` (code source, pas le contenu de `dist/`) sur le poste, puis
   dans une invite de commandes à cet endroit : `npm install` (installe `iconv-lite`, pas de
   compilation native requise).
3. Configurer `config.json` comme d'habitude (voir Installation ci-dessus).
4. Tester manuellement d'abord : `start-bridge.bat` doit afficher "Pont d'impression prêt...".
   Vérifier `http://127.0.0.1:4321/health`.
5. **Installer comme service Windows avec [NSSM](https://nssm.cc/)** (fonctionne sur Windows 7,
   contrairement à un simple raccourci dans `shell:startup` qui exige une session ouverte et ne
   redémarre pas le pont s'il plante) :
   ```
   nssm install MoudaPrintBridge "C:\Program Files\nodejs\node.exe" "C:\MoudaPalace\print-bridge\index.js"
   nssm set MoudaPrintBridge AppDirectory "C:\MoudaPalace\print-bridge"
   nssm set MoudaPrintBridge AppExit Default Restart
   nssm start MoudaPrintBridge
   ```
   Le service démarre avant toute connexion utilisateur et NSSM relance automatiquement le
   processus s'il se termine de façon inattendue. Comme il n'y a plus de fenêtre console visible,
   toute la surveillance se fait via `print-bridge.log` (créé à côté de `index.js`, tourne
   automatiquement vers `.log.old` au-delà de 2 Mo).

⚠️ Ce poste étant sous Windows 7, le navigateur utilisé pour l'appli caisse (Chrome/Firefox) tourne
lui aussi sur une version non maintenue depuis 2023-2025 (plus de correctifs de sécurité, TLS
potentiellement obsolète face à Firestore). C'est un risque accepté connu pour ce poste, distinct
du pont d'impression — à garder en tête en cas de comportement erratique de la caisse elle-même.

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
