import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { BarChart2, Wallet, Receipt, AlertTriangle, Tag, XCircle, RotateCcw, Clock } from 'lucide-react';

type RangeKey = 'today' | '7d' | '30d' | 'all';

const RANGE_LABELS: Record<RangeKey, string> = {
  today: "Aujourd'hui",
  '7d': '7 derniers jours',
  '30d': '30 derniers jours',
  all: 'Tout'
};

const KpiTile = ({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
    <div className="flex items-center gap-2 text-gray-400 mb-2">
      {icon}
      <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
    </div>
    <div className="text-2xl font-black text-[#1A1A1A]">{value}</div>
    {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
  </div>
);

export default function PosRapports() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [range, setRange] = useState<RangeKey>('today');

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'cash_receipts'), orderBy('createdAt', 'desc'), limit(500)), snap => {
      setReceipts(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    }, error => console.error('cash_receipts error:', error));
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'pos_shifts'), orderBy('openedAt', 'desc'), limit(50)), snap => {
      setShifts(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    }, error => console.error('pos_shifts error:', error));
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'pos_audit_logs'), orderBy('createdAt', 'desc'), limit(100)), snap => {
      setAuditLogs(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    }, error => console.error('pos_audit_logs error:', error));
    return () => unsub();
  }, []);

  const rangeStartSeconds = () => {
    const now = Date.now() / 1000;
    if (range === 'today') {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d.getTime() / 1000;
    }
    if (range === '7d') return now - 7 * 24 * 3600;
    if (range === '30d') return now - 30 * 24 * 3600;
    return 0;
  };

  const startSeconds = rangeStartSeconds();
  const filteredReceipts = receipts.filter(r => (r.createdAt?.seconds || 0) >= startSeconds);
  const filteredAudit = auditLogs.filter(a => (a.createdAt?.seconds || 0) >= startSeconds);
  const filteredShifts = shifts.filter(s => (s.openedAt?.seconds || 0) >= startSeconds);

  const paidReceipts = filteredReceipts.filter(r => r.status !== 'Remboursée');
  const refundedReceipts = filteredReceipts.filter(r => r.status === 'Remboursée');

  const totalSales = paidReceipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const ticketCount = paidReceipts.length;
  const avgTicket = ticketCount > 0 ? totalSales / ticketCount : 0;
  const totalDiscounts = filteredReceipts.reduce((sum, r) => sum + (Number(r.discountAmount) || 0), 0);
  const totalRefunds = refundedReceipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const byMethod = paidReceipts.reduce((acc: Record<string, { count: number; amount: number }>, r) => {
    const method = r.method || 'Autre';
    if (!acc[method]) acc[method] = { count: 0, amount: 0 };
    acc[method].count += 1;
    acc[method].amount += Number(r.amount) || 0;
    return acc;
  }, {} as Record<string, { count: number; amount: number }>);

  const cancelCount = filteredAudit.filter(a => a.action === 'order_cancelled').length;
  const discountAuditCount = filteredAudit.filter(a => a.action === 'discount_applied').length;

  const activityLabel = (action: string) => {
    if (action === 'discount_applied') return { label: 'Remise appliquée', icon: <Tag size={16} className="text-amber-600" />, color: 'text-amber-700 bg-amber-50 border-amber-100' };
    if (action === 'order_cancelled') return { label: 'Commande annulée', icon: <XCircle size={16} className="text-red-600" />, color: 'text-red-700 bg-red-50 border-red-100' };
    if (action === 'order_refunded') return { label: 'Ticket remboursé', icon: <RotateCcw size={16} className="text-purple-600" />, color: 'text-purple-700 bg-purple-50 border-purple-100' };
    return { label: action, icon: <Clock size={16} className="text-gray-500" />, color: 'text-gray-700 bg-gray-50 border-gray-100' };
  };

  return (
    <div className="p-6 md:p-8 bg-[#F4F4F5] min-h-full overflow-y-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A] tracking-tight">Rapports POS</h1>
          <p className="text-gray-500 mt-1">Ventes, moyens de paiement et activité caisse</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(RANGE_LABELS) as RangeKey[]).map(key => (
            <button
              key={key}
              type="button"
              onClick={() => setRange(key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border whitespace-nowrap ${
                range === key ? 'bg-[#265C6D] text-white border-[#265C6D]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {RANGE_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiTile icon={<Wallet size={20} />} label="Ventes nettes" value={`${totalSales.toFixed(2)} MAD`} sub={`${ticketCount} ticket(s)`} />
        <KpiTile icon={<BarChart2 size={20} />} label="Panier moyen" value={`${avgTicket.toFixed(2)} MAD`} />
        <KpiTile icon={<Tag size={20} />} label="Remises accordées" value={`${totalDiscounts.toFixed(2)} MAD`} sub={`${discountAuditCount} remise(s)`} />
        <KpiTile icon={<AlertTriangle size={20} />} label="Remboursements" value={`${totalRefunds.toFixed(2)} MAD`} sub={`${refundedReceipts.length} ticket(s) · ${cancelCount} annulation(s)`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-4">Par moyen de paiement</h3>
          {Object.keys(byMethod).length === 0 ? (
            <p className="text-sm text-gray-400">Aucune vente sur cette période.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(byMethod).map(([method, data]: [string, { count: number; amount: number }]) => (
                <div key={method} className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">{method}</div>
                    <div className="text-xs text-gray-400">{data.count} ticket(s)</div>
                  </div>
                  <div className="font-bold text-[#265C6D]">{data.amount.toFixed(2)} MAD</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <h3 className="font-bold text-gray-900 p-5 pb-3">Caisses (shifts)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs uppercase border-t border-gray-100">
                  <th className="px-5 py-2 font-semibold">Ouverture</th>
                  <th className="px-5 py-2 font-semibold">Statut</th>
                  <th className="px-5 py-2 font-semibold text-right">Ventes</th>
                  <th className="px-5 py-2 font-semibold text-right">Écart</th>
                </tr>
              </thead>
              <tbody>
                {filteredShifts.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-6 text-center text-gray-400">Aucune caisse sur cette période.</td></tr>
                )}
                {filteredShifts.map(shift => (
                  <tr key={shift.id} className="border-t border-gray-100">
                    <td className="px-5 py-3 text-gray-700">
                      {shift.openedAt ? new Date(shift.openedAt.seconds * 1000).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                      <div className="text-xs text-gray-400">{shift.openedBy}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${shift.status === 'Ouvert' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {shift.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-800">{Number(shift.totalSales || 0).toFixed(2)} MAD</td>
                    <td className="px-5 py-3 text-right">
                      {shift.status === 'Fermé' ? (
                        <span className={`font-semibold ${Number(shift.variance || 0) === 0 ? 'text-gray-500' : Number(shift.variance || 0) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {Number(shift.variance || 0) > 0 ? '+' : ''}{Number(shift.variance || 0).toFixed(2)} MAD
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Receipt size={18} /> Activité sensible (remises, annulations, remboursements)
        </h3>
        {filteredAudit.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune activité sur cette période.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredAudit.map(entry => {
              const meta = activityLabel(entry.action);
              return (
                <div key={entry.id} className={`flex items-start justify-between gap-3 border rounded-xl px-4 py-3 text-sm ${meta.color}`}>
                  <div className="flex items-start gap-2">
                    {meta.icon}
                    <div>
                      <div className="font-semibold">{meta.label} — {entry.orderId || entry.displayId || ''}</div>
                      {entry.reason && <div className="text-xs opacity-80 mt-0.5">{entry.reason}</div>}
                    </div>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    {entry.amount !== undefined && <div className="font-bold">{Number(entry.amount).toFixed(2)} MAD</div>}
                    <div className="text-xs opacity-60">
                      {entry.createdAt ? new Date(entry.createdAt.seconds * 1000).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
