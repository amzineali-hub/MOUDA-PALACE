const fs = require('fs');
let content = fs.readFileSync('src/ProductionJournaliere.tsx', 'utf-8');

// Add Trash2 to lucide-react imports if not there
if(!content.includes('Trash2')) {
  content = content.replace("import { ChefHat, ArrowRight, CheckCircle, Package, Search, Plus, X } from 'lucide-react';", 
    "import { ChefHat, ArrowRight, CheckCircle, Package, Search, Plus, X, Trash2 } from 'lucide-react';");
}

// Add delete function
const insertAfterHooksTarget = `  const handleCreateOrder = async (e: React.FormEvent) => {`;
const insertAfterHooksReplacement = `  const handleDeleteOrder = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet ordre de production (l\\'historique sera effacé mais le stock restera inchangé) ?')) {
      try {
        await deleteDoc(doc(db, 'productionOrders', id));
        showToast("Ordre de production supprimé avec succès");
      } catch (error) {
        console.error("Erreur lors de la suppression de l'ordre", error);
        showToast("Erreur lors de la suppression", "error");
      }
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {`;
content = content.replace(insertAfterHooksTarget, insertAfterHooksReplacement);

// Add deleteDoc to firebase imports
if(!content.includes('deleteDoc')) {
  content = content.replace("import { collection, query, onSnapshot, orderBy, doc, runTransaction, serverTimestamp } from 'firebase/firestore';", 
    "import { collection, query, onSnapshot, orderBy, doc, runTransaction, serverTimestamp, deleteDoc } from 'firebase/firestore';");
}

// Add Actions header
const headerTarget = `<th className="px-6 py-4 font-medium text-center">Statut</th>
              </tr>`;
const headerReplacement = `<th className="px-6 py-4 font-medium text-center">Statut</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>`;
content = content.replace(headerTarget, headerReplacement);

// Add colSpan 7 instead of 6
content = content.replace('colSpan={6}', 'colSpan={7}');

// Add Action cell
const cellTarget = `                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={14} /> Produit
                      </span>
                    </td>
                  </tr>`;
const cellReplacement = `                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={14} /> Produit
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>`;
content = content.replace(cellTarget, cellReplacement);

fs.writeFileSync('src/ProductionJournaliere.tsx', content);
console.log("Patched ProductionJournaliere.tsx with Actions");
