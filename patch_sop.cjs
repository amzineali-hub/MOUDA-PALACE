const fs = require('fs');
let content = fs.readFileSync('src/Documentation.tsx', 'utf-8');

const sopGuide = `  },
  {
    id: 13,
    title: 'Procédés Opérationnels Standard (SOP)',
    description: 'Instructions visuelles étape par étape de chaque module : des Achats à la Traçabilité.',
    level: 'Tous niveaux',
    steps: 6,
    category: 'kitchen',
    content: \`# Procédés Opérationnels Standard (SOP)

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
\`
  }
];`;

content = content.replace('  }\n];', sopGuide);
fs.writeFileSync('src/Documentation.tsx', content);
console.log('SOP guide added');
