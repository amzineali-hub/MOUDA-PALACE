const fs = require('fs');
let code = fs.readFileSync('src/MenuGenerator.tsx', 'utf8');

if (!code.includes('const [dishToDelete')) {
  code = code.replace("  const [showConfig, setShowConfig] = useState(false);", "  const [showConfig, setShowConfig] = useState(false);\n  const [dishToDelete, setDishToDelete] = useState<string | null>(null);");
}

if (!code.includes("import ConfirmModal")) {
  code = code.replace("import { useToast } from './context/ToastContext';", "import { useToast } from './context/ToastContext';\nimport ConfirmModal from './components/ConfirmModal';");
}

// Fix the handleDelete logic in edit modal
code = code.replace("setDishToDelete(editingItem.id); setEditingItem(null); if (false) {", "setDishToDelete(editingItem.id); setEditingItem(null); // if (false) {");

fs.writeFileSync('src/MenuGenerator.tsx', code);
