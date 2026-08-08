const fs = require('fs');
let code = fs.readFileSync('src/TracabiliteHACCP.tsx', 'utf8');

const importSearch = `import { QrCode, Printer, Thermometer, ShieldCheck, AlertTriangle, PackageOpen, Plus, Search, Calendar, ChefHat, CheckCircle2, Clock, X } from 'lucide-react';`;
const importReplace = `import { QrCode, Printer, Thermometer, ShieldCheck, AlertTriangle, PackageOpen, Plus, Search, Calendar, ChefHat, CheckCircle2, Clock, X, Trash2, CheckSquare } from 'lucide-react';`;
code = code.replace(importSearch, importReplace);

const renderSearch = `                            onClick={() => setLabelData({ ...lot, creationDate: lot.createdAt?.toDate ? lot.createdAt.toDate().toISOString() : new Date().toISOString() })}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-flex"
                            title="Imprimer l'étiquette"
                          >
                            <Printer size={18} />
                          </button>
                        </td>`;

const renderReplace = `                            onClick={() => setLabelData({ ...lot, creationDate: lot.createdAt?.toDate ? lot.createdAt.toDate().toISOString() : new Date().toISOString() })}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-flex"
                            title="Imprimer l'étiquette"
                          >
                            <Printer size={18} />
                          </button>
                          
                          {lot.status !== 'Consommé' && lot.status !== 'Jeté' && (
                            <>
                              <button 
                                onClick={async () => {
                                  if(confirm('Marquer ce lot comme consommé ?')) {
                                    try {
                                      await updateDoc(doc(db, 'haccpLots', lot.id), { status: 'Consommé' });
                                      showToast('Lot marqué comme consommé', 'success');
                                    } catch(e) {}
                                  }
                                }}
                                className="p-2 ml-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors inline-flex"
                                title="Marquer comme consommé"
                              >
                                <CheckSquare size={18} />
                              </button>
                              <button 
                                onClick={async () => {
                                  if(confirm('Marquer ce lot comme jeté (perte) ?')) {
                                    try {
                                      await updateDoc(doc(db, 'haccpLots', lot.id), { status: 'Jeté' });
                                      showToast('Lot marqué comme jeté', 'success');
                                      // Log waste
                                      await addDoc(collection(db, 'wasteRecords'), {
                                        item: lot.itemName,
                                        quantity: lot.quantity,
                                        unit: 'portion', // approx
                                        reason: 'DLC dépassée / Avarié (HACCP)',
                                        user: lot.operator,
                                        date: new Date().toLocaleDateString('fr-FR'),
                                        createdAt: serverTimestamp()
                                      });
                                    } catch(e) {}
                                  }
                                }}
                                className="p-2 ml-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                                title="Marquer comme jeté (perte)"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </td>`;

code = code.replace(renderSearch, renderReplace);

// We should also display the status in the UI, let's put it in the Lot Number column
const lotSearch = `<div className="font-bold text-gray-900">{lot.lotNumber}</div>`;
const lotReplace = `<div className="font-bold text-gray-900 flex items-center gap-2">
  {lot.lotNumber}
  {lot.status === 'Consommé' && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Consommé</span>}
  {lot.status === 'Jeté' && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Jeté</span>}
</div>`;

code = code.replace(lotSearch, lotReplace);

fs.writeFileSync('src/TracabiliteHACCP.tsx', code);
