const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

const search = `  const filteredCommandes = useMemo(() => {
    return commandes.filter((cmd) => {
      const matchesSearch = (cmd.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (cmd.fournisseur || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSupplier = filterSupplier ? cmd.fournisseur === filterSupplier : true;
      return matchesSearch && matchesSupplier;
    });
  }, [commandes, searchQuery, filterSupplier]);`;

const replace = `  const filteredCommandes = useMemo(() => {
    return commandes.filter((cmd) => {
      const matchesSearch = (cmd.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (cmd.fournisseur || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSupplier = filterSupplier ? cmd.fournisseur === filterSupplier : true;
      return matchesSearch && matchesSupplier;
    });
  }, [commandes, searchQuery, filterSupplier]);

  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const sortedCommandes = useMemo(() => {
    let sortableItems = [...filteredCommandes];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'montant' || sortConfig.key === 'montantHT' || sortConfig.key === 'tva') {
          const parseNumeric = (val: any) => {
             if (typeof val === 'number') return val;
             if (typeof val === 'string') return parseFloat(val.replace(/[^0-9.-]+/g, "")) || 0;
             return 0;
          };
          aValue = parseNumeric(aValue);
          bValue = parseNumeric(bValue);
        } else if (sortConfig.key === 'date') {
          const parseDate = (d: string) => {
            if (!d) return 0;
            const parts = d.split('/');
            if (parts.length === 3) return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
            return 0;
          };
          aValue = parseDate(aValue);
          bValue = parseDate(bValue);
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredCommandes, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };`;

code = code.replace(search, replace);
fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
