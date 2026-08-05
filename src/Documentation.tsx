import React, { useState, useEffect } from 'react';
import { Search, BookOpen, ChevronRight, FileText, MessageCircle, ArrowLeft, CalendarCheck, ChefHat, Users, Receipt, Megaphone } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { ModuleMockup } from './ModuleMockups';

const categories = [
  { id: 'all', label: 'Tous', icon: <BookOpen size={16} /> },
  { id: 'start', label: 'Démarrage', icon: <FileText size={16} /> },
  { id: 'reservations', label: 'Réservations & CRM', icon: <CalendarCheck size={16} /> },
  { id: 'marketing', label: 'Marketing & IA', icon: <Megaphone size={16} /> },
  { id: 'kitchen', label: 'Cuisine', icon: <ChefHat size={16} /> },
  { id: 'staff', label: 'Ressources Humaines', icon: <Users size={16} /> },
  { id: 'accounting', label: 'Finance', icon: <Receipt size={16} /> },
];

const guides = [
  {
    id: 1,
    title: 'Premiers pas avec Mouda Palace SaaS',
    description: 'Découvrez l\'interface principale, le tableau de bord, navigation générale et paramétrage de votre profil.',
    level: 'Débutant',
    steps: 5,
    category: 'start',
    content: `
# Premiers pas avec Mouda Palace SaaS

Bienvenue dans votre nouvel outil de gestion hôtelière. Ce guide vous aidera à démarrer rapidement.

## 1. Le Tableau de bord
Votre point d'entrée centralisé. Ici, vous retrouverez :
- Vos indicateurs clés (Taux d'occupation, Revenus)
- Les arrivées et départs du jour
- Les notifications importantes

## 2. Navigation
Utilisez la barre latérale gauche pour naviguer entre les différents modules :
- **Réservations** : Pour la gestion de vos chambres et clients.
- **Menu Digital** : Gérez la carte du restaurant.
- **WhatsApp & IA** : Votre assistant IA pour la communication client.

## 3. Paramètres
N'oubliez pas de configurer votre profil et vos préférences dans l'onglet **Configuration** en bas de la barre latérale.
    `
  },
  {
    id: 2,
    title: 'Gestion des Réservations',
    description: 'Comment prendre une réservation, gérer le plan de salle, et utiliser la liste d\'attente efficacement.',
    level: 'Débutant',
    steps: 4,
    category: 'reservations',
    content: `
# Gestion des Réservations

## Ajouter une réservation
1. Allez dans le module **Réservations (CRM)**.
2. Cliquez sur le bouton **Nouvelle Réservation**.
3. Remplissez les informations du client (Nom, Email, Téléphone).
4. Sélectionnez les dates de séjour et le type de chambre.
5. Cliquez sur **Enregistrer**.

## Visualisation
Vous pouvez voir vos réservations sous forme de liste ou sur le calendrier. Le code couleur vous indique le statut (Confirmé, En attente, Annulé).
    `
  },
  {
    id: 3,
    title: 'Portail B2B Riads',
    description: 'Configuration des commissions partenaires, gestion des réservations B2B et suivi des paiements des concierges.',
    level: 'Intermédiaire',
    steps: 6,
    category: 'reservations',
    content: `
# Portail B2B Riads

Le portail B2B vous permet de gérer vos partenaires (Riads, Conciergeries) et leurs commissions.

## Ajouter un partenaire
Dans le module B2B, ajoutez un nouveau partenaire et définissez son taux de commission (ex: 10%).

## Suivi des commissions
Chaque fois qu'une réservation est apportée par un partenaire, liez-la à son compte. Le système calculera automatiquement les commissions dues à la fin du mois.
    `
  },
  {
    id: 4,
    title: 'Automatisation WhatsApp',
    description: 'Mise en place des confirmations automatiques, rappels, et utilisation de l\'IA pour répondre aux clients.',
    level: 'Avancé',
    steps: 7,
    category: 'marketing',
    content: `
# Automatisation WhatsApp & IA

Ce module permet de communiquer efficacement avec vos clients via WhatsApp en utilisant notre IA.

## Configuration
Assurez-vous que votre numéro WhatsApp Business est bien lié dans les **Paramètres**.

## Réponses IA
L'IA peut répondre automatiquement aux questions fréquentes (Horaires, Adresse, Menu). Vous pouvez personnaliser le comportement de l'IA dans la section Configuration du module WhatsApp.
    `
  },
  {
    id: 5,
    title: 'Création d\'Articles de Blog (IA)',
    description: 'Générer des articles optimisés SEO avec l\'IA, les éditer et les publier directement via Webhook sur votre site.',
    level: 'Intermédiaire',
    steps: 4,
    category: 'marketing',
    content: `
# Création d'Articles de Blog (IA)

Générez facilement du contenu optimisé SEO pour votre site web.

## Générer un article
1. Allez dans **Rédaction Blog Automatique**.
2. Entrez un sujet et d'éventuels mots-clés.
3. Cliquez sur "Générer l'article".

## Publier
Une fois l'article généré et revu, vous pouvez le publier directement sur votre site WordPress ou via Webhook en cliquant sur **Publier**.
    `
  },
  {
    id: 6,
    title: 'Gestion des Stocks & Recettes',
    description: 'Création de fiches techniques, suivi de la production quotidienne, et gestion des alertes de stock minimum.',
    level: 'Avancé',
    steps: 8,
    category: 'kitchen',
    content: `
# Gestion des Stocks & Recettes

Maintenez vos stocks à jour et suivez vos coûts de production.

## Fiches techniques
Créez des fiches pour chaque plat avec les ingrédients nécessaires pour calculer automatiquement le coût de revient.

## Alertes
Définissez un seuil minimum pour chaque ingrédient afin d'être notifié quand il faut recommander.
    `
  },
  {
    id: 7,
    title: 'Menu Digital QR Code',
    description: 'Mise à jour de la carte, gestion des ruptures en temps réel, et personnalisation du menu digital.',
    level: 'Débutant',
    steps: 3,
    category: 'marketing',
    content: `
# Menu Digital QR Code

Votre menu accessible instantanément par vos clients.

## Modifier la carte
1. Allez dans **Menu Digital**.
2. Ajoutez, modifiez ou supprimez des plats.
3. En cas de rupture de stock, vous pouvez désactiver un plat en un clic.

## Générer le QR Code
Téléchargez le QR Code depuis l'interface pour l'imprimer et le placer sur vos tables.
    `
  },
  {
    id: 8,
    title: 'Gestion du Personnel (RH)',
    description: 'Planification des plannings, suivi des présences, gestion des congés et évaluations des employés.',
    level: 'Intermédiaire',
    steps: 5,
    category: 'staff',
    content: `
# Gestion du Personnel (RH)

Gérez efficacement votre équipe.

## Plannings
Créez les plannings hebdomadaires et assignez les rôles (Matin, Soir, Coupure).

## Absences et Congés
Suivez les demandes de congés et enregistrez les absences pour la paie.
    `
  },
  {
    id: 9,
    title: 'Caisse & Clôture',
    description: 'Intégration TacSystems, gestion des encaissements, et procédure de clôture journalière.',
    level: 'Intermédiaire',
    steps: 4,
    category: 'accounting',
    content: `
# Caisse & Clôture

Gérez vos encaissements quotidiens.

## Clôture journalière
En fin de journée, procédez à la clôture de caisse pour vérifier les espèces, paiements TPE et transferts.
    `
  },
  {
    id: 10,
    title: 'Facturation & Comptabilité',
    description: 'Génération de factures proforma, suivi des paiements, et export comptable mensuel.',
    level: 'Avancé',
    steps: 6,
    category: 'accounting',
    content: `
# Facturation & Comptabilité

Centralisez vos factures.

## Créer une facture
Générez facilement une facture depuis une réservation ou pour un client de passage.

## Exports
Exportez vos données de facturation au format CSV ou PDF pour votre comptable en fin de mois.
    `
  },
  {
    id: 11,
    title: 'Procédé de base : Alimenter la base de données de A à Z',
    description: 'Plan et procédé logique étape par étape pour configurer et alimenter l\'application depuis le début.',
    level: 'Débutant',
    steps: 8,
    category: 'start',
    content: `# Procédé de base : Alimenter la base de données de A à Z

Voici le plan logique étape par étape pour configurer et alimenter correctement votre application avec vos données réelles. Nous vous recommandons de suivre cet ordre précis.

## 1. Achats Fournisseurs
Commencez par enregistrer vos **Achats Fournisseurs**.
- Allez dans le module **Achats & Fournisseurs**.
- Ajoutez vos fournisseurs réguliers.
- Saisissez vos factures d'achat. Cela va permettre d'alimenter vos stocks théoriques et de suivre vos dépenses.

## 2. Inventaire des Produits
Vérifiez ensuite votre **Inventaire**.
- Allez dans le module **Inventaire**.
- Les produits achetés via les fournisseurs doivent apparaître ici.
- Ajustez les quantités et définissez des seuils d'alerte pour ne jamais être en rupture de stock.

## 3. Production Cuisine
Gérez la transformation des matières premières.
- Dans le module **Écran Cuisine (KDS)**, vous pouvez suivre les tâches de production.
- Cela permet de gérer la préparation des ingrédients et plats en cours.

## 4. Recettes et Menus
Créez votre offre client.
- Allez dans **Menu Digital** ou **Recettes**.
- Ajoutez vos catégories (Entrées, Plats, Desserts, Boissons).
- Créez vos plats en définissant leur nom, description, prix de vente et image.

## 5. Tables et Réservations
Préparez votre salle.
- Allez dans **Gestion des Tables**.
- Créez votre plan de salle virtuel en ajoutant chaque table et sa capacité.
- Dans le module **Réservations (CRM)**, affectez les réservations clients à ces tables.

## 6. Gestion d'Équipe & RH
Gérez votre personnel et vos ressources humaines de A à Z.
- Allez dans le module **Équipe & RH**.
- **Gestion des Employés :** Ajoutez vos employés (Serveurs, Cuisiniers, Managers) avec leurs informations personnelles, contrats et documents.
- **Rôles et Accès :** Attribuez-leur des rôles pour contrôler précisément leurs accès aux différents modules (ex: accès restreint au POS pour un Serveur, accès total pour un Manager).
- **Plannings et Présences :** Gérez les plannings hebdomadaires, suivez les pointages et les heures travaillées.
- **Paie et Avances :** Gérez les bulletins de paie, les acomptes, les primes et le calcul des salaires nets.
- **Congés et Absences :** Suivez les demandes de congés, les jours de repos et les absences justifiées/injustifiées.

## 7. Encaissements (POS Tactile)
Passez à la vente.
- Vos serveurs peuvent utiliser le **POS Tactile**.
- Ils sélectionnent une table, ajoutent les plats créés à l'étape 4, et envoient les bons en cuisine.
- Ils procèdent enfin à l'encaissement (Espèces, Carte Bancaire).

## 8. Comptabilité et Finances
Gérez la comptabilité complète de votre établissement.
- Allez dans le module **Comptabilité & Finances**.
- **Chiffre d'Affaires et Trésorerie :** Les ventes du POS et les dépenses fournisseurs y remontent automatiquement pour une vue claire de votre trésorerie et de vos marges.
- **Déclaration de TVA :** Suivez la TVA collectée (sur vos ventes) et la TVA déductible (sur vos achats) pour générer facilement vos déclarations de TVA périodiques.
- **Journal Comptable :** Toutes les opérations (ventes, achats, salaires, charges fixes) sont centralisées dans un journal des écritures comptables.
- **Bilan et Compte de Résultat :** Éditez votre bilan, votre compte de résultat et vos états financiers.
- **Gestion des Charges :** Saisissez vos charges fixes (Loyer, Électricité, Assurances) et variables pour un calcul précis de votre rentabilité.
`
  },
  {
    id: 12,
    title: 'Automatisation de la Production (De l\'Achat au Dashboard)',
    description: 'Guide détaillé sur le cycle de vie des produits : Achats, gestion des Stocks, suivi de Production, normes HACCP et reporting.',
    level: 'Avancé',
    steps: 5,
    category: 'kitchen',
    content: `# Automatisation de la Production : Le cycle complet

Ce guide détaille le fonctionnement du système de production intégré, et comment les données transitent automatiquement d'un module à l'autre pour assurer un suivi précis de vos coûts et de l'hygiène.

## 1. 🛒 Achats Fournisseurs
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
- **Performance** : Ratio de pertes et suivi de l'efficacité de la brigade de production.
`
  },
  {
    id: 13,
    title: 'Procédés Opérationnels Standard (SOP)',
    description: 'Instructions visuelles étape par étape de chaque module : des Achats à la Traçabilité.',
    level: 'Tous niveaux',
    steps: 6,
    category: 'kitchen',
    content: `# Procédés Opérationnels Standard (SOP)

Ces Procédés Opérationnels Standard vous guideront pas-à-pas à travers chaque étape clé de nos opérations quotidiennes. Suivez ces protocoles pour assurer l'excellence, l'hygiène et la rentabilité.

<div class="space-y-8 mt-8">

  <!-- Step 1: Réception & Achats -->
  <div class="bg-blue-50 rounded-2xl p-6 border-l-4 border-blue-500 shadow-sm relative overflow-hidden">
    <div class="absolute top-0 right-0 p-4 opacity-10">
      <svg class="w-24 h-24 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
    </div>
    <div class="relative z-10">
      <div class="flex items-center gap-3 mb-4">
        <div class="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">1</div>
        <h3 class="text-2xl font-bold text-blue-900 m-0">Réception & Achats Fournisseurs</h3>
      </div>
      <p class="text-blue-800 text-lg mb-4">Protocole d'intégration des marchandises à l'arrivée au Mouda Palace.</p>
      <ul class="space-y-2 text-blue-900 list-none pl-0">
        <li class="flex items-start gap-2"><span class="text-blue-500 font-bold">✓</span> <strong>Vérification :</strong> Contrôler la conformité du bon de livraison avec la commande.</li>
        <li class="flex items-start gap-2"><span class="text-blue-500 font-bold">✓</span> <strong>Qualité :</strong> Inspecter l'état des produits (DLC, intégrité de l'emballage, température).</li>
        <li class="flex items-start gap-2"><span class="text-blue-500 font-bold">✓</span> <strong>Enregistrement :</strong> Saisir la facture dans le module <em>Achats Fournisseurs</em>.</li>
        <li class="flex items-start gap-2"><span class="text-blue-500 font-bold">✓</span> <strong>Stockage immédiat :</strong> Ranger immédiatement les produits frais et surgelés.</li>
      </ul>
    </div>
  </div>

  <!-- Step 2: Gestion des Stocks -->
  <div class="bg-emerald-50 rounded-2xl p-6 border-l-4 border-emerald-500 shadow-sm relative overflow-hidden">
    <div class="relative z-10">
      <div class="flex items-center gap-3 mb-4">
        <div class="bg-emerald-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">2</div>
        <h3 class="text-2xl font-bold text-emerald-900 m-0">Gestion & Rotation des Stocks</h3>
      </div>
      <p class="text-emerald-800 text-lg mb-4">Maintien de la qualité et prévention du gaspillage.</p>
      <ul class="space-y-2 text-emerald-900 list-none pl-0">
        <li class="flex items-start gap-2"><span class="text-emerald-500 font-bold">✓</span> <strong>Règle FIFO :</strong> (First In, First Out) Placer les nouveaux produits derrière les anciens.</li>
        <li class="flex items-start gap-2"><span class="text-emerald-500 font-bold">✓</span> <strong>Étiquetage :</strong> Tout produit déballé doit être étiqueté (Nom, Date d'ouverture, DLC secondaire).</li>
        <li class="flex items-start gap-2"><span class="text-emerald-500 font-bold">✓</span> <strong>Inventaire :</strong> Réaliser un inventaire physique hebdomadaire et ajuster dans le système.</li>
        <li class="flex items-start gap-2"><span class="text-emerald-500 font-bold">✓</span> <strong>Alertes :</strong> Surveiller le tableau de bord pour les alertes de stock minimum.</li>
      </ul>
    </div>
  </div>

  <!-- Step 3: Fiches Techniques -->
  <div class="bg-rose-50 rounded-2xl p-6 border-l-4 border-rose-500 shadow-sm relative overflow-hidden">
    <div class="relative z-10">
      <div class="flex items-center gap-3 mb-4">
        <div class="bg-rose-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">3</div>
        <h3 class="text-2xl font-bold text-rose-900 m-0">Fiches Techniques & Recettes</h3>
      </div>
      <p class="text-rose-800 text-lg mb-4">Standardisation des plats pour assurer une qualité constante et un Food Cost maîtrisé.</p>
      <ul class="space-y-2 text-rose-900 list-none pl-0">
        <li class="flex items-start gap-2"><span class="text-rose-500 font-bold">✓</span> <strong>Respect des grammages :</strong> Suivre scrupuleusement les fiches de préparation affichées sur l'écran KDS.</li>
        <li class="flex items-start gap-2"><span class="text-rose-500 font-bold">✓</span> <strong>Validation du visuel :</strong> Chaque assiette doit correspondre à la photo de référence.</li>
        <li class="flex items-start gap-2"><span class="text-rose-500 font-bold">✓</span> <strong>Mise à jour :</strong> Toute modification de recette doit être soumise au Chef et mise à jour dans le système.</li>
      </ul>
    </div>
  </div>

  <!-- Step 4: Production Journalière -->
  <div class="bg-amber-50 rounded-2xl p-6 border-l-4 border-amber-500 shadow-sm relative overflow-hidden">
    <div class="relative z-10">
      <div class="flex items-center gap-3 mb-4">
        <div class="bg-amber-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">4</div>
        <h3 class="text-2xl font-bold text-amber-900 m-0">Production Journalière</h3>
      </div>
      <p class="text-amber-800 text-lg mb-4">Transformation des ingrédients et mise en place (Mise en Place).</p>
      <ul class="space-y-2 text-amber-900 list-none pl-0">
        <li class="flex items-start gap-2"><span class="text-amber-500 font-bold">✓</span> <strong>Planification :</strong> Définir les quantités à produire selon les prévisions et réservations.</li>
        <li class="flex items-start gap-2"><span class="text-amber-500 font-bold">✓</span> <strong>Saisie système :</strong> Enregistrer les productions dans le module <em>Production Journalière</em> pour décrémenter le stock.</li>
        <li class="flex items-start gap-2"><span class="text-amber-500 font-bold">✓</span> <strong>Refroidissement :</strong> Refroidir rapidement les préparations chaudes selon les normes de sécurité.</li>
      </ul>
    </div>
  </div>

  <!-- Step 5: Traçabilité HACCP -->
  <div class="bg-teal-50 rounded-2xl p-6 border-l-4 border-teal-500 shadow-sm relative overflow-hidden">
    <div class="relative z-10">
      <div class="flex items-center gap-3 mb-4">
        <div class="bg-teal-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">5</div>
        <h3 class="text-2xl font-bold text-teal-900 m-0">Traçabilité HACCP</h3>
      </div>
      <p class="text-teal-800 text-lg mb-4">Garantie de l'hygiène et de la sécurité alimentaire.</p>
      <ul class="space-y-2 text-teal-900 list-none pl-0">
        <li class="flex items-start gap-2"><span class="text-teal-500 font-bold">✓</span> <strong>Relevé des températures :</strong> 2 fois par jour pour chaque chambre froide/réfrigérateur.</li>
        <li class="flex items-start gap-2"><span class="text-teal-500 font-bold">✓</span> <strong>Plan de nettoyage :</strong> Valider les tâches de nettoyage quotidiennes et hebdomadaires.</li>
        <li class="flex items-start gap-2"><span class="text-teal-500 font-bold">✓</span> <strong>Étiquetage interne :</strong> Générer et imprimer les étiquettes HACCP pour toutes les préparations.</li>
        <li class="flex items-start gap-2"><span class="text-teal-500 font-bold">✓</span> <strong>Huiles de friture :</strong> Tester et consigner les changements d'huile.</li>
      </ul>
    </div>
  </div>

  <!-- Step 6: Tableau de Bord & Analyse -->
  <div class="bg-indigo-50 rounded-2xl p-6 border-l-4 border-indigo-500 shadow-sm relative overflow-hidden">
    <div class="relative z-10">
      <div class="flex items-center gap-3 mb-4">
        <div class="bg-indigo-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">6</div>
        <h3 class="text-2xl font-bold text-indigo-900 m-0">Tableau de Bord & Reporting</h3>
      </div>
      <p class="text-indigo-800 text-lg mb-4">Pilotage et prise de décision basée sur les données.</p>
      <ul class="space-y-2 text-indigo-900 list-none pl-0">
        <li class="flex items-start gap-2"><span class="text-indigo-500 font-bold">✓</span> <strong>Analyse quotidienne :</strong> Le chef de cuisine et le directeur vérifient les alertes de stock.</li>
        <li class="flex items-start gap-2"><span class="text-indigo-500 font-bold">✓</span> <strong>Suivi des coûts :</strong> Contrôler le Food Cost réel vs théorique.</li>
        <li class="flex items-start gap-2"><span class="text-indigo-500 font-bold">✓</span> <strong>Pertes :</strong> Analyser les rapports de pertes pour optimiser les prochains achats.</li>
      </ul>
    </div>
  </div>

</div>
`
  }
];

