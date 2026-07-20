const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const stateTarget = `  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);`;
const stateReplace = `  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isPayslipDocOpen, setIsPayslipDocOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);`;

content = content.replace(stateTarget, stateReplace);

const initialListTarget = `  const [payrollList, setPayrollList] = useState([
    { id: 1, period: "Juin 2026", name: "Ahmed Benali", net: "12 500 MAD", status: "Payé" },
    { id: 2, period: "Juin 2026", name: "Karima Idrissi", net: "8 200 MAD", status: "Payé" },
    { id: 3, period: "Juin 2026", name: "Sofia Amrani", net: "5 500 MAD", status: "Payé" }
  ]);`;

const initialListReplace = `  const [payrollList, setPayrollList] = useState([
    { id: 1, period: "Juin 2026", name: "Ahmed Benali", net: "12 500 MAD", status: "Payé", base: 14500, cnss: 268.80, amo: 327.70, igr: 1403.50 },
    { id: 2, period: "Juin 2026", name: "Karima Idrissi", net: "8 200 MAD", status: "Payé", base: 9500, cnss: 268.80, amo: 214.70, igr: 816.50 },
    { id: 3, period: "Juin 2026", name: "Sofia Amrani", net: "5 500 MAD", status: "Payé", base: 6000, cnss: 268.80, amo: 135.60, igr: 95.60 }
  ]);`;

content = content.replace(initialListTarget, initialListReplace);

const setPayrollListTarget = `          setPayrollList([...payrollList, {
            id: Date.now(),
            period: data.period as string,
            name: data.staffName as string,
            net: \`\${data.net.toFixed(2)} MAD\`,
            status: "Payé"
          }]);`;

const setPayrollListReplace = `          setPayrollList([...payrollList, {
            id: Date.now(),
            period: data.period as string,
            name: data.staffName as string,
            net: \`\${data.net.toFixed(2)} MAD\`,
            status: "Payé",
            base: data.base,
            cnss: data.cnss,
            amo: data.amo,
            igr: data.igr
          }]);`;

content = content.replace(setPayrollListTarget, setPayrollListReplace);

const docBtnTarget = `                      <button 
                        onClick={() => showToast(\`Téléchargement de la fiche de paie de \${pay.name}\`)}
                        className="text-gray-400 hover:text-[#DDA956] transition-colors p-2 rounded-lg hover:bg-amber-50"
                      >
                        <FileText size={18} />
                      </button>`;

const docBtnReplace = `                      <button 
                        onClick={() => {
                          setSelectedPayslip(pay);
                          setIsPayslipDocOpen(true);
                        }}
                        className="text-gray-400 hover:text-[#DDA956] transition-colors p-2 rounded-lg hover:bg-amber-50"
                      >
                        <FileText size={18} />
                      </button>`;

content = content.replace(docBtnTarget, docBtnReplace);

