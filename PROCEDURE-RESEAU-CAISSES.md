# Procédure — Réseau et imprimantes pour le passage de Tacsystems à l'ERP Mouda Palace

Ce document décrit comment brancher et configurer le réseau et les imprimantes des 2 caisses
(Patio, Rooftop) et de l'imprimante cuisine, pour que l'ERP Mouda Palace prenne le relais de
Tacsystems.

## Ce qui change par rapport à Tacsystems

Tacsystems était un logiciel installé directement sur chaque poste caisse (Windows), avec un accès
direct aux pilotes d'imprimantes — il pouvait donc envoyer une impression vers n'importe quelle
imprimante (USB ou réseau) sans intermédiaire.

Notre ERP est une **application web** (dans le navigateur Chrome). Par sécurité, un navigateur ne
peut pas ouvrir de connexion réseau directe vers une imprimante — c'est pour ça qu'on a construit
`print-bridge/` : un petit programme local qui fait ce pont uniquement pour l'imprimante cuisine
(celle sans écran). Les imprimantes-tickets USB des 2 caisses, elles, restent gérées normalement
par Windows, comme n'importe quelle imprimante.

**Le réseau physique existant (câblage, box/routeur, l'imprimante cuisine déjà en Ethernet) n'a
probablement pas besoin de changer** — Tacsystems utilisait déjà une imprimante cuisine en réseau,
donc l'infrastructure de base existe. Il s'agit surtout de reconfigurer les postes, pas de
retirer des câbles.

## Schéma cible

```
                    ┌─────────────────────┐
                    │   Box / Routeur      │
                    │   (réseau du resto)  │
                    └──────────┬───────────┘
                 ┌─────────────┼─────────────┐
                 │             │              │
          ┌──────┴─────┐ ┌─────┴──────┐ ┌─────┴──────────┐
          │ Caisse Patio│ │Caisse Rooftop│ │ Imprimante     │
          │  (PC+écran) │ │  (PC+écran)  │ │ Cuisine        │
          │             │ │              │ │ (Ethernet,     │
          │ Chrome ───┐ │ │ Chrome ───┐  │ │  pas d'écran)  │
          │ print-    │ │ │ print-    │  │ └───────┬────────┘
          │ bridge ───┼─┼─┼─bridge ───┼──┼─────────┘
          │  (local)  │ │ │  (local)  │  │  (TCP 9100, raw ESC/POS)
          │           │ │ │           │  │
          │ Imprimante│ │ │ Imprimante│
          │ tickets   │ │ │ tickets   │
          │ USB +     │ │ │ USB +     │
          │ tiroir    │ │ │ tiroir    │
          └───────────┘ │ └───────────┘
```

Chaque caisse tourne **sa propre instance** de `print-bridge` (même config, pointant vers la même
imprimante cuisine) — ce n'est pas un serveur central, chaque poste est autonome.

## Étape 1 — Vérifier le réseau existant

Sur place, avant de commencer :

- [ ] Confirmer que la box/routeur du restaurant est toujours en service et fonctionne.
- [ ] Confirmer que l'imprimante cuisine est toujours branchée en Ethernet sur ce même réseau
      (câble RJ45 vers la box, un switch, ou en WiFi si le modèle le permet).
- [ ] Vérifier que les 2 postes caisse (PC) pourront se connecter à ce même réseau — WiFi ou
      Ethernet, peu importe, **mais ils doivent être sur le même réseau local que l'imprimante
      cuisine** (pas juste "avoir Internet" — il faut qu'ils puissent physiquement l'atteindre).

## Étape 2 — Fixer l'adresse IP de l'imprimante cuisine

C'est l'étape la plus importante : si l'adresse IP de l'imprimante change (ce qui peut arriver
avec une attribution automatique/DHCP), l'impression cuisine s'arrêtera de fonctionner sans
prévenir.

**IP relevée le 2026-09-01, côté Windows du poste Patio (imprimante "CUISINE") : `192.168.1.100`,
port `9100`, protocole Raw.** C'est déjà la valeur par défaut dans `config.example.json`.

- [ ] **Fixer cette adresse** de façon permanente, de préférence via une "réservation DHCP" dans
      les réglages du routeur (associer l'adresse MAC de l'imprimante à une IP fixe) — c'est plus
      fiable qu'une IP configurée en dur sur l'imprimante elle-même. Cette adresse était déjà
      utilisée par Tacsystems, donc probablement déjà stable, mais à vérifier/sécuriser (une
      réservation DHCP évite qu'elle change un jour sans prévenir).

**Info dont j'ai besoin de ta part** : la marque/modèle exact de l'imprimante cuisine, et son
adresse IP une fois fixée. Sans ça, je ne peux pas confirmer les détails techniques d'impression
(commande de coupe papier, encodage des accents) — voir Étape 3.

## Étape 3 — Préparer chaque poste caisse (à répéter identiquement pour Patio ET Rooftop)

### 3a. Imprimante-tickets USB + tiroir-caisse

- [ ] Brancher l'imprimante-tickets en USB sur le PC de la caisse.
- [ ] Installer son pilote Windows (fourni par le fabricant, ou pilote générique "ESC/POS" /
      "Générique / Texte seul" si pas de pilote officiel).
- [ ] La définir comme **imprimante par défaut** dans Windows (Paramètres > Bluetooth et
      appareils > Imprimantes et scanners).
- [ ] Vérifier/activer le réglage "ouvrir le tiroir à l'impression" — selon le modèle, ça se fait
      soit par un interrupteur physique (DIP switch) sur l'imprimante, soit dans les propriétés du
      pilote Windows (onglet "Préférences" ou "Avancé"). C'est ce réglage qui fait que le tiroir
      s'ouvre automatiquement à chaque ticket imprimé.
- [ ] **Ne pas installer l'imprimante cuisine comme imprimante Windows sur ce poste** — elle ne
      passe pas par Windows, elle passe par `print-bridge` (voir 3c). L'installer aussi comme
      imprimante réseau Windows ne servirait à rien et risquerait de créer de la confusion.

### 3b. Chrome en "impression silencieuse" (recommandé)

Par défaut, chaque impression (ticket client, ticket cuisine de secours, ouverture tiroir, rapport
X/Z) ouvre la fenêtre d'impression standard de Chrome, qu'il faut valider manuellement. Pour que ça
imprime directement, sans clic supplémentaire :

- [ ] Créer un raccourci Chrome sur le bureau (clic droit sur le raccourci existant > Copier /
      Coller, ou clic droit sur le bureau > Nouveau > Raccourci).
- [ ] Clic droit sur ce raccourci > Propriétés > champ "Cible" : ajouter ` --kiosk-printing` à la
      fin (après les guillemets fermants du chemin vers `chrome.exe`). Exemple :
      `"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing`
- [ ] Utiliser désormais ce raccourci pour ouvrir l'application caisse — l'impression se fera
      directement sur l'imprimante par défaut de Windows (celle réglée en 3a), sans boîte de
      dialogue.
- [ ] **Démarrage automatique (recommandé)** : mettre ce raccourci dans le dossier Démarrage de
      Windows, pour que l'appli s'ouvre toute seule à l'allumage du poste, sans que personne au
      restaurant n'ait à y penser — voir la marche à suivre détaillée en 3c (même dossier
      `shell:startup`, même geste pour ce raccourci-ci et pour `print-bridge.exe`).

### 3c. Installer et configurer `print-bridge` (exécutable autonome, rien à installer)

`print-bridge` est distribué comme un `.exe` Windows autonome — **pas besoin d'installer Node.js**
sur les postes caisse, il embarque tout ce qu'il lui faut. Voir `print-bridge/README.md` pour le
détail complet.

1. Créer un dossier sur ce PC, ex. `C:\MoudaPalace\print-bridge\`.
2. Y copier deux fichiers depuis `print-bridge/` dans le dépôt :
   - `dist/print-bridge.exe`
   - `config.example.json` (à renommer en `config.json` une fois copié)
3. `config.json` est déjà pré-rempli avec la bonne IP (`192.168.1.100`, relevée à l'Étape 2) —
   normalement rien à modifier, sauf si l'imprimante cuisine change d'adresse un jour :
   ```json
   {
     "port": 4321,
     "kitchenPrinterHost": "192.168.1.100",
     "kitchenPrinterPort": 9100,
     "connectTimeoutMs": 4000,
     "codepage": "cp860",
     "escposTableNumber": 3
   }
   ```
4. Double-cliquer `print-bridge.exe` pour démarrer le pont (garder la fenêtre noire ouverte — elle
   sert de journal, un ticket réussi/échoué s'y affiche à chaque envoi ; on peut la minimiser,
   mais pas la fermer).
5. Vérifier : ouvrir `http://127.0.0.1:4321/health` dans le navigateur → doit répondre
   `{"ok":true, "printer": {...}}`.
6. **Démarrage automatique (recommandé, à faire une seule fois)** — pour que ni `print-bridge.exe`
   ni Chrome/l'ERP n'aient à être relancés manuellement à chaque allumage du poste :
   1. `Win+R` → taper `shell:startup` → Entrée. Une fenêtre Explorateur s'ouvre (le dossier
      Démarrage de Windows) — la laisser ouverte.
   2. Ouvrir une deuxième fenêtre Explorateur vers `C:\MoudaPalace\print-bridge\`.
   3. Clic droit sur `print-bridge.exe` → **Créer un raccourci**.
   4. Couper ce raccourci (Ctrl+X), le coller (Ctrl+V) dans la fenêtre du dossier Démarrage.
   5. Répéter la même chose pour le raccourci Chrome en mode silencieux créé en 3b (clic droit
      dessus → couper → coller dans le même dossier Démarrage).
   6. À partir du prochain redémarrage/connexion du poste, les deux se lancent automatiquement.

### 3d. Ouvrir l'application et choisir le poste

- [ ] Ouvrir `https://mouda-palace.vercel.app` (via le raccourci Chrome en mode silencieux, 3b).
- [ ] Se connecter avec le compte Google autorisé.
- [ ] Aller dans **Caisse Tactile** — au premier chargement sur ce poste, l'appli demande
      "Patio ou Rooftop ?" : choisir celui qui correspond à ce PC. Ce choix est mémorisé sur ce
      poste (dans le navigateur) — pas besoin de le refaire ensuite, sauf si le cache du
      navigateur est vidé.

