# BACKLOG.md

Backlog vivant de l'ERP Mouda Palace, organisé par module. Contrairement à `CLAUDE.md > Historique récent` (ce qui a été fait), ce fichier liste ce qu'il **reste** à faire.

**Règles d'usage (pour Claude comme pour l'utilisateur) :**
- Avant de démarrer une tâche sur un module : vérifier s'il existe déjà des points ouverts ici.
- Après avoir traité un point : le retirer d'ici. S'il est notable, le résumer dans `CLAUDE.md > Historique récent`.
- Après avoir repéré un gap (bug latent, fonctionnalité manquante, faille) pendant un audit ou une session de travail : l'ajouter ici avec le fichier/ligne concerné si possible, même si on ne le traite pas tout de suite.
- Ce fichier ne remplace pas le code — s'il devient faux (le point a été traité entre-temps sans être retiré d'ici), corriger en le supprimant plutôt que de le laisser trainer.

## POS / Caisse tactile (`POSTactile.tsx`)

- [ ] Remise et remboursement : le texte "validation manager requise" n'est pas appliqué — n'importe qui avec accès au POS peut valider en tapant juste un motif, aucun PIN/mot de passe manager n'est vérifié (`POSTactile.tsx:1629`, `:1683`). Impact limité tant que seul le rôle `manager` est actif en prod, mais deviendra un vrai trou dès l'ouverture du rôle staff.
- [ ] Pas de pourboire (tip) géré sur le paiement.
- [ ] Pas de partage d'addition (split bill) entre convives.
- [ ] Remise = pourcentage global du ticket, pas de remise par ligne.

## RH

- [ ] Onglets Évaluations, Formations, Rôles & Accès entièrement inaccessibles : les modals et les listeners Firestore (collections `evaluations`, `training`, `roles`) sont codés et fonctionnels, mais aucun bouton dans l'UI ne les ouvre (`RH.tsx:1548-1715`, déclenchée nulle part).
- [ ] Formations (`trainingSessions`) non persistées sur Firestore — juste du state React local, perdu au rechargement de page, contrairement à évaluations/rôles qui écrivent bien dans Firestore (`RH.tsx:231`, `:1623`).
- [ ] Planning/horaires dans `RH.tsx` (`scheduleData`, modal `isShiftModalOpen`) est du code mort dupliqué : le vrai planning fonctionne via `PlanningScheduler.tsx` (collection Firestore `shifts`) — ce code n'est jamais atteint (`RH.tsx:249`, `:1717-1764`).
- [ ] Bulletin de paie imprimé (document officiel RH) affiche des données factices figées au lieu des vraies infos employé : "QUALIFICATION" = "Employé", N°CNSS = "123456789", date de naissance = "01/01/1990", situation familiale = "M" — alors que `staff.cnss`/`staff.role` existent et sont déjà utilisés ailleurs (`RH.tsx:1175`, `:1198-1201`).

## Comptabilité

- [ ] TVA déductible sous-évaluée : les dépenses issues des commandes fournisseurs livrées (`isOrder: true`) n'ont jamais de champ `montantHT`/`tva` renseigné, et la Déclaration TVA ignore silencieusement toute dépense sans ces champs — la quasi-totalité des achats marchandises réels est donc exclue de la TVA déductible (`Accounting.tsx:318-329`, `:432-438`).
- [ ] Éditer le montant d'une facture ne recalcule pas `montantHT`/`tva` : la modale d'édition ne touche que le champ `amount` (TTC), désynchronisant la Déclaration TVA (`Accounting.tsx:1136-1157`).
- [ ] Supprimer une "dépense" liée à une commande fournisseur (`isOrder: true`) supprime le document entier de la collection `commandes` — perte de l'historique d'achat/inventaire, pas juste de l'écriture comptable (`Accounting.tsx:152-166`).
- [ ] Rapports Financiers trompeurs : "Bilan Comptable" et "Livre Journal" affichent une erreur "pas encore disponible", mais les 4 autres types (CPC, Déclaration TVA, Grand Livre, Balance des Comptes) génèrent tous le même CSV générique, sans rapport avec le type sélectionné (`Accounting.tsx:92-119`).
- [ ] Export "PDF"/"XML" des rapports simulé, retombe silencieusement en CSV avec juste un toast d'avertissement (`Accounting.tsx:98-102`).
- [ ] `AchatsFournisseurs.tsx` (1799 lignes, lié au point "commandes" ci-dessus) pas encore audité — à couvrir dans une prochaine session.

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
