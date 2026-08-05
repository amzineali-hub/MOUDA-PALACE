const fs = require('fs');
const content = fs.readFileSync('src/Documentation.tsx', 'utf-8');

const newGuide = `  },
  {
    id: 12,
    title: 'Automatisation de la Production (De l\\'Achat au Dashboard)',
    description: 'Guide détaillé sur le cycle de vie des produits : Achats, gestion des Stocks, suivi de Production, normes HACCP et reporting.',
    level: 'Avancé',
    steps: 5,
    category: 'kitchen',
    content: \`# Automatisation de la Production : Le cycle complet

Ce guide détaille le fonctionnement du système de production intégré, et comment les données transitent automatiquement d'un module à l'autre pour assurer un suivi précis de vos coûts et de l'hygiène.

<h2 data-mockup="achats">1. Achats Fournisseurs</h2>
Tout commence ici. Lorsque vous réceptionnez de la marchandise et que vous l'enregistrez dans le module **Achats fournisseurs** :
- **Mise à jour des stocks** : Les stocks théoriques (dans l'économat ou les chambres froides) sont automatiquement incrémentés.
- **Suivi financier** : Le coût d'achat est enregistré pour les calculs de rentabilité et le rapprochement comptable.
- **Traçabilité** : Les numéros de lots et DLC peuvent être renseignés dès la réception pour faciliter les contrôles qualité.

<h2 data-mockup="inventory">2. Gestion des Stocks</h2>
Une fois les achats validés, les produits arrivent dans vos **Zones de Stockage** (Chambres froides, Économat, etc.) :
- Le système surveille les quantités en **temps réel**.
- Si un produit passe sous le seuil critique (Alerte de stock), une notification est générée sur votre tableau de bord.
- Vous pouvez y ajuster les quantités manuellement (pour les pertes ou la casse) et réaliser vos inventaires périodiques.

<h2 data-mockup="production">3. Production Journalière</h2>
C'est ici que la transformation s'opère dans les cuisines :
- En créant une tâche de production (ex: préparation de fonds de sauce, découpe de viandes, mise en place), vous **consommez** des matières premières du stock.
- Le système **déduit automatiquement** les quantités utilisées de votre inventaire global (décrémentation des stocks).
- Les **Fiches Techniques** (Recettes) servent de guide pour s'assurer que les cuisiniers utilisent les quantités exactes prévues, limitant ainsi le gaspillage.

<h2 data-mockup="haccp">4. Traçabilité HACCP</h2>
La sécurité alimentaire est centralisée et automatisée pour répondre aux normes strictes :
- Lors de la production, des **étiquettes de traçabilité HACCP** (avec dates de préparation et DLC) peuvent être associées aux préparations.
- Le module enregistre les **relevés de températures** des chambres froides et consigne les **plans de nettoyage**.
- En cas de contrôle sanitaire, vous disposez d'un historique complet et transparent, allant de l'achat du produit initial jusqu'à sa transformation finale.

<h2 data-mockup="dashboard">5. Tableau de Bord (Dashboard)</h2>
Enfin, toutes ces données convergent vers votre **Tableau de Bord global** :
- **Indicateurs financiers** : Visualisation en temps réel des coûts de production et du *Food Cost*.
- **Alertes** : Mise en évidence immédiate des stocks critiques nécessitant des réassorts.
- **Analyse de rentabilité** : Suivi de la marge brute par plat, généré par la corrélation entre vos fiches techniques, le coût de vos achats et vos ventes du jour.
- **Performance** : Ratio de pertes et suivi de l'efficacité de la brigade de production.
\`
  }
];`;

const newContent = content.replace('  }\n];', newGuide);

if (content !== newContent) {
  fs.writeFileSync('src/Documentation.tsx', newContent);
  console.log('Documentation.tsx patched successfully');
} else {
  console.log('Could not find the target to replace in Documentation.tsx');
}
