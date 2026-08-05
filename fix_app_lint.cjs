const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `const newItem = {
        id: Date.now(),
        name: newDishForm.name,
        category: newDishForm.category,
        price: \`\${newDishForm.price} MAD\`,
        desc: newDishForm.desc,
        active: true,
        translated: false
      };
      setMenuItems(items => [...items, newItem]);`;

const replacement = `const newItem: any = {
        id: Date.now(),
        name: newDishForm.name,
        category: newDishForm.category,
        price: \`\${newDishForm.price} MAD\`,
        desc: newDishForm.desc,
        active: true,
        translated: false,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        translations: {}
      };
      setMenuItems(items => [...items, newItem]);`;

content = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', content);