## Étape 4 — Vérifier la configuration dans l'appli

- [ ] Dans **Configuration > Impression cuisine** : renseigner l'IP/port de l'imprimante cuisine
      (à titre indicatif/documentation pour l'équipe — l'impression réelle utilise `config.json`
      sur chaque poste, pas cette page, pour continuer à fonctionner même sans Internet).
- [ ] Vérifier que le bouton "Ouvrir le tiroir" est activé si le gérant le souhaite (même page).

## Étape 5 — Tests de bout en bout, une fois tout branché

Sur **chaque** poste (Patio, puis Rooftop) :

- [ ] Ouvrir une caisse (fond de caisse initial) → vérifier que le nom du poste s'affiche
      correctement ("Caisse ouverte · Patio" / "· Rooftop").
- [ ] Cliquer "Ouvrir le tiroir" → le tiroir doit s'ouvrir physiquement, sans boîte de dialogue si
      3b est fait.
- [ ] Passer une commande test et cliquer "Envoyer en Cuisine" → le ticket doit sortir sur
      l'imprimante cuisine (pas sur l'imprimante du poste). Vérifier le contenu (table, plats,
      quantités, accents bien affichés).
- [ ] Encaisser un paiement test → le ticket client doit s'imprimer sur l'imprimante du poste, et
      le tiroir s'ouvrir.
