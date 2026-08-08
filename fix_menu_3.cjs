const fs = require('fs');
let code = fs.readFileSync('src/MenuGenerator.tsx', 'utf8');

if (!code.includes('const [dishToDelete')) {
  code = code.replace("  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);", "  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);\n  const [dishToDelete, setDishToDelete] = useState<string | null>(null);");
}

fs.writeFileSync('src/MenuGenerator.tsx', code);
