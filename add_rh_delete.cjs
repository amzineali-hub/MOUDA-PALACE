const fs = require('fs');
let rhCode = fs.readFileSync('src/RH.tsx', 'utf8');

rhCode = rhCode.replace(
  "                       <button onClick={() => { setEditingStaff(staff); setIsModalOpen(true); }} className=\"text-[#DDA956] hover:text-[#c4954b] p-2 bg-amber-50 rounded-lg\">\n                          <Edit2 size={16} />\n                       </button>",
  "                       <div className=\"flex gap-2\">\n                         <button onClick={() => { setEditingStaff(staff); setIsModalOpen(true); }} className=\"text-[#DDA956] hover:text-[#c4954b] p-2 bg-amber-50 rounded-lg\">\n                            <Edit2 size={16} />\n                         </button>\n                         <button onClick={() => handleDeleteStaff(staff.id)} className=\"text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-lg\" title=\"Supprimer\">\n                            <Trash2 size={16} />\n                         </button>\n                       </div>"
);

fs.writeFileSync('src/RH.tsx', rhCode);