- [ ] Fermer la caisse en fin de test, vérifier le rapport Z.
- [ ] Test croisé : envoyer une commande en cuisine depuis Patio, puis depuis Rooftop juste après
      — les deux tickets doivent sortir correctement sur l'imprimante cuisine sans se bloquer
      l'un l'autre.

## En cas de problème

- **Le ticket cuisine ne sort pas, mais une fenêtre d'impression locale s'ouvre à la place** :
  c'est le repli de secours prévu — ça veut dire que `print-bridge` n'a pas pu joindre
  l'imprimante. Vérifier : le pont est-il lancé (fenêtre noire de `print-bridge.exe` ouverte) ?
  L'IP dans `config.json` est-elle correcte ? L'imprimante est-elle allumée et sur le même
  réseau ?
- **Les accents sont déformés sur le ticket cuisine** : ajuster `codepage` et
  `escposTableNumber` dans `config.json` selon le modèle réel de l'imprimante (voir
  `print-bridge/README.md`).
- **Le papier ne se coupe pas** : la commande de coupe dans `print-bridge/lib/escpos.js` doit
  être ajustée pour ce modèle précis, puis l'exécutable reconstruit (`npm run build-exe`) — à me
  signaler avec la référence exacte de l'imprimante, je m'en occupe et te renvoie le `.exe` à
  jour.

## Matériel confirmé (2026-09-01)

- Les 3 imprimantes (Patio, Rooftop, Cuisine) sont le même modèle : **WDLink WD8260**, 80mm,
  USB+LAN, support ESC/POS confirmé — compatible avec `print-bridge` tel quel.
- Imprimante cuisine : IP `192.168.1.100`, port `9100`, protocole Raw — déjà repris dans
  `config.example.json`.
- Restera à confirmer **au premier vrai test d'impression** (Étape 5) : que la coupe papier et les
  accents s'affichent correctement avec les réglages par défaut (CP860, table 3) — sinon on
  ajuste `print-bridge/lib/escpos.js` et je reconstruis l'exécutable.
