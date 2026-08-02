const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Add ref for file input
const refTarget = `  const [activeTab, setActiveTab] = useState('stocks');`;
const refReplacement = `  const [activeTab, setActiveTab] = useState('stocks');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\\n');
      
      let importedCount = 0;
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Split by semicolon or comma
        const separator = line.includes(';') ? ';' : ',';
        const cols = line.split(separator);
        
        if (cols.length >= 3) {
          try {
            const name = cols[0]?.trim();
            const category = cols[1]?.trim() || 'Épicerie';
            const supplier = cols[2]?.trim() || 'Non renseigné';
            const quantity = Number(cols[3]?.trim()) || 0;
            const unit = cols[4]?.trim() || 'kg';
            const minStock = Number(cols[5]?.trim()) || 5;
            const expirationDate = cols[6]?.trim() || null;

            if (name) {
              await addDoc(collection(db, 'inventoryItems'), {
                name,
                category,
                supplier,
                quantity,
                unit,
                minStock,
                expirationDate,
                createdAt: serverTimestamp()
              });
              importedCount++;
            }
          } catch (err) {
            console.error('Import error row', i, err);
            errorCount++;
          }
        }
      }
      
      showToast(\`Import terminé : \${importedCount} produits ajoutés. (\${errorCount} erreurs)\`, importedCount > 0 ? 'success' : 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };
`;

if (code.includes(refTarget) && !code.includes('handleImportCSV')) {
  code = code.replace(refTarget, refReplacement);
}

// Add the button
const btnTarget = `<button 
            onClick={() => setIsAddModalOpen(true)}`;
const btnReplacement = `<input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleImportCSV} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
            title="Format CSV: Nom;Catégorie;Fournisseur;Quantité;Unité;Seuil;Expiration"
          >
            <Download size={16} className="rotate-180" />
            Importer CSV
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}`;

if (code.includes(btnTarget) && !code.includes('Importer CSV')) {
  code = code.replace(btnTarget, btnReplacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log('App.tsx patched with CSV import');
} else {
  console.log('Could not patch or already patched');
}
