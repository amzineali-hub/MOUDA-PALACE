const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add partnerToDelete state
if (!code.includes('const [partnerToDelete')) {
  code = code.replace("  const [partners, setPartners] = useState(() => {", "  const [partnerToDelete, setPartnerToDelete] = useState<string | null>(null);\n  const [partners, setPartners] = useState(() => {");
}

// Add setDishToDelete
if (!code.includes('const [dishToDelete')) {
  code = code.replace("  const [menuConfig, setMenuConfig] = useState<any>({", "  const [dishToDelete, setDishToDelete] = useState<string | null>(null);\n  const [menuConfig, setMenuConfig] = useState<any>({");
}

// Ensure ConfirmModal is imported in MenuGenerator if needed
// Actually, MenuGenerator is in src/MenuGenerator.tsx

fs.writeFileSync('src/App.tsx', code);
