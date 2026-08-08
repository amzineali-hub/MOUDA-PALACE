import { useEffect, useRef } from 'react';
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
          if (data.isB2B || data.source === 'partenaire' || data.type === 'B2B' || data.tag === 'B2B') {
            showToast(`Nouvelle réservation B2B (Partenaire) : ${data.name || 'Client B2B'}`, 'success');
          }
        }
      });
    });

    return () => {
      unsubCmd();
      unsubRes();
    };
  }, [showToast]);

  // Tracking alerts
  const alertedStock = useRef<Set<string>>(new Set());
  const alertedHACCP = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Inventory Alerts
    const unsubInv = onSnapshot(collection(db, 'inventoryItems'), (snapshot) => {
      snapshot.docChanges().forEach(change => {
        const item = change.doc.data();
        const minStock = parseFloat(item.minStock) || 0;
        const qty = parseFloat(item.quantity) || 0;
        const id = change.doc.id;
        
        if (minStock > 0) {
          if (qty <= 0) {
            if (!alertedStock.current.has(id + '_rupture')) {
              if (change.type === 'modified') {
                showToast(`Rupture de Stock : ${item.name} (${qty} ${item.unit || 'unité'})`, 'error');
              }
              alertedStock.current.add(id + '_rupture');
              alertedStock.current.add(id); // Avoid double alert
            }
          } else if (qty <= minStock) {
            if (!alertedStock.current.has(id)) {
              if (change.type === 'modified') {
                showToast(`Alerte Stock : ${item.name} est sous le seuil minimal (${qty} ${item.unit || 'unité'}).`, 'error');
              }
              alertedStock.current.add(id);
            }
            alertedStock.current.delete(id + '_rupture');
          } else {
            alertedStock.current.delete(id);
            alertedStock.current.delete(id + '_rupture');
          }
        } else {
          alertedStock.current.delete(id);
          alertedStock.current.delete(id + '_rupture');
        }
      });
    });

    // HACCP DLC Alerts
    const unsubHaccp = onSnapshot(collection(db, 'haccpLots'), (snapshot) => {
      const now = new Date();
      const warningTime = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 48 hours
      snapshot.docChanges().forEach(change => {
        const lot = change.doc.data();
        const id = change.doc.id;

        if (lot.status !== 'Consommé' && lot.status !== 'Jeté' && lot.dlcDate) {
          const dlc = new Date(lot.dlcDate);
          
          if (dlc < now) {
            if (!alertedHACCP.current.has(id + '_expired')) {
              if (change.type === 'modified') {
                showToast(`Alerte HACCP : Le lot ${lot.idLot} (${lot.itemName}) est expiré !`, 'error');
              }
              alertedHACCP.current.add(id + '_expired');
            }
          } else if (dlc < warningTime) {
            if (!alertedHACCP.current.has(id + '_warning')) {
              if (change.type === 'modified') {
                showToast(`Alerte HACCP : Le lot ${lot.idLot} expire bientôt (${dlc.toLocaleDateString('fr-FR')}).`, 'error');
              }
              alertedHACCP.current.add(id + '_warning');
            }
            alertedHACCP.current.delete(id + '_expired');
          } else {
            alertedHACCP.current.delete(id + '_expired');
            alertedHACCP.current.delete(id + '_warning');
          }
        } else {
          alertedHACCP.current.delete(id + '_expired');
          alertedHACCP.current.delete(id + '_warning');
        }
      });
    });

    return () => {
      unsubInv();
      unsubHaccp();
    };
  }, [showToast]);

  return null;
}
