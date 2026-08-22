import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from './components/ConfirmModal';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, User, Utensils, Receipt, Coffee, GlassWater, X, PauseCircle, MessageSquare, Send } from 'lucide-react';
import { useToast } from './context/ToastContext';
import { collection, onSnapshot, query, orderBy, limit, where, getDocs, addDoc, doc, serverTimestamp, deleteDoc, runTransaction, writeBatch, updateDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { computeRecipeCost } from './lib/recipeCost';
import { calculatePosSubtotal, createPosOrderId, getLineTotal, getLineUnitPrice, getLineQuantity, parsePosPrice } from './lib/posUtils';
import { TVA_RATES } from './lib/tva';
import Combobox from './components/Combobox';

const CATEGORIES = [
  { id: 'Entrées', name: 'Entrées', icon: <Utensils size={18} /> },
  { id: 'Plats Principaux', name: 'Plats Principaux', icon: <Utensils size={18} /> },
  { id: 'Desserts', name: 'Desserts', icon: <Coffee size={18} /> },
  { id: 'Boissons', name: 'Boissons', icon: <GlassWater size={18} /> },
];

const TicketReceiptBody = ({ ticket }: { ticket: any }) => (
  <>
    <div className="text-center mb-6 border-b border-dashed border-gray-300 pb-4">
      <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">MOUDA PALACE</h2>
      <p className="text-xs text-gray-500 uppercase tracking-wider">Restaurant & Salon de thé</p>
      <div className="mt-4 text-sm text-gray-600 space-y-1">
        <p>Ticket: {ticket.id}</p>
        <p>{ticket.date} à {ticket.time}</p>
      </div>
    </div>

    <div className="space-y-3 mb-6">
      {ticket.items.map((item: any, idx: number) => (
        <div key={idx} className="flex justify-between text-sm">
          <div>
            <span className="font-medium">{item.qty}x</span> {item.name}
          </div>
          <div className="text-gray-700">{getLineTotal(item).toFixed(2)} MAD</div>
        </div>
      ))}
    </div>

    <div className="border-t border-dashed border-gray-300 pt-4 mb-6">
      {ticket.subtotal !== undefined && (
        <div className="flex justify-between text-sm text-gray-500">
          <span>Sous-total</span>
          <span>{ticket.subtotal.toFixed(2)} MAD</span>
        </div>
      )}
      {ticket.discountPercent > 0 && (
        <div className="flex justify-between text-sm text-amber-700 font-medium mt-1">
          <span>Remise ({ticket.discountPercent}%)</span>
          <span>-{ticket.discountAmount.toFixed(2)} MAD</span>
        </div>
      )}
      {ticket.tax !== undefined && (
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>TVA ({ticket.taxRate}%)</span>
          <span>{ticket.tax.toFixed(2)} MAD</span>
        </div>
      )}
      <div className="flex justify-between items-center text-lg font-bold mt-2 pt-2 border-t border-dashed border-gray-200">
        <span>TOTAL</span>
        <span>{ticket.total.toFixed(2)} MAD</span>
      </div>
      <div className="flex justify-between text-sm text-gray-500 mt-2">
        <span>Paiement</span>
        <span>{ticket.method}</span>
      </div>
      {ticket.cashReceived !== undefined && (
        <>
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>Reçu</span>
            <span>{ticket.cashReceived.toFixed(2)} MAD</span>
          </div>
          <div className="flex justify-between text-sm font-semibold text-emerald-700 mt-1">
            <span>Monnaie</span>
            <span>{ticket.changeDue.toFixed(2)} MAD</span>
          </div>
        </>
      )}
      {ticket.paymentBreakdown && (
        <div className="mt-2 pt-2 border-t border-dashed border-gray-200 text-sm text-gray-500 space-y-1">
          <div className="flex justify-between"><span>Part espèces</span><span>{ticket.paymentBreakdown.cash.toFixed(2)} MAD</span></div>
          <div className="flex justify-between"><span>Part carte</span><span>{ticket.paymentBreakdown.card.toFixed(2)} MAD</span></div>
        </div>
      )}
    </div>

    <div className="text-center text-xs text-gray-400 mt-8">
      <p>Merci de votre visite !</p>
      <p>À très bientôt chez Mouda Palace</p>
    </div>
  </>
);

const formatDateTime = (value: any): string => {
  const d = value?.toDate ? value.toDate() : value instanceof Date ? value : null;
  return d ? d.toLocaleString('fr-FR') : '—';
};

const ShiftReportBody = ({ report }: { report: any }) => {
  const isZ = report.type === 'Z';
  return (
    <>
      <div className="text-center mb-6 border-b border-dashed border-gray-300 pb-4">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">MOUDA PALACE</h2>
        <p className="text-xs text-gray-500 uppercase tracking-wider">Rapport {isZ ? 'Z — Clôture de caisse' : 'X — État intermédiaire'}</p>
        <div className="mt-4 text-sm text-gray-600 space-y-1">
          <p>Caisse : {report.id}</p>
          <p>Généré le {formatDateTime(report.generatedAt)}</p>
        </div>
      </div>

      <div className="space-y-1 text-sm mb-4">
        <div className="flex justify-between"><span>Ouverture</span><span>{formatDateTime(report.openedAt)}</span></div>
        <div className="flex justify-between"><span>Ouvert par</span><span>{report.openedBy || '—'}</span></div>
        <div className="flex justify-between"><span>Fond de caisse initial</span><span>{Number(report.openingCash || 0).toFixed(2)} MAD</span></div>
        {isZ && <div className="flex justify-between"><span>Fermé par</span><span>{report.closedBy || '—'}</span></div>}
      </div>

      <div className="border-t border-dashed border-gray-300 pt-3 space-y-1 text-sm mb-4">
        <div className="flex justify-between"><span>Ventes espèces</span><span>{Number(report.cashSales || 0).toFixed(2)} MAD</span></div>
        <div className="flex justify-between"><span>Ventes carte</span><span>{Number(report.cardSales || 0).toFixed(2)} MAD</span></div>
        <div className="flex justify-between font-bold pt-1 border-t border-dashed border-gray-200"><span>Total ventes</span><span>{Number(report.totalSales || 0).toFixed(2)} MAD</span></div>
        <div className="flex justify-between text-gray-500"><span>Nombre de tickets</span><span>{report.paymentCount || 0}</span></div>
        <div className="flex justify-between text-gray-500"><span>Remboursements</span><span>{report.refundCount || 0}</span></div>
      </div>

      <div className="border-t border-dashed border-gray-300 pt-3 space-y-1 text-sm">
        <div className="flex justify-between"><span>Espèces théoriques</span><span>{Number(report.expectedCash || 0).toFixed(2)} MAD</span></div>
        {isZ && (
          <>
            <div className="flex justify-between"><span>Espèces comptées</span><span>{Number(report.countedCash || 0).toFixed(2)} MAD</span></div>
            <div className={`flex justify-between font-bold ${Number(report.variance || 0) < 0 ? 'text-red-600' : 'text-emerald-700'}`}><span>Écart</span><span>{Number(report.variance || 0).toFixed(2)} MAD</span></div>
          </>
        )}
      </div>

      <div className="text-center text-xs text-gray-400 mt-8">
        <p>{isZ ? 'Document de clôture — à conserver.' : 'État intermédiaire, sans incidence sur la caisse.'}</p>
      </div>
    </>
  );
};

const buildShiftReportHtml = (report: any): string => {
  const isZ = report.type === 'Z';
  const fmt = formatDateTime;
  const num = (v: any) => Number(v || 0).toFixed(2);
  return `
    <html>
      <head>
        <title>Rapport ${isZ ? 'Z' : 'X'} de caisse</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { font-family: 'Courier New', monospace; color: #1a1a1a; margin: 0; padding: 4mm; width: 72mm; }
          h2 { text-align: center; font-size: 16px; margin: 0 0 4px; }
          .sub { text-align: center; font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
          .meta { text-align: center; font-size: 11px; color: #444; margin: 8px 0 12px; }
          .row { display: flex; justify-content: space-between; font-size: 12px; margin: 2px 0; }
          .bold { font-weight: bold; }
          .red { color: #dc2626; }
          .green { color: #047857; }
          hr { border: none; border-top: 1px dashed #999; margin: 8px 0; }
          .footer { text-align: center; font-size: 10px; color: #888; margin-top: 16px; }
        </style>
      </head>
      <body>
        <h2>MOUDA PALACE</h2>
        <div class="sub">Rapport ${isZ ? 'Z — Clôture de caisse' : 'X — État intermédiaire'}</div>
        <div class="meta">Caisse : ${report.id}<br/>Généré le ${fmt(report.generatedAt)}</div>
        <hr/>
        <div class="row"><span>Ouverture</span><span>${fmt(report.openedAt)}</span></div>
        <div class="row"><span>Ouvert par</span><span>${report.openedBy || '—'}</span></div>
        <div class="row"><span>Fond de caisse initial</span><span>${num(report.openingCash)} MAD</span></div>
        ${isZ ? `<div class="row"><span>Fermé par</span><span>${report.closedBy || '—'}</span></div>` : ''}
        <hr/>
        <div class="row"><span>Ventes espèces</span><span>${num(report.cashSales)} MAD</span></div>
        <div class="row"><span>Ventes carte</span><span>${num(report.cardSales)} MAD</span></div>
        <div class="row bold"><span>Total ventes</span><span>${num(report.totalSales)} MAD</span></div>
        <div class="row"><span>Nombre de tickets</span><span>${report.paymentCount || 0}</span></div>
        <div class="row"><span>Remboursements</span><span>${report.refundCount || 0}</span></div>
        <hr/>
        <div class="row"><span>Espèces théoriques</span><span>${num(report.expectedCash)} MAD</span></div>
        ${isZ ? `
        <div class="row"><span>Espèces comptées</span><span>${num(report.countedCash)} MAD</span></div>
        <div class="row bold ${Number(report.variance || 0) < 0 ? 'red' : 'green'}"><span>Écart</span><span>${num(report.variance)} MAD</span></div>` : ''}
        <div class="footer">${isZ ? 'Document de clôture — à conserver.' : 'État intermédiaire, sans incidence sur la caisse.'}</div>
        <script>window.onload = () => { window.print(); };</script>
      </body>
    </html>
  `;
};

export default function POSTactile() {
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState('Plats Principaux');
  const [cart, setCart] = useState<any[]>([]);

  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (kitchenSent && kitchenOrderId) {
      setIsCancelOrderModalOpen(true);
      return;
    }
    setCart([]);
    setDiscountPercent(0);
    setDiscountReason('');
    setTaxRate(10);
    setKitchenSent(false);
    setKitchenOrderId(null);
    setKitchenTableId(null);
    showToast("Ticket annulé");
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [recettes, setRecettes] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemImage, setNewItemImage] = useState<string>('');
  const [isManualName, setIsManualName] = useState(false);
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);
  const [ticketToPrint, setTicketToPrint] = useState<any>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [activeCartTab, setActiveCartTab] = useState<'cart' | 'kitchen' | 'suspended' | 'messages'>('cart');
  const [kitchenOrders, setKitchenOrders] = useState<any[]>([]);
  const [suspendedTickets, setSuspendedTickets] = useState<any[]>([]);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [kitchenSent, setKitchenSent] = useState(false);
  const [kitchenOrderId, setKitchenOrderId] = useState<string | null>(null);
  const [kitchenTableId, setKitchenTableId] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [posMessages, setPosMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [messageTarget, setMessageTarget] = useState('Cuisine');
  const [messagePriority, setMessagePriority] = useState('Normale');
  const [isTransferringTable, setIsTransferringTable] = useState(false);
  const [isCashPaymentOpen, setIsCashPaymentOpen] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  const [isMixedPaymentOpen, setIsMixedPaymentOpen] = useState(false);
  const [mixedCashAmount, setMixedCashAmount] = useState('');
  const [mixedCardAmount, setMixedCardAmount] = useState('');
  const [modifierItem, setModifierItem] = useState<any>(null);
  const [modifierCooking, setModifierCooking] = useState('');
  const [modifierExtra, setModifierExtra] = useState('');
  const [modifierNote, setModifierNote] = useState('');
  const [activeShift, setActiveShift] = useState<any>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftMode, setShiftMode] = useState<'open' | 'close'>('open');
  const [shiftCashAmount, setShiftCashAmount] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountReason, setDiscountReason] = useState('');
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [taxRate, setTaxRate] = useState<number>(10);
  const [isCancelOrderModalOpen, setIsCancelOrderModalOpen] = useState(false);
  const [cancelOrderReason, setCancelOrderReason] = useState('');
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator === 'undefined' || navigator.onLine);
  const [recentReceipts, setRecentReceipts] = useState<any[]>([]);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundTicketId, setRefundTicketId] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);
  const [refundSelections, setRefundSelections] = useState<Record<number, number>>({});
  const [shiftReportToPrint, setShiftReportToPrint] = useState<any>(null);
  const [isShiftReportModalOpen, setIsShiftReportModalOpen] = useState(false);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'cash_receipts'), orderBy('createdAt', 'desc'), limit(30));
    const unsub = onSnapshot(q, (snapshot) => {
      setRecentReceipts(snapshot.docs.map(receiptDoc => ({ ...receiptDoc.data(), id: receiptDoc.id })));
    }, error => console.error('Recent receipts error:', error));
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'productionTasks'), (snapshot) => {
      setKitchenOrders(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'pos_suspended_tickets')), (snapshot) => {
      setSuspendedTickets(snapshot.docs.map(ticket => ({ ...ticket.data(), id: ticket.id })));
    }, error => {
      console.error('Suspended tickets error:', error);
      showToast('Impossible de charger les tickets en attente', 'error');
    });
    return () => unsub();
  }, [showToast]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'pos_shifts')), snapshot => {
      const openShifts: any[] = snapshot.docs
        .map(shift => ({ ...shift.data(), id: shift.id }))
        .filter((shift: any) => shift.status === 'Ouvert')
        .sort((a: any, b: any) => (b.openedAt?.seconds || 0) - (a.openedAt?.seconds || 0));
      setActiveShift(openShifts[0] || null);
    }, error => {
      console.error('POS shift error:', error);
      showToast('Impossible de charger la caisse active', 'error');
    });
    return () => unsub();
  }, [showToast]);

  const openShift = async () => {
    if (activeShift) {
      showToast('Une caisse est déjà ouverte.', 'error');
      return;
    }
    const openingCash = parsePosPrice(shiftCashAmount);
    if (openingCash < 0) return;
    try {
      await addDoc(collection(db, 'pos_shifts'), {
        status: 'Ouvert',
        openingCash,
        expectedCash: openingCash,
        cashSales: 0,
        cardSales: 0,
        totalSales: 0,
        paymentCount: 0,
        openedBy: auth.currentUser?.email || 'POS',
        openedAt: serverTimestamp()
      });
      setShiftCashAmount('');
      setIsShiftModalOpen(false);
      showToast('Caisse ouverte');
    } catch (error) {
      console.error(error);
      showToast("Erreur lors de l'ouverture de caisse", 'error');
    }
  };

  const closeShift = async () => {
    if (!activeShift) return;
    const countedCash = parsePosPrice(shiftCashAmount);
    const expectedCash = Number(activeShift.expectedCash) || 0;
    const variance = countedCash - expectedCash;
    const closedBy = auth.currentUser?.email || 'POS';
    try {
      await updateDoc(doc(db, 'pos_shifts', activeShift.id), {
        status: 'Fermé',
        countedCash,
        variance,
        closedBy,
        closedAt: serverTimestamp()
      });
      setShiftReportToPrint({ ...activeShift, countedCash, variance, closedBy, type: 'Z', generatedAt: new Date() });
      setIsShiftReportModalOpen(true);
      setShiftCashAmount('');
      setIsShiftModalOpen(false);
      showToast(`Caisse fermée. Écart : ${variance.toFixed(2)} MAD`);
    } catch (error) {
      console.error(error);
      showToast('Erreur lors de la fermeture de caisse', 'error');
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'pos_messages')), (snapshot) => {
      setPosMessages(snapshot.docs.map(message => ({ ...message.data(), id: message.id })));
    }, error => {
      console.error('POS messages error:', error);
      showToast('Impossible de charger les messages POS', 'error');
    });
    return () => unsub();
  }, [showToast]);

  const sendPosMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = messageText.trim();
    if (!text) return;
    try {
      await addDoc(collection(db, 'pos_messages'), {
        text,
        target: messageTarget,
        priority: messagePriority,
        tableId: selectedTable || null,
        orderId: kitchenOrderId || null,
        source: 'POS',
        read: false,
        createdAt: serverTimestamp()
      });
      setMessageText('');
      showToast('Message envoyé');
    } catch (error) {
      console.error(error);
      showToast("Erreur lors de l'envoi du message", 'error');
    }
  };

  const markPosMessageRead = async (messageId: string) => {
    try {
      await updateDoc(doc(db, 'pos_messages', messageId), { read: true, readAt: serverTimestamp() });
    } catch (error) {
      console.error(error);
    }
  };

    const suspendTicket = async () => {
      if (cart.length === 0) {
        showToast('Le ticket est vide.', 'error');
        return;
      }

      try {
        await addDoc(collection(db, 'pos_suspended_tickets'), {
          tableId: selectedTable || null,
          items: cart.map(item => ({
            id: item.id,
            name: item.name || 'Inconnu',
            qty: getLineQuantity(item),
            numPrice: getLineUnitPrice(item),
            price: item.price || `${getLineUnitPrice(item)} MAD`,
            category: item.category || 'Autres',
            imageUrl: item.imageUrl || '',
            modifiers: item.modifiers || null
          })),
          subtotal: discountedSubtotal,
          tax,
          taxRate,
          total,
          discountPercent,
          discountAmount,
          discountReason: discountReason.trim(),
          createdAt: serverTimestamp(),
          status: 'En attente'
        });
        setCart([]);
        setSelectedTable(null);
        setDiscountPercent(0);
        setDiscountReason('');
        setTaxRate(10);
        setKitchenSent(false);
        setKitchenOrderId(null);
        setKitchenTableId(null);
        showToast('Ticket mis en attente');
      } catch (error) {
        console.error(error);
        showToast('Erreur lors de la mise en attente', 'error');
      }
    };

    const recallTicket = async (ticket: any) => {
      if (cart.length > 0 && !window.confirm('Le ticket actuel sera remplacé. Continuer ?')) return;

      try {
        setCart(ticket.items || []);
        setSelectedTable(ticket.tableId || null);
        setDiscountPercent(Number(ticket.discountPercent) || 0);
        setDiscountReason(ticket.discountReason || '');
        setTaxRate(Number(ticket.taxRate) || 10);
        setKitchenSent(false);
        setKitchenOrderId(null);
        setKitchenTableId(null);
        await deleteDoc(doc(db, 'pos_suspended_tickets', ticket.id));
        setActiveCartTab('cart');
        showToast('Ticket rappelé');
      } catch (error) {
        console.error(error);
        showToast('Erreur lors du rappel du ticket', 'error');
      }
    };

    const deleteSuspendedTicket = async (ticketId: string) => {
      if (!window.confirm('Supprimer ce ticket en attente ?')) return;
      try {
        await deleteDoc(doc(db, 'pos_suspended_tickets', ticketId));
        showToast('Ticket supprimé');
      } catch (error) {
        console.error(error);
        showToast('Erreur lors de la suppression', 'error');
      }
    };
  
  
  const handleNameChange = (val: string) => {
    setNewItemName(val);
    const matchedRecette = recettes.find(r => r.nom === val);
    if (matchedRecette) {
      if (matchedRecette.prixVente) {
        setNewItemPrice(String(matchedRecette.prixVente));
      } else if (matchedRecette.prix) {
        setNewItemPrice(String(matchedRecette.prix));
      } else {
        const { totalCost } = computeRecipeCost(matchedRecette, inventoryItems);
        if (totalCost > 0) setNewItemPrice(String(Math.round(totalCost * 1.3)));
      }
    }
  };

  const transferTable = async (targetTable: string) => {
    if (!kitchenOrderId || !selectedTable || targetTable === selectedTable) {
      setSelectedTable(targetTable);
      setIsTableModalOpen(false);
      return;
    }
    if (isTransferringTable) return;
    if (!window.confirm(`Transférer la commande de ${selectedTable} vers ${targetTable} ?`)) return;

    setIsTransferringTable(true);
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'orders', kitchenOrderId), {
        tableId: targetTable,
        updatedAt: serverTimestamp()
      });
      kitchenOrders
        .filter(task => task.orderId === kitchenOrderId)
        .forEach(task => batch.update(doc(db, 'productionTasks', task.id), {
          tableId: targetTable,
          updatedAt: serverTimestamp()
        }));
      await batch.commit();
      setSelectedTable(targetTable);
      setKitchenTableId(targetTable);
      setIsTableModalOpen(false);
      showToast(`Commande transférée vers ${targetTable}`);
    } catch (error) {
      console.error(error);
      showToast('Erreur lors du transfert de table', 'error');
    } finally {
      setIsTransferringTable(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setNewItemImage(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;
    
    try {
      const itemData: any = {
        name: newItemName,
        price: `${newItemPrice} MAD`,
        category: activeCategory,
        active: true,
        desc: ''
      };
      
      if (newItemImage) {
        itemData.imageUrl = newItemImage;
      }
      
      await addDoc(collection(db, 'menu_items'), itemData);
      
      showToast('Article ajouté avec succès');
      setIsAddModalOpen(false);
      setIsManualName(false);
      setIsPhotoGalleryOpen(false);
      setNewItemName('');
      setNewItemPrice('');
      setNewItemImage('');
    } catch (error) {
      console.error(error);
      showToast('Erreur lors de l\'ajout', 'error');
    }
  };

  
  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setItemToDelete(id);
  };
  const confirmDeleteItem = async () => {
    if (itemToDelete) {
      try {
        await deleteDoc(doc(db, 'menu_items', itemToDelete));
        showToast('Article supprimé avec succès');
      } catch (error) {
        console.error(error);
        showToast('Erreur lors de la suppression', 'error');
      } finally {
        setItemToDelete(null);
      }
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'menu_items'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        // Ensure price is a number for calculation
        numPrice: parseFloat((doc.data().price || '0').toString().replace(/[^0-9.]/g, ''))
      }));
      setMenuItems(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubTables = onSnapshot(query(collection(db, 'tables')), (snapshot) => {
      setTables(snapshot.docs.map(doc => ({ ...doc.data(), fbId: doc.id })));
    });
    const unsubRecettes = onSnapshot(query(collection(db, 'fiches_techniques')), (snapshot) => {
      setRecettes(snapshot.docs.map(doc => ({ ...doc.data(), fbId: doc.id })));
    });
    const unsubInventory = onSnapshot(query(collection(db, 'inventoryItems')), (snapshot) => {
      setInventoryItems(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => { unsubTables(); unsubRecettes(); unsubInventory(); };
  }, []);

  const normalizeString = (str: string) => {
    return (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const getItemImageUrl = (item: any): string => {
    if (item.imageUrl) return item.imageUrl;
    const matchingRecipe = recettes.find(r => normalizeString(r.nom || r.name) === normalizeString(item.name));
    return matchingRecipe?.photo || matchingRecipe?.image || '';
  };

  const filteredItems = (() => {
    if (searchQuery) {
      const q = normalizeString(searchQuery);
      
      const matchedMenu = menuItems.filter(item => normalizeString(item.name).includes(q));
      
      const menuNames = new Set(matchedMenu.map(m => normalizeString(m.name)));
      
      const matchedRecettes = recettes.filter(r => {
        const nom = normalizeString(r.nom);
        return nom.includes(q) && !menuNames.has(nom);
      });
      
      const additionalItems = matchedRecettes.map(r => ({
        id: 'recette-' + (r.id || r.fbId || Math.random().toString()),
        name: r.nom,
        category: r.categorie || 'Autres',
        price: (r.prixVente || r.coutTotal || '0') + ' MAD',
        numPrice: parseFloat((r.prixVente || r.coutTotal || '0').toString().replace(/[^0-9.]/g, '')),
        imageUrl: r.photo || r.image || ''
      }));
      
      const combinedNames = new Set([
        ...matchedMenu.map(m => normalizeString(m.name)),
        ...matchedRecettes.map(r => normalizeString(r.nom))
      ]);
      
      const matchedInventory = inventoryItems.filter(i => {
        const nom = normalizeString(i.name);
        return nom.includes(q) && !combinedNames.has(nom);
      });
      
      const additionalInventory = matchedInventory.map(i => ({
        id: 'inv-' + (i.id || Math.random().toString()),
        name: i.name,
        category: i.category || 'Autres',
        price: '0 MAD',
        numPrice: 0,
        imageUrl: ''
      }));

      return [...matchedMenu, ...additionalItems, ...additionalInventory];
    }
    return menuItems.filter(item => item.category === activeCategory);
  })();

  const addToCart = (item: any, modifiers: { cooking?: string; extra?: string; note?: string } = {}) => {
    setKitchenSent(false);
    setKitchenOrderId(null);
    setKitchenTableId(null);
    const cooking = modifiers.cooking || '';
    const extra = modifiers.extra || '';
    const note = modifiers.note?.trim() || '';
    const modifierSignature = [cooking, extra, note].filter(Boolean).join('|');
    const lineId = modifierSignature ? `${item.id}::${modifierSignature}` : item.id;
    setCart(prev => {
      const existing = prev.find(i => i.id === lineId);
      if (existing) {
        return prev.map(i => i.id === lineId ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, id: lineId, baseItemId: item.id, qty: 1, modifiers: { cooking, extra, note } }];
    });
  };

  const openModifierPanel = (item: any) => {
    setModifierItem(item);
    setModifierCooking('');
    setModifierExtra('');
    setModifierNote('');
  };

  const confirmModifiers = () => {
    if (!modifierItem) return;
    addToCart(modifierItem, { cooking: modifierCooking, extra: modifierExtra, note: modifierNote });
    setModifierItem(null);
  };

  const updateQty = (id: string, delta: number) => {
    setKitchenSent(false);
    setKitchenOrderId(null);
    setKitchenTableId(null);
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          return { ...item, qty: newQty };
        }
        return item;
      }).filter(item => item.qty > 0);
    });
  };

  const subtotal = calculatePosSubtotal(cart);
  const discountAmount = subtotal * (discountPercent / 100);
  const discountedSubtotal = subtotal - discountAmount;
  const tax = discountedSubtotal * (taxRate / 100);
  const total = discountedSubtotal + tax;

  const applyDiscount = () => {
    const percent = parsePosPrice(discountPercent);
    if (percent < 0 || percent > 100 || (percent > 0 && !discountReason.trim())) {
      showToast('Saisissez une remise entre 0 et 100 % avec un motif.', 'error');
      return;
    }
    setDiscountPercent(percent);
    setIsDiscountModalOpen(false);
    showToast(percent > 0 ? `Remise de ${percent}% appliquée` : 'Remise retirée');
  };

  const confirmCancelOrder = async () => {
    if (!kitchenOrderId) return;
    if (!cancelOrderReason.trim()) {
      showToast('Un motif est requis pour annuler une commande envoyée en cuisine.', 'error');
      return;
    }
    if (isCancellingOrder) return;
    setIsCancellingOrder(true);
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'orders', kitchenOrderId), {
        status: 'Annulée',
        cancelReason: cancelOrderReason.trim(),
        updatedAt: serverTimestamp()
      });
      kitchenOrders
        .filter(task => task.orderId === kitchenOrderId)
        .forEach(task => batch.delete(doc(db, 'productionTasks', task.id)));
      const auditRef = doc(collection(db, 'pos_audit_logs'));
      batch.set(auditRef, {
        action: 'order_cancelled',
        orderId: kitchenOrderId,
        reason: cancelOrderReason.trim(),
        source: 'POS',
        createdAt: serverTimestamp()
      });
      await batch.commit();

      setCart([]);
      setDiscountPercent(0);
      setDiscountReason('');
      setTaxRate(10);
      setKitchenSent(false);
      setKitchenOrderId(null);
      setKitchenTableId(null);
      setCancelOrderReason('');
      setIsCancelOrderModalOpen(false);
      showToast('Commande annulée.');
    } catch (error) {
      console.error(error);
      showToast("Erreur lors de l'annulation de la commande", 'error');
    } finally {
      setIsCancellingOrder(false);
    }
  };

  const getRefundReceipt = () => {
    const ticketId = refundTicketId.trim();
    if (!ticketId) return null;
    return recentReceipts.find(r => r.displayId === ticketId || r.id === ticketId) || null;
  };

  const getRefundedQtyForIndex = (receipt: any, idx: number): number => {
    const refundedQtyByIndex = Array.isArray(receipt?.refundedQtyByIndex) ? receipt.refundedQtyByIndex : [];
    return Number(refundedQtyByIndex[idx]) || 0;
  };

  const getRemainingQtyForIndex = (receipt: any, idx: number): number => {
    const item = receipt?.items?.[idx];
    if (!item) return 0;
    return Math.max(0, (Number(item.qty) || 0) - getRefundedQtyForIndex(receipt, idx));
  };

  const computeRefundAmount = (receipt: any, selections: Record<number, number>): number => {
    const items = Array.isArray(receipt?.items) ? receipt.items : [];
    const rawSubtotal = Object.entries(selections).reduce((sum, [idxStr, qty]) => {
      const idx = Number(idxStr);
      const item = items[idx];
      if (!item || !qty) return sum;
      const unitPrice = Number(item.price) || (Number(item.lineTotal || 0) / (Number(item.qty) || 1));
      return sum + unitPrice * qty;
    }, 0);
    const discountPercentOnReceipt = Number(receipt?.discountPercent) || 0;
    const taxRateOnReceipt = Number(receipt?.taxRate) || 0;
    const afterDiscount = rawSubtotal * (1 - discountPercentOnReceipt / 100);
    return Math.round(afterDiscount * (1 + taxRateOnReceipt / 100) * 100) / 100;
  };

  const confirmRefund = async () => {
    const ticketId = refundTicketId.trim();
    const reason = refundReason.trim();
    if (!ticketId) {
      showToast('Indiquez le numéro du ticket à rembourser.', 'error');
      return;
    }
    if (!reason) {
      showToast('Un motif est requis pour un remboursement.', 'error');
      return;
    }
    const receipt = recentReceipts.find(r => r.displayId === ticketId || r.id === ticketId);
    if (!receipt) {
      showToast('Ticket introuvable parmi les paiements récents.', 'error');
      return;
    }
    if (receipt.status === 'Remboursée') {
      showToast('Ce ticket a déjà été remboursé.', 'error');
      return;
    }
    if (isProcessingRefund) return;

    const items = Array.isArray(receipt.items) ? receipt.items : [];

    // Legacy receipts created before item-level detail was stored: keep the old whole-ticket refund behavior.
    if (items.length === 0) {
      setIsProcessingRefund(true);
      try {
        let invoiceId: string | null = null;
        if (receipt.orderId) {
          const invoiceQuery = await getDocs(query(collection(db, 'invoices'), where('orderId', '==', receipt.orderId)));
          if (!invoiceQuery.empty) invoiceId = invoiceQuery.docs[0].id;
        }

        await runTransaction(db, async (transaction) => {
          const receiptRef = doc(db, 'cash_receipts', receipt.id);
          const receiptSnap = await transaction.get(receiptRef);
          if (!receiptSnap.exists()) throw new Error('Ticket introuvable.');
          if (receiptSnap.data().status === 'Remboursée') throw new Error('Ce ticket a déjà été remboursé.');

          const amount = Number(receipt.amount) || 0;
          let shiftRef = null;
          let shiftSnap = null;
          if (activeShift && receipt.shiftId === activeShift.id) {
            shiftRef = doc(db, 'pos_shifts', activeShift.id);
            shiftSnap = await transaction.get(shiftRef);
          }

          transaction.update(receiptRef, {
            status: 'Remboursée',
            refundedAmount: amount,
            refundReason: reason,
            refundedAt: serverTimestamp()
          });

          if (receipt.orderId) {
            transaction.update(doc(db, 'orders', receipt.orderId), {
              paymentStatus: 'Remboursée',
              updatedAt: serverTimestamp()
            });
          }

          if (invoiceId) {
            transaction.update(doc(db, 'invoices', invoiceId), {
              status: 'Remboursée',
              refundReason: reason,
              updatedAt: serverTimestamp()
            });
          }

          if (shiftRef && shiftSnap?.exists()) {
            const shiftData = shiftSnap.data();
            const cashPart = receipt.method === 'Espèces' ? amount : receipt.method === 'Mixte' ? (receipt.paymentBreakdown?.cash || 0) : 0;
            const cardPart = receipt.method === 'Carte Bancaire' ? amount : receipt.method === 'Mixte' ? (receipt.paymentBreakdown?.card || 0) : 0;
            transaction.update(shiftRef, {
              expectedCash: Math.max(0, (Number(shiftData.expectedCash) || 0) - cashPart),
              cashSales: Math.max(0, (Number(shiftData.cashSales) || 0) - cashPart),
              cardSales: Math.max(0, (Number(shiftData.cardSales) || 0) - cardPart),
              totalSales: Math.max(0, (Number(shiftData.totalSales) || 0) - amount),
              refundCount: (Number(shiftData.refundCount) || 0) + 1,
              updatedAt: serverTimestamp()
            });
          }

          const auditRef = doc(collection(db, 'pos_audit_logs'));
          transaction.set(auditRef, {
            action: 'order_refunded',
            orderId: receipt.orderId || null,
            receiptId: receipt.id,
            displayId: receipt.displayId || null,
            amount,
            partial: false,
            reason,
            shiftId: receipt.shiftId || null,
            source: 'POS',
            createdAt: serverTimestamp()
          });
        });

        showToast(`Ticket ${receipt.displayId || receipt.id} remboursé.`);
        setIsRefundModalOpen(false);
        setRefundTicketId('');
        setRefundReason('');
        setRefundSelections({});
      } catch (error: any) {
        console.error(error);
        showToast(error.message || 'Erreur lors du remboursement', 'error');
      } finally {
        setIsProcessingRefund(false);
      }
      return;
    }

    // Itemized receipts: refund only the selected quantity per article.
    const selections = Object.entries(refundSelections)
      .map(([idxStr, qty]) => ({ idx: Number(idxStr), qty: Number(qty) || 0 }))
      .filter(s => s.qty > 0);

    if (selections.length === 0) {
      showToast('Sélectionnez au moins un article à rembourser.', 'error');
      return;
    }

    for (const s of selections) {
      const item = items[s.idx];
      if (!item) {
        showToast('Article introuvable sur ce ticket.', 'error');
        return;
      }
      const remaining = getRemainingQtyForIndex(receipt, s.idx);
      if (s.qty > remaining + 1e-9) {
        showToast(`Quantité invalide pour ${item.name} (max ${remaining}).`, 'error');
        return;
      }
    }

    setIsProcessingRefund(true);
    try {
      let invoiceId: string | null = null;
      if (receipt.orderId) {
        const invoiceQuery = await getDocs(query(collection(db, 'invoices'), where('orderId', '==', receipt.orderId)));
        if (!invoiceQuery.empty) invoiceId = invoiceQuery.docs[0].id;
      }

      const refundAmount = computeRefundAmount(receipt, refundSelections);
      const refundedItemsSummary = selections.map(s => ({ name: items[s.idx]?.name || 'Inconnu', qty: s.qty }));

      await runTransaction(db, async (transaction) => {
        const receiptRef = doc(db, 'cash_receipts', receipt.id);
        const receiptSnap = await transaction.get(receiptRef);
        if (!receiptSnap.exists()) throw new Error('Ticket introuvable.');
        const freshData = receiptSnap.data();
        if (freshData.status === 'Remboursée') throw new Error('Ce ticket a déjà été remboursé.');

        const freshItems = Array.isArray(freshData.items) ? freshData.items : items;
        const freshRefundedQtyByIndex: number[] = Array.isArray(freshData.refundedQtyByIndex) ? [...freshData.refundedQtyByIndex] : [];
        for (const s of selections) {
          const already = Number(freshRefundedQtyByIndex[s.idx]) || 0;
          const remaining = (Number(freshItems[s.idx]?.qty) || 0) - already;
          if (s.qty > remaining + 1e-9) {
            throw new Error(`Quantité déjà remboursée entre-temps pour ${freshItems[s.idx]?.name || 'un article'}.`);
          }
          freshRefundedQtyByIndex[s.idx] = already + s.qty;
        }

        const totalOriginalQty = freshItems.reduce((sum: number, it: any) => sum + (Number(it.qty) || 0), 0);
        const totalRefundedQty = freshRefundedQtyByIndex.reduce((sum, q) => sum + (Number(q) || 0), 0);
        const isFullyRefunded = totalOriginalQty > 0 && totalRefundedQty >= totalOriginalQty - 1e-9;

        const priorRefundedAmount = Number(freshData.refundedAmount) || 0;
        const newRefundedAmount = Math.round((priorRefundedAmount + refundAmount) * 100) / 100;

        let shiftRef = null;
        let shiftSnap = null;
        if (activeShift && receipt.shiftId === activeShift.id) {
          shiftRef = doc(db, 'pos_shifts', activeShift.id);
          shiftSnap = await transaction.get(shiftRef);
        }

        transaction.update(receiptRef, {
          status: isFullyRefunded ? 'Remboursée' : 'Partiellement remboursée',
          refundedQtyByIndex: freshRefundedQtyByIndex,
          refundedAmount: newRefundedAmount,
          refundReason: reason,
          refundedAt: serverTimestamp()
        });

        if (receipt.orderId) {
          transaction.update(doc(db, 'orders', receipt.orderId), {
            paymentStatus: isFullyRefunded ? 'Remboursée' : 'Partiellement remboursée',
            updatedAt: serverTimestamp()
          });
        }

        if (invoiceId) {
          transaction.update(doc(db, 'invoices', invoiceId), {
            status: isFullyRefunded ? 'Remboursée' : 'Partiellement remboursée',
            refundReason: reason,
            updatedAt: serverTimestamp()
          });
        }

        if (shiftRef && shiftSnap?.exists()) {
          const shiftData = shiftSnap.data();
          const originalAmount = Number(receipt.amount) || 1;
          const cashPart = receipt.method === 'Espèces' ? refundAmount : receipt.method === 'Mixte' ? refundAmount * ((receipt.paymentBreakdown?.cash || 0) / originalAmount) : 0;
          const cardPart = receipt.method === 'Carte Bancaire' ? refundAmount : receipt.method === 'Mixte' ? refundAmount * ((receipt.paymentBreakdown?.card || 0) / originalAmount) : 0;
          transaction.update(shiftRef, {
            expectedCash: Math.max(0, (Number(shiftData.expectedCash) || 0) - cashPart),
            cashSales: Math.max(0, (Number(shiftData.cashSales) || 0) - cashPart),
            cardSales: Math.max(0, (Number(shiftData.cardSales) || 0) - cardPart),
            totalSales: Math.max(0, (Number(shiftData.totalSales) || 0) - refundAmount),
            refundCount: (Number(shiftData.refundCount) || 0) + 1,
            updatedAt: serverTimestamp()
          });
        }

        const auditRef = doc(collection(db, 'pos_audit_logs'));
        transaction.set(auditRef, {
          action: 'order_refunded',
          orderId: receipt.orderId || null,
          receiptId: receipt.id,
          displayId: receipt.displayId || null,
          amount: refundAmount,
          partial: !isFullyRefunded,
          items: refundedItemsSummary,
          reason,
          shiftId: receipt.shiftId || null,
          source: 'POS',
          createdAt: serverTimestamp()
        });
      });

      showToast(`Ticket ${receipt.displayId || receipt.id} : ${refundAmount.toFixed(2)} MAD remboursés.`);
      setIsRefundModalOpen(false);
      setRefundTicketId('');
      setRefundReason('');
      setRefundSelections({});
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Erreur lors du remboursement', 'error');
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const handleSendKitchen = async () => {
    if (cart.length === 0) {
      showToast("Le ticket est vide.", "error");
      return;
    }
    if (kitchenSent) {
      showToast("Cette commande est déjà envoyée en cuisine.", "error");
      return;
    }
    
    try {
      showToast("Envoi en cuisine...", "success");
      const orderId = createPosOrderId();
      const orderRef = doc(db, 'orders', orderId);
      
      await runTransaction(db, async (transaction) => {
        transaction.set(orderRef, {
          orderId,
          tableId: selectedTable || null,
          lines: cart.map(item => ({ name: item.name || 'Inconnu', qty: getLineQuantity(item), unitPrice: getLineUnitPrice(item), modifiers: item.modifiers || null })),
          subtotal: discountedSubtotal,
          tax,
          taxRate,
          total,
          discountPercent,
          discountAmount,
          status: 'En cuisine',
          paymentStatus: 'Non payée',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          source: 'POS'
        });

        cart.forEach((item, index) => {
          const taskRef = doc(db, 'productionTasks', `${orderId}-${index}`);
          transaction.set(taskRef, {
            orderId,
            tableId: selectedTable || null,
            item: item.name || 'Inconnu',
            category: item.category || 'Autres',
            modifiers: item.modifiers || null,
            qty: getLineQuantity(item),
            status: 'À faire',
            progress: 0,
            createdAt: serverTimestamp(),
            source: 'POS',
            priority: 'Haute'
          });
        });
      });

      setKitchenSent(true);
      setKitchenOrderId(orderId);
      setKitchenTableId(selectedTable);
      showToast("Commande envoyée en cuisine !", "success");
      const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
      const now = new Date();
      setTicketToPrint({
        id: orderId,
        date: today,
        time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        items: [...cart],
        total: total,
        method: "Envoi Cuisine"
      });
      setIsTicketModalOpen(true);
      
    } catch (e: any) {
      console.error(e);
      showToast("Erreur lors de l'envoi en cuisine", "error");
    }
  };

  const handleCheckout = async (method: string, paymentDetails: { cashReceived?: number; changeDue?: number; paymentBreakdown?: { cash: number; card: number } } = {}) => {
    if (cart.length === 0) {
      showToast("Le ticket est vide.", "error");
      return;
    }
    if (isProcessingPayment) return;
    if (!activeShift) {
      showToast('Ouvrez la caisse avant d\'encaisser.', 'error');
      setShiftMode('open');
      setShiftCashAmount('');
      setIsShiftModalOpen(true);
      return;
    }
    setIsProcessingPayment(true);
    
    try {
      const orderId = kitchenOrderId || createPosOrderId();
      const displayId = `TKT-${orderId.replace('CMD-', '').slice(-8)}`;
      const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
      const now = new Date();
      const currentInventoryItems = inventoryItems;

      const deductions: { id: string; name: string; unit: string; qtyToDeduct: number; reasonItem: string }[] = [];

      for (const cartItem of cart) {
          if (!cartItem || !cartItem.name) continue;

          const matchingRecipe = recettes.find(r => normalizeString(r.nom || r.name) === normalizeString(cartItem.name));

          if (matchingRecipe && matchingRecipe.ingredients && Array.isArray(matchingRecipe.ingredients)) {
            for (const ingredient of matchingRecipe.ingredients) {
              if (!ingredient || !ingredient.name) continue;

              const invItem = currentInventoryItems.find((inv: any) => normalizeString(inv.name) === normalizeString(ingredient.name));
              if (!invItem) continue;

              const portions = matchingRecipe.portions || 1;
              const qtyToDeduct = ((Number(ingredient.quantity) || 0) / portions) * getLineQuantity(cartItem);
              deductions.push({ id: invItem.id, name: invItem.name, unit: invItem.unit || 'kg', qtyToDeduct, reasonItem: cartItem.name });
            }
          } else {
            const matchingItem = currentInventoryItems.find((inv: any) =>
              normalizeString(inv.name) === normalizeString(cartItem.name)
            );
            if (!matchingItem) continue;
            deductions.push({ id: matchingItem.id, name: matchingItem.name, unit: matchingItem.unit || 'pièce', qtyToDeduct: getLineQuantity(cartItem), reasonItem: cartItem.name });
          }
      }

      const uniqueIds = Array.from(new Set(deductions.map(d => d.id)));
      await runTransaction(db, async (transaction) => {
        const refs = uniqueIds.map(id => doc(db, 'inventoryItems', id));
        const snaps = await Promise.all(refs.map(ref => transaction.get(ref)));
        const orderRef = doc(db, 'orders', orderId);
        const receiptRef = doc(collection(db, 'cash_receipts'));
        const invoiceRef = doc(collection(db, 'invoices'));
        const shiftRef = doc(db, 'pos_shifts', activeShift.id);
        const shiftSnapshot = await transaction.get(shiftRef);
        if (!shiftSnapshot.exists() || shiftSnapshot.data().status !== 'Ouvert') {
          throw new Error('La caisse active a été fermée.');
        }

        const totalDeductById = new Map<string, number>();
        deductions.forEach(d => totalDeductById.set(d.id, (totalDeductById.get(d.id) || 0) + d.qtyToDeduct));

        refs.forEach((ref, idx) => {
          const snap = snaps[idx];
          if (!snap.exists()) return;
          const id = uniqueIds[idx];
          const currentQty = Number(snap.data().quantity) || 0;
          const newQty = Math.max(0, currentQty - (totalDeductById.get(id) || 0));
          transaction.update(ref, { quantity: newQty, updatedAt: serverTimestamp() });
        });

        deductions.forEach(d => {
          const txRef = doc(collection(db, 'inventoryTransactions'));
          transaction.set(txRef, {
            item: d.name,
            type: 'out',
            amount: d.qtyToDeduct,
            unit: d.unit,
            reason: `Vente POS: ${d.reasonItem} (${displayId})`,
            user: 'POS',
            date: today,
            createdAt: serverTimestamp()
          });
        });

        transaction.set(receiptRef, {
          orderId,
          shiftId: activeShift.id,
          displayId,
          tableId: kitchenTableId || selectedTable || null,
          amount: total,
          subtotal: discountedSubtotal,
          tax,
          taxRate,
          discountPercent,
          discountAmount,
          method,
          cashReceived: paymentDetails.cashReceived ?? null,
          changeDue: paymentDetails.changeDue ?? null,
          paymentBreakdown: paymentDetails.paymentBreakdown ?? null,
          items: cart.map(item => ({ name: item.name || 'Inconnu', qty: getLineQuantity(item), price: getLineUnitPrice(item), lineTotal: getLineTotal(item), modifiers: item.modifiers || null })),
          date: today,
          createdAt: serverTimestamp()
        });

        transaction.set(invoiceRef, {
          id: `FAC-${orderId.replace('CMD-', '').slice(-8)}`,
          orderId,
          shiftId: activeShift.id,
          client: 'Client Comptoir (POS)',
          ice: 'N/A',
          date: today,
          montantHT: discountedSubtotal,
          tva: taxRate,
          amount: `${total.toFixed(2)} MAD`,
          discountPercent,
          discountAmount,
          status: 'Payée',
          method,
          paymentBreakdown: paymentDetails.paymentBreakdown ?? null,
          createdAt: serverTimestamp()
        });

        const cashSale = method === 'Espèces' ? total : method === 'Mixte' ? (paymentDetails.paymentBreakdown?.cash || 0) : 0;
        const cashTendered = method === 'Espèces' ? (paymentDetails.cashReceived ?? total) : method === 'Mixte' ? (paymentDetails.paymentBreakdown?.cash || 0) : 0;
        const cardSale = method === 'Carte Bancaire' ? total : method === 'Mixte' ? (paymentDetails.paymentBreakdown?.card || 0) : 0;
        const currentShift = shiftSnapshot.data();
        transaction.update(shiftRef, {
          expectedCash: (Number(currentShift.expectedCash) || 0) + cashTendered,
          cashSales: (Number(currentShift.cashSales) || 0) + cashSale,
          cardSales: (Number(currentShift.cardSales) || 0) + cardSale,
          totalSales: (Number(currentShift.totalSales) || 0) + total,
          paymentCount: (Number(currentShift.paymentCount) || 0) + 1,
          updatedAt: serverTimestamp()
        });

        transaction.set(orderRef, {
          orderId,
          shiftId: activeShift.id,
          tableId: kitchenTableId || selectedTable || null,
          lines: cart.map(item => ({ name: item.name || 'Inconnu', qty: getLineQuantity(item), unitPrice: getLineUnitPrice(item), modifiers: item.modifiers || null })),
          subtotal: discountedSubtotal,
          tax,
          taxRate,
          total,
          discountPercent,
          discountAmount,
          status: 'Clôturée',
          paymentStatus: 'Payée',
          paymentMethod: method,
          cashReceived: paymentDetails.cashReceived ?? null,
          changeDue: paymentDetails.changeDue ?? null,
          paymentBreakdown: paymentDetails.paymentBreakdown ?? null,
          updatedAt: serverTimestamp(),
          source: 'POS'
        }, { merge: true });

        if (!kitchenSent) {
          cart.forEach((item, index) => {
            const taskRef = doc(db, 'productionTasks', `${orderId}-${index}`);
            transaction.set(taskRef, {
              orderId,
              tableId: kitchenTableId || selectedTable || null,
              item: item.name || 'Inconnu',
              category: item.category || 'Autres',
              modifiers: item.modifiers || null,
              qty: getLineQuantity(item),
              status: 'À faire',
              progress: 0,
              createdAt: serverTimestamp(),
              source: 'POS',
              priority: 'Haute'
            });
          });
        }

        if (discountPercent > 0) {
          const auditRef = doc(collection(db, 'pos_audit_logs'));
          transaction.set(auditRef, {
            action: 'discount_applied',
            orderId,
            shiftId: activeShift.id,
            percent: discountPercent,
            amount: discountAmount,
            reason: discountReason.trim(),
            source: 'POS',
            createdAt: serverTimestamp()
          });
        }
      });

      setTicketToPrint({
        id: displayId,
        date: today,
        time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        items: [...cart],
        total: total,
        subtotal: discountedSubtotal,
        tax,
        taxRate,
        discountPercent,
        discountAmount,
        method: method,
        cashReceived: paymentDetails.cashReceived,
        changeDue: paymentDetails.changeDue,
        paymentBreakdown: paymentDetails.paymentBreakdown
      });
      setIsTicketModalOpen(true);
      setCart([]);
      setDiscountPercent(0);
      setDiscountReason('');
      setTaxRate(10);
      setKitchenSent(false);
      setKitchenOrderId(null);
      setKitchenTableId(null);
      
    } catch (err: any) {
      console.error("Checkout Error:", err);
      showToast("Erreur: " + (err.message || "Erreur inconnue lors de l'encaissement"), "error");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Helper for generating colors based on category
  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'Entrées': return 'from-green-400 to-emerald-500 shadow-green-500/40 text-white';
      case 'Plats Principaux': return 'from-[#F4C75B] to-orange-500 shadow-[#F4C75B]/40 text-[#1A1A1A]';
      case 'Desserts': return 'from-pink-400 to-rose-500 shadow-rose-500/40 text-white';
      case 'Boissons': return 'from-blue-400 to-indigo-500 shadow-blue-500/40 text-white';
      default: return 'from-gray-700 to-gray-900 shadow-gray-900/40 text-white';
    }
  };

  const cashAmount = parsePosPrice(cashReceived);
  const cashChange = Math.max(0, cashAmount - total);
  const mixedCash = parsePosPrice(mixedCashAmount);
  const mixedCard = parsePosPrice(mixedCardAmount);
  const mixedTotal = mixedCash + mixedCard;

  return (
    <div className="flex flex-col h-full min-h-screen lg:h-screen lg:overflow-hidden bg-[#F4F4F5]">
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        {/* Left Side - Menu Area */}
        <div className="flex-1 flex flex-col min-h-[60vh] lg:min-h-0">
          {/* Header & Categories */}
          <div className="p-6 bg-[#F4F4F5] z-10 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-serif font-bold text-[#1A1A1A] tracking-tight">Caisse Tactile</h1>
                <p className="text-gray-500 mt-1">Terminal de point de vente 3D synchronisé</p>
                {!isOnline && (
                  <div className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Hors ligne — les actions seront synchronisées à la reconnexion
                  </div>
                )}
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setShiftMode(activeShift ? 'close' : 'open');
                    setShiftCashAmount('');
                    setIsShiftModalOpen(true);
                  }}
                  className={`px-4 py-3 rounded-2xl font-bold text-sm whitespace-nowrap ${activeShift ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
                >
                  {activeShift ? `Caisse ouverte · ${Number(activeShift.totalSales || 0).toFixed(2)} MAD` : 'Caisse fermée'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRefundTicketId('');
                    setRefundReason('');
                    setRefundSelections({});
                    setIsRefundModalOpen(true);
                  }}
                  className="px-4 py-3 rounded-2xl font-bold text-sm whitespace-nowrap bg-rose-500 text-white shadow-[0_4px_0_0_#be123c] hover:brightness-110 transition-all duration-150 active:shadow-none active:translate-y-1"
                  title="Rembourser un ticket déjà payé"
                >
                  Rembourser
                </button>
                {activeShift && (
                  <button
                    type="button"
                    onClick={() => {
                      setShiftReportToPrint({ ...activeShift, type: 'X', generatedAt: new Date() });
                      setIsShiftReportModalOpen(true);
                    }}
                    className="px-4 py-3 rounded-2xl font-bold text-sm whitespace-nowrap bg-indigo-500 text-white shadow-[0_4px_0_0_#4338ca] hover:brightness-110 transition-all duration-150 active:shadow-none active:translate-y-1"
                    title="Rapport intermédiaire de caisse (X)"
                  >
                    Rapport X
                  </button>
                )}
                <div className="relative flex-1 md:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Rechercher un plat..." 
                    className="w-full pl-12 pr-4 py-3 bg-white border-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F4C75B] text-gray-700 font-medium transition-all"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`p-3 rounded-2xl transition-colors ${isEditMode ? 'bg-red-100 text-red-600' : 'bg-white text-gray-500 hover:bg-gray-50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]'}`}
                  title={isEditMode ? "Désactiver le mode édition" : "Activer le mode édition (suppression)"}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pb-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
                                    className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold whitespace-nowrap transition-all duration-300 ${
                    activeCategory === cat.id && !searchQuery
                      ? 'bg-[#1A1A1A] text-[#F4C75B] shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] translate-y-[4px]' 
                      : 'bg-white text-gray-500 hover:text-gray-900 shadow-[0_6px_0_#d1d5db,0_10px_15px_rgba(0,0,0,0.1)] border border-gray-100 -translate-y-[2px] active:translate-y-[4px] active:shadow-[0_0px_0_#d1d5db]'
                  }`}
                >
                  {cat.icon}
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {loading ? (
              <div className="h-full flex items-center justify-center text-gray-400">Chargement du menu...</div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3">
                <AnimatePresence mode="popLayout">
                  {/* Bouton d'ajout */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95, y: 4, boxShadow: "0 4px 0 #d1d5db, 0 8px 10px rgba(0,0,0,0.1)" }}
                    onClick={() => setIsAddModalOpen(true)}
                    className="relative overflow-hidden flex flex-col justify-center items-center aspect-square rounded-xl sm:rounded-2xl p-1.5 sm:p-2.5 border-2 border-dashed border-gray-300 text-gray-400 hover:text-[#F4C75B] hover:border-[#F4C75B] hover:bg-[#F4C75B]/5 bg-white shadow-[0_6px_0_#d1d5db,0_10px_16px_rgba(0,0,0,0.1)] transition-all"
                  >
                    <Plus size={22} className="mb-1" />
                    <span className="font-bold text-[10px] sm:text-xs text-center">Ajouter un article</span>
                  </motion.button>

                  {filteredItems.map(item => {
                    const colorClass = getCategoryColor(item.category);
                    const textColor = colorClass.includes('text-white') ? 'text-white/90' : 'text-[#1A1A1A]/80';
                    const priceColor = colorClass.includes('text-white') ? 'text-white' : 'text-[#1A1A1A]';
                    const resolvedImage = getItemImageUrl(item);

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95, y: 4, boxShadow: "0 4px 0 rgba(0,0,0,0.25), 0 8px 10px rgba(0,0,0,0.3), inset 0 3px 0 rgba(255,255,255,0.4), inset 0 -3px 0 rgba(0,0,0,0.2)" }}
                        key={item.id}
                        onClick={() => !isEditMode && openModifierPanel(item)}
                        className={`relative overflow-hidden flex flex-col justify-between aspect-square rounded-xl sm:rounded-2xl p-2 sm:p-2.5 text-left bg-gradient-to-br ${colorClass} shadow-[0_6px_0_rgba(0,0,0,0.25),0_10px_16px_rgba(0,0,0,0.3),inset_0_2px_0_rgba(255,255,255,0.4),inset_0_-2px_0_rgba(0,0,0,0.2)] border border-white/20 transition-all`}
                      >
                        {/* Full Image Background if available */}
                        {resolvedImage ? (
                          <>
                            <div className="absolute inset-0">
                              <img src={resolvedImage} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 rounded-2xl" />
                          </>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50 pointer-events-none rounded-2xl" />
                        )}

                        {isEditMode && (
                          <div
                            onClick={(e) => handleDeleteItem(e, item.id)}
                            className="absolute top-1 right-1 z-20 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash2 size={12} />
                          </div>
                        )}
                        <div className="relative z-10 flex flex-col h-full justify-between">
                          <span className={`font-bold text-[11px] sm:text-sm leading-tight flex-1 drop-shadow-sm break-words line-clamp-3 ${resolvedImage ? 'text-white' : priceColor}`}>
                            {item.name}
                          </span>
                          <div className="mt-auto flex flex-wrap items-baseline">
                            <span className={`font-black text-sm sm:text-lg drop-shadow-md ${resolvedImage ? 'text-white' : priceColor}`}>
                              {item.numPrice}
                            </span>
                            <span className={`font-bold text-[9px] sm:text-[10px] ml-1 ${resolvedImage ? 'text-white/80' : textColor}`}>MAD</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {false && filteredItems.length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-400 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
                    Aucun plat trouvé dans cette catégorie.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Ticket / Cart Area */}
        <div className="w-full lg:w-[480px] bg-white flex flex-col shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] z-20 lg:m-4 mt-4 lg:mt-4 rounded-t-3xl lg:rounded-3xl overflow-hidden border border-gray-100 flex-shrink-0 min-h-[500px] lg:min-h-0">

          <div className="flex gap-2 p-3 bg-gray-50 border-b border-gray-200">
            <button
              onClick={() => setActiveCartTab('cart')}
              className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all duration-150 ${activeCartTab === 'cart' ? 'bg-[#1A1A1A] text-white shadow-[0_4px_0_0_#000000]' : 'bg-[#3D3D3D] text-white/90 shadow-[0_4px_0_0_#141414] hover:brightness-110'} active:shadow-none active:translate-y-1`}
            >
              Ticket Actuel
            </button>
            <button
              onClick={() => setActiveCartTab('kitchen')}
              className={`flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-150 ${activeCartTab === 'kitchen' ? 'bg-orange-500 text-white shadow-[0_4px_0_0_#c2410c]' : 'bg-orange-400 text-white shadow-[0_4px_0_0_#c2410c] hover:brightness-110'} active:shadow-none active:translate-y-1`}
            >
              Cuisine (KDS)
              {kitchenOrders.filter(o => o.status !== 'Terminé').length > 0 && (
                <span className="bg-white text-orange-600 text-[10px] px-1.5 py-0.5 rounded-full font-black">
                  {kitchenOrders.filter(o => o.status !== 'Terminé').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveCartTab('suspended')}
              className={`flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-1 transition-all duration-150 ${activeCartTab === 'suspended' ? 'bg-[#F4C75B] text-[#1A1A1A] shadow-[0_4px_0_0_#B8912E]' : 'bg-[#F7D583] text-[#1A1A1A] shadow-[0_4px_0_0_#B8912E] hover:brightness-105'} active:shadow-none active:translate-y-1`}
            >
              <PauseCircle size={15} /> En attente
              {suspendedTickets.length > 0 && (
                <span className="bg-[#1A1A1A] text-[#F4C75B] text-[10px] px-1.5 py-0.5 rounded-full font-black">{suspendedTickets.length}</span>
              )}
            </button>
            <button
              onClick={() => setActiveCartTab('messages')}
              className={`flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-1 transition-all duration-150 ${activeCartTab === 'messages' ? 'bg-blue-500 text-white shadow-[0_4px_0_0_#1d4ed8]' : 'bg-blue-400 text-white shadow-[0_4px_0_0_#1d4ed8] hover:brightness-110'} active:shadow-none active:translate-y-1`}
            >
              <MessageSquare size={15} /> Messages
              {posMessages.filter(message => !message.read && message.target === 'POS').length > 0 && (
                <span className="bg-white text-blue-600 text-[10px] px-1.5 py-0.5 rounded-full font-black">{posMessages.filter(message => !message.read && message.target === 'POS').length}</span>
              )}
            </button>
          </div>
          
          {activeCartTab === 'cart' ? (
          <>
          {/* Ticket Header */}
          <div className="p-6 bg-white flex justify-between items-center border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F4C75B]/20 flex items-center justify-center text-[#F4C75B]">
                <Receipt size={20} />
              </div>
              <h2 className="font-bold text-[#1A1A1A] text-xl">Ticket</h2>
            </div>
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button 
                  onClick={handleClearCart}
                  className="flex items-center justify-center w-10 h-10 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors" title="Annuler le ticket"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsDiscountModalOpen(true)}
                disabled={cart.length === 0 || isProcessingPayment}
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${discountPercent > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                title="Appliquer une remise"
              >
                %
              </button>
              <button 
                onClick={() => setIsTableModalOpen(true)}
                className="flex items-center gap-2 text-sm bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl font-bold text-gray-700 hover:bg-gray-100 hover:shadow-inner transition-all"
              >
                <User size={16} />
                {selectedTable ? selectedTable : "Table"}
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-2 bg-gray-50/50">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-4">
                <Utensils size={64} className="opacity-20" />
                <p className="font-medium text-gray-400">Le ticket est vide</p>
              </div>
            ) : (
              <AnimatePresence>
                {cart.map(item => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: 20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.9 }}
                    key={item.id}
                    className="flex justify-between items-center bg-white p-4 mb-2 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-50"
                  >
                    <div className="flex-1 pr-3">
                      <h4 className="font-bold text-[#1A1A1A] leading-tight text-[15px] mb-1 line-clamp-2">{item.name}</h4>
                      {item.modifiers && Object.values(item.modifiers).some(Boolean) && (
                        <p className="text-[11px] text-gray-500 mb-1 line-clamp-2">
                          {[item.modifiers.cooking, item.modifiers.extra, item.modifiers.note].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      <div className="text-[#F4C75B] font-black text-sm">{item.numPrice * item.qty} MAD</div>
                    </div>
                    
                    <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1 shadow-inner">
                      <button 
                        onClick={() => updateQty(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-[0_2px_5px_rgba(0,0,0,0.05)] text-gray-600 hover:text-red-500 transition-colors active:scale-90"
                      >
                        {item.qty === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                      </button>
                      <span className="w-6 text-center font-bold text-[#1A1A1A]">{item.qty}</span>
                      <button 
                        onClick={() => updateQty(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-[0_2px_5px_rgba(0,0,0,0.05)] text-gray-600 hover:text-green-500 transition-colors active:scale-90"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Ticket Footer / Checkout */}
          <div className="bg-white p-6 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-10 relative">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Sous-total</span>
                <span>{subtotal.toFixed(2)} MAD</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-amber-700 font-medium">
                  <span>Remise ({discountPercent}%)</span>
                  <span>-{discountAmount.toFixed(2)} MAD</span>
                </div>
              )}
              <div className="flex justify-between items-center text-gray-500 font-medium">
                <span className="flex items-center gap-1.5">
                  TVA
                  <select
                    value={taxRate}
                    onChange={(event) => setTaxRate(Number(event.target.value))}
                    disabled={isProcessingPayment}
                    className="text-xs font-bold border border-gray-200 rounded-lg px-1.5 py-0.5 bg-white text-gray-700 focus:outline-none focus:border-[#F4C75B]"
                  >
                    {TVA_RATES.map(rate => <option key={rate} value={rate}>{rate}%</option>)}
                  </select>
                </span>
                <span>{tax.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-gray-100">
                <span className="text-gray-900 font-bold">Total</span>
                <span className="text-[#1A1A1A] font-black text-3xl tracking-tight">{total.toFixed(2)} <span className="text-lg text-gray-500">MAD</span></span>
              </div>
            </div>

            <button 
              onClick={suspendTicket}
              disabled={cart.length === 0 || isProcessingPayment}
              className="w-full py-3 mb-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <PauseCircle size={19} /> Mettre en attente
            </button>

            <button
              onClick={handleSendKitchen}
              disabled={kitchenSent || isProcessingPayment}
              className="w-full py-4 bg-gray-100 text-gray-800 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[inset_0_-2px_0_rgba(0,0,0,0.1)] active:translate-y-0.5 active:shadow-none mb-3"
            >
              <Utensils size={20} />
              Envoyer en Cuisine
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => {
                  setCashReceived('');
                  setIsCashPaymentOpen(true);
                }}
                disabled={isProcessingPayment}
                className="py-4 bg-emerald-500 text-white rounded-2xl font-bold flex flex-col items-center justify-center gap-1 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_6px_15px_-5px_rgba(16,185,129,0.5),inset_0_-3px_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-[inset_0_3px_0_rgba(0,0,0,0.2)]"
              >
                <Banknote size={24} />
                <span className="text-sm">Espèces</span>
              </button>
              <button 
                onClick={() => handleCheckout('Carte Bancaire')}
                disabled={isProcessingPayment}
                className="py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold flex flex-col items-center justify-center gap-1 hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_6px_15px_-5px_rgba(0,0,0,0.4),inset_0_-3px_0_rgba(255,255,255,0.2)] active:translate-y-1 active:shadow-[inset_0_3px_0_rgba(0,0,0,0.5)]"
              >
                <CreditCard size={24} />
                <span className="text-sm">Carte B.</span>
              </button>
            </div>
            <button
              onClick={() => {
                setMixedCashAmount('');
                setMixedCardAmount('');
                setIsMixedPaymentOpen(true);
              }}
              disabled={isProcessingPayment}
              className="w-full mt-3 py-3 bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Paiement mixte espèces + carte
            </button>
          </div>
          </>
          ) : activeCartTab === 'kitchen' ? (
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {kitchenOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Utensils size={48} className="mb-4 opacity-50" />
                <p>Aucune commande en cuisine</p>
              </div>
            ) : (
              <div className="space-y-3">
                {kitchenOrders.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 50).map(order => (
                  <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {order.orderId || 'CMD-???'}
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        order.status === 'À faire' ? 'bg-red-50 text-red-600' :
                        order.status === 'En cours' ? 'bg-blue-50 text-blue-600' :
                        'bg-green-50 text-green-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-gray-100 font-bold px-2 py-0.5 rounded text-sm">
                        {order.qty}x
                      </div>
                      <div className="font-bold text-gray-900 line-clamp-1 text-sm">
                        {order.item}
                      </div>
                    </div>
                    {order.status === 'Terminé' && (
                      <div className="mt-2 text-right">
                        <button 
                          onClick={() => {
                            // Automatically remove or let it be
                            deleteDoc(doc(db, 'productionTasks', order.id));
                          }}
                          className="text-xs text-gray-400 hover:text-red-500"
                        >
                          Retirer
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          ) : activeCartTab === 'suspended' ? (
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {suspendedTickets.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                  <PauseCircle size={48} className="opacity-40" />
                  <p>Aucun ticket en attente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {suspendedTickets.map(ticket => (
                    <div key={ticket.id} className="bg-white rounded-2xl border border-amber-100 p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="font-bold text-gray-900">{ticket.tableId || 'Comptoir'}</p>
                          <p className="text-xs text-gray-400">{ticket.items?.length || 0} article(s)</p>
                        </div>
                        <span className="font-bold text-[#265C6D]">{Number(ticket.total || 0).toFixed(2)} MAD</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {(ticket.items || []).map((item: any) => `${item.qty}x ${item.name}`).join(', ')}
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => recallTicket(ticket)} className="flex-1 py-2.5 rounded-xl bg-[#265C6D] text-white font-bold hover:bg-[#1d4a58]">Rappeler</button>
                        <button onClick={() => deleteSuspendedTicket(ticket.id)} className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100" title="Supprimer le ticket"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
              <form onSubmit={sendPosMessage} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-gray-900 font-bold"><MessageSquare size={19} className="text-[#265C6D]" /> Message entre services</div>
                <div className="grid grid-cols-2 gap-2">
                  <select value={messageTarget} onChange={(event) => setMessageTarget(event.target.value)} className="p-2.5 rounded-xl border border-gray-200 text-sm">
                    <option>Cuisine</option><option>Salle</option><option>Direction</option><option>Stock</option><option>POS</option>
                  </select>
                  <select value={messagePriority} onChange={(event) => setMessagePriority(event.target.value)} className="p-2.5 rounded-xl border border-gray-200 text-sm">
                    <option>Normale</option><option>Importante</option><option>Urgente</option>
                  </select>
                </div>
                <textarea value={messageText} onChange={(event) => setMessageText(event.target.value)} rows={3} placeholder="Écrire un message..." className="w-full p-3 rounded-xl border border-gray-200 resize-none focus:outline-none focus:border-[#F4C75B]" />
                <button type="submit" disabled={!messageText.trim()} className="w-full py-3 rounded-xl bg-[#265C6D] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-40"><Send size={17} /> Envoyer</button>
              </form>

              <div className="space-y-2">
                {posMessages.length === 0 ? <p className="text-center text-gray-400 py-8">Aucun message</p> : posMessages.slice().reverse().map(message => (
                  <button key={message.id} type="button" onClick={() => !message.read && markPosMessageRead(message.id)} className={`w-full text-left bg-white rounded-xl border p-3 shadow-sm ${message.read ? 'border-gray-100' : 'border-[#F4C75B] bg-amber-50/30'}`}>
                    <div className="flex justify-between gap-2 mb-1"><span className="font-bold text-sm text-[#265C6D]">{message.target}</span><span className={`text-[10px] font-bold uppercase ${message.priority === 'Urgente' ? 'text-red-600' : 'text-gray-400'}`}>{message.priority}</span></div>
                    <p className="text-sm text-gray-700">{message.text}</p>
                    {(message.tableId || message.orderId) && <p className="text-[11px] text-gray-400 mt-2">{message.tableId || ''}{message.orderId ? ` · ${message.orderId}` : ''}</p>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Discount modal */}
      {isDiscountModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Remise POS</h3>
                <p className="text-sm text-gray-500 mt-1">Validation manager requise</p>
              </div>
              <button type="button" onClick={() => setIsDiscountModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={22} /></button>
            </div>
            <form onSubmit={(event) => { event.preventDefault(); applyDiscount(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pourcentage (0 à 100)</label>
                <input type="number" min="0" max="100" step="0.5" value={discountPercent || ''} onChange={(event) => setDiscountPercent(Number(event.target.value) || 0)} className="w-full p-3 text-xl font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-[#F4C75B]" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Motif obligatoire</label>
                <textarea value={discountReason} onChange={(event) => setDiscountReason(event.target.value)} rows={2} className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-[#F4C75B]" placeholder="Ex. geste commercial" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsDiscountModalOpen(false)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold">Annuler</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-[#265C6D] text-white font-bold">Appliquer</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Cancel sent order modal */}
      {isCancelOrderModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Annuler la commande</h3>
                <p className="text-sm text-gray-500 mt-1">Déjà envoyée en cuisine — la cuisine sera prévenue</p>
              </div>
              <button type="button" onClick={() => setIsCancelOrderModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={22} /></button>
            </div>
            <form onSubmit={(event) => { event.preventDefault(); confirmCancelOrder(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Motif obligatoire</label>
                <textarea value={cancelOrderReason} onChange={(event) => setCancelOrderReason(event.target.value)} rows={2} className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-[#F4C75B]" placeholder="Ex. client parti, erreur de commande" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsCancelOrderModalOpen(false)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold">Retour</button>
                <button type="submit" disabled={isCancellingOrder} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold disabled:opacity-50">Confirmer l'annulation</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Refund modal */}
      {isRefundModalOpen && (() => {
        const refundReceipt = getRefundReceipt();
        const refundItems = Array.isArray(refundReceipt?.items) ? refundReceipt.items : [];
        const isItemized = !!refundReceipt && refundItems.length > 0;
        const isLegacy = !!refundReceipt && refundItems.length === 0;
        const previewAmount = refundReceipt ? computeRefundAmount(refundReceipt, refundSelections) : 0;
        const allSelected = isItemized && refundItems.every((_, idx) => (refundSelections[idx] || 0) >= getRemainingQtyForIndex(refundReceipt, idx));

        const setItemQty = (idx: number, qty: number) => {
          const remaining = getRemainingQtyForIndex(refundReceipt, idx);
          const clamped = Math.max(0, Math.min(remaining, qty));
          setRefundSelections(prev => {
            const next = { ...prev };
            if (clamped <= 0) delete next[idx];
            else next[idx] = clamped;
            return next;
          });
        };

        const selectAll = () => {
          const next: Record<number, number> = {};
          refundItems.forEach((_, idx) => {
            const remaining = getRemainingQtyForIndex(refundReceipt, idx);
            if (remaining > 0) next[idx] = remaining;
          });
          setRefundSelections(next);
        };

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Rembourser un ticket</h3>
                  <p className="text-sm text-gray-500 mt-1">Remboursement partiel par article, validation manager requise</p>
                </div>
                <button type="button" onClick={() => setIsRefundModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={22} /></button>
              </div>
              <form onSubmit={(event) => { event.preventDefault(); confirmRefund(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Numéro de ticket</label>
                  <input
                    list="refund-recent-tickets"
                    value={refundTicketId}
                    onChange={(event) => { setRefundTicketId(event.target.value); setRefundSelections({}); }}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#F4C75B]"
                    placeholder="Ex. TKT-A1B2C3D4"
                  />
                  <datalist id="refund-recent-tickets">
                    {recentReceipts.filter(r => r.status !== 'Remboursée').map(r => (
                      <option key={r.id} value={r.displayId || r.id}>{Number(r.amount || 0).toFixed(2)} MAD — {r.method}</option>
                    ))}
                  </datalist>
                </div>

                {isItemized && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700">Articles à rembourser</label>
                      <button type="button" onClick={allSelected ? () => setRefundSelections({}) : selectAll} className="text-xs font-semibold text-[#0B6E5E] hover:underline">
                        {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                      </button>
                    </div>
                    <div className="space-y-2 border border-gray-200 rounded-xl p-3 max-h-56 overflow-y-auto">
                      {refundItems.map((item: any, idx: number) => {
                        const remaining = getRemainingQtyForIndex(refundReceipt, idx);
                        const selectedQty = refundSelections[idx] || 0;
                        return (
                          <div key={idx} className={`flex items-center justify-between gap-2 ${remaining <= 0 ? 'opacity-40' : ''}`}>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                              <p className="text-xs text-gray-500">{Number(item.price || 0).toFixed(2)} MAD · {remaining} restant(s) sur {item.qty}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button type="button" disabled={remaining <= 0 || selectedQty <= 0} onClick={() => setItemQty(idx, selectedQty - 1)} className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 font-bold disabled:opacity-40">-</button>
                              <span className="w-6 text-center text-sm font-semibold">{selectedQty}</span>
                              <button type="button" disabled={remaining <= 0 || selectedQty >= remaining} onClick={() => setItemQty(idx, selectedQty + 1)} className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 font-bold disabled:opacity-40">+</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mt-2 text-right">Montant à rembourser : {previewAmount.toFixed(2)} MAD</p>
                  </div>
                )}

                {isLegacy && (
                  <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    Ce ticket ne contient pas le détail des articles (ancien format) — seul le remboursement total ({Number(refundReceipt?.amount || 0).toFixed(2)} MAD) est possible.
                  </p>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Motif obligatoire</label>
                  <textarea value={refundReason} onChange={(event) => setRefundReason(event.target.value)} rows={2} className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-[#F4C75B]" placeholder="Ex. erreur de paiement, client mécontent" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsRefundModalOpen(false)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold">Retour</button>
                  <button type="submit" disabled={isProcessingRefund || (isItemized && previewAmount <= 0)} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold disabled:opacity-50">Confirmer le remboursement</button>
                </div>
              </form>
            </motion.div>
          </div>
        );
      })()}

      {/* Shift modal */}
      {modifierItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[115] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div><h3 className="text-xl font-bold text-gray-900">Personnaliser le plat</h3><p className="text-sm text-gray-500 mt-1">{modifierItem.name}</p></div>
              <button type="button" onClick={() => setModifierItem(null)} className="text-gray-400 hover:text-gray-700"><X size={22} /></button>
            </div>
            <div className="space-y-4">
              {modifierItem.category === 'Plats Principaux' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cuisson</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Bleu', 'Saignant', 'À point', 'Bien cuit'].map(option => <button key={option} type="button" onClick={() => setModifierCooking(modifierCooking === option ? '' : option)} className={`p-3 rounded-xl border font-semibold ${modifierCooking === option ? 'bg-[#265C6D] text-white border-[#265C6D]' : 'border-gray-200 text-gray-700'}`}>{option}</button>)}
                  </div>
                </div>
              )}
              {modifierItem.category !== 'Boissons' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Supplément / accompagnement</label>
                  <select value={modifierExtra} onChange={event => setModifierExtra(event.target.value)} className="w-full p-3 rounded-xl border border-gray-200">
                    <option value="">Aucun</option><option>Frites maison</option><option>Légumes grillés</option><option>Sauce supplémentaire</option><option>Portion supplémentaire</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Note cuisine / allergie</label>
                <textarea value={modifierNote} onChange={event => setModifierNote(event.target.value)} rows={2} placeholder="Ex. sans noix, sauce à part..." className="w-full p-3 rounded-xl border border-gray-200 resize-none" />
              </div>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setModifierItem(null)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold">Annuler</button><button type="button" onClick={confirmModifiers} className="flex-1 py-3 rounded-xl bg-[#F4C75B] text-[#1A1A1A] font-bold">Ajouter au ticket</button></div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Shift modal */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{shiftMode === 'open' ? 'Ouvrir la caisse' : 'Fermer la caisse'}</h3>
                <p className="text-sm text-gray-500 mt-1">{shiftMode === 'open' ? 'Saisissez le fond de caisse initial.' : `Espèces théoriques : ${Number(activeShift?.expectedCash || 0).toFixed(2)} MAD`}</p>
              </div>
              <button type="button" onClick={() => setIsShiftModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={22} /></button>
            </div>
            <form onSubmit={(event) => { event.preventDefault(); shiftMode === 'open' ? openShift() : closeShift(); }}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{shiftMode === 'open' ? 'Fond de caisse (MAD)' : 'Espèces comptées (MAD)'}</label>
              <input autoFocus type="text" inputMode="decimal" value={shiftCashAmount} onChange={(event) => setShiftCashAmount(event.target.value)} placeholder="0.00" className="w-full p-4 text-2xl font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-[#F4C75B]" />
              {shiftMode === 'close' && <p className="mt-3 text-sm text-gray-500">Écart estimé : <strong>{(parsePosPrice(shiftCashAmount) - Number(activeShift?.expectedCash || 0)).toFixed(2)} MAD</strong></p>}
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setIsShiftModalOpen(false)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold">Annuler</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-[#265C6D] text-white font-bold">{shiftMode === 'open' ? 'Ouvrir' : 'Fermer'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Cash payment modal */}
      {isCashPaymentOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Paiement en espèces</h3>
                <p className="text-sm text-gray-500 mt-1">Total à encaisser : <strong>{total.toFixed(2)} MAD</strong></p>
              </div>
              <button type="button" onClick={() => setIsCashPaymentOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={22} /></button>
            </div>
            <form onSubmit={(event) => {
              event.preventDefault();
              if (cashAmount < total) {
                showToast('Le montant reçu est inférieur au total.', 'error');
                return;
              }
              setIsCashPaymentOpen(false);
              handleCheckout('Espèces', { cashReceived: cashAmount, changeDue: cashChange });
            }}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Montant reçu (MAD)</label>
              <input
                autoFocus
                type="text"
                inputMode="decimal"
                value={cashReceived}
                onChange={(event) => setCashReceived(event.target.value)}
                placeholder={total.toFixed(2)}
                className="w-full p-4 text-2xl font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-[#F4C75B]"
              />
              <div className={`mt-4 rounded-xl p-4 flex justify-between items-center ${cashAmount >= total ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-500'}`}>
                <span className="font-semibold">Monnaie à rendre</span>
                <span className="text-xl font-black">{cashChange.toFixed(2)} MAD</span>
              </div>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setIsCashPaymentOpen(false)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold">Annuler</button>
                <button type="submit" disabled={cashAmount < total || isProcessingPayment} className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed">Encaisser</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {isMixedPaymentOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Paiement mixte</h3>
                <p className="text-sm text-gray-500 mt-1">Total : <strong>{total.toFixed(2)} MAD</strong></p>
              </div>
              <button type="button" onClick={() => setIsMixedPaymentOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={22} /></button>
            </div>
            <form onSubmit={(event) => {
              event.preventDefault();
              if (mixedCash < 0 || mixedCard < 0 || Math.abs(mixedTotal - total) > 0.01) {
                showToast('La répartition espèces + carte doit être égale au total.', 'error');
                return;
              }
              setIsMixedPaymentOpen(false);
              handleCheckout('Mixte', { paymentBreakdown: { cash: mixedCash, card: mixedCard } });
            }}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Part espèces (MAD)</label>
              <input
                autoFocus
                type="text"
                inputMode="decimal"
                value={mixedCashAmount}
                onChange={(event) => setMixedCashAmount(event.target.value)}
                placeholder="0.00"
                className="w-full p-3 text-xl font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-[#F4C75B] mb-4"
              />
              <label className="block text-sm font-semibold text-gray-700 mb-2">Part carte (MAD)</label>
              <input
                type="text"
                inputMode="decimal"
                value={mixedCardAmount}
                onChange={(event) => setMixedCardAmount(event.target.value)}
                placeholder={total.toFixed(2)}
                className="w-full p-3 text-xl font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-[#F4C75B]"
              />
              <div className={`mt-4 rounded-xl p-4 flex justify-between items-center ${Math.abs(mixedTotal - total) <= 0.01 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-500'}`}>
                <span className="font-semibold">Répartition</span>
                <span className="text-xl font-black">{mixedTotal.toFixed(2)} / {total.toFixed(2)} MAD</span>
              </div>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setIsMixedPaymentOpen(false)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold">Annuler</button>
                <button type="submit" disabled={Math.abs(mixedTotal - total) > 0.01 || isProcessingPayment} className="flex-1 py-3 rounded-xl bg-[#1A1A1A] text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed">Encaisser</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Ticket Modal */}
      {isTicketModalOpen && ticketToPrint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-sm w-full flex flex-col max-h-[90vh]"
          >
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Ticket de caisse</h3>
              <button onClick={() => setIsTicketModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-white flex-1">
              <TicketReceiptBody ticket={ticketToPrint} />
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button 
                onClick={() => setIsTicketModalOpen(false)}
                className="flex-1 py-2.5 text-gray-600 font-medium hover:bg-gray-200 bg-gray-100 rounded-lg transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-[#F4C75B] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#E5B745] transition-colors flex items-center justify-center gap-2"
              >
                <Receipt size={18} />
                Imprimer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {ticketToPrint && typeof document !== 'undefined' && createPortal(
        <div id="printable-ticket" className="hidden print:block bg-white p-4">
          <TicketReceiptBody ticket={ticketToPrint} />
        </div>,
        document.body
      )}

      {/* Shift X/Z report modal */}
      {isShiftReportModalOpen && shiftReportToPrint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-sm w-full flex flex-col max-h-[90vh]"
          >
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Rapport {shiftReportToPrint.type === 'Z' ? 'Z' : 'X'} de caisse</h3>
              <button onClick={() => setIsShiftReportModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-white flex-1">
              <ShiftReportBody report={shiftReportToPrint} />
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button
                onClick={() => setIsShiftReportModalOpen(false)}
                className="flex-1 py-2.5 text-gray-600 font-medium hover:bg-gray-200 bg-gray-100 rounded-lg transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  const w = window.open('', '_blank');
                  if (w) {
                    w.document.write(buildShiftReportHtml(shiftReportToPrint));
                    w.document.close();
                  }
                }}
                className="flex-1 py-2.5 bg-[#F4C75B] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#E5B745] transition-colors flex items-center justify-center gap-2"
              >
                <Receipt size={18} />
                Imprimer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1A1A1A]">Nouvel Article</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'article</label>
                <Combobox
                  options={recettes.map(r => r.nom)}
                  value={newItemName}
                  onChange={val => handleNameChange(val)}
                  placeholder="Saisie libre ou sélectionner..."
                  required
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#F4C75B] bg-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (MAD)</label>
                <input 
                  type="number" 
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  placeholder="Ex: 25" 
                  required 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#F4C75B] bg-white"
                />
              </div>

                            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo de l'article</label>
                <div className="flex gap-2 mb-2">
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="w-full border border-gray-200 rounded-xl p-2 focus:outline-none focus:border-[#F4C75B] bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsPhotoGalleryOpen(!isPhotoGalleryOpen)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors whitespace-nowrap"
                  >
                    Photos du menu
                  </button>
                </div>
                
                {isPhotoGalleryOpen && (
                  <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100 h-40 overflow-y-auto">
                    {Array.from(new Set(menuItems.filter(i => i.imageUrl).map(i => i.imageUrl))).map((url: any, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setNewItemImage(url);
                          setIsPhotoGalleryOpen(false);
                        }}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 ${newItemImage === url ? 'border-[#F4C75B]' : 'border-transparent hover:border-gray-300'}`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                    {menuItems.filter(i => i.imageUrl).length === 0 && (
                      <div className="col-span-4 text-center text-sm text-gray-500 py-4">Aucune photo disponible dans le menu</div>
                    )}
                  </div>
                )}

                {newItemImage && !isPhotoGalleryOpen && (
                  <div className="mt-2 relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200">
                    <img src={newItemImage} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setNewItemImage('')} className="absolute top-1 right-1 bg-white/80 hover:bg-white rounded-full p-1 shadow text-gray-700">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full py-3 bg-[#F4C75B] text-[#1A1A1A] rounded-xl font-bold hover:bg-[#cda25b] transition-colors"
                >
                  Ajouter dans {activeCategory}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}


      {/* Table Selection Modal */}
      {isTableModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1A1A1A]">Sélectionner une table</h2>
              <button 
                onClick={() => setIsTableModalOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-6">
                {tables.map((table) => (
                  <button
                    key={table.id || table.fbId}
                    onClick={() => transferTable(table.id)}
                    disabled={isTransferringTable}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center font-bold transition-all ${selectedTable === table.id ? 'bg-[#F4C75B] text-[#1A1A1A] shadow-md scale-105 border-2 border-[#F4C75B]' : 'bg-white text-gray-700 border-2 border-gray-100 hover:bg-gray-50'}`}
                  >
                    <span className="text-xl mb-1">{table.id}</span>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${table.status === 'libre' ? 'bg-green-100 text-green-700' : table.status === 'occupee' ? 'bg-red-100 text-red-700' : table.status === 'reservee' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                      {table.status === 'libre' ? 'Libre' : table.status === 'occupee' ? 'Occupée' : table.status === 'reservee' ? 'Réservée' : table.status}
                    </span>
                  </button>
                ))}
              </div>
              
              <div className="border-t border-gray-100 pt-6">
                <button
                  onClick={() => {
                    setSelectedTable('À emporter');
                    setIsTableModalOpen(false);
                  }}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${selectedTable === 'À emporter' ? 'bg-[#F4C75B] text-[#1A1A1A] shadow-md' : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'}`}
                >
                  À emporter (Takeaway)
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      <ConfirmModal 
        isOpen={!!itemToDelete}
        title="Supprimer l'article"
        message="Voulez-vous vraiment supprimer cet article du menu ?"
        onConfirm={confirmDeleteItem}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
