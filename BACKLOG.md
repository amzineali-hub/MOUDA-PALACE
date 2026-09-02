# BACKLOG.md

Backlog vivant de l'ERP Mouda Palace, organisé par module. Contrairement à `CLAUDE.md > Historique récent` (ce qui a été fait), ce fichier liste ce qu'il **reste** à faire.

**Règles d'usage (pour Claude comme pour l'utilisateur) :**
- Avant de démarrer une tâche sur un module : vérifier s'il existe déjà des points ouverts ici.
- Après avoir traité un point : le retirer d'ici. S'il est notable, le résumer dans `CLAUDE.md > Historique récent`.
- Après avoir repéré un gap (bug latent, fonctionnalité manquante, faille) pendant un audit ou une session de travail : l'ajouter ici avec le fichier/ligne concerné si possible, même si on ne le traite pas tout de suite.
- Ce fichier ne remplace pas le code — s'il devient faux (le point a été traité entre-temps sans être retiré d'ici), corriger en le supprimant plutôt que de le laisser trainer.

## POS / Caisse tactile (`POSTactile.tsx`)

- [ ] Pas de pourboire (tip) géré sur le paiement.
- [ ] Pas de partage d'addition (split bill) entre convives.
- [ ] Remise = pourcentage global du ticket, pas de remise par ligne.
- [ ] "Flash Journée" (mini-rapport rapide en cours de service, vu chez Tacsystems à côté de RAZ Fin Journée/Annuler Commande) — pas d'équivalent, distinct du Rapport X déjà existant qui est plus complet/formel.
- [ ] Horodatage par ligne d'article (heure d'ajout de chaque plat au ticket, vu sur l'écran de commande Tacsystems) — pas stocké/affiché actuellement.

## RH

- [ ] `templates/rh/Demande_Explication_Modele.docx`, `Notification_Avertissement_Modele.docx` et `Reglement_Interieur_Modele.docx` sont des modèles Word prêts (comme les modèles CDI/CDD dont le contenu a été repris pour la génération HTML des contrats) mais ne sont référencés nulle part dans le code — ni téléchargeables depuis l'UI, ni utilisés pour générer un document. À décider : les rendre téléchargeables tels quels (comme les "modèles légaux téléchargeables" de l'onglet Documents RH), ou les transformer en documents générés (même mécanisme que CDI/CDD/Attestation).

## Comptabilité

Audité en détail le 2026-08-20 (`Accounting.tsx` 1907 lignes + `AchatsFournisseurs.tsx` 1799 lignes, jamais audité jusque-là). Les 4 points les plus graves (double comptage des achats + mauvais montant, TVA jamais reportée sur les dépenses de réception, faux Bilan Comptable, export dépenses qui crashait) ont été corrigés le soir même — voir `CLAUDE.md > Historique récent`. Restent à traiter :

- [ ] Éditer le montant d'une facture ne recalcule pas `montantHT`/`tva` : la modale d'édition ne touche que le champ `amount` (TTC), désynchronisant la Déclaration TVA (`Accounting.tsx:1136-1157`).
- [ ] "Livre Journal" affiche une erreur "pas encore disponible", et les 4 autres types (CPC, Déclaration TVA, Grand Livre, Balance des Comptes) génèrent tous le même CSV générique, sans rapport avec le type sélectionné (`Accounting.tsx:92-119`).
- [ ] Export "PDF"/"XML" des rapports simulé, retombe silencieusement en CSV avec juste un toast d'avertissement (`Accounting.tsx:98-102`).
- [ ] Le bouton "Générer et télécharger" enregistre toujours le rapport avec le statut "Généré" dans `financialReports`, même quand `handleDownloadReport` vient d'afficher une erreur et de s'arrêter (Bilan/Livre Journal).
- [ ] `AchatsFournisseurs.tsx` : `console.log('Fetched Commandes:'...)`/`'Fetched Fournisseurs:'...` laissés dans les listeners Firestore (`:156`, `:165`) — bruit en prod, expose le contenu des commandes dans la console de tout utilisateur connecté.
- [ ] `AchatsFournisseurs.tsx` : le sélecteur de statut de commande (`:182-221`) permet de passer une commande à "Payée" (répercute automatiquement le paiement sur la dépense liée, `:192-197`) sans double validation. Sans risque tant que seul `manager` a accès — à verrouiller avant l'ouverture d'autres rôles (ex. un poste "Achats" qui ne devrait pas pouvoir s'auto-valider "Payée").
- [ ] `AchatsFournisseurs.tsx` : le sélecteur de statut de commande (`:182-221`) permet de passer une commande à "Payée" (répercute automatiquement le paiement sur la dépense liée, `:192-197`) sans double validation. Sans risque tant que seul `manager` a accès — à verrouiller avant l'ouverture d'autres rôles (ex. un poste "Achats" qui ne devrait pas pouvoir s'auto-valider "Payée").

## Stocks & Inventaire

- [ ] `src/Inventory.tsx` (108 lignes) est un fichier mort, jamais importé — le vrai module Stocks est défini inline dans `App.tsx` (fonction `Inventory()`, `App.tsx:2981-6031`). Risque de confusion/édition du mauvais fichier (`App.tsx:2981`, `src/Inventory.tsx`).
- [ ] Onglet "Fournisseurs" (annuaire) inaccessible : son contenu existe (`App.tsx:4023`, boutons "Nouvelle Commande"/"Nouveau Fournisseur") mais `'suppliers'` est absent du tableau des onglets rendus (`App.tsx:3489`) — code mort, fonctionnalité invisible en UI.
- [ ] "Ratio de perte estimé" sur l'onglet Pertes & Gaspillage est une valeur codée en dur ("2.4% ↓ 0.5%"), pas calculée à partir des vraies déclarations de perte (`App.tsx:3903`).
- [ ] À vérifier visuellement (pas de gap logique confirmé) : structure JSX suspecte autour des filtres de l'onglet "stocks" (`App.tsx` ~3410-3475), possible bug de mise en page englobant les boutons d'alerte stock et le select de péremption.

## Réservations / B2B / Autres

- [ ] Espace Partenaire (`PartnerPortal`) : porte d'accès décorative — `isAuthenticated` initialisé à `true`, le formulaire de code ne s'affiche jamais, et le composant est appelé sans aucun `partnerId` (`App.tsx:584`, `:6706-6708`).
- [ ] Même si la porte était activée, la validation n'est pas réelle : toute saisie de plus de 3 caractères est acceptée, sans comparaison avec le champ `accessCode` du vrai partenaire en base (`App.tsx:6727-6733`).
- [ ] Espace Partenaire affiche des données 100% fictives et identiques pour tout le monde (nom "Riad Dar Al Medina", commissions, historique) au lieu des vraies données Firestore du partenaire connecté (`App.tsx:6792-6825`). Point le plus sérieux : portail censé servir de vrais partenaires externes, ni sécurisé ni fonctionnel.
- [ ] Envoi de confirmation SMS/WhatsApp/Email depuis Réservations simulé : toast de succès affiché, aucun message réellement envoyé (`App.tsx:2264`, `:2274`, `:2284`).

Confirmé et à jour (pas de gap) : `waitlist` est bien Firestore-backed (`onSnapshot`, `App.tsx:1651`) ; `B2BPortal` utilise de vraies données Firestore (`App.tsx:2395`) ; boutons Confirmer/Refuser réservation fonctionnels (`App.tsx:1849-1883`).
