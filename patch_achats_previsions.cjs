const fs = require('fs');
let content = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf-8');

const target1 = `<button className="text-sm bg-[#F4C75B]/10 text-[#F4C75B] hover:bg-[#F4C75B]/20 px-4 py-2 rounded-lg font-medium transition-colors">
                      Créer des bons de commande
                    </button>`;
const replacement1 = `<button onClick={() => { setOrderSelections({}); setIsNewOrderModalOpen(true); }} className="text-sm bg-[#F4C75B]/10 text-[#F4C75B] hover:bg-[#F4C75B]/20 px-4 py-2 rounded-lg font-medium transition-colors">
                      Créer des bons de commande
                    </button>`;

const target2 = `<button className="p-2 text-gray-400 hover:text-[#F4C75B] transition-colors bg-white border border-gray-100 shadow-sm rounded-lg hover:border-[#F4C75B]/30">
                                  <ShoppingCart size={18} />
                                </button>`;
const replacement2 = `<button onClick={() => showToast("Article ajouté à la commande")} className="p-2 text-gray-400 hover:text-[#F4C75B] transition-colors bg-white border border-gray-100 shadow-sm rounded-lg hover:border-[#F4C75B]/30">
                                  <ShoppingCart size={18} />
                                </button>`;

if(content.includes(target1)) {
  content = content.replace(target1, replacement1);
}
if(content.includes(target2)) {
  content = content.replace(new RegExp(target2.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'), 'g'), replacement2);
}

fs.writeFileSync('src/AchatsFournisseurs.tsx', content);
console.log("Patched AchatsFournisseurs.tsx with Previsions callbacks");
