const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetSave = `    const newStaff = {
      id: editingStaff?.id || \`EMP-\${Date.now().toString().slice(-4)}\`,
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      department: formData.get('department') as string,
      phone: formData.get('phone') as string,
      status: formData.get('status') as string,
      shift: formData.get('shift') as string || '-',
    };`;

const replacementSave = `    const newStaff = {
      id: editingStaff?.id || \`EMP-\${Date.now().toString().slice(-4)}\`,
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      department: formData.get('department') as string,
      phone: formData.get('phone') as string,
      status: formData.get('status') as string,
      shift: formData.get('shift') as string || '-',
      baseSalary: Number(formData.get('baseSalary')) || 4000,
    };`;

content = content.replace(targetSave, replacementSave);
fs.writeFileSync('src/App.tsx', content);
