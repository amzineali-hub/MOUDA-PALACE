const fs = require('fs');
let code = fs.readFileSync('src/RH.tsx', 'utf8');

const brokenCode = `          <button 
            onClick={() => {
              if (window !== window.top) {
                showToast("Pour imprimer, ouvrez l'app dans un nouvel onglet via la flèche en haut à droite.", "info");
              } else {
                window.print();
              }
            }} className="px-4 py-1.5 bg-[#DDA956] text-[#1A1A1A] text-sm font-medium rounded-lg hover:bg-[#c4954b] transition-colors flex items-center gap-2">
                  <Printer size={16} /> Imprimer`;

const fixedCode = `          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-black transition-colors"
          >
            <Plus size={20} />
            Ajouter un employé
          </button>
        </div>
      </header>

      {/* Payslip Document Modal */}
      {isPayslipDocOpen && selectedPayslip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-100 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
              <h3 className="text-xl font-serif font-medium text-gray-900">
                Bulletin de Paie - {selectedPayslip.name}
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    if (window !== window.top) {
                      showToast("Pour imprimer, ouvrez l'app dans un nouvel onglet via la flèche en haut à droite.", "info");
                    } else {
                      window.print();
                    }
                  }} 
                  className="px-4 py-1.5 bg-[#DDA956] text-[#1A1A1A] text-sm font-medium rounded-lg hover:bg-[#c4954b] transition-colors flex items-center gap-2"
                >
                  <Printer size={16} /> Imprimer`;

code = code.replace(brokenCode, fixedCode);
fs.writeFileSync('src/RH.tsx', code);
console.log("Fixed RH.tsx");
