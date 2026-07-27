const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

code = code.replace(
  "  const [menuItems, setMenuItems] = useState<any[]>([]);",
  "  const [menuItems, setMenuItems] = useState<any[]>([]);\n  const [tables, setTables] = useState<any[]>([]);"
);

code = code.replace(
  "    return () => unsubscribe();\n  }, []);",
  "    return () => unsubscribe();\n  }, []);\n\n  useEffect(() => {\n    const unsubTables = onSnapshot(query(collection(db, 'tables')), (snapshot) => {\n      setTables(snapshot.docs.map(doc => ({ fbId: doc.id, ...doc.data() })));\n    });\n    return () => unsubTables();\n  }, []);"
);

const tableGrid = `              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-6">
                {tables.map((table) => (
                  <button
                    key={table.id || table.fbId}
                    onClick={() => {
                      setSelectedTable(table.id);
                      setIsTableModalOpen(false);
                    }}
                    className={\`aspect-square rounded-2xl flex flex-col items-center justify-center font-bold transition-all \${selectedTable === table.id ? 'bg-[#DDA956] text-[#1A1A1A] shadow-md scale-105 border-2 border-[#DDA956]' : 'bg-white text-gray-700 border-2 border-gray-100 hover:bg-gray-50'}\`}
                  >
                    <span className="text-xl mb-1">{table.id}</span>
                    <span className={\`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full \${table.status === 'libre' ? 'bg-green-100 text-green-700' : table.status === 'occupee' ? 'bg-red-100 text-red-700' : table.status === 'reservee' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}\`}>
                      {table.status === 'libre' ? 'Libre' : table.status === 'occupee' ? 'Occupée' : table.status === 'reservee' ? 'Réservée' : table.status}
                    </span>
                  </button>
                ))}
              </div>`;

code = code.replace(
  /              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 mb-6">[\s\S]*?<\/div>/,
  tableGrid
);

fs.writeFileSync('src/POSTactile.tsx', code);