export default function Documentation({ initialGuideId }: { initialGuideId?: number }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGuide, setActiveGuide] = useState<any>(initialGuideId ? guides.find(g => g.id === initialGuideId) || null : null);

  useEffect(() => {
    if (initialGuideId) {
      const guide = guides.find(g => g.id === initialGuideId);
      if (guide) setActiveGuide(guide);
    }
  }, [initialGuideId]);

  const filteredGuides = guides.filter(guide => {
    const matchesCategory = activeCategory === 'all' || guide.category === activeCategory;
    
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
    const matchesSearch = searchTerms.length === 0 || searchTerms.every(term => 
      guide.title.toLowerCase().includes(term) || 
      guide.description.toLowerCase().includes(term) ||
      (guide.content && guide.content.toLowerCase().includes(term))
    );
    
    return matchesCategory && matchesSearch;
  });

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'Débutant': return 'bg-blue-100 text-blue-700';
      case 'Intermédiaire': return 'bg-purple-100 text-purple-700';
      case 'Avancé': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (activeGuide) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
        <button 
          onClick={() => setActiveGuide(null)}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors mb-6"
        >
          <ArrowLeft size={18} /> Retour au centre
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8 border-b border-gray-100 bg-gray-50/50">
             <div className="flex items-center gap-3 mb-4">
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${getLevelColor(activeGuide.level)}`}>
                {activeGuide.level}
              </span>
              <span className="bg-gray-200 text-gray-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                {activeGuide.steps} steps
              </span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">{activeGuide.title}</h1>
            <p className="text-gray-500">{activeGuide.description}</p>
          </div>
          
          <div className="p-8">
            {activeGuide.content ? (
              <ReactMarkdown rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-4xl font-black text-indigo-700 mb-6 pb-2 border-b-2 border-indigo-100" {...props} />,
                  h2: ({node, children, ...props}) => {
                    const text = String(children);
                    let colorClass = "text-purple-600";
                    let mockupType = "";
                    
                    const lowerText = text.toLowerCase();
                    if (lowerText.includes("1.")) { colorClass = "text-blue-600"; mockupType = "achats"; }
                    if (lowerText.includes("2.")) { colorClass = "text-emerald-600"; mockupType = "inventaire"; }
                    if (lowerText.includes("3.")) { colorClass = "text-amber-600"; mockupType = "cuisine"; }
                    if (lowerText.includes("4.")) { colorClass = "text-rose-600"; mockupType = "recettes"; }
                    if (lowerText.includes("5.")) { colorClass = "text-cyan-600"; mockupType = "tables"; }
                    if (lowerText.includes("6.")) { colorClass = "text-fuchsia-600"; mockupType = "rh"; }
                    if (lowerText.includes("7.")) { colorClass = "text-orange-600"; mockupType = "pos"; }
                    if (lowerText.includes("8.")) { colorClass = "text-teal-600"; mockupType = "compta"; }
                    if (lowerText.includes("traçabilité haccp")) { colorClass = "text-green-600"; mockupType = "inventaire"; }
                    if (lowerText.includes("production journalière")) { colorClass = "text-amber-600"; mockupType = "cuisine"; }
                    if (lowerText.includes("tableau de bord") && lowerText.includes("5.")) { colorClass = "text-indigo-600"; mockupType = "compta"; }
                    
                    return (
                      <h2 className={`text-2xl font-bold mt-10 mb-4 ${colorClass} flex items-center gap-2 relative group w-fit cursor-help`} {...props}>
                        {children}
                        {mockupType && (
                          <div className="absolute left-0 bottom-full mb-3 hidden group-hover:block z-50 transition-all duration-200" style={{pointerEvents: 'none'}}>
                            <div className="bg-white p-2 rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border border-gray-100 w-72 h-48 transform -rotate-1 flex flex-col">
                              <div className="flex-1 w-full h-full rounded-lg shadow-sm overflow-hidden">
                                <ModuleMockup type={mockupType} />
                              </div>
                              <p className="text-[10px] text-gray-500 mt-2 font-medium text-center uppercase tracking-wider">Aperçu direct du module réel</p>
                            </div>
                            <div className="absolute left-6 -bottom-2 w-4 h-4 bg-white border-b border-r border-gray-100 transform rotate-45"></div>
                          </div>
                        )}
                      </h2>
                    );
                  },
                  h3: ({node, ...props}) => <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3" {...props} />,
                  p: ({node, ...props}) => <p className="text-gray-700 leading-relaxed mb-4 text-lg" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700 text-lg marker:text-indigo-400" {...props} />,
                  li: ({node, ...props}) => <li className="pl-1" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-gray-900 bg-indigo-50 px-1 rounded" {...props} />,
                  a: ({node, ...props}) => <a className="text-indigo-600 hover:text-indigo-800 underline decoration-indigo-300 underline-offset-2" {...props} />
                }}
              >
                {activeGuide.content}
              </ReactMarkdown>
            ) : (
              <p className="text-gray-400 italic">Contenu en cours de rédaction...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-2xl p-8 md:p-12 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
              <FileText size={14} /> v2.0
            </span>
            <span className="bg-amber-400 text-amber-950 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
              Aide en ligne
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">
            Centre de Documentation
          </h1>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl">
            Tout ce que vous devez savoir sur Mouda Palace SaaS
          </p>
          
          <div className="relative max-w-3xl">
            <form onSubmit={(e) => e.preventDefault()} className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher dans la documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-11 pr-32 py-4 rounded-xl border-0 ring-4 ring-indigo-500/30 text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-amber-400/50 sm:text-lg shadow-inner bg-white transition-all"
              />
              <div className="absolute inset-y-0 right-2 flex items-center">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                  Chercher
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-8 flex flex-wrap gap-4">
            <button 
              onClick={() => {
                const guide = guides.find(g => g.id === 11);
                if (guide) setActiveGuide(guide);
              }}
              className="bg-amber-400 text-amber-950 px-6 py-3 rounded-xl font-bold hover:bg-amber-500 transition-colors shadow-lg flex items-center gap-2"
            >
              <BookOpen size={20} />
              Procédé de base : par quoi commencer ?
            </button>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap items-center gap-3 py-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === category.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 shadow-sm'
            }`}
          >
            {category.icon}
            {category.label}
          </button>
        ))}
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuides.map((guide) => (
          <div key={guide.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-indigo-200 transition-all group flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${getLevelColor(guide.level)}`}>
                {guide.level}
              </span>
              <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-semibold">
                {guide.steps} steps
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
              {guide.title}
            </h3>
            
            <p className="text-gray-600 text-sm leading-relaxed mb-8 flex-1">
              {guide.description}
            </p>
            
            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
              <button 
                onClick={() => setActiveGuide(guide)}
                className="text-indigo-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
              >
                Voir le guide <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
        
        {filteredGuides.length === 0 && (
          <div className="col-span-full py-16 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun guide trouvé</h3>
            <p className="text-gray-500">Essayez de modifier vos termes de recherche ou de sélectionner une autre catégorie.</p>
          </div>
        )}
      </div>
      
      {/* Support floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:bg-indigo-700 hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-300">
          <MessageCircle size={24} />
        </button>
      </div>
    </div>
  );
}
