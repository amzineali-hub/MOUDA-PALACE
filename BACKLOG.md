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
- [ ] Remboursement = ticket entier uniquement, pas de remboursement partiel par article.
- [ ] Remise = pourcentage global du ticket, pas de remise par ligne.
- [ ] Pas de rapport X/Z formel de caisse (l'ouverture/fermeture de quart calcule un écart mais sans document dédié imprimable).

## RH

_(à peupler au fil des prochaines sessions)_

## Comptabilité

_(à peupler au fil des prochaines sessions)_

## Stocks & Inventaire

_(à peupler au fil des prochaines sessions)_

## Réservations / B2B / Autres

_(à peupler au fil des prochaines sessions)_
