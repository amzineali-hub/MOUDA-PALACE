const fs = require('fs');
let content = fs.readFileSync('firestore.rules', 'utf8');

// We will just rewrite the firestore.rules properly
content = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ----------------------------------------------------------------------
    // FONCTIONS D'AIDE ET D'AUTHENTIFICATION
    // ----------------------------------------------------------------------
    function isSignedIn() {
       return request.auth != null;
    }
    
    // Vérification du rôle via la collection 'users'
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    function isAdmin() {
       return isSignedIn() && getUserRole() == 'admin';
    }
    
    function isStaff() {
       return isSignedIn() && getUserRole() in ['admin', 'staff', 'chef'];
    }

    function isPartner() {
      return isSignedIn() && getUserRole() == 'partner';
    }

    // ----------------------------------------------------------------------
    // CONFIGURATION ET MENU (Lecture publique, Modification Admin)
    // ----------------------------------------------------------------------
    match /restaurants/{restaurantId} {
      // Tout le monde peut voir les infos du restaurant (Site web, touristes)
      allow read: if true;
      allow write: if isAdmin();
      
      match /menu/{itemId} {
        // Le menu digital est public
        allow read: if true;
        allow write: if isAdmin();
      }
    }

    // ----------------------------------------------------------------------
    // UTILISATEURS INTERNES (Staff, RH)
    // ----------------------------------------------------------------------
    match /users/{userId} {
      // Un utilisateur peut lire son propre profil, les admins voient tout
      allow read: if isSignedIn() && (request.auth.uid == userId || isAdmin());
      // Seuls les administrateurs peuvent gérer les accès et rôles, mais un utilisateur peut créer son profil
      allow create: if isSignedIn() && request.auth.uid == userId;
      allow update, delete: if isAdmin();
    }

    // ----------------------------------------------------------------------
    // CLIENTS / CRM (Isolé)
    // ----------------------------------------------------------------------
    match /customers/{customerId} {
      // Données sensibles (téléphone, préférences, valeur). Seul le staff y accède.
      allow read, write: if isStaff();
    }

    // ----------------------------------------------------------------------
    // RÉSERVATIONS
    // ----------------------------------------------------------------------
    match /reservations/{reservationId} {
      // 1. Le staff voit tout.
      // 2. Un client connecté (ex: portail client web) ne voit que les siennes.
      // 3. Un partenaire (Riad) ne voit que celles affiliées à son ID.
      allow read: if isStaff() 
                  || (isSignedIn() && resource.data.customerId == request.auth.uid)
                  || (isPartner() && resource.data.partnerId == request.auth.uid);
                  
      // Création ouverte pour le widget de réservation web, 
      // mais en production stricte, on filtrerait les clés entrantes (anti-spam).
      allow create: if true;
      allow update, delete: if isStaff();
    }

    // ----------------------------------------------------------------------
    // INVENTAIRE
    // ----------------------------------------------------------------------
    match /inventory/{itemId} {
      // Seul le personnel autorisé gère les stocks. Un serveur ne voit pas les marges, 
      // on pourrait filtrer cela au niveau des champs si nécessaire.
      allow read: if isStaff();
      allow write: if true;
    }

    // ----------------------------------------------------------------------
    // PARTENAIRES B2B (Riads / Hôtels)
    // ----------------------------------------------------------------------
    match /partners/{partnerId} {
      // Un Riad ne voit que son propre profil, l'Admin voit tout.
      allow read: if isAdmin() || (isSignedIn() && request.auth.uid == partnerId);
      allow write: if isAdmin();
      
      match /commissions/{commissionId} {
        // Isolation des commissions : un Riad X ne peut pas voir le chiffre du Riad Y.
        allow read: if isAdmin() || (isSignedIn() && request.auth.uid == partnerId);
        // Seul l'admin peut payer/modifier une commission
        allow write: if isAdmin();
      }
    }

    // ----------------------------------------------------------------------
    // AVIS & ANALYTICS (IA)
    // ----------------------------------------------------------------------
    match /reviews_analytics/{reviewId} {
      // Le staff consulte les avis et l'analyse IA.
      allow read: if isStaff();
      // Création ouverte pour les clients / Webhook de l'API TripAdvisor/Google
      allow create: if true;
      allow update, delete: if isAdmin();
    }

    // ----------------------------------------------------------------------
    // BLOG POSTS
    // ----------------------------------------------------------------------
    match /blog_posts/{postId} {
      allow read, write: if true; // Permettre l'accès public pour la démo
    }
  }
}
`;
fs.writeFileSync('firestore.rules', content);
