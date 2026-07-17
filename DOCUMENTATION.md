# Mouda Palace SaaS - Documentation & Descriptif Stratégique

## 1. Objectifs Principaux (Core Objectives)
Le SaaS **Mouda Palace** est conçu comme un système de gestion centralisé (Central Management System) dédié à la haute gastronomie et à l'hospitalité premium, spécifiquement adapté à l'écosystème touristique de Fès, au Maroc. 

Son objectif principal est d'unifier l'ensemble des opérations du restaurant au sein d'une plateforme unique : de la gestion des partenaires apporteurs d'affaires (B2B) jusqu'au contrôle granulaire des stocks en cuisine, en passant par le pilotage financier et la gestion des ressources humaines.

## 2. Fonctionnalités Implémentées (Primary Features)

### 2.1 Portail B2B & CRM (Partenaires)
- **Réseau d'Apporteurs d'Affaires** : Gestion complète des guides touristiques, agences de voyages et riads partenaires.
- **Suivi des Commissions** : Calcul automatique des commissions dues (en MAD), historique des conversions et règlements.
- **Acquisition & Outils B2B** : Génération de QR codes et de liens de parrainage uniques pour tracer précisément l'origine des clients.

### 2.2 Gestion d'Inventaire & Stocks (Inventory)
- **Suivi en temps réel** : Contrôle des entrées/sorties des ingrédients premium (Safran, viandes, etc.) avec des indicateurs visuels de statut.
- **Alertes Intelligentes** : Logique de calcul des statuts (`ok`, `alert`, `critical`) pour éviter les ruptures de stock pendant les services critiques.
- **Fiabilité** : Module d'inventaire sécurisé par des tests unitaires (Vitest) garantissant l'exactitude des seuils.

### 2.3 Comptabilité, Analytics & Journal de Caisse
- **Data Visualization** : Tableaux de bord dynamiques (Recharts) offrant une vue claire sur le Chiffre d'Affaires, la rentabilité, et l'évolution des revenus.
- **Journal de Caisse Centralisé** : Suivi des transactions en temps réel avec filtres avancés et export CSV pour la comptabilité.
- **Gestion des Flux** : Suivi des factures, dépenses fournisseurs et bilans comptables.

### 2.4 Ressources Humaines & Opérations (Directory)
- **Annuaire des Équipes** : Base de données du personnel (cuisine, salle, administration).
- **Communication Interne** : Outils de suivi des statuts des employés pour optimiser les plannings de service.

## 3. Stratégies de Performance (Performance Optimization)
- **Architecture SPA Ultra-Rapide** : Propulsé par React 18 et Vite, offrant des temps de chargement quasi-instantanés, cruciaux lors des services intenses (coup de feu).
- **Design System Responsive** : Interface entièrement adaptative (Tailwind CSS), auditée et optimisée pour une utilisation fluide sur tablettes (768px) en salle, terminaux de point de vente et mobiles.
- **Stabilité et Qualité du Code** : Modulatité des composants et tests unitaires continus (Vitest) assurant que les mises à jour ne cassent pas les processus vitaux.
- **Animations Optimisées** : Utilisation de `motion/react` pour des micro-interactions élégantes qui renforcent l'expérience utilisateur sans impacter les performances de rendu DOM.

## 4. Atouts et Ciblage Commercial (Unique Value Proposition)
- **Hyper-Spécialisation Locale (Fès)** : Contrairement aux logiciels de restauration standards, ce SaaS intègre nativement la culture commerciale locale (guides touristiques, partenariats Riads) qui est le moteur principal du tourisme gastronomique à Fès.
- **Expérience Premium "Pixel-Perfect"** : Une interface utilisateur sobre, élégante et luxueuse (Cosmic Slate Theme, typographies soignées) qui reflète fidèlement le positionnement haut de gamme du Mouda Palace.
- **Aide à la Décision (Data-Driven)** : Permet à la direction d'identifier instantanément les partenaires B2B les plus rentables et les plats (via la consommation des stocks) les plus demandés, maximisant ainsi le ROI.
