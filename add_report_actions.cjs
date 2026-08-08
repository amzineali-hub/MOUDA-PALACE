const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

const reportRowSearch = `<button onClick={() => handleDownloadReport(report.type, report.format)} className="p-1.5 text-gray-400 hover:text-[#F4C75B] transition-colors rounded-lg hover:bg-gray-100" title="Télécharger">
                            <Download size={16} />
                          </button>`;

const reportRowReplace = `<button onClick={() => handleDownloadReport(report.type, report.format)} className="p-1.5 text-gray-400 hover:text-[#F4C75B] transition-colors rounded-lg hover:bg-gray-100" title="Télécharger">
                            <Download size={16} />
                          </button>
                          <button onClick={async () => {
                            if (window.confirm("Voulez-vous vraiment supprimer ce rapport ?")) {
                              if (report.id.startsWith("RPT-20")) {
                                setFinancialReports(prev => prev.filter(r => r.id !== report.id));
                                showToast("Rapport supprimé avec succès");
                              } else {
                                try {
                                  await deleteDoc(doc(db, 'financialReports', report.id));
                                  showToast("Rapport supprimé avec succès");
                                } catch(e) {
                                  showToast("Erreur lors de la suppression", "error");
                                }
                              }
                            }
                          }} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100" title="Supprimer">
                            <Trash2 size={16} />
                          </button>`;

code = code.replace(reportRowSearch, reportRowReplace);

fs.writeFileSync('src/Accounting.tsx', code);
