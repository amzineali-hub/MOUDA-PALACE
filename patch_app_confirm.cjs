const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// We need to add the import
if (!code.includes('import ConfirmModal')) {
  code = code.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';\nimport ConfirmModal from './components/ConfirmModal';");
}

// In Partners
const partnerHook = `  const [activePartnerTab, setActivePartnerTab] = useState('livraison');`;
const partnerHookRep = `  const [activePartnerTab, setActivePartnerTab] = useState('livraison');
  const [partnerToDelete, setPartnerToDelete] = useState<string | null>(null);`;
code = code.replace(partnerHook, partnerHookRep);

const partnerConfirm = `  const handleDeletePartner = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce partenaire ?")) {
      setPartners(partners.filter((p: any) => p.id !== id));
      showToast("Partenaire supprimé avec succès");
    }
  };`;
const partnerConfirmRep = `  const handleDeletePartner = (id: string) => {
    setPartnerToDelete(id);
  };
  const confirmDeletePartner = () => {
    if (partnerToDelete) {
      setPartners(partners.filter((p: any) => p.id !== partnerToDelete));
      showToast("Partenaire supprimé avec succès");
      setPartnerToDelete(null);
    }
  };`;
code = code.replace(partnerConfirm, partnerConfirmRep);

const partnerRender = `        </div>
      </div>
    </div>
  );
}

function MenuDigital() {`;
const partnerRenderRep = `        </div>
      </div>
      <ConfirmModal 
        isOpen={!!partnerToDelete}
        title="Supprimer le partenaire"
        message="Êtes-vous sûr de vouloir supprimer ce partenaire ?"
        onConfirm={confirmDeletePartner}
        onCancel={() => setPartnerToDelete(null)}
      />
    </div>
  );
}

function MenuDigital() {`;
code = code.replace(partnerRender, partnerRenderRep);

// In MenuDigital
const menuHook = `  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);`;
const menuHookRep = `  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [dishToDelete, setDishToDelete] = useState<number | null>(null);`;
code = code.replace(menuHook, menuHookRep);

const menuConfirm = `  const handleDeleteDish = (id: number) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce plat ?")) {
      setMenuItems(items => items.filter(item => item.id !== id));
      showToast("Plat supprimé avec succès");
    }
  };`;
const menuConfirmRep = `  const handleDeleteDish = (id: number) => {
    setDishToDelete(id);
  };
  const confirmDeleteDish = () => {
    if (dishToDelete !== null) {
      setMenuItems(items => items.filter(item => item.id !== dishToDelete));
      showToast("Plat supprimé avec succès");
      setDishToDelete(null);
    }
  };`;
code = code.replace(menuConfirm, menuConfirmRep);

const menuRender = `        </div>
      )}
    </div>
  );
}

function CommandesTableau() {`;
const menuRenderRep = `        </div>
      )}
      <ConfirmModal 
        isOpen={!!dishToDelete}
        title="Supprimer le plat"
        message="Voulez-vous vraiment supprimer ce plat ?"
        onConfirm={confirmDeleteDish}
        onCancel={() => setDishToDelete(null)}
      />
    </div>
  );
}

function CommandesTableau() {`;
code = code.replace(menuRender, menuRenderRep);

// In CommandesTableau (tasks)
const taskHook = `  const [wasteRecords, setWasteRecords] = useState<any[]>([]);`;
const taskHookRep = `  const [wasteRecords, setWasteRecords] = useState<any[]>([]);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [wasteToDelete, setWasteToDelete] = useState<string | null>(null);`;
code = code.replace(taskHook, taskHookRep);

const taskConfirm = `                            <button onClick={async () => {
                              if (window.confirm('Voulez-vous vraiment supprimer cette tâche ?')) {
                                try {
                                  if (task.id) await deleteDoc(doc(db, 'productionTasks', task.id));
                                } catch (e) {
                                  console.error(e);
                                }
                              }
                            }} className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50" title="Supprimer">`;
const taskConfirmRep = `                            <button onClick={() => setTaskToDelete(task.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50" title="Supprimer">`;
code = code.replace(taskConfirm, taskConfirmRep);

const wasteConfirm = `                        <button onClick={async () => {
                          if (window.confirm('Voulez-vous vraiment supprimer cette déclaration ?')) {
                            try {
                              await deleteDoc(doc(db, 'wasteRecords', waste.id));
                            } catch (e) {
                              console.error(e);
                            }
                          }
                        }} className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50" title="Supprimer">`;
const wasteConfirmRep = `                        <button onClick={() => setWasteToDelete(waste.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50" title="Supprimer">`;
code = code.replace(wasteConfirm, wasteConfirmRep);

