const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

code = code.replace(
  '<div className="p-6 bg-white flex justify-between items-center border-b border-gray-100">',
  '<div className="p-6 bg-white flex justify-between items-center border-b border-gray-100">'
);

code = code.replace(
  'const [cart, setCart] = useState<any[]>([]);',
  'const [cart, setCart] = useState<any[]>([]);\n\n  const handleClearCart = () => {\n    if (cart.length > 0) {\n      if (window.confirm("Êtes-vous sûr de vouloir annuler ce ticket ?")) {\n        setCart([]);\n        showToast("Ticket annulé", "info");\n      }\n    }\n  };'
);

code = code.replace(
  '<h2 className="font-bold text-[#1A1A1A] text-xl">Ticket</h2>\n            </div>\n            <button',
  '<h2 className="font-bold text-[#1A1A1A] text-xl">Ticket</h2>\n            </div>\n            <div className="flex items-center gap-2">\n              {cart.length > 0 && (\n                <button \n                  onClick={handleClearCart}\n                  className="flex items-center justify-center w-10 h-10 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors title=\\"Annuler le ticket\\""\n                >\n                  <Trash2 size={18} />\n                </button>\n              )}\n              <button'
);

// We should also replace `<button \n              onClick={() => setIsTableModalOpen(true)}` to be inside the flex container correctly.
code = code.replace(
  '              <button \n              onClick={() => setIsTableModalOpen(true)}\n              className="flex items-center gap-2 text-sm bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl font-bold text-gray-700 hover:bg-gray-100 hover:shadow-inner transition-all"\n            >\n              <User size={16} />\n              {selectedTable ? selectedTable : "Table"}\n            </button>\n          </div>',
  '              <button \n                onClick={() => setIsTableModalOpen(true)}\n                className="flex items-center gap-2 text-sm bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl font-bold text-gray-700 hover:bg-gray-100 hover:shadow-inner transition-all"\n              >\n                <User size={16} />\n                {selectedTable ? selectedTable : "Table"}\n              </button>\n            </div>\n          </div>'
);

fs.writeFileSync('src/POSTactile.tsx', code);
