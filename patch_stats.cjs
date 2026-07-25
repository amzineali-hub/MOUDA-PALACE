const fs = require('fs');

let content = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf-8');

content = content.replace(
  '<p className="text-2xl font-bold text-[#1A1A1A]">12</p>',
  '<p className="text-2xl font-bold text-[#1A1A1A]">{commandes.filter(c => c.status !== "Livrée" && c.status !== "Annulée").length}</p>'
);

content = content.replace(
  '<p className="text-2xl font-bold text-[#1A1A1A]">4</p>',
  '<p className="text-2xl font-bold text-[#1A1A1A]">{commandes.filter(c => c.status === "En attente").length}</p>'
);

content = content.replace(
  '<p className="text-2xl font-bold text-[#1A1A1A]">28</p>',
  '<p className="text-2xl font-bold text-[#1A1A1A]">{fournisseurs.length}</p>'
);

fs.writeFileSync('src/AchatsFournisseurs.tsx', content);