const taskRender = `        </div>
      )}
    </div>
  );
}

function Configuration() {`;
const taskRenderRep = `        </div>
      )}
      <ConfirmModal 
        isOpen={!!taskToDelete}
        title="Supprimer la tâche"
        message="Voulez-vous vraiment supprimer cette tâche ?"
        onConfirm={async () => {
          if (taskToDelete) {
            try {
              await deleteDoc(doc(db, 'productionTasks', taskToDelete));
              setTaskToDelete(null);
            } catch (e) { console.error(e); }
          }
        }}
        onCancel={() => setTaskToDelete(null)}
      />
      <ConfirmModal 
        isOpen={!!wasteToDelete}
        title="Supprimer la déclaration"
        message="Voulez-vous vraiment supprimer cette déclaration ?"
        onConfirm={async () => {
          if (wasteToDelete) {
            try {
              await deleteDoc(doc(db, 'wasteRecords', wasteToDelete));
              setWasteToDelete(null);
            } catch (e) { console.error(e); }
          }
        }}
        onCancel={() => setWasteToDelete(null)}
      />
    </div>
  );
}

function Configuration() {`;
code = code.replace(taskRender, taskRenderRep);

// In Configuration
const supplierHook = `  const [newSupplier, setNewSupplier] = useState<any>({ name: '', phone: '', address: '', category: 'Alimentaire' });`;
const supplierHookRep = `  const [newSupplier, setNewSupplier] = useState<any>({ name: '', phone: '', address: '', category: 'Alimentaire' });
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);`;
code = code.replace(supplierHook, supplierHookRep);

const supplierConfirm = `                <button 
                  type="button"
                  onClick={async () => {
                    if (window.confirm("Voulez-vous vraiment supprimer ce fournisseur ?")) {
                      try {
                        setIsEditSupplierModalOpen(false);
                        if (selectedSupplier.id) {
                          await deleteDoc(doc(db, 'fournisseurs', selectedSupplier.id));
                          showToast("Fournisseur supprimé");
                        }
                      } catch (e) {
                        console.error(e);
                        showToast("Erreur lors de la suppression", "error");
                      }
                    }
                  }}
                  className="px-6 py-2.5 text-red-600 bg-red-50 font-medium hover:bg-red-100 rounded-xl transition-colors"
                >
                  Supprimer
                </button>`;
const supplierConfirmRep = `                <button 
                  type="button"
                  onClick={() => {
                    setIsEditSupplierModalOpen(false);
                    setSupplierToDelete(selectedSupplier.id);
                  }}
                  className="px-6 py-2.5 text-red-600 bg-red-50 font-medium hover:bg-red-100 rounded-xl transition-colors"
                >
                  Supprimer
                </button>`;
code = code.replace(supplierConfirm, supplierConfirmRep);

const supplierRender = `      )}
    </div>
  );
}`;
const supplierRenderRep = `      )}
      <ConfirmModal 
        isOpen={!!supplierToDelete}
        title="Supprimer le fournisseur"
        message="Voulez-vous vraiment supprimer ce fournisseur ?"
        onConfirm={async () => {
          if (supplierToDelete) {
            try {
              await deleteDoc(doc(db, 'fournisseurs', supplierToDelete));
              showToast("Fournisseur supprimé");
              setSupplierToDelete(null);
            } catch (e) {
              console.error(e);
              showToast("Erreur", "error");
            }
          }
        }}
        onCancel={() => setSupplierToDelete(null)}
      />
    </div>
  );
}`;
// Careful here, this will match the last occurrence. We only want to match the end of Configuration if possible, but the string is common. Let's make it more specific.
// We can use a regex or specific replacement. Let's do regex for the end of the file.
code = code.replace(/      \)}\n    <\/div>\n  \);\n}\n$/g, `      )}\n      <ConfirmModal \n        isOpen={!!supplierToDelete}\n        title="Supprimer le fournisseur"\n        message="Voulez-vous vraiment supprimer ce fournisseur ?"\n        onConfirm={async () => {\n          if (supplierToDelete) {\n            try {\n              await deleteDoc(doc(db, 'fournisseurs', supplierToDelete));\n              showToast("Fournisseur supprimé");\n              setSupplierToDelete(null);\n            } catch (e) {\n              console.error(e);\n              showToast("Erreur", "error");\n            }\n          }\n        }}\n        onCancel={() => setSupplierToDelete(null)}\n      />\n    </div>\n  );\n}\n`);

fs.writeFileSync('src/App.tsx', code);
