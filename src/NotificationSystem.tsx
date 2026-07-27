import { useEffect, useState, useRef } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { useToast } from './context/ToastContext';

export default function NotificationSystem() {
  const { showToast } = useToast();
  
  // Use refs to ignore the initial snapshot load
  const isInitialCmdLoad = useRef(true);
  const isInitialResLoad = useRef(true);

  useEffect(() => {
    // Listen for new or updated supplier orders (commandes)
    const qCmd = query(collection(db, 'commandes'), orderBy('createdAt', 'desc'), limit(5));
    const unsubCmd = onSnapshot(qCmd, (snapshot) => {
      if (isInitialCmdLoad.current) {
        isInitialCmdLoad.current = false;
        return;
      }
      
      snapshot.docChanges().forEach((change) => {
        // Trigger if a new doc is added with status 'Validée', OR an existing doc is modified to 'Validée'
        if (change.type === 'added' || change.type === 'modified') {
          const data = change.doc.data();
          if (data.status === 'Validée') {
            showToast(`Commande fournisseur validée : ${data.fournisseur || 'N/A'}`, 'success');
          }
        }
      });
    });

    // Listen for new VIP reservations
    const qRes = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'), limit(5));
    const unsubRes = onSnapshot(qRes, (snapshot) => {
      if (isInitialResLoad.current) {
        isInitialResLoad.current = false;
        return;
      }
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.tag === 'VIP' || (data.notes && data.notes.toLowerCase().includes('vip'))) {
            showToast(`Nouvelle réservation VIP : ${data.name} pour ${data.pax} pax`, 'success');
          }
        }
      });
    });

    return () => {
      unsubCmd();
      unsubRes();
    };
  }, [showToast]);

  return null;
}
