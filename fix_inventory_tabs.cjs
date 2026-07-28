const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetTabs = `          {['stocks', 'requirements', 'recipes', 'production', 'waste', 'transactions', 'suppliers'].map(tab => (`;
const replaceTabs = `          {['stocks', 'requirements', 'recipes', 'production', 'waste', 'transactions', 'suppliers', 'price_history'].map(tab => (`;

const targetLabels = `              {tab === 'transactions' && 'Entrées & Sorties'}
              {tab === 'suppliers' && 'Fournisseurs'}
            </button>`;
const replaceLabels = `              {tab === 'transactions' && 'Entrées & Sorties'}
              {tab === 'suppliers' && 'Fournisseurs'}
              {tab === 'price_history' && 'Historique des Prix'}
            </button>`;

if (code.includes(targetTabs) && code.includes(targetLabels)) {
  code = code.replace(targetTabs, replaceTabs);
  code = code.replace(targetLabels, replaceLabels);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Updated inventory tabs");
} else {
  console.log("Could not find tabs");
}
