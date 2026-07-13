# Architecture Technique : SaaS Restaurant Gastronomique (Fès)

Ce document décrit l'architecture complète du SaaS centralisé pour le restaurant, incluant les bases de données, les flux d'IA et les intégrations web/WhatsApp.

## 1. Modèle de Données Firestore (NoSQL)

L'architecture NoSQL sur Firestore est pensée pour la scalabilité, le temps réel et l'isolation des données via les règles de sécurité.

*   **`restaurants/{restaurantId}`** : Configuration globale.
    *   Champs : `name`, `contact`, `config` (devise, fuseau horaire, horaires).
    *   Sous-collection **`menu/{itemId}`** : `name`, `price`, `category`, `ingredients`, `allergenTags`, `translations` (Map: fr, en, es).
*   **`users/{userId}`** : Accès internes (Staff, RH).
    *   Champs : `email`, `role` (admin, staff, chef), `createdAt`.
*   **`customers/{customerId}`** : CRM Touristes.
    *   Champs : `phone` (WhatsApp ID), `name`, `preferences` (ex: "table en terrasse"), `allergens`, `languageCode`, `lifetimeValue`.
*   **`reservations/{reservationId}`** : Suivi des tables.
    *   Champs : `customerId`, `date`, `pax` (nombre de personnes), `status` (pending, confirmed, cancelled, completed), `tableId`, `source` (whatsapp, web, partner), `partnerId` (optionnel).
*   **`inventory/{itemId}`** : Gestion de stock Back-office.
    *   Champs : `name`, `quantity`, `unit`, `threshold` (alerte stock bas), `supplier`.
*   **`partners/{partnerId}`** : Portail B2B (Riads & Hôtels).
    *   Champs : `name`, `contact`, `commissionRate` (%), `affiliateLink`.
    *   Sous-collection **`commissions/{commissionId}`** : `reservationId`, `amount`, `status` (unpaid, paid).
*   **`reviews_analytics/{reviewId}`** : Centralisation des avis.
    *   Champs : `customerId`, `rating`, `comment`, `sentiment` (Généré par l'IA : positive, neutral, negative), `source` (Google, TripAdvisor, WhatsApp).

---

## 2. Passerelle WhatsApp (Meta WhatsApp Business API & Vertex AI)

La passerelle WhatsApp est le point de contact principal pour les touristes. Elle est pilotée par une **Cloud Function Node.js** agissant comme Webhook.

### Flux de Réception et de Routage (Cloud Function `whatsappWebhook`) :
1.  **Réception** : Le webhook reçoit le payload JSON de Meta.
2.  **Identification** : Recherche du numéro de téléphone dans la collection `customers`. S'il est inconnu, création d'un profil temporaire.
3.  **Analyse de l'Intention (Vertex AI)** : Le texte reçu est envoyé à l'IA avec un prompt : 
    *« Tu es l'assistant de réservation. Détermine si le message est une demande de réservation (extraction: date, pax) ou une question générale (menu, horaires). »*
4.  **Routage** :
    *   *Si "Réservation"* : La fonction crée un document dans `reservations` avec le statut `pending` et demande confirmation au client via un Template Message WhatsApp.
    *   *Si "Question (FAQ)"* : Vertex AI interroge la collection `restaurants/{id}` (horaires) ou `menu` et génère une réponse fluide et polie dans la langue d'origine du client.

### Messages Proactifs (Cloud Scheduler) :
*   **J-1 10h00** : Un job lit les réservations de demain et envoie un rappel via l'API Meta.
*   **H+2 après le repas** : Envoi d'un message automatique remerciant le client et générant un lien personnalisé pour un avis.

---

## 3. Passerelle Site Web & Menu Digital (Next.js / React)

L'application web est construite en **React (Next.js)** hébergée sur **Firebase Hosting** pour des performances mondiales (touristes internationaux).

*   **Menu en Temps Réel** : Utilisation du SDK Firebase Client (`onSnapshot`). Si un produit tombe en rupture de stock dans `inventory`, une Cloud Function met à jour le document `menu` et l'article disparaît ou affiche "Épuisé" instantanément sur le téléphone du client à table.
*   **Traduction Automatique** : Le menu digital détecte la langue du navigateur (`navigator.language`). Si la langue n'est pas en cache, le backend utilise **Vertex AI** pour traduire les plats et leurs descriptions, puis stocke la traduction dans Firestore pour économiser les appels API.
*   **Capture de Réservation** : Le formulaire web écrit directement dans la collection `reservations`. Si le paramètre d'URL `?ref=riad_name` est présent, le champ `partnerId` est renseigné pour le calcul automatique des commissions.

---

## 4. Règles de Sécurité & 5. Déploiement

*   **Sécurité** : Voir le fichier généré `firestore.rules`.
*   **Déploiement** : Voir `.github/workflows/deploy.yml` pour le pipeline CI/CD de staging et production.
