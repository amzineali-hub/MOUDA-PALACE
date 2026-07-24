import re

with open('src/Documentation.tsx', 'r') as f:
    content = f.read()

# Replace the guides array with the full list
new_guides = """const guides = [
  {
    id: 1,
    title: 'Premiers pas avec Mouda Palace SaaS',
    description: 'Découvrez l\\'interface principale, le tableau de bord, navigation générale et paramétrage de votre profil.',
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
    description: 'Comment prendre une réservation, gérer le plan de salle, et utiliser la liste d\\'attente efficacement.',
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
    description: 'Mise en place des confirmations automatiques, rappels, et utilisation de l\\'IA pour répondre aux clients.',
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
    title: 'Création d\\'Articles de Blog (IA)',
    description: 'Générer des articles optimisés SEO avec l\\'IA, les éditer et les publier directement via Webhook sur votre site.',
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
  }
];"""

content = re.sub(r'const guides = \[.*?\];', new_guides, content, flags=re.DOTALL)

# Update the search matching logic to include content
old_search_logic = """    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          guide.description.toLowerCase().includes(searchQuery.toLowerCase());"""

new_search_logic = """    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (guide.content && guide.content.toLowerCase().includes(searchQuery.toLowerCase()));"""
                          
content = content.replace(old_search_logic, new_search_logic)

with open('src/Documentation.tsx', 'w') as f:
    f.write(content)