const modalHtml = `      {/* Payslip Document Modal */}
      {isPayslipDocOpen && selectedPayslip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto flex flex-col"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl sticky top-0 z-10">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <FileText size={18} className="text-[#DDA956]" /> Fiche de Paie - {selectedPayslip.name}
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={() => showToast("Impression en cours...")} className="px-4 py-1.5 bg-[#DDA956] text-[#1A1A1A] text-sm font-medium rounded-lg hover:bg-[#c4954b] transition-colors flex items-center gap-2">
                  <Printer size={16} /> Imprimer
                </button>
                <button onClick={() => setIsPayslipDocOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-900 bg-white rounded-lg border border-gray-200 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className="p-8 bg-white" id="payslip-print-area">
              <div className="border border-black p-0.5">
                {/* Header */}
                <div className="grid grid-cols-2 mb-2">
                  <div className="bg-green-600 text-white font-bold text-center py-1 text-lg">MAROC COMPTA</div>
                  <div className="text-center font-bold text-green-700 text-lg flex items-center justify-center">BULLETIN DE PAIE</div>
                  <div className="bg-[#b5d333] text-center font-bold text-black py-1 col-span-1">MAROC</div>
                </div>

                {/* Employee Info */}
                <table className="w-full border-collapse border border-black text-xs text-center mb-1">
                  <tbody>
                    <tr>
                      <td className="border border-black py-1 font-bold w-1/3">NOM-PRENOM</td>
                      <td className="border border-black py-1 font-bold w-1/3">QUALIFICATION</td>
                      <td className="border border-black py-1 font-bold">SALAIRE MENSUEL</td>
                      <td className="border border-black py-1 font-bold">MATRICULE</td>
                    </tr>
                    <tr>
                      <td className="border border-black py-1 h-6">{selectedPayslip.name}</td>
                      <td className="border border-black py-1 h-6">Employé</td>
                      <td className="border border-black py-1 bg-yellow-300 font-bold">{selectedPayslip.base?.toFixed(2) || '0.00'}</td>
                      <td className="border border-black py-1">{selectedPayslip.id}</td>
                    </tr>
                  </tbody>
                </table>

                <table className="w-full border-collapse border border-black text-xs text-center mb-4">
                  <tbody>
                    <tr className="font-bold">
                      <td className="border border-black py-1" colSpan={2}>DATE EMBAUCHE</td>
                      <td className="border border-black py-1">N°CIMR</td>
                      <td className="border border-black py-1">N°CNSS</td>
                      <td className="border border-black py-1">NAISSANCE</td>
                      <td className="border border-black py-1">SF</td>
                      <td className="border border-black py-1">DEDUCT</td>
                      <td className="border border-black py-1">SALAIRE PAR HEURE</td>
                      <td className="border border-black py-1" colSpan={3}>PERIODE DE PAIE</td>
                    </tr>
                    <tr>
                      <td className="border border-black py-1 bg-yellow-300 w-8">1</td>
                      <td className="border border-black py-1 bg-yellow-300 w-12">12</td>
                      <td className="border border-black py-1">-</td>
                      <td className="border border-black py-1">123456789</td>
                      <td className="border border-black py-1">01/01/1990</td>
                      <td className="border border-black py-1 bg-yellow-300">M</td>
                      <td className="border border-black py-1 bg-yellow-300">0</td>
                      <td className="border border-black py-1 font-bold">{(selectedPayslip.base / 191).toFixed(2)}</td>
                      <td className="border border-black py-1 bg-yellow-300 w-8">31</td>
                      <td className="border border-black py-1 bg-yellow-300 w-8">1</td>
                      <td className="border border-black py-1 bg-yellow-300 w-12">2026</td>
                    </tr>
                  </tbody>
                </table>

                {/* Main Details */}
                <table className="w-full border-collapse border border-black text-xs mb-0 h-[400px]">
                  <thead>
                    <tr className="font-bold text-center">
                      <td className="border border-black py-1 w-12">C.PAIE</td>
                      <td className="border border-black py-1">LIBELLE</td>
                      <td className="border border-black py-1 w-32">BASE/NOMBRE</td>
                      <td className="border border-black py-1 w-20">TAUX</td>
                      <td className="border border-black py-1 w-28">A PAYER</td>
                      <td className="border border-black py-1 w-28">A RETENIR</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="align-top">
                      <td className="border-l border-r border-black p-1"></td>
                      <td className="border-l border-r border-black p-1 font-medium space-y-1">
                        <div>SALAIRE DE BASE</div>
                        <div>PRIME D'ANCIENETE</div>
                        <div>PRIME</div>
                        <div>SALAIRE BRUT</div>
                        <div>COTISATION CNSS</div>
                        <div>RETRAITE CIMR</div>
                        <div>AMO</div>
                        <div>PRELEVEMENT IGR</div>
                        <div>AVANTAGE EN NATURE</div>
                        <div>AVANCE</div>
                        <div>PRÊT</div>
                      </td>
                      <td className="border-l border-r border-black p-1 text-right space-y-1">
                        <div className="bg-yellow-300 pr-1">191.00</div>
                        <div>{selectedPayslip.base?.toFixed(2)}</div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                        <div>{selectedPayslip.base?.toFixed(2)}</div>
                        <div>{selectedPayslip.base?.toFixed(2)}</div>
                        <div>{selectedPayslip.base?.toFixed(2)}</div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                      </td>
                      <td className="border-l border-r border-black p-1 text-center space-y-1">
                        <div>{(selectedPayslip.base / 191).toFixed(2)}</div>
                        <div>-</div>
                        <div>-</div>
                        <div className="h-4"></div>
                        <div>4.48</div>
                        <div>-</div>
                        <div>2.26</div>
                        <div>10.00</div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                      </td>
                      <td className="border-l border-r border-black p-1 text-right space-y-1 pr-2">
                        <div>{selectedPayslip.base?.toFixed(2)}</div>
                        <div>-</div>
                        <div>-</div>
                        <div>{selectedPayslip.base?.toFixed(2)}</div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                        <div>-</div>
                        <div>-</div>
                        <div>-</div>
                      </td>
                      <td className="border-l border-r border-black p-1 text-right space-y-1 pr-2">
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                        <div>{selectedPayslip.cnss?.toFixed(2)}</div>
                        <div>-</div>
                        <div>{selectedPayslip.amo?.toFixed(2)}</div>
                        <div>{selectedPayslip.igr?.toFixed(2)}</div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                      </td>
                    </tr>
                    {/* Fill remaining space */}
                    <tr>
                      <td className="border-l border-r border-black h-full"></td>
                      <td className="border-l border-r border-black h-full"></td>
                      <td className="border-l border-r border-black h-full"></td>
                      <td className="border-l border-r border-black h-full"></td>
                      <td className="border-l border-r border-black h-full"></td>
                      <td className="border-l border-r border-black h-full"></td>
                    </tr>
                  </tbody>
                </table>

                {/* Footer Totals */}
                <table className="w-full border-collapse border border-black text-xs text-center">
                  <tbody>
                    <tr className="font-bold">
                      <td className="border border-black py-1 w-[15%]">CUMUL<br/>JOUR</td>
                      <td className="border border-black py-1 w-[20%]">CUMUL<br/>BASE CONGRES</td>
                      <td className="border border-black py-1 w-[20%]">CUMUL BASE<br/>IMPOSABLE</td>
                      <td className="border border-black py-1 w-[25%]">CUMUL<br/>RETENUE CIMR</td>
                      <td className="border border-black py-1 w-[20%]">CUMUL<br/>IGR</td>
                      <td className="border-t border-black bg-white" colSpan={2} rowSpan={2}></td>
                    </tr>
                    <tr>
                      <td className="border border-black py-2"></td>
                      <td className="border border-black py-2"></td>
                      <td className="border border-black py-2"></td>
                      <td className="border border-black py-2"></td>
                      <td className="border border-black py-2"></td>
                    </tr>
                    <tr>
                      <td className="border-0 bg-white" colSpan={4} rowSpan={2}></td>
                      <td className="border border-black font-bold py-1 bg-gray-50 text-right pr-4" colSpan={2}>NET A PAYER</td>
                    </tr>
                    <tr>
                      <td className="border border-black font-bold py-1 text-right pr-4 text-sm" colSpan={2}>
                        {Number(selectedPayslip.net.replace(/[^0-9.-]+/g,"")).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      )}`;

content = content.replace("      {/* Add/Edit Modal */}", modalHtml + "\n\n      {/* Add/Edit Modal */}");

fs.writeFileSync('src/App.tsx', content);
console.log("Payslip document modal added");
