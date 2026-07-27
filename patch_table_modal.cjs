const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

const tableModal = `

      {/* Table Selection Modal */}
      {isTableModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1A1A1A]">Sélectionner une table</h2>
              <button 
                onClick={() => setIsTableModalOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 mb-6">
                {Array.from({ length: 30 }, (_, i) => i + 1).map((tableNum) => (
                  <button
                    key={tableNum}
                    onClick={() => {
                      setSelectedTable(\`Table \${tableNum}\`);
                      setIsTableModalOpen(false);
                    }}
                    className={\`aspect-square rounded-2xl flex items-center justify-center text-xl font-bold transition-all \${selectedTable === \\\`Table \${tableNum}\\\` ? 'bg-[#DDA956] text-[#1A1A1A] shadow-md scale-105' : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-[#DDA956]/50'}\`}
                  >
                    {tableNum}
                  </button>
                ))}
              </div>
              
              <div className="border-t border-gray-100 pt-6">
                <button
                  onClick={() => {
                    setSelectedTable('À emporter');
                    setIsTableModalOpen(false);
                  }}
                  className={\`w-full py-4 rounded-xl font-bold text-lg transition-all \${selectedTable === 'À emporter' ? 'bg-[#DDA956] text-[#1A1A1A] shadow-md' : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'}\`}
                >
                  À emporter (Takeaway)
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
`;

code = code.replace(
  '    </div>\n  );\n}',
  tableModal + '    </div>\n  );\n}'
);

fs.writeFileSync('src/POSTactile.tsx', code);
