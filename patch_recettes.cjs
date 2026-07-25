const fs = require('fs');

let content = fs.readFileSync('src/Recettes.tsx', 'utf-8');

// 1. Add Firebase imports
content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';\nimport { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';\nimport { db } from './firebase';\nimport { useToast } from './context/ToastContext';"
);

// 2. Replace hardcoded arrays with useState
const oldRecettesStr = `  const recettes = [
    { id: '1', nom: 'Pastilla au Pigeon', categorie: 'Plats', cout: 45, prix: 180, marge: 75, tempsPrep: '45 min', chef: 'Chef Amine' },
    { id: '2', nom: 'Tajine d\\'Agneau aux Pruneaux', categorie: 'Plats', cout: 65, prix: 220, marge: 70, tempsPrep: '60 min', chef: 'Chef Khalid' },
    { id: '3', nom: 'Salade Zaalouk', categorie: 'Entrées', cout: 15, prix: 65, marge: 77, tempsPrep: '20 min', chef: 'Chef Fatima' },
    { id: '4', nom: 'Briouates aux Amandes', categorie: 'Desserts', cout: 25, prix: 85, marge: 71, tempsPrep: '30 min', chef: 'Chef Youssef' },
  ];`;

const newRecettesStr = `  const { showToast } = useToast();
  const [recettes, setRecettes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubRecettes = onSnapshot(query(collection(db, 'recettes')), (snapshot) => {
      setRecettes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching recettes", error);
      showToast("Erreur lors de la récupération des recettes");
      setLoading(false);
    });

    return () => {
      unsubRecettes();
    };
  }, []);`;

content = content.replace(oldRecettesStr, newRecettesStr);

// Now for top stats:
// const totalPlats = recettes.filter(r => r.categorie === 'Plats').length;
// const avgMarge = Math.round(recettes.reduce((acc, curr) => acc + curr.marge, 0) / recettes.length);
// Since it's dynamically populated, we can keep the logic if it's already there or add it.
// Wait, the stats are hardcoded:
// <p className="text-2xl font-bold text-[#1A1A1A]">24</p>
// <p className="text-2xl font-bold text-[#1A1A1A]">74%</p>
// <p className="text-2xl font-bold text-[#1A1A1A]">12</p>

content = content.replace(
  '<p className="text-2xl font-bold text-[#1A1A1A]">24</p>',
  '<p className="text-2xl font-bold text-[#1A1A1A]">{recettes.length}</p>'
);

content = content.replace(
  '<p className="text-2xl font-bold text-[#1A1A1A]">74%</p>',
  '<p className="text-2xl font-bold text-[#1A1A1A]">{recettes.length > 0 ? Math.round(recettes.reduce((acc, curr) => acc + (curr.marge || 0), 0) / recettes.length) : 0}%</p>'
);

content = content.replace(
  '<p className="text-2xl font-bold text-[#1A1A1A]">12</p>',
  '<p className="text-2xl font-bold text-[#1A1A1A]">{recettes.filter(r => (r.marge || 0) < 65).length}</p>'
);


fs.writeFileSync('src/Recettes.tsx', content);
