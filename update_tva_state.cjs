const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

const searchState = `  const [orderSelections, setOrderSelections] = useState<Record<string, {checked: boolean, qty: string, price?: string}>>({});`;
const replaceState = `  const [orderSelections, setOrderSelections] = useState<Record<string, {checked: boolean, qty: string, price?: string}>>({});
  const [orderTvaRate, setOrderTvaRate] = useState<number>(20);`;

code = code.replace(searchState, replaceState);
fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
