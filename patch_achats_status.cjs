const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

// 1. Add updateDoc to imports
code = code.replace(
  "import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, deleteDoc, doc } from 'firebase/firestore';",
  "import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';"
);

// 2. Add an updateStatus function
const updateStatusFn = `  const updateOrderStatus = async (cmdId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'commandes', cmdId), {
        status: newStatus
      });
      showToast(\`Statut mis à jour : \${newStatus}\`);
    } catch (error) {
      console.error("Error updating status:", error);
      showToast("Erreur lors de la mise à jour du statut");
    }
  };

  const getStatusColor =`;
code = code.replace("  const getStatusColor =", updateStatusFn);

// 3. Replace the status span with a select
const oldStatusCell = `<td className="px-6 py-4 text-center">
                      <span className={\`px-3 py-1 rounded-full text-xs font-medium border \${getStatusColor(cmd.status)}\`}>
                        {cmd.status}
                      </span>
                    </td>`;

const newStatusCell = `<td className="px-6 py-4 text-center">
                      <div className="relative inline-block w-32">
                        <select
                          value={cmd.status}
                          onChange={(e) => updateOrderStatus(cmd.id, e.target.value)}
                          className={\`appearance-none w-full px-3 py-1 rounded-full text-xs font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 \${getStatusColor(cmd.status)}\`}
                        >
                          <option value="En attente" className="bg-white text-gray-900">En attente</option>
                          <option value="Validée" className="bg-white text-gray-900">Validée</option>
                          <option value="Livrée" className="bg-white text-gray-900">Livrée</option>
                          <option value="Annulée" className="bg-white text-gray-900">Annulée</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                          <svg className={\`h-3 w-3 \${getStatusColor(cmd.status).includes('text') ? getStatusColor(cmd.status).split(' ').find(c => c.startsWith('text-')) : 'text-gray-500'}\`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </td>`;
code = code.replace(oldStatusCell, newStatusCell);

// 4. Also add "Validée" to getStatusColor if not there
const oldGetStatusColor = `    switch (status) {
      case 'Livrée': return 'bg-green-100 text-green-700 border-green-200';`;
const newGetStatusColor = `    switch (status) {
      case 'Livrée': return 'bg-green-100 text-green-700 border-green-200';
      case 'Validée': return 'bg-blue-100 text-blue-700 border-blue-200';`;
code = code.replace(oldGetStatusColor, newGetStatusColor);

fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
