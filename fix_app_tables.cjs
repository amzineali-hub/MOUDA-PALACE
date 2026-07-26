const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const \[tables, setTables\] = useState\(\(\) => \{[\s\S]*?\}\);/m;
content = content.replace(regex, `const [tables, setTables] = useState<any[]>(() => {
    const saved = localStorage.getItem('mouda_tables');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'T1', capacity: 2, status: 'occupied', x: 50, y: 80, type: 'round' },
      { id: 'T2', capacity: 2, status: 'available', x: 50, y: 220, type: 'round' },
      { id: 'T3', capacity: 4, status: 'reserved', x: 50, y: 360, type: 'square' },
      { id: 'T4', capacity: 4, status: 'available', x: 220, y: 80, type: 'square' },
      { id: 'T5', capacity: 6, status: 'available', x: 220, y: 220, type: 'rectangle' },
      { id: 'T6', capacity: 2, status: 'available', x: 220, y: 360, type: 'round' },
      { id: 'T7', capacity: 8, status: 'available', x: 420, y: 80, type: 'rectangle' },
      { id: 'T8', capacity: 4, status: 'available', x: 420, y: 220, type: 'square' },
      { id: 'T9', capacity: 4, status: 'occupied', x: 420, y: 360, type: 'square' },
      { id: 'T10', capacity: 2, status: 'available', x: 620, y: 80, type: 'round' },
      { id: 'T11', capacity: 6, status: 'reserved', x: 620, y: 220, type: 'rectangle' },
      { id: 'T12', capacity: 2, status: 'available', x: 620, y: 360, type: 'round' },
      { id: 'T13', capacity: 8, status: 'available', x: 820, y: 120, type: 'rectangle' },
      { id: 'T14', capacity: 4, status: 'available', x: 820, y: 280, type: 'square' },
    ];
  });`);

fs.writeFileSync('src/App.tsx', content);
console.log("Done");
