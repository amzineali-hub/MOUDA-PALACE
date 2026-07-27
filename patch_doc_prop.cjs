const fs = require('fs');
let code = fs.readFileSync('src/Documentation.tsx', 'utf8');

code = code.replace(
  'export default function Documentation() {',
  'export default function Documentation({ initialGuideId }: { initialGuideId?: number }) {'
);

code = code.replace(
  "  const [activeGuide, setActiveGuide] = useState<any>(null);",
  "  const [activeGuide, setActiveGuide] = useState<any>(initialGuideId ? guides.find(g => g.id === initialGuideId) || null : null);\n\n  useEffect(() => {\n    if (initialGuideId) {\n      const guide = guides.find(g => g.id === initialGuideId);\n      if (guide) setActiveGuide(guide);\n    }\n  }, [initialGuideId]);"
);

fs.writeFileSync('src/Documentation.tsx', code);
