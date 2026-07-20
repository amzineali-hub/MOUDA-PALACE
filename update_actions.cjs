const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const t1 = `  const [newPartnerEmail, setNewPartnerEmail] = useState('');
  const [newPartnerAccessCode, setNewPartnerAccessCode] = useState('');

  const [partners, setPartners] = useState(() => {`;

const r1 = `  const [newPartnerEmail, setNewPartnerEmail] = useState('');
  const [newPartnerAccessCode, setNewPartnerAccessCode] = useState('');
  const [isEditPartnerModalOpen, setIsEditPartnerModalOpen] = useState(false);

  const [partners, setPartners] = useState(() => {`;

const t2 = `  useEffect(() => {
    localStorage.setItem('mouda_partners', JSON.stringify(partners));
  }, [partners]);

  const getIconForType = (type: string) => {`;

const r2 = `  useEffect(() => {
    localStorage.setItem('mouda_partners', JSON.stringify(partners));
  }, [partners]);

  const handleDeletePartner = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce partenaire ?")) {
      setPartners(partners.filter((p: any) => p.id !== id));
      showToast("Partenaire supprimé avec succès");
    }
  };

  const handleDownloadPartner = (partner: any) => {
    const data = \`FICHE PARTENAIRE\\n-------------------\\nNom: \${partner.name}\\nID: \${partner.id}\\nType: \${partner.type}\\nCommission: \${partner.commission}%\\nStatut: \${partner.active ? 'Actif' : 'Inactif'}\\nCA Généré: \${partner.revenue}\\nClients apportés: \${partner.clients}\\n\`;
    const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = \`fiche_\${partner.name.replace(/\\s+/g, '_')}.txt\`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(\`Téléchargement de la fiche de \${partner.name}\`);
  };

  const openEditPartnerModal = (partner: any) => {
    setSelectedPartner(partner);
    setNewPartnerName(partner.name);
    setNewPartnerType(partner.type);
    setNewPartnerCommission(partner.commission);
    setNewPartnerEmail(partner.email || '');
    setNewPartnerAccessCode(partner.accessCode || '');
    setIsEditPartnerModalOpen(true);
  };

  const getIconForType = (type: string) => {`;

const t3 = `                          <button 
                            onClick={() => showToast && showToast(\`Téléchargement de la fiche de \${partner.name}...\`)}  
                            className="p-2 text-gray-400 hover:text-[#DDA956] transition-colors rounded-lg hover:bg-amber-50"
                            title="Télécharger Fiche Partenaire"
                          >
                            <Download size={18} />
                          </button>
                          <button 
                            onClick={() => showToast && showToast(\`Modification de \${partner.name} en cours de développement...\`)}  
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                            title="Modifier Partenaire"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => showToast && showToast(\`Suppression de \${partner.name}...\`)}  
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                            title="Supprimer Partenaire"
                          >
                            <Trash2 size={18} />
                          </button>`;

const r3 = `                          <button 
                            onClick={() => handleDownloadPartner(partner)}  
                            className="p-2 text-gray-400 hover:text-[#DDA956] transition-colors rounded-lg hover:bg-amber-50"
                            title="Télécharger Fiche Partenaire"
                          >
                            <Download size={18} />
                          </button>
                          <button 
                            onClick={() => openEditPartnerModal(partner)}  
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                            title="Modifier Partenaire"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeletePartner(partner.id)}  
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                            title="Supprimer Partenaire"
                          >
                            <Trash2 size={18} />
                          </button>`;

const t4 = `                  setNewPartnerAccessCode('');
                }}
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Ajouter et générer le QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

const r4 = `                  setNewPartnerAccessCode('');
                }}
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Ajouter et générer le QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Partner Modal */}
      {isEditPartnerModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Modifier Partenaire</h3>
              <button onClick={() => setIsEditPartnerModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'établissement / agence</label>
                <input 
                  type="text" 
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" 
                  placeholder="Ex: Riad Dar Salam" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de partenaire</label>
                  <select 
                    value={newPartnerType} 
                    onChange={(e) => setNewPartnerType(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]"
                  >
                    <option value="Riad">Riad</option>
                    <option value="Hôtel">Hôtel</option>
                    <option value="Agence">Agence</option>
                    <option value="Location Auto">Location Auto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commission (%)</label>
                  <input 
                    type="number" 
                    value={newPartnerCommission}
                    onChange={(e) => setNewPartnerCommission(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" 
                    placeholder="5" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
                  <input 
                    type="email" 
                    value={newPartnerEmail}
                    onChange={(e) => setNewPartnerEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" 
                    placeholder="contact@riad.com" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code d'accès (Secret)</label>
                  <input 
                    type="text" 
                    value={newPartnerAccessCode}
                    onChange={(e) => setNewPartnerAccessCode(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" 
                    placeholder="Ex: RIAD2026" 
                  />
                </div>
              </div>
              <button 
                onClick={() => {
                  if (!newPartnerAccessCode) {
                    showToast("Veuillez définir un code d'accès pour ce partenaire.", "error");
                    return;
                  }
                  
                  const updatedPartner = {
                    ...selectedPartner,
                    name: newPartnerName,
                    type: newPartnerType,
                    commission: newPartnerCommission,
                    accessCode: newPartnerAccessCode,
                    email: newPartnerEmail
                  };
                  
                  setPartners(partners.map((p) => p.id === selectedPartner.id ? updatedPartner : p));
                  showToast("Partenaire modifié avec succès.");
                  setIsEditPartnerModalOpen(false);
                  
                  setNewPartnerName('');
                  setNewPartnerType('Riad');
                  setNewPartnerCommission(5);
                  setNewPartnerEmail('');
                  setNewPartnerAccessCode('');
                }}
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Sauvegarder les modifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

content = content.replace(t1, r1);
content = content.replace(t2, r2);
content = content.replace(t3, r3);
content = content.replace(t4, r4);

fs.writeFileSync('src/App.tsx', content);

console.log('Replaced 1:', content.includes('setIsEditPartnerModalOpen(false)'));
console.log('Replaced 2:', content.includes('handleDownloadPartner(partner)'));

