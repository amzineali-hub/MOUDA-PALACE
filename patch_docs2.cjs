const fs = require('fs');
let content = fs.readFileSync('src/Documentation.tsx', 'utf-8');

const targetGuide = `## 1. Achats Fournisseurs
Tout commence ici. Lorsque vous réceptionnez de la marchandise et que vous l'enregistrez dans le module **Achats fournisseurs** :
- **Mise à jour des stocks** : Les stocks théoriques (dans l'économat ou les chambres froides) sont automatiquement incrémentés.
- **Suivi financier** : Le coût d'achat est enregistré pour les calculs de rentabilité et le rapprochement comptable.
- **Traçabilité** : Les numéros de lots et DLC peuvent être renseignés dès la réception pour faciliter les contrôles qualité.

## 2. Gestion des Stocks
Une fois les achats validés, les produits arrivent dans vos **Zones de Stockage** (Chambres froides, Économat, etc.) :
- Le système surveille les quantités en **temps réel**.
- Si un produit passe sous le seuil critique (Alerte de stock), une notification est générée sur votre tableau de bord.
- Vous pouvez y ajuster les quantités manuellement (pour les pertes ou la casse) et réaliser vos inventaires périodiques.

## 3. Production Journalière
C'est ici que la transformation s'opère dans les cuisines :
- En créant une tâche de production (ex: préparation de fonds de sauce, découpe de viandes, mise en place), vous **consommez** des matières premières du stock.
- Le système **déduit automatiquement** les quantités utilisées de votre inventaire global (décrémentation des stocks).
- Les **Fiches Techniques** (Recettes) servent de guide pour s'assurer que les cuisiniers utilisent les quantités exactes prévues, limitant ainsi le gaspillage.

## 4. Traçabilité HACCP
La sécurité alimentaire est centralisée et automatisée pour répondre aux normes strictes :
- Lors de la production, des **étiquettes de traçabilité HACCP** (avec dates de préparation et DLC) peuvent être associées aux préparations.
- Le module enregistre les **relevés de températures** des chambres froides et consigne les **plans de nettoyage**.
- En cas de contrôle sanitaire, vous disposez d'un historique complet et transparent, allant de l'achat du produit initial jusqu'à sa transformation finale.

## 5. Tableau de Bord (Dashboard)
Enfin, toutes ces données convergent vers votre **Tableau de Bord global** :
- **Indicateurs financiers** : Visualisation en temps réel des coûts de production et du *Food Cost*.
- **Alertes** : Mise en évidence immédiate des stocks critiques nécessitant des réassorts.
- **Analyse de rentabilité** : Suivi de la marge brute par plat, généré par la corrélation entre vos fiches techniques, le coût de vos achats et vos ventes du jour.
- **Performance** : Ratio de pertes et suivi de l'efficacité de la brigade de production.`;

const richGuide = `## 1. 🛒 Achats Fournisseurs
Tout commence ici. Lorsque vous réceptionnez de la marchandise et que vous l'enregistrez dans le module **Achats fournisseurs** :
- **Mise à jour des stocks** : Les stocks théoriques (dans l'économat ou les chambres froides) sont automatiquement incrémentés.
- **Suivi financier** : Le coût d'achat est enregistré pour les calculs de rentabilité et le rapprochement comptable.
- **Traçabilité** : Les numéros de lots et DLC peuvent être renseignés dès la réception pour faciliter les contrôles qualité.

## 2. 📦 Gestion des Stocks
Une fois les achats validés, les produits arrivent dans vos **Zones de Stockage** (Chambres froides, Économat, etc.) :
- Le système surveille les quantités en **temps réel**.
- Si un produit passe sous le seuil critique (Alerte de stock), une notification est générée sur votre tableau de bord.
- Vous pouvez y ajuster les quantités manuellement (pour les pertes ou la casse) et réaliser vos inventaires périodiques.

## 3. 🍳 Production Journalière
C'est ici que la transformation s'opère dans les cuisines :
- En créant une tâche de production (ex: préparation de fonds de sauce, découpe de viandes, mise en place), vous **consommez** des matières premières du stock.
- Le système **déduit automatiquement** les quantités utilisées de votre inventaire global (décrémentation des stocks).
- Les **Fiches Techniques** (Recettes) servent de guide pour s'assurer que les cuisiniers utilisent les quantités exactes prévues, limitant ainsi le gaspillage.

## 4. 🛡️ Traçabilité HACCP
La sécurité alimentaire est centralisée et automatisée pour répondre aux normes strictes :
- Lors de la production, des **étiquettes de traçabilité HACCP** (avec dates de préparation et DLC) peuvent être associées aux préparations.
- Le module enregistre les **relevés de températures** des chambres froides et consigne les **plans de nettoyage**.
- En cas de contrôle sanitaire, vous disposez d'un historique complet et transparent, allant de l'achat du produit initial jusqu'à sa transformation finale.

## 5. 📊 Tableau de Bord (Dashboard)
Enfin, toutes ces données convergent vers votre **Tableau de Bord global** :
- **Indicateurs financiers** : Visualisation en temps réel des coûts de production et du *Food Cost*.
- **Alertes** : Mise en évidence immédiate des stocks critiques nécessitant des réassorts.
- **Analyse de rentabilité** : Suivi de la marge brute par plat, généré par la corrélation entre vos fiches techniques, le coût de vos achats et vos ventes du jour.
- **Performance** : Ratio de pertes et suivi de l'efficacité de la brigade de production.`;

if (content.includes(targetGuide)) {
  content = content.replace(targetGuide, richGuide);
  fs.writeFileSync('src/Documentation.tsx', content);
  console.log('Markdown made rich');
} else {
  console.log('Target not found');
}
