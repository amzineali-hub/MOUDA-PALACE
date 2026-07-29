const fs = require('fs');
let content = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

const target = `            <p className="text-sm text-gray-500 mb-6">Fournisseur : <span className="font-medium text-gray-900">{selectedCommande.fournisseur}</span> • Date : {selectedCommande.date}</p>`;

const replacement = `            <p className="text-sm text-gray-500 mb-2">Fournisseur : <span className="font-medium text-gray-900">{selectedCommande.fournisseur}</span> • Date : {selectedCommande.date}</p>
            {(selectedCommande.categorie || selectedCommande.quantite) && (
              <p className="text-sm text-gray-500 mb-6">
                {selectedCommande.categorie && <>Catégorie : <span className="font-medium text-gray-900">{selectedCommande.categorie}</span></>}
                {selectedCommande.categorie && selectedCommande.quantite && ' • '}
                {selectedCommande.quantite && <>Quantité totale : <span className="font-medium text-gray-900">{selectedCommande.quantite}</span></>}
              </p>
            )}`;

content = content.replace(target, replacement);

fs.writeFileSync('src/AchatsFournisseurs.tsx', content);
