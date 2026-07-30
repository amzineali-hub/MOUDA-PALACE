const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldState = `  const [isNewSupplierModalOpen, setIsNewSupplierModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);`;

const newState = `  const [isNewSupplierModalOpen, setIsNewSupplierModalOpen] = useState(false);
  const [isEditSupplierModalOpen, setIsEditSupplierModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'fournisseurs'), (snapshot) => {
      setFournisseurs(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsub();
  }, []);`;
code = code.replace(oldState, newState);

const hardcodedArray = `                        {[
                          { name: "Coopérative Taliouine", category: "Épices & Condiments", contact: "Fatima Zahra", phone: "+212 661 234 567", email: "contact@taliouine-safran.ma", city: "Taliouine" },
                          { name: "Ferme Atlas", category: "Légumes & Huiles", contact: "Karim Benali", phone: "+212 662 345 678", email: "commandes@ferme-atlas.ma", city: "Marrakech" },
                          { name: "Boucherie Médina", category: "Viandes", contact: "Hassan", phone: "+212 663 456 789", email: "hassan.boucher@gmail.com", city: "Marrakech" },
                          { name: "Grossiste Fès", category: "Fruits Secs", contact: "Omar", phone: "+212 664 567 890", email: "grossiste.fes@menara.ma", city: "Fès" }
                        ].map((supplier, idx) => (`;

const mappedArray = `                        {fournisseurs.length > 0 ? fournisseurs.map((supplier, idx) => (`

code = code.replace(hardcodedArray, mappedArray);

const oldModifierBtn = `                          <button onClick={() => showToast && showToast("Fonctionnalité à venir...")} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">Modifier</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>`;

const newModifierBtn = `                          <button onClick={() => { setSelectedSupplier(supplier); setIsEditSupplierModalOpen(true); }} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">Modifier</button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                              Aucun fournisseur enregistré.
                            </td>
                          </tr>
                        )}
                      </tbody>`;

code = code.replace(oldModifierBtn, newModifierBtn);

fs.writeFileSync('src/App.tsx', code);
