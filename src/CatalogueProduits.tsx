import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Search, Truck, AlertTriangle, CheckCircle2, Package, Layers, Eye, Pencil, Trash2, X } from 'lucide-react';
import { useToast } from './context/ToastContext';
import ConfirmModal from './components/ConfirmModal';
import Combobox from './components/Combobox';

const UNITES = ['kg', 'g', 'L', 'cl', 'ml', 'pièce', 'boîte', 'bouteille', 'sachet', 'carton', 'botte', 'cannette', 'bidon', 'plateau'];

const isDelivered = (c: any) => {
  const st = c.status || c.statut;
  return st === 'Livrée' || st === 'Validée';
};

const normalize = (s: any) => (s || '').toString().trim().toLowerCase();

export default function CatalogueProduits() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [commandes, setCommandes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'traceable' | 'noSupplier' | 'noOrder'>('all');
  const [viewedProduct, setViewedProduct] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productToDelete, setProductToDelete] = useState<any>(null);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, 'inventoryItems'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    const unsubFournisseurs = onSnapshot(collection(db, 'fournisseurs'), (snapshot) => {
      setFournisseurs(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    const unsubCommandes = onSnapshot(collection(db, 'commandes'), (snapshot) => {
      setCommandes(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => { unsubProducts(); unsubFournisseurs(); unsubCommandes(); };
  }, []);

  const productsWithOrigin = useMemo(() => {
    const deliveredCommandes = commandes.filter(isDelivered);

    return products.map(p => {
      const matches = deliveredCommandes
        .flatMap((c: any) => (c.items || [])
          .filter((it: any) => it.inventoryItemId === p.id || normalize(it.name) === normalize(p.name))
          .map((it: any) => ({
            ...it,
            orderId: c.id,
            orderDate: c.date,
            orderCreatedAt: c.createdAt,
            orderFournisseur: c.fournisseur,
            paidPrice: it.actualPrice ?? it.expectedPrice ?? null
          })))
        .sort((a: any, b: any) => (b.orderCreatedAt?.toMillis?.() || 0) - (a.orderCreatedAt?.toMillis?.() || 0));

      const lastOrder = matches[0] || null;
      const originSupplier = (p.supplier && p.supplier !== 'Non renseigné') ? p.supplier : (lastOrder?.orderFournisseur || null);
      const supplierRecord = fournisseurs.find((f: any) => normalize(f.nom) === normalize(originSupplier));

      return {
        ...p,
        originSupplier,
        supplierRecord,
        lastOrder,
        hasSupplier: !!originSupplier,
        hasLinkedOrder: !!lastOrder
      };
    });
  }, [products, commandes, fournisseurs]);

  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(set).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return productsWithOrigin
      .filter(p => selectedCategory === 'Tous' ? true : p.category === selectedCategory)
      .filter(p => showMissingOnly ? (!p.hasSupplier || !p.hasLinkedOrder) : true)
      .filter(p => {
        if (statusFilter === 'traceable') return p.hasSupplier && p.hasLinkedOrder;
        if (statusFilter === 'noSupplier') return !p.hasSupplier;
        if (statusFilter === 'noOrder') return !p.hasLinkedOrder;
        return true;
      })
      .filter(p => {
        const q = searchQuery.toLowerCase();
        if (!q) return true;
        return normalize(p.name).includes(q) || normalize(p.originSupplier).includes(q) || normalize(p.category).includes(q);
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [productsWithOrigin, selectedCategory, showMissingOnly, statusFilter, searchQuery]);

  const missingSupplierCount = productsWithOrigin.filter(p => !p.hasSupplier).length;
  const missingOrderCount = productsWithOrigin.filter(p => !p.hasLinkedOrder).length;
  const fullyTraceableCount = productsWithOrigin.filter(p => p.hasSupplier && p.hasLinkedOrder).length;

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await deleteDoc(doc(db, 'inventoryItems', productToDelete.id));
      showToast('Produit supprimé avec succès');
    } catch (err) {
      console.error('Error deleting product', err);
      showToast('Erreur lors de la suppression', 'error');
    }
    setProductToDelete(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-serif text-[#1A1A1A] mb-2">Liste des Produits</h2>
          <p className="text-gray-500">Traçabilité de chaque produit vers son fournisseur et sa commande d'origine.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <button
          onClick={() => setStatusFilter('all')}
          className={`bg-white rounded-2xl p-6 border shadow-sm flex items-center gap-4 text-left transition-all hover:shadow-md ${statusFilter === 'all' ? 'border-gray-400 ring-2 ring-gray-200' : 'border-gray-100'}`}
        >
          <div className="p-4 bg-gray-50 text-gray-600 rounded-xl">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Produits</p>
            <h4 className="text-2xl font-bold text-gray-900 mt-1">{productsWithOrigin.length}</h4>
          </div>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'traceable' ? 'all' : 'traceable')}
          className={`bg-white rounded-2xl p-6 border shadow-sm flex items-center gap-4 text-left transition-all hover:shadow-md ${statusFilter === 'traceable' ? 'border-green-400 ring-2 ring-green-200' : 'border-gray-100'}`}
        >
          <div className="p-4 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Traçabilité Complète</p>
            <h4 className="text-2xl font-bold text-green-600 mt-1">{fullyTraceableCount}</h4>
          </div>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'noSupplier' ? 'all' : 'noSupplier')}
          className={`bg-white rounded-2xl p-6 border shadow-sm flex items-center gap-4 text-left transition-all hover:shadow-md ${statusFilter === 'noSupplier' ? 'border-red-400 ring-2 ring-red-200' : 'border-gray-100'}`}
        >
          <div className="p-4 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Sans Fournisseur</p>
            <h4 className="text-2xl font-bold text-red-600 mt-1">{missingSupplierCount}</h4>
          </div>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'noOrder' ? 'all' : 'noOrder')}
          className={`bg-white rounded-2xl p-6 border shadow-sm flex items-center gap-4 text-left transition-all hover:shadow-md ${statusFilter === 'noOrder' ? 'border-orange-400 ring-2 ring-orange-200' : 'border-gray-100'}`}
        >
          <div className="p-4 bg-orange-50 text-orange-600 rounded-xl">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Sans Commande Liée</p>
            <h4 className="text-2xl font-bold text-orange-600 mt-1">{missingOrderCount}</h4>
          </div>
        </button>
      </motion.div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher un produit, fournisseur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]"
              />
            </div>
            <div className="w-full sm:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]"
              >
                <option value="Tous">Toutes les catégories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowMissingOnly(!showMissingOnly)}
              className={`px-4 py-2 border rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${showMissingOnly ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              <AlertTriangle size={16} />
              <span>Origine manquante</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-6 py-3 font-medium">Produit</th>
                <th className="px-6 py-3 font-medium">Catégorie</th>
                <th className="px-6 py-3 font-medium">Stock</th>
                <th className="px-6 py-3 font-medium">Fournisseur d'Origine</th>
                <th className="px-6 py-3 font-medium">Dernière Commande</th>
                <th className="px-6 py-3 font-medium">Prix Payé</th>
                <th className="px-6 py-3 font-medium">Statut</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                  <td className="px-6 py-4 text-gray-500 flex items-center gap-2">
                    <Layers size={14} className="text-gray-400" />
                    {p.category || '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{p.quantity ?? 0} {p.unit || ''}</td>
                  <td className="px-6 py-4 text-gray-700">{p.originSupplier || <span className="text-red-500">Non renseigné</span>}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {p.lastOrder ? (
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-md">#{p.lastOrder.orderId.substring(0, 8)} · {p.lastOrder.orderDate || ''}</span>
                    ) : (
                      <span className="text-gray-400">Aucune</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {p.lastOrder?.paidPrice ? `${Number(p.lastOrder.paidPrice).toFixed(2)} MAD` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {p.hasSupplier && p.hasLinkedOrder ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200 w-fit">
                        <CheckCircle2 size={12} /> Traçable
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200 w-fit">
                        <AlertTriangle size={12} /> {!p.hasSupplier ? 'Fournisseur manquant' : 'Commande non liée'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewedProduct(p)} className="p-1.5 text-gray-400 hover:text-[#F4C75B] transition-colors rounded-lg hover:bg-gray-100" title="Visionner">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => setEditingProduct(p)} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-gray-100" title="Éditer">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setProductToDelete(p)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100" title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-400">Aucun produit ne correspond à ces filtres.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Product Modal */}
      {viewedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold text-gray-900">{viewedProduct.name}</h3>
              <button onClick={() => setViewedProduct(null)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Catégorie</span>
                <span className="font-medium text-gray-900">{viewedProduct.category || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Stock</span>
                <span className="font-medium text-gray-900">{viewedProduct.quantity ?? 0} {viewedProduct.unit || ''}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Fournisseur d'origine</span>
                <span className="font-medium text-gray-900">{viewedProduct.originSupplier || 'Non renseigné'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Dernière commande</span>
                <span className="font-medium text-gray-900">
                  {viewedProduct.lastOrder ? `#${viewedProduct.lastOrder.orderId.substring(0, 8)} · ${viewedProduct.lastOrder.orderDate || ''}` : 'Aucune'}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Prix payé (dernière commande)</span>
                <span className="font-medium text-gray-900">{viewedProduct.lastOrder?.paidPrice ? `${Number(viewedProduct.lastOrder.paidPrice).toFixed(2)} MAD` : '—'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Prix au stock</span>
                <span className="font-medium text-gray-900">{(viewedProduct.averageCost || viewedProduct.price || viewedProduct.cost) ? `${Number(viewedProduct.averageCost || viewedProduct.price || viewedProduct.cost).toFixed(2)} MAD` : '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Statut</span>
                {viewedProduct.hasSupplier && viewedProduct.hasLinkedOrder ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200 w-fit">
                    <CheckCircle2 size={12} /> Traçable
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200 w-fit">
                    <AlertTriangle size={12} /> {!viewedProduct.hasSupplier ? 'Fournisseur manquant' : 'Commande non liée'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold text-gray-900">Éditer le Produit</h3>
              <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const updatedProduct = {
                name: formData.get('name'),
                category: formData.get('category'),
                quantity: Number(formData.get('quantity')),
                unit: formData.get('unit'),
                supplier: formData.get('supplier'),
                averageCost: Number(formData.get('price')) || 0
              };
              try {
                await updateDoc(doc(db, 'inventoryItems', editingProduct.id), updatedProduct);
                showToast('Produit mis à jour avec succès');
                setEditingProduct(null);
              } catch (err) {
                console.error('Error updating product', err);
                showToast('Erreur lors de la mise à jour', 'error');
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
                <input name="name" required type="text" defaultValue={editingProduct.name} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <Combobox name="category" options={categories} defaultValue={editingProduct.category} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                  <select name="unit" defaultValue={editingProduct.unit} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]">
                    {UNITES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité en stock</label>
                  <input name="quantity" required type="number" step="0.01" min="0" defaultValue={editingProduct.quantity ?? 0} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix au stock (MAD)</label>
                  <input name="price" type="number" step="0.01" min="0" defaultValue={editingProduct.averageCost || editingProduct.price || editingProduct.cost || ''} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur préféré</label>
                <Combobox name="supplier" options={fournisseurs.map((f: any) => f.nom || f.name)} defaultValue={editingProduct.supplier || editingProduct.originSupplier || ''} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
              </div>
              <button
                type="submit"
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Enregistrer les modifications
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!productToDelete}
        title="Supprimer le produit"
        message={productToDelete ? `Voulez-vous vraiment supprimer "${productToDelete.name}" du catalogue ?` : ''}
        onConfirm={confirmDeleteProduct}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}
