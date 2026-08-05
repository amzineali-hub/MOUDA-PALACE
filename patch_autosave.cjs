const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = `const AutoSaveForm = ({ formId, children, ...props }: any) => {
  const formRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    const saved = localStorage.getItem(\`autosave_\${formId}\`);
    if (saved && formRef.current) {
      try {
        const data = JSON.parse(saved);
        Object.keys(data).forEach(key => {
          const el = formRef.current?.elements.namedItem(key) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
          if (el) el.value = data[key];
        });
      } catch(e: any) {
        console.error('Error loading autosave:', e);
      }
    }
  }, [formId]);

  const handleChange = () => {
    if (formRef.current) {
      const formData = new FormData(formRef.current);
      const data = Object.fromEntries(formData.entries());
      localStorage.setItem(\`autosave_\${formId}\`, JSON.stringify(data));
    }
  };`;

const replacementStr = `const AutoSaveForm = ({ formId, children, ...props }: any) => {
  const formRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    const saved = localStorage.getItem(\`autosave_\${formId}\`);
    if (saved && formRef.current) {
      try {
        const data = JSON.parse(saved);
        Object.keys(data).forEach(key => {
          const el = formRef.current?.elements.namedItem(key) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
          if (el) el.value = data[key];
        });
      } catch(e: any) {
        console.error('Error loading autosave:', e);
      }
    }
  }, [formId]);

  const handleChange = () => {
    if (formRef.current) {
      const requiredElements = formRef.current.querySelectorAll('[required]');
      let allValid = true;
      requiredElements.forEach((el) => {
        if ((el as HTMLInputElement).value.trim() === '') {
          allValid = false;
        }
      });
      
      if (allValid) {
        const formData = new FormData(formRef.current);
        const data = Object.fromEntries(formData.entries());
        localStorage.setItem(\`autosave_\${formId}\`, JSON.stringify(data));
      }
    }
  };`;

if (content.includes(targetStr)) {
  const newContent = content.replace(targetStr, replacementStr);
  fs.writeFileSync('src/App.tsx', newContent);
  console.log('Successfully updated AutoSaveForm');
} else {
  console.log('Target string not found');
}
