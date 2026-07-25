const fs = require('fs');

let content = fs.readFileSync('src/GestionTables.tsx', 'utf-8');

// 1. Add Firebase imports
content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';\nimport { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';\nimport { db } from './firebase';\nimport { useToast } from './context/ToastContext';"
);

// 2. Replace hardcoded arrays with useState
const oldTablesStr = `  const tables = [
    { id: 'T01', zone: 'patio', capacity: 4, status: 'occupee', currentPax: 3, time: '19:30', reservation: 'Dupont' },
    { id: 'T02', zone: 'patio', capacity: 2, status: 'libre', currentPax: 0, time: null, reservation: null },
    { id: 'T03', zone: 'patio', capacity: 4, status: 'reservee', currentPax: 0, time: '21:00', reservation: 'Martin' },
    { id: 'T04', zone: 'patio', capacity: 6, status: 'occupee', currentPax: 6, time: '19:45', reservation: 'Famille Alami' },
    { id: 'T05', zone: 'patio', capacity: 2, status: 'libre', currentPax: 0, time: null, reservation: null },
    { id: 'T06', zone: 'patio', capacity: 8, status: 'nettoyage', currentPax: 0, time: null, reservation: null },
    { id: 'VIP1', zone: 'salon', capacity: 4, status: 'reservee', currentPax: 0, time: '20:30', reservation: 'Ambassade' },
    { id: 'TER1', zone: 'terrasse', capacity: 2, status: 'occupee', currentPax: 2, time: '19:15', reservation: 'Couple' },
    { id: 'TER2', zone: 'terrasse', capacity: 4, status: 'libre', currentPax: 0, time: null, reservation: null },
  ];`;

const newTablesStr = `  const { showToast } = useToast();
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubTables = onSnapshot(query(collection(db, 'tables')), (snapshot) => {
      setTables(snapshot.docs.map(doc => ({ fbId: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tables", error);
      showToast("Erreur lors de la récupération des tables");
      setLoading(false);
    });

    return () => {
      unsubTables();
    };
  }, []);
  
  const handleUpdateStatus = async (fbId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'tables', fbId), { status: newStatus });
      showToast("Statut de la table mis à jour");
    } catch (err) {
      console.error("Error updating table", err);
      showToast("Erreur lors de la mise à jour");
    }
  };`;

content = content.replace(oldTablesStr, newTablesStr);

// The stats for patio, terrasse, etc.
// They use the 'zones' array but it has hardcoded 'tables' count and 'capacity'.
// Let's make them dynamic based on tables in that zone
const oldZones = `  const zones = [
    { id: 'patio', name: 'Le Patio Central', tables: 12, capacity: 48 },
    { id: 'terrasse', name: 'Terrasse Panoramique', tables: 8, capacity: 32 },
    { id: 'salon', name: 'Salon VIP', tables: 3, capacity: 12 },
  ];`;
const newZones = `  const zones = [
    { id: 'patio', name: 'Le Patio Central' },
    { id: 'terrasse', name: 'Terrasse Panoramique' },
    { id: 'salon', name: 'Salon VIP' },
  ].map(z => {
    const zoneTables = tables.filter(t => t.zone === z.id);
    return {
      ...z,
      tables: zoneTables.length,
      capacity: zoneTables.reduce((acc, t) => acc + (t.capacity || 0), 0)
    };
  });`;

content = content.replace(oldZones, newZones);

fs.writeFileSync('src/GestionTables.tsx', content);
